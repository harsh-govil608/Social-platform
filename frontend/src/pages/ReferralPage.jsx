import { useEffect, useState } from 'react';
import { Share2, Copy, DollarSign, Users, TrendingUp, Gift, Twitter, Mail, Link as LinkIcon, Award, Check } from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

const ReferralPage = () => {
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const [codeRes, statsRes] = await Promise.all([
        axios.get('/referral/code'),
        axios.get('/referral/stats')
      ]);

      setReferralData({
        code: codeRes.data.referralCode,
        ...statsRes.data
      });
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const getReferralUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/signup?ref=${referralData?.code}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getReferralUrl());
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent('Join me on SkillForge - Learn coding and languages with AI! 🚀');
    const url = encodeURIComponent(getReferralUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join me on SkillForge!');
    const body = encodeURIComponent(
      `Hey! I've been using SkillForge to learn coding and languages, and I think you'd love it too!\n\nUse my referral link to get started: ${getReferralUrl()}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const getTierInfo = (tier) => {
    const tiers = {
      bronze: { name: 'Bronze', multiplier: '1x', color: 'text-amber-700', next: 10 },
      silver: { name: 'Silver', multiplier: '1.2x', color: 'text-gray-400', next: 20 },
      gold: { name: 'Gold', multiplier: '1.5x', color: 'text-warning', next: 50 },
      platinum: { name: 'Platinum', multiplier: '2x', color: 'text-info', next: 100 },
      ambassador: { name: 'Ambassador', multiplier: '3x', color: 'text-purple-500', next: null }
    };
    return tiers[tier] || tiers.bronze;
  };

  const redeemRewards = async () => {
    try {
      const response = await axios.post('/referral/redeem');
      toast.success(response.data.message || 'Rewards redeemed successfully!');
      fetchReferralData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to redeem rewards');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const tierInfo = getTierInfo(referralData?.tier || 'bronze');
  const completedReferrals = referralData?.stats?.completedReferrals || 0;
  const totalReferrals = referralData?.stats?.totalReferrals || 0;
  const conversionRate = referralData?.stats?.conversionRate || 0;
  const cashRewards = referralData?.rewards?.cashRewards || 0;
  const coins = referralData?.rewards?.totalCoins || 0;
  const freeDays = referralData?.rewards?.freePremiumDays || 0;

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Share2 className="w-10 h-10 text-primary" />
            Referral Program
          </h1>
          <p className="text-base-content/70">
            Invite friends and earn rewards! The more you refer, the more you earn.
          </p>
        </div>

        {/* Referral Link Card */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Your Referral Link</h2>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <div className="input-group">
                  <input
                    type="text"
                    value={getReferralUrl()}
                    readOnly
                    className="input input-bordered w-full bg-base-100 text-base-content"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="btn btn-square"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={shareOnTwitter} className="btn btn-sm gap-2">
                <Twitter className="w-4 h-4" />
                Twitter
              </button>
              <button onClick={shareViaEmail} className="btn btn-sm gap-2">
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button onClick={copyToClipboard} className="btn btn-sm gap-2">
                <LinkIcon className="w-4 h-4" />
                Copy Link
              </button>
            </div>

            <div className="alert alert-info mt-4">
              <Share2 className="w-5 h-5" />
              <span>Your referral code: <strong>{referralData?.code}</strong></span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Users className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Referrals</div>
              <div className="stat-value text-primary">{totalReferrals}</div>
              <div className="stat-desc">{completedReferrals} completed</div>
            </div>
          </div>

          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-success">
                <DollarSign className="w-8 h-8" />
              </div>
              <div className="stat-title">Cash Earned</div>
              <div className="stat-value text-success">${cashRewards}</div>
              <div className="stat-desc">Available to redeem</div>
            </div>
          </div>

          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-warning">
                <Award className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Coins</div>
              <div className="stat-value text-warning">{coins}</div>
              <div className="stat-desc">Reward points</div>
            </div>
          </div>

          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-info">
                <Gift className="w-8 h-8" />
              </div>
              <div className="stat-title">Free Days</div>
              <div className="stat-value text-info">{freeDays}</div>
              <div className="stat-desc">Premium access</div>
            </div>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h3 className="card-title">Your Tier: <span className={tierInfo.color}>{tierInfo.name}</span></h3>
            <p className="text-base-content/70">
              Reward Multiplier: <strong>{tierInfo.multiplier}</strong>
            </p>

            {tierInfo.next && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress to next tier</span>
                  <span>{completedReferrals}/{tierInfo.next}</span>
                </div>
                <progress
                  className="progress progress-primary w-full"
                  value={completedReferrals}
                  max={tierInfo.next}
                ></progress>
              </div>
            )}

            {/* Tier Benefits */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Tier Benefits:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Bronze (0-10): $2 per referral, 1x coins</li>
                <li>• Silver (10-20): $2.40 per referral, 1.2x coins</li>
                <li>• Gold (20-50): $3 per referral, 1.5x coins</li>
                <li>• Platinum (50-100): $4 per referral, 2x coins</li>
                <li>• Ambassador (100+): $6 per referral, 3x coins</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Conversion Stats */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h3 className="card-title">Performance Metrics</h3>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base-content/70">Conversion Rate</span>
                  <span className="font-bold">{conversionRate.toFixed(1)}%</span>
                </div>
                <progress
                  className="progress progress-success w-full"
                  value={conversionRate}
                  max="100"
                ></progress>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base-content/70">Active Referrals</span>
                  <span className="font-bold">{referralData?.stats?.activeReferrals || 0}</span>
                </div>
                <div className="text-sm text-success flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Currently active users
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Redeem Rewards */}
        {cashRewards > 0 && (
          <div className="alert alert-success mb-6">
            <DollarSign className="w-6 h-6" />
            <div>
              <h3 className="font-bold">You have ${cashRewards} ready to redeem!</h3>
              <div className="text-xs">Minimum payout is $10</div>
            </div>
            <button
              onClick={redeemRewards}
              className="btn btn-sm btn-success"
              disabled={cashRewards < 10}
            >
              Redeem Now
            </button>
          </div>
        )}

        {/* How it Works */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Share2 className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold mb-2">1. Share Your Link</h4>
                <p className="text-sm text-base-content/70">
                  Share your unique referral link with friends via social media, email, or messaging
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <h4 className="font-bold mb-2">2. They Sign Up</h4>
                <p className="text-sm text-base-content/70">
                  When someone signs up using your link and becomes an active user
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6 text-warning" />
                </div>
                <h4 className="font-bold mb-2">3. Earn Rewards</h4>
                <p className="text-sm text-base-content/70">
                  Get cash, coins, and premium days - rewards increase as you level up!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;
