import { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Shield,
  Settings,
  BarChart3,
  FileText,
  Award,
  AlertTriangle
} from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data } = await axiosInstance.get('/admin/dashboard/stats');
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-base-content/70">
          Manage your platform, users, and revenue
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Total Users"
          value={stats?.totalUsers || 0}
          change="+12.5%"
          color="primary"
        />
        <StatCard
          icon={<DollarSign className="w-8 h-8" />}
          title="Monthly Revenue"
          value={`$${stats?.monthlyRevenue || 0}`}
          change="+23.1%"
          color="success"
        />
        <StatCard
          icon={<Activity className="w-8 h-8" />}
          title="Active Sessions"
          value={stats?.activeSessions || 0}
          change="+5.4%"
          color="info"
        />
        <StatCard
          icon={<AlertTriangle className="w-8 h-8" />}
          title="Reported Issues"
          value={stats?.reportedIssues || 0}
          change="-8.2%"
          color="warning"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <a
          className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Overview
        </a>
        <a
          className={`tab ${activeTab === 'users' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users className="w-4 h-4 mr-2" />
          Users
        </a>
        <a
          className={`tab ${activeTab === 'revenue' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Revenue
        </a>
        <a
          className={`tab ${activeTab === 'content' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          <FileText className="w-4 h-4 mr-2" />
          Content
        </a>
        <a
          className={`tab ${activeTab === 'settings' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </a>
      </div>

      {/* Content Area */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'revenue' && <RevenueTab />}
          {activeTab === 'content' && <ContentTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, change, color }) => (
  <div className="card bg-base-100 shadow-lg">
    <div className="card-body">
      <div className="flex items-center justify-between">
        <div className={`text-${color}`}>{icon}</div>
        <div className={`badge badge-${color} badge-sm`}>{change}</div>
      </div>
      <h3 className="text-2xl font-bold mt-4">{value}</h3>
      <p className="text-base-content/70">{title}</p>
    </div>
  </div>
);

const OverviewTab = ({ stats }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Platform Overview</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {stats?.recentActivity?.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
              <Activity className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium">{activity.type}</p>
                <p className="text-sm text-base-content/70">{activity.time}</p>
              </div>
            </div>
          )) || <p className="text-base-content/70">No recent activity</p>}
        </div>
      </div>

      {/* Top Performers */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
        <div className="space-y-3">
          {stats?.topPerformers?.map((user, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
              <Award className="w-5 h-5 text-warning" />
              <div className="flex-1">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-base-content/70">{user.points} points</p>
              </div>
            </div>
          )) || <p className="text-base-content/70">No data available</p>}
        </div>
      </div>
    </div>
  </div>
);

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axiosInstance.get('/admin/users');
      setUsers(data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await axiosInstance.patch(`/admin/users/${userId}/status`, {
        isActive: !currentStatus
      });
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  if (loading) {
    return <span className="loading loading-spinner"></span>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full">
                        <img src={user.profilePic || '/avatar-placeholder.png'} alt={user.fullName} />
                      </div>
                    </div>
                    <span className="font-medium">{user.fullName}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className="badge badge-primary">{user.subscription || 'Free'}</span>
                </td>
                <td>
                  <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                    {user.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                  >
                    {user.isActive ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RevenueTab = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Revenue Analytics</h2>
    <p className="text-base-content/70">Revenue charts and subscription analytics will be displayed here.</p>
  </div>
);

const ContentTab = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Content Moderation</h2>
    <p className="text-base-content/70">Content moderation tools and reported posts will be displayed here.</p>
  </div>
);

const SettingsTab = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Platform Settings</h2>
    <p className="text-base-content/70">Global platform settings and configurations will be displayed here.</p>
  </div>
);

export default AdminDashboardPage;
