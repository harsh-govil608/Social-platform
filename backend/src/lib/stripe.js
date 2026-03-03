import Stripe from 'stripe';
import { log } from './logger.js';

if (!process.env.STRIPE_SECRET_KEY) {
  log.warn('STRIPE_SECRET_KEY not found in environment variables. Payment features will be disabled.');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Price IDs (you'll need to create these in Stripe Dashboard)
export const STRIPE_PRICES = {
  basic_monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || 'price_basic_monthly',
  basic_yearly: process.env.STRIPE_BASIC_YEARLY_PRICE_ID || 'price_basic_yearly',
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',

  // Organization/B2B pricing
  org_starter: process.env.STRIPE_ORG_STARTER_PRICE_ID || 'price_org_starter',
  org_growth: process.env.STRIPE_ORG_GROWTH_PRICE_ID || 'price_org_growth',
  org_enterprise: process.env.STRIPE_ORG_ENTERPRISE_PRICE_ID || 'price_org_enterprise'
};

// Pricing configuration
export const PRICING_CONFIG = {
  individual: {
    free: {
      name: 'Free',
      price: 0,
      features: [
        '5 AI Tutor sessions/month',
        '10 DSA problems/month',
        '5 Conversation practices/month',
        '10 Coding challenges/month',
        '60 video call minutes/month',
        'Basic social features',
        'Community access'
      ]
    },
    basic: {
      name: 'Basic',
      price: 9.99,
      yearlyPrice: 99.99,
      features: [
        '50 AI Tutor sessions/month',
        '100 DSA problems/month',
        '50 Conversation practices/month',
        '100 Coding challenges/month',
        '500 video call minutes/month',
        'All social features',
        'Priority support',
        'No ads',
        'Custom profile themes'
      ]
    },
    pro: {
      name: 'Pro',
      price: 29.99,
      yearlyPrice: 299.99,
      features: [
        '200 AI Tutor sessions/month',
        '500 DSA problems/month',
        '200 Conversation practices/month',
        '500 Coding challenges/month',
        '2000 video call minutes/month',
        'All Basic features',
        'Advanced analytics',
        'Custom learning paths',
        'Export progress reports',
        'API access',
        'Early access to new features'
      ]
    }
  },
  organization: {
    starter: {
      name: 'Starter',
      price: 99,
      seats: 50,
      features: [
        'Up to 50 users',
        'All Pro features per user',
        'Basic white-labeling',
        'Team analytics',
        'Bulk user management',
        'Email support'
      ]
    },
    growth: {
      name: 'Growth',
      price: 299,
      seats: 200,
      features: [
        'Up to 200 users',
        'All Starter features',
        'Full white-labeling',
        'Custom domain',
        'SSO integration',
        'Advanced analytics',
        'Custom curriculum',
        'Priority support'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      price: 'Custom',
      seats: 'Unlimited',
      features: [
        'Unlimited users',
        'All Growth features',
        'Dedicated account manager',
        'Custom integrations',
        'On-premise deployment option',
        'SLA guarantee',
        'Custom training',
        '24/7 phone support'
      ]
    }
  }
};

// Helper functions
export const createCustomer = async (email, name, metadata = {}) => {
  if (!stripe) throw new Error('Stripe is not configured');

  return await stripe.customers.create({
    email,
    name,
    metadata
  });
};

export const createCheckoutSession = async ({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  metadata = {},
  trialDays = 0
}) => {
  if (!stripe) throw new Error('Stripe is not configured');

  const sessionParams = {
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1
    }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    allow_promotion_codes: true,
    billing_address_collection: 'required'
  };

  if (trialDays > 0) {
    sessionParams.subscription_data = {
      trial_period_days: trialDays
    };
  }

  return await stripe.checkout.sessions.create(sessionParams);
};

export const createSubscription = async ({
  customerId,
  priceId,
  trialDays = 0,
  metadata = {}
}) => {
  if (!stripe) throw new Error('Stripe is not configured');

  const subscriptionData = {
    customer: customerId,
    items: [{ price: priceId }],
    metadata,
    expand: ['latest_invoice.payment_intent']
  };

  if (trialDays > 0) {
    subscriptionData.trial_period_days = trialDays;
  }

  return await stripe.subscriptions.create(subscriptionData);
};

export const cancelSubscription = async (subscriptionId, atPeriodEnd = true) => {
  if (!stripe) throw new Error('Stripe is not configured');

  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: atPeriodEnd
  });
};

export const updateSubscription = async (subscriptionId, priceId) => {
  if (!stripe) throw new Error('Stripe is not configured');

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: priceId
    }],
    proration_behavior: 'always_invoice'
  });
};

export const getInvoices = async (customerId, limit = 10) => {
  if (!stripe) throw new Error('Stripe is not configured');

  return await stripe.invoices.list({
    customer: customerId,
    limit
  });
};

export const createPortalSession = async (customerId, returnUrl) => {
  if (!stripe) throw new Error('Stripe is not configured');

  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  });
};

export const constructWebhookEvent = (payload, signature) => {
  if (!stripe) throw new Error('Stripe is not configured');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
};

export default stripe;
