import { useState, useEffect } from "react";
import {
  TimerIcon,
  MessageCircleIcon,
  VolumeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon
} from "lucide-react";
import toast from "react-hot-toast";
import confetti from 'canvas-confetti';

const ConversationChallenge = ({ challenge, onComplete }) => {
  const [currentStep, setCurrentStep] = useState('learn'); // learn, practice, test
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(challenge?.duration || 300);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Get conversation data from challenge content
  const phrases = challenge?.content?.phrases || [];
  const language = challenge?.language || 'spanish';

  // Generate test questions
  const [testQuestions] = useState(() => {
    return phrases.map((phrase, idx) => ({
      id: idx,
      type: Math.random() > 0.5 ? 'translate' : 'complete',
      phrase: phrase,
      options: generateOptions(phrase, idx)
    }));
  });

  function generateOptions(phrase, seed) {
    const options = [phrase[language]];
    // Generate plausible wrong answers from other phrases
    const otherPhrases = phrases
      .filter(p => p[language] !== phrase[language])
      .map(p => p[language]);

    while (options.length < 4 && otherPhrases.length > 0) {
      const randomIdx = (seed * options.length) % otherPhrases.length;
      const option = otherPhrases[randomIdx];
      if (!options.includes(option)) {
        options.push(option);
      }
      otherPhrases.splice(randomIdx, 1);
    }

    return options.sort(() => 0.5 - Math.random());
  }

  useEffect(() => {
    if (currentStep === 'test') {
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

  const speakPhrase = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'spanish' ? 'es-ES' :
                      language === 'french' ? 'fr-FR' :
                      language === 'german' ? 'de-DE' :
                      language === 'italian' ? 'it-IT' : 'en-US';
      utterance.rate = 0.75;
      speechSynthesis.speak(utterance);
    }
  };

  const playConversation = () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    let index = 0;

    const playNext = () => {
      if (index >= phrases.length) {
        setIsPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(phrases[index][language]);
      utterance.lang = language === 'spanish' ? 'es-ES' :
                      language === 'french' ? 'fr-FR' :
                      language === 'german' ? 'de-DE' :
                      language === 'italian' ? 'it-IT' : 'en-US';
      utterance.rate = 0.75;

      utterance.onend = () => {
        index++;
        setTimeout(playNext, 1000);
      };

      speechSynthesis.speak(utterance);
    };

    playNext();
  };

  const handleAnswerSelect = (selectedAnswer) => {
    const currentQuestion = testQuestions[currentPhraseIndex];
    const isCorrect = selectedAnswer === currentQuestion.phrase[language];

    const newAnswer = {
      questionId: currentQuestion.id,
      selected: selectedAnswer,
      correct: currentQuestion.phrase[language],
      isCorrect
    };

    setTestAnswers([...testAnswers, newAnswer]);

    if (isCorrect) {
      setScore(score + 25);
      toast.success('Perfect! +25 points');
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 }
      });
    } else {
      toast.error('Try again next time!');
    }

    setTimeout(() => {
      if (currentPhraseIndex < testQuestions.length - 1) {
        setCurrentPhraseIndex(currentPhraseIndex + 1);
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
        <MessageCircleIcon className="w-5 h-5" />
        <span>Learn this conversation!</span>
      </div>

      <div className="flex justify-center mb-6">
        <button
          className={`btn ${isPlaying ? 'btn-error' : 'btn-primary'} gap-2`}
          onClick={playConversation}
        >
          {isPlaying ? (
            <>
              <PauseIcon className="w-5 h-5" />
              Stop Conversation
            </>
          ) : (
            <>
              <PlayIcon className="w-5 h-5" />
              Play Full Conversation
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {phrases.map((phrase, idx) => (
          <div
            key={idx}
            className={`card ${idx % 2 === 0 ? 'bg-primary/10' : 'bg-secondary/10'}`}
          >
            <div className="card-body p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-lg mb-1">{phrase[language]}</p>
                  <p className="text-sm text-base-content/70">{phrase.english}</p>
                </div>
                <button
                  className="btn btn-circle btn-sm btn-ghost"
                  onClick={() => speakPhrase(phrase[language])}
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
        onClick={() => setCurrentStep('practice')}
      >
        Practice Individually
      </button>
    </div>
  );

  const renderPracticeStep = () => (
    <div className="space-y-6">
      <div className="alert alert-success">
        <MessageCircleIcon className="w-5 h-5" />
        <span>Practice each phrase!</span>
      </div>

      <div className="space-y-4">
        {phrases.map((phrase, idx) => (
          <div key={idx} className="card bg-base-200 hover:bg-base-300 transition-colors">
            <div className="card-body p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="badge badge-primary">#{idx + 1}</span>
                    <button
                      className="btn btn-circle btn-sm"
                      onClick={() => speakPhrase(phrase[language])}
                    >
                      <VolumeIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-lg font-semibold mb-2">{phrase[language]}</p>
                  <p className="text-base-content/70">{phrase.english}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary btn-block"
        onClick={() => setCurrentStep('test')}
      >
        Take the Test
      </button>
    </div>
  );

  const renderTestStep = () => {
    if (currentPhraseIndex >= testQuestions.length) {
      return (
        <div className="text-center space-y-4">
          <CheckCircleIcon className="w-16 h-16 mx-auto text-success" />
          <h2 className="text-2xl font-bold">Test Complete!</h2>
          <p>Final Score: {score}</p>
        </div>
      );
    }

    const currentQuestion = testQuestions[currentPhraseIndex];
    const hasAnswered = testAnswers.some(a => a.questionId === currentQuestion.id);

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
          {testQuestions.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full ${
                idx < currentPhraseIndex
                  ? 'bg-success'
                  : idx === currentPhraseIndex
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
              Question {currentPhraseIndex + 1} of {testQuestions.length}
            </h3>

            <div className="alert mb-4">
              <MessageCircleIcon className="w-5 h-5" />
              <p className="text-lg">
                Translate: <strong>"{currentQuestion.phrase.english}"</strong>
              </p>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const answer = testAnswers.find(a => a.questionId === currentQuestion.id);
                const isSelected = answer?.selected === option;
                const isCorrect = option === currentQuestion.phrase[language];

                return (
                  <button
                    key={idx}
                    onClick={() => !hasAnswered && handleAnswerSelect(option)}
                    disabled={hasAnswered}
                    className={`btn btn-lg btn-block justify-start text-left ${
                      hasAnswered
                        ? isCorrect
                          ? 'btn-success'
                          : isSelected
                          ? 'btn-error'
                          : 'btn-outline'
                        : 'btn-outline'
                    }`}
                  >
                    <span className="flex-1">{option}</span>
                    {hasAnswered && isCorrect && <CheckCircleIcon className="w-5 h-5" />}
                    {hasAnswered && isSelected && !isCorrect && <XCircleIcon className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>

            {hasAnswered && (
              <div className="mt-4 flex justify-center">
                <button
                  className="btn btn-circle"
                  onClick={() => speakPhrase(currentQuestion.phrase[language])}
                >
                  <VolumeIcon className="w-5 h-5" />
                </button>
              </div>
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
      {currentStep === 'test' && renderTestStep()}
    </div>
  );
};

export default ConversationChallenge;
