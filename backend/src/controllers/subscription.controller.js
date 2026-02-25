import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { log } from '../lib/logger.js';
import {
  createCustomer,
  createCheckoutSession,
  cancelSubscription,
  updateSubscription,
  getInvoices,
  createPortalSession,
  constructWebhookEvent,
  STRIPE_PRICES,
  PRICING_CONFIG
} from '../lib/stripe.js';

// Get current subscription
export const getCurrentSubscription = async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user._id });

    if (!subscription) {
      // Create free subscription if doesn't exist
      const freeLimits = Subscription.getTierLimits('free');
      subscription = await Subscription.create({
        user: req.user._id,
        tier: 'free',
        limits: freeLimits
      });
    } else {
      subscription.resetUsageIfNeeded();
      await subscription.save();
    }

    res.json({
      subscription,
      availablePlans: PRICING_CONFIG.individual
    });
  } catch (error) {
    log.error('Error getting subscription:', error);
    res.status(500).json({ message: 'Failed to get subscription', error: error.message });
  }
};

// Create checkout session for subscription
export const createSubscriptionCheckout = async (req, res) => {
  try {
    const { tier, interval = 'monthly' } = req.body;

    if (!['basic', 'pro'].includes(tier)) {
      return res.status(400).json({ message: 'Invalid subscription tier' });
    }

    const user = await User.findById(req.user._id);
    let subscription = await Subscription.findOne({ user: req.user._id });

    // Create or get Stripe customer
    let stripeCustomerId = subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await createCustomer(user.email, user.fullName, {
        userId: user._id.toString()
      });
      stripeCustomerId = customer.id;

      if (subscription) {
        subscription.stripeCustomerId = stripeCustomerId;
        await subscription.save();
      }
    }

    // Get price ID based on tier and interval
    const priceId = STRIPE_PRICES[`${tier}_${interval}`];

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: stripeCustomerId,
      priceId,
      successUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription/canceled`,
      metadata: {
        userId: user._id.toString(),
        tier,
        interval
      },
      trialDays: subscription?.tier === 'free' ? 7 : 0 // 7-day trial for new subscribers
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    log.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Failed to create checkout session', error: error.message });
  }
};

// Cancel subscription
export const cancelUserSubscription = async (req, res) => {
  try {
    const { immediately = false } = req.body;
    const subscription = await Subscription.findOne({ user: req.user._id });

    if (!subscription || subscription.tier === 'free') {
      return res.status(400).json({ message: 'No active subscription to cancel' });
    }

    if (!subscription.stripeSubscriptionId) {
      return res.status(400).json({ message: 'No Stripe subscription found' });
    }

    // Cancel in Stripe
    await cancelSubscription(subscription.stripeSubscriptionId, !immediately);

    subscription.cancelAtPeriodEnd = !immediately;
    if (immediately) {
      subscription.status = 'canceled';
      subscription.tier = 'free';
      const freeLimits = Subscription.getTierLimits('free');
      subscription.limits = freeLimits;
    }

    await subscription.save();

    res.json({
      message: immediately
        ? 'Subscription canceled immediately'
        : 'Subscription will be canceled at the end of the billing period',
      subscription
    });
  } catch (error) {
    log.error('Error canceling subscription:', error);
    res.status(500).json({ message: 'Failed to cancel subscription', error: error.message });
  }
};

// Update subscription (upgrade/downgrade)
export const updateUserSubscription = async (req, res) => {
  try {
    const { tier, interval = 'monthly' } = req.body;

    if (!['basic', 'pro'].includes(tier)) {
      return res.status(400).json({ message: 'Invalid subscription tier' });
    }

    const subscription = await Subscription.findOne({ user: req.user._id });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    // Get new price ID
    const priceId = STRIPE_PRICES[`${tier}_${interval}`];

    // Update in Stripe
    await updateSubscription(subscription.stripeSubscriptionId, priceId);

    subscription.tier = tier;
    subscription.stripePriceId = priceId;
    const newLimits = Subscription.getTierLimits(tier);
    subscription.limits = newLimits;

    await subscription.save();

    res.json({
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    log.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Failed to update subscription', error: error.message });
  }
};

// Get billing portal
export const getBillingPortal = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });

    if (!subscription || !subscription.stripeCustomerId) {
      return res.status(400).json({ message: 'No billing information found' });
    }

    const session = await createPortalSession(
      subscription.stripeCustomerId,
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings/billing`
    );

    res.json({ url: session.url });
  } catch (error) {
    log.error('Error creating billing portal:', error);
    res.status(500).json({ message: 'Failed to create billing portal', error: error.message });
  }
};

// Get invoices
export const getUserInvoices = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });

    if (!subscription || !subscription.stripeCustomerId) {
      return res.json({ invoices: [] });
    }

    const invoices = await getInvoices(subscription.stripeCustomerId);

    res.json({
      invoices: invoices.data.map(inv => ({
        id: inv.id,
        amount: inv.amount_paid / 100,
        currency: inv.currency.toUpperCase(),
        status: inv.status,
        date: new Date(inv.created * 1000),
        invoiceUrl: inv.invoice_pdf
      }))
    });
  } catch (error) {
    log.error('Error getting invoices:', error);
    res.status(500).json({ message: 'Failed to get invoices', error: error.message });
  }
};

// Check if user can use feature (middleware)
export const checkFeatureAccess = (feature) => {
  return async (req, res, next) => {
    try {
      let subscription = await Subscription.findOne({ user: req.user._id });

      if (!subscription) {
        // Create free subscription
        const freeLimits = Subscription.getTierLimits('free');
        subscription = await Subscription.create({
          user: req.user._id,
          tier: 'free',
          limits: freeLimits
        });
      }

      if (!subscription.canUseFeature(feature)) {
        return res.status(403).json({
          message: 'Feature limit reached',
          feature,
          usage: subscription.usage[feature],
          limit: subscription.limits[feature],
          upgrade: true
        });
      }

      // Increment usage
      subscription.incrementUsage(feature);
      await subscription.save();

      req.subscription = subscription;
      next();
    } catch (error) {
      log.error('Error checking feature access:', error);
      res.status(500).json({ message: 'Failed to check feature access', error: error.message });
    }
  };
};

// Webhook handler for Stripe events
export const handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  try {
    const event = constructWebhookEvent(req.body, signature);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const tier = session.metadata.tier;

        let subscription = await Subscription.findOne({ user: userId });
        if (!subscription) {
          subscription = new Subscription({ user: userId });
        }

        subscription.tier = tier;
        subscription.status = 'active';
        subscription.stripeSubscriptionId = session.subscription;
        subscription.stripeCustomerId = session.customer;
        const newLimits = Subscription.getTierLimits(tier);
        subscription.limits = newLimits;

        await subscription.save();
        break;
      }

      case 'customer.subscription.updated': {
        const stripeSubscription = event.data.object;
        const subscription = await Subscription.findOne({
          stripeSubscriptionId: stripeSubscription.id
        });

        if (subscription) {
          subscription.status = stripeSubscription.status;
          subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
          subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
          subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;

          await subscription.save();
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSubscription = event.data.object;
        const subscription = await Subscription.findOne({
          stripeSubscriptionId: stripeSubscription.id
        });

        if (subscription) {
          subscription.tier = 'free';
          subscription.status = 'canceled';
          const freeLimits = Subscription.getTierLimits('free');
          subscription.limits = freeLimits;

          await subscription.save();
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscription = await Subscription.findOne({
          stripeCustomerId: invoice.customer
        });

        if (subscription) {
          subscription.billingHistory.push({
            date: new Date(invoice.created * 1000),
            amount: invoice.amount_paid / 100,
            currency: invoice.currency.toUpperCase(),
            status: 'paid',
            invoiceId: invoice.id,
            invoiceUrl: invoice.invoice_pdf
          });

          await subscription.save();
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscription = await Subscription.findOne({
          stripeCustomerId: invoice.customer
        });

        if (subscription) {
          subscription.status = 'past_due';
          await subscription.save();
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    log.error('Webhook error:', error);
    res.status(400).json({ message: 'Webhook error', error: error.message });
  }
};
