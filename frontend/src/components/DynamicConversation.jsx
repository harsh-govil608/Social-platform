import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquareIcon, 
  MicIcon, 
  VolumeIcon,
  SendIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  RefreshCwIcon,
  UserIcon,
  BotIcon,
  LightbulbIcon,
  TrophyIcon,
  BookOpenIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';

const DynamicConversation = ({ topic, onClose, onComplete }) => {
  const [sessionId, setSessionId] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [performance, setPerformance] = useState({
    currentScore: 0,
    grammarScore: 0,
    vocabularyScore: 0,
    fluencyScore: 0
  });
  const [sessionStatus, setSessionStatus] = useState({
    turnCount: 0,
    stage: 'greeting',
    completed: false,
    xpEarned: 0
  });
  const [feedback, setFeedback] = useState(null);
  const [suggestedResponses, setSuggestedResponses] = useState([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Speech recognition failed');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
    };
  }, []);

  // Start conversation when component mounts
  useEffect(() => {
    startConversation();
  }, [topic]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startConversation = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/conversations/start', { topic });
      
      setSessionId(response.data.sessionId);
      setScenario(response.data.scenario);
      setSuggestedResponses(response.data.suggestedResponses || []);
      
      // Add initial messages
      setMessages([
        {
          id: Date.now(),
          type: 'system',
          text: `📍 ${response.data.scenario.context}`,
          timestamp: new Date()
        },
        {
          id: Date.now() + 1,
          type: 'bot',
          text: response.data.message,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text = userInput) => {
    if (!text.trim() || !sessionId || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsTyping(true);
    setSuggestedResponses([]);

    try {
      const response = await axiosInstance.post('/conversations/message', {
        sessionId,
        message: text
      });

      const data = response.data;
      
      // Update feedback
      setFeedback(data.feedback);
      
      // Update performance
      setPerformance(data.performance);
      
      // Update session status
      setSessionStatus(data.sessionStatus);
      
      // Add bot response
      setTimeout(() => {
        const botMessage = {
          id: Date.now(),
          type: 'bot',
          text: data.message,
          timestamp: new Date(),
          feedback: data.feedback
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        
        // Set suggested responses
        setSuggestedResponses(data.suggestedResponses || []);
        
        // Show feedback toast
        if (data.feedback && data.feedback.suggestion) {
          toast.info(data.feedback.suggestion, { duration: 4000 });
        }
        
        // Show grammar tips
        if (data.grammarTips && data.grammarTips.length > 0) {
          data.grammarTips.forEach(tip => {
            toast.info(tip, { duration: 3000, icon: '📝' });
          });
        }
        
        // Check if conversation completed
        if (data.sessionStatus.completed) {
          handleCompleteSession(data.sessionStatus.xpEarned);
        }
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setIsTyping(false);
    }
  };

  const getHint = async () => {
    if (!sessionId) return;
    
    try {
      const response = await axiosInstance.get(`/conversations/hint/${sessionId}`);
      const hints = response.data.hints;
      
      if (hints && hints.length > 0) {
        toast.info(`Hint: Try saying "${hints[0]}"`, { duration: 5000, icon: '💡' });
        setHintsUsed(response.data.hintsUsed);
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      toast.error('Failed to get hint');
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Error starting recognition:', e);
        toast.error('Failed to start voice input');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSuggestedResponse = (response) => {
    setUserInput(response);
    handleSendMessage(response);
  };

  const handleCompleteSession = (xpEarned) => {
    toast.success(`Conversation complete! You earned ${xpEarned} XP!`, {
      duration: 5000,
      icon: '🎉'
    });
    
    setTimeout(() => {
      onComplete({
        topic,
        score: performance.currentScore,
        xp: xpEarned,
        sessionId
      });
    }, 2000);
  };

  const restartConversation = () => {
    setMessages([]);
    setSessionId(null);
    setScenario(null);
    setPerformance({
      currentScore: 0,
      grammarScore: 0,
      vocabularyScore: 0,
      fluencyScore: 0
    });
    setSessionStatus({
      turnCount: 0,
      stage: 'greeting',
      completed: false,
      xpEarned: 0
    });
    setFeedback(null);
    setSuggestedResponses([]);
    setHintsUsed(0);
    startConversation();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-5xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-2xl flex items-center gap-2">
            <MessageSquareIcon className="w-6 h-6" />
            {topic} Conversation
          </h3>
          <div className="flex items-center gap-3">
            <div className="badge badge-primary badge-lg gap-1">
              <TrophyIcon className="w-4 h-4" />
              Score: {performance.currentScore}
            </div>
            <div className="badge badge-outline">
              Turn {sessionStatus.turnCount}
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={restartConversation}
              disabled={isLoading}
            >
              <RefreshCwIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scenario Info */}
        {scenario && (
          <div className="bg-base-200 rounded-lg p-3 mb-4">
            <h4 className="font-semibold text-lg">{scenario.title}</h4>
            <p className="text-sm opacity-70">{scenario.context}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`badge badge-sm ${
                scenario.difficulty === 'easy' ? 'badge-success' :
                scenario.difficulty === 'medium' ? 'badge-warning' :
                'badge-error'
              }`}>
                {scenario.difficulty}
              </span>
              <span className="text-xs opacity-60">
                Stage: {sessionStatus.stage}
              </span>
            </div>
          </div>
        )}

        {/* Performance Indicators */}
        {feedback && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="stat bg-base-200 rounded-lg py-2">
              <div className="stat-title text-xs">Grammar</div>
              <div className="stat-value text-lg">{feedback.grammar}/10</div>
            </div>
            <div className="stat bg-base-200 rounded-lg py-2">
              <div className="stat-title text-xs">Vocabulary</div>
              <div className="stat-value text-lg">{feedback.vocabulary}/10</div>
            </div>
            <div className="stat bg-base-200 rounded-lg py-2">
              <div className="stat-title text-xs">Fluency</div>
              <div className="stat-value text-lg">{feedback.fluency}/10</div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-base-100 rounded-lg p-4 mb-4 space-y-3">
          {isLoading && !messages.length ? (
            <div className="flex justify-center items-center h-full">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat ${message.type === 'user' ? 'chat-end' : 'chat-start'}`}
                >
                  {message.type === 'system' ? (
                    <div className="chat-bubble chat-bubble-info w-full text-center">
                      {message.text}
                    </div>
                  ) : (
                    <>
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full bg-base-200">
                          {message.type === 'user' ? (
                            <UserIcon className="w-6 h-6 m-2" />
                          ) : (
                            <BotIcon className="w-6 h-6 m-2" />
                          )}
                        </div>
                      </div>
                      <div className="chat-header text-xs opacity-60">
                        {message.type === 'user' ? 'You' : 'Assistant'}
                      </div>
                      <div className={`chat-bubble ${
                        message.type === 'user' ? 'chat-bubble-primary' : ''
                      }`}>
                        {message.text}
                        {message.type === 'bot' && (
                          <button
                            className="ml-2 btn btn-ghost btn-xs"
                            onClick={() => speakText(message.text)}
                          >
                            <VolumeIcon className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {message.feedback && message.feedback.corrections && message.feedback.corrections.length > 0 && (
                        <div className="chat-footer opacity-70 text-xs mt-1">
                          {message.feedback.corrections.map((correction, idx) => (
                            <div key={idx} className="text-warning">
                              "{correction.original}" → "{correction.corrected}"
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="chat chat-start">
                  <div className="chat-bubble">
                    <span className="loading loading-dots loading-sm"></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Suggested Responses */}
        {suggestedResponses.length > 0 && !sessionStatus.completed && (
          <div className="mb-3">
            <p className="text-xs opacity-60 mb-2">Suggested responses:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedResponses.map((response, idx) => (
                <button
                  key={idx}
                  className="btn btn-sm btn-outline"
                  onClick={() => handleSuggestedResponse(response)}
                >
                  {response}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        {!sessionStatus.completed && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <button
                className="btn btn-sm btn-outline gap-1"
                onClick={getHint}
                disabled={isLoading}
              >
                <LightbulbIcon className="w-4 h-4" />
                Get Hint {hintsUsed > 0 && `(${hintsUsed} used)`}
              </button>
              {hintsUsed > 0 && (
                <span className="text-xs text-warning">
                  -{hintsUsed * 2} points for hints
                </span>
              )}
            </div>

            <div className="join w-full">
              <input
                type="text"
                placeholder="Type your response..."
                className="input input-bordered join-item flex-1"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading || isTyping}
              />
              <button
                className={`btn join-item ${isListening ? 'btn-error' : 'btn-primary'}`}
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading || isTyping}
              >
                <MicIcon className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
              </button>
              <button
                className="btn btn-primary join-item"
                onClick={() => handleSendMessage()}
                disabled={!userInput.trim() || isLoading || isTyping}
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {sessionStatus.completed && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-success mb-4">
              <CheckCircleIcon className="w-6 h-6" />
              <span className="text-lg font-semibold">Conversation Completed!</span>
            </div>
            <div className="stats shadow mb-4">
              <div className="stat">
                <div className="stat-title">Total Score</div>
                <div className="stat-value text-primary">{performance.currentScore}</div>
              </div>
              <div className="stat">
                <div className="stat-title">XP Earned</div>
                <div className="stat-value text-success">{sessionStatus.xpEarned}</div>
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <button
                className="btn btn-primary"
                onClick={restartConversation}
              >
                Try Another Scenario
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button
                className="btn btn-success"
                onClick={() => onComplete({
                  topic,
                  score: performance.currentScore,
                  xp: sessionStatus.xpEarned,
                  sessionId
                })}
              >
                Finish
                <StarIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Actions */}
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

export default DynamicConversation;