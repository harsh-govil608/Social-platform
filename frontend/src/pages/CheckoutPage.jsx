import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CreditCard, Check, AlertCircle, Loader } from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [planDetails, setPlanDetails] = useState(null);

  const tier = searchParams.get('tier') || 'basic';
  const interval = searchParams.get('interval') || 'monthly';

  useEffect(() => {
    fetchPlanDetails();
  }, [tier, interval]);

  const fetchPlanDetails = () => {
    const plans = {
      basic: {
        name: 'Basic',
        monthly: 9.99,
        yearly: 99.99,
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
        monthly: 29.99,
        yearly: 299.99,
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
    };

    const plan = plans[tier];
    if (plan) {
      setPlanDetails({
        ...plan,
        price: interval === 'monthly' ? plan.monthly : plan.yearly,
        interval
      });
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/subscription/checkout', {
        tier,
        interval
      });

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate checkout');
      setLoading(false);
    }
  };

  if (!planDetails) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const isYearly = interval === 'yearly';
  const monthlyCost = isYearly ? (planDetails.price / 12).toFixed(2) : planDetails.price;
  const savingsPercentage = isYearly ? Math.round(((planDetails.price / (planDetails.price / 10)) - 1) * 100) : 0;

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Complete Your Subscription</h1>
          <p className="text-base-content/70">
            You're one step away from unlocking premium features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Plan Summary */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">
                {planDetails.name} Plan
                {isYearly && <div className="badge badge-success">Save {savingsPercentage}%</div>}
              </h2>

              <div className="mb-6">
                <div className="text-4xl font-bold mb-2">
                  ${planDetails.price}
                  <span className="text-lg font-normal text-base-content/60">
                    /{interval}
                  </span>
                </div>
                {isYearly && (
                  <div className="text-sm text-base-content/70">
                    ${monthlyCost}/month billed yearly
                  </div>
                )}
              </div>

              <div className="divider">What's Included</div>

              <ul className="space-y-3">
                {planDetails.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="alert alert-info mt-6">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="text-sm font-semibold">7-Day Free Trial</p>
                  <p className="text-xs">You won't be charged until the trial ends</p>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4">Payment Details</h3>

              <div className="alert alert-warning mb-4">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">
                  You'll be redirected to Stripe for secure payment processing
                </span>
              </div>

              {/* Order Summary */}
              <div className="bg-base-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-base-content/70">
                      {planDetails.name} ({interval})
                    </span>
                    <span className="font-semibold">${planDetails.price}</span>
                  </div>
                  {isYearly && (
                    <div className="flex justify-between text-success text-sm">
                      <span>Annual savings</span>
                      <span>-${(planDetails.price - (monthlyCost * 12)).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="divider my-2"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Today</span>
                    <span>$0.00</span>
                  </div>
                  <p className="text-xs text-base-content/60 mt-2">
                    Free trial for 7 days, then ${planDetails.price} every {interval === 'monthly' ? 'month' : 'year'}
                  </p>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="btn btn-primary btn-block btn-lg"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Continue to Payment
                  </>
                )}
              </button>

              <div className="text-center mt-4">
                <button
                  onClick={() => navigate('/pricing')}
                  className="btn btn-ghost btn-sm"
                >
                  Change Plan
                </button>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 mt-6 text-sm text-base-content/60">
                <CreditCard className="w-4 h-4" />
                <span>Secured by Stripe</span>
              </div>

              {/* Terms */}
              <p className="text-xs text-center text-base-content/60 mt-4">
                By confirming your subscription, you agree to our{' '}
                <a href="/terms" className="link">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="link">Privacy Policy</a>.
                You can cancel anytime.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title mb-4">Frequently Asked Questions</h3>
            <div className="space-y-3">
              <div className="collapse collapse-arrow bg-base-200">
                <input type="radio" name="checkout-faq" defaultChecked />
                <div className="collapse-title font-medium">
                  When will I be charged?
                </div>
                <div className="collapse-content">
                  <p className="text-sm text-base-content/70">
                    You won't be charged during your 7-day free trial. After the trial, you'll be charged ${planDetails.price} {interval}.
                  </p>
                </div>
              </div>
              <div className="collapse collapse-arrow bg-base-200">
                <input type="radio" name="checkout-faq" />
                <div className="collapse-title font-medium">
                  Can I cancel anytime?
                </div>
                <div className="collapse-content">
                  <p className="text-sm text-base-content/70">
                    Yes! You can cancel your subscription at any time from your subscription dashboard. You'll retain access until the end of your billing period.
                  </p>
                </div>
              </div>
              <div className="collapse collapse-arrow bg-base-200">
                <input type="radio" name="checkout-faq" />
                <div className="collapse-title font-medium">
                  Is my payment information secure?
                </div>
                <div className="collapse-content">
                  <p className="text-sm text-base-content/70">
                    Absolutely! We use Stripe for payment processing, which is PCI-DSS compliant and uses bank-level security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
