import { useState, useEffect } from "react";
import {
  TimerIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  VolumeIcon,
  LightbulbIcon
} from "lucide-react";
import toast from "react-hot-toast";
import confetti from 'canvas-confetti';

const GrammarChallenge = ({ challenge, onComplete }) => {
  const [currentStep, setCurrentStep] = useState('learn'); // learn, practice, quiz
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(challenge?.duration || 300);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Get grammar data from challenge content
  const rules = challenge?.content?.rules || [];
  const examples = challenge?.content?.examples || [];
  const language = challenge?.language || 'spanish';

  // Generate quiz questions from examples
  const [quizQuestions] = useState(() => {
    return examples.map((example, idx) => ({
      id: idx,
      question: `Translate: "${example.english}"`,
      correctAnswer: example[language],
      options: generateOptions(example[language], idx),
      hint: rules[idx % rules.length]
    }));
  });

  function generateOptions(correctAnswer, seed) {
    const options = [correctAnswer];
    // Generate plausible wrong answers by shuffling words or using other examples
    const otherExamples = examples
      .filter(ex => ex[language] !== correctAnswer)
      .map(ex => ex[language]);

    while (options.length < 4 && otherExamples.length > 0) {
      const randomIdx = (seed * options.length) % otherExamples.length;
      const option = otherExamples[randomIdx];
      if (!options.includes(option)) {
        options.push(option);
      }
      otherExamples.splice(randomIdx, 1);
    }

    // Shuffle options
    return options.sort(() => 0.5 - Math.random());
  }

  useEffect(() => {
    if (currentStep === 'quiz') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            finishChallenge();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentStep]);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'spanish' ? 'es-ES' :
                      language === 'french' ? 'fr-FR' :
                      language === 'german' ? 'de-DE' :
                      language === 'italian' ? 'it-IT' : 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleAnswerSelect = (selectedAnswer) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const newAnswer = {
      questionId: currentQuestion.id,
      selected: selectedAnswer,
      correct: currentQuestion.correctAnswer,
      isCorrect
    };

    setQuizAnswers([...quizAnswers, newAnswer]);

    if (isCorrect) {
      setScore(score + 20);
      toast.success('Correct! +20 points');
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 }
      });
    } else {
      toast.error('Not quite right');
    }

    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowHint(false);
      } else {
        finishChallenge();
      }
    }, 1000);
  };

  const finishChallenge = () => {
    const finalScore = score + Math.floor(timeLeft / 10);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      onComplete({ score: finalScore, completed: true });
    }, 1000);
  };

  const renderLearnStep = () => (
    <div className="space-y-6">
      <div className="alert alert-info">
        <BookOpenIcon className="w-5 h-5" />
        <span>Study these grammar rules carefully!</span>
      </div>

      <div className="space-y-4">
        {rules.map((rule, idx) => (
          <div key={idx} className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg">Rule {idx + 1}</h3>
              <p className="text-base">{rule}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary btn-block"
        onClick={() => setCurrentStep('practice')}
      >
        Continue to Examples
      </button>
    </div>
  );

  const renderPracticeStep = () => (
    <div className="space-y-6">
      <div className="alert alert-success">
        <LightbulbIcon className="w-5 h-5" />
        <span>See the rules in action!</span>
      </div>

      <div className="space-y-4">
        {examples.map((example, idx) => (
          <div key={idx} className="card bg-base-200">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-lg mb-2">{example[language]}</p>
                  <p className="text-base-content/70">{example.english}</p>
                </div>
                <button
                  className="btn btn-circle btn-sm btn-ghost"
                  onClick={() => speakText(example[language])}
                >
                  <VolumeIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary btn-block"
        onClick={() => setCurrentStep('quiz')}
      >
        Start Quiz
      </button>
    </div>
  );

  const renderQuizStep = () => {
    if (currentQuestionIndex >= quizQuestions.length) {
      return (
        <div className="text-center space-y-4">
          <CheckCircleIcon className="w-16 h-16 mx-auto text-success" />
          <h2 className="text-2xl font-bold">Quiz Complete!</h2>
          <p>Final Score: {score}</p>
        </div>
      );
    }

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const hasAnswered = quizAnswers.some(a => a.questionId === currentQuestion.id);

    return (
      <div className="space-y-6">
        {/* Timer and Score */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TimerIcon className="w-5 h-5" />
            <span className="font-bold">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <span className="font-bold">Score: {score}</span>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2">
          {quizQuestions.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full ${
                idx < currentQuestionIndex
                  ? 'bg-success'
                  : idx === currentQuestionIndex
                  ? 'bg-primary'
                  : 'bg-base-300'
              }`}
            />
          ))}
        </div>

        {/* Question */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="text-xl font-semibold mb-4">
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </h3>
            <p className="text-lg mb-4">{currentQuestion.question}</p>

            {showHint && (
              <div className="alert alert-warning mb-4">
                <LightbulbIcon className="w-4 h-4" />
                <span className="text-sm">{currentQuestion.hint}</span>
              </div>
            )}

            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const answer = quizAnswers.find(a => a.questionId === currentQuestion.id);
                const isSelected = answer?.selected === option;
                const isCorrect = option === currentQuestion.correctAnswer;

                return (
                  <button
                    key={idx}
                    onClick={() => !hasAnswered && handleAnswerSelect(option)}
                    disabled={hasAnswered}
                    className={`btn btn-lg btn-block justify-start ${
                      hasAnswered
                        ? isCorrect
                          ? 'btn-success'
                          : isSelected
                          ? 'btn-error'
                          : 'btn-outline'
                        : 'btn-outline'
                    }`}
                  >
                    <span className="flex-1 text-left">{option}</span>
                    {hasAnswered && isCorrect && <CheckCircleIcon className="w-5 h-5" />}
                    {hasAnswered && isSelected && !isCorrect && <XCircleIcon className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>

            {!hasAnswered && (
              <button
                className="btn btn-ghost btn-sm mt-4"
                onClick={() => setShowHint(!showHint)}
              >
                {showHint ? 'Hide' : 'Show'} Hint
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {currentStep === 'learn' && renderLearnStep()}
      {currentStep === 'practice' && renderPracticeStep()}
      {currentStep === 'quiz' && renderQuizStep()}
    </div>
  );
};

export default GrammarChallenge;
