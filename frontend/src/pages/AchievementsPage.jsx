import { useEffect, useState } from 'react';
import { Trophy, Star, Target, Zap, Award, Crown, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [stats, setStats] = useState({ xp: 0, level: 1, coins: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const [allRes, userRes] = await Promise.all([
        axios.get('/gamification/achievements'),
        axios.get('/gamification/achievements/me')
      ]);

      setAchievements(allRes.data.achievements || []);
      setUserAchievements(userRes.data.unlockedAchievements || []);
      setStats(userRes.data.stats || { xp: 0, level: 1, coins: 0 });
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = (achievementId) => {
    return userAchievements.some(ua => ua.achievement?._id === achievementId || ua.achievement === achievementId);
  };

  const getUserAchievement = (achievementId) => {
    return userAchievements.find(ua => ua.achievement?._id === achievementId || ua.achievement === achievementId);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      learning: Star,
      social: Award,
      coding: Zap,
      language: Target,
      achievements: Trophy,
      streak: Crown
    };
    return icons[category] || Trophy;
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'unlocked') return isUnlocked(achievement._id);
    if (filter === 'locked') return !isUnlocked(achievement._id);
    return true;
  });

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Stats */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-primary" />
            Achievements
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="stats shadow bg-base-100">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <Star className="w-8 h-8" />
                </div>
                <div className="stat-title">Level</div>
                <div className="stat-value text-primary">{stats.level}</div>
                <div className="stat-desc">{stats.xp} XP</div>
              </div>
            </div>

            <div className="stats shadow bg-base-100">
              <div className="stat">
                <div className="stat-figure text-warning">
                  <Award className="w-8 h-8" />
                </div>
                <div className="stat-title">Coins</div>
                <div className="stat-value text-warning">{stats.coins}</div>
                <div className="stat-desc">Earned rewards</div>
              </div>
            </div>

            <div className="stats shadow bg-base-100">
              <div className="stat">
                <div className="stat-figure text-success">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="stat-title">Unlocked</div>
                <div className="stat-value text-success">{unlockedCount}</div>
                <div className="stat-desc">of {totalCount} achievements</div>
              </div>
            </div>

            <div className="stats shadow bg-base-100">
              <div className="stat">
                <div className="stat-title">Completion</div>
                <div className="stat-value text-info">{completionPercentage}%</div>
                <progress
                  className="progress progress-info w-full mt-2"
                  value={completionPercentage}
                  max="100"
                ></progress>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="tabs tabs-boxed bg-base-100 w-fit">
            <a
              className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({totalCount})
            </a>
            <a
              className={`tab ${filter === 'unlocked' ? 'tab-active' : ''}`}
              onClick={() => setFilter('unlocked')}
            >
              Unlocked ({unlockedCount})
            </a>
            <a
              className={`tab ${filter === 'locked' ? 'tab-active' : ''}`}
              onClick={() => setFilter('locked')}
            >
              Locked ({totalCount - unlockedCount})
            </a>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => {
            const unlocked = isUnlocked(achievement._id);
            const userAchievement = getUserAchievement(achievement._id);
            const Icon = getCategoryIcon(achievement.category);
            const progress = userAchievement?.progress || 0;
            const progressPercentage = achievement.requirement > 0
              ? Math.min(Math.round((progress / achievement.requirement) * 100), 100)
              : 0;

            return (
              <div
                key={achievement._id}
                className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all ${
                  unlocked ? 'ring-2 ring-primary' : 'opacity-60'
                }`}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${unlocked ? 'bg-primary/20' : 'bg-base-300'}`}>
                        <Icon className={`w-8 h-8 ${unlocked ? 'text-primary' : 'text-base-content/40'}`} />
                      </div>
                      <div>
                        <h3 className="card-title text-lg">{achievement.title}</h3>
                        <span className="badge badge-sm">{achievement.category}</span>
                      </div>
                    </div>
                    {unlocked ? (
                      <div className="tooltip" data-tip="Unlocked!">
                        <Trophy className="w-6 h-6 text-warning" />
                      </div>
                    ) : (
                      <Lock className="w-6 h-6 text-base-content/40" />
                    )}
                  </div>

                  <p className="text-sm text-base-content/70 mt-2">{achievement.description}</p>

                  {/* Progress Bar */}
                  {!unlocked && achievement.requirement > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{progress}/{achievement.requirement}</span>
                      </div>
                      <progress
                        className="progress progress-primary w-full"
                        value={progressPercentage}
                        max="100"
                      ></progress>
                    </div>
                  )}

                  {/* Rewards */}
                  <div className="flex gap-2 mt-4">
                    {achievement.rewards.xp > 0 && (
                      <div className="badge badge-info gap-1">
                        <Star className="w-3 h-3" />
                        {achievement.rewards.xp} XP
                      </div>
                    )}
                    {achievement.rewards.coins > 0 && (
                      <div className="badge badge-warning gap-1">
                        <Award className="w-3 h-3" />
                        {achievement.rewards.coins} Coins
                      </div>
                    )}
                  </div>

                  {/* Unlock Date */}
                  {unlocked && userAchievement?.unlockedAt && (
                    <div className="text-xs text-base-content/60 mt-2">
                      Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto text-base-content/40 mb-4" />
            <p className="text-xl text-base-content/60">
              {filter === 'unlocked'
                ? 'No achievements unlocked yet. Keep learning!'
                : filter === 'locked'
                ? 'All achievements unlocked! 🎉'
                : 'No achievements available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;
