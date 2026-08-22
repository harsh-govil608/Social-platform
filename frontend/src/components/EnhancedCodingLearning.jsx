import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CodeIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BookOpenIcon,
  CpuIcon,
  DatabaseIcon,
  GitBranchIcon,
  TerminalIcon,
  BugIcon,
  LightbulbIcon,
  TrophyIcon,
  ClockIcon,
  CopyIcon,
  RotateCwIcon,
  ChevronRightIcon,
  VideoIcon,
  UploadIcon,
  PlusCircleIcon,
  SaveIcon,
  Share2Icon,
  DownloadIcon,
  SettingsIcon,
  MaximizeIcon,
  MinimizeIcon,
  FileCodeIcon,
  FolderIcon,
  TestTubeIcon,
  ZapIcon,
  BrainIcon,
  RocketIcon,
  HeartIcon,
  StarIcon,
  MessageSquareIcon,
  ThumbsUpIcon,
  EyeIcon,
  GitCommitIcon,
  LayersIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import DifficultySelector from './DifficultySelector';
import DSAProblemSolver from './DSAProblemSolver';
import VideoChat from './VideoChat';
import { axiosInstance } from '../lib/axios';

// Monaco Editor styles (simplified version)
const editorThemes = {
  dark: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    lineNumbers: '#858585',
    keywords: '#569cd6',
    strings: '#ce9178',
    comments: '#6a9955',
    functions: '#dcdcaa',
    numbers: '#b5cea8'
  },
  light: {
    background: '#ffffff',
    foreground: '#000000',
    lineNumbers: '#237893',
    keywords: '#0000ff',
    strings: '#a31515',
    comments: '#008000',
    functions: '#795e26',
    numbers: '#098658'
  }
};

const EnhancedCodingLearning = ({ 
  userLevel = 1,
  userProgress = {},
  onComplete,
  onVideoUpload
}) => {
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [selectedTopic, setSelectedTopic] = useState('basics');
  const [difficulty, setDifficulty] = useState('easy');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [userVideos, setUserVideos] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [activeTab, setActiveTab] = useState('editor');
  const [savedProjects, setSavedProjects] = useState([]);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [debugMode, setDebugMode] = useState(false);
  const [breakpoints, setBreakpoints] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const codeEditorRef = useRef(null);

  // Fetch coding challenges from backend
  const { data: challenges, isLoading: loadingChallenges } = useQuery({
    queryKey: ['codingChallenges', selectedLanguage, difficulty],
    queryFn: async () => {
      const res = await axiosInstance.get('/coding/challenges', {
        params: { language: selectedLanguage, difficulty }
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 5
  });

  // Fetch user's coding progress
  const { data: codingProgress } = useQuery({
    queryKey: ['codingProgress'],
    queryFn: async () => {
      const res = await axiosInstance.get('/coding/progress');
      return res.data;
    }
  });

  // Submit code solution
  const { mutate: submitCode } = useMutation({
    mutationFn: async (codeData) => {
      const res = await axiosInstance.post('/coding/submit', codeData);
      return res.data;
    },
    onSuccess: (data) => {
      setOutput(data.output);
      setTestResults(data.testResults || []);
      
      if (data.passed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success(`Challenge completed! +${data.xp} XP`);
        queryClient.invalidateQueries(['codingProgress']);
      }
    },
    onError: (error) => {
      toast.error('Code execution failed');
      setOutput(error.response?.data?.error || 'Error running code');
    }
  });

  // Save project
  const { mutate: saveProject } = useMutation({
    mutationFn: async (projectData) => {
      const res = await axiosInstance.post('/coding/projects/save', projectData);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Project saved successfully!');
      queryClient.invalidateQueries(['userProjects']);
    }
  });

  // Enhanced programming languages with more details
  const languages = [
    {
      id: 'javascript',
      name: 'JavaScript',
      icon: '🟨',
      color: 'warning',
      version: 'ES2023',
      description: 'Web development & scripting',
      syntax: 'javascript',
      starter: `// Welcome to JavaScript!\nfunction main() {\n  console.log("Hello, World!");\n  \n  // Your code here\n  \n}\n\nmain();`,
      topics: ['Variables', 'Functions', 'Arrays', 'Objects', 'Async/Await', 'DOM', 'Closures', 'Prototypes'],
      frameworks: ['React', 'Vue', 'Angular', 'Node.js'],
      debugger: true
    },
    {
      id: 'python',
      name: 'Python',
      icon: '🐍',
      color: 'success',
      version: '3.12',
      description: 'AI, Data Science & Automation',
      syntax: 'python',
      starter: `# Welcome to Python!\ndef main():\n    print("Hello, World!")\n    \n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    main()`,
      topics: ['Variables', 'Functions', 'Lists', 'Dictionaries', 'Classes', 'Modules', 'Decorators', 'Generators'],
      frameworks: ['Django', 'Flask', 'FastAPI', 'TensorFlow'],
      debugger: true
    },
    {
      id: 'java',
      name: 'Java',
      icon: '☕',
      color: 'error',
      version: '21 LTS',
      description: 'Enterprise & Android development',
      syntax: 'java',
      starter: `// Welcome to Java!\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n        \n        // Your code here\n        \n    }\n}`,
      topics: ['Variables', 'Methods', 'Classes', 'Inheritance', 'Interfaces', 'Collections', 'Streams', 'Multithreading'],
      frameworks: ['Spring Boot', 'Android', 'Hibernate'],
      debugger: true
    },
    {
      id: 'cpp',
      name: 'C++',
      icon: '🔷',
      color: 'info',
      version: 'C++23',
      description: 'Systems programming & Games',
      syntax: 'cpp',
      starter: `// Welcome to C++!\n#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    \n    // Your code here\n    \n    return 0;\n}`,
      topics: ['Variables', 'Functions', 'Pointers', 'Classes', 'Templates', 'STL', 'Memory Management', 'Multithreading'],
      frameworks: ['Qt', 'Unreal Engine', 'OpenGL'],
      debugger: true
    },
    {
      id: 'rust',
      name: 'Rust',
      icon: '🦀',
      color: 'secondary',
      version: '1.75',
      description: 'Memory-safe systems programming',
      syntax: 'rust',
      starter: `// Welcome to Rust!\nfn main() {\n    println!("Hello, World!");\n    \n    // Your code here\n    \n}`,
      topics: ['Variables', 'Functions', 'Ownership', 'Structs', 'Enums', 'Traits', 'Lifetimes', 'Concurrency'],
      frameworks: ['Tokio', 'Actix', 'Rocket'],
      debugger: true
    }
  ];

  // Enhanced DSA Topics with visualizations
  const dsaTopics = {
    easy: [
      {
        id: 'arrays',
        name: 'Arrays & Strings',
        icon: <LayersIcon className="w-5 h-5" />,
        color: 'primary',
        visualizer: true,
        problems: [
          {
            id: 'two-sum',
            title: 'Two Sum',
            description: 'Find two numbers that add up to a target',
            difficulty: 'easy',
            xp: 50,
            coins: 10,
            hints: ['Use a hash map for O(n) time', 'Store complement values'],
            testCases: [
              { input: '[2,7,11,15], 9', expected: '[0,1]' },
              { input: '[3,2,4], 6', expected: '[1,2]' }
            ],
            solution: {
              javascript: `function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
              python: `def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []`
            }
          }
        ]
      },
      {
        id: 'sorting',
        name: 'Sorting Algorithms',
        icon: <GitBranchIcon className="w-5 h-5" />,
        color: 'warning',
        visualizer: true,
        problems: [
          {
            id: 'bubble-sort',
            title: 'Bubble Sort Visualization',
            description: 'Implement and visualize bubble sort',
            difficulty: 'easy',
            xp: 40,
            coins: 8,
            interactive: true
          }
        ]
      }
    ],
    medium: [
      {
        id: 'trees',
        name: 'Binary Trees',
        icon: <GitBranchIcon className="w-5 h-5" />,
        color: 'success',
        visualizer: true,
        problems: [
          {
            id: 'tree-traversal',
            title: 'Tree Traversal',
            description: 'Implement inorder, preorder, postorder',
            difficulty: 'medium',
            xp: 100,
            coins: 20
          }
        ]
      },
      {
        id: 'graphs',
        name: 'Graph Algorithms',
        icon: <GitCommitIcon className="w-5 h-5" />,
        color: 'info',
        visualizer: true,
        problems: [
          {
            id: 'bfs-dfs',
            title: 'BFS & DFS',
            description: 'Breadth-First and Depth-First Search',
            difficulty: 'medium',
            xp: 120,
            coins: 25
          }
        ]
      }
    ],
    advanced: [
      {
        id: 'dp',
        name: 'Dynamic Programming',
        icon: <BrainIcon className="w-5 h-5" />,
        color: 'error',
        visualizer: true,
        problems: [
          {
            id: 'lcs',
            title: 'Longest Common Subsequence',
            description: 'Find LCS using dynamic programming',
            difficulty: 'hard',
            xp: 200,
            coins: 40
          }
        ]
      }
    ]
  };

  // Run code with backend integration
  const runCode = () => {
    setIsRunning(true);
    setOutput('Running...');
    setConsoleOutput([]);
    
    submitCode({
      code,
      language: selectedLanguage,
      challengeId: currentChallenge?.id,
      testCases: currentChallenge?.testCases || []
    });
  };

  // Enhanced code editor with line numbers
  const CodeEditor = () => {
    const [lineNumbers, setLineNumbers] = useState([]);
    
    useEffect(() => {
      const lines = code.split('\n').length;
      setLineNumbers(Array.from({length: lines}, (_, i) => i + 1));
    }, [code]);

    return (
      <div className={`flex h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Line Numbers */}
        <div className="select-none text-right pr-2 pt-2 border-r border-gray-700 min-w-[3rem]">
          {lineNumbers.map(num => (
            <div 
              key={num}
              className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} leading-6`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {breakpoints.includes(num) && (
                <span className="text-red-500 mr-1">●</span>
              )}
              {num}
            </div>
          ))}
        </div>
        
        {/* Code Area */}
        <textarea
          ref={codeEditorRef}
          className={`flex-1 p-2 font-mono outline-none resize-none ${
            theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-800'
          }`}
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write your code here..."
          spellCheck={false}
        />
      </div>
    );
  };

  // Get current language
  const currentLanguage = languages.find(l => l.id === selectedLanguage);

  useEffect(() => {
    if (currentLanguage) {
      setCode(currentLanguage.starter);
    }
  }, [selectedLanguage]);

  return (
    <div className="container mx-auto p-4 max-w-full">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-xl mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <CodeIcon className="w-10 h-10" />
              Advanced Coding & DSA Lab
            </h1>
            <p className="text-lg opacity-90">
              Master {languages.length} programming languages with real-time compilation
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{codingProgress?.totalSolved || 0}</div>
              <div className="text-sm">Problems Solved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{codingProgress?.streak || 0}</div>
              <div className="text-sm">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">#{codingProgress?.rank || 'N/A'}</div>
              <div className="text-sm">Global Rank</div>
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty Selector */}
      <DifficultySelector
        currentLevel={difficulty}
        onLevelChange={setDifficulty}
        userProgress={userProgress}
      />

      {/* Language Selection with Enhanced UI */}
      <div className="card bg-base-100 shadow-xl mb-6 mt-6">
        <div className="card-body">
          <h3 className="card-title mb-4">Select Programming Language</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {languages.map(lang => (
              <div
                key={lang.id}
                className={`card cursor-pointer transition-all hover:scale-105 ${
                  selectedLanguage === lang.id ? 'ring-4 ring-primary shadow-xl' : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedLanguage(lang.id)}
              >
                <div className={`card-body p-4 text-center ${
                  selectedLanguage === lang.id ? `bg-${lang.color}/10` : ''
                }`}>
                  <div className="text-4xl mb-2">{lang.icon}</div>
                  <h4 className="font-bold">{lang.name}</h4>
                  <p className="text-xs opacity-70">{lang.version}</p>
                  <p className="text-xs">{lang.description}</p>
                  <div className="mt-2">
                    <div className="badge badge-xs badge-outline">{lang.topics.length} topics</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main IDE Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Code Editor Section - Takes 2 columns */}
        <div className="xl:col-span-2 space-y-4">
          {/* Editor Toolbar */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <select 
                    className="select select-sm select-bordered"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="dark">Dark Theme</option>
                    <option value="light">Light Theme</option>
                  </select>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      className="btn btn-sm btn-ghost"
                      onClick={() => setFontSize(Math.max(10, fontSize - 2))}
                    >
                      <MinimizeIcon className="w-4 h-4" />
                    </button>
                    <span className="text-sm px-2">{fontSize}px</span>
                    <button 
                      className="btn btn-sm btn-ghost"
                      onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                    >
                      <MaximizeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    className="btn btn-sm btn-ghost"
                    onClick={() => navigator.clipboard.writeText(code)}
                  >
                    <CopyIcon className="w-4 h-4" />
                  </button>
                  <button 
                    className="btn btn-sm btn-ghost"
                    onClick={() => setCode(currentLanguage.starter)}
                  >
                    <RotateCwIcon className="w-4 h-4" />
                  </button>
                  <button 
                    className="btn btn-sm btn-ghost"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <MinimizeIcon className="w-4 h-4" /> : <MaximizeIcon className="w-4 h-4" />}
                  </button>
                  <button 
                    className="btn btn-sm btn-ghost"
                    onClick={() => setDebugMode(!debugMode)}
                  >
                    <BugIcon className={`w-4 h-4 ${debugMode ? 'text-error' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Code Editor with Tabs */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-0">
              <div className="tabs tabs-boxed bg-base-200 p-1">
                <button 
                  className={`tab ${activeTab === 'editor' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('editor')}
                >
                  <FileCodeIcon className="w-4 h-4 mr-2" />
                  main.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : 'js'}
                </button>
                <button 
                  className={`tab ${activeTab === 'terminal' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('terminal')}
                >
                  <TerminalIcon className="w-4 h-4 mr-2" />
                  Terminal
                </button>
                <button 
                  className={`tab ${activeTab === 'tests' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('tests')}
                >
                  <TestTubeIcon className="w-4 h-4 mr-2" />
                  Tests
                </button>
                <button 
                  className={`tab ${activeTab === 'dsa' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('dsa')}
                >
                  <BrainIcon className="w-4 h-4 mr-2" />
                  DSA Problems
                </button>
              </div>

              {activeTab === 'editor' && (
                <div className="h-[500px] overflow-auto">
                  <CodeEditor />
                </div>
              )}

              {activeTab === 'terminal' && (
                <div className="h-[500px] overflow-auto bg-black text-green-400 p-4 font-mono">
                  <div className="mb-2">$ {selectedLanguage} main.{selectedLanguage === 'python' ? 'py' : 'js'}</div>
                  {consoleOutput.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                  <pre className="whitespace-pre-wrap">{output}</pre>
                </div>
              )}

              {activeTab === 'tests' && (
                <div className="h-[500px] overflow-auto p-4">
                  <h4 className="font-bold mb-4">Test Results</h4>
                  {testResults.length === 0 ? (
                    <p className="text-gray-500">Run code to see test results</p>
                  ) : (
                    <div className="space-y-2">
                      {testResults.map((test, idx) => (
                        <div key={idx} className={`alert ${test.passed ? 'alert-success' : 'alert-error'}`}>
                          <div>
                            {test.passed ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                            <span>Test {idx + 1}: {test.name || `Test Case ${idx + 1}`}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'dsa' && (
                <div className="h-[800px]">
                  <DSAProblemSolver />
                </div>
              )}
            </div>

            {/* Run Button and Controls */}
            <div className="card-body border-t">
              <div className="flex gap-2">
                <button 
                  className={`btn btn-primary flex-1 ${isRunning ? 'loading' : ''}`}
                  onClick={runCode}
                  disabled={isRunning}
                >
                  {!isRunning && <PlayCircleIcon className="w-5 h-5 mr-2" />}
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
                <button 
                  className="btn btn-success"
                  onClick={() => saveProject({
                    name: `Project_${Date.now()}`,
                    code,
                    language: selectedLanguage,
                    challenge: currentChallenge
                  })}
                >
                  <SaveIcon className="w-5 h-5 mr-2" />
                  Save
                </button>
                <button className="btn btn-outline">
                  <Share2Icon className="w-5 h-5 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Challenges & Resources */}
        <div className="space-y-4">
          {/* Current Challenge */}
          {loadingChallenges ? (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <span className="loading loading-spinner loading-lg mx-auto"></span>
              </div>
            </div>
          ) : (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4">Today's Challenges</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {(challenges || []).map((challenge, idx) => (
                    <div 
                      key={challenge.id || idx}
                      className={`card cursor-pointer transition-all ${
                        currentChallenge?.id === challenge.id ? 'ring-2 ring-primary bg-primary/10' : 'bg-base-200 hover:bg-base-300'
                      }`}
                      onClick={() => setCurrentChallenge(challenge)}
                    >
                      <div className="card-body p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold">{challenge.title}</h4>
                            <p className="text-sm opacity-80 mt-1">{challenge.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="badge badge-primary badge-sm">{challenge.xp || 50} XP</div>
                            <div className="badge badge-secondary badge-sm ml-1">{challenge.coins || 10} 💰</div>
                          </div>
                        </div>
                        {currentChallenge?.id === challenge.id && (
                          <div className="mt-3 space-y-2">
                            <button 
                              className="btn btn-sm btn-outline w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowHint(!showHint);
                              }}
                            >
                              <LightbulbIcon className="w-4 h-4 mr-2" />
                              {showHint ? 'Hide Hint' : 'Show Hint'}
                            </button>
                            {showHint && challenge.hints && (
                              <div className="alert alert-info">
                                <span className="text-sm">{challenge.hints[0]}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DSA Topics */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4">Data Structures & Algorithms</h3>
              <div className="space-y-2">
                {dsaTopics[difficulty].map((topic) => (
                  <div key={topic.id} className="collapse collapse-arrow bg-base-200">
                    <input type="checkbox" />
                    <div className="collapse-title font-medium flex items-center gap-2">
                      {topic.icon}
                      <span>{topic.name}</span>
                      {topic.visualizer && (
                        <span className="badge badge-sm badge-info">Visualizer</span>
                      )}
                    </div>
                    <div className="collapse-content">
                      <div className="space-y-2">
                        {topic.problems.map((problem, idx) => (
                          <div key={idx} className="card bg-base-100">
                            <div className="card-body p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h5 className="font-bold text-sm">{problem.title}</h5>
                                  <p className="text-xs opacity-80">{problem.description}</p>
                                </div>
                                <div className="flex gap-1">
                                  <button 
                                    className="btn btn-xs btn-primary"
                                    onClick={() => setCurrentChallenge(problem)}
                                  >
                                    Solve
                                  </button>
                                  {problem.visualizer && (
                                    <button className="btn btn-xs btn-info">
                                      <EyeIcon className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Collaboration */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4">Live Collaboration</h3>
              <div className="space-y-2">
                <button className="btn btn-outline btn-block">
                  <VideoIcon className="w-4 h-4 mr-2" />
                  Start Code Share Session
                </button>
                <div className="divider">Active Sessions</div>
                {collaborators.length === 0 ? (
                  <p className="text-sm opacity-70 text-center">No active sessions</p>
                ) : (
                  <div className="space-y-2">
                    {collaborators.map((collab, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-base-200 rounded">
                        <div className="avatar online">
                          <div className="w-8 rounded-full">
                            <img src={collab.avatar} alt={collab.name} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{collab.name}</p>
                          <p className="text-xs opacity-70">Coding in {collab.language}</p>
                        </div>
                        <button className="btn btn-xs btn-primary">Join</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resources & Documentation */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4">Resources</h3>
              <div className="space-y-2">
                <a href="#" className="btn btn-ghost btn-sm justify-start">
                  <BookOpenIcon className="w-4 h-4 mr-2" />
                  {currentLanguage?.name} Documentation
                </a>
                <a href="#" className="btn btn-ghost btn-sm justify-start">
                  <VideoIcon className="w-4 h-4 mr-2" />
                  Video Tutorials
                </a>
                <a href="#" className="btn btn-ghost btn-sm justify-start">
                  <MessageSquareIcon className="w-4 h-4 mr-2" />
                  Community Forum
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCodingLearning;