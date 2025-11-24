import { useState, useEffect, useRef } from "react";
import { 
  MessageSquareIcon, 
  MicIcon, 
  MicOffIcon,
  TimerIcon,
  SendIcon,
  VolumeIcon,
  StarIcon,
  TrophyIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ChevronRightIcon,
  RefreshCwIcon,
  CrownIcon,
  SparklesIcon,
  HeartIcon,
  ZapIcon
} from "lucide-react";
import toast from "react-hot-toast";
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router';

const FiveMinuteConversation = ({ 
  language = 'spanish', 
  userLevel = 'beginner', // eslint-disable-line no-unused-vars
  onComplete
}) => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [conversationStats, setConversationStats] = useState({
    wordsUsed: 0,
    sentencesCompleted: 0,
    grammarScore: 100,
    fluencyScore: 0,
    vocabularyScore: 0
  });
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Conversation scenarios with difficulty levels
  const scenarios = {
    beginner: [
      {
        id: 'travel-planning',
        title: 'Travel Planning',
        icon: '✈️',
        description: 'Plan your dream vacation with a travel expert',
        context: 'You want to plan an amazing trip',
        aiPersona: 'Sofia - World traveler',
        suggestedPhrases: ['Where is...', 'How do I get to...', 'Is it far?'],
        bonusObjectives: ['Ask about distance', 'Confirm directions', 'Thank the person'],
        xpReward: 100,
        coinsReward: 20
      }
    ],
    intermediate: [
      {
        id: 'medical-appointment',
        title: 'Medical Visit',
        icon: '🏥',
        description: 'Discuss health concerns with a caring family physician',
        context: 'You are visiting Dr. Martinez for a check-up',
        aiPersona: 'Dr. Sarah Martinez',
        suggestedPhrases: ['I have been feeling...', 'It hurts when...', 'How often should I...'],
        bonusObjectives: ['Describe 3 symptoms', 'Ask about medication', 'Schedule follow-up'],
        xpReward: 150,
        coinsReward: 30,
        premium: false
      },
      {
        id: 'job-interview',
        title: 'Job Interview',
        icon: '💼',
        description: 'Interview for a software developer position',
        context: 'You are at TechInnovate for a job interview',
        aiPersona: 'Robert Chen - Hiring Manager',
        suggestedPhrases: ['I have experience in...', 'My strengths are...', 'I am passionate about...'],
        bonusObjectives: ['Describe past experience', 'Ask about company culture', 'Negotiate salary'],
        xpReward: 200,
        coinsReward: 40,
        premium: false
      }
    ],
    advanced: [
      {
        id: 'friendly-debate',
        title: 'Friendly Debate',
        icon: '🎭',
        description: 'Debate whether AI will replace human creativity',
        context: 'You are at a campus coffee shop having a friendly debate',
        aiPersona: 'Alex - Witty university student',
        suggestedPhrases: ['I believe that...', 'On the other hand...', 'Research shows...'],
        bonusObjectives: ['Use 3 arguments', 'Counter an argument', 'Find common ground'],
        xpReward: 250,
        coinsReward: 50,
        premium: false
      },
      {
        id: 'tech-support',
        title: 'Tech Support',
        icon: '💻',
        description: 'Get help with computer problems',
        context: 'You need help fixing your computer',
        aiPersona: 'Jamie - Patient tech specialist',
        suggestedPhrases: ['My computer won\'t...', 'Where do I find...', 'It\'s showing an error...'],
        bonusObjectives: ['Describe the problem', 'Follow instructions', 'Confirm it is fixed'],
        xpReward: 200,
        coinsReward: 40,
        premium: false
      }
    ]
  };

  // AI Response Generator (simulated)
  const generateAIResponse = (userMessage, scenario) => {
    const responses = {
      cafe: [
        "Welcome to our café! What can I get for you today?",
        "That's a great choice! Would you like it hot or iced?",
        "Certainly! That will be $4.50. Would you like anything else?",
        "The weather is lovely today, perfect for sitting outside!",
        "Your order will be ready in just a moment."
      ],
      directions: [
        "Of course! I'd be happy to help. Where are you trying to go?",
        "The train station is about 10 minutes walk from here.",
        "Go straight for two blocks, then turn left at the traffic lights.",
        "You'll see a big blue sign - you can't miss it!",
        "If you get lost, just ask anyone - it's a popular destination."
      ],
      shopping: [
        "Hello! How can I help you today?",
        "We have that in sizes S, M, L, and XL. What size do you need?",
        "That color would look great on you! We also have it in blue.",
        "There's a 20% discount today on all items!",
        "Our return policy is 30 days with the receipt."
      ]
    };

    const scenarioResponses = responses[scenario.id] || responses.cafe;
    return scenarioResponses[Math.floor(Math.random() * scenarioResponses.length)];
  };

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'spanish' ? 'es-ES' : 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setUserInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [language]);

  // Timer
  useEffect(() => {
    let interval;
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            completeConversation();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isPaused, timeLeft]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = (scenario) => {
    // Navigate to the AI-powered conversation practice page for ALL scenarios
    navigate('/conversation-practice');
    
    // Store selected scenario in localStorage so the conversation page knows which one to start
    localStorage.setItem('selectedScenario', scenario.id);
    localStorage.setItem('scenarioTitle', scenario.title);
    
    toast.success(`Launching AI Conversation: ${scenario.title}`, {
      icon: scenario.icon,
      duration: 2000
    });
  };

  const sendMessage = () => {
    if (!userInput.trim()) return;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Analyze message quality
    const wordCount = userInput.split(' ').length;
    const hasGrammarError = Math.random() > 0.7; // Simulated grammar check
    const usedTargetPhrase = currentScenario.suggestedPhrases.some(phrase => 
      userInput.toLowerCase().includes(phrase.toLowerCase())
    );

    // Update stats
    setConversationStats(prev => ({
      ...prev,
      wordsUsed: prev.wordsUsed + wordCount,
      sentencesCompleted: prev.sentencesCompleted + 1,
      grammarScore: hasGrammarError ? Math.max(0, prev.grammarScore - 5) : prev.grammarScore,
      fluencyScore: Math.min(100, prev.fluencyScore + 10),
      vocabularyScore: usedTargetPhrase ? Math.min(100, prev.vocabularyScore + 15) : prev.vocabularyScore + 5
    }));

    // Calculate points
    let points = wordCount * 5;
    if (usedTargetPhrase) {
      points += 20;
      toast.success('Great use of suggested phrase! +20 bonus', { duration: 2000 });
    }
    if (!hasGrammarError) {
      points += 10;
    }

    setScore(prev => prev + points);

    // Generate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateAIResponse(userInput, currentScenario),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      
      // Speech synthesis (optional)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiResponse.content);
        utterance.lang = language === 'spanish' ? 'es-ES' : 'en-US';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }
    }, 1000);

    setUserInput('');
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in your browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      toast.success('Listening...', { duration: 2000 });
    }
  };

  const useHint = () => {
    if (hints <= 0) {
      toast.error('No hints remaining!');
      return;
    }

    const hint = currentScenario.suggestedPhrases[Math.floor(Math.random() * currentScenario.suggestedPhrases.length)];
    toast.success(`Try saying: "${hint}"`, { duration: 5000, icon: '💡' });
    setHints(prev => prev - 1);
    setScore(prev => Math.max(0, prev - 10)); // Penalty for using hint
  };

  const completeConversation = () => {
    setIsActive(false);
    setShowFeedback(true);

    const totalScore = score + (conversationStats.grammarScore / 2) + 
                      (conversationStats.fluencyScore / 2) + 
                      (conversationStats.vocabularyScore / 2);
    
    const earnedXP = Math.floor((totalScore / 300) * currentScenario.xpReward);
    const earnedCoins = Math.floor((totalScore / 300) * currentScenario.coinsReward);

    // Check bonus objectives
    const bonusesCompleted = currentScenario.bonusObjectives.filter(() => 
      Math.random() > 0.5 // Simulated objective completion
    ).length;

    const bonusXP = bonusesCompleted * 25;
    const bonusCoins = bonusesCompleted * 5;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const result = {
      scenario: currentScenario.id,
      score: totalScore,
      xp: earnedXP + bonusXP,
      coins: earnedCoins + bonusCoins,
      stats: conversationStats,
      bonusesCompleted,
      duration: 300 - timeLeft
    };

    onComplete?.(result);
  };

  const resetConversation = () => {
    setIsActive(false);
    setCurrentScenario(null);
    setMessages([]);
    setUserInput('');
    setTimeLeft(300);
    setScore(0);
    setHints(3);
    setShowFeedback(false);
    setConversationStats({
      wordsUsed: 0,
      sentencesCompleted: 0,
      grammarScore: 100,
      fluencyScore: 0,
      vocabularyScore: 0
    });
  };

  // Show feedback modal
  if (showFeedback && currentScenario) {
    return (
      <div className="modal modal-open">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-2xl mb-6 text-center">
            Conversation Complete! 🎉
          </h3>

          {/* Score Summary */}
          <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6">
            <div className="stat">
              <div className="stat-figure text-primary">
                <TrophyIcon className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Score</div>
              <div className="stat-value text-primary">{score}</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-secondary">
                <StarIcon className="w-8 h-8" />
              </div>
              <div className="stat-title">XP Earned</div>
              <div className="stat-value text-secondary">+{Math.floor((score / 300) * currentScenario.xpReward)}</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-accent">
                <div className="w-8 h-8 bg-yellow-500 rounded-full" />
              </div>
              <div className="stat-title">Coins</div>
              <div className="stat-value text-accent">+{Math.floor((score / 300) * currentScenario.coinsReward)}</div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Grammar</span>
                <span className="text-sm">{conversationStats.grammarScore}%</span>
              </div>
              <progress className="progress progress-primary" value={conversationStats.grammarScore} max="100" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Fluency</span>
                <span className="text-sm">{conversationStats.fluencyScore}%</span>
              </div>
              <progress className="progress progress-secondary" value={conversationStats.fluencyScore} max="100" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Vocabulary</span>
                <span className="text-sm">{conversationStats.vocabularyScore}%</span>
              </div>
              <progress className="progress progress-accent" value={conversationStats.vocabularyScore} max="100" />
            </div>
          </div>

          {/* Bonus Objectives */}
          <div className="card bg-base-200 mb-6">
            <div className="card-body">
              <h4 className="font-bold mb-2">Bonus Objectives</h4>
              <div className="space-y-2">
                {currentScenario.bonusObjectives.map((objective, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {Math.random() > 0.5 ? (
                      <CheckCircleIcon className="w-5 h-5 text-success" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-base-300 rounded-full" />
                    )}
                    <span className="text-sm">{objective}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button className="btn btn-primary" onClick={resetConversation}>
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Try Another
            </button>
            <button className="btn" onClick={() => setShowFeedback(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <>
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">5-Minute Conversation Practice</h2>
            <p className="text-lg opacity-80">
              Practice real-world conversations with AI-powered feedback
            </p>
          </div>

          {/* Scenario Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(scenarios).map(([level, levelScenarios]) => (
              <div key={level} className="space-y-4">
                <h3 className="text-lg font-bold capitalize flex items-center gap-2">
                  {level === 'beginner' && <ZapIcon className="w-5 h-5 text-success" />}
                  {level === 'intermediate' && <SparklesIcon className="w-5 h-5 text-warning" />}
                  {level === 'advanced' && <TrophyIcon className="w-5 h-5 text-error" />}
                  {level} Level
                </h3>
                {levelScenarios.map(scenario => (
                  <div 
                    key={scenario.id}
                    className="card bg-base-100 shadow-lg hover:shadow-xl transition-all cursor-pointer relative"
                    onClick={() => startConversation(scenario)}
                  >
                    <div className="absolute top-2 right-2 badge badge-primary badge-sm">
                      AI Powered
                    </div>
                    <div className="card-body">
                      <div className="flex items-start justify-between">
                        <div className="text-4xl mr-3">{scenario.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-bold flex items-center gap-2">
                            {scenario.title}
                            <span className="text-xs text-primary">✨ Real AI</span>
                          </h4>
                          <p className="text-sm opacity-70 mt-1">{scenario.description}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-xs font-semibold">+{scenario.xpReward} XP</span>
                            <span className="text-xs font-semibold">+{scenario.coinsReward} Coins</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-xl">{currentScenario.title}</h3>
            <p className="text-sm opacity-70">{currentScenario.context}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className="flex items-center gap-2">
              <TimerIcon className="w-5 h-5" />
              <span className="font-mono font-bold">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            {/* Score */}
            <div className="badge badge-primary badge-lg">
              Score: {score}
            </div>
            {/* Hints */}
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < hints ? 'bg-warning' : 'bg-base-300'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Objectives */}
        <div className="bg-base-200 p-3 rounded-lg mb-4">
          <p className="text-sm font-semibold mb-2">Bonus Objectives:</p>
          <div className="flex flex-wrap gap-2">
            {currentScenario.bonusObjectives.map((obj, idx) => (
              <span key={idx} className="badge badge-sm">{obj}</span>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-base-200 rounded-lg p-4 mb-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`chat ${message.type === 'user' ? 'chat-end' : 'chat-start'}`}
            >
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  {message.type === 'user' ? (
                    <div className="bg-primary text-primary-content flex items-center justify-center h-full">
                      You
                    </div>
                  ) : message.type === 'ai' ? (
                    <div className="bg-secondary text-secondary-content flex items-center justify-center h-full">
                      AI
                    </div>
                  ) : null}
                </div>
              </div>
              <div className={`chat-bubble ${
                message.type === 'user' ? 'chat-bubble-primary' : 
                message.type === 'system' ? 'chat-bubble-info' : 
                'chat-bubble-secondary'
              }`}>
                {message.content}
              </div>
              <div className="chat-footer opacity-50">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <button
            className="btn btn-circle"
            onClick={useHint}
            disabled={hints === 0}
          >
            💡
          </button>
          <button
            className={`btn btn-circle ${isRecording ? 'btn-error' : 'btn-primary'}`}
            onClick={toggleRecording}
          >
            {isRecording ? <MicOffIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
          </button>
          <input
            type="text"
            placeholder="Type your response..."
            className="input input-bordered flex-1"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button 
            className="btn btn-primary"
            onClick={sendMessage}
            disabled={!userInput.trim()}
          >
            <SendIcon className="w-5 h-5" />
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
          <button
            className="btn btn-error"
            onClick={completeConversation}
          >
            End
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiveMinuteConversation;