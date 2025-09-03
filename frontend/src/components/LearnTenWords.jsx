import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  BookOpenIcon,
  VolumeIcon,
  Volume2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  TrophyIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  XCircleIcon,
  HeartIcon,
  ZapIcon,
  SparklesIcon,
  FlameIcon,
  CrownIcon,
  BrainIcon,
  TargetIcon,
  TimerIcon,
  ShuffleIcon,
  BookmarkIcon,
  TrendingUpIcon,
  AlertCircleIcon
} from "lucide-react";
import toast from "react-hot-toast";
import confetti from 'canvas-confetti';
import { getDailyWords, saveMasteredWords } from "../lib/learningApi";

const LearnTenWords = ({ 
  language = 'spanish',
  userLevel = 'beginner',
  savedWords = [],
  onComplete,
  onWordSave
}) => {
  const queryClient = useQueryClient();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredWords, setMasteredWords] = useState(new Set());
  const [difficultWords, setDifficultWords] = useState(new Set());
  const [currentSession, setCurrentSession] = useState('learning');
  const [quizScore, setQuizScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showMnemonics, setShowMnemonics] = useState(false);
  const [wordsData, setWordsData] = useState([]);
  const audioRef = useRef(null);

  // Mutation to save mastered words
  const saveMasteredMutation = useMutation({
    mutationFn: saveMasteredWords,
    onSuccess: (data) => {
      toast.success(`${data.masteredCount} words mastered! +${data.xpEarned} XP`);
      queryClient.invalidateQueries(["learningProgress"]);
      if (onComplete) {
        onComplete(data);
      }
    },
    onError: () => {
      toast.error("Failed to save progress");
    }
  });

  // Fetch daily words from API
  const { data: fetchedWords, isLoading, error, refetch } = useQuery({
    queryKey: ['dailyWords', language, userLevel],
    queryFn: getDailyWords,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 2
  });

  // Update words data when fetched
  useEffect(() => {
    if (fetchedWords && Array.isArray(fetchedWords)) {
      // If fetchedWords is directly an array of words
      setWordsData(fetchedWords);
    } else if (fetchedWords && fetchedWords.words) {
      // If fetchedWords has a words property
      setWordsData(fetchedWords.words);
    }
  }, [fetchedWords]);

  // Word categories are now fetched from MongoDB
  // The fetchedWords from the API already contains the vocabulary data

  const [selectedCategory, setSelectedCategory] = useState(null);
  // Use words from MongoDB or empty array while loading
  const currentWords = wordsData.length > 0 ? wordsData : 
    (fetchedWords?.words || []);

  // Learning modes
  const learningModes = [
    { id: 'flashcards', name: 'Flashcards', icon: <BookOpenIcon />, description: 'Classic card flipping' },
    { id: 'quiz', name: 'Quick Quiz', icon: <BrainIcon />, description: 'Test your knowledge' },
    { id: 'match', name: 'Memory Match', icon: <ShuffleIcon />, description: 'Match words with meanings' },
    { id: 'spell', name: 'Spell Master', icon: <SparklesIcon />, description: 'Practice spelling', premium: true },
    { id: 'context', name: 'Context Clues', icon: <BookmarkIcon />, description: 'Learn from sentences', premium: true },
  ];

  // Timer for engagement tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Text-to-speech function
  const speakWord = (text, lang = 'es-ES') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // Flashcard Component
  const FlashcardMode = () => {
    const currentWord = currentWords[currentWordIndex];

    return (
      <div className="flex flex-col items-center space-y-6">
        {/* Progress Bar */}
        <div className="w-full max-w-md">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{currentWordIndex + 1} / {currentWords.length}</span>
          </div>
          <progress 
            className="progress progress-primary w-full" 
            value={currentWordIndex + 1} 
            max={currentWords.length}
          />
        </div>

        {/* Flashcard */}
        <div 
          className="relative w-full max-w-md h-96 cursor-pointer preserve-3d"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`card bg-gradient-to-br ${
            masteredWords.has(currentWordIndex) ? 'from-success/20 to-success/10 border-success' :
            difficultWords.has(currentWordIndex) ? 'from-error/20 to-error/10 border-error' :
            'from-primary/20 to-secondary/10'
          } shadow-2xl absolute inset-0 backface-hidden transition-all duration-500 ${
            isFlipped ? 'rotate-y-180' : ''
          }`}>
            <div className="card-body flex flex-col items-center justify-center text-center">
              {!isFlipped ? (
                <>
                  <div className="text-6xl mb-4">{currentWord.image}</div>
                  <h2 className="text-3xl font-bold mb-2">{currentWord.word}</h2>
                  <p className="text-sm opacity-70">Click to see translation</p>
                  <button 
                    className="btn btn-circle btn-primary mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentWord.word, 'en-US');
                    }}
                  >
                    <VolumeIcon className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-2">{currentWord.translation}</h2>
                  <p className="text-lg mb-2">{currentWord.pronunciation}</p>
                  <div className="divider"></div>
                  <p className="text-sm font-semibold">Example:</p>
                  <p className="italic">{currentWord.exampleTranslation}</p>
                  <p className="text-sm opacity-70 mt-2">"{currentWord.example}"</p>
                  <button 
                    className="btn btn-circle btn-secondary mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentWord.translation, 'es-ES');
                    }}
                  >
                    <Volume2Icon className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mnemonic Helper */}
        {showMnemonics && currentWord.mnemonic && (
          <div className="card bg-warning/10 border-warning w-full max-w-md">
            <div className="card-body p-4">
              <p className="text-sm">
                <span className="font-bold">💡 Memory Tip:</span> {currentWord.mnemonic}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            className="btn btn-error"
            onClick={() => {
              setDifficultWords(new Set([...difficultWords, currentWordIndex]));
              toast.error('Marked as difficult');
            }}
          >
            <XCircleIcon className="w-5 h-5" />
            Difficult
          </button>
          <button 
            className="btn btn-success"
            onClick={() => {
              setMasteredWords(new Set([...masteredWords, currentWordIndex]));
              toast.success('Word mastered!');
              setStreak(streak + 1);
              if (streak > 0 && streak % 3 === 0) {
                confetti({
                  particleCount: 30,
                  spread: 60,
                  origin: { y: 0.8 }
                });
              }
            }}
          >
            <CheckCircleIcon className="w-5 h-5" />
            Got it!
          </button>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 items-center">
          <button 
            className="btn btn-circle"
            onClick={() => {
              setCurrentWordIndex(Math.max(0, currentWordIndex - 1));
              setIsFlipped(false);
            }}
            disabled={currentWordIndex === 0}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="font-bold">{currentWordIndex + 1} / {currentWords.length}</span>
          <button 
            className="btn btn-circle"
            onClick={() => {
              if (currentWordIndex < currentWords.length - 1) {
                setCurrentWordIndex(currentWordIndex + 1);
                setIsFlipped(false);
              } else {
                completeSession();
              }
            }}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  // Quiz Mode Component
  const QuizMode = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);

    const generateQuizQuestion = () => {
      const word = currentWords[currentQuestion];
      const wrongAnswers = currentWords
        .filter((_, idx) => idx !== currentQuestion)
        .map(w => w.translation)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const allAnswers = [word.translation, ...wrongAnswers].sort(() => Math.random() - 0.5);
      
      return {
        question: word.word,
        image: word.image,
        answers: allAnswers,
        correct: word.translation
      };
    };

    const question = generateQuizQuestion();

    const handleAnswer = (answer) => {
      setSelectedAnswer(answer);
      setShowResult(true);
      
      if (answer === question.correct) {
        setCorrectAnswers(correctAnswers + 1);
        setQuizScore(quizScore + 10);
        toast.success('Correct! +10 points');
      } else {
        setLives(Math.max(0, lives - 1));
        toast.error('Wrong answer!');
      }

      setTimeout(() => {
        if (currentQuestion < currentWords.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setShowResult(false);
        } else {
          completeSession();
        }
      }, 2000);
    };

    return (
      <div className="flex flex-col items-center space-y-6 w-full max-w-2xl mx-auto">
        {/* Header Stats */}
        <div className="flex justify-between w-full">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <HeartIcon key={i} className={`w-6 h-6 ${i < lives ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            ))}
          </div>
          <div className="badge badge-primary badge-lg">Score: {quizScore}</div>
        </div>

        {/* Progress */}
        <progress 
          className="progress progress-primary w-full" 
          value={currentQuestion} 
          max={currentWords.length}
        />

        {/* Question Card */}
        <div className="card bg-base-100 shadow-xl w-full">
          <div className="card-body items-center text-center">
            <div className="text-6xl mb-4">{question.image}</div>
            <h3 className="text-2xl font-bold mb-6">
              What is "{question.question}" in {language}?
            </h3>
            
            <div className="grid grid-cols-2 gap-4 w-full">
              {question.answers.map((answer, idx) => (
                <button
                  key={idx}
                  className={`btn btn-lg ${
                    showResult && answer === question.correct ? 'btn-success' :
                    showResult && answer === selectedAnswer && answer !== question.correct ? 'btn-error' :
                    'btn-outline'
                  }`}
                  onClick={() => !showResult && handleAnswer(answer)}
                  disabled={showResult}
                >
                  {answer}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const completeSession = () => {
    const totalScore = (masteredWords.size * 100) + quizScore;
    const earnedXP = Math.floor(totalScore / 10);
    const earnedCoins = Math.floor(totalScore / 20);

    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast.success(
      <div>
        <p className="font-bold">Session Complete!</p>
        <p>+{earnedXP} XP | +{earnedCoins} Coins</p>
        <p>{masteredWords.size} words mastered</p>
      </div>,
      { duration: 5000 }
    );

    onComplete?.({
      masteredWords: Array.from(masteredWords).map(idx => currentWords[idx]),
      difficultWords: Array.from(difficultWords).map(idx => currentWords[idx]),
      xp: earnedXP,
      coins: earnedCoins,
      timeSpent,
      score: totalScore
    });
  };

  // Memory Match Mode Component
  const MemoryMatchMode = () => {
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);
    const [gameCards, setGameCards] = useState([]);
    const [score, setScore] = useState(0);

    useEffect(() => {
      // Create card pairs
      const words = currentWords.slice(0, 6);
      const cardPairs = [];
      words.forEach((word, index) => {
        cardPairs.push({ id: index * 2, type: 'word', content: word.word, matchId: index });
        cardPairs.push({ id: index * 2 + 1, type: 'translation', content: word.translation, matchId: index });
      });
      setGameCards(cardPairs.sort(() => Math.random() - 0.5));
    }, [currentWords]);

    const handleCardFlip = (cardId) => {
      if (flippedCards.length === 2 || flippedCards.includes(cardId) || matchedCards.includes(cardId)) return;

      const newFlipped = [...flippedCards, cardId];
      setFlippedCards(newFlipped);

      if (newFlipped.length === 2) {
        const card1 = gameCards.find(c => c.id === newFlipped[0]);
        const card2 = gameCards.find(c => c.id === newFlipped[1]);

        if (card1.matchId === card2.matchId && card1.type !== card2.type) {
          // Match found
          setMatchedCards(prev => [...prev, ...newFlipped]);
          setScore(prev => prev + 10);
          toast.success('Match found! +10 points');
          confetti({ particleCount: 30, spread: 60 });
        }

        setTimeout(() => setFlippedCards([]), 1000);
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Memory Match</h3>
          <p className="badge badge-primary badge-lg">Score: {score}</p>
        </div>
        
        <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
          {gameCards.map(card => {
            const isFlipped = flippedCards.includes(card.id) || matchedCards.includes(card.id);
            const isMatched = matchedCards.includes(card.id);
            
            return (
              <div
                key={card.id}
                className={`aspect-square card cursor-pointer transition-all ${
                  isMatched ? 'bg-success text-success-content' : 'bg-base-200 hover:bg-base-300'
                }`}
                onClick={() => handleCardFlip(card.id)}
              >
                <div className="card-body p-2 flex items-center justify-center">
                  <span className="text-sm text-center font-semibold">
                    {isFlipped ? card.content : '?'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Spell Master Mode Component
  const SpellMasterMode = () => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState(0);
    
    const currentWord = currentWords[currentWordIndex];

    const checkSpelling = () => {
      const correct = userInput.toLowerCase() === currentWord.translation.toLowerCase();
      
      if (correct) {
        setScore(score + Math.max(10 - attempts, 1));
        toast.success(`Correct! +${Math.max(10 - attempts, 1)} points`);
        
        if (currentWordIndex < currentWords.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
          setUserInput('');
          setAttempts(0);
        } else {
          toast.success('Spelling practice complete!');
        }
      } else {
        setAttempts(attempts + 1);
        toast.error('Incorrect spelling. Try again!');
      }
    };

    const speakWord = () => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentWord.translation);
        utterance.lang = 'es-ES';
        speechSynthesis.speak(utterance);
      }
    };

    return (
      <div className="space-y-6 max-w-md mx-auto">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Spell Master</h3>
          <p className="badge badge-primary badge-lg">Score: {score}</p>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <div className="text-4xl mb-4">{currentWord.image}</div>
            <h4 className="text-xl font-bold mb-4">{currentWord.word}</h4>
            <p className="text-sm opacity-70 mb-4">{currentWord.example}</p>
            
            <button className="btn btn-primary mb-4" onClick={speakWord}>
              <VolumeIcon className="w-5 h-5 mr-2" />
              Listen
            </button>
            
            <input
              type="text"
              className="input input-bordered w-full mb-4"
              placeholder="Type the translation..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkSpelling()}
            />
            
            <button 
              className="btn btn-primary"
              onClick={checkSpelling}
              disabled={!userInput.trim()}
            >
              Check Spelling
            </button>
          </div>
        </div>
        
        <progress 
          className="progress progress-primary w-full" 
          value={currentWordIndex} 
          max={currentWords.length}
        />
      </div>
    );
  };

  // Context Clues Mode Component
  const ContextCluesMode = () => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    
    const currentWord = currentWords[currentWordIndex];
    const options = [
      currentWord.translation,
      ...currentWords.filter((_, i) => i !== currentWordIndex)
        .slice(0, 3)
        .map(w => w.translation)
    ].sort(() => Math.random() - 0.5);

    const handleAnswer = (answer) => {
      setSelectedAnswer(answer);
      setShowResult(true);
      
      if (answer === currentWord.translation) {
        setScore(score + 15);
        toast.success('Correct! +15 points');
      } else {
        toast.error('Incorrect answer');
      }

      setTimeout(() => {
        if (currentWordIndex < currentWords.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
          setSelectedAnswer(null);
          setShowResult(false);
        } else {
          toast.success('Context practice complete!');
        }
      }, 2000);
    };

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Context Clues</h3>
          <p className="badge badge-primary badge-lg">Score: {score}</p>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h4 className="text-xl font-bold mb-4">
              What does the highlighted word mean?
            </h4>
            
            <div className="p-4 bg-base-200 rounded-lg mb-6">
              <p className="text-lg" dangerouslySetInnerHTML={{
                __html: currentWord.exampleTranslation?.replace(
                  currentWord.translation, 
                  `<span class="bg-warning text-warning-content px-2 rounded font-bold">${currentWord.translation}</span>`
                ) || currentWord.translation
              }} />
              <p className="text-sm opacity-70 mt-2 italic">
                "{currentWord.example}"
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  className={`btn btn-lg ${
                    showResult && option === currentWord.translation ? 'btn-success' :
                    showResult && option === selectedAnswer ? 'btn-error' :
                    'btn-outline'
                  }`}
                  onClick={() => !showResult && handleAnswer(option)}
                  disabled={showResult}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <progress 
          className="progress progress-primary w-full" 
          value={currentWordIndex} 
          max={currentWords.length}
        />
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg">Loading today's vocabulary...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="alert alert-error">
          <XCircleIcon className="w-6 h-6" />
          <span>Failed to load vocabulary. Please try again.</span>
          <button className="btn btn-sm" onClick={() => refetch()}>
            <RefreshCwIcon className="w-4 h-4 mr-1" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No words available
  if (!currentWords || currentWords.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="alert alert-warning">
          <AlertCircleIcon className="w-6 h-6" />
          <span>No vocabulary words available. Please check back later.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
          <BookOpenIcon className="w-10 h-10 text-primary" />
          Learn 10 New Words
        </h1>
        <p className="text-lg opacity-80">Master vocabulary with scientifically-proven techniques</p>
      </div>

      {/* Stats Bar */}
      <div className="stats shadow w-full mb-8">
        <div className="stat">
          <div className="stat-figure text-primary">
            <FlameIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Streak</div>
          <div className="stat-value text-primary">{streak}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-secondary">
            <TrophyIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Words Mastered</div>
          <div className="stat-value text-secondary">{masteredWords.size}/{currentWords.length}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-accent">
            <TimerIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Time</div>
          <div className="stat-value text-accent">
            {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>


      {/* Learning Mode Tabs */}
      <div className="tabs tabs-boxed mb-8 flex-wrap">
        {learningModes.map(mode => (
          <button
            key={mode.id}
            className={`tab ${currentSession === mode.id ? 'tab-active' : ''}`}
            onClick={() => setCurrentSession(mode.id)}
          >
            {mode.icon}
            <span className="ml-2">{mode.name}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {currentSession === 'flashcards' && <FlashcardMode />}
        {currentSession === 'quiz' && <QuizMode />}
        {currentSession === 'match' && <MemoryMatchMode />}
        {currentSession === 'spell' && <SpellMasterMode />}
        {currentSession === 'context' && <ContextCluesMode />}
      </div>

      {/* Helper Options */}
      <div className="flex justify-center gap-4 mt-8">
        <button 
          className={`btn ${showMnemonics ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setShowMnemonics(!showMnemonics)}
        >
          💡 Memory Tips
        </button>
        <button 
          className="btn btn-outline"
          onClick={() => {
            setCurrentWordIndex(0);
            setMasteredWords(new Set());
            setDifficultWords(new Set());
            setQuizScore(0);
            setStreak(0);
            setLives(3);
            toast.success('Session reset!');
          }}
        >
          <RefreshCwIcon className="w-5 h-5" />
          Reset
        </button>
      </div>

    </div>
  );
};

export default LearnTenWords;