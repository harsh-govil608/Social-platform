import { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Send, 
  MessageSquare, 
  Code, 
  Globe, 
  Briefcase, 
  Star,
  Trash2,
  Copy,
  Lightbulb,
  Clock,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  startAITutorSession,
  continueAITutorSession,
  getAITutorSessions,
  getAITutorSession,
  rateAITutorSession,
  getAITutorAnalytics
} from '../lib/aiTutorApi';

const AITutor = () => {
  const [activeTab, setActiveTab] = useState('new-chat');
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [tips, setTips] = useState([]);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const messagesEndRef = useRef(null);

  const sessionTypes = [
    { id: 'language_help', name: 'Language Learning', icon: Globe, color: 'text-blue-500' },
    { id: 'coding_help', name: 'Coding Help', icon: Code, color: 'text-green-500' },
    { id: 'career_guidance', name: 'Career Guidance', icon: Briefcase, color: 'text-purple-500' },
    { id: 'general_chat', name: 'General Chat', icon: MessageSquare, color: 'text-orange-500' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchSessions();
    fetchAnalytics();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await getAITutorSessions();
      if (response.success) {
        setSessions(response.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await getAITutorAnalytics();
      if (response.success) {
        setAnalytics(response.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const startNewSession = async (sessionType) => {
    if (!inputMessage.trim()) {
      toast.error('Please enter a message to start the conversation');
      return;
    }

    setIsLoading(true);
    try {
      const response = await startAITutorSession(sessionType, inputMessage.trim());
      if (response.success) {
        setCurrentSession(response.session);
        setMessages(response.session.messages);
        setTips(response.tips || []);
        setInputMessage('');
        setActiveTab('chat');
        toast.success('AI Tutor session started!');
        fetchSessions();
      }
    } catch (error) {
      toast.error('Failed to start AI tutor session');
    } finally {
      setIsLoading(false);
    }
  };

  const continueSession = async () => {
    if (!inputMessage.trim() || !currentSession) return;

    setIsLoading(true);
    try {
      const response = await continueAITutorSession(
        currentSession._id, 
        inputMessage.trim(),
        codeSnippet || null,
        null
      );
      
      if (response.success) {
        setMessages(prev => [...prev, 
          {
            role: 'user',
            content: inputMessage.trim(),
            timestamp: new Date(),
            metadata: { codeSnippet: codeSnippet || undefined }
          },
          response.message
        ]);
        setTips(response.tips || []);
        setInputMessage('');
        setCodeSnippet('');
        setShowCodeInput(false);
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const response = await getAITutorSession(sessionId);
      if (response.success) {
        setCurrentSession(response.session);
        setMessages(response.session.messages);
        setActiveTab('chat');
      }
    } catch (error) {
      toast.error('Failed to load session');
    }
  };

  const rateSession = async (rating, feedback = '') => {
    if (!currentSession) return;
    
    try {
      await rateAITutorSession(currentSession._id, rating, feedback);
      toast.success('Thank you for your feedback!');
      setCurrentSession(prev => ({ ...prev, rating, feedback }));
      fetchSessions();
    } catch (error) {
      toast.error('Failed to rate session');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSessionTypeInfo = (type) => {
    return sessionTypes.find(st => st.id === type) || sessionTypes[3];
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold">AI Learning Mentor</h1>
        </div>
        <p className="text-base-content/70">
          Get personalized help with languages, coding, and career guidance
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-boxed mb-6 w-fit">
        <button
          className={`tab ${activeTab === 'new-chat' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('new-chat')}
        >
          New Chat
        </button>
        <button
          className={`tab ${activeTab === 'chat' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('chat')}
          disabled={!currentSession}
        >
          Current Chat
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {/* New Chat Tab */}
      {activeTab === 'new-chat' && (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-4">What can I help you with today?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {sessionTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <div key={type.id} className="card bg-base-200 hover:shadow-lg transition-all cursor-pointer group">
                    <div className="card-body p-4 text-center">
                      <IconComponent className={`w-12 h-12 mx-auto mb-2 ${type.color} group-hover:scale-110 transition-transform`} />
                      <h3 className="font-semibold">{type.name}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">What would you like to discuss?</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-32 resize-none"
                  placeholder="e.g., 'I'm struggling with Spanish verb conjugations' or 'Can you help me debug this Python code?'"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {sessionTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      className={`btn btn-outline gap-2 ${isLoading ? 'loading' : ''}`}
                      onClick={() => startNewSession(type.id)}
                      disabled={isLoading || !inputMessage.trim()}
                    >
                      <IconComponent className={`w-4 h-4 ${type.color}`} />
                      Start {type.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Chat Tab */}
      {activeTab === 'chat' && currentSession && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Messages */}
          <div className="lg:col-span-3">
            <div className="card bg-base-100 shadow-lg h-96">
              <div className="card-body p-4">
                <div className="flex items-center gap-2 mb-4 p-2 bg-base-200 rounded-lg">
                  {(() => {
                    const typeInfo = getSessionTypeInfo(currentSession.sessionType);
                    const IconComponent = typeInfo.icon;
                    return (
                      <>
                        <IconComponent className={`w-5 h-5 ${typeInfo.color}`} />
                        <span className="font-medium">{typeInfo.name} Session</span>
                        <div className="badge badge-sm ml-auto">
                          {messages.length} messages
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="overflow-y-auto flex-1 space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}>
                      <div className="chat-image avatar">
                        <div className="w-8 rounded-full">
                          {message.role === 'user' ? (
                            <div className="bg-primary rounded-full flex items-center justify-center w-full h-full text-primary-content text-xs font-bold">
                              U
                            </div>
                          ) : (
                            <div className="bg-secondary rounded-full flex items-center justify-center w-full h-full">
                              <Brain className="w-4 h-4 text-secondary-content" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`chat-bubble ${message.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'} max-w-lg`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.metadata?.codeSnippet && (
                          <div className="mt-2 p-2 bg-black/20 rounded text-sm font-mono">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs opacity-75">Code:</span>
                              <button 
                                onClick={() => copyToClipboard(message.metadata.codeSnippet)}
                                className="btn btn-ghost btn-xs"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <pre className="overflow-x-auto">{message.metadata.codeSnippet}</pre>
                          </div>
                        )}
                        {message.metadata?.suggestions && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.metadata.suggestions.map((suggestion, idx) => (
                              <span key={idx} className="badge badge-outline badge-xs">
                                {suggestion}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="chat-footer opacity-50 text-xs">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="mt-4 space-y-2">
                  {showCodeInput && (
                    <textarea
                      className="textarea textarea-bordered w-full h-20 font-mono text-sm"
                      placeholder="Paste your code here (optional)..."
                      value={codeSnippet}
                      onChange={(e) => setCodeSnippet(e.target.value)}
                    />
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      className={`btn btn-ghost btn-sm ${showCodeInput ? 'btn-active' : ''}`}
                      onClick={() => setShowCodeInput(!showCodeInput)}
                      title="Include code snippet"
                    >
                      <Code className="w-4 h-4" />
                    </button>
                    
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="input input-bordered flex-1"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && continueSession()}
                    />
                    
                    <button
                      className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                      onClick={continueSession}
                      disabled={isLoading || !inputMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Rating */}
            {currentSession && !currentSession.rating && (
              <div className="card bg-base-100 shadow-lg mt-4">
                <div className="card-body p-4">
                  <h3 className="font-semibold mb-2">Rate this session</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className="btn btn-ghost btn-sm p-1"
                        onClick={() => rateSession(star)}
                      >
                        <Star className="w-5 h-5 text-yellow-500" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tips Sidebar */}
          <div className="lg:col-span-1">
            {tips.length > 0 && (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold">Learning Tips</span>
                  </div>
                  <div className="space-y-2">
                    {tips.map((tip, index) => (
                      <div key={index} className="text-sm p-2 bg-base-200 rounded">
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => {
            const typeInfo = getSessionTypeInfo(session.sessionType);
            const IconComponent = typeInfo.icon;
            return (
              <div key={session._id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={`w-5 h-5 ${typeInfo.color}`} />
                    <span className="font-semibold">{typeInfo.name}</span>
                    {session.isActive && (
                      <div className="badge badge-success badge-xs">Active</div>
                    )}
                  </div>
                  
                  <p className="text-sm text-base-content/70 mb-3 line-clamp-2">
                    {session.messages[0]?.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-base-content/50 mb-3">
                    <span>{session.messages.length} messages</span>
                    <span>{formatTimestamp(session.updatedAt)}</span>
                  </div>
                  
                  {session.rating && (
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: session.rating }, (_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                      ))}
                    </div>
                  )}
                  
                  <button
                    className="btn btn-primary btn-sm w-full"
                    onClick={() => loadSession(session._id)}
                  >
                    Continue Chat
                  </button>
                </div>
              </div>
            );
          })}
          
          {sessions.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Brain className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No sessions yet</h3>
              <p className="text-base-content/70">
                Start your first AI tutoring session to see your history here
              </p>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <div className="text-2xl font-bold">{analytics.totalSessions}</div>
              <div className="text-sm text-base-content/70">Total Sessions</div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-4 text-center">
              <MessageSquare className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <div className="text-2xl font-bold">{analytics.activeSessions}</div>
              <div className="text-sm text-base-content/70">Active Sessions</div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-4 text-center">
              <Clock className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <div className="text-2xl font-bold">
                {analytics.lastSessionDate ? 
                  new Date(analytics.lastSessionDate).toLocaleDateString() : 
                  'Never'
                }
              </div>
              <div className="text-sm text-base-content/70">Last Session</div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-4 text-center">
              <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
              <div className="text-2xl font-bold">
                {analytics.sessionBreakdown
                  .reduce((acc, curr) => acc + (curr.avgRating || 0), 0)
                  .toFixed(1)}
              </div>
              <div className="text-sm text-base-content/70">Avg Rating</div>
            </div>
          </div>
          
          {/* Session Breakdown */}
          <div className="col-span-full">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="font-semibold mb-4">Session Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analytics.sessionBreakdown.map((item) => {
                    const typeInfo = getSessionTypeInfo(item._id);
                    const IconComponent = typeInfo.icon;
                    return (
                      <div key={item._id} className="p-4 bg-base-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className={`w-5 h-5 ${typeInfo.color}`} />
                          <span className="font-medium">{typeInfo.name}</span>
                        </div>
                        <div className="text-sm text-base-content/70">
                          <div>{item.count} sessions</div>
                          <div>{item.totalMessages} messages</div>
                          {item.avgRating && <div>★ {item.avgRating.toFixed(1)} avg rating</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITutor;