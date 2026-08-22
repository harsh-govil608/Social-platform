import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MicIcon, MicOffIcon, VolumeIcon, RefreshCwIcon, CheckCircleIcon, XCircleIcon, TrendingUpIcon, SkipForwardIcon, FilterIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPronunciationPhrases, completePronunciationPhrase, getPracticeStats } from '../lib/api';

const PronunciationPractice = ({ language, onClose, onComplete }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [completedInSession, setCompletedInSession] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const recognitionRef = useRef(null);

  // Fetch phrases from database
  const { data: phrases = [], isLoading: loadingPhrases, refetch: refetchPhrases } = useQuery({
    queryKey: ['pronunciationPhrases', selectedDifficulty, selectedCategory],
    queryFn: () => getPronunciationPhrases(selectedDifficulty, selectedCategory, 20)
  });

  // Fetch practice stats
  const { data: stats } = useQuery({
    queryKey: ['practiceStats'],
    queryFn: getPracticeStats
  });

  const currentPhrase = phrases[currentPhraseIndex];

  // Categories available
  const categories = [
    { value: 'greetings', label: 'Greetings' },
    { value: 'introductions', label: 'Introductions' },
    { value: 'questions', label: 'Questions' },
    { value: 'directions', label: 'Directions' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'travel', label: 'Travel' },
    { value: 'daily', label: 'Daily Life' },
    { value: 'business', label: 'Business' },
    { value: 'polite', label: 'Polite Expressions' }
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US'; 

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          evaluatePronunciation(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else {
          toast.error('Speech recognition error. Please try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      toast.error('Speech recognition is not supported in your browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
      setFeedback('');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const evaluatePronunciation = async (spokenText) => {
    if (!currentPhrase) return;

    const target = currentPhrase.text.toLowerCase();
    const spoken = spokenText.toLowerCase().trim();
    
    // Calculate similarity score
    const similarity = calculateSimilarity(target, spoken);
    const pronunciationScore = Math.round(similarity * 100);
    
    setScore(pronunciationScore);
    setAttempts(attempts + 1);

    // Generate feedback
    if (pronunciationScore >= 90) {
      setFeedback('Excellent! Your pronunciation is perfect! 🎉');
      setSessionScore(sessionScore + 20);
      
      // Record completion in database
      if (currentPhrase._id && !completedInSession.includes(currentPhrase._id)) {
        try {
          await completePronunciationPhrase(currentPhrase._id, pronunciationScore, pronunciationScore);
          setCompletedInSession([...completedInSession, currentPhrase._id]);
        } catch (error) {
          console.error('Error recording phrase completion:', error);
        }
      }
      
      // Auto-advance after success
      setTimeout(() => {
        nextPhrase();
      }, 2000);
    } else if (pronunciationScore >= 70) {
      setFeedback('Good job! Almost there. Try once more for perfect pronunciation. 👍');
      setSessionScore(sessionScore + 10);
    } else if (pronunciationScore >= 50) {
      setFeedback('Getting better! Focus on speaking more clearly. 💪');
      setSessionScore(sessionScore + 5);
    } else {
      setFeedback('Keep practicing! Listen to the correct pronunciation and try again. 🎯');
    }
  };

  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const speakPhrase = () => {
    if ('speechSynthesis' in window && currentPhrase) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(currentPhrase.text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const speakUserText = () => {
    if ('speechSynthesis' in window && transcript) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.1; // Slightly different pitch to distinguish
      window.speechSynthesis.speak(utterance);
    }
  };

  const nextPhrase = () => {
    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1);
      setTranscript('');
      setFeedback('');
      setScore(0);
      setAttempts(0);
    } else {
      // Load more phrases or complete session
      completeSession();
    }
  };

  const skipPhrase = () => {
    nextPhrase();
  };

  const completeSession = () => {
    const xpEarned = Math.round(sessionScore / 10);
    onComplete({ 
      score: sessionScore, 
      xp: xpEarned,
      phrasesCompleted: completedInSession.length 
    });
    toast.success(`Session complete! You earned ${xpEarned} XP!`);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPhraseIndex(0);
    setTranscript('');
    setFeedback('');
    setScore(0);
    setAttempts(0);
  };

  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setCurrentPhraseIndex(0);
    setTranscript('');
    setFeedback('');
    setScore(0);
    setAttempts(0);
  };

  if (loadingPhrases) {
    return (
      <div className="modal modal-open">
        <div className="modal-box">
          <div className="flex items-center justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <h3 className="font-bold text-2xl mb-4">Pronunciation Practice</h3>
        
        {/* Session Stats */}
        <div className="stats stats-horizontal shadow mb-6 w-full">
          <div className="stat">
            <div className="stat-title">Session Score</div>
            <div className="stat-value text-primary">{sessionScore}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Phrases Completed</div>
            <div className="stat-value text-secondary">{completedInSession.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Practiced</div>
            <div className="stat-value text-accent">{stats?.totalPhrasesPracticed || 0}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Difficulty</span>
            </label>
            <select 
              className="select select-bordered select-sm"
              value={selectedDifficulty}
              onChange={(e) => handleDifficultyChange(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select 
              className="select select-bordered select-sm"
              value={selectedCategory || ''}
              onChange={(e) => handleCategoryChange(e.target.value || null)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Phrase */}
        {currentPhrase && (
          <div className="card bg-base-200 mb-6">
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-outline">{currentPhrase.category}</span>
                    <span className={`badge ${
                      currentPhrase.difficulty === 'easy' ? 'badge-success' :
                      currentPhrase.difficulty === 'medium' ? 'badge-warning' :
                      'badge-error'
                    }`}>
                      {currentPhrase.difficulty}
                    </span>
                    {currentPhrase.completed && (
                      <span className="badge badge-info">Completed</span>
                    )}
                  </div>
                  <p className="text-sm opacity-70 mb-2">{currentPhrase.translation}</p>
                  <h4 className="text-2xl font-bold mb-2">{currentPhrase.text}</h4>
                  {currentPhrase.phonetic && (
                    <p className="text-sm text-info mb-2">Phonetic: {currentPhrase.phonetic}</p>
                  )}
                  <p className="text-sm text-info">💡 Tip: {currentPhrase.tips}</p>
                  {currentPhrase.contextExample && (
                    <p className="text-sm opacity-70 mt-2">Context: {currentPhrase.contextExample}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-70">Phrase {currentPhraseIndex + 1}/{phrases.length}</div>
                </div>
              </div>

              {/* Listen Buttons */}
              <div className="flex gap-2 mb-4">
                <button 
                  className="btn btn-outline btn-primary"
                  onClick={speakPhrase}
                >
                  <VolumeIcon className="w-5 h-5" />
                  Listen to Correct Pronunciation
                </button>
                {transcript && (
                  <button 
                    className="btn btn-outline btn-secondary"
                    onClick={speakUserText}
                  >
                    <VolumeIcon className="w-5 h-5" />
                    Play What You Said
                  </button>
                )}
              </div>

              {/* Your Pronunciation */}
              {transcript && (
                <div className="bg-base-100 p-4 rounded-lg mb-4">
                  <p className="text-sm opacity-70 mb-1">You said:</p>
                  <p className="text-lg font-semibold">{transcript}</p>
                </div>
              )}

              {/* Feedback */}
              {feedback && (
                <div className={`alert ${
                  score >= 90 ? 'alert-success' :
                  score >= 70 ? 'alert-info' :
                  score >= 50 ? 'alert-warning' :
                  'alert-error'
                } mb-4`}>
                  <div className="flex items-center gap-2">
                    {score >= 70 ? 
                      <CheckCircleIcon className="w-6 h-6" /> : 
                      <XCircleIcon className="w-6 h-6" />
                    }
                    <span>{feedback}</span>
                  </div>
                </div>
              )}

              {/* Score Visualization */}
              {score > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Accuracy</span>
                    <span className="font-bold">{score}%</span>
                  </div>
                  <progress 
                    className={`progress ${
                      score >= 90 ? 'progress-success' :
                      score >= 70 ? 'progress-info' :
                      score >= 50 ? 'progress-warning' :
                      'progress-error'
                    }`}
                    value={score} 
                    max="100"
                  ></progress>
                </div>
              )}

              {/* Common Mistakes */}
              {currentPhrase.commonMistakes && currentPhrase.commonMistakes.length > 0 && (
                <div className="text-sm opacity-70 mt-2">
                  <p className="font-semibold">Common mistakes to avoid:</p>
                  <ul className="list-disc list-inside">
                    {currentPhrase.commonMistakes.map((mistake, idx) => (
                      <li key={idx}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Attempt Counter */}
              <p className="text-sm opacity-70">
                Attempt {attempts} {attempts > 0 && score < 90 && '- Keep trying!'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            className={`btn btn-lg ${isListening ? 'btn-error' : 'btn-primary'}`}
            onClick={isListening ? stopListening : startListening}
          >
            {isListening ? (
              <>
                <MicOffIcon className="w-6 h-6 animate-pulse" />
                Stop Recording
              </>
            ) : (
              <>
                <MicIcon className="w-6 h-6" />
                Start Speaking
              </>
            )}
          </button>

          <button
            className="btn btn-lg btn-outline"
            onClick={skipPhrase}
          >
            <SkipForwardIcon className="w-6 h-6" />
            Skip Phrase
          </button>
        </div>

        {/* Progress Overview */}
        {stats && (
          <div className="mt-6 p-4 bg-base-200 rounded-lg">
            <h4 className="font-semibold mb-2">Your Progress</h4>
            <div className="flex justify-between text-sm">
              <span>Average Accuracy: {stats.averageAccuracy}%</span>
              <span>Total Practiced: {stats.totalPhrasesPracticed} phrases</span>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="modal-action">
          <button 
            className="btn btn-success"
            onClick={completeSession}
          >
            <TrendingUpIcon className="w-5 h-5" />
            Complete Session (+{Math.round(sessionScore / 10)} XP)
          </button>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default PronunciationPractice;