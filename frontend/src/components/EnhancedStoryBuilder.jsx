import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Clock,
  Star,
  Send,
  Trophy,
  Users,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  Award,
  Target,
  Zap,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  AlertCircle,
  Sparkles,
  PenTool,
  Share2,
  BarChart3,
  ThumbsUp,
  Copy,
  Download
} from 'lucide-react';
import { submitStory, getMyStories, getPublicStories, rateStory, toggleStoryLike, getStoryLeaderboard } from '../lib/storyApi';
import { logActivity } from '../lib/activityApi';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const prompts = {
  easy: [
    "Write about a magical morning",
    "Describe your dream vacation",
    "Tell a story about friendship",
    "Create a fairy tale ending",
    "Write about a secret garden"
  ],
  medium: [
    "A door appears in your room leading to another world",
    "You wake up with a superpower for one day",
    "Write a mystery set in your hometown",
    "Tell the story of an unlikely hero",
    "Describe a world where colors have sounds"
  ],
  advanced: [
    "Write from the perspective of the last tree on Earth",
    "Create a story where time flows backwards",
    "Describe a society where memories can be traded",
    "Tell a story using only dialogue",
    "Write about the first AI to experience emotions"
  ]
};

const EnhancedStoryBuilder = ({ language = 'english', userLevel = 1 }) => {
  const [currentStep, setCurrentStep] = useState('intro');
  const [difficulty, setDifficulty] = useState('easy');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [aiRating, setAiRating] = useState(null);
  const [showReviewSection, setShowReviewSection] = useState(false);
  const [selectedStoryForReview, setSelectedStoryForReview] = useState(null);
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [viewMode, setViewMode] = useState('write'); // write, my-stories, review, leaderboard
  
  const queryClient = useQueryClient();
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  // Fetch user's stories
  const { data: myStoriesData, isLoading: loadingMyStories } = useQuery({
    queryKey: ['myStories'],
    queryFn: () => getMyStories(),
    enabled: viewMode === 'my-stories'
  });

  // Fetch public stories for review
  const { data: publicStoriesData, isLoading: loadingPublicStories } = useQuery({
    queryKey: ['publicStories', language, difficulty],
    queryFn: () => getPublicStories({ language, difficulty }),
    enabled: viewMode === 'review'
  });

  // Fetch leaderboard
  const { data: leaderboardData, isLoading: loadingLeaderboard } = useQuery({
    queryKey: ['storyLeaderboard'],
    queryFn: () => getStoryLeaderboard(),
    enabled: viewMode === 'leaderboard'
  });

  // Submit story mutation
  const { mutate: submitStoryMutation, isPending: submitting } = useMutation({
    mutationFn: submitStory,
    onSuccess: (data) => {
      setAiRating(data.story.aiRating);
      setCurrentStep('result');
      queryClient.invalidateQueries(['myStories']);
      
      // Celebrate with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast.success(`Story submitted! Earned ${data.rewards.xp} XP and ${data.rewards.coins} coins!`);
      
      // Log activity
      logActivity('story_writing', {
        storyId: data.story._id,
        xpEarned: data.rewards.xp,
        coinsEarned: data.rewards.coins
      });
    },
    onError: (error) => {
      toast.error('Failed to submit story');
    }
  });

  // Rate story mutation
  const { mutate: rateStoryMutation, isPending: rating } = useMutation({
    mutationFn: ({ storyId, score, feedback }) => rateStory(storyId, { score, feedback }),
    onSuccess: (data) => {
      toast.success('Rating submitted! Earned 5 XP');
      queryClient.invalidateQueries(['publicStories']);
      setSelectedStoryForReview(null);
      setReviewScore(5);
      setReviewFeedback('');
    },
    onError: () => {
      toast.error('Failed to rate story');
    }
  });

  // Like story mutation
  const { mutate: likeStoryMutation } = useMutation({
    mutationFn: toggleStoryLike,
    onSuccess: () => {
      queryClient.invalidateQueries(['publicStories', 'myStories']);
    }
  });

  // Start timer when writing begins
  useEffect(() => {
    if (currentStep === 'writing' && !startTime) {
      setStartTime(Date.now());
      timerRef.current = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - Date.now()) / 1000));
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStep, startTime]);

  // Update word and character count
  useEffect(() => {
    const words = storyContent.trim().split(/\s+/).filter(w => w.length > 0).length;
    const characters = storyContent.length;
    setWordCount(words);
    setCharacterCount(characters);
  }, [storyContent]);

  // Auto-save draft
  useEffect(() => {
    if (storyContent && currentStep === 'writing') {
      const timer = setTimeout(() => {
        localStorage.setItem('storyDraft', JSON.stringify({
          title: storyTitle,
          content: storyContent,
          prompt: selectedPrompt,
          difficulty
        }));
        toast.success('Draft saved', { duration: 1000 });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [storyContent, storyTitle, selectedPrompt, difficulty, currentStep]);

  const handleStartWriting = () => {
    setCurrentStep('writing');
    setStartTime(Date.now());
    
    // Load draft if exists
    const draft = localStorage.getItem('storyDraft');
    if (draft) {
      const parsed = JSON.parse(draft);
      if (parsed.prompt === selectedPrompt) {
        setStoryTitle(parsed.title);
        setStoryContent(parsed.content);
        toast.success('Draft loaded');
      }
    }
  };

  const handleSubmitStory = () => {
    if (wordCount < 50) {
      toast.error('Please write at least 50 words');
      return;
    }

    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    
    submitStoryMutation({
      title: storyTitle,
      content: storyContent,
      prompts: [selectedPrompt],
      language,
      difficulty,
      challengeType: 'story_builder',
      timeSpent: totalTime
    });
    
    localStorage.removeItem('storyDraft');
  };

  const handleRateStory = (storyId) => {
    rateStoryMutation({
      storyId,
      score: reviewScore,
      feedback: reviewFeedback
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRatingColor = (score) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    if (score >= 4) return 'text-info';
    return 'text-error';
  };

  const renderIntroScreen = () => (
    <div className="text-center space-y-6">
      <div className="inline-block p-4 bg-primary/10 rounded-full">
        <BookOpen className="w-16 h-16 text-primary" />
      </div>
      
      <h2 className="text-3xl font-bold">Story Builder Pro</h2>
      <p className="text-lg opacity-80 max-w-2xl mx-auto">
        Unleash your creativity! Write stories based on prompts and get AI-powered feedback 
        to improve your writing skills.
      </p>

      {/* Difficulty Selection */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="text-xl font-semibold mb-4">Choose Difficulty</h3>
          <div className="grid grid-cols-3 gap-4">
            {['easy', 'medium', 'advanced'].map(level => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`btn btn-lg ${difficulty === level ? 'btn-primary' : 'btn-outline'}`}
              >
                <div className="flex flex-col items-center">
                  <span className="capitalize text-lg">{level}</span>
                  <div className="flex gap-1 mt-1">
                    {level === 'easy' && '⭐'}
                    {level === 'medium' && '⭐⭐'}
                    {level === 'advanced' && '⭐⭐⭐'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prompt Selection */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="text-xl font-semibold mb-4">Select a Writing Prompt</h3>
          <div className="space-y-3">
            {prompts[difficulty].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPrompt(prompt)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedPrompt === prompt 
                    ? 'border-primary bg-primary/10' 
                    : 'border-base-300 hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${selectedPrompt === prompt ? 'text-primary' : 'opacity-50'}`}>
                    {selectedPrompt === prompt ? <Check className="w-5 h-5" /> : <PenTool className="w-5 h-5" />}
                  </div>
                  <p className="flex-1">{prompt}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleStartWriting}
        disabled={!selectedPrompt}
        className="btn btn-primary btn-lg gap-2"
      >
        <PenTool className="w-5 h-5" />
        Start Writing
      </button>
    </div>
  );

  const renderWritingScreen = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Write Your Story</h3>
          <p className="text-sm opacity-70 mt-1">Prompt: {selectedPrompt}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="badge badge-lg gap-2">
            <Clock className="w-4 h-4" />
            {formatTime(Math.floor((Date.now() - startTime) / 1000))}
          </div>
          <div className="badge badge-lg badge-primary">
            {wordCount} words
          </div>
        </div>
      </div>

      {/* Title Input */}
      <input
        type="text"
        placeholder="Enter your story title..."
        className="input input-bordered input-lg w-full"
        value={storyTitle}
        onChange={(e) => setStoryTitle(e.target.value)}
        maxLength={100}
      />

      {/* Writing Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          className="textarea textarea-bordered w-full min-h-[400px] text-lg leading-relaxed"
          placeholder="Start writing your story here..."
          value={storyContent}
          onChange={(e) => setStoryContent(e.target.value)}
        />
        
        {/* Writing Tools */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <div className="tooltip" data-tip="Copy to clipboard">
            <button 
              className="btn btn-circle btn-sm btn-ghost"
              onClick={() => {
                navigator.clipboard.writeText(storyContent);
                toast.success('Copied to clipboard');
              }}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="tooltip" data-tip="Download as text">
            <button 
              className="btn btn-circle btn-sm btn-ghost"
              onClick={() => {
                const blob = new Blob([storyContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${storyTitle || 'story'}.txt`;
                a.click();
              }}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Writing Stats */}
      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-title">Characters</div>
          <div className="stat-value text-primary">{characterCount}</div>
          <div className="stat-desc">Including spaces</div>
        </div>
        <div className="stat">
          <div className="stat-title">Sentences</div>
          <div className="stat-value text-secondary">
            {storyContent.split(/[.!?]+/).filter(s => s.trim()).length}
          </div>
          <div className="stat-desc">Estimated</div>
        </div>
        <div className="stat">
          <div className="stat-title">Reading Time</div>
          <div className="stat-value text-accent">
            {Math.max(1, Math.round(wordCount / 200))} min
          </div>
          <div className="stat-desc">At average speed</div>
        </div>
      </div>

      {/* Writing Tips */}
      <div className="alert alert-info">
        <AlertCircle className="w-5 h-5" />
        <div>
          <h4 className="font-semibold">Writing Tips</h4>
          <ul className="text-sm mt-1 space-y-1">
            <li>• Use descriptive language to paint a picture</li>
            <li>• Include dialogue to bring characters to life</li>
            <li>• Create a clear beginning, middle, and end</li>
            <li>• Show, don't tell - use actions and descriptions</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('intro')}
          className="btn btn-ghost gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={handleSubmitStory}
          disabled={wordCount < 50 || !storyTitle || submitting}
          className="btn btn-primary btn-lg gap-2"
        >
          {submitting ? (
            <>
              <span className="loading loading-spinner"></span>
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Story
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderResultScreen = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-block p-4 bg-success/10 rounded-full mb-4">
          <Trophy className="w-16 h-16 text-success" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Story Submitted!</h2>
        <p className="text-lg opacity-80">Here's your AI-powered feedback</p>
      </div>

      {aiRating && (
        <>
          {/* Overall Score */}
          <div className="card bg-gradient-to-r from-primary/20 to-secondary/20">
            <div className="card-body text-center">
              <h3 className="text-xl font-semibold mb-4">AI Rating</h3>
              <div className="radial-progress text-primary text-4xl" 
                style={{"--value": aiRating.score * 10}} 
                role="progressbar">
                {aiRating.score}/10
              </div>
              <p className="mt-4">{aiRating.feedback}</p>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="text-xl font-semibold mb-4">Detailed Analysis</h3>
              <div className="space-y-3">
                {Object.entries(aiRating.criteria).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="capitalize">{key}</span>
                      <span className={`font-semibold ${getRatingColor(value)}`}>
                        {value}/10
                      </span>
                    </div>
                    <progress 
                      className="progress progress-primary" 
                      value={value} 
                      max="10"
                    ></progress>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Achievements */}
          {aiRating.score >= 8 && (
            <div className="alert alert-success">
              <Award className="w-5 h-5" />
              <div>
                <h4 className="font-semibold">Achievement Unlocked!</h4>
                <p>Excellent writing! You've earned bonus XP for scoring 8+</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => {
            setCurrentStep('intro');
            setStoryContent('');
            setStoryTitle('');
            setSelectedPrompt('');
            setAiRating(null);
          }}
          className="btn btn-primary gap-2"
        >
          <PenTool className="w-5 h-5" />
          Write Another Story
        </button>
        <button
          onClick={() => setViewMode('review')}
          className="btn btn-outline gap-2"
        >
          <Users className="w-5 h-5" />
          Review Others' Stories
        </button>
      </div>
    </div>
  );

  const renderStoryReview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Review Stories</h3>
        <button
          onClick={() => setViewMode('write')}
          className="btn btn-ghost btn-sm gap-2"
        >
          <X className="w-4 h-4" />
          Close
        </button>
      </div>

      {loadingPublicStories ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : publicStoriesData?.stories?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg opacity-70">No stories available for review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {publicStoriesData?.stories?.map(story => (
            <div key={story._id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-semibold">{story.title}</h4>
                    <div className="flex items-center gap-4 text-sm opacity-70 mt-1">
                      <span>By {story.userId?.fullName}</span>
                      <span>•</span>
                      <span>{story.wordCount} words</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {story.averageUserRating.toFixed(1)} ({story.totalUserRatings} ratings)
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => likeStoryMutation(story._id)}
                      className="btn btn-ghost btn-sm gap-1"
                    >
                      <Heart className={`w-4 h-4 ${story.likes?.includes('currentUserId') ? 'fill-current text-error' : ''}`} />
                      {story.likes?.length || 0}
                    </button>
                  </div>
                </div>

                <p className="mt-4 line-clamp-3">{story.content}</p>

                {selectedStoryForReview === story._id ? (
                  <div className="mt-4 p-4 bg-base-200 rounded-lg">
                    <h5 className="font-semibold mb-3">Rate this story</h5>
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={reviewScore}
                        onChange={(e) => setReviewScore(Number(e.target.value))}
                        className="range range-primary flex-1"
                      />
                      <span className="badge badge-lg badge-primary">{reviewScore}/10</span>
                    </div>
                    <textarea
                      placeholder="Share your feedback (optional)..."
                      className="textarea textarea-bordered w-full mb-3"
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      rows="3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRateStory(story._id)}
                        disabled={rating}
                        className="btn btn-primary btn-sm"
                      >
                        {rating ? 'Submitting...' : 'Submit Rating'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStoryForReview(null);
                          setReviewScore(5);
                          setReviewFeedback('');
                        }}
                        className="btn btn-ghost btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card-actions justify-end mt-4">
                    <button
                      onClick={() => setSelectedStoryForReview(story._id)}
                      className="btn btn-primary btn-sm gap-2"
                    >
                      <Star className="w-4 h-4" />
                      Rate Story
                    </button>
                    <button className="btn btn-ghost btn-sm gap-2">
                      <Eye className="w-4 h-4" />
                      Read Full
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Story Leaderboard</h3>
        <button
          onClick={() => setViewMode('write')}
          className="btn btn-ghost btn-sm gap-2"
        >
          <X className="w-4 h-4" />
          Close
        </button>
      </div>

      {loadingLeaderboard ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboardData?.map((story, idx) => (
            <div key={story._id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold">
                    {idx === 0 && '🥇'}
                    {idx === 1 && '🥈'}
                    {idx === 2 && '🥉'}
                    {idx > 2 && `#${idx + 1}`}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold">{story.title}</h4>
                    <p className="text-sm opacity-70">
                      By {story.userId?.fullName} • {story.wordCount} words
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {story.averageUserRating.toFixed(1)}
                    </div>
                    <div className="text-xs opacity-70">User Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">
                      {story.aiRating?.score.toFixed(1)}
                    </div>
                    <div className="text-xs opacity-70">AI Rating</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <button
            className={`tab gap-2 ${viewMode === 'write' ? 'tab-active' : ''}`}
            onClick={() => setViewMode('write')}
          >
            <PenTool className="w-4 h-4" />
            Write
          </button>
          <button
            className={`tab gap-2 ${viewMode === 'my-stories' ? 'tab-active' : ''}`}
            onClick={() => setViewMode('my-stories')}
          >
            <BookOpen className="w-4 h-4" />
            My Stories
          </button>
          <button
            className={`tab gap-2 ${viewMode === 'review' ? 'tab-active' : ''}`}
            onClick={() => setViewMode('review')}
          >
            <Users className="w-4 h-4" />
            Review
          </button>
          <button
            className={`tab gap-2 ${viewMode === 'leaderboard' ? 'tab-active' : ''}`}
            onClick={() => setViewMode('leaderboard')}
          >
            <Trophy className="w-4 h-4" />
            Leaderboard
          </button>
        </div>

        {/* Content */}
        {viewMode === 'write' && (
          <>
            {currentStep === 'intro' && renderIntroScreen()}
            {currentStep === 'writing' && renderWritingScreen()}
            {currentStep === 'result' && renderResultScreen()}
          </>
        )}
        
        {viewMode === 'my-stories' && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">My Stories</h3>
            {loadingMyStories ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : myStoriesData?.stories?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg opacity-70">You haven't written any stories yet</p>
              </div>
            ) : (
              myStoriesData?.stories?.map(story => (
                <div key={story._id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h4 className="text-xl font-semibold">{story.title}</h4>
                    <div className="flex items-center gap-4 text-sm opacity-70">
                      <span>{story.wordCount} words</span>
                      <span>•</span>
                      <span>AI: {story.aiRating?.score}/10</span>
                      <span>•</span>
                      <span>Users: {story.averageUserRating.toFixed(1)}/10</span>
                      <span>•</span>
                      <span>{story.likes?.length || 0} likes</span>
                    </div>
                    <p className="mt-2 line-clamp-3">{story.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {viewMode === 'review' && renderStoryReview()}
        {viewMode === 'leaderboard' && renderLeaderboard()}
      </div>
    </div>
  );
};

export default EnhancedStoryBuilder;