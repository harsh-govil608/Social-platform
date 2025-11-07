import { useState, useEffect } from "react";
import {
  TimerIcon,
  HeartIcon,
  VolumeIcon,
  CheckCircleIcon,
  XCircleIcon
} from "lucide-react";
import toast from "react-hot-toast";
import confetti from 'canvas-confetti';

const VocabularyChallenge = ({ challenge, onComplete }) => {
  const [selectedWords, setSelectedWords] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(challenge?.duration || 300);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [lives, setLives] = useState(3);

  // Get words from challenge content
  const words = challenge?.content?.words || [];

  useEffect(() => {
    // Shuffle and mix words and translations
    const allWords = words.flatMap(item => [
      { text: item.word, type: 'word', pairId: item.word },
      { text: item.translation, type: 'translation', pairId: item.word }
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

  // Check if all pairs are matched
  useEffect(() => {
    if (matchedPairs.length === words.length && words.length > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        onComplete({ score, completed: true });
      }, 1000);
    }
  }, [matchedPairs, words.length, score]);

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
          particleCount: 30,
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

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = challenge.language === 'spanish' ? 'es-ES' :
                      challenge.language === 'french' ? 'fr-FR' :
                      challenge.language === 'german' ? 'de-DE' :
                      challenge.language === 'italian' ? 'it-IT' : 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="alert alert-info">
        <span>Match each word with its translation!</span>
      </div>

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
        {words.map((item, idx) => (
          <div
            key={idx}
            className={`w-3 h-3 rounded-full ${
              matchedPairs.includes(item.word) ? 'bg-success' : 'bg-base-300'
            }`}
          />
        ))}
      </div>

      {/* Word Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {shuffledWords.map((word, idx) => {
          const isSelected = selectedWords.some(w => w.text === word.text && w.type === word.type);
          const isMatched = matchedPairs.includes(word.pairId);

          return (
            <button
              key={idx}
              onClick={() => handleWordClick(word)}
              disabled={isMatched}
              className={`btn btn-lg h-auto py-4 ${
                isMatched ? 'btn-success' :
                isSelected ? 'btn-primary' :
                word.type === 'word' ? 'btn-outline btn-secondary' : 'btn-outline btn-accent'
              }`}
            >
              <div className="flex flex-col items-center gap-2 w-full">
                <span className="text-base">{word.text}</span>
                {word.type === 'word' && !isMatched && (
                  <span
                    className="btn btn-xs btn-circle btn-ghost cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(word.text);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        speakWord(word.text);
                      }
                    }}
                  >
                    <VolumeIcon className="w-3 h-3" />
                  </span>
                )}
                {isMatched && <CheckCircleIcon className="w-4 h-4" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VocabularyChallenge;
