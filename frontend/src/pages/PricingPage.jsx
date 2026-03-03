import { useState } from 'react';
import { Check, Zap, Crown, Rocket, Building2, TrendingUp, Shield } from 'lucide-react';
import { useNavigate } from 'react-router';
import useAuthUser from '../hooks/useAuthUser';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const navigate = useNavigate();
  const { authUser } = useAuthUser();

  const plans = [
    {
      name: 'Free',
      icon: Zap,
      price: billingCycle === 'monthly' ? 0 : 0,
      description: 'Perfect for getting started',
      features: [
        '5 AI Tutor sessions/month',
        '10 DSA problems/month',
        '5 Conversation practices/month',
        '10 Coding challenges/month',
        '60 video call minutes/month',
        'Basic social features',
        'Community access'
      ],
      tier: 'free',
      highlight: false
    },
    {
      name: 'Basic',
      icon: Crown,
      price: billingCycle === 'monthly' ? 9.99 : 99.99,
      description: 'For serious learners',
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
      ],
      tier: 'basic',
      highlight: true,
      badge: 'Most Popular'
    },
    {
      name: 'Pro',
      icon: Rocket,
      price: billingCycle === 'monthly' ? 29.99 : 299.99,
      description: 'For professionals',
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
      ],
      tier: 'pro',
      highlight: false
    }
  ];

  const orgPlans = [
    {
      name: 'Starter',
      icon: Building2,
      price: '$99',
      priceSuffix: '/month',
      description: 'Perfect for small teams and bootcamps',
      seats: 'Up to 50 seats',
      features: [
        'Team analytics dashboard',
        'Bulk user management',
        'Basic white-label branding',
        'Admin controls & roles',
        'Shared learning paths',
        '14-day free trial'
      ],
      tier: 'starter',
      cta: 'Contact Sales',
      highlight: false
    },
    {
      name: 'Growth',
      icon: TrendingUp,
      price: '$299',
      priceSuffix: '/month',
      description: 'For growing organizations',
      seats: 'Up to 200 seats',
      features: [
        'Everything in Starter',
        'Custom domain (white-label)',
        'Advanced analytics & reports',
        'Custom curriculum builder',
        'Priority support',
        'API access'
      ],
      tier: 'growth',
      cta: 'Contact Sales',
      highlight: true,
      badge: 'Popular'
    },
    {
      name: 'Enterprise',
      icon: Shield,
      price: 'Custom',
      priceSuffix: '',
      description: 'For large institutions & enterprises',
      seats: 'Unlimited seats',
      features: [
        'Everything in Growth',
        'SSO / SAML integration',
        'Dedicated account manager',
        'SLA & uptime guarantee',
        'Custom integrations',
        'Onboarding & training'
      ],
      tier: 'enterprise',
      cta: 'Contact Sales',
      highlight: false
    }
  ];

  const handleSelectPlan = (tier) => {
    if (!authUser) {
      navigate('/login');
      return;
    }

    if (tier === 'free') {
      return; // Already on free plan
    }

    navigate(`/checkout?tier=${tier}&interval=${billingCycle === 'monthly' ? 'monthly' : 'yearly'}`);
  };

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-base-content/70 mb-8">
            Start learning smarter with AI-powered education
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className={billingCycle === 'monthly' ? 'font-semibold' : 'text-base-content/60'}>
              Monthly
            </span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={billingCycle === 'yearly'}
              onChange={(e) => setBillingCycle(e.target.checked ? 'yearly' : 'monthly')}
            />
            <span className={billingCycle === 'yearly' ? 'font-semibold' : 'text-base-content/60'}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <span className="badge badge-success">Save 17%</span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.tier}
                className={`card bg-base-100 shadow-xl ${
                  plan.highlight ? 'ring-2 ring-primary scale-105' : ''
                }`}
              >
                <div className="card-body">
                  {plan.badge && (
                    <div className="badge badge-primary absolute top-4 right-4">
                      {plan.badge}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-8 h-8 text-primary" />
                    <h2 className="card-title text-2xl">{plan.name}</h2>
                  </div>

                  <p className="text-base-content/70 mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    <span className="text-base-content/60">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan.tier)}
                    className={`btn btn-block mb-6 ${
                      plan.highlight ? 'btn-primary' : 'btn-outline'
                    }`}
                    disabled={plan.tier === 'free'}
                  >
                    {plan.tier === 'free' ? 'Current Plan' : 'Get Started'}
                  </button>

                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* B2B / Teams Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3">For Teams & Organizations</h2>
            <p className="text-lg text-base-content/70">
              Empower your whole team with shared analytics, white-label branding, and bulk user management.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {orgPlans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.tier}
                  className={`card bg-base-100 shadow-xl ${plan.highlight ? 'ring-2 ring-secondary' : ''}`}
                >
                  <div className="card-body">
                    {plan.badge && (
                      <div className="badge badge-secondary absolute top-4 right-4">
                        {plan.badge}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-8 h-8 text-secondary" />
                      <h3 className="card-title text-2xl">{plan.name}</h3>
                    </div>

                    <p className="text-base-content/70 mb-2">{plan.description}</p>

                    <div className="mb-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.priceSuffix && (
                        <span className="text-base-content/60 ml-1">{plan.priceSuffix}</span>
                      )}
                    </div>

                    <p className="text-sm text-base-content/60 mb-4">{plan.seats}</p>

                    <a
                      href="mailto:sales@lingoworld.app"
                      className={`btn btn-block mb-6 ${plan.highlight ? 'btn-secondary' : 'btn-outline btn-secondary'}`}
                    >
                      {plan.cta}
                    </a>

                    <div className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <div className="collapse collapse-arrow bg-base-100">
              <input type="radio" name="faq-accordion" defaultChecked />
              <div className="collapse-title text-xl font-medium">
                Can I upgrade or downgrade my plan?
              </div>
              <div className="collapse-content">
                <p>Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate your billing.</p>
              </div>
            </div>

            <div className="collapse collapse-arrow bg-base-100">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">
                What happens when I reach my usage limit?
              </div>
              <div className="collapse-content">
                <p>You'll receive a notification when you're close to your limit. You can upgrade to a higher tier anytime to continue using premium features.</p>
              </div>
            </div>

            <div className="collapse collapse-arrow bg-base-100">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">
                Is there a free trial?
              </div>
              <div className="collapse-content">
                <p>Yes! All new subscribers get a 7-day free trial on Basic and Pro plans. No credit card required for the free tier.</p>
              </div>
            </div>

            <div className="collapse collapse-arrow bg-base-100">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">
                Can I cancel anytime?
              </div>
              <div className="collapse-content">
                <p>Absolutely! You can cancel your subscription at any time. You'll retain access until the end of your billing period.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
