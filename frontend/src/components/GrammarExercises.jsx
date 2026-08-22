import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ChevronRightIcon, TrophyIcon, BookOpenIcon, ZapIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const GrammarExercises = ({ language, onClose, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);

  // Grammar questions database
  const grammarQuestions = [
    {
      id: 1,
      category: "Articles",
      question: "I saw ___ elephant at the zoo yesterday.",
      options: ["a", "an", "the", "no article"],
      correct: 1,
      explanation: "Use 'an' before words starting with vowel sounds. 'Elephant' starts with a vowel sound.",
      difficulty: "easy"
    },
    {
      id: 2,
      category: "Present Perfect",
      question: "She ___ to Paris three times.",
      options: ["has been", "have been", "was", "is going"],
      correct: 0,
      explanation: "Use 'has been' with third person singular (she/he/it) in present perfect tense.",
      difficulty: "medium"
    },
    {
      id: 3,
      category: "Conditionals",
      question: "If I ___ rich, I would travel the world.",
      options: ["am", "was", "were", "will be"],
      correct: 2,
      explanation: "In second conditional (hypothetical situations), use 'were' for all persons.",
      difficulty: "medium"
    },
    {
      id: 4,
      category: "Prepositions",
      question: "The meeting is scheduled ___ Monday morning.",
      options: ["in", "on", "at", "by"],
      correct: 1,
      explanation: "Use 'on' for days and dates (on Monday, on July 4th).",
      difficulty: "easy"
    },
    {
      id: 5,
      category: "Modal Verbs",
      question: "You ___ see a doctor if you're feeling sick.",
      options: ["should", "would", "could", "might"],
      correct: 0,
      explanation: "'Should' is used for giving advice or recommendations.",
      difficulty: "easy"
    },
    {
      id: 6,
      category: "Past Perfect",
      question: "By the time we arrived, the movie ___.",
      options: ["starts", "started", "had started", "has started"],
      correct: 2,
      explanation: "Past perfect (had + past participle) shows an action completed before another past action.",
      difficulty: "hard"
    },
    {
      id: 7,
      category: "Passive Voice",
      question: "The book ___ by millions of people worldwide.",
      options: ["reads", "is read", "has read", "reading"],
      correct: 1,
      explanation: "Passive voice: be + past participle. The book receives the action.",
      difficulty: "medium"
    },
    {
      id: 8,
      category: "Reported Speech",
      question: "She said she ___ me tomorrow.",
      options: ["will call", "would call", "calls", "is calling"],
      correct: 1,
      explanation: "In reported speech, 'will' changes to 'would' when reporting past statements.",
      difficulty: "hard"
    },
    {
      id: 9,
      category: "Gerunds vs Infinitives",
      question: "I enjoy ___ books in my free time.",
      options: ["read", "to read", "reading", "reads"],
      correct: 2,
      explanation: "The verb 'enjoy' is followed by a gerund (verb + -ing).",
      difficulty: "medium"
    },
    {
      id: 10,
      category: "Question Tags",
      question: "You're coming to the party, ___?",
      options: ["isn't you", "aren't you", "are you", "don't you"],
      correct: 1,
      explanation: "For positive statements with 'to be', use negative question tag: aren't you?",
      difficulty: "medium"
    },
    {
      id: 11,
      category: "Comparative",
      question: "This exercise is ___ than the previous one.",
      options: ["more easier", "easier", "more easy", "most easy"],
      correct: 1,
      explanation: "One-syllable adjectives form comparatives with -er, not 'more'.",
      difficulty: "easy"
    },
    {
      id: 12,
      category: "Future Perfect",
      question: "By next year, I ___ my degree.",
      options: ["will finish", "will have finished", "finish", "am finishing"],
      correct: 1,
      explanation: "Future perfect (will have + past participle) for actions completed before a future time.",
      difficulty: "hard"
    },
    {
      id: 13,
      category: "Relative Clauses",
      question: "The person ___ called you is waiting outside.",
      options: ["which", "who", "whom", "whose"],
      correct: 1,
      explanation: "Use 'who' for people as the subject of a relative clause.",
      difficulty: "medium"
    },
    {
      id: 14,
      category: "Phrasal Verbs",
      question: "Please turn ___ the lights when you leave.",
      options: ["off", "of", "out", "over"],
      correct: 0,
      explanation: "'Turn off' means to stop a device or light from working.",
      difficulty: "easy"
    },
    {
      id: 15,
      category: "Subject-Verb Agreement",
      question: "Neither of the students ___ the answer.",
      options: ["know", "knows", "knowing", "are knowing"],
      correct: 1,
      explanation: "'Neither' is singular and takes a singular verb form.",
      difficulty: "hard"
    }
  ];

  // Shuffle and select 10 questions for the session
  const [sessionQuestions, setSessionQuestions] = useState([]);

  useEffect(() => {
    const shuffled = [...grammarQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
    setSessionQuestions(shuffled);
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeout();
    }
  }, [timeLeft, isTimerActive, showResult]);

  const handleTimeout = () => {
    setShowResult(true);
    setIsTimerActive(false);
    setAnswers([...answers, { 
      question: sessionQuestions[currentQuestion]?.id, 
      selected: null, 
      correct: false,
      timedOut: true 
    }]);
    toast.error('Time\'s up! Moving to next question.');
    
    setTimeout(() => {
      handleNextQuestion();
    }, 2000);
  };

  const handleAnswerSelect = (index) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    setIsTimerActive(false);
    
    const isCorrect = index === sessionQuestions[currentQuestion].correct;
    
    if (isCorrect) {
      setScore(score + 10);
      toast.success('Correct! +10 points');
    } else {
      toast.error('Incorrect. See the explanation below.');
    }
    
    setAnswers([...answers, { 
      question: sessionQuestions[currentQuestion].id, 
      selected: index, 
      correct: isCorrect,
      timedOut: false 
    }]);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < sessionQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
      setIsTimerActive(true);
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    const accuracy = Math.round((score / (sessionQuestions.length * 10)) * 100);
    const xpEarned = Math.round(score / 5);
    
    onComplete({
      score,
      accuracy,
      xp: xpEarned,
      correctAnswers: answers.filter(a => a.correct).length,
      totalQuestions: sessionQuestions.length
    });
    
    toast.success(`Session complete! You earned ${xpEarned} XP!`, {
      duration: 5000,
      icon: '🎉'
    });
  };

  const getProgressColor = () => {
    const percentage = (timeLeft / 30) * 100;
    if (percentage > 60) return 'progress-success';
    if (percentage > 30) return 'progress-warning';
    return 'progress-error';
  };

  if (sessionQuestions.length === 0) {
    return (
      <div className="modal modal-open">
        <div className="modal-box">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  const question = sessionQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === sessionQuestions.length - 1;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-2xl mb-4 flex items-center gap-2">
          <BookOpenIcon className="w-6 h-6" />
          Grammar Exercise
        </h3>

        {/* Progress and Stats */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="text-sm opacity-70">
              Question {currentQuestion + 1} of {sessionQuestions.length}
            </div>
            <div className="badge badge-primary badge-lg">
              Score: {score}
            </div>
          </div>
          
          {/* Timer */}
          <div className="flex items-center gap-2">
            <ZapIcon className="w-5 h-5 text-warning" />
            <div className="flex flex-col">
              <span className="text-sm font-bold">{timeLeft}s</span>
              <progress 
                className={`progress w-24 ${getProgressColor()}`} 
                value={timeLeft} 
                max="30"
              ></progress>
            </div>
          </div>
        </div>

        {/* Question Progress Bar */}
        <progress 
          className="progress progress-primary w-full mb-6" 
          value={currentQuestion + 1} 
          max={sessionQuestions.length}
        ></progress>

        {/* Question Card */}
        <div className="card bg-base-200 mb-6">
          <div className="card-body">
            <div className="flex items-start justify-between mb-4">
              <div className="badge badge-outline">{question.category}</div>
              <div className={`badge ${
                question.difficulty === 'easy' ? 'badge-success' :
                question.difficulty === 'medium' ? 'badge-warning' :
                'badge-error'
              }`}>
                {question.difficulty}
              </div>
            </div>

            <h4 className="text-xl font-semibold mb-6">{question.question}</h4>

            {/* Answer Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  className={`btn btn-block justify-start text-left ${
                    showResult
                      ? index === question.correct
                        ? 'btn-success'
                        : selectedAnswer === index
                        ? 'btn-error'
                        : 'btn-disabled'
                      : selectedAnswer === index
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                >
                  <span className="mr-3 font-bold">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                  {showResult && index === question.correct && (
                    <CheckCircleIcon className="w-5 h-5 ml-auto" />
                  )}
                  {showResult && selectedAnswer === index && index !== question.correct && (
                    <XCircleIcon className="w-5 h-5 ml-auto" />
                  )}
                </button>
              ))}
            </div>

            {/* Explanation */}
            {showResult && (
              <div className="alert alert-info mt-6">
                <BookOpenIcon className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Explanation:</p>
                  <p>{question.explanation}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {showResult && (
          <div className="flex justify-center">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleNextQuestion}
            >
              {isLastQuestion ? (
                <>
                  <TrophyIcon className="w-5 h-5" />
                  Complete Exercise
                </>
              ) : (
                <>
                  Next Question
                  <ChevronRightIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Results Summary (shown at the end) */}
        {currentQuestion === sessionQuestions.length - 1 && showResult && (
          <div className="stats shadow mt-6 w-full">
            <div className="stat">
              <div className="stat-title">Correct Answers</div>
              <div className="stat-value text-success">
                {answers.filter(a => a.correct).length}/{sessionQuestions.length}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Accuracy</div>
              <div className="stat-value text-primary">
                {Math.round((answers.filter(a => a.correct).length / sessionQuestions.length) * 100)}%
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">XP Earned</div>
              <div className="stat-value text-secondary">
                +{Math.round(score / 5)}
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default GrammarExercises;