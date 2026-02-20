import { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Trophy,
  Loader2,
  PartyPopper,
  Target
} from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const VocabularyReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [todaySession, setTodaySession] = useState(null);
  const [isDoneForToday, setIsDoneForToday] = useState(false);
  const [hasNoWords, setHasNoWords] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Quality rating descriptions for SM-2
  const qualityRatings = [
    { value: 0, label: "Forgot", color: "btn-error", emoji: "❌" },
    { value: 1, label: "Hard", color: "btn-warning", emoji: "😰" },
    { value: 2, label: "Medium", color: "btn-warning", emoji: "🤔" },
    { value: 3, label: "Good", color: "btn-info", emoji: "👍" },
    { value: 4, label: "Easy", color: "btn-success", emoji: "😊" },
    { value: 5, label: "Perfect", color: "btn-primary", emoji: "🌟" },
  ];

  const fetchTodaySession = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/vocabulary/today-session');
      setTodaySession(response.data.session);
      return response.data.session;
    } catch (error) {
      console.error('Error fetching today session:', error);
    }
  }, []);

  const fetchDueReviews = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/vocabulary/due-reviews-limited');

      const reviewData = response.data.reviews || [];
      const sessionData = response.data.session;
      setReviews(reviewData);
      setIsDoneForToday(response.data.isDoneForToday);
      setCurrentIndex(0);
      setIsFlipped(false);

      // Check if user has no words at all (0 reviews and 0 completed today)
      if (reviewData.length === 0 && (!sessionData || sessionData.reviewsCompleted === 0) && !response.data.isDoneForToday) {
        // Double-check by fetching total word count
        try {
          const vocabRes = await axiosInstance.get('/vocabulary?limit=1');
          if (!vocabRes.data.words || vocabRes.data.words.length === 0) {
            setHasNoWords(true);
          }
        } catch {
          setHasNoWords(true);
        }
      } else {
        setHasNoWords(false);
      }

      if (response.data.isDoneForToday && response.data.message) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching due reviews:', error);
      toast.error('Failed to load reviews');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchTodaySession();
      await fetchDueReviews();
      setIsLoading(false);
    };
    loadData();
  }, [fetchDueReviews, fetchTodaySession]);

  const submitReview = async (quality) => {
    const currentReview = reviews[currentIndex];
    if (!currentReview) return;

    try {
      const response = await axiosInstance.post(
        `/vocabulary/review-limited/${currentReview._id}`,
        { quality }
      );

      // Update session from response
      if (response.data.session) {
        setTodaySession(prev => ({
          ...prev,
          ...response.data.session
        }));
        setIsDoneForToday(response.data.session.isDoneForToday);
      }

      // Show feedback
      if (quality >= 3) {
        toast.success(response.data.message || 'Correct!', { duration: 1500 });
      } else {
        toast(response.data.message || 'Keep practicing!', {
          icon: '💪',
          duration: 1500
        });
      }

      // Move to next card or finish
      if (currentIndex < reviews.length - 1 && !response.data.session?.isDoneForToday) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        // Session complete - reload
        setTimeout(() => {
          fetchTodaySession();
          fetchDueReviews();
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response?.status === 429) {
        toast.success('🎉 Daily limit reached! Great work!');
        setIsDoneForToday(true);
        fetchTodaySession();
        fetchDueReviews();
      } else {
        toast.error('Failed to submit review');
      }
    }
  };

  const currentCard = reviews[currentIndex];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Seed starter words
  const handleSeedWords = async () => {
    try {
      setIsSeeding(true);
      await axiosInstance.post('/vocabulary/seed-starter');
      toast.success('Starter words added! Let\'s start learning!');
      setHasNoWords(false);
      await fetchDueReviews();
      await fetchTodaySession();
    } catch (error) {
      console.error('Error seeding words:', error);
      toast.error(error.response?.data?.message || 'Failed to add starter words');
    } finally {
      setIsSeeding(false);
    }
  };

  // Empty state - user has no vocabulary words at all
  if (hasNoWords) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center space-y-6">
            <div className="flex justify-center">
              <BookOpen size={80} className="text-primary" />
            </div>

            <h2 className="card-title text-3xl justify-center">
              Start Your Vocabulary Journey
            </h2>

            <p className="text-lg text-base-content/70">
              You don't have any vocabulary words yet. Let's get you started with some essential words!
            </p>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">How it works</h3>
              <p className="text-sm text-base-content/70">
                We'll give you 10 beginner words. Review them daily using flashcards.
                The spaced repetition system will help you remember them long-term!
              </p>
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={handleSeedWords}
              disabled={isSeeding}
            >
              {isSeeding ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Get Starter Words'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Done for today view
  if (isDoneForToday || reviews.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center space-y-6">
            <div className="flex justify-center">
              <PartyPopper size={80} className="text-primary" />
            </div>

            <h2 className="card-title text-3xl justify-center">
              Great Job! You're Done for Today!
            </h2>

            <p className="text-lg text-base-content/70">
              You've completed your daily vocabulary practice.
            </p>

            {todaySession && (
              <div className="stats shadow w-full">
                <div className="stat">
                  <div className="stat-figure text-primary">
                    <BookOpen size={32} />
                  </div>
                  <div className="stat-title">Reviews Completed</div>
                  <div className="stat-value text-primary">
                    {todaySession.reviewsCompleted}
                  </div>
                  <div className="stat-desc">
                    out of {todaySession.maxReviews} daily limit
                  </div>
                </div>

                <div className="stat">
                  <div className="stat-figure text-success">
                    <Trophy size={32} />
                  </div>
                  <div className="stat-title">Accuracy</div>
                  <div className="stat-value text-success">
                    {todaySession.accuracy}%
                  </div>
                  <div className="stat-desc">
                    {todaySession.correctReviews} correct
                  </div>
                </div>
              </div>
            )}

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">Come back tomorrow!</h3>
              <p className="text-sm">
                Consistency is key. Just 10 minutes a day builds lasting knowledge.
              </p>
            </div>

            <button
              className="btn btn-outline btn-primary"
              onClick={() => window.location.href = '/'}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Progress Header */}
      {todaySession && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Today's Progress: {todaySession.reviewsCompleted} / {todaySession.maxReviews}
            </span>
            <span className="text-sm text-base-content/70">
              {todaySession.remaining?.reviews || 0} remaining
            </span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={todaySession.completionPercentage}
            max="100"
          />
          {todaySession.accuracy > 0 && (
            <div className="text-sm text-center mt-2 text-base-content/70">
              Accuracy: {todaySession.accuracy}%
            </div>
          )}
        </div>
      )}

      {/* Flashcard */}
      <div className="card bg-base-100 shadow-2xl min-h-[400px]">
        <div className="card-body flex flex-col justify-between">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div className="badge badge-primary">
              {currentIndex + 1} / {reviews.length}
            </div>
            <Brain className="w-6 h-6 text-primary" />
          </div>

          {/* Card Content */}
          <div
            className="flex-1 flex items-center justify-center cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="text-center space-y-4">
              {!isFlipped ? (
                <>
                  <div className="text-4xl font-bold">
                    {currentCard?.word}
                  </div>
                  {currentCard?.pronunciation && (
                    <div className="text-lg text-base-content/70">
                      /{currentCard.pronunciation}/
                    </div>
                  )}
                  <div className="text-sm text-base-content/60 mt-8">
                    Click to see translation
                  </div>
                </>
              ) : (
                <>
                  <div className="text-3xl text-primary font-semibold">
                    {currentCard?.translation}
                  </div>
                  {currentCard?.exampleSentence && (
                    <div className="text-sm italic text-base-content/70 mt-4 max-w-md">
                      "{currentCard.exampleSentence}"
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Rating Buttons */}
          {isFlipped && (
            <div>
              <div className="text-sm text-center mb-3 text-base-content/70">
                How well did you know it?
              </div>
              <div className="grid grid-cols-3 gap-2">
                {qualityRatings.map((rating) => (
                  <button
                    key={rating.value}
                    onClick={() => submitReview(rating.value)}
                    className={`btn ${rating.color} btn-sm`}
                  >
                    <span className="text-lg mr-1">{rating.emoji}</span>
                    {rating.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isFlipped && (
            <div className="flex justify-between">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={20} />
                Previous
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setCurrentIndex(Math.min(reviews.length - 1, currentIndex + 1))}
                disabled={currentIndex === reviews.length - 1}
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="alert alert-info mt-6">
        <Target className="w-5 h-5" />
        <div>
          <h4 className="font-bold">Daily Vocabulary Practice</h4>
          <p className="text-sm">
            Review up to {todaySession?.maxReviews || 20} words daily.
            Spaced repetition helps build long-term memory!
          </p>
        </div>
      </div>
    </div>
  );
};

export default VocabularyReviewPage;
