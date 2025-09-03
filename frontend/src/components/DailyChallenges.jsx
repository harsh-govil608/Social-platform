import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ZapIcon, 
  TimerIcon, 
  MicIcon, 
  BookOpenIcon,
  VideoIcon,
  TrophyIcon,
  LockIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  HeartIcon,
  FlameIcon,
  CrownIcon,
  VolumeIcon,
  BrainIcon,
  TargetIcon,
  RocketIcon
} from "lucide-react";
import toast from "react-hot-toast";
import confetti from 'canvas-confetti';
import DifficultySelector from './DifficultySelector';
import EnhancedStoryBuilder from './EnhancedStoryBuilder';
import { getDailyChallenges, completeDailyChallenge } from "../lib/learningApi";

const DailyChallenges = ({ userLevel = 1, onChallengeComplete }) => {
  const queryClient = useQueryClient();
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [challengeState, setChallengeState] = useState({});
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState('easy');
  const [userProgress, setUserProgress] = useState({
    level: userLevel,
    completedChallenges: 0,
    streak: 0
  });

  // Fetch daily challenges from MongoDB
  const { data: challengesFromDB, isLoading: loadingChallenges, error: challengesError } = useQuery({
    queryKey: ["dailyChallenges"],
    queryFn: getDailyChallenges,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    onError: (error) => {
      console.error("Query error:", error);
    }
  });
  
  // Log the data
  useEffect(() => {
    console.log("Challenges data:", challengesFromDB);
    console.log("Loading:", loadingChallenges);
    console.log("Error:", challengesError);
  }, [challengesFromDB, loadingChallenges, challengesError]);

  // Mutation to complete a challenge
  const completeChallengeMutation = useMutation({
    mutationFn: completeDailyChallenge,
    onSuccess: (data) => {
      toast.success(`Challenge completed! +${data.xpEarned} XP`);
      queryClient.invalidateQueries(["dailyChallenges"]);
      queryClient.invalidateQueries(["learningProgress"]);
      if (onChallengeComplete) {
        onChallengeComplete(data);
      }
    },
    onError: (error) => {
      toast.error("Failed to save challenge progress");
    }
  });
  
  // Use challenges from MongoDB or empty array while loading
  const challenges = challengesFromDB || [];

  // Quiz Challenge Component
  const QuizChallenge = ({ challenge, onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(challenge?.duration || 120);
    const [answered, setAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    
    // Get questions from the correct location
    const questions = challenge?.content?.questions || challenge?.questions || [];

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onComplete({ score, completed: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [score]);

    const handleAnswer = (answer) => {
      if (answered) return;
      
      setSelectedAnswer(answer);
      setAnswered(true);
      
      const currentQ = questions[currentQuestion];
      const correctAnswer = currentQ?.correctAnswer || currentQ?.correct;
      const isCorrect = answer === correctAnswer || (typeof correctAnswer === 'number' && answer === (currentQ?.options || currentQ?.a)?.[correctAnswer]);
      
      if (isCorrect) {
        setScore(score + 20);
        toast.success('Correct! +20 points');
      } else {
        setLives(prev => Math.max(0, prev - 1));
        toast.error('Wrong answer!');
      }

      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setAnswered(false);
          setSelectedAnswer(null);
        } else {
          onComplete({ score: score + (isCorrect ? 20 : 0), completed: true });
        }
      }, 1500);
    };

    return (
      <div className="space-y-6">
        {/* Timer and Score */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TimerIcon className="w-5 h-5" />
            <span className="font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <HeartIcon key={i} className={`w-5 h-5 ${i < lives ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              ))}
            </div>
            <span className="font-bold">Score: {score}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <progress 
          className="progress progress-primary" 
          value={currentQuestion} 
          max={questions.length}
        />

        {/* Question */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="text-xl font-bold mb-4">
              Question {currentQuestion + 1} of {questions.length}
            </h3>
            <p className="text-lg mb-6">{questions[currentQuestion]?.question || questions[currentQuestion]?.q || ''}</p>
            
            <div className="grid grid-cols-2 gap-4">
              {(questions[currentQuestion]?.options || questions[currentQuestion]?.a || []).map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(answer)}
                  disabled={answered}
                  className={`btn btn-lg ${
                    answered && answer === (questions[currentQuestion]?.correctAnswer || (questions[currentQuestion]?.options || questions[currentQuestion]?.a)?.[questions[currentQuestion]?.correct])
                      ? 'btn-success'
                      : answered && answer === selectedAnswer && answer !== (questions[currentQuestion]?.correctAnswer || (questions[currentQuestion]?.options || questions[currentQuestion]?.a)?.[questions[currentQuestion]?.correct])
                      ? 'btn-error'
                      : 'btn-outline'
                  }`}
                >
                  {answer}
                  {answered && answer === (questions[currentQuestion]?.correctAnswer || (questions[currentQuestion]?.options || questions[currentQuestion]?.a)?.[questions[currentQuestion]?.correct]) && (
                    <CheckCircleIcon className="w-5 h-5 ml-2" />
                  )}
                  {answered && answer === selectedAnswer && answer !== (questions[currentQuestion]?.correctAnswer || (questions[currentQuestion]?.options || questions[currentQuestion]?.a)?.[questions[currentQuestion]?.correct]) && (
                    <XCircleIcon className="w-5 h-5 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Pronunciation Challenge Component
  const PronunciationChallenge = ({ challenge, onComplete }) => {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [userSpeech, setUserSpeech] = useState('');
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [timeLeft, setTimeLeft] = useState(challenge.duration);

    const phrases = [
      "Hello, how are you today?",
      "I would like to order coffee",
      "Where is the nearest restaurant?",
      "Thank you for your help",
      "It's a beautiful day outside"
    ];

    useEffect(() => {
      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setUserSpeech(transcript);
          analyzePronounciation(transcript, phrases[currentPhraseIndex]);
        };

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          toast.error('Speech recognition error. Please try again.');
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      } else {
        toast.error('Speech recognition not supported in your browser');
      }

      // Timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onComplete({ score, completed: true, phrasesCompleted: currentPhraseIndex });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, []);

    const analyzePronounciation = (spokenText, targetPhrase) => {
      const similarity = calculateSimilarity(spokenText.toLowerCase(), targetPhrase.toLowerCase());
      const phraseScore = Math.round(similarity * 100);
      
      setScore(prevScore => prevScore + phraseScore);
      
      if (similarity > 0.8) {
        setFeedback('Excellent pronunciation!');
        toast.success(`Great job! ${phraseScore} points`);
      } else if (similarity > 0.6) {
        setFeedback('Good, but try to pronounce more clearly');
        toast('Good effort! Keep practicing');
      } else {
        setFeedback('Try again, listen carefully to the pronunciation');
        toast.error('Try to match the pronunciation more closely');
      }

      setTimeout(() => {
        if (currentPhraseIndex < phrases.length - 1) {
          setCurrentPhraseIndex(currentPhraseIndex + 1);
          setUserSpeech('');
          setFeedback('');
        } else {
          onComplete({ score: score + phraseScore, completed: true, phrasesCompleted: phrases.length });
        }
      }, 3000);
    };

    const calculateSimilarity = (str1, str2) => {
      const words1 = str1.split(' ');
      const words2 = str2.split(' ');
      let matches = 0;
      
      words1.forEach(word => {
        if (words2.includes(word)) {
          matches++;
        }
      });
      
      return matches / Math.max(words1.length, words2.length);
    };

    const startRecording = () => {
      if (recognition && !isRecording) {
        setIsRecording(true);
        setUserSpeech('');
        setFeedback('');
        recognition.start();
      }
    };

    const playPhrase = () => {
      if ('speechSynthesis' in window) {
        setIsPlaying(true);
        const utterance = new SpeechSynthesisUtterance(phrases[currentPhraseIndex]);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.onend = () => setIsPlaying(false);
        speechSynthesis.speak(utterance);
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TimerIcon className="w-5 h-5" />
            <span className="font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="badge badge-primary badge-lg">Score: {score}</div>
        </div>

        {/* Progress */}
        <progress 
          className="progress progress-primary w-full" 
          value={currentPhraseIndex} 
          max={phrases.length}
        />

        {/* Current Phrase */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h3 className="text-2xl font-bold mb-4">
              Phrase {currentPhraseIndex + 1} of {phrases.length}
            </h3>
            <div className="text-4xl mb-6 p-6 bg-base-200 rounded-lg">
              "{phrases[currentPhraseIndex]}"
            </div>

            <div className="flex justify-center gap-4 mb-4">
              <button 
                className={`btn ${isPlaying ? 'btn-secondary' : 'btn-primary'}`}
                onClick={playPhrase}
                disabled={isPlaying}
              >
                <VolumeIcon className="w-5 h-5 mr-2" />
                {isPlaying ? 'Playing...' : 'Listen'}
              </button>
              
              <button 
                className={`btn ${isRecording ? 'btn-error' : 'btn-success'}`}
                onClick={startRecording}
                disabled={isRecording}
              >
                <MicIcon className="w-5 h-5 mr-2" />
                {isRecording ? 'Recording...' : 'Record'}
              </button>
            </div>

            {userSpeech && (
              <div className="mt-4 p-4 bg-info/10 rounded-lg">
                <p className="font-semibold">You said:</p>
                <p className="text-lg">"{userSpeech}"</p>
              </div>
            )}

            {feedback && (
              <div className="mt-4 p-4 bg-success/10 rounded-lg">
                <p className="font-semibold text-success">{feedback}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Story Builder Challenge Component
  const StoryBuilderChallenge = ({ challenge, onComplete }) => {
    const [story, setStory] = useState('');
    const [usedWords, setUsedWords] = useState([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(challenge.duration);

    const requiredWords = ['adventure', 'mysterious', 'discover', 'journey', 'treasure'];

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            calculateFinalScore();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, []);

    const checkUsedWords = (text) => {
      const used = requiredWords.filter(word => 
        text.toLowerCase().includes(word.toLowerCase())
      );
      setUsedWords(used);
      setScore(used.length * 30 + Math.min(text.length, 500)); // Bonus for length
    };

    const calculateFinalScore = () => {
      const finalScore = usedWords.length * 30 + Math.min(story.length, 500);
      onComplete({ score: finalScore, completed: true, wordsUsed: usedWords.length });
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TimerIcon className="w-5 h-5" />
            <span className="font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="badge badge-primary badge-lg">Score: {score}</div>
        </div>

        {/* Required Words */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Use These Words in Your Story:</h3>
            <div className="flex flex-wrap gap-2">
              {requiredWords.map(word => (
                <span 
                  key={word}
                  className={`badge badge-lg ${
                    usedWords.includes(word) ? 'badge-success' : 'badge-outline'
                  }`}
                >
                  {word}
                  {usedWords.includes(word) && <CheckCircleIcon className="w-4 h-4 ml-1" />}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Story Input */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Write Your Story:</h3>
            <textarea
              className="textarea textarea-bordered w-full h-64"
              placeholder="Start writing your creative story here..."
              value={story}
              onChange={(e) => {
                setStory(e.target.value);
                checkUsedWords(e.target.value);
              }}
            />
            <div className="flex justify-between text-sm mt-2">
              <span>Characters: {story.length}/500</span>
              <span>Words used: {usedWords.length}/{requiredWords.length}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button 
            className="btn btn-primary btn-lg"
            onClick={calculateFinalScore}
          >
            Submit Story
          </button>
        </div>
      </div>
    );
  };

  // Video Comprehension Challenge Component
  const VideoComprehensionChallenge = ({ challenge, onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showVideo, setShowVideo] = useState(true);

    const questions = [
      {
        q: "What was the main topic of the video?",
        options: ["Travel", "Food", "Education", "Technology"],
        correct: 2
      },
      {
        q: "How many people appeared in the video?",
        options: ["1", "2", "3", "4"],
        correct: 0
      }
    ];

    const handleAnswer = (questionIndex, answerIndex) => {
      const newAnswers = { ...answers, [questionIndex]: answerIndex };
      setAnswers(newAnswers);
      
      if (answerIndex === questions[questionIndex].correct) {
        setScore(score + 50);
        toast.success('Correct answer! +50 points');
      } else {
        toast.error('Incorrect answer');
      }

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        onComplete({ score: score + (answerIndex === questions[currentQuestion].correct ? 50 : 0), completed: true });
      }
    };

    return (
      <div className="space-y-6">
        {showVideo && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Watch the Video First:</h3>
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Learning Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="card-actions justify-end">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowVideo(false)}
                >
                  Start Questions
                </button>
              </div>
            </div>
          </div>
        )}

        {!showVideo && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="text-xl font-bold mb-4">
                Question {currentQuestion + 1} of {questions.length}
              </h3>
              <div className="badge badge-primary badge-lg mb-4">Score: {score}</div>
              
              <p className="text-lg mb-6">{questions[currentQuestion].q}</p>
              
              <div className="grid grid-cols-2 gap-4">
                {questions[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    className="btn btn-lg btn-outline"
                    onClick={() => handleAnswer(currentQuestion, idx)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Word Match Challenge Component
  const WordMatchChallenge = ({ challenge, onComplete }) => {
    const [selectedWords, setSelectedWords] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(challenge?.duration || 120);
    const [shuffledWords, setShuffledWords] = useState([]);
    const [lives, setLives] = useState(3);

    // Get pairs from the correct location
    const pairs = challenge?.content?.pairs || challenge?.pairs || [];

    useEffect(() => {
      // Shuffle and mix words and translations
      const allWords = pairs.flatMap(pair => [
        { text: pair.word, type: 'word', pairId: pair.word },
        { text: pair.translation, type: 'translation', pairId: pair.word }
      ]);
      setShuffledWords(allWords.sort(() => Math.random() - 0.5));
    }, [challenge]);

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onComplete({ score, completed: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [score]);

    const handleWordClick = (word) => {
      if (matchedPairs.includes(word.pairId)) return;

      const newSelected = [...selectedWords, word];
      setSelectedWords(newSelected);

      if (newSelected.length === 2) {
        if (newSelected[0].pairId === newSelected[1].pairId && newSelected[0].type !== newSelected[1].type) {
          // Correct match
          setMatchedPairs([...matchedPairs, word.pairId]);
          setScore(score + 25);
          toast.success('Perfect match! +25 points');
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 }
          });
        } else {
          // Wrong match
          toast.error('Not a match!');
          setLives(prev => Math.max(0, prev - 1));
        }
        setTimeout(() => setSelectedWords([]), 500);
      }
    };

    return (
      <div className="space-y-6">
        {/* Timer and Score */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TimerIcon className="w-5 h-5" />
            <span className="font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <HeartIcon key={i} className={`w-5 h-5 ${i < lives ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              ))}
            </div>
            <span className="font-bold">Score: {score}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2">
          {pairs.map(pair => (
            <div
              key={pair.word}
              className={`w-3 h-3 rounded-full ${
                matchedPairs.includes(pair.word) ? 'bg-success' : 'bg-base-300'
              }`}
            />
          ))}
        </div>

        {/* Word Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {shuffledWords.map((word, idx) => {
            const isSelected = selectedWords.some(w => w.text === word.text && w.type === word.type);
            const isMatched = matchedPairs.includes(word.pairId);

            return (
              <button
                key={idx}
                onClick={() => handleWordClick(word)}
                disabled={isMatched}
                className={`btn btn-lg ${
                  isMatched ? 'btn-success' :
                  isSelected ? 'btn-primary' :
                  word.type === 'word' ? 'btn-outline btn-secondary' : 'btn-outline btn-accent'
                }`}
              >
                {word.text}
                {isMatched && <CheckCircleIcon className="w-4 h-4 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const handleChallengeComplete = (result) => {
    const challenge = challenges.find(c => c.id === activeChallenge);
    
    if (result.completed) {
      const earnedXP = Math.floor((result.score / 100) * challenge.xp);
      const earnedCoins = Math.floor((result.score / 100) * challenge.coins);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success(
        <div>
          <p className="font-bold">Challenge Complete!</p>
          <p>+{earnedXP} XP | +{earnedCoins} Coins</p>
        </div>,
        { duration: 5000 }
      );

      onChallengeComplete?.({
        challengeId: challenge.id,
        xp: earnedXP,
        coins: earnedCoins,
        score: result.score
      });

      setStreak(streak + 1);
    }

    setActiveChallenge(null);
    setChallengeState({
      ...challengeState,
      [challenge.id]: { completed: true, score: result.score }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Streak */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ZapIcon className="w-8 h-8 text-primary" />
          Daily Challenges
        </h2>
        <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/20 px-4 py-2 rounded-lg">
          <FlameIcon className="w-5 h-5 text-orange-500" />
          <span className="font-bold text-orange-600 dark:text-orange-400">{streak} day streak</span>
        </div>
      </div>

      {/* Difficulty Selector - Only show when no active challenge */}
      {!activeChallenge && (
        <DifficultySelector
          currentLevel={difficulty}
          onLevelChange={setDifficulty}
          userProgress={userProgress}
        />
      )}

      {activeChallenge ? (
        // Active Challenge View
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-2xl mb-4">
              {challenges.find(c => (c._id === activeChallenge || c.id === activeChallenge))?.title || 'Challenge'}
            </h3>
            
            {(() => {
              const currentChallenge = challenges.find(c => (c._id === activeChallenge || c.id === activeChallenge));
              if (!currentChallenge) return null;
              
              switch(currentChallenge.type) {
                case 'quiz':
                  return <QuizChallenge challenge={currentChallenge} onComplete={handleChallengeComplete} />;
                case 'vocabulary':
                case 'matching':
                  return <WordMatchChallenge challenge={currentChallenge} onComplete={handleChallengeComplete} />;
                case 'pronunciation':
                  return <PronunciationChallenge challenge={currentChallenge} onComplete={handleChallengeComplete} />;
                case 'creative':
                case 'story':
                  return <EnhancedStoryBuilder language="english" userLevel={userLevel} onComplete={handleChallengeComplete} />;
                case 'video':
                case 'listening':
                  return <VideoComprehensionChallenge challenge={currentChallenge} onComplete={handleChallengeComplete} />;
                case 'grammar':
                  return <QuizChallenge challenge={currentChallenge} onComplete={handleChallengeComplete} />;
                default:
                  return <QuizChallenge challenge={currentChallenge} onComplete={handleChallengeComplete} />;
              }
            })()}

            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={() => setActiveChallenge(null)}
              >
                Exit Challenge
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Challenge Selection Grid
        loadingChallenges ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : challenges.length === 0 ? (
          <div className="alert alert-info">
            <span>No challenges available at the moment. Please check back later!</span>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map(challenge => {
            const isCompleted = challengeState[challenge.id || challenge._id]?.completed;
            const challengeIcon = challenge.type === 'pronunciation' ? <MicIcon className="w-8 h-8" /> :
                                 challenge.type === 'vocabulary' ? <BookOpenIcon className="w-8 h-8" /> :
                                 challenge.type === 'grammar' ? <BrainIcon className="w-8 h-8" /> :
                                 challenge.type === 'listening' ? <VolumeIcon className="w-8 h-8" /> :
                                 challenge.type === 'translation' ? <BookOpenIcon className="w-8 h-8" /> :
                                 challenge.type === 'conversation' ? <VideoIcon className="w-8 h-8" /> :
                                 <ZapIcon className="w-8 h-8" />;
            return (
              <div 
                key={challenge._id || challenge.id}
                className={`card ${isCompleted ? 'bg-success/10 border-success' : 'bg-base-100'} shadow-xl border-2 hover:shadow-2xl transition-all`}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className={`text-primary`}>
                      {challengeIcon}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {isCompleted && <CheckCircleIcon className="w-6 h-6 text-success" />}
                    </div>
                  </div>

                  <h3 className="card-title mt-4">{challenge.title || challenge.type}</h3>
                  <p className="text-sm opacity-70">{challenge.description || challenge.content?.question || 'Complete this challenge'}</p>

                  {/* Difficulty Badge */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`badge badge-primary badge-outline`}>
                      {challenge.level || challenge.difficulty || 'medium'}
                    </span>
                    <span className="text-sm">
                      {challenge.requirements?.timeLimit || 5} min
                    </span>
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-primary" />
                      <span className="font-bold text-sm">{challenge.xpReward || 50} XP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                      <span className="font-bold text-sm">{challenge.coins || Math.round((challenge.xpReward || 50) / 5)} Coins</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="card-actions justify-end mt-4">
                    {isCompleted ? (
                      <div className="text-sm text-success font-semibold">
                        Score: {challengeState[challenge.id].score}
                      </div>
                    ) : (
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => setActiveChallenge(challenge._id || challenge.id)}
                      >
                        Start Challenge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )
      )}

    </div>
  );
};

export default DailyChallenges;