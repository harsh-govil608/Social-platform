import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  TrendingUp,
  Calendar,
  Activity,
  Award,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Users,
  BookOpen,
  MessageSquare,
  Video,
  Code,
  Trophy,
  Flame,
  Star,
  ChevronUp,
  ChevronDown,
  Timer,
  Pause,
  Play,
  RefreshCw
} from 'lucide-react';
import { 
  getActivityDashboard, 
  getWeeklyStats, 
  getMonthlyStats,
  getAchievements,
  initActivity,
  logActivity
} from '../lib/activityApi';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

const ActivityDashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionTimer, setSessionTimer] = useState(0);

  // Initialize activity tracking on mount
  useEffect(() => {
    initActivity();
    
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Log page visit
    logActivity('dashboard_view', { page: 'activity_dashboard' });

    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  const { data: dashboardData, isLoading: loadingDashboard, refetch: refetchDashboard } = useQuery({
    queryKey: ['activityDashboard'],
    queryFn: getActivityDashboard,
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch weekly stats
  const { data: weeklyData, isLoading: loadingWeekly } = useQuery({
    queryKey: ['weeklyStats'],
    queryFn: getWeeklyStats,
    enabled: timeRange === 'week'
  });

  // Fetch monthly stats
  const { data: monthlyData, isLoading: loadingMonthly } = useQuery({
    queryKey: ['monthlyStats'],
    queryFn: getMonthlyStats,
    enabled: timeRange === 'month'
  });

  // Fetch achievements
  const { data: achievements, isLoading: loadingAchievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: getAchievements
  });

  // Update session timer
  useEffect(() => {
    if (dashboardData?.isOnline && dashboardData?.sessionStartTime) {
      const timer = setInterval(() => {
        const duration = Math.floor((new Date() - new Date(dashboardData.sessionStartTime)) / 1000 / 60);
        setSessionTimer(duration);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [dashboardData]);

  const formatMinutes = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getActivityIcon = (type) => {
    const icons = {
      learning: <BookOpen className="w-4 h-4" />,
      chatting: <MessageSquare className="w-4 h-4" />,
      coding: <Code className="w-4 h-4" />,
      video_watching: <Video className="w-4 h-4" />,
      story_writing: <BookOpen className="w-4 h-4" />
    };
    return icons[type] || <Activity className="w-4 h-4" />;
  };

  const getActivityColor = (type) => {
    const colors = {
      learning: 'bg-primary',
      chatting: 'bg-success',
      coding: 'bg-info',
      video_watching: 'bg-warning',
      story_writing: 'bg-secondary'
    };
    return colors[type] || 'bg-base-300';
  };

  if (loadingDashboard) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Activity Dashboard</h2>
          <p className="text-sm opacity-70 mt-1">
            Track your learning progress and time spent
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="badge badge-lg gap-2">
            <Clock className="w-4 h-4" />
            {format(currentTime, 'HH:mm:ss')}
          </div>
          <button 
            onClick={() => refetchDashboard()}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Online Status Card */}
      <div className={`card ${dashboardData?.isOnline ? 'bg-success/10 border-2 border-success' : 'bg-base-200'}`}>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`radial-progress ${dashboardData?.isOnline ? 'text-success' : 'text-base-300'}`} 
                style={{"--value": dashboardData?.isOnline ? 100 : 0}} 
                role="progressbar">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {dashboardData?.isOnline ? 'Currently Online' : 'Offline'}
                </h3>
                {dashboardData?.isOnline && (
                  <p className="text-sm opacity-70">
                    Session started {formatMinutes(sessionTimer)} ago
                  </p>
                )}
              </div>
            </div>
            {dashboardData?.isOnline && (
              <div className="text-right">
                <p className="text-3xl font-bold text-success">
                  {formatMinutes(sessionTimer)}
                </p>
                <p className="text-sm opacity-70">Current session</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-lg shadow-lg">
          <div className="stat-figure text-primary">
            <Timer className="w-8 h-8" />
          </div>
          <div className="stat-title">Today</div>
          <div className="stat-value text-primary">
            {formatMinutes(dashboardData?.todayTime || 0)}
          </div>
          <div className="stat-desc">Time spent learning</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-lg">
          <div className="stat-figure text-secondary">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="stat-title">This Week</div>
          <div className="stat-value text-secondary">
            {formatMinutes(dashboardData?.weekTime || 0)}
          </div>
          <div className="stat-desc">Total weekly time</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-lg">
          <div className="stat-figure text-accent">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="stat-title">This Month</div>
          <div className="stat-value text-accent">
            {formatMinutes(dashboardData?.monthTime || 0)}
          </div>
          <div className="stat-desc">Total monthly time</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-lg">
          <div className="stat-figure text-warning">
            <Flame className="w-8 h-8" />
          </div>
          <div className="stat-title">Streak</div>
          <div className="stat-value text-warning">
            {dashboardData?.currentStreak || 0}
          </div>
          <div className="stat-desc">Days in a row</div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="tabs tabs-boxed">
        <button
          className={`tab ${timeRange === 'week' ? 'tab-active' : ''}`}
          onClick={() => setTimeRange('week')}
        >
          This Week
        </button>
        <button
          className={`tab ${timeRange === 'month' ? 'tab-active' : ''}`}
          onClick={() => setTimeRange('month')}
        >
          This Month
        </button>
      </div>

      {/* Weekly Chart */}
      {timeRange === 'week' && !loadingWeekly && weeklyData && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="text-xl font-semibold mb-4">Weekly Activity</h3>
            
            {/* Daily Bar Chart */}
            <div className="space-y-4">
              {weeklyData.dailyData?.map((day, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-semibold">
                    {day.day}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <progress 
                        className="progress progress-primary flex-1" 
                        value={day.timeSpent} 
                        max={Math.max(...weeklyData.dailyData.map(d => d.timeSpent)) || 100}
                      ></progress>
                      <span className="text-sm w-16 text-right">
                        {formatMinutes(day.timeSpent)}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="badge badge-xs">{day.xpEarned} XP</span>
                      <span className="badge badge-xs">{day.activities} activities</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Breakdown */}
            {weeklyData.activitiesBreakdown && Object.keys(weeklyData.activitiesBreakdown).length > 0 && (
              <>
                <div className="divider"></div>
                <h4 className="font-semibold">Activity Breakdown</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(weeklyData.activitiesBreakdown).map(([type, minutes]) => (
                    <div key={type} className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getActivityColor(type)}`}>
                        {getActivityIcon(type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm capitalize">{type.replace('_', ' ')}</p>
                        <p className="text-xs opacity-70">{formatMinutes(minutes)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Weekly Summary */}
            <div className="stats shadow mt-4">
              <div className="stat">
                <div className="stat-title">Average Daily</div>
                <div className="stat-value text-sm">
                  {formatMinutes(weeklyData.averageDailyTime || 0)}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Total XP</div>
                <div className="stat-value text-sm text-primary">
                  {weeklyData.totalXP || 0}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Total Coins</div>
                <div className="stat-value text-sm text-warning">
                  {weeklyData.totalCoins || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Stats */}
      {timeRange === 'month' && !loadingMonthly && monthlyData && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="text-xl font-semibold mb-4">Monthly Overview</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {formatMinutes(monthlyData.totalTimeSpent || 0)}
                </p>
                <p className="text-sm opacity-70">Total Time</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary">
                  {monthlyData.activeDays || 0}
                </p>
                <p className="text-sm opacity-70">Active Days</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">
                  {formatMinutes(monthlyData.dailyAverageTime || 0)}
                </p>
                <p className="text-sm opacity-70">Daily Average</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-success">
                  {monthlyData.totalXPEarned || 0}
                </p>
                <p className="text-sm opacity-70">XP Earned</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-warning">
                  {monthlyData.totalCoinsEarned || 0}
                </p>
                <p className="text-sm opacity-70">Coins Earned</p>
              </div>
            </div>

            {/* Activity Counts */}
            {monthlyData.activitiesCount && Object.keys(monthlyData.activitiesCount).length > 0 && (
              <>
                <div className="divider"></div>
                <h4 className="font-semibold">Activities Completed</h4>
                <div className="space-y-2">
                  {Object.entries(monthlyData.activitiesCount).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(type)}
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                      </div>
                      <span className="badge badge-lg">{count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Achievements */}
      {!loadingAchievements && achievements && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="text-xl font-semibold mb-4">Achievements</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {achievements.map(achievement => (
                <div 
                  key={achievement.id}
                  className={`text-center p-4 rounded-lg ${
                    achievement.earned 
                      ? 'bg-gradient-to-br from-primary/20 to-secondary/20' 
                      : 'bg-base-200 opacity-50'
                  }`}
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <p className="text-sm font-semibold">{achievement.name}</p>
                  <p className="text-xs opacity-70 mt-1">{achievement.description}</p>
                  {achievement.earned && (
                    <div className="mt-2">
                      <span className="badge badge-xs badge-success">Earned</span>
                    </div>
                  )}
                  {!achievement.earned && (
                    <div className="mt-2 text-xs">
                      <span className="text-warning">+{achievement.xpReward} XP</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Motivational Quote */}
      <div className="alert alert-info">
        <Zap className="w-5 h-5" />
        <div>
          <h4 className="font-semibold">Keep Going!</h4>
          <p className="text-sm">
            {dashboardData?.currentStreak > 0
              ? `Amazing ${dashboardData.currentStreak} day streak! Don't break the chain!`
              : "Start your learning streak today! Consistency is the key to mastery."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivityDashboard;