import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { 
  RocketIcon,
  ZapIcon,
  MessageSquareIcon,
  BookOpenIcon,
  VideoIcon,
  TrophyIcon,
  FlameIcon,
  StarIcon,
  MenuIcon,
  XIcon,
  CodeIcon,
  Clock
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { LANGUAGES } from "../constants";
import {
  getSubscriptionStatus,
  getLearningStats,
  upgradeSubscription,
  getLeaderboard
} from "../lib/learningApi";
import { getLearningProgress } from "../lib/api";
import { getWeeklyStats } from "../lib/activityApi";
import ActivityDashboard from "../components/ActivityDashboard";

// Import the new components
import DailyChallenges from "../components/DailyChallenges";
import FiveMinuteConversation from "../components/FiveMinuteConversation";
import LearnTenWords from "../components/LearnTenWords";
import WatchAndLearn from "../components/WatchAndLearn";
import CodingLearning from "../components/CodingLearning";

const EnhancedLanguageJourneyPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [activeFeature, setActiveFeature] = useState('dashboard');
  const [, setShowUpgradeModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch user's learning progress
  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ["learningProgress"],
    queryFn: getLearningProgress,
    enabled: true, // Enable API call
    retry: 1
  });

  // Fetch weekly stats for real progress tracking
  const { data: weeklyStats } = useQuery({
    queryKey: ["weeklyStats"],
    queryFn: getWeeklyStats,
    enabled: activeFeature === 'dashboard', // Enable when dashboard is active
    retry: 1
  });

  // Fetch subscription status
  const { data: subscription } = useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: getSubscriptionStatus,
    enabled: true, // Enable API call
    retry: 1
  });

  // Fetch learning stats (currently unused but may be needed later)
  const { data: stats } = useQuery({
    queryKey: ["learningStats"],
    queryFn: getLearningStats,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    enabled: true // Enable API call
  });

  // Fetch leaderboard data
  const { data: leaderboardData } = useQuery({
    queryKey: ["leaderboard", "week"],
    queryFn: () => getLeaderboard('week', 10),
    enabled: activeFeature === 'dashboard', // Enable when dashboard is active
    retry: 1
  });

  // Upgrade subscription mutation
  useMutation({
    mutationFn: ({ plan, paymentMethod }) => upgradeSubscription(plan, paymentMethod),
    onSuccess: () => {
      toast.success("Successfully upgraded to Premium! 🎉");
      queryClient.invalidateQueries(["subscriptionStatus"]);
      setShowUpgradeModal(false);
    },
    onError: () => {
      toast.error("Upgrade failed. Please try again.");
    }
  });

  const learningLanguage = LANGUAGES.find(lang => lang.value === authUser?.learningLanguage);

  // Learning features with requirements
  const features = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <RocketIcon className="w-6 h-6" />,
      description: 'Overview of your progress',
      color: 'primary',
      available: true
    },
    {
      id: 'daily-challenges',
      title: 'Daily Challenges',
      icon: <ZapIcon className="w-6 h-6" />,
      description: 'Complete daily challenges for XP',
      color: 'warning',
      available: true,
      badge: progress?.dailyChallenges?.completed?.length || 0
    },
    {
      id: 'conversation',
      title: '5-Min Conversation',
      icon: <MessageSquareIcon className="w-6 h-6" />,
      description: 'Practice with AI conversations',
      color: 'success',
      available: true,
    },
    {
      id: 'vocabulary',
      title: 'Learn 10 Words',
      icon: <BookOpenIcon className="w-6 h-6" />,
      description: 'Master new vocabulary daily',
      color: 'secondary',
      available: true
    },
    {
      id: 'watch-learn',
      title: 'Watch & Learn',
      icon: <VideoIcon className="w-6 h-6" />,
      description: 'Learn through video content',
      color: 'accent',
      available: true,
      hasNew: true
    },
    {
      id: 'coding-learning',
      title: 'Coding & DSA',
      icon: <CodeIcon className="w-6 h-6" />,
      description: 'Learn programming & algorithms',
      color: 'info',
      available: true,
      hasNew: true,
      badge: '🔥 NEW'
    },
    {
      id: 'activity-dashboard',
      title: 'Time Tracker',
      icon: <Clock className="w-6 h-6" />,
      description: 'Monitor your learning time',
      color: 'warning',
      available: true,
      hasNew: true
    }
  ];

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-8">
        <h1 className="text-4xl font-bold mb-4">
          Welcome back, {authUser?.fullName}! 👋
        </h1>
        <p className="text-lg opacity-90 mb-6">
          You're learning {learningLanguage?.label}. Keep up the great work!
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat bg-base-100 rounded-lg">
            <div className="stat-figure text-primary">
              <FlameIcon className="w-8 h-8" />
            </div>
            <div className="stat-title">Streak</div>
            <div className="stat-value text-primary">{progress?.currentStreak || 0}</div>
            <div className="stat-desc">days</div>
          </div>
          
          <div className="stat bg-base-100 rounded-lg">
            <div className="stat-figure text-secondary">
              <StarIcon className="w-8 h-8" />
            </div>
            <div className="stat-title">Total XP</div>
            <div className="stat-value text-secondary">{progress?.totalXP || 0}</div>
            <div className="stat-desc">Level {progress?.currentLevel || 1}</div>
          </div>
          
          <div className="stat bg-base-100 rounded-lg">
            <div className="stat-figure text-accent">
              <div className="w-8 h-8 bg-yellow-500 rounded-full" />
            </div>
            <div className="stat-title">Coins</div>
            <div className="stat-value text-accent">{subscription?.coins || 0}</div>
            <div className="stat-desc">currency</div>
          </div>
          
          <div className="stat bg-base-100 rounded-lg">
            <div className="stat-figure text-success">
              <TrophyIcon className="w-8 h-8" />
            </div>
            <div className="stat-title">Rank</div>
            <div className="stat-value text-success">
              Premium
            </div>
            <div className="stat-desc">
              All features unlocked
            </div>
          </div>
        </div>
      </div>

      {/* Today's Goals */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Today's Goals</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
              <div className="flex items-center gap-4">
                <ZapIcon className="w-6 h-6 text-warning" />
                <div>
                  <p className="font-semibold">Complete Daily Challenges</p>
                  <p className="text-sm opacity-70">Earn up to 300 XP</p>
                </div>
              </div>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => setActiveFeature('daily-challenges')}
              >
                Start
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
              <div className="flex items-center gap-4">
                <MessageSquareIcon className="w-6 h-6 text-success" />
                <div>
                  <p className="font-semibold">Practice Conversation</p>
                  <p className="text-sm opacity-70">5-minute session</p>
                </div>
              </div>
              <button 
                className="btn btn-sm btn-success"
                onClick={() => setActiveFeature('conversation')}
              >
                Practice
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
              <div className="flex items-center gap-4">
                <BookOpenIcon className="w-6 h-6 text-secondary" />
                <div>
                  <p className="font-semibold">Learn New Words</p>
                  <p className="text-sm opacity-70">10 words daily</p>
                </div>
              </div>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => setActiveFeature('vocabulary')}
              >
                Learn
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">This Week's Progress</h2>
          {weeklyStats?.dailyData ? (
            <div className="h-64 flex items-end justify-between gap-2">
              {weeklyStats.dailyData.map((dayData) => {
                const maxTime = Math.max(...weeklyStats.dailyData.map(d => d.timeSpent)) || 100;
                const heightPercent = maxTime > 0 ? (dayData.timeSpent / maxTime) * 100 : 0;
                
                return (
                  <div key={dayData.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full h-full flex flex-col justify-end">
                      <div 
                        className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t transition-all hover:opacity-80"
                        style={{ height: `${heightPercent}%` }}
                      >
                        {dayData.timeSpent > 0 && (
                          <div className="absolute top-0 left-0 right-0 -mt-6 text-center">
                            <span className="text-xs font-bold">{dayData.timeSpent}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-semibold">{dayData.day}</span>
                    {dayData.xpEarned > 0 && (
                      <span className="badge badge-xs badge-success">+{dayData.xpEarned} XP</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-end justify-between gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-base-300 rounded-t"
                    style={{ height: '20%' }}
                  />
                  <span className="text-xs">{day}</span>
                </div>
              ))}
            </div>
          )}
          {weeklyStats && (
            <div className="mt-4 flex justify-between text-sm">
              <span>Total: {weeklyStats.totalTimeSpent || 0} minutes</span>
              <span>Average: {Math.round(weeklyStats.averageDailyTime || 0)} min/day</span>
              <span>XP Earned: {weeklyStats.totalXP || 0}</span>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title text-2xl">Weekly Leaderboard</h2>
            <div className="badge badge-primary">Top 10</div>
          </div>
          <div className="space-y-3">
            {leaderboardData?.leaderboard?.length > 0 ? (
              <>
                {leaderboardData.leaderboard.map((user) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  const avatar = user.rank <= 3 ? medals[user.rank - 1] : `${user.rank}`;
                  
                  return (
                    <div 
                      key={user.userId} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        user.isCurrentUser ? 'bg-primary/20 border-2 border-primary' : 'bg-base-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold w-10 text-center">{avatar}</div>
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-full">
                            {user.profilePic ? (
                              <img src={user.profilePic} alt={user.fullName} />
                            ) : (
                              <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                                {user.fullName?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold">{user.fullName}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm opacity-70">{user.totalXP.toLocaleString()} XP</p>
                            <span className="badge badge-xs">Lvl {user.level}</span>
                            {user.currentStreak > 0 && (
                              <span className="badge badge-xs badge-warning">
                                🔥 {user.currentStreak}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-lg">#{user.rank}</span>
                    </div>
                  );
                })}
                
                {/* Show current user if not in top list */}
                {leaderboardData.currentUserData && (
                  <>
                    <div className="text-center text-sm opacity-50 py-2">• • •</div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/20 border-2 border-primary">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold w-10 text-center">👤</div>
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-full">
                            {leaderboardData.currentUserData.profilePic ? (
                              <img src={leaderboardData.currentUserData.profilePic} alt={leaderboardData.currentUserData.fullName} />
                            ) : (
                              <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                                {leaderboardData.currentUserData.fullName?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold">You ({leaderboardData.currentUserData.fullName})</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm opacity-70">{leaderboardData.currentUserData.totalXP.toLocaleString()} XP</p>
                            <span className="badge badge-xs">Lvl {leaderboardData.currentUserData.level}</span>
                            {leaderboardData.currentUserData.currentStreak > 0 && (
                              <span className="badge badge-xs badge-warning">
                                🔥 {leaderboardData.currentUserData.currentStreak}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-lg">#{leaderboardData.currentUserData.rank}</span>
                    </div>
                  </>
                )}
              </>
            ) : (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-base-200 rounded-lg animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-base-300 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-base-300 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-base-300 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-5 bg-base-300 rounded w-8"></div>
                </div>
              ))
            )}
          </div>
          
          {/* Leaderboard Footer */}
          {leaderboardData && (
            <div className="mt-4 pt-4 border-t border-base-300">
              <div className="flex justify-between text-sm mb-2">
                <span className="opacity-70">Your Rank</span>
                <span className="font-bold text-primary">
                  #{leaderboardData.currentUserRank || 'Unranked'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-70">Total Players</span>
                <span className="font-semibold">
                  {leaderboardData.totalUsers || 0} users
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const handleChallengeComplete = (result) => {
    queryClient.invalidateQueries(["learningProgress"]);
    queryClient.invalidateQueries(["subscriptionStatus"]);
    toast.success(`Challenge complete! +${result.xp} XP, +${result.coins} coins`);
  };

  const handleConversationComplete = (result) => {
    queryClient.invalidateQueries(["learningProgress"]);
    toast.success(`Conversation complete! +${result.xp} XP earned`);
  };

  const handleVocabularyComplete = (result) => {
    queryClient.invalidateQueries(["learningProgress"]);
    toast.success(`${result.masteredWords.length} words mastered! +${result.xp} XP`);
  };

  const handleVideoComplete = (result) => {
    queryClient.invalidateQueries(["learningProgress"]);
    toast.success(`Video complete! +${result.xp} XP earned`);
  };

  if (loadingProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-base-100 shadow-xl transition-all duration-300 fixed lg:relative h-full z-40`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>
              Language Journey
            </h2>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>

          <nav className="space-y-2">
            {features.map(feature => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  activeFeature === feature.id
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-base-200 text-base-content'
                }`}
              >
                <div className={activeFeature === feature.id ? 'text-primary' : 'text-base-content/60'}>
                  {feature.icon}
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">{feature.title}</p>
                      <p className="text-xs opacity-70">{feature.description}</p>
                    </div>
                    {feature.badge && (
                      <span className="badge badge-primary">{feature.badge}</span>
                    )}
                    {feature.hasNew && (
                      <span className="badge badge-error badge-sm">NEW</span>
                    )}
                  </>
                )}
              </button>
            ))}
          </nav>

        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeFeature === 'dashboard' && <Dashboard />}
          
          {activeFeature === 'daily-challenges' && (
            <DailyChallenges
              userLevel={progress?.currentLevel || 1}
              isPremium={true}
              onChallengeComplete={handleChallengeComplete}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          )}
          
          {activeFeature === 'conversation' && (
            <FiveMinuteConversation
              language={authUser?.learningLanguage}
              userLevel={progress?.proficiencyLevel || 'beginner'}
              isPremium={true}
              onComplete={handleConversationComplete}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          )}
          
          {activeFeature === 'vocabulary' && (
            <LearnTenWords
              language={authUser?.learningLanguage}
              userLevel={progress?.proficiencyLevel || 'beginner'}
              isPremium={true}
              savedWords={progress?.vocabulary || []}
              onComplete={handleVocabularyComplete}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          )}
          
          {activeFeature === 'watch-learn' && (
            <WatchAndLearn
              language={authUser?.learningLanguage}
              userLevel={progress?.proficiencyLevel || 'beginner'}
              isPremium={true}
              watchHistory={progress?.watchedVideos || []}
              onVideoComplete={handleVideoComplete}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          )}

          {activeFeature === 'coding-learning' && (
            <CodingLearning
              userLevel={progress?.currentLevel || 1}
              userProgress={{
                level: progress?.currentLevel || 1,
                completedChallenges: progress?.dailyChallenges?.completed?.length || 0,
                streak: progress?.currentStreak || 0
              }}
              onComplete={(result) => {
                queryClient.invalidateQueries(["learningProgress"]);
                toast.success(`Challenge complete! +${result.xp} XP`);
              }}
              onVideoUpload={(video) => {
                toast.success('Video uploaded successfully!');
              }}
            />
          )}
          
          {activeFeature === 'activity-dashboard' && (
            <ActivityDashboard />
          )}
        </div>
      </div>

    </div>
  );
};

export default EnhancedLanguageJourneyPage;