import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import { io } from 'socket.io-client';
import useAuthUser from '../hooks/useAuthUser';
import { Mic, MicOff, Send, Volume2, VolumeX, X, ChevronRight, MessageSquare, Award, Clock, TrendingUp, PlayCircle } from 'lucide-react';
import AudioRecorder from '../components/AudioRecorder';
import toast from 'react-hot-toast';

const ConversationPracticePage = () => {
  const { authUser } = useAuthUser();
  // Check if coming from 5-minute conversation with a pre-selected scenario
  const preSelectedScenario = localStorage.getItem('selectedScenario');
  const preSelectedTitle = localStorage.getItem('scenarioTitle');
  
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationActive, setConversationActive] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [lastRecording, setLastRecording] = useState(null);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  
  // Speech synthesis helper function
  const speakMessage = (text) => {
    if (!synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    synthRef.current.speak(utterance);
  };
  
  // Fetch available scenarios
  const { data: scenarios, isLoading: loadingScenarios } = useQuery({
    queryKey: ['conversation-scenarios'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/conversation-practice/scenarios');
      return data;
    }
  });
  
  // Start conversation mutation (moved here to be available for useEffect)
  const startConversationMutation = useMutation({
    mutationFn: async (scenario) => {
      const { data } = await axiosInstance.post('/conversation-practice/start', {
        scenario: scenario.id,
        languageLevel: 'intermediate'
      });
      return data;
    },
    onSuccess: (data) => {
      setConversationActive(true);
      setMessages([
        {
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }
      ]);
      setSuggestions(data.suggestions || []);
      
      // Speak the initial message
      if (isSpeaking) {
        speakMessage(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to start conversation');
    }
  });
  
  // Auto-select scenario if coming from 5-minute conversation
  useEffect(() => {
    if (preSelectedScenario && scenarios) {
      const scenario = scenarios.find(s => 
        s.id === preSelectedScenario || 
        s.id === preSelectedScenario.replace('_', '-') ||
        s.id === preSelectedScenario.replace('-', '_')
      );
      
      if (scenario) {
        setSelectedScenario(scenario);
        startConversationMutation.mutate(scenario);
        // Clear localStorage
        localStorage.removeItem('selectedScenario');
        localStorage.removeItem('scenarioTitle');
      }
    }
  }, [preSelectedScenario, scenarios]);
  
  // Check conversation status
  const { data: status } = useQuery({
    queryKey: ['conversation-status'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/conversation-practice/status');
      return data;
    },
    refetchInterval: conversationActive ? 5000 : false
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      const { data } = await axiosInstance.post('/conversation-practice/message', {
        message
      });
      return data;
    },
    onSuccess: (data) => {
      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }]);
      
      // Update feedback
      if (data.feedback) {
        setFeedback(data.feedback);
      }
      
      // Update suggestions
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
      
      // Speak the response
      if (isSpeaking) {
        speakMessage(data.message);
      }
      
      setIsTyping(false);
    },
    onError: (error) => {
      toast.error('Failed to send message');
      setIsTyping(false);
    }
  });
  
  // End conversation mutation
  const endConversationMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post('/conversation-practice/end');
      return data;
    },
    onSuccess: (data) => {
      setConversationActive(false);
      
      // Show summary
      toast.success(`Conversation ended! You earned ${data.xpEarned} XP`);
      
      if (data.summary) {
        // Display detailed summary
        setFeedback({
          ...data.summary,
          final: true
        });
      }
      
      // Reset state after delay
      setTimeout(() => {
        setMessages([]);
        setSelectedScenario(null);
        setFeedback(null);
        setSuggestions([]);
      }, 5000);
    }
  });
  
  // Initialize Socket.io connection
  useEffect(() => {
    if (conversationActive) {
      const socketUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace('/api', '')
        : 'http://localhost:5001';
      const newSocket = io(socketUrl, {
        withCredentials: true
      });
      
      newSocket.on('connect', () => {
        if (authUser?._id) {
          newSocket.emit('join-conversation', authUser._id);
        }
      });
      
      // Listen for AI response chunks (for streaming)
      newSocket.on('ai-response-chunk', (data) => {
        // Handle streaming response if implemented
      });
      
      setSocket(newSocket);
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [conversationActive]);
  
  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        
        if (event.results[current].isFinal) {
          setInputMessage(transcript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone access to use voice input.');
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleStartConversation = (scenario) => {
    setSelectedScenario(scenario);
    startConversationMutation.mutate(scenario);
  };
  
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }]);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Send to backend
    sendMessageMutation.mutate(inputMessage);
    
    // Clear input
    setInputMessage('');
  };
  
  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in your browser');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };
  
  const toggleSpeaking = () => {
    if (isSpeaking) {
      synthRef.current.cancel();
    }
    setIsSpeaking(!isSpeaking);
  };
  
  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    // Automatically send the suggestion
    setTimeout(() => {
      const sendBtn = document.querySelector('#send-btn');
      if (sendBtn) sendBtn.click();
    }, 100);
  };
  
  const handleEndConversation = () => {
    if (window.confirm('Are you sure you want to end this conversation?')) {
      endConversationMutation.mutate();
    }
  };
  
  // Scenario selection screen
  if (!selectedScenario && !conversationActive) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-base-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">AI Conversation Practice</h2>
          <p className="text-base-content/70">Practice real-world conversations with AI-powered feedback</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingScenarios ? (
            <div className="col-span-full text-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            scenarios?.map((scenario) => (
              <div key={scenario.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="card-body">
                  <div className="text-4xl mb-2">{scenario.icon}</div>
                  <h3 className="card-title">{scenario.title}</h3>
                  <p className="text-sm text-base-content/70">{scenario.description}</p>
                  
                  <div className="flex flex-wrap gap-2 my-3">
                    <span className="badge badge-outline">{scenario.difficulty}</span>
                    <span className="badge badge-ghost">
                      <Clock className="w-3 h-3 mr-1" />
                      {scenario.estimatedTime}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {scenario.skills?.map((skill, idx) => (
                      <span key={idx} className="text-xs bg-base-200 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleStartConversation(scenario)}
                  >
                    Start Practice
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
  
  // Conversation screen
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col p-4">
      {/* Header */}
      <div className="bg-base-200 rounded-t-lg p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {selectedScenario?.title || 'Conversation Practice'}
          </h3>
          <p className="text-sm text-base-content/70">
            Turn {messages.filter(m => m.role === 'user').length} • 
            {status?.averageScore && ` Score: ${status.averageScore}%`}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={toggleSpeaking}
            className={`btn btn-sm ${isSpeaking ? 'btn-primary' : 'btn-ghost'}`}
            title={isSpeaking ? 'Disable voice output' : 'Enable voice output'}
          >
            {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          <button 
            onClick={handleEndConversation}
            className="btn btn-sm btn-error"
          >
            End
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 bg-base-100 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}
            >
              <div className="chat-bubble">
                {message.content}
              </div>
              <div className="chat-footer opacity-50 text-xs">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
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
      </div>
      
      {/* Feedback Panel */}
      {feedback && !feedback.final && (
        <div className="bg-base-200 p-3 border-t">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-success" />
                Grammar: {feedback.grammarScore}%
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-warning" />
                Fluency: {feedback.fluencyScore}%
              </span>
            </div>
            
            {feedback.improvementTip && (
              <div className="text-xs text-base-content/70">
                💡 {feedback.improvementTip}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-base-100 p-3 border-t">
          <p className="text-xs text-base-content/60 mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="btn btn-sm btn-outline"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Final Summary */}
      {feedback?.final && (
        <div className="bg-success/10 p-4 rounded-lg mb-3">
          <h4 className="font-bold text-success mb-2">Conversation Complete!</h4>
          <div className="space-y-2 text-sm">
            <p>Duration: {Math.floor(feedback.duration / 60)} minutes</p>
            <p>Messages exchanged: {feedback.turnCount * 2}</p>
            <p>Average score: {feedback.averageScore}%</p>
            
            {feedback.strengths && (
              <div>
                <strong>Strengths:</strong>
                <ul className="list-disc list-inside ml-2">
                  {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            
            {feedback.areasForImprovement && (
              <div>
                <strong>Areas to improve:</strong>
                <ul className="list-disc list-inside ml-2">
                  {feedback.areasForImprovement.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Input */}
      <div className="bg-base-200 rounded-b-lg p-4 space-y-2">
        {/* Audio recorder row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-50">Record your response:</span>
            <AudioRecorder
              disabled={!conversationActive}
              onRecordingComplete={(blob) => setLastRecording(blob)}
            />
          </div>
          {lastRecording && (
            <span className="text-xs text-success">✓ Recording saved</span>
          )}
        </div>

        {/* Text input row */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message or use voice input..."
            className="input input-bordered flex-1"
            disabled={!conversationActive || sendMessageMutation.isPending}
          />

          <button
            onClick={handleVoiceInput}
            className={`btn ${isListening ? 'btn-error animate-pulse' : 'btn-ghost'}`}
            disabled={!conversationActive}
            title={isListening ? 'Stop listening' : 'Speak to type'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            id="send-btn"
            onClick={handleSendMessage}
            className="btn btn-primary"
            disabled={!inputMessage.trim() || !conversationActive || sendMessageMutation.isPending}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationPracticePage;