import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  PlayCircleIcon,
  PauseCircleIcon,
  VideoIcon,
  CheckCircleIcon,
  LockIcon,
  StarIcon,
  VolumeIcon,
  CrownIcon,
  SubtitlesIcon,
  SearchIcon
} from "lucide-react";
import toast from "react-hot-toast";
import confetti from 'canvas-confetti';
import { getVideoLibrary, completeVideo } from "../lib/learningApi";

const WatchAndLearn = ({ 
  watchHistory = [],
  onVideoComplete
}) => {
  const queryClient = useQueryClient();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitleLanguage] = useState('both');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [, setShowQuiz] = useState(false);
  const [, setQuizAnswers] = useState({});
  const [, setInteractiveNotes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const videoRef = useRef(null);

  // Fetch videos from MongoDB
  const { data: videosFromDB, isLoading: loadingVideos } = useQuery({
    queryKey: ["learningVideos", selectedCategory],
    queryFn: () => getVideoLibrary(selectedCategory === 'all' ? null : selectedCategory),
    staleTime: 10 * 60 * 1000, // Consider data stale after 10 minutes
  });

  // Mutation to complete video
  const completeVideoMutation = useMutation({
    mutationFn: completeVideo,
    onSuccess: (data) => {
      if (data.xpEarned > 0) {
        toast.success(`Video completed! +${data.xpEarned} XP`);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Invalidate all queries that display XP/progress data
      queryClient.invalidateQueries(["learningVideos"]);
      queryClient.invalidateQueries(["learningProgress"]);
      queryClient.invalidateQueries(["activityDashboard"]);
      queryClient.invalidateQueries(["weeklyStats"]);
      queryClient.invalidateQueries(["monthlyStats"]);
      queryClient.invalidateQueries(["weeklyLeaderboard"]);
      queryClient.invalidateQueries(["achievements"]);
      queryClient.invalidateQueries(["authUser"]); // Update user's total XP

      if (onVideoComplete) {
        onVideoComplete(data);
      }
    },
    onError: () => {
      toast.error("Failed to save video progress");
    }
  });

  // Use videos from MongoDB
  const videos = videosFromDB || [];

  // Live classes will be fetched from backend in the future
  const liveClasses = [];

  // Categories
  const categories = [
    { id: 'all', name: 'All Videos', icon: '🎬' },
    { id: 'daily', name: 'Daily Life', icon: '☀️' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️' },
    { id: 'food', name: 'Food & Dining', icon: '🍽️' },
    { id: 'business', name: 'Business', icon: '💼', premium: false },
    { id: 'news', name: 'News', icon: '📰', premium: false },
    { id: 'culture', name: 'Culture', icon: '🎭', premium: false }
  ];

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
                          (video.title && video.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Video Player Component
  const VideoPlayer = ({ video }) => {
    const [showInteractivePrompt, setShowInteractivePrompt] = useState(false);
    const [currentKeyPhrase, setCurrentKeyPhrase] = useState(null);

    useEffect(() => {
      // Check for interactive elements at current timestamp
      if (video.keyPhrases && isPlaying) {
        const phrase = video.keyPhrases.find(p => 
          Math.abs(p.timestamp - currentTime) < 1
        );
        if (phrase && phrase !== currentKeyPhrase) {
          setCurrentKeyPhrase(phrase);
          setShowInteractivePrompt(true);
          setTimeout(() => setShowInteractivePrompt(false), 5000);
        }
      }

      // Check for quiz questions
      if (video.quiz && isPlaying) {
        const question = video.quiz.find(q => 
          Math.abs(q.timestamp - currentTime) < 1 && !quizAnswers[q.timestamp]
        );
        if (question) {
          setIsPlaying(false);
          setShowQuiz(true);
        }
      }
    }, [currentTime, video]);

    return (
      <div className="relative">
        {/* Video */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            ref={videoRef}
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${video.id.split('-')[1]}?enablejsapi=1`}
            title={video.title}
            style={{ border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Interactive Overlay */}
        {showInteractivePrompt && currentKeyPhrase && (
          <div className="absolute top-4 right-4 card bg-primary text-primary-content shadow-xl animate-pulse">
            <div className="card-body p-4">
              <p className="font-bold">{currentKeyPhrase.phrase}</p>
              <p className="text-sm opacity-90">{currentKeyPhrase.translation}</p>
              <button 
                className="btn btn-sm btn-secondary mt-2"
                onClick={() => {
                  speakText(currentKeyPhrase.phrase, 'es-ES');
                }}
              >
                <VolumeIcon className="w-4 h-4" />
                Listen
              </button>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-4 text-white">
            <button 
              className="btn btn-circle btn-sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <PauseCircleIcon /> : <PlayCircleIcon />}
            </button>
            
            <div className="flex-1">
              <input 
                type="range" 
                min="0" 
                max={duration}
                value={currentTime}
                onChange={(e) => setCurrentTime(Number(e.target.value))}
                className="range range-xs range-primary"
              />
              <div className="flex justify-between text-xs mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Subtitle Toggle */}
            <button 
              className={`btn btn-circle btn-sm ${showSubtitles ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setShowSubtitles(!showSubtitles)}
            >
              <SubtitlesIcon className="w-4 h-4" />
            </button>

            {/* Speed Control */}
            <select 
              className="select select-sm"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
          </div>
        </div>

        {/* Subtitles */}
        {showSubtitles && (
          <div className="absolute bottom-20 left-0 right-0 text-center">
            <div className="inline-block bg-black/80 text-white px-4 py-2 rounded">
              <p className="text-lg">Esta es una frase de ejemplo</p>
              {subtitleLanguage === 'both' && (
                <p className="text-sm opacity-80">This is an example sentence</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper function for text-to-speech
  const speakText = (text, lang = 'es-ES') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle video completion
  const handleVideoComplete = (video) => {
    const earnedXP = video.xp;
    const earnedCoins = video.coins;
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast.success(
      <div>
        <p className="font-bold">Video Complete!</p>
        <p>+{earnedXP} XP | +{earnedCoins} Coins</p>
      </div>,
      { duration: 5000 }
    );

    onVideoComplete?.({
      videoId: video.id,
      xp: earnedXP,
      coins: earnedCoins,
      duration: video.duration
    });
  };

  if (selectedVideo) {
    return (
      <div className="modal modal-open">
        <div className="modal-box max-w-6xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold">{selectedVideo.title}</h3>
              <p className="text-sm opacity-70 mt-1">
                By {typeof selectedVideo.instructor === 'object'
                  ? (selectedVideo.instructor?.name || 'Unknown')
                  : (selectedVideo.instructor || 'Unknown')}
              </p>
            </div>
            <button 
              className="btn btn-sm btn-circle"
              onClick={() => setSelectedVideo(null)}
            >
              ✕
            </button>
          </div>

          <VideoPlayer video={selectedVideo} />

          {/* Video Info Tabs */}
          <div className="tabs tabs-boxed mt-6">
            <a className="tab tab-active">Overview</a>
            <a className="tab">Transcript</a>
            <a className="tab">Notes</a>
            <a className="tab">Quiz</a>
          </div>

          <div className="mt-4">
            <p className="mb-4">{selectedVideo.description}</p>
            
            {/* Key Phrases */}
            {selectedVideo.keyPhrases && (
              <div className="space-y-2">
                <h4 className="font-bold mb-2">Key Phrases in This Video:</h4>
                {selectedVideo.keyPhrases.map((phrase, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-base-200 p-2 rounded">
                    <div>
                      <span className="font-semibold">{phrase.phrase}</span>
                      <span className="mx-2">→</span>
                      <span className="opacity-80">{phrase.translation}</span>
                    </div>
                    <button 
                      className="btn btn-xs btn-ghost"
                      onClick={() => speakText(phrase.phrase, 'es-ES')}
                    >
                      <VolumeIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-action">
              <button 
                className="btn btn-primary"
                onClick={() => handleVideoComplete(selectedVideo)}
              >
                Mark as Complete
              </button>
              <button className="btn" onClick={() => setSelectedVideo(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
        <div className="modal-backdrop" onClick={() => setSelectedVideo(null)} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
          <VideoIcon className="w-10 h-10 text-primary" />
          Watch and Learn
        </h1>
        <p className="text-lg opacity-80">
          Learn through engaging video content with interactive features
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="form-control">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Search videos..."
                    className="input input-bordered w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn btn-square">
                    <SearchIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="text-lg mr-1">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Classes Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          Live Classes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liveClasses.map(liveClass => (
            <div key={liveClass.id} className="card bg-gradient-to-r from-red-500/10 to-orange-500/10 border-2 border-red-500/20">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{liveClass.title}</h3>
                    <p className="text-sm opacity-70">with {liveClass.instructor}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span>📅 {liveClass.time}</span>
                      <span>⏱️ {liveClass.duration}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{liveClass.spots}/{liveClass.maxSpots} spots</div>
                    <progress 
                      className="progress progress-warning w-20" 
                      value={liveClass.spots} 
                      max={liveClass.maxSpots}
                    />
                  </div>
                </div>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-sm btn-primary">
                    Join Live
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map(video => {
          const isLocked = false;
          const isWatched = watchHistory.includes(video.id);

          return (
            <div key={video.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
              <figure className="relative">
                <img 
                  src={video.thumbnailUrl || video.thumbnail || 'https://via.placeholder.com/400x225'} 
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                {isLocked && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <LockIcon className="w-12 h-12 text-white" />
                  </div>
                )}
                {isWatched && (
                  <div className="absolute top-2 left-2">
                    <CheckCircleIcon className="w-6 h-6 text-success" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 badge badge-neutral">
                  {Math.floor((video.duration || 0) / 60)} min
                </div>
              </figure>
              <div className="card-body">
                <h3 className="card-title text-lg">
                  {video.title}
                  {(video.isPremium || video.premium) && <CrownIcon className="w-5 h-5 text-warning" />}
                </h3>
                <p className="text-sm opacity-70">{video.description}</p>
                
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-warning fill-warning" />
                    <span>{typeof video.rating === 'object' ? (video.rating.average || 0).toFixed(1) : (video.rating || 0)}</span>
                  </div>
                  <span>{video.viewCount || video.views || 0} views</span>
                  <span className="font-bold text-primary">+{video.xpReward || video.xp || 0} XP</span>
                </div>

                <div className="text-sm opacity-70 mt-1">
                  By {typeof video.instructor === 'object'
                    ? (video.instructor?.name || 'Unknown')
                    : (video.instructor || 'Unknown')}
                </div>

                <div className="card-actions justify-end mt-4">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <PlayCircleIcon className="w-4 h-4" />
                    Watch Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default WatchAndLearn;