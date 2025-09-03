import { useState, useEffect, useRef } from 'react';
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
  PlusCircleIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import DifficultySelector from './DifficultySelector';

const CodingLearning = ({ 
  userLevel = 1,
  userProgress = {},
  onComplete,
  onVideoUpload
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [selectedTopic, setSelectedTopic] = useState('basics');
  const [difficulty, setDifficulty] = useState('easy');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [userVideos, setUserVideos] = useState([]);
  const codeEditorRef = useRef(null);

  // Programming languages with their features
  const languages = [
    {
      id: 'javascript',
      name: 'JavaScript',
      icon: '🟨',
      color: 'warning',
      description: 'Web development & scripting',
      syntax: 'javascript',
      starter: `// Welcome to JavaScript!\nconsole.log("Hello, World!");`,
      topics: ['Variables', 'Functions', 'Arrays', 'Objects', 'Async/Await', 'DOM']
    },
    {
      id: 'python',
      name: 'Python',
      icon: '🐍',
      color: 'success',
      description: 'AI, Data Science & Automation',
      syntax: 'python',
      starter: `# Welcome to Python!\nprint("Hello, World!")`,
      topics: ['Variables', 'Functions', 'Lists', 'Dictionaries', 'Classes', 'Modules']
    },
    {
      id: 'java',
      name: 'Java',
      icon: '☕',
      color: 'error',
      description: 'Enterprise & Android development',
      syntax: 'java',
      starter: `// Welcome to Java!\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
      topics: ['Variables', 'Methods', 'Classes', 'Inheritance', 'Interfaces', 'Collections']
    },
    {
      id: 'cpp',
      name: 'C++',
      icon: '🔷',
      color: 'info',
      description: 'Systems programming & Games',
      syntax: 'cpp',
      starter: `// Welcome to C++!\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
      topics: ['Variables', 'Functions', 'Pointers', 'Classes', 'Templates', 'STL']
    },
    {
      id: 'rust',
      name: 'Rust',
      icon: '🦀',
      color: 'secondary',
      description: 'Memory-safe systems programming',
      syntax: 'rust',
      starter: `// Welcome to Rust!\nfn main() {\n    println!("Hello, World!");\n}`,
      topics: ['Variables', 'Functions', 'Ownership', 'Structs', 'Enums', 'Traits']
    }
  ];

  // DSA Topics with difficulty levels
  const dsaTopics = {
    easy: [
      {
        id: 'arrays',
        name: 'Arrays & Strings',
        icon: <DatabaseIcon className="w-5 h-5" />,
        problems: [
          {
            title: 'Two Sum',
            description: 'Find two numbers that add up to a target',
            hints: ['Use a hash map', 'Time complexity: O(n)'],
            solution: {
              javascript: `function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
              python: `def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []`
            }
          },
          {
            title: 'Reverse String',
            description: 'Reverse a string in-place',
            hints: ['Two pointers', 'Swap characters'],
            solution: {
              javascript: `function reverseString(s) {\n    let left = 0, right = s.length - 1;\n    while (left < right) {\n        [s[left], s[right]] = [s[right], s[left]];\n        left++;\n        right--;\n    }\n    return s;\n}`
            }
          }
        ]
      },
      {
        id: 'sorting',
        name: 'Basic Sorting',
        icon: <GitBranchIcon className="w-5 h-5" />,
        problems: [
          {
            title: 'Bubble Sort',
            description: 'Implement bubble sort algorithm',
            hints: ['Compare adjacent elements', 'Swap if needed'],
            solution: {
              javascript: `function bubbleSort(arr) {\n    for (let i = 0; i < arr.length; i++) {\n        for (let j = 0; j < arr.length - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n            }\n        }\n    }\n    return arr;\n}`
            }
          }
        ]
      }
    ],
    medium: [
      {
        id: 'linkedlist',
        name: 'Linked Lists',
        icon: <GitBranchIcon className="w-5 h-5" />,
        problems: [
          {
            title: 'Reverse Linked List',
            description: 'Reverse a singly linked list',
            hints: ['Three pointers', 'Iterative approach'],
            solution: {
              javascript: `function reverseList(head) {\n    let prev = null;\n    let current = head;\n    while (current !== null) {\n        let next = current.next;\n        current.next = prev;\n        prev = current;\n        current = next;\n    }\n    return prev;\n}`
            }
          }
        ]
      },
      {
        id: 'trees',
        name: 'Binary Trees',
        icon: <GitBranchIcon className="w-5 h-5" />,
        problems: [
          {
            title: 'Tree Traversal',
            description: 'Implement inorder, preorder, postorder traversal',
            hints: ['Recursion', 'Visit order matters']
          }
        ]
      }
    ],
    advanced: [
      {
        id: 'dp',
        name: 'Dynamic Programming',
        icon: <CpuIcon className="w-5 h-5" />,
        problems: [
          {
            title: 'Longest Common Subsequence',
            description: 'Find LCS of two strings',
            hints: ['2D DP table', 'Bottom-up approach']
          }
        ]
      },
      {
        id: 'graphs',
        name: 'Graph Algorithms',
        icon: <GitBranchIcon className="w-5 h-5" />,
        problems: [
          {
            title: 'Dijkstra\'s Algorithm',
            description: 'Find shortest path in weighted graph',
            hints: ['Priority queue', 'Relaxation']
          }
        ]
      }
    ]
  };

  // Interactive code challenges based on difficulty
  const getCodeChallenges = () => {
    const lang = languages.find(l => l.id === selectedLanguage);
    const challenges = {
      easy: [
        {
          title: 'Hello World',
          description: `Write a ${lang.name} program that prints "Hello, World!"`,
          testCases: [
            { input: '', expected: 'Hello, World!' }
          ],
          xp: 10,
          coins: 5
        },
        {
          title: 'Sum Two Numbers',
          description: 'Create a function that adds two numbers',
          testCases: [
            { input: '2, 3', expected: '5' },
            { input: '10, 20', expected: '30' }
          ],
          xp: 20,
          coins: 10
        }
      ],
      medium: [
        {
          title: 'Fibonacci Sequence',
          description: 'Generate the first n Fibonacci numbers',
          testCases: [
            { input: '5', expected: '[0, 1, 1, 2, 3]' },
            { input: '10', expected: '[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]' }
          ],
          xp: 50,
          coins: 25
        },
        {
          title: 'Palindrome Checker',
          description: 'Check if a string is a palindrome',
          testCases: [
            { input: 'racecar', expected: 'true' },
            { input: 'hello', expected: 'false' }
          ],
          xp: 40,
          coins: 20
        }
      ],
      advanced: [
        {
          title: 'Binary Search Tree',
          description: 'Implement a BST with insert and search',
          testCases: [
            { input: 'insert: [5,3,7,1,9], search: 7', expected: 'true' }
          ],
          xp: 100,
          coins: 50
        }
      ]
    };
    
    return challenges[difficulty] || challenges.easy;
  };

  // Simulate code execution (in production, use a real code execution API)
  const runCode = () => {
    setIsRunning(true);
    setOutput('Running...');
    
    setTimeout(() => {
      try {
        // Simulated output based on language
        if (code.includes('console.log') || code.includes('print')) {
          const match = code.match(/["'](.*?)["']/);
          setOutput(match ? match[1] : 'Program executed successfully!');
        } else {
          setOutput('Program executed successfully!\nNo output to display.');
        }
        
        // Check if challenge is completed
        const challenges = getCodeChallenges();
        if (currentChallenge < challenges.length) {
          const challenge = challenges[currentChallenge];
          toast.success(`Challenge completed! +${challenge.xp} XP`);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (error) {
        setOutput(`Error: ${error.message}`);
      } finally {
        setIsRunning(false);
      }
    }, 1500);
  };

  // Handle video upload
  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In production, upload to server
      const newVideo = {
        id: Date.now(),
        title: file.name,
        url: URL.createObjectURL(file),
        uploadedBy: 'You',
        topic: selectedTopic,
        language: selectedLanguage,
        difficulty: difficulty,
        uploadedAt: new Date()
      };
      
      setUserVideos([...userVideos, newVideo]);
      toast.success('Video uploaded successfully!');
      onVideoUpload?.(newVideo);
    }
  };

  // Get current language
  const currentLanguage = languages.find(l => l.id === selectedLanguage);

  useEffect(() => {
    if (currentLanguage) {
      setCode(currentLanguage.starter);
    }
  }, [selectedLanguage]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
          <CodeIcon className="w-10 h-10 text-primary" />
          Coding & DSA Learning
        </h1>
        <p className="text-lg opacity-80">
          Master programming languages and data structures
        </p>
      </div>

      {/* Difficulty Selector */}
      <DifficultySelector
        currentLevel={difficulty}
        onLevelChange={setDifficulty}
        userProgress={userProgress}
      />

      {/* Language Selection */}
      <div className="card bg-base-100 shadow-xl mb-6 mt-6">
        <div className="card-body">
          <h3 className="card-title mb-4">Choose Your Language</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {languages.map(lang => (
              <button
                key={lang.id}
                className={`btn ${selectedLanguage === lang.id ? `btn-${lang.color}` : 'btn-outline'}`}
                onClick={() => setSelectedLanguage(lang.id)}
              >
                <span className="text-2xl mr-2">{lang.icon}</span>
                <div className="text-left">
                  <div className="font-bold">{lang.name}</div>
                  <div className="text-xs opacity-70">{lang.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h3 className="card-title">Code Editor</h3>
              <div className="flex gap-2">
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
              </div>
            </div>
            
            <textarea
              ref={codeEditorRef}
              className="textarea textarea-bordered font-mono text-sm h-96 w-full"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              spellCheck={false}
            />
            
            <div className="flex gap-2 mt-4">
              <button 
                className={`btn btn-primary flex-1 ${isRunning ? 'loading' : ''}`}
                onClick={runCode}
                disabled={isRunning}
              >
                <PlayCircleIcon className="w-5 h-5 mr-2" />
                Run Code
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => setShowHint(!showHint)}
              >
                <LightbulbIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Output */}
            <div className="mt-4">
              <h4 className="font-bold mb-2">Output:</h4>
              <div className="mockup-code">
                <pre><code>{output || 'No output yet. Run your code!'}</code></pre>
              </div>
            </div>
          </div>
        </div>

        {/* Challenges & DSA Section */}
        <div className="space-y-6">
          {/* Current Challenge */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4">Today's Challenges</h3>
              {getCodeChallenges().map((challenge, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-lg ${currentChallenge === idx ? 'bg-primary/10 border-2 border-primary' : 'bg-base-200'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold">{challenge.title}</h4>
                      <p className="text-sm opacity-80 mt-1">{challenge.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="badge badge-primary">{challenge.xp} XP</div>
                      <div className="badge badge-secondary ml-2">{challenge.coins} 💰</div>
                    </div>
                  </div>
                  
                  {currentChallenge === idx && showHint && (
                    <div className="alert alert-info mt-2">
                      <LightbulbIcon className="w-4 h-4" />
                      <span className="text-sm">Hint: Try using {currentLanguage.name}'s syntax for output</span>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setCurrentChallenge(idx);
                        // Set starter code for the challenge
                        const lang = languages.find(l => l.id === selectedLanguage);
                        if (challenge.title === 'Hello World') {
                          setCode(lang.starter);
                        } else if (challenge.title === 'Sum Two Numbers') {
                          const starterCode = {
                            javascript: `// Sum Two Numbers Challenge
function addNumbers(a, b) {
  // Write your code here
  
}

// Test the function
console.log(addNumbers(2, 3));   // Should output: 5
console.log(addNumbers(10, 20)); // Should output: 30`,
                            python: `# Sum Two Numbers Challenge
def add_numbers(a, b):
    # Write your code here
    pass

# Test the function
print(add_numbers(2, 3))   # Should output: 5
print(add_numbers(10, 20)) # Should output: 30`,
                            java: `// Sum Two Numbers Challenge
public class Main {
    public static int addNumbers(int a, int b) {
        // Write your code here
        return 0;
    }
    
    public static void main(String[] args) {
        System.out.println(addNumbers(2, 3));   // Should output: 5
        System.out.println(addNumbers(10, 20)); // Should output: 30
    }
}`,
                            cpp: `// Sum Two Numbers Challenge
#include <iostream>
using namespace std;

int addNumbers(int a, int b) {
    // Write your code here
    return 0;
}

int main() {
    cout << addNumbers(2, 3) << endl;   // Should output: 5
    cout << addNumbers(10, 20) << endl; // Should output: 30
    return 0;
}`,
                            rust: `// Sum Two Numbers Challenge
fn add_numbers(a: i32, b: i32) -> i32 {
    // Write your code here
    0
}

fn main() {
    println!("{}", add_numbers(2, 3));   // Should output: 5
    println!("{}", add_numbers(10, 20)); // Should output: 30
}`
                          };
                          setCode(starterCode[selectedLanguage] || starterCode['javascript']);
                        } else {
                          setCode(lang.starter);
                        }
                        toast.success(`Challenge "${challenge.title}" started!`);
                      }}
                    >
                      Start Challenge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DSA Topics */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4">Data Structures & Algorithms</h3>
              <div className="space-y-3">
                {dsaTopics[difficulty].map((topic) => (
                  <div 
                    key={topic.id}
                    className="collapse collapse-arrow bg-base-200"
                  >
                    <input type="checkbox" />
                    <div className="collapse-title font-medium flex items-center gap-2">
                      {topic.icon}
                      {topic.name}
                      <span className="badge badge-sm">{topic.problems.length} problems</span>
                    </div>
                    <div className="collapse-content">
                      {topic.problems.map((problem, idx) => (
                        <div key={idx} className="p-3 bg-base-100 rounded mt-2">
                          <h5 className="font-bold">{problem.title}</h5>
                          <p className="text-sm opacity-80">{problem.description}</p>
                          <div className="flex gap-2 mt-2">
                            <button 
                              className="btn btn-xs btn-primary"
                              onClick={() => {
                                // Load problem template (skeleton only, no solutions)
                                const templates = {
                                  'Two Sum': {
                                    javascript: `// Two Sum Problem
// Find two numbers in the array that add up to the target
function twoSum(nums, target) {
    // Your code here
    
}

// Test cases
console.log(twoSum([2, 7, 11, 15], 9));  // Should return [0, 1]
console.log(twoSum([3, 2, 4], 6));       // Should return [1, 2]`,
                                    python: `# Two Sum Problem
# Find two numbers in the array that add up to the target
def two_sum(nums, target):
    # Your code here
    pass

# Test cases
print(two_sum([2, 7, 11, 15], 9))  # Should return [0, 1]
print(two_sum([3, 2, 4], 6))       # Should return [1, 2]`,
                                    java: `// Two Sum Problem
// Find two numbers in the array that add up to the target
import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9)));  // Should return [0, 1]
        System.out.println(Arrays.toString(twoSum(new int[]{3, 2, 4}, 6)));       // Should return [1, 2]
    }
}`,
                                    cpp: `// Two Sum Problem
// Find two numbers in the array that add up to the target
#include <iostream>
#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {};
}

int main() {
    vector<int> nums1 = {2, 7, 11, 15};
    vector<int> result1 = twoSum(nums1, 9);  // Should return [0, 1]
    
    vector<int> nums2 = {3, 2, 4};
    vector<int> result2 = twoSum(nums2, 6);  // Should return [1, 2]
    
    return 0;
}`,
                                    rust: `// Two Sum Problem
// Find two numbers in the array that add up to the target
fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    // Your code here
    vec![]
}

fn main() {
    println!("{:?}", two_sum(vec![2, 7, 11, 15], 9));  // Should return [0, 1]
    println!("{:?}", two_sum(vec![3, 2, 4], 6));       // Should return [1, 2]
}`
                                  },
                                  'Reverse String': {
                                    javascript: `// Reverse String Problem
// Reverse the input string in-place
function reverseString(s) {
    // Your code here
    
}

// Test cases
console.log(reverseString(['h','e','l','l','o']));  // Should return ['o','l','l','e','h']
console.log(reverseString(['H','a','n','n','a','h'])); // Should return ['h','a','n','n','a','H']`,
                                    python: `# Reverse String Problem
# Reverse the input string in-place
def reverse_string(s):
    # Your code here
    pass

# Test cases
print(reverse_string(['h','e','l','l','o']))  # Should return ['o','l','l','e','h']
print(reverse_string(['H','a','n','n','a','h'])) # Should return ['h','a','n','n','a','H']`,
                                    java: `// Reverse String Problem
// Reverse the input string in-place
public class Main {
    public static void reverseString(char[] s) {
        // Your code here
        
    }
    
    public static void main(String[] args) {
        char[] test1 = {'h','e','l','l','o'};
        reverseString(test1);  // Should reverse to ['o','l','l','e','h']
        System.out.println(test1);
        
        char[] test2 = {'H','a','n','n','a','h'};
        reverseString(test2);  // Should reverse to ['h','a','n','n','a','H']
        System.out.println(test2);
    }
}`,
                                    cpp: `// Reverse String Problem
// Reverse the input string in-place
#include <iostream>
#include <vector>
using namespace std;

void reverseString(vector<char>& s) {
    // Your code here
    
}

int main() {
    vector<char> test1 = {'h','e','l','l','o'};
    reverseString(test1);  // Should reverse to ['o','l','l','e','h']
    
    vector<char> test2 = {'H','a','n','n','a','h'};
    reverseString(test2);  // Should reverse to ['h','a','n','n','a','H']
    
    return 0;
}`,
                                    rust: `// Reverse String Problem
// Reverse the input string in-place
fn reverse_string(s: &mut Vec<char>) {
    // Your code here
    
}

fn main() {
    let mut test1 = vec!['h','e','l','l','o'];
    reverse_string(&mut test1);  // Should reverse to ['o','l','l','e','h']
    println!("{:?}", test1);
    
    let mut test2 = vec!['H','a','n','n','a','h'];
    reverse_string(&mut test2);  // Should reverse to ['h','a','n','n','a','H']
    println!("{:?}", test2);
}`
                                  }
                                };
                                
                                if (templates[problem.title] && templates[problem.title][selectedLanguage]) {
                                  setCode(templates[problem.title][selectedLanguage]);
                                } else {
                                  // Fallback for any language
                                  setCode(`// ${problem.title}\n// ${problem.description}\n\n// Your solution here\n`);
                                }
                                toast.success(`Loading "${problem.title}" template`);
                              }}
                            >
                              Solve
                            </button>
                            <button 
                              className="btn btn-xs btn-outline"
                              onClick={() => {
                                // Show solution
                                if (problem.solution && problem.solution[selectedLanguage]) {
                                  setCode(problem.solution[selectedLanguage]);
                                  toast.info('Solution loaded! Study it carefully.');
                                } else {
                                  toast.error('Solution not available for this language');
                                }
                              }}
                            >
                              View Solution
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Video Upload Section */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4">Share Your Knowledge</h3>
              <p className="text-sm opacity-80 mb-4">
                Upload your own coding tutorials and help others learn!
              </p>
              
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="video/*"
                  className="file-input file-input-bordered flex-1"
                  onChange={handleVideoUpload}
                />
                <button className="btn btn-primary">
                  <UploadIcon className="w-5 h-5" />
                  Upload
                </button>
              </div>

              {userVideos.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold mb-2">Your Videos:</h4>
                  <div className="space-y-2">
                    {userVideos.map(video => (
                      <div key={video.id} className="flex items-center gap-2 p-2 bg-base-200 rounded">
                        <VideoIcon className="w-4 h-4" />
                        <span className="text-sm">{video.title}</span>
                        <span className="badge badge-xs">{video.language}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingLearning;