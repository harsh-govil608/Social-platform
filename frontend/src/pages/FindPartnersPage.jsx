import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Search, Globe, Clock, MessageCircle, UserPlus, Settings,
  Star, MapPin, Languages, X, Plus, Zap, CheckCircle, Filter,
  ArrowLeftRight, Target, Wifi, WifiOff, ChevronDown, BookOpen
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { LANGUAGES } from '../constants';

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="card bg-base-100 border border-base-300 shadow-sm animate-pulse">
    <div className="card-body p-5">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-full bg-base-300" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-base-300 rounded w-2/3" />
          <div className="h-3 bg-base-300 rounded w-1/3" />
        </div>
        <div className="w-12 h-12 rounded-full bg-base-300" />
      </div>
      <div className="h-8 bg-base-300 rounded-xl mt-4" />
      <div className="flex gap-2 mt-3">
        <div className="h-6 bg-base-300 rounded-full w-16" />
        <div className="h-6 bg-base-300 rounded-full w-20" />
        <div className="h-6 bg-base-300 rounded-full w-14" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-base-300 rounded-lg flex-1" />
        <div className="h-8 bg-base-300 rounded-lg flex-1" />
      </div>
    </div>
  </div>
);

// ─── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#94a3b8';

  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={radius} fill="none" stroke="currentColor" strokeWidth="4"
          className="text-base-300" />
        <circle cx="26" cy="26" r={radius} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <span className="text-xs font-bold relative z-10" style={{ color }}>
        {score > 0 ? `${score}%` : '?'}
      </span>
    </div>
  );
};

// ─── Language Exchange Badge ──────────────────────────────────────────────────
const LanguageExchange = ({ candidate }) => {
  const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  return (
    <div className="flex items-center gap-1.5 bg-base-200 rounded-xl px-3 py-2 text-xs font-medium">
      <span className="badge badge-success badge-xs" />
      <span className="text-base-content/70">Speaks</span>
      <span className="font-bold">{cap(candidate.nativeLanguage)}</span>
      <ArrowLeftRight className="w-3 h-3 text-base-content/40 shrink-0" />
      <span className="text-base-content/70">Learning</span>
      <span className="font-bold">{cap(candidate.learningLanguage)}</span>
      {candidate.languageProficiency && (
        <span className="badge badge-ghost badge-xs ml-1">
          {candidate.languageProficiency.replace('_', ' ')}
        </span>
      )}
    </div>
  );
};

// ─── Partner Card ─────────────────────────────────────────────────────────────
const PartnerCard = ({ match, onSendRequest, sentRequests }) => {
  const { candidate, score = 0, quality, breakdown } = match;
  const navigate = useNavigate();
  const isSent = sentRequests.has(candidate._id);

  const matchTags = [];
  if (breakdown?.languageExchange > 20) matchTags.push({ label: 'Language Exchange', color: 'badge-success' });
  if (breakdown?.interestsOverlap > 10)  matchTags.push({ label: 'Shared Interests',  color: 'badge-info'    });
  if (breakdown?.timezoneCompatibility > 10) matchTags.push({ label: 'Good Timezone', color: 'badge-warning' });

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="card-body p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0 cursor-pointer" onClick={() => navigate(`/profile/${candidate._id}`)}>
            <div className="avatar">
              <div className="w-14 h-14 rounded-full ring-2 ring-base-300 ring-offset-1 ring-offset-base-100">
                <img
                  src={candidate.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.fullName)}&background=random`}
                  alt={candidate.fullName}
                />
              </div>
            </div>
            {candidate.isOnline ? (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-base-100 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-ping absolute" />
              </span>
            ) : (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-base-300 rounded-full border-2 border-base-100" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-base leading-tight cursor-pointer hover:text-primary transition-colors truncate"
              onClick={() => navigate(`/profile/${candidate._id}`)}
            >
              {candidate.fullName}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-xs font-medium ${candidate.isOnline ? 'text-success' : 'text-base-content/40'}`}>
                {candidate.isOnline ? 'Online now' : 'Offline'}
              </span>
              {candidate.location && (
                <>
                  <span className="text-base-content/20">·</span>
                  <span className="text-xs text-base-content/40 flex items-center gap-0.5 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />{candidate.location}
                  </span>
                </>
              )}
            </div>
          </div>

          {score > 0 && <ScoreRing score={score} />}
        </div>

        {/* Language Exchange */}
        <LanguageExchange candidate={candidate} />

        {/* Bio */}
        {candidate.bio && (
          <p className="text-sm text-base-content/60 line-clamp-2 leading-relaxed">
            {candidate.bio}
          </p>
        )}

        {/* Interests */}
        {candidate.interests?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {candidate.interests.slice(0, 4).map((interest, idx) => (
              <span key={idx} className="badge badge-ghost badge-sm text-xs">{interest}</span>
            ))}
            {candidate.interests.length > 4 && (
              <span className="badge badge-ghost badge-sm text-xs opacity-60">
                +{candidate.interests.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Match Breakdown Tags */}
        {matchTags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1 border-t border-base-200">
            {matchTags.map((tag, i) => (
              <span key={i} className={`badge ${tag.color} badge-xs`}>{tag.label}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <Link
            to={`/profile/${candidate._id}`}
            className="btn btn-ghost btn-sm flex-1 text-xs"
          >
            View Profile
          </Link>
          <button
            className={`btn btn-sm flex-1 text-xs gap-1.5 ${isSent ? 'btn-success btn-outline' : 'btn-primary'}`}
            onClick={() => !isSent && onSendRequest(candidate._id)}
            disabled={isSent}
          >
            {isSent ? (
              <><CheckCircle className="w-3.5 h-3.5" /> Sent</>
            ) : (
              <><UserPlus className="w-3.5 h-3.5" /> Connect</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Preferences Modal ────────────────────────────────────────────────────────
const PreferencesModal = ({ preferences, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    timezone: preferences?.timezone || '',
    languageProficiency: preferences?.languageProficiency || 'beginner',
    learningGoals: preferences?.learningGoals || [],
    availability: preferences?.availability || []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const TIMEZONES = [
    { label: 'PST (UTC-8)', value: 'UTC-8' }, { label: 'MST (UTC-7)', value: 'UTC-7' },
    { label: 'CST (UTC-6)', value: 'UTC-6' }, { label: 'EST (UTC-5)', value: 'UTC-5' },
    { label: 'GMT (UTC+0)', value: 'UTC+0' }, { label: 'CET (UTC+1)', value: 'UTC+1' },
    { label: 'EET (UTC+2)', value: 'UTC+2' }, { label: 'IST (UTC+5:30)', value: 'UTC+5:30' },
    { label: 'CST China (UTC+8)', value: 'UTC+8' }, { label: 'JST (UTC+9)', value: 'UTC+9' },
    { label: 'AEST (UTC+10)', value: 'UTC+10' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.post('/matching/preferences', formData);
      toast.success('Preferences updated!');
      onUpdate();
      onClose();
    } catch {
      toast.error('Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const addGoal = () => {
    const g = goalInput.trim();
    if (g && !formData.learningGoals.includes(g)) {
      setFormData(f => ({ ...f, learningGoals: [...f.learningGoals, g] }));
      setGoalInput('');
    }
  };

  const toggleDay = (day) => {
    setFormData(f => ({
      ...f,
      availability: f.availability.includes(day)
        ? f.availability.filter(d => d !== day)
        : [...f.availability, day]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-base-100 border-b border-base-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="font-bold text-lg">Matching Preferences</h2>
            <p className="text-xs text-base-content/50">Help us find your ideal language partner</p>
          </div>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Timezone */}
          <div>
            <label className="text-sm font-semibold text-base-content/70 flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" /> Your Timezone
            </label>
            <select
              className="select select-bordered w-full"
              value={formData.timezone}
              onChange={(e) => setFormData(f => ({ ...f, timezone: e.target.value }))}
            >
              <option value="">Select timezone...</option>
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          {/* Proficiency */}
          <div>
            <label className="text-sm font-semibold text-base-content/70 flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4" /> Your Proficiency Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'native'].map(level => (
                <button
                  key={level}
                  className={`btn btn-sm ${formData.languageProficiency === level ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
                  onClick={() => setFormData(f => ({ ...f, languageProficiency: level }))}
                >
                  {level.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="text-sm font-semibold text-base-content/70 flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" /> Available Days
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  className={`btn btn-sm ${formData.availability.includes(day) ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
                  onClick={() => toggleDay(day)}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Goals */}
          <div>
            <label className="text-sm font-semibold text-base-content/70 flex items-center gap-2 mb-2">
              <Target className="w-4 h-4" /> Learning Goals
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input input-bordered flex-1 input-sm"
                placeholder="e.g., Business communication..."
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
              />
              <button className="btn btn-primary btn-sm" onClick={addGoal}>
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.learningGoals.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.learningGoals.map((goal, idx) => (
                  <span key={idx} className="badge badge-lg gap-2 pr-1">
                    {goal}
                    <button
                      className="btn btn-ghost btn-xs btn-circle w-4 h-4 min-h-0"
                      onClick={() => setFormData(f => ({ ...f, learningGoals: f.learningGoals.filter(g => g !== goal) }))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-base-100 border-t border-base-200 px-6 py-4 flex gap-3 rounded-b-2xl">
          <button className="btn btn-ghost flex-1" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary flex-1" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <span className="loading loading-spinner loading-sm" /> : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const FindPartnersPage = () => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequests, setSentRequests] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ nativeLanguage: '', learningLanguage: '', proficiency: '' });
  const searchTimerRef = useRef(null);
  const [stats, setStats] = useState({ total: 0, online: 0, highMatch: 0 });

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/matching/partners?limit=30');
      const data = response.data.matches || [];
      setMatches(data);
      setStats({
        total: data.length,
        online: data.filter(m => m.candidate.isOnline).length,
        highMatch: data.filter(m => m.score >= 70).length
      });
    } catch (error) {
      if (error.response?.status === 400) toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/matching/search?limit=100');
      const data = (response.data.partners || []).map(p => ({
        candidate: p, score: 0, quality: { label: 'Match', color: 'neutral' }
      }));
      setMatches(data);
      setStats({ total: data.length, online: data.filter(m => m.candidate.isOnline).length, highMatch: 0 });
    } catch {
      toast.error('Failed to load all partners');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPreferences = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/matching/preferences');
      setPreferences(response.data.preferences);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchMatches();
    fetchPreferences();
  }, [fetchMatches, fetchPreferences]);

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimerRef.current);

    if (!searchQuery.trim()) {
      fetchMatches();
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/matching/search', {
          params: { query: searchQuery.trim() }
        });
        const data = (response.data.partners || []).map(p => ({
          candidate: p, score: 0, quality: { label: 'Match', color: 'neutral' }
        }));
        setMatches(data);
        setStats({ total: data.length, online: data.filter(m => m.candidate.isOnline).length, highMatch: 0 });
      } catch {
        toast.error('Search failed');
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery, fetchMatches]);

  const handleAdvancedSearch = useCallback(async (overrideFilters) => {
    const active = overrideFilters || filters;
    const hasFilter = active.nativeLanguage || active.learningLanguage || active.proficiency;
    if (!hasFilter) {
      fetchMatches();
      return;
    }
    setIsLoading(true);
    try {
      const params = {};
      if (active.nativeLanguage) params.nativeLanguage = active.nativeLanguage;
      if (active.learningLanguage) params.learningLanguage = active.learningLanguage;
      if (active.proficiency) params.proficiency = active.proficiency;
      const response = await axiosInstance.get('/matching/search', { params });
      const data = (response.data.partners || []).map(p => ({
        candidate: p, score: 0, quality: { label: 'Match', color: 'neutral' }
      }));
      setMatches(data);
      setStats({ total: data.length, online: data.filter(m => m.candidate.isOnline).length, highMatch: 0 });
    } catch {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  }, [filters, fetchMatches]);

  const handleSendRequest = async (partnerId) => {
    try {
      await axiosInstance.post(`/users/friend-request/${partnerId}`);
      setSentRequests(prev => new Set([...prev, partnerId]));
      toast.success('Partner request sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  // Filter + sort displayed matches
  const displayed = matches
    .filter(m => {
      if (activeTab === 'online') return m.candidate.isOnline;
      if (activeTab === 'top') return m.score >= 70;
      return true;
    })
    .sort((a, b) => {
      // Online users first, then by score descending
      if (b.candidate.isOnline !== a.candidate.isOnline) {
        return b.candidate.isOnline ? 1 : -1;
      }
      return (b.score || 0) - (a.score || 0);
    });

  const TABS = [
    { id: 'all',    label: 'All Partners', count: stats.total },
    { id: 'online', label: 'Online Now',   count: stats.online },
    { id: 'top',    label: 'High Match',   count: stats.highMatch },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 border border-base-300">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/20 rounded-xl">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                Find Language Partners
              </h1>
              <p className="text-base-content/60 max-w-md">
                Connect with people who speak your target language and learn yours — perfect language exchange.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              {[
                { value: stats.total,    label: 'Partners',    icon: Users,    color: 'text-primary' },
                { value: stats.online,   label: 'Online Now',  icon: Wifi,     color: 'text-success' },
                { value: stats.highMatch,label: 'High Match',  icon: Star,     color: 'text-warning' },
              ].map(({ value, label, icon: Icon, color }) => (
                <div key={label} className="text-center">
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="flex items-center gap-1 text-xs text-base-content/50">
                    <Icon className="w-3 h-3" />{label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-5 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                className="input input-bordered w-full pl-10 bg-base-100/80"
                placeholder="Search by name, language, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              className={`btn ${showFilters ? 'btn-primary' : 'btn-ghost border border-base-300 bg-base-100/80'} gap-2`}
              onClick={() => setShowFilters(v => !v)}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button
              className="btn btn-ghost border border-base-300 bg-base-100/80 gap-2"
              onClick={() => setShowPreferences(true)}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-base-100/80 backdrop-blur-sm rounded-xl border border-base-300 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-base-content/50 mb-1 block">Their native language</label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={filters.nativeLanguage}
                  onChange={(e) => {
                    const updated = { ...filters, nativeLanguage: e.target.value };
                    setFilters(updated);
                    handleAdvancedSearch(updated);
                  }}
                >
                  <option value="">Any language</option>
                  {LANGUAGES.map(l => (
                    <option key={l.value} value={l.value}>{l.flag} {l.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-base-content/50 mb-1 block">They're learning</label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={filters.learningLanguage}
                  onChange={(e) => {
                    const updated = { ...filters, learningLanguage: e.target.value };
                    setFilters(updated);
                    handleAdvancedSearch(updated);
                  }}
                >
                  <option value="">Any language</option>
                  {LANGUAGES.map(l => (
                    <option key={l.value} value={l.value}>{l.flag} {l.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-base-content/50 mb-1 block">Proficiency level</label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={filters.proficiency}
                  onChange={(e) => {
                    const updated = { ...filters, proficiency: e.target.value };
                    setFilters(updated);
                    handleAdvancedSearch(updated);
                  }}
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
              {(filters.nativeLanguage || filters.learningLanguage || filters.proficiency) && (
                <div className="sm:col-span-3 flex justify-end">
                  <button
                    className="btn btn-ghost btn-xs gap-1"
                    onClick={() => {
                      const cleared = { nativeLanguage: '', learningLanguage: '', proficiency: '' };
                      setFilters(cleared);
                      fetchMatches();
                    }}
                  >
                    <X className="w-3 h-3" /> Clear filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-base-200 rounded-xl mb-6 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`btn btn-sm rounded-lg gap-2 transition-all ${
              activeTab === tab.id ? 'btn-primary shadow-sm' : 'btn-ghost'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className={`badge badge-xs ${activeTab === tab.id ? 'badge-primary-content' : 'badge-ghost'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Partner Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-base-content/20" />
          </div>
          <h3 className="text-lg font-bold mb-2">No partners found</h3>
          <p className="text-base-content/50 max-w-sm mb-6">
            {activeTab === 'online'
              ? 'No one is online right now. Check back soon!'
              : activeTab === 'top'
              ? 'No high-match partners yet. Update your profile for better matches.'
              : 'Try adjusting your search or update your profile with more details.'}
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => { setActiveTab('all'); setSearchQuery(''); fetchAllUsers(); }}>
            Show All Partners
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayed.map((match) => (
              <PartnerCard
                key={match.candidate._id}
                match={match}
                onSendRequest={handleSendRequest}
                sentRequests={sentRequests}
              />
            ))}
          </div>
          <p className="text-center text-xs text-base-content/30 mt-6">
            Showing {displayed.length} partner{displayed.length !== 1 ? 's' : ''}
            {activeTab !== 'all' ? ` · ${TABS.find(t => t.id === activeTab)?.label}` : ''}
          </p>
        </>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <PreferencesModal
          preferences={preferences}
          onClose={() => setShowPreferences(false)}
          onUpdate={() => { fetchPreferences(); fetchMatches(); }}
        />
      )}
    </div>
  );
};

export default FindPartnersPage;
