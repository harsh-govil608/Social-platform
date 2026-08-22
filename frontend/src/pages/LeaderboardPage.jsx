import { useEffect, useState } from 'react';
import { Trophy, Star, Target, Users, TrendingUp, Medal, Crown } from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import useAuthUser from '../hooks/useAuthUser';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('xp'); // xp, level, achievements, problemsSolved
  const [timeframe, setTimeframe] = useState('all'); // all, week, month
  const { authUser } = useAuthUser();

  useEffect(() => {
    fetchLeaderboard();
  }, [category, timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/gamification/leaderboard', {
        params: { category, timeframe }
      });
      setLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getUserRank = () => {
    return leaderboard.findIndex(entry => entry.user?._id === authUser?._id) + 1;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-warning" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getCategoryLabel = () => {
    const labels = {
      xp: 'Total XP',
      level: 'Level',
      achievements: 'Achievements',
      problemsSolved: 'Problems Solved',
      referrals: 'Referrals'
    };
    return labels[category] || 'XP';
  };

  const getCategoryValue = (entry) => {
    switch (category) {
      case 'xp':
        return entry.xp?.toLocaleString() || 0;
      case 'level':
        return entry.level || 0;
      case 'achievements':
        return entry.achievementsCount || 0;
      case 'problemsSolved':
        return entry.problemsSolved || 0;
      case 'referrals':
        return entry.referralsCount || 0;
      default:
        return 0;
    }
  };

  const userRank = getUserRank();

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-primary" />
            Leaderboard
          </h1>
          <p className="text-base-content/70">
            Compete with learners worldwide and climb the ranks!
          </p>
        </div>

        {/* User's Rank Card */}
        {userRank > 0 && (
          <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-xl mb-6">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="avatar">
                    <div className="w-16 rounded-full ring ring-primary-content ring-offset-base-100 ring-offset-2">
                      <img src={authUser?.profilePic || '/avatar.png'} alt="Profile" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Your Rank</h3>
                    <p className="text-primary-content/80">
                      {authUser?.fullName}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold">#{userRank}</div>
                  <div className="text-sm text-primary-content/80">{getCategoryLabel()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Category Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              className="select select-bordered w-full max-w-xs"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="xp">Total XP</option>
              <option value="level">Level</option>
              <option value="achievements">Achievements</option>
              <option value="problemsSolved">Problems Solved</option>
              <option value="referrals">Referrals</option>
            </select>
          </div>

          {/* Timeframe Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Timeframe</span>
            </label>
            <div className="join">
              <button
                className={`btn btn-sm join-item ${timeframe === 'all' ? 'btn-active' : ''}`}
                onClick={() => setTimeframe('all')}
              >
                All Time
              </button>
              <button
                className={`btn btn-sm join-item ${timeframe === 'month' ? 'btn-active' : ''}`}
                onClick={() => setTimeframe('month')}
              >
                This Month
              </button>
              <button
                className={`btn btn-sm join-item ${timeframe === 'week' ? 'btn-active' : ''}`}
                onClick={() => setTimeframe('week')}
              >
                This Week
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto text-base-content/40 mb-4" />
                <p className="text-xl text-base-content/60">No rankings yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>User</th>
                      <th>{getCategoryLabel()}</th>
                      <th>Level</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => {
                      const rank = index + 1;
                      const isCurrentUser = entry.user?._id === authUser?._id;

                      return (
                        <tr key={entry._id} className={isCurrentUser ? 'bg-primary/10' : ''}>
                          <td>
                            <div className="flex items-center gap-2">
                              {getRankIcon(rank) || (
                                <span className="font-bold text-lg">#{rank}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="avatar">
                                <div className="mask mask-squircle w-12 h-12">
                                  <img
                                    src={entry.user?.profilePic || '/avatar.png'}
                                    alt={entry.user?.fullName}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="font-bold">{entry.user?.fullName}</div>
                                <div className="text-sm opacity-50">@{entry.user?.username}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-lg badge-primary">
                              {getCategoryValue(entry)}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <Star className="w-5 h-5 text-warning" />
                              <span className="font-semibold">{entry.level || 1}</span>
                            </div>
                          </td>
                          <td>
                            {entry.trend === 'up' ? (
                              <div className="flex items-center gap-1 text-success">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm">+{entry.change || 0}</span>
                              </div>
                            ) : entry.trend === 'down' ? (
                              <div className="flex items-center gap-1 text-error">
                                <TrendingUp className="w-4 h-4 rotate-180" />
                                <span className="text-sm">-{entry.change || 0}</span>
                              </div>
                            ) : (
                              <span className="text-base-content/40">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Top 3 Podium (Mobile Friendly) */}
        {!loading && leaderboard.length >= 3 && (
          <div className="mt-8 hidden md:block">
            <div className="flex justify-center items-end gap-4">
              {/* 2nd Place */}
              {leaderboard[1] && (
                <div className="flex flex-col items-center">
                  <Medal className="w-8 h-8 text-gray-400 mb-2" />
                  <div className="avatar">
                    <div className="w-20 rounded-full ring ring-gray-400">
                      <img src={leaderboard[1].user?.profilePic || '/avatar.png'} alt="2nd" />
                    </div>
                  </div>
                  <div className="bg-base-100 rounded-lg p-4 mt-2 text-center h-32">
                    <p className="font-bold">{leaderboard[1].user?.fullName}</p>
                    <p className="text-2xl font-bold text-gray-400">#2</p>
                    <p className="text-sm">{getCategoryValue(leaderboard[1])}</p>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {leaderboard[0] && (
                <div className="flex flex-col items-center">
                  <Crown className="w-10 h-10 text-warning mb-2" />
                  <div className="avatar">
                    <div className="w-24 rounded-full ring ring-warning ring-offset-4">
                      <img src={leaderboard[0].user?.profilePic || '/avatar.png'} alt="1st" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-warning to-warning/70 rounded-lg p-4 mt-2 text-center h-40">
                    <p className="font-bold text-warning-content">{leaderboard[0].user?.fullName}</p>
                    <p className="text-3xl font-bold text-warning-content">#1</p>
                    <p className="text-sm text-warning-content">{getCategoryValue(leaderboard[0])}</p>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {leaderboard[2] && (
                <div className="flex flex-col items-center">
                  <Medal className="w-8 h-8 text-amber-600 mb-2" />
                  <div className="avatar">
                    <div className="w-20 rounded-full ring ring-amber-600">
                      <img src={leaderboard[2].user?.profilePic || '/avatar.png'} alt="3rd" />
                    </div>
                  </div>
                  <div className="bg-base-100 rounded-lg p-4 mt-2 text-center h-32">
                    <p className="font-bold">{leaderboard[2].user?.fullName}</p>
                    <p className="text-2xl font-bold text-amber-600">#3</p>
                    <p className="text-sm">{getCategoryValue(leaderboard[2])}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
