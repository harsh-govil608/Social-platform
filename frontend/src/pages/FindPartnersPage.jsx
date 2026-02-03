import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Globe,
  Clock,
  MessageCircle,
  UserPlus,
  Settings,
  Loader2,
  Star,
  MapPin,
  Languages
} from 'lucide-react';
import { Link } from 'react-router';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const FindPartnersPage = () => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    nativeLanguage: '',
    learningLanguage: '',
    proficiency: ''
  });

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/matching/partners?limit=30');
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPreferences = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/matching/preferences');
      setPreferences(response.data.preferences);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    fetchPreferences();
  }, [fetchMatches, fetchPreferences]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchFilters.nativeLanguage) params.append('nativeLanguage', searchFilters.nativeLanguage);
      if (searchFilters.learningLanguage) params.append('learningLanguage', searchFilters.learningLanguage);
      if (searchFilters.proficiency) params.append('proficiency', searchFilters.proficiency);

      const response = await axiosInstance.get(`/matching/search?${params.toString()}`);
      setMatches(response.data.partners?.map(p => ({
        candidate: p,
        score: 0, // Search results don't have scores
        quality: { label: 'Match', color: 'neutral' }
      })) || []);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (partnerId) => {
    try {
      await axiosInstance.post(`/users/friend-request/${partnerId}`);
      toast.success('Partner request sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-info';
    if (score >= 40) return 'text-warning';
    return 'text-base-content/70';
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-primary" />
            Find Language Partners
          </h1>
          <p className="opacity-70">
            Connect with people learning your language who speak the language you're learning
          </p>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => setShowPreferences(!showPreferences)}
        >
          <Settings className="w-5 h-5" />
          Preferences
        </button>
      </div>

      {/* Search Filters */}
      <div className="card bg-base-200 mb-6">
        <div className="card-body">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="form-control flex-1 min-w-[200px]">
              <label className="label">
                <span className="label-text">Their Native Language</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="e.g., Spanish"
                value={searchFilters.nativeLanguage}
                onChange={(e) => setSearchFilters({
                  ...searchFilters,
                  nativeLanguage: e.target.value
                })}
              />
            </div>
            <div className="form-control flex-1 min-w-[200px]">
              <label className="label">
                <span className="label-text">They're Learning</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="e.g., English"
                value={searchFilters.learningLanguage}
                onChange={(e) => setSearchFilters({
                  ...searchFilters,
                  learningLanguage: e.target.value
                })}
              />
            </div>
            <div className="form-control flex-1 min-w-[200px]">
              <label className="label">
                <span className="label-text">Proficiency Level</span>
              </label>
              <select
                className="select select-bordered"
                value={searchFilters.proficiency}
                onChange={(e) => setSearchFilters({
                  ...searchFilters,
                  proficiency: e.target.value
                })}
              >
                <option value="">Any level</option>
                <option value="beginner">Beginner</option>
                <option value="elementary">Elementary</option>
                <option value="intermediate">Intermediate</option>
                <option value="upper_intermediate">Upper Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="native">Native</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleSearch}>
              <Search className="w-4 h-4" />
              Search
            </button>
            <button className="btn btn-ghost" onClick={fetchMatches}>
              Show Recommendations
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Panel */}
      {showPreferences && preferences && (
        <PreferencesPanel
          preferences={preferences}
          onClose={() => setShowPreferences(false)}
          onUpdate={() => {
            fetchPreferences();
            fetchMatches();
          }}
        />
      )}

      {/* Partner Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-xl">
          <Users className="w-16 h-16 mx-auto text-primary/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No matches found</h3>
          <p className="opacity-70 mb-4">
            Try adjusting your search filters or update your profile with more details.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <PartnerCard
              key={match.candidate._id}
              match={match}
              onSendRequest={handleSendRequest}
              getScoreColor={getScoreColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Partner Card Component
const PartnerCard = ({ match, onSendRequest, getScoreColor }) => {
  const { candidate, score, quality, breakdown } = match;

  return (
    <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-all">
      <div className="card-body">
        {/* Header with score */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={candidate.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.fullName)}`}
                  alt={candidate.fullName}
                />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg">{candidate.fullName}</h3>
              {candidate.location && (
                <div className="flex items-center gap-1 text-xs opacity-70">
                  <MapPin className="w-3 h-3" />
                  {candidate.location}
                </div>
              )}
            </div>
          </div>
          {score > 0 && (
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                {score}%
              </div>
              <span className={`badge badge-${quality.color} badge-sm`}>
                {quality.label}
              </span>
            </div>
          )}
        </div>

        {/* Languages */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-success" />
            <span className="text-sm">
              Speaks <strong>{candidate.nativeLanguage}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-info" />
            <span className="text-sm">
              Learning <strong>{candidate.learningLanguage}</strong>
              {candidate.languageProficiency && (
                <span className="badge badge-ghost badge-xs ml-2">
                  {candidate.languageProficiency.replace('_', ' ')}
                </span>
              )}
            </span>
          </div>
          {candidate.timezone && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-sm opacity-70">{candidate.timezone}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {candidate.bio && (
          <p className="text-sm opacity-70 mt-3 line-clamp-2">{candidate.bio}</p>
        )}

        {/* Interests */}
        {candidate.interests && candidate.interests.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {candidate.interests.slice(0, 4).map((interest, idx) => (
              <span key={idx} className="badge badge-outline badge-sm">
                {interest}
              </span>
            ))}
            {candidate.interests.length > 4 && (
              <span className="badge badge-ghost badge-sm">
                +{candidate.interests.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Match Breakdown */}
        {breakdown && score > 0 && (
          <div className="mt-3 pt-3 border-t border-base-300">
            <div className="text-xs opacity-50 mb-2">Why you match:</div>
            <div className="flex flex-wrap gap-1">
              {breakdown.languageExchange > 20 && (
                <span className="badge badge-success badge-xs">Language Exchange</span>
              )}
              {breakdown.interestsOverlap > 10 && (
                <span className="badge badge-info badge-xs">Shared Interests</span>
              )}
              {breakdown.timezoneCompatibility > 10 && (
                <span className="badge badge-warning badge-xs">Good Timezone</span>
              )}
            </div>
          </div>
        )}

        {/* Online Status */}
        <div className="flex items-center gap-2 mt-3">
          <span className={`w-2 h-2 rounded-full ${candidate.isOnline ? 'bg-success' : 'bg-base-content/30'}`} />
          <span className="text-xs opacity-70">
            {candidate.isOnline ? 'Online now' : 'Offline'}
          </span>
        </div>

        {/* Actions */}
        <div className="card-actions justify-end mt-4">
          <Link
            to={`/profile/${candidate._id}`}
            className="btn btn-ghost btn-sm"
          >
            View Profile
          </Link>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onSendRequest(candidate._id)}
          >
            <UserPlus className="w-4 h-4" />
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

// Preferences Panel Component
const PreferencesPanel = ({ preferences, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    timezone: preferences.timezone || '',
    languageProficiency: preferences.languageProficiency || 'beginner',
    learningGoals: preferences.learningGoals || [],
    availability: preferences.availability || []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.post('/matching/preferences', formData);
      toast.success('Preferences updated!');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const addGoal = () => {
    if (goalInput.trim() && !formData.learningGoals.includes(goalInput.trim())) {
      setFormData({
        ...formData,
        learningGoals: [...formData.learningGoals, goalInput.trim()]
      });
      setGoalInput('');
    }
  };

  const removeGoal = (goal) => {
    setFormData({
      ...formData,
      learningGoals: formData.learningGoals.filter(g => g !== goal)
    });
  };

  return (
    <div className="card bg-base-200 mb-6">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Matching Preferences</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Your Timezone</span>
            </label>
            <select
              className="select select-bordered"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            >
              <option value="">Select timezone</option>
              <option value="UTC-8">PST (UTC-8)</option>
              <option value="UTC-5">EST (UTC-5)</option>
              <option value="UTC+0">GMT (UTC+0)</option>
              <option value="UTC+1">CET (UTC+1)</option>
              <option value="UTC+5:30">IST (UTC+5:30)</option>
              <option value="UTC+8">CST China (UTC+8)</option>
              <option value="UTC+9">JST (UTC+9)</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Your Proficiency Level</span>
            </label>
            <select
              className="select select-bordered"
              value={formData.languageProficiency}
              onChange={(e) => setFormData({ ...formData, languageProficiency: e.target.value })}
            >
              <option value="beginner">Beginner</option>
              <option value="elementary">Elementary</option>
              <option value="intermediate">Intermediate</option>
              <option value="upper_intermediate">Upper Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="native">Native</option>
            </select>
          </div>
        </div>

        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Learning Goals</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="Add a learning goal..."
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
            />
            <button className="btn btn-primary" onClick={addGoal}>Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.learningGoals.map((goal, idx) => (
              <span key={idx} className="badge badge-lg gap-1">
                {goal}
                <button onClick={() => removeGoal(goal)} className="ml-1">×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="card-actions justify-end mt-4">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindPartnersPage;
