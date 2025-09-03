import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Code,
  Play,
  Send,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Clock,
  Cpu,
  HardDrive,
  Trophy,
  Target,
  BookOpen,
  Lightbulb,
  Terminal,
  FileCode,
  Filter,
  Search,
  TrendingUp,
  Award,
  Zap,
  Star,
  ThumbsUp,
  ThumbsDown,
  Building,
  Hash,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  Copy,
  RefreshCw,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { 
  getProblems, 
  getProblemDetails, 
  submitSolution, 
  runCode,
  getDSAStats,
  initProblems 
} from '../lib/dsaApi';
import { logActivity } from '../lib/activityApi';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

// Code editor themes
const themes = {
  dark: {
    background: '#1e1e1e',
    text: '#d4d4d4',
    keyword: '#569cd6',
    string: '#ce9178',
    comment: '#6a9955',
    number: '#b5cea8',
    function: '#dcdcaa'
  },
  light: {
    background: '#ffffff',
    text: '#000000',
    keyword: '#0000ff',
    string: '#a31515',
    comment: '#008000',
    number: '#098658',
    function: '#795e26'
  }
};

const DSAProblemSolver = () => {
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState(14);
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [filters, setFilters] = useState({
    difficulty: '',
    category: '',
    search: ''
  });
  const [showStats, setShowStats] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const queryClient = useQueryClient();
  const editorRef = useRef(null);

  // Initialize problems on mount
  useEffect(() => {
    initProblems().catch(console.error);
    logActivity('coding', { action: 'opened_dsa_solver' });
  }, []);

  // Fetch problems
  const { data: problemsData, isLoading: loadingProblems, refetch: refetchProblems } = useQuery({
    queryKey: ['dsaProblems', filters],
    queryFn: () => getProblems(filters)
  });

  // Fetch problem details
  const { data: problemDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ['problemDetail', selectedProblem?._id],
    queryFn: () => getProblemDetails(selectedProblem._id),
    enabled: !!selectedProblem?._id
  });

  // Fetch stats
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['dsaStats'],
    queryFn: getDSAStats,
    enabled: showStats
  });

  // Run code mutation
  const { mutate: runCodeMutation } = useMutation({
    mutationFn: ({ problemId, code, language }) => runCode(problemId, code, language),
    onSuccess: (data) => {
      setTestResults(data.testResults);
      if (data.passedCount === data.totalCount) {
        toast.success('All test cases passed! 🎉');
      } else {
        toast.error(`${data.passedCount}/${data.totalCount} test cases passed`);
      }
    },
    onError: () => {
      toast.error('Failed to run code');
    }
  });

  // Submit solution mutation
  const { mutate: submitSolutionMutation } = useMutation({
    mutationFn: ({ problemId, code, language }) => submitSolution(problemId, code, language),
    onSuccess: (data) => {
      setTestResults(data.testResults);
      
      if (data.status === 'Accepted') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success(`Solution accepted! +${data.xpEarned} XP, +${data.coinsEarned} coins`);
      } else {
        toast.error(`${data.status}: ${data.passedCount}/${data.totalCount} test cases passed`);
      }
      
      queryClient.invalidateQueries(['dsaProblems']);
      queryClient.invalidateQueries(['dsaStats']);
      
      logActivity('coding', {
        action: 'submitted_solution',
        problemId: selectedProblem._id,
        status: data.status,
        xpEarned: data.xpEarned
      });
    },
    onError: () => {
      toast.error('Failed to submit solution');
    }
  });

  // Load starter code when problem or language changes
  useEffect(() => {
    if (selectedProblem && selectedProblem.starterCode) {
      setCode(selectedProblem.starterCode[language] || '');
    }
  }, [selectedProblem, language]);

  const handleRun = () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }
    
    setIsRunning(true);
    runCodeMutation(
      { problemId: selectedProblem._id, code, language },
      { onSettled: () => setIsRunning(false) }
    );
  };

  const handleSubmit = () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }
    
    setIsSubmitting(true);
    submitSolutionMutation(
      { problemId: selectedProblem._id, code, language },
      { onSettled: () => setIsSubmitting(false) }
    );
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const resetCode = () => {
    if (selectedProblem && selectedProblem.starterCode) {
      setCode(selectedProblem.starterCode[language] || '');
      toast.success('Code reset to starter template');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'text-success';
      case 'Medium': return 'text-warning';
      case 'Hard': return 'text-error';
      default: return 'text-base-content';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Accepted': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'Wrong Answer': return <XCircle className="w-5 h-5 text-error" />;
      case 'Time Limit Exceeded': return <Clock className="w-5 h-5 text-warning" />;
      case 'Runtime Error': return <AlertCircle className="w-5 h-5 text-error" />;
      default: return <Loader className="w-5 h-5 animate-spin" />;
    }
  };

  if (!selectedProblem) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">DSA Problem Solver</h2>
            <p className="text-sm opacity-70 mt-1">Practice LeetCode-style problems</p>
          </div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="btn btn-ghost gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            My Stats
          </button>
        </div>

        {/* Stats Dashboard */}
        {showStats && !loadingStats && statsData && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="text-xl font-bold mb-4">Your Progress</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Total Solved</div>
                  <div className="stat-value text-primary">
                    {statsData.stats.totalSolved}
                  </div>
                  <div className="stat-desc">
                    out of {statsData.stats.totalProblems}
                  </div>
                </div>
                
                <div className="stat bg-success/10 rounded-lg">
                  <div className="stat-title">Easy</div>
                  <div className="stat-value text-success">
                    {statsData.stats.easySolved}/{statsData.stats.easyTotal}
                  </div>
                </div>
                
                <div className="stat bg-warning/10 rounded-lg">
                  <div className="stat-title">Medium</div>
                  <div className="stat-value text-warning">
                    {statsData.stats.mediumSolved}/{statsData.stats.mediumTotal}
                  </div>
                </div>
                
                <div className="stat bg-error/10 rounded-lg">
                  <div className="stat-title">Hard</div>
                  <div className="stat-value text-error">
                    {statsData.stats.hardSolved}/{statsData.stats.hardTotal}
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              {Object.keys(statsData.stats.categoriesBreakdown || {}).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statsData.stats.categoriesBreakdown).map(([cat, count]) => (
                      <span key={cat} className="badge badge-lg">
                        {cat}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Submissions */}
              {statsData.recentSubmissions?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Recent Submissions</h4>
                  <div className="space-y-2">
                    {statsData.recentSubmissions.slice(0, 5).map(sub => (
                      <div key={sub._id} className="flex items-center justify-between p-2 bg-base-200 rounded">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(sub.status)}
                          <span className="font-medium">{sub.problemId?.title}</span>
                          <span className={`badge badge-sm ${getDifficultyColor(sub.problemId?.difficulty)}`}>
                            {sub.problemId?.difficulty}
                          </span>
                        </div>
                        <span className="text-xs opacity-60">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-wrap gap-4">
              <select
                className="select select-bordered"
                value={filters.difficulty}
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              
              <select
                className="select select-bordered"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="">All Categories</option>
                <option value="Array">Array</option>
                <option value="String">String</option>
                <option value="LinkedList">Linked List</option>
                <option value="Tree">Tree</option>
                <option value="Graph">Graph</option>
                <option value="DynamicProgramming">Dynamic Programming</option>
                <option value="Sorting">Sorting</option>
                <option value="Searching">Searching</option>
                <option value="Stack">Stack</option>
                <option value="Queue">Queue</option>
                <option value="Math">Math</option>
              </select>
              
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 opacity-50" />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    className="input input-bordered w-full pl-10"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>
              </div>
              
              <button
                onClick={refetchProblems}
                className="btn btn-ghost btn-circle"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Problems List */}
        {loadingProblems ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="grid gap-4">
            {problemsData?.problems?.map(problem => (
              <div
                key={problem._id}
                className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer ${
                  problem.solved ? 'border-2 border-success' : ''
                }`}
                onClick={() => setSelectedProblem(problem)}
              >
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {problem.solved && <CheckCircle className="w-6 h-6 text-success" />}
                      <div>
                        <h3 className="text-lg font-semibold">{problem.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`badge ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                          <span className="badge badge-ghost">{problem.category}</span>
                          {problem.acceptanceRate > 0 && (
                            <span className="text-sm opacity-60">
                              {problem.acceptanceRate.toFixed(1)}% acceptance
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">{problem.likes?.length || 0}</span>
                      </div>
                      {problem.companies?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          <span className="text-sm">{problem.companies.length}</span>
                        </div>
                      )}
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                  
                  {problem.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {problem.tags.map(tag => (
                        <span key={tag} className="badge badge-sm badge-ghost">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-base-100' : ''} flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedProblem(null)}
              className="btn btn-ghost btn-sm gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{selectedProblem.title}</h3>
                <span className={`badge ${getDifficultyColor(selectedProblem.difficulty)}`}>
                  {selectedProblem.difficulty}
                </span>
                {problemDetail?.solved && (
                  <CheckCircle className="w-5 h-5 text-success" />
                )}
              </div>
              <div className="flex items-center gap-4 text-sm opacity-70 mt-1">
                <span>{selectedProblem.category}</span>
                {selectedProblem.acceptanceRate > 0 && (
                  <span>{selectedProblem.acceptanceRate.toFixed(1)}% acceptance</span>
                )}
                {problemDetail?.attemptCount > 0 && (
                  <span>{problemDetail.attemptCount} attempts</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r overflow-y-auto p-4">
          <div className="tabs tabs-boxed mb-4">
            <button
              className={`tab ${activeTab === 'description' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`tab ${activeTab === 'hints' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('hints')}
            >
              Hints
            </button>
            <button
              className={`tab ${activeTab === 'submissions' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('submissions')}
            >
              Submissions
            </button>
          </div>

          {activeTab === 'description' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="whitespace-pre-wrap">{selectedProblem.description}</p>
              </div>

              {selectedProblem.examples?.map((example, idx) => (
                <div key={idx} className="bg-base-200 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">Example {idx + 1}:</h5>
                  <div className="space-y-2 font-mono text-sm">
                    <div>
                      <span className="opacity-70">Input: </span>
                      <span>{example.input}</span>
                    </div>
                    <div>
                      <span className="opacity-70">Output: </span>
                      <span>{example.output}</span>
                    </div>
                    {example.explanation && (
                      <div>
                        <span className="opacity-70">Explanation: </span>
                        <span>{example.explanation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {selectedProblem.constraints?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Constraints:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedProblem.constraints.map((constraint, idx) => (
                      <li key={idx} className="text-sm">{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedProblem.companies?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Asked By:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProblem.companies.map(company => (
                      <span key={company} className="badge badge-ghost">
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hints' && (
            <div className="space-y-4">
              {selectedProblem.hints?.map((hint, idx) => (
                <div key={idx} className="collapse collapse-arrow bg-base-200">
                  <input type="checkbox" />
                  <div className="collapse-title font-medium">
                    <Lightbulb className="w-4 h-4 inline mr-2" />
                    Hint {idx + 1}
                  </div>
                  <div className="collapse-content">
                    <p>{hint}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="space-y-2">
              {problemDetail?.submissions?.length > 0 ? (
                problemDetail.submissions.map(sub => (
                  <div key={sub._id} className="flex items-center justify-between p-3 bg-base-200 rounded">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(sub.status)}
                      <span>{sub.status}</span>
                    </div>
                    <div className="text-sm opacity-70">
                      <span>{sub.language}</span>
                      <span className="ml-2">{new Date(sub.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center opacity-70">No submissions yet</p>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Editor Toolbar */}
          <div className="p-2 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                className="select select-sm select-bordered"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              
              <select
                className="select select-sm select-bordered"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
              
              <select
                className="select select-sm select-bordered"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              >
                <option value="12">12px</option>
                <option value="14">14px</option>
                <option value="16">16px</option>
                <option value="18">18px</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={copyCode}
                className="btn btn-ghost btn-sm btn-circle"
                title="Copy code"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={resetCode}
                className="btn btn-ghost btn-sm btn-circle"
                title="Reset code"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 relative">
            <textarea
              ref={editorRef}
              className="w-full h-full p-4 font-mono resize-none focus:outline-none"
              style={{
                backgroundColor: themes[theme].background,
                color: themes[theme].text,
                fontSize: `${fontSize}px`,
                lineHeight: 1.5
              }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              spellCheck="false"
            />
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="border-t p-4 max-h-48 overflow-y-auto">
              <h4 className="font-semibold mb-2">Test Results:</h4>
              <div className="space-y-2">
                {testResults.map((result, idx) => (
                  <div key={idx} className={`p-2 rounded ${result.passed ? 'bg-success/10' : 'bg-error/10'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.passed ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <XCircle className="w-4 h-4 text-error" />
                        )}
                        <span className="font-medium">Test Case {idx + 1}</span>
                      </div>
                      <div className="text-sm opacity-70">
                        {result.runtime}ms / {result.memory}MB
                      </div>
                    </div>
                    {!result.passed && (
                      <div className="mt-2 text-sm font-mono">
                        <div>Input: {result.input}</div>
                        <div>Expected: {result.expectedOutput}</div>
                        <div>Got: {result.actualOutput}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-4 border-t flex justify-between">
            <button
              onClick={handleRun}
              disabled={isRunning || !code.trim()}
              className="btn btn-outline gap-2"
            >
              {isRunning ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Code
                </>
              )}
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !code.trim()}
              className="btn btn-primary gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSAProblemSolver;