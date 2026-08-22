import { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  Play,
  CheckCircle,
  Timer,
  Code,
  Medal,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const ContestsPage = () => {
  const [contests, setContests] = useState({ upcoming: [], live: [], ended: [] });
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  const fetchContests = useCallback(async (status) => {
    try {
      const response = await axiosInstance.get('/contests', {
        params: { status, limit: 20 }
      });
      return response.data.contests || [];
    } catch (error) {
      console.error(`Error fetching ${status} contests:`, error);
      return [];
    }
  }, []);

  useEffect(() => {
    const loadContests = async () => {
      setIsLoading(true);
      const [upcoming, live, ended] = await Promise.all([
        fetchContests('upcoming'),
        fetchContests('live'),
        fetchContests('ended')
      ]);
      setContests({ upcoming, live, ended });
      setIsLoading(false);
    };
    loadContests();
  }, [fetchContests]);

  const handleRegister = async (contestId) => {
    try {
      await axiosInstance.post(`/contests/${contestId}/register`);
      toast.success('Successfully registered!');
      // Refresh contests
      const updatedContests = await fetchContests(activeTab);
      setContests(prev => ({ ...prev, [activeTab]: updatedContests }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getTimeUntil = (date) => {
    const now = new Date();
    const target = new Date(date);
    const diff = target - now;

    if (diff < 0) return 'Started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const currentContests = contests[activeTab] || [];

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-warning" />
          Coding Contests
        </h1>
        <p className="opacity-70">
          Compete with others, solve problems, and win prizes!
        </p>
      </div>

      {/* Live Contest Banner */}
      {contests.live.length > 0 && (
        <div className="alert alert-success mb-6 shadow-lg">
          <Play className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Live Contest!</h3>
            <p className="text-sm">{contests.live[0].title} is happening now</p>
          </div>
          <Link to={`/contest/${contests.live[0]._id}`} className="btn btn-sm">
            Join Now
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === 'upcoming' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Upcoming ({contests.upcoming.length})
        </button>
        <button
          className={`tab ${activeTab === 'live' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('live')}
        >
          <Play className="w-4 h-4 mr-2" />
          Live ({contests.live.length})
        </button>
        <button
          className={`tab ${activeTab === 'ended' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('ended')}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Past ({contests.ended.length})
        </button>
      </div>

      {/* Contest List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : currentContests.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-xl">
          <Trophy className="w-16 h-16 mx-auto text-primary/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No {activeTab} contests</h3>
          <p className="opacity-70">
            {activeTab === 'upcoming'
              ? 'Check back later for new contests!'
              : activeTab === 'live'
              ? 'No contests are currently running'
              : 'No past contests to display'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {currentContests.map((contest) => (
            <ContestCard
              key={contest._id}
              contest={contest}
              status={activeTab}
              onRegister={handleRegister}
              formatDate={formatDate}
              formatDuration={formatDuration}
              getTimeUntil={getTimeUntil}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ContestCard = ({ contest, status, onRegister, formatDate, formatDuration, getTimeUntil }) => {
  const typeColors = {
    weekly: 'badge-primary',
    biweekly: 'badge-secondary',
    special: 'badge-accent',
    practice: 'badge-ghost'
  };

  return (
    <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
      <div className="card-body">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Contest Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${typeColors[contest.type] || 'badge-ghost'} badge-sm`}>
                {contest.type}
              </span>
              {status === 'live' && (
                <span className="badge badge-error badge-sm animate-pulse">LIVE</span>
              )}
              {contest.isRegistered && (
                <span className="badge badge-success badge-sm">Registered</span>
              )}
            </div>

            <h2 className="card-title text-xl mb-2">
              {contest.title}
            </h2>

            <p className="text-sm opacity-70 line-clamp-2 mb-3">
              {contest.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1 opacity-70">
                <Calendar className="w-4 h-4" />
                {formatDate(contest.startTime)}
              </div>
              <div className="flex items-center gap-1 opacity-70">
                <Clock className="w-4 h-4" />
                {formatDuration(contest.duration)}
              </div>
              <div className="flex items-center gap-1 opacity-70">
                <Code className="w-4 h-4" />
                {contest.problems?.length || 0} Problems
              </div>
              <div className="flex items-center gap-1 opacity-70">
                <Users className="w-4 h-4" />
                {contest.participantCount || 0} Registered
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 min-w-[140px]">
            {status === 'upcoming' && (
              <>
                <div className="text-center mb-2">
                  <div className="text-xs opacity-50">Starts in</div>
                  <div className="text-lg font-bold text-primary">
                    {getTimeUntil(contest.startTime)}
                  </div>
                </div>
                {contest.isRegistered ? (
                  <Link
                    to={`/contest/${contest._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Details
                  </Link>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onRegister(contest._id)}
                  >
                    Register
                  </button>
                )}
              </>
            )}

            {status === 'live' && (
              <Link
                to={`/contest/${contest._id}`}
                className="btn btn-success btn-sm"
              >
                <Play className="w-4 h-4" />
                {contest.isRegistered ? 'Continue' : 'Join Now'}
              </Link>
            )}

            {status === 'ended' && (
              <>
                <Link
                  to={`/contest/${contest._id}`}
                  className="btn btn-ghost btn-sm"
                >
                  View Problems
                </Link>
                <Link
                  to={`/contest/${contest._id}/leaderboard`}
                  className="btn btn-outline btn-sm"
                >
                  <Medal className="w-4 h-4" />
                  Leaderboard
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Prizes (if any) */}
        {contest.prizes && contest.prizes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-base-300">
            <div className="text-sm font-semibold mb-2">Prizes:</div>
            <div className="flex gap-2 flex-wrap">
              {contest.prizes.slice(0, 3).map((prize, idx) => (
                <div key={idx} className="badge badge-outline">
                  #{prize.rank}: {prize.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestsPage;
