import { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  RotateCcw,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
  Target,
  Trophy,
  Calendar,
  Loader2
} from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const VocabularyReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [mode, setMode] = useState('review'); // 'review' | 'add' | 'list'
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  // Quality rating descriptions for SM-2
  const qualityRatings = [
    { value: 0, label: "Blackout", color: "btn-error", desc: "Complete memory failure" },
    { value: 1, label: "Wrong", color: "btn-warning", desc: "Incorrect, but recognized answer" },
    { value: 2, label: "Hard", color: "btn-warning", desc: "Incorrect, seemed easy after" },
    { value: 3, label: "Good", color: "btn-info", desc: "Correct with difficulty" },
    { value: 4, label: "Easy", color: "btn-success", desc: "Correct with hesitation" },
    { value: 5, label: "Perfect", color: "btn-primary", desc: "Instant recall" },
  ];

  const fetchDueReviews = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/vocabulary/due-reviews?limit=50');
      setReviews(response.data.reviews || []);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Error fetching due reviews:', error);
      toast.error('Failed to load reviews');
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/vocabulary/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchDueReviews(), fetchStats()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchDueReviews, fetchStats]);

  const submitReview = async (quality) => {
    const currentReview = reviews[currentIndex];
    if (!currentReview) return;

    try {
      await axiosInstance.post(`/vocabulary/review/${currentReview._id}`, { quality });

      // Update session stats
      if (quality >= 3) {
        setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
        toast.success('Correct!', { duration: 1000 });
      } else {
        setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
        toast('Keep practicing!', { icon: '📚', duration: 1000 });
      }

      // Move to next card
      if (currentIndex < reviews.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        // Session complete
        toast.success('Review session complete!');
        fetchDueReviews();
        fetchStats();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const currentCard = reviews[currentIndex];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-7 h-7 text-primary" />
            Vocabulary Review
          </h1>
          <p className="text-sm opacity-70">
            Spaced repetition learning system
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={`btn btn-sm ${mode === 'review' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setMode('review')}
          >
            Review
          </button>
          <button
            className={`btn btn-sm ${mode === 'add' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setMode('add')}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
          <button
            className={`btn btn-sm ${mode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setMode('list')}
          >
            <BookOpen className="w-4 h-4" />
            List
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat bg-base-200 rounded-lg p-4">
            <div className="stat-figure text-primary">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="stat-title text-xs">Total Words</div>
            <div className="stat-value text-2xl">{stats.totalWords}</div>
          </div>
          <div className="stat bg-base-200 rounded-lg p-4">
            <div className="stat-figure text-warning">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="stat-title text-xs">Due Now</div>
            <div className="stat-value text-2xl">{stats.dueNow}</div>
          </div>
          <div className="stat bg-base-200 rounded-lg p-4">
            <div className="stat-figure text-success">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="stat-title text-xs">Mastered</div>
            <div className="stat-value text-2xl">{stats.masteredWords}</div>
          </div>
          <div className="stat bg-base-200 rounded-lg p-4">
            <div className="stat-figure text-info">
              <Target className="w-6 h-6" />
            </div>
            <div className="stat-title text-xs">Success Rate</div>
            <div className="stat-value text-2xl">{stats.successRate}%</div>
          </div>
        </div>
      )}

      {mode === 'review' && (
        <>
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-base-200 rounded-xl">
              <Check className="w-16 h-16 mx-auto text-success mb-4" />
              <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
              <p className="opacity-70 mb-4">No words due for review right now.</p>
              <button
                className="btn btn-primary"
                onClick={() => setMode('add')}
              >
                <Plus className="w-4 h-4" />
                Add New Words
              </button>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress: {currentIndex + 1} / {reviews.length}</span>
                  <span className="text-success">{sessionStats.correct} correct</span>
                </div>
                <progress
                  className="progress progress-primary w-full"
                  value={currentIndex}
                  max={reviews.length}
                />
              </div>

              {/* Flashcard */}
              <div
                className={`card bg-base-200 shadow-xl cursor-pointer transition-all duration-300 min-h-[300px] ${
                  isFlipped ? 'bg-primary/10' : ''
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="card-body items-center justify-center text-center">
                  {!isFlipped ? (
                    <>
                      <p className="text-xs opacity-50 mb-2">
                        {currentCard?.sourceLanguage} → {currentCard?.targetLanguage}
                      </p>
                      <h2 className="card-title text-3xl mb-4">{currentCard?.word}</h2>
                      {currentCard?.pronunciation && (
                        <p className="text-sm opacity-70">[{currentCard.pronunciation}]</p>
                      )}
                      <p className="text-sm opacity-50 mt-4">Click to reveal answer</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs opacity-50 mb-2">Translation</p>
                      <h2 className="card-title text-3xl mb-4 text-primary">
                        {currentCard?.translation}
                      </h2>
                      {currentCard?.exampleSentence && (
                        <div className="mt-4 text-sm">
                          <p className="opacity-70">Example:</p>
                          <p className="italic">{currentCard.exampleSentence}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Rating Buttons - Only show when flipped */}
              {isFlipped && (
                <div className="mt-6">
                  <p className="text-sm text-center mb-3 opacity-70">
                    How well did you know this?
                  </p>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {qualityRatings.map((rating) => (
                      <button
                        key={rating.value}
                        className={`btn ${rating.color} btn-sm flex-col h-auto py-2`}
                        onClick={() => submitReview(rating.value)}
                        title={rating.desc}
                      >
                        <span className="text-lg font-bold">{rating.value}</span>
                        <span className="text-xs">{rating.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    if (currentIndex > 0) {
                      setCurrentIndex(prev => prev - 1);
                      setIsFlipped(false);
                    }
                  }}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    if (currentIndex < reviews.length - 1) {
                      setCurrentIndex(prev => prev + 1);
                      setIsFlipped(false);
                    }
                  }}
                  disabled={currentIndex === reviews.length - 1}
                >
                  Skip
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </>
      )}

      {mode === 'add' && <AddWordForm onAdd={() => { fetchDueReviews(); fetchStats(); }} />}

      {mode === 'list' && <VocabularyList onUpdate={() => { fetchDueReviews(); fetchStats(); }} />}
    </div>
  );
};

// Add Word Form Component
const AddWordForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    word: '',
    translation: '',
    pronunciation: '',
    exampleSentence: '',
    sourceLanguage: 'English',
    targetLanguage: 'Spanish',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axiosInstance.post('/vocabulary', formData);
      toast.success('Word added successfully!');
      setFormData(prev => ({
        ...prev,
        word: '',
        translation: '',
        pronunciation: '',
        exampleSentence: ''
      }));
      onAdd();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add word');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Add New Word</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Word *</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.word}
                onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                required
                placeholder="e.g., hola"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Translation *</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.translation}
                onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                required
                placeholder="e.g., hello"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Source Language</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.sourceLanguage}
                onChange={(e) => setFormData({ ...formData, sourceLanguage: e.target.value })}
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Japanese</option>
                <option>Chinese</option>
                <option>Korean</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Target Language</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.targetLanguage}
                onChange={(e) => setFormData({ ...formData, targetLanguage: e.target.value })}
              >
                <option>Spanish</option>
                <option>English</option>
                <option>French</option>
                <option>German</option>
                <option>Japanese</option>
                <option>Chinese</option>
                <option>Korean</option>
              </select>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Pronunciation</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.pronunciation}
              onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
              placeholder="e.g., OH-lah"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Example Sentence</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={formData.exampleSentence}
              onChange={(e) => setFormData({ ...formData, exampleSentence: e.target.value })}
              placeholder="e.g., Hola, ¿cómo estás?"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              className="select select-bordered"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="general">General</option>
              <option value="greetings">Greetings</option>
              <option value="food">Food & Drink</option>
              <option value="travel">Travel</option>
              <option value="business">Business</option>
              <option value="academic">Academic</option>
              <option value="slang">Slang & Idioms</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Word
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// Vocabulary List Component
const VocabularyList = ({ onUpdate }) => {
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchWords = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/vocabulary', {
        params: { page, limit: 20, search }
      });
      setWords(response.data.words || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const handleDelete = async (wordId) => {
    if (!confirm('Delete this word?')) return;

    try {
      await axiosInstance.delete(`/vocabulary/${wordId}`);
      toast.success('Word deleted');
      fetchWords();
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete word');
    }
  };

  const handleReset = async (wordId) => {
    try {
      await axiosInstance.post(`/vocabulary/${wordId}/reset`);
      toast.success('Progress reset');
      fetchWords();
      onUpdate();
    } catch (error) {
      toast.error('Failed to reset progress');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="form-control">
        <input
          type="text"
          placeholder="Search words..."
          className="input input-bordered"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : words.length === 0 ? (
        <div className="text-center py-8 opacity-70">
          No vocabulary words found
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Word</th>
                  <th>Translation</th>
                  <th>Mastery</th>
                  <th>Next Review</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {words.map((word) => (
                  <tr key={word._id}>
                    <td className="font-medium">{word.word}</td>
                    <td>{word.translation}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <progress
                          className="progress progress-success w-16"
                          value={word.masteryPercentage}
                          max="100"
                        />
                        <span className="text-xs">{word.masteryPercentage}%</span>
                      </div>
                    </td>
                    <td className="text-xs">
                      {word.isDue ? (
                        <span className="badge badge-warning badge-sm">Due now</span>
                      ) : (
                        `In ${word.daysUntilReview} days`
                      )}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleReset(word._id)}
                          title="Reset progress"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => handleDelete(word._id)}
                          title="Delete"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                className="btn btn-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="btn btn-sm btn-ghost">
                Page {page} of {pagination.pages}
              </span>
              <button
                className="btn btn-sm"
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VocabularyReviewPage;
