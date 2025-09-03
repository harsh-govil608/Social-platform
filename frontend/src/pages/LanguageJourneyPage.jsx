import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { 
  PlayCircleIcon, 
  BookOpenIcon, 
  TrophyIcon, 
  UsersIcon, 
  SparklesIcon,
  RocketIcon,
  StarIcon,
  CalendarIcon,
  FlameIcon,
  TargetIcon,
  HeadphonesIcon,
  VideoIcon,
  MessageSquareIcon,
  GlobeIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  LockIcon,
  ClockIcon,
  TrendingUpIcon,
  ZapIcon,
  PlusIcon
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { LANGUAGES } from "../constants";
import {
  getLearningProgress,
  completeLesson,
  getDailyChallenges,
  completeDailyChallenge,
  getSuggestedPartners,
  updateLearningPath,
  addVocabularyWord,
  getAchievements,
  recordPracticeSession
} from "../lib/api";
import PronunciationPractice from "../components/PronunciationPractice";
import GrammarExercises from "../components/GrammarExercises";
import DynamicConversation from "../components/DynamicConversation";

const LanguageJourneyPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLevel, setSelectedLevel] = useState("beginner");
  const [playingVideo, setPlayingVideo] = useState(null);
  const [showVocabModal, setShowVocabModal] = useState(false);
  const [newWord, setNewWord] = useState({ word: "", translation: "" });
  const [showPronunciation, setShowPronunciation] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Fetch learning progress
  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ["learningProgress"],
    queryFn: getLearningProgress
  });

  // Fetch daily challenges
  const { data: dailyChallenges = [], refetch: refetchChallenges } = useQuery({
    queryKey: ["dailyChallenges"],
    queryFn: getDailyChallenges
  });

  // Fetch suggested partners
  const { data: suggestedPartners = [] } = useQuery({
    queryKey: ["suggestedPartners"],
    queryFn: getSuggestedPartners
  });

  // Fetch achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements"],
    queryFn: getAchievements
  });

  // Complete lesson mutation
  const { mutate: completeLessonMutation } = useMutation({
    mutationFn: ({ lessonId, xpEarned }) => completeLesson(lessonId, xpEarned),
    onSuccess: (data) => {
      toast.success(`Lesson completed! +${data.xpResult.xpAdded} XP`);
      if (data.xpResult.leveledUp) {
        toast.success(`Level up! You're now level ${data.xpResult.newLevel}!`, {
          duration: 5000,
          icon: "🎉"
        });
      }
      queryClient.invalidateQueries(["learningProgress"]);
      setPlayingVideo(null);
    }
  });

  // Complete challenge mutation
  const { mutate: completeChallengeMutation } = useMutation({
    mutationFn: completeDailyChallenge,
    onSuccess: (data) => {
      toast.success(`Challenge completed! +${data.xpResult.xpAdded} XP`);
      queryClient.invalidateQueries(["learningProgress"]);
      queryClient.invalidateQueries(["dailyChallenges"]);
    }
  });

  // Update learning path mutation
  const { mutate: updatePathMutation } = useMutation({
    mutationFn: updateLearningPath,
    onSuccess: () => {
      toast.success("Learning path updated!");
      queryClient.invalidateQueries(["learningProgress"]);
    }
  });

  // Add vocabulary word mutation
  const { mutate: addVocabMutation } = useMutation({
    mutationFn: ({ word, translation }) => 
      addVocabularyWord(word, translation, authUser?.learningLanguage),
    onSuccess: (data) => {
      toast.success(`Word added! +${data.xpResult.xpAdded} XP`);
      queryClient.invalidateQueries(["learningProgress"]);
      setShowVocabModal(false);
      setNewWord({ word: "", translation: "" });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add word");
    }
  });

  // Sample video lessons data
  const videoLessons = [
    {
      id: "lesson-1",
      title: "Basic Greetings & Introductions",
      thumbnail: "https://img.youtube.com/vi/7xQMz1DgRaU/maxresdefault.jpg",
      duration: "5:30",
      level: "Beginner",
      videoUrl: "https://www.youtube.com/embed/7xQMz1DgRaU",
      description: "Learn essential greetings and how to introduce yourself",
      completed: progress?.completedLessons?.some(l => l.lessonId === "lesson-1"),
      xp: 50
    },
    {
      id: "lesson-2",
      title: "Daily Conversations",
      thumbnail: "https://img.youtube.com/vi/aNdWL7NJ5Cs/maxresdefault.jpg",
      duration: "8:45",
      level: "Beginner",
      videoUrl: "https://www.youtube.com/embed/aNdWL7NJ5Cs",
      description: "Master everyday conversations with native speakers",
      completed: progress?.completedLessons?.some(l => l.lessonId === "lesson-2"),
      xp: 75
    },
    {
      id: "lesson-3",
      title: "Shopping & Directions",
      thumbnail: "https://img.youtube.com/vi/fNMd0R1xFsk/maxresdefault.jpg",
      duration: "10:20",
      level: "Intermediate",
      videoUrl: "https://www.youtube.com/embed/fNMd0R1xFsk",
      description: "Navigate shops and ask for directions confidently",
      completed: progress?.completedLessons?.some(l => l.lessonId === "lesson-3"),
      xp: 100
    },
    {
      id: "lesson-4",
      title: "Business Communication",
      thumbnail: "https://img.youtube.com/vi/cFOm7aURcSU/maxresdefault.jpg",
      duration: "12:15",
      level: "Advanced",
      videoUrl: "https://www.youtube.com/embed/cFOm7aURcSU",
      description: "Professional language for business settings",
      completed: progress?.completedLessons?.some(l => l.lessonId === "lesson-4"),
      locked: progress?.completedLessons?.length < 2,
      xp: 150
    }
  ];

  // Learning paths with real progress
  const learningPaths = [
    {
      name: "Tourist Essentials",
      icon: <GlobeIcon className="w-6 h-6" />,
      progress: progress?.learningPaths?.find(p => p.pathName === "Tourist Essentials")?.progress || 0,
      modules: 8,
      completedModules: progress?.learningPaths?.find(p => p.pathName === "Tourist Essentials")?.completedModules || 0,
      color: "primary"
    },
    {
      name: "Business Professional",
      icon: <TrendingUpIcon className="w-6 h-6" />,
      progress: progress?.learningPaths?.find(p => p.pathName === "Business Professional")?.progress || 0,
      modules: 12,
      completedModules: progress?.learningPaths?.find(p => p.pathName === "Business Professional")?.completedModules || 0,
      color: "secondary"
    },
    {
      name: "Cultural Immersion",
      icon: <SparklesIcon className="w-6 h-6" />,
      progress: progress?.learningPaths?.find(p => p.pathName === "Cultural Immersion")?.progress || 0,
      modules: 10,
      completedModules: progress?.learningPaths?.find(p => p.pathName === "Cultural Immersion")?.completedModules || 0,
      color: "accent"
    }
  ];

  const learningLanguage = LANGUAGES.find(lang => lang.value === authUser?.learningLanguage);

  const handleLessonComplete = (lesson) => {
    if (!lesson.completed) {
      completeLessonMutation({ lessonId: lesson.id, xpEarned: lesson.xp });
    }
  };

  const handleChallengeStart = (challenge) => {
    if (!challenge.completed) {
      // Simulate challenge completion for demo
      setTimeout(() => {
        completeChallengeMutation(challenge.challengeId);
      }, 2000);
      toast.loading("Starting challenge...", { duration: 2000 });
    }
  };

  const handlePathContinue = (path) => {
    // Simulate progress update
    const newProgress = Math.min(path.progress + 10, 100);
    const newCompletedModules = Math.floor((newProgress / 100) * path.modules);
    
    updatePathMutation({
      pathName: path.name,
      progress: newProgress,
      completedModules: newCompletedModules,
      totalModules: path.modules
    });
  };

  const handleAddVocabulary = () => {
    if (newWord.word && newWord.translation) {
      addVocabMutation(newWord);
    }
  };

  // Handle practice session completion
  const handlePronunciationComplete = async (sessionData) => {
    try {
      const result = await recordPracticeSession(
        'pronunciation',
        sessionData.score,
        5, // duration in minutes
        { phrasesCompleted: sessionData.phrasesCompleted }
      );
      
      if (result.xpResult.leveledUp) {
        toast.success(`Level up! You're now level ${result.xpResult.newLevel}!`, {
          duration: 5000,
          icon: "🎉"
        });
      }
      
      queryClient.invalidateQueries(["learningProgress"]);
      setShowPronunciation(false);
    } catch (error) {
      console.error('Error recording pronunciation session:', error);
    }
  };

  const handleGrammarComplete = async (sessionData) => {
    try {
      const result = await recordPracticeSession(
        'grammar',
        sessionData.score,
        5, // duration in minutes
        { 
          correctAnswers: sessionData.correctAnswers,
          totalQuestions: sessionData.totalQuestions,
          accuracy: sessionData.accuracy
        }
      );
      
      if (result.xpResult.leveledUp) {
        toast.success(`Level up! You're now level ${result.xpResult.newLevel}!`, {
          duration: 5000,
          icon: "🎉"
        });
      }
      
      queryClient.invalidateQueries(["learningProgress"]);
      setShowGrammar(false);
    } catch (error) {
      console.error('Error recording grammar session:', error);
    }
  };

  const handleConversationComplete = async (sessionData) => {
    try {
      const result = await recordPracticeSession(
        'conversation',
        sessionData.score,
        10, // duration in minutes
        { 
          topic: sessionData.topic,
          scenariosCompleted: sessionData.scenariosCompleted,
          totalScenarios: sessionData.totalScenarios
        }
      );
      
      if (result.xpResult.leveledUp) {
        toast.success(`Level up! You're now level ${result.xpResult.newLevel}!`, {
          duration: 5000,
          icon: "🎉"
        });
      }
      
      queryClient.invalidateQueries(["learningProgress"]);
      setShowConversation(false);
      setSelectedTopic(null);
    } catch (error) {
      console.error('Error recording conversation session:', error);
    }
  };

  const startConversation = (topic) => {
    setSelectedTopic(topic);
    setShowConversation(true);
  };

  if (loadingProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100">
      {/* Hero Section with Video Background Effect */}
      <div className="relative bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 py-12 px-6">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-4">
                Your <span className="text-primary">Language Journey</span>
              </h1>
              <p className="text-xl opacity-90 mb-6">
                Learning {learningLanguage?.label || "a new language"} with interactive lessons and real conversations
              </p>
              
              {/* Stats Overview */}
              <div className="stats stats-horizontal shadow-xl bg-base-100/90 backdrop-blur">
                <div className="stat">
                  <div className="stat-figure text-primary">
                    <FlameIcon className="w-8 h-8" />
                  </div>
                  <div className="stat-value text-primary">{progress?.currentStreak || 0}</div>
                  <div className="stat-title">Day Streak</div>
                </div>
                <div className="stat">
                  <div className="stat-figure text-secondary">
                    <TrophyIcon className="w-8 h-8" />
                  </div>
                  <div className="stat-value text-secondary">{progress?.totalXP || 0}</div>
                  <div className="stat-title">XP Earned</div>
                </div>
                <div className="stat">
                  <div className="stat-figure text-accent">
                    <StarIcon className="w-8 h-8" />
                  </div>
                  <div className="stat-value text-accent">Level {progress?.currentLevel || 1}</div>
                  <div className="stat-title">Current Level</div>
                </div>
              </div>
            </div>

            {/* Featured Video Card */}
            <div className="card bg-base-100 shadow-2xl w-full lg:w-96">
              <figure className="relative">
                <img 
                  src="https://img.youtube.com/vi/7xQMz1DgRaU/maxresdefault.jpg" 
                  alt="Featured lesson" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button 
                    className="btn btn-circle btn-primary btn-lg"
                    onClick={() => setPlayingVideo(videoLessons[0])}
                  >
                    <PlayCircleIcon className="w-8 h-8" />
                  </button>
                </div>
              </figure>
              <div className="card-body">
                <h2 className="card-title">Today's Featured Lesson</h2>
                <p>Master greetings in {learningLanguage?.label}</p>
                <div className="card-actions justify-end">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setPlayingVideo(videoLessons[0])}
                  >
                    Start Learning
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-base-100 border-b border-base-300">
        <div className="container mx-auto max-w-7xl">
          <div className="tabs tabs-boxed bg-transparent">
            <button 
              className={`tab tab-lg ${activeTab === 'overview' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <RocketIcon className="w-4 h-4 mr-2" />
              Overview
            </button>
            <button 
              className={`tab tab-lg ${activeTab === 'lessons' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('lessons')}
            >
              <VideoIcon className="w-4 h-4 mr-2" />
              Video Lessons
            </button>
            <button 
              className={`tab tab-lg ${activeTab === 'practice' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('practice')}
            >
              <MessageSquareIcon className="w-4 h-4 mr-2" />
              Practice
            </button>
            <button 
              className={`tab tab-lg ${activeTab === 'partners' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('partners')}
            >
              <UsersIcon className="w-4 h-4 mr-2" />
              Partners
            </button>
            <button 
              className={`tab tab-lg ${activeTab === 'progress' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              <TrophyIcon className="w-4 h-4 mr-2" />
              Progress
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Daily Challenges */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <ZapIcon className="w-6 h-6 mr-2 text-primary" />
                Daily Challenges
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dailyChallenges.map(challenge => (
                  <div key={challenge.challengeId} className={`card ${challenge.completed ? 'bg-success/10 border-success' : 'bg-base-100'} shadow-lg border`}>
                    <div className="card-body">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold">{challenge.title}</h3>
                          <p className="text-sm opacity-70 mt-2">Complete to earn XP</p>
                        </div>
                        {challenge.completed && <CheckCircleIcon className="w-6 h-6 text-success" />}
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">+{challenge.xpEarned} XP</span>
                          {!challenge.completed && (
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleChallengeStart(challenge)}
                            >
                              Start
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Learning Paths */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <TargetIcon className="w-6 h-6 mr-2 text-secondary" />
                Learning Paths
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {learningPaths.map(path => (
                  <div key={path.name} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
                    <div className="card-body">
                      <div className={`text-${path.color} mb-3`}>
                        {path.icon}
                      </div>
                      <h3 className="card-title">{path.name}</h3>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>{path.completedModules}/{path.modules} Modules</span>
                          <span className="font-bold">{Math.round(path.progress)}%</span>
                        </div>
                        <progress 
                          className={`progress progress-${path.color}`} 
                          value={path.progress} 
                          max="100"
                        ></progress>
                      </div>
                      <div className="card-actions justify-end mt-4">
                        <button 
                          className={`btn btn-sm btn-${path.color}`}
                          onClick={() => handlePathContinue(path)}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  className="btn btn-lg btn-outline btn-primary"
                  onClick={() => setActiveTab('practice')}
                >
                  <HeadphonesIcon className="w-5 h-5" />
                  Listening Practice
                </button>
                <button 
                  className="btn btn-lg btn-outline btn-secondary"
                  onClick={() => setShowVocabModal(true)}
                >
                  <BookOpenIcon className="w-5 h-5" />
                  Add Vocabulary
                </button>
                <button 
                  className="btn btn-lg btn-outline btn-accent"
                  onClick={() => setActiveTab('lessons')}
                >
                  <VideoIcon className="w-5 h-5" />
                  Watch Lesson
                </button>
                <button 
                  className="btn btn-lg btn-outline btn-success"
                  onClick={() => setActiveTab('partners')}
                >
                  <UsersIcon className="w-5 h-5" />
                  Find Partner
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="space-y-6">
            {/* Level Selector */}
            <div className="flex gap-2 mb-6">
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`btn ${selectedLevel === level ? 'btn-primary' : 'btn-outline'}`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>

            {/* Video Lessons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoLessons
                .filter(lesson => lesson.level.toLowerCase() === selectedLevel || selectedLevel === 'all')
                .map(lesson => (
                <div key={lesson.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
                  <figure className="relative">
                    <img 
                      src={lesson.thumbnail} 
                      alt={lesson.title}
                      className="w-full h-48 object-cover"
                    />
                    {lesson.locked ? (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <LockIcon className="w-12 h-12 text-white" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          className="btn btn-circle btn-primary btn-lg"
                          onClick={() => setPlayingVideo(lesson)}
                        >
                          <PlayCircleIcon className="w-8 h-8" />
                        </button>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`badge ${lesson.level === 'Beginner' ? 'badge-success' : lesson.level === 'Intermediate' ? 'badge-warning' : 'badge-error'}`}>
                        {lesson.level}
                      </span>
                    </div>
                    {lesson.completed && (
                      <div className="absolute top-2 left-2">
                        <CheckCircleIcon className="w-6 h-6 text-success" />
                      </div>
                    )}
                  </figure>
                  <div className="card-body">
                    <h3 className="card-title text-lg">{lesson.title}</h3>
                    <p className="text-sm opacity-70">{lesson.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <ClockIcon className="w-4 h-4" />
                        <span>{lesson.duration}</span>
                      </div>
                      <div className="text-sm font-bold text-primary">
                        +{lesson.xp} XP
                      </div>
                    </div>
                    <div className="card-actions justify-end mt-4">
                      {lesson.locked ? (
                        <button className="btn btn-sm btn-disabled">Locked</button>
                      ) : (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => setPlayingVideo(lesson)}
                        >
                          {lesson.completed ? 'Review' : 'Start'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="space-y-8">
            {/* Vocabulary Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">My Vocabulary</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowVocabModal(true)}
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Word
                </button>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <p className="text-lg">
                    You've learned <span className="font-bold text-primary">{progress?.wordsLearned || 0}</span> words!
                  </p>
                  {progress?.vocabulary?.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                      {progress.vocabulary.slice(-8).map((word, idx) => (
                        <div key={idx} className="badge badge-lg badge-outline">
                          {word.word} - {word.translation}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Interactive Exercises */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Interactive Exercises</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="card-body">
                    <h3 className="card-title">
                      <HeadphonesIcon className="w-6 h-6" />
                      Pronunciation Practice
                    </h3>
                    <p>Master native pronunciation with AI feedback</p>
                    <div className="card-actions justify-end">
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowPronunciation(true)}
                      >
                        Start Session
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                  <div className="card-body">
                    <h3 className="card-title">
                      <BookOpenIcon className="w-6 h-6" />
                      Grammar Exercises
                    </h3>
                    <p>Master grammar rules with interactive quizzes</p>
                    <div className="card-actions justify-end">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setShowGrammar(true)}
                      >
                        Practice Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Conversation Topics */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Conversation Topics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Travel', 'Food', 'Culture', 'Business', 'Sports', 'Music', 'Technology', 'Daily Life'].map(topic => (
                  <button 
                    key={topic} 
                    className="card bg-base-100 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                    onClick={() => startConversation(topic)}
                  >
                    <div className="card-body items-center text-center p-4">
                      <MessageSquareIcon className="w-8 h-8 text-primary mb-2" />
                      <p className="font-semibold">{topic}</p>
                      <p className="text-xs opacity-70 mt-1">Practice real conversations</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Recommended Language Partners</h2>
            {suggestedPartners.length === 0 ? (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center">
                  <p className="text-lg opacity-70">No matching partners found yet.</p>
                  <p className="text-sm">Try updating your language preferences in your profile.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedPartners.map(partner => (
                  <div key={partner._id} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <div className="flex items-center gap-4">
                        <div className={`avatar ${partner.isOnline ? 'online' : 'offline'}`}>
                          <div className="w-16 rounded-full">
                            <img src={partner.profilePic || "/vite.svg"} alt={partner.fullName} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold">{partner.fullName}</h3>
                          <p className="text-sm opacity-70">
                            {LANGUAGES.find(l => l.value === partner.nativeLanguage)?.flag} → {LANGUAGES.find(l => l.value === partner.learningLanguage)?.flag}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              <StarIcon className="w-4 h-4 text-warning fill-warning" />
                              <span className="text-sm ml-1">{partner.rating?.toFixed(1)}</span>
                            </div>
                            <span className="text-sm opacity-70">• {partner.sessionsCompleted} sessions</span>
                          </div>
                        </div>
                      </div>
                      <div className="card-actions justify-end mt-4">
                        <Link to={`/chat/${partner._id}`} className="btn btn-sm btn-primary">
                          <MessageSquareIcon className="w-4 h-4" />
                          Message
                        </Link>
                        <Link to={`/profile/${partner._id}`} className="btn btn-sm btn-outline">
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-8">
            {/* Achievements */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Achievements</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {achievements.map(achievement => (
                  <div 
                    key={achievement.id} 
                    className={`card ${achievement.unlocked ? 'bg-base-100' : 'bg-base-200 opacity-50'} shadow-lg`}
                  >
                    <div className="card-body items-center text-center p-4">
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <p className="font-semibold text-sm">{achievement.name}</p>
                      <p className="text-xs opacity-70">{achievement.description}</p>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <p className="text-xs text-success mt-1">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Progress Chart */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Your Learning Journey</h2>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="stat">
                      <div className="stat-title">Total Study Time</div>
                      <div className="stat-value text-primary">{Math.floor((progress?.totalStudyTime || 0) / 60)} Hours</div>
                      <div className="stat-desc">Keep learning every day!</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Words Learned</div>
                      <div className="stat-value text-secondary">{progress?.wordsLearned || 0}</div>
                      <div className="stat-desc">Expand your vocabulary</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Conversations</div>
                      <div className="stat-value text-accent">{progress?.conversationsCompleted || 0}</div>
                      <div className="stat-desc">Practice makes perfect</div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-bold mb-2">Longest Streak</h3>
                    <div className="flex items-center gap-2">
                      <FlameIcon className="w-6 h-6 text-orange-500" />
                      <span className="text-2xl font-bold">{progress?.longestStreak || 0} days</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">{playingVideo.title}</h3>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={playingVideo.videoUrl}
                title={playingVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="modal-action">
              {!playingVideo.completed && (
                <button 
                  className="btn btn-primary"
                  onClick={() => handleLessonComplete(playingVideo)}
                >
                  Mark as Complete (+{playingVideo.xp} XP)
                </button>
              )}
              <button className="btn" onClick={() => setPlayingVideo(null)}>Close</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setPlayingVideo(null)}></div>
        </div>
      )}

      {/* Add Vocabulary Modal */}
      {showVocabModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add New Vocabulary</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Word in {learningLanguage?.label}</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter word"
                className="input input-bordered"
                value={newWord.word}
                onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Translation</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter translation"
                className="input input-bordered"
                value={newWord.translation}
                onChange={(e) => setNewWord({ ...newWord, translation: e.target.value })}
              />
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-primary"
                onClick={handleAddVocabulary}
                disabled={!newWord.word || !newWord.translation}
              >
                Add Word (+5 XP)
              </button>
              <button 
                className="btn" 
                onClick={() => {
                  setShowVocabModal(false);
                  setNewWord({ word: "", translation: "" });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowVocabModal(false)}></div>
        </div>
      )}

      {/* Pronunciation Practice Modal */}
      {showPronunciation && (
        <PronunciationPractice
          language={authUser?.learningLanguage}
          onClose={() => setShowPronunciation(false)}
          onComplete={handlePronunciationComplete}
        />
      )}

      {/* Grammar Exercises Modal */}
      {showGrammar && (
        <GrammarExercises
          language={authUser?.learningLanguage}
          onClose={() => setShowGrammar(false)}
          onComplete={handleGrammarComplete}
        />
      )}

      {/* Conversation Practice Modal */}
      {showConversation && selectedTopic && (
        <DynamicConversation
          topic={selectedTopic}
          onClose={() => {
            setShowConversation(false);
            setSelectedTopic(null);
          }}
          onComplete={handleConversationComplete}
        />
      )}
    </div>
  );
};

export default LanguageJourneyPage;