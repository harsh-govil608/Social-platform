import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import CodingProgress from "../models/CodingProgress.js";
import CodingChallenge from "../models/CodingChallenge.js";
import UserProject from "../models/UserProject.js";
import User from "../models/User.js";

const router = express.Router();

// Get coding challenges based on language and difficulty
router.get("/challenges", protectRoute, async (req, res) => {
  try {
    const { language, difficulty = 'easy' } = req.query;
    
    // Get or create challenges for the requested parameters
    let challenges = await CodingChallenge.find({ 
      language, 
      difficulty,
      active: true 
    }).limit(10);
    
    // If no challenges exist, generate some default ones
    if (challenges.length === 0) {
      challenges = generateDefaultChallenges(language, difficulty);
      // Save them to database for future use
      await CodingChallenge.insertMany(challenges);
    }
    
    res.json(challenges);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ message: "Failed to fetch challenges" });
  }
});

// Get user's coding progress
router.get("/progress", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    
    let progress = await CodingProgress.findOne({ userId });
    
    if (!progress) {
      progress = await CodingProgress.create({ 
        userId,
        languagesLearned: [],
        problemsSolved: 0,
        totalXP: 0,
        currentStreak: 0,
        rank: 'Beginner'
      });
    }
    
    res.json({
      totalSolved: progress.problemsSolved,
      streak: progress.currentStreak,
      rank: calculateRank(progress.totalXP),
      languages: progress.languagesLearned,
      xp: progress.totalXP
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ message: "Failed to fetch progress" });
  }
});

// Submit code for execution and testing
router.post("/submit", protectRoute, async (req, res) => {
  try {
    const { code, language, challengeId, testCases } = req.body;
    const userId = req.user._id;
    
    // Simulate code execution (in production, use Docker containers or sandbox)
    const executionResult = await executeCode(code, language, testCases);
    
    // If challenge was solved successfully, update progress
    if (executionResult.passed && challengeId) {
      const challenge = await CodingChallenge.findById(challengeId);
      
      if (challenge) {
        const progress = await CodingProgress.findOne({ userId });
        
        // Check if already solved
        const alreadySolved = progress.solvedChallenges.some(
          sc => sc.challengeId.toString() === challengeId
        );
        
        if (!alreadySolved) {
          progress.problemsSolved += 1;
          progress.totalXP += challenge.xp;
          progress.solvedChallenges.push({
            challengeId,
            language,
            solvedAt: new Date(),
            attempts: 1,
            executionTime: executionResult.executionTime
          });
          
          // Add language if not already in list
          if (!progress.languagesLearned.includes(language)) {
            progress.languagesLearned.push(language);
          }
          
          // Update streak
          const today = new Date().toDateString();
          const lastActive = progress.lastActiveDate?.toDateString();
          
          if (lastActive !== today) {
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if (lastActive === yesterday) {
              progress.currentStreak += 1;
            } else {
              progress.currentStreak = 1;
            }
            progress.lastActiveDate = new Date();
          }
          
          progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
          
          await progress.save();
          
          // Update user's main XP
          const user = await User.findById(userId);
          user.totalXP = (user.totalXP || 0) + challenge.xp;
          await user.save();
        }
        
        executionResult.xp = challenge.xp;
        executionResult.coins = challenge.coins || Math.floor(challenge.xp / 5);
      }
    }
    
    res.json(executionResult);
  } catch (error) {
    console.error("Error submitting code:", error);
    res.status(500).json({ 
      error: error.message || "Code execution failed",
      output: "Error: " + (error.message || "Unknown error")
    });
  }
});

// Save user project
router.post("/projects/save", protectRoute, async (req, res) => {
  try {
    const { name, code, language, challenge } = req.body;
    const userId = req.user._id;
    
    const project = await UserProject.create({
      userId,
      name,
      code,
      language,
      challengeId: challenge?.id,
      lastModified: new Date()
    });
    
    res.json({ message: "Project saved successfully", projectId: project._id });
  } catch (error) {
    console.error("Error saving project:", error);
    res.status(500).json({ message: "Failed to save project" });
  }
});

// Get user's saved projects
router.get("/projects", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const projects = await UserProject.find({ userId })
      .sort({ lastModified: -1 })
      .limit(20);
    
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// Helper function to execute code (simplified - in production use proper sandboxing)
async function executeCode(code, language, testCases = []) {
  try {
    // Simulate execution based on language
    let output = '';
    let testResults = [];
    let passed = true;
    
    // Basic validation
    if (!code || code.trim().length === 0) {
      throw new Error("No code provided");
    }
    
    // Language-specific execution simulation
    switch(language) {
      case 'javascript':
        // Check for console.log or return statements
        if (code.includes('console.log')) {
          const match = code.match(/console\.log\s*\(\s*["'`](.+?)["'`]\s*\)/);
          output = match ? match[1] : 'Code executed successfully';
        } else if (code.includes('return')) {
          output = 'Function defined successfully';
        } else {
          output = 'Code executed without output';
        }
        break;
        
      case 'python':
        if (code.includes('print')) {
          const match = code.match(/print\s*\(\s*["'](.+?)["']\s*\)/);
          output = match ? match[1] : 'Code executed successfully';
        } else {
          output = 'Code executed without output';
        }
        break;
        
      case 'java':
        if (code.includes('System.out.println')) {
          const match = code.match(/System\.out\.println\s*\(\s*"(.+?)"\s*\)/);
          output = match ? match[1] : 'Code executed successfully';
        } else {
          output = 'Code compiled and executed successfully';
        }
        break;
        
      case 'cpp':
        if (code.includes('cout')) {
          const match = code.match(/cout\s*<<\s*"(.+?)"/);
          output = match ? match[1] : 'Code executed successfully';
        } else {
          output = 'Code compiled and executed successfully';
        }
        break;
        
      case 'rust':
        if (code.includes('println!')) {
          const match = code.match(/println!\s*\(\s*"(.+?)"\s*\)/);
          output = match ? match[1] : 'Code executed successfully';
        } else {
          output = 'Code compiled and executed successfully';
        }
        break;
        
      default:
        output = 'Code executed successfully';
    }
    
    // Simulate test case execution
    if (testCases && testCases.length > 0) {
      testResults = testCases.map((test, index) => ({
        name: test.name || `Test Case ${index + 1}`,
        input: test.input,
        expectedOutput: test.expected,
        actualOutput: output,
        passed: output.includes(test.expected) || Math.random() > 0.3, // Simplified
        executionTime: Math.floor(Math.random() * 100) + 50 // Random execution time
      }));
      
      passed = testResults.every(t => t.passed);
    }
    
    return {
      output,
      testResults,
      passed,
      executionTime: Math.floor(Math.random() * 500) + 100,
      memoryUsed: Math.floor(Math.random() * 50) + 10
    };
  } catch (error) {
    throw error;
  }
}

// Helper function to calculate rank based on XP
function calculateRank(xp) {
  if (xp < 100) return 'Beginner';
  if (xp < 500) return 'Novice';
  if (xp < 1000) return 'Intermediate';
  if (xp < 5000) return 'Advanced';
  if (xp < 10000) return 'Expert';
  return 'Master';
}

// Helper function to generate default challenges
function generateDefaultChallenges(language, difficulty) {
  const challenges = {
    easy: [
      {
        title: 'Hello World',
        description: `Write a ${language} program that prints "Hello, World!"`,
        language,
        difficulty: 'easy',
        xp: 10,
        coins: 5,
        hints: ['Use the standard output function', 'Check the language syntax'],
        testCases: [
          { input: '', expected: 'Hello, World!' }
        ],
        active: true
      },
      {
        title: 'Sum of Two Numbers',
        description: 'Create a function that returns the sum of two numbers',
        language,
        difficulty: 'easy',
        xp: 20,
        coins: 10,
        hints: ['Define a function with two parameters', 'Return the sum'],
        testCases: [
          { input: '2, 3', expected: '5' },
          { input: '10, 20', expected: '30' }
        ],
        active: true
      },
      {
        title: 'Even or Odd',
        description: 'Check if a number is even or odd',
        language,
        difficulty: 'easy',
        xp: 25,
        coins: 12,
        hints: ['Use modulo operator', 'Check remainder when divided by 2'],
        testCases: [
          { input: '4', expected: 'even' },
          { input: '7', expected: 'odd' }
        ],
        active: true
      }
    ],
    medium: [
      {
        title: 'Fibonacci Sequence',
        description: 'Generate the first n Fibonacci numbers',
        language,
        difficulty: 'medium',
        xp: 50,
        coins: 25,
        hints: ['Start with 0 and 1', 'Each number is sum of previous two'],
        testCases: [
          { input: '5', expected: '[0, 1, 1, 2, 3]' },
          { input: '10', expected: '[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]' }
        ],
        active: true
      },
      {
        title: 'Palindrome Check',
        description: 'Check if a string is a palindrome',
        language,
        difficulty: 'medium',
        xp: 40,
        coins: 20,
        hints: ['Compare string with its reverse', 'Ignore case and spaces'],
        testCases: [
          { input: 'racecar', expected: 'true' },
          { input: 'hello', expected: 'false' }
        ],
        active: true
      },
      {
        title: 'Prime Number Check',
        description: 'Determine if a number is prime',
        language,
        difficulty: 'medium',
        xp: 45,
        coins: 22,
        hints: ['Check divisibility up to sqrt(n)', 'Handle edge cases'],
        testCases: [
          { input: '17', expected: 'true' },
          { input: '20', expected: 'false' }
        ],
        active: true
      }
    ],
    advanced: [
      {
        title: 'Binary Search Implementation',
        description: 'Implement binary search on a sorted array',
        language,
        difficulty: 'advanced',
        xp: 100,
        coins: 50,
        hints: ['Divide and conquer', 'Update left and right pointers'],
        testCases: [
          { input: '[1,2,3,4,5], 3', expected: '2' },
          { input: '[1,3,5,7,9], 7', expected: '3' }
        ],
        active: true
      },
      {
        title: 'Merge Sort',
        description: 'Implement merge sort algorithm',
        language,
        difficulty: 'advanced',
        xp: 120,
        coins: 60,
        hints: ['Divide array in half', 'Merge sorted halves'],
        testCases: [
          { input: '[3,1,4,1,5]', expected: '[1,1,3,4,5]' },
          { input: '[9,2,6,5,3]', expected: '[2,3,5,6,9]' }
        ],
        active: true
      }
    ]
  };
  
  return challenges[difficulty] || challenges.easy;
}

export default router;