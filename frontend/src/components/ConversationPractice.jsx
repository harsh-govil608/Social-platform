import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquareIcon, 
  MicIcon, 
  VolumeIcon, 
  ChevronRightIcon, 
  RefreshCwIcon,
  UserIcon,
  BotIcon,
  SendIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayCircleIcon,
  PauseCircleIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const ConversationPractice = ({ topic, onClose, onComplete }) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [score, setScore] = useState(0);
  const [scenarioCompleted, setScenarioCompleted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [responseTime, setResponseTime] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Conversation scenarios for each topic
  const conversationScenarios = {
    Travel: [
      {
        title: "At the Airport",
        context: "You're at the check-in counter at the airport",
        difficulty: "medium",
        dialogues: [
          {
            speaker: "agent",
            text: "Good morning! Where are you flying to today?",
            expectedResponses: [
              "I'm flying to Paris",
              "My destination is Paris",
              "I'm going to Paris"
            ],
            hints: ["Mention your destination city", "Use 'I'm flying to...'"]
          },
          {
            speaker: "agent",
            text: "Do you have any bags to check in?",
            expectedResponses: [
              "Yes, I have one suitcase",
              "I have two bags to check",
              "No, just carry-on"
            ],
            hints: ["Mention how many bags", "Specify if checking or carry-on"]
          },
          {
            speaker: "agent",
            text: "Would you prefer a window or aisle seat?",
            expectedResponses: [
              "Window seat please",
              "I'd like an aisle seat",
              "Window would be great"
            ],
            hints: ["Choose window or aisle", "Be polite with 'please'"]
          }
        ]
      },
      {
        title: "Hotel Check-in",
        context: "You're checking into your hotel",
        difficulty: "easy",
        dialogues: [
          {
            speaker: "receptionist",
            text: "Welcome! Do you have a reservation?",
            expectedResponses: [
              "Yes, under the name Smith",
              "I have a reservation for tonight",
              "Yes, I booked online"
            ],
            hints: ["Confirm you have a reservation", "Mention your name"]
          },
          {
            speaker: "receptionist",
            text: "How many nights will you be staying?",
            expectedResponses: [
              "Three nights",
              "I'll be staying for three nights",
              "Until Friday"
            ],
            hints: ["Specify the number of nights", "Or mention departure date"]
          }
        ]
      }
    ],
    Food: [
      {
        title: "Ordering at a Restaurant",
        context: "You're at a restaurant ready to order",
        difficulty: "easy",
        dialogues: [
          {
            speaker: "waiter",
            text: "Good evening! Are you ready to order?",
            expectedResponses: [
              "Yes, I'll have the pasta",
              "Could I have a few more minutes?",
              "Yes, I'd like to order"
            ],
            hints: ["You can ask for more time", "Or state what you want"]
          },
          {
            speaker: "waiter",
            text: "What would you like to drink?",
            expectedResponses: [
              "I'll have water please",
              "Could I get a coffee?",
              "A glass of wine please"
            ],
            hints: ["Name your drink", "Add 'please' to be polite"]
          },
          {
            speaker: "waiter",
            text: "Any dietary restrictions or allergies?",
            expectedResponses: [
              "No allergies",
              "I'm vegetarian",
              "I'm allergic to nuts"
            ],
            hints: ["Mention any restrictions", "Or say 'no' if none"]
          }
        ]
      }
    ],
    Culture: [
      {
        title: "At a Museum",
        context: "You're visiting a local museum",
        difficulty: "medium",
        dialogues: [
          {
            speaker: "guide",
            text: "Welcome to the museum! Are you interested in a guided tour?",
            expectedResponses: [
              "Yes, that would be great",
              "How long is the tour?",
              "No thank you, I'll explore myself"
            ],
            hints: ["Accept or decline politely", "You can ask questions"]
          },
          {
            speaker: "guide",
            text: "This painting is from the 18th century. What do you think of it?",
            expectedResponses: [
              "It's beautiful",
              "The colors are amazing",
              "Very interesting style"
            ],
            hints: ["Share your opinion", "Comment on what you see"]
          }
        ]
      }
    ],
    Business: [
      {
        title: "Meeting Introduction",
        context: "You're in a business meeting",
        difficulty: "hard",
        dialogues: [
          {
            speaker: "colleague",
            text: "Good morning! Could you introduce yourself to the team?",
            expectedResponses: [
              "Hello, I'm John from the marketing department",
              "Good morning, my name is John and I work in marketing",
              "Hi everyone, I'm John Smith from marketing"
            ],
            hints: ["State your name and department", "Greet everyone first"]
          },
          {
            speaker: "colleague",
            text: "What are your thoughts on the proposal?",
            expectedResponses: [
              "I think it's a solid plan",
              "It looks promising but needs some adjustments",
              "I have some concerns about the timeline"
            ],
            hints: ["Give your opinion", "Be constructive"]
          }
        ]
      }
    ],
    Sports: [
      {
        title: "At the Gym",
        context: "You're at a gym talking to a trainer",
        difficulty: "easy",
        dialogues: [
          {
            speaker: "trainer",
            text: "Hi! Are you new here? What are your fitness goals?",
            expectedResponses: [
              "I want to get stronger",
              "I'm trying to lose weight",
              "I want to improve my fitness"
            ],
            hints: ["State your fitness goal", "Be specific if possible"]
          },
          {
            speaker: "trainer",
            text: "How often do you exercise?",
            expectedResponses: [
              "Three times a week",
              "I try to exercise daily",
              "Not very often"
            ],
            hints: ["Mention frequency", "Be honest"]
          }
        ]
      }
    ],
    Music: [
      {
        title: "Concert Discussion",
        context: "Talking about music preferences",
        difficulty: "easy",
        dialogues: [
          {
            speaker: "friend",
            text: "What kind of music do you like?",
            expectedResponses: [
              "I love rock music",
              "I listen to everything",
              "Classical is my favorite"
            ],
            hints: ["Name a genre", "You can be general or specific"]
          },
          {
            speaker: "friend",
            text: "Have you been to any concerts recently?",
            expectedResponses: [
              "Yes, I saw a band last week",
              "No, but I'd love to go",
              "I went to one last month"
            ],
            hints: ["Answer yes or no", "Add details if you want"]
          }
        ]
      }
    ],
    Technology: [
      {
        title: "Tech Support",
        context: "Getting help with a computer problem",
        difficulty: "medium",
        dialogues: [
          {
            speaker: "support",
            text: "Hello! What seems to be the problem with your device?",
            expectedResponses: [
              "My computer won't start",
              "The screen is frozen",
              "I can't connect to WiFi"
            ],
            hints: ["Describe the problem", "Be specific"]
          },
          {
            speaker: "support",
            text: "Have you tried restarting it?",
            expectedResponses: [
              "Yes, but it didn't help",
              "No, I'll try that now",
              "I tried that already"
            ],
            hints: ["Answer yes or no", "Mention if it helped"]
          }
        ]
      }
    ],
    "Daily Life": [
      {
        title: "Grocery Shopping",
        context: "You're at a grocery store",
        difficulty: "easy",
        dialogues: [
          {
            speaker: "clerk",
            text: "Did you find everything you needed today?",
            expectedResponses: [
              "Yes, thank you",
              "Actually, where is the milk?",
              "I couldn't find the bread"
            ],
            hints: ["Answer yes or ask for help", "Be polite"]
          },
          {
            speaker: "clerk",
            text: "Would you like a bag?",
            expectedResponses: [
              "Yes please",
              "No thanks, I have my own",
              "Just one bag please"
            ],
            hints: ["Accept or decline", "Mention if you have your own"]
          },
          {
            speaker: "clerk",
            text: "Cash or card?",
            expectedResponses: [
              "Card please",
              "I'll pay cash",
              "Can I use contactless?"
            ],
            hints: ["State payment method", "Ask if unsure"]
          }
        ]
      }
    ]
  };

  // Get scenarios for the selected topic
  const scenarios = conversationScenarios[topic] || conversationScenarios["Daily Life"];
  const scenario = scenarios[currentScenario];
  const currentDialogue = scenario?.dialogues[messages.filter(m => m.type === 'bot').length] || null;

  useEffect(() => {
    // Initialize speech recognition
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
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Start conversation
    startScenario();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startScenario = () => {
    const initialMessage = {
      id: Date.now(),
      type: 'system',
      text: `📍 ${scenario.context}`,
      timestamp: new Date()
    };

    const firstDialogue = {
      id: Date.now() + 1,
      type: 'bot',
      speaker: scenario.dialogues[0].speaker,
      text: scenario.dialogues[0].text,
      timestamp: new Date()
    };

    setMessages([initialMessage, firstDialogue]);
  };

  const handleSendMessage = (text = userInput) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');

    // Evaluate response
    evaluateResponse(text);
  };

  const evaluateResponse = (userResponse) => {
    if (!currentDialogue) return;

    const normalizedResponse = userResponse.toLowerCase().trim();
    const isCorrect = currentDialogue.expectedResponses.some(expected => 
      normalizedResponse.includes(expected.toLowerCase()) ||
      expected.toLowerCase().includes(normalizedResponse) ||
      calculateSimilarity(normalizedResponse, expected.toLowerCase()) > 0.7
    );

    // Update score
    if (isCorrect) {
      const points = 10 - (hintsUsed * 2);
      setScore(score + points);
      toast.success(`Great response! +${points} points`);
    } else {
      toast.error('Try a different response or use a hint');
      return;
    }

    // Move to next dialogue or complete scenario
    const botResponses = messages.filter(m => m.type === 'bot').length;
    if (botResponses < scenario.dialogues.length) {
      // Continue conversation
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          const nextDialogue = scenario.dialogues[botResponses];
          const botMessage = {
            id: Date.now(),
            type: 'bot',
            speaker: nextDialogue.speaker,
            text: nextDialogue.text,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
          setHintsUsed(0);
        }, 1500);
      }, 1000);
    } else {
      // Scenario completed
      completeScenario();
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

  const completeScenario = () => {
    setScenarioCompleted(true);
    toast.success(`Scenario completed! Score: ${score}`);
    
    // Check if more scenarios available
    if (currentScenario < scenarios.length - 1) {
      setTimeout(() => {
        const systemMessage = {
          id: Date.now(),
          type: 'system',
          text: '✅ Great job! Ready for the next scenario?',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, systemMessage]);
      }, 1000);
    } else {
      // All scenarios completed
      setTimeout(() => {
        handleCompleteSession();
      }, 2000);
    }
  };

  const nextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setMessages([]);
      setScenarioCompleted(false);
      setHintsUsed(0);
      startScenario();
    }
  };

  const showHint = () => {
    if (currentDialogue && currentDialogue.hints.length > hintsUsed) {
      const hint = currentDialogue.hints[hintsUsed];
      toast.info(`Hint: ${hint}`, { duration: 4000 });
      setHintsUsed(hintsUsed + 1);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
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

  const handleCompleteSession = () => {
    const totalScore = score;
    const xpEarned = Math.round(totalScore / 5);
    
    onComplete({
      topic,
      score: totalScore,
      xp: xpEarned,
      scenariosCompleted: currentScenario + 1,
      totalScenarios: scenarios.length
    });
    
    toast.success(`Session complete! You earned ${xpEarned} XP!`, {
      duration: 5000,
      icon: '🎉'
    });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-2xl flex items-center gap-2">
            <MessageSquareIcon className="w-6 h-6" />
            {topic} Conversation Practice
          </h3>
          <div className="flex items-center gap-4">
            <div className="badge badge-primary badge-lg">
              Score: {score}
            </div>
            <div className="badge badge-outline">
              Scenario {currentScenario + 1}/{scenarios.length}
            </div>
          </div>
        </div>

        {/* Scenario Info */}
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
            <progress 
              className="progress progress-primary w-32" 
              value={messages.filter(m => m.type === 'user').length} 
              max={scenario.dialogues.length}
            ></progress>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-base-100 rounded-lg p-4 mb-4 space-y-3">
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
                  <div className="chat-header">
                    {message.type === 'user' ? 'You' : message.speaker}
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
        </div>

        {/* Input Area */}
        {!scenarioCompleted && currentDialogue && (
          <div className="space-y-3">
            {/* Hints */}
            <div className="flex justify-between items-center">
              <button
                className="btn btn-sm btn-outline"
                onClick={showHint}
                disabled={hintsUsed >= currentDialogue.hints.length}
              >
                💡 Hint ({hintsUsed}/{currentDialogue.hints.length})
              </button>
              <div className="text-sm opacity-70">
                Points available: {10 - (hintsUsed * 2)}
              </div>
            </div>

            {/* Input */}
            <div className="join w-full">
              <input
                type="text"
                placeholder="Type your response..."
                className="input input-bordered join-item flex-1"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                className={`btn join-item ${isListening ? 'btn-error' : 'btn-primary'}`}
                onClick={isListening ? () => setIsListening(false) : startListening}
              >
                <MicIcon className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
              </button>
              <button
                className="btn btn-primary join-item"
                onClick={() => handleSendMessage()}
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Scenario Completed */}
        {scenarioCompleted && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-success mb-4">
              <CheckCircleIcon className="w-6 h-6" />
              <span className="text-lg font-semibold">Scenario Completed!</span>
            </div>
            {currentScenario < scenarios.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={nextScenario}
              >
                Next Scenario
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={handleCompleteSession}
              >
                Complete Session
                <StarIcon className="w-5 h-5" />
              </button>
            )}
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

export default ConversationPractice;