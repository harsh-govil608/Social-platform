import { useEffect, useState } from 'react';
import { Crown, Zap, TrendingUp, Calendar, CreditCard, FileText, AlertCircle } from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

const SubscriptionPage = () => {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const [subRes, invoicesRes] = await Promise.all([
        axios.get('/subscription/current'),
        axios.get('/subscription/invoices').catch(() => ({ data: { invoices: [] } }))
      ]);

      setSubscription(subRes.data.subscription);
      setInvoices(invoicesRes.data.invoices || []);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    try {
      const response = await axios.post('/subscription/cancel');
      toast.success(response.data.message);
      fetchSubscriptionData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const openBillingPortal = async () => {
    try {
      const response = await axios.get('/subscription/billing-portal');
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to open billing portal');
    }
  };

  const getUsagePercentage = (feature) => {
    if (!subscription?.usage || !subscription?.limits) return 0;
    const usage = subscription.usage[feature] || 0;
    const limit = subscription.limits[feature] || 1;
    return Math.min((usage / limit) * 100, 100);
  };

  const getTierColor = (tier) => {
    const colors = {
      free: 'badge-neutral',
      basic: 'badge-primary',
      pro: 'badge-secondary',
      enterprise: 'badge-accent'
    };
    return colors[tier] || 'badge-neutral';
  };

  const getTierName = (tier) => {
    return tier?.charAt(0).toUpperCase() + tier?.slice(1) || 'Free';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const features = [
    { key: 'aiTutorSessions', name: 'AI Tutor Sessions', icon: Zap },
    { key: 'dsaProblems', name: 'DSA Problems', icon: TrendingUp },
    { key: 'conversationPractice', name: 'Conversation Practice', icon: Crown },
    { key: 'codingChallenges', name: 'Coding Challenges', icon: FileText },
    { key: 'videoCallMinutes', name: 'Video Call Minutes', icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Crown className="w-10 h-10 text-primary" />
            My Subscription
          </h1>
        </div>

        {/* Current Plan Card */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-xl mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold">{getTierName(subscription?.tier)} Plan</h2>
                  <div className={`badge ${getTierColor(subscription?.tier)} badge-lg`}>
                    {subscription?.status || 'Active'}
                  </div>
                </div>
                {subscription?.tier !== 'free' && subscription?.currentPeriodEnd && (
                  <p className="text-primary-content/80">
                    {subscription?.cancelAtPeriodEnd
                      ? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                      : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    }
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {subscription?.tier === 'free' ? (
                  <button onClick={handleUpgrade} className="btn btn-accent">
                    Upgrade Now
                  </button>
                ) : (
                  <>
                    <button onClick={openBillingPortal} className="btn btn-ghost">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Manage Billing
                    </button>
                    {!subscription?.cancelAtPeriodEnd && (
                      <button onClick={handleCancelSubscription} className="btn btn-error btn-outline">
                        Cancel Plan
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h3 className="card-title text-2xl mb-4">Usage This Month</h3>
            <div className="space-y-6">
              {features.map(({ key, name, icon: Icon }) => {
                const usage = subscription?.usage?.[key] || 0;
                const limit = subscription?.limits?.[key] || 0;
                const percentage = getUsagePercentage(key);
                const isUnlimited = limit === -1;

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{name}</span>
                      </div>
                      <span className="text-sm">
                        {isUnlimited ? (
                          <span className="badge badge-success">Unlimited</span>
                        ) : (
                          <span className={percentage >= 100 ? 'text-error font-bold' : ''}>
                            {usage}/{limit}
                          </span>
                        )}
                      </span>
                    </div>
                    {!isUnlimited && (
                      <progress
                        className={`progress w-full ${
                          percentage >= 100 ? 'progress-error' :
                          percentage >= 80 ? 'progress-warning' : 'progress-primary'
                        }`}
                        value={percentage}
                        max="100"
                      ></progress>
                    )}
                    {percentage >= 100 && !isUnlimited && (
                      <div className="alert alert-warning mt-2 py-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Limit reached. Upgrade to continue using this feature.</span>
                        <button onClick={handleUpgrade} className="btn btn-xs btn-warning">
                          Upgrade
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {subscription?.usage?.lastReset && (
              <div className="text-sm text-base-content/60 mt-4">
                Usage resets on {new Date(subscription.usage.lastReset).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Billing History */}
        {invoices.length > 0 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-2xl mb-4">Billing History</h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td>{new Date(invoice.date).toLocaleDateString()}</td>
                        <td className="font-semibold">
                          {invoice.currency} {invoice.amount}
                        </td>
                        <td>
                          <div className={`badge ${
                            invoice.status === 'paid' ? 'badge-success' : 'badge-error'
                          }`}>
                            {invoice.status}
                          </div>
                        </td>
                        <td>
                          {invoice.invoiceUrl && (
                            <a
                              href={invoice.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost btn-sm"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              View
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade CTA for Free Users */}
        {subscription?.tier === 'free' && (
          <div className="alert alert-info mt-6">
            <Zap className="w-6 h-6" />
            <div>
              <h3 className="font-bold">Unlock More Features!</h3>
              <div className="text-sm">Upgrade to Basic or Pro to get 10x more AI sessions, problems, and features.</div>
            </div>
            <button onClick={handleUpgrade} className="btn btn-sm btn-primary">
              View Plans
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
