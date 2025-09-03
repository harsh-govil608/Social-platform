import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import DSAProblem from "../models/DSAProblem.js";
import ProblemSubmission from "../models/ProblemSubmission.js";
import User from "../models/User.js";
import { dsaProblems } from "../data/dsaProblems.js";

const router = express.Router();

// Initialize problems in database (run once)
router.post("/init-problems", protectRoute, async (req, res) => {
  try {
    // Check if problems already exist
    const existingCount = await DSAProblem.countDocuments();
    if (existingCount > 0) {
      return res.json({ message: "Problems already initialized", count: existingCount });
    }

    // Insert all problems
    const inserted = await DSAProblem.insertMany(dsaProblems);
    res.json({ 
      success: true, 
      message: `Initialized ${inserted.length} problems`,
      count: inserted.length 
    });
  } catch (error) {
    console.error("Error initializing problems:", error);
    res.status(500).json({ message: "Failed to initialize problems" });
  }
});

// Get all problems with filters
router.get("/problems", protectRoute, async (req, res) => {
  try {
    const { 
      difficulty, 
      category, 
      tags, 
      search,
      page = 1, 
      limit = 20,
      sortBy = 'difficulty' // difficulty, title, acceptanceRate
    } = req.query;
    
    const userId = req.user._id;
    
    // Build query
    const query = { isActive: true };
    
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get problems
    const problems = await DSAProblem.find(query)
      .select('-solution -testCases')
      .sort(sortBy === 'title' ? { title: 1 } : 
            sortBy === 'acceptanceRate' ? { acceptanceRate: -1 } :
            { difficulty: 1, title: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get user's submissions for these problems
    const problemIds = problems.map(p => p._id);
    const submissions = await ProblemSubmission.find({
      userId,
      problemId: { $in: problemIds },
      status: 'Accepted'
    }).select('problemId');
    
    const solvedSet = new Set(submissions.map(s => s.problemId.toString()));
    
    // Add solved status to each problem
    const problemsWithStatus = problems.map(problem => ({
      ...problem.toObject(),
      solved: solvedSet.has(problem._id.toString())
    }));
    
    const total = await DSAProblem.countDocuments(query);
    
    res.json({
      problems: problemsWithStatus,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.status(500).json({ message: "Failed to fetch problems" });
  }
});

// Get single problem details
router.get("/problems/:problemId", protectRoute, async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user._id;
    
    const problem = await DSAProblem.findById(problemId)
      .select('-solution.javascript -solution.python -solution.java -solution.cpp');
    
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    
    // Get user's submissions for this problem
    const submissions = await ProblemSubmission.find({
      userId,
      problemId
    })
      .select('-code -testResults')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Check if user solved it
    const solved = submissions.some(s => s.status === 'Accepted');
    
    res.json({
      problem,
      solved,
      submissions,
      attemptCount: submissions.length
    });
  } catch (error) {
    console.error("Error fetching problem:", error);
    res.status(500).json({ message: "Failed to fetch problem" });
  }
});

// Submit solution
router.post("/submit", protectRoute, async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user._id;
    
    if (!code || !language || !problemId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const problem = await DSAProblem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    
    // Run test cases (simplified - in production use Docker/sandbox)
    const testResults = await runTestCases(code, language, problem.testCases);
    
    // Calculate status
    const passedCount = testResults.filter(r => r.passed).length;
    const totalCount = testResults.length;
    const allPassed = passedCount === totalCount;
    
    let status = 'Wrong Answer';
    if (allPassed) {
      status = 'Accepted';
    } else if (testResults.some(r => r.error === 'timeout')) {
      status = 'Time Limit Exceeded';
    } else if (testResults.some(r => r.error === 'memory')) {
      status = 'Memory Limit Exceeded';
    } else if (testResults.some(r => r.error === 'runtime')) {
      status = 'Runtime Error';
    }
    
    // Calculate rewards
    let xpEarned = 0;
    let coinsEarned = 0;
    
    if (status === 'Accepted') {
      // Check if first time solving
      const previousAccepted = await ProblemSubmission.findOne({
        userId,
        problemId,
        status: 'Accepted'
      });
      
      if (!previousAccepted) {
        // First time solving - give rewards
        xpEarned = problem.difficulty === 'Easy' ? 50 : 
                   problem.difficulty === 'Medium' ? 100 : 200;
        coinsEarned = Math.floor(xpEarned / 5);
        
        // Update user stats
        const user = await User.findById(userId);
        user.totalXP = (user.totalXP || 0) + xpEarned;
        await user.save();
        
        // Update problem stats
        problem.accepted += 1;
      }
    }
    
    problem.submissions += 1;
    problem.acceptanceRate = (problem.accepted / problem.submissions) * 100;
    await problem.save();
    
    // Create submission record
    const submission = await ProblemSubmission.create({
      userId,
      problemId,
      language,
      code,
      status,
      testCasesPassed: passedCount,
      totalTestCases: totalCount,
      testResults: testResults.slice(0, 3), // Only store first 3 test results
      runtime: Math.floor(Math.random() * 100) + 50, // Mock runtime
      memory: Math.floor(Math.random() * 50) + 10, // Mock memory
      xpEarned,
      coinsEarned
    });
    
    res.json({
      submission,
      testResults,
      status,
      passedCount,
      totalCount,
      xpEarned,
      coinsEarned
    });
  } catch (error) {
    console.error("Error submitting solution:", error);
    res.status(500).json({ message: "Failed to submit solution" });
  }
});

// Run code without submitting
router.post("/run", protectRoute, async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    
    const problem = await DSAProblem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    
    // Only run visible test cases
    const visibleTests = problem.testCases.filter(tc => !tc.isHidden).slice(0, 3);
    const testResults = await runTestCases(code, language, visibleTests);
    
    res.json({
      testResults,
      passedCount: testResults.filter(r => r.passed).length,
      totalCount: testResults.length
    });
  } catch (error) {
    console.error("Error running code:", error);
    res.status(500).json({ message: "Failed to run code" });
  }
});

// Get user's problem solving stats
router.get("/stats", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all user's accepted submissions
    const acceptedSubmissions = await ProblemSubmission.find({
      userId,
      status: 'Accepted'
    }).distinct('problemId');
    
    // Get problem details
    const solvedProblems = await DSAProblem.find({
      _id: { $in: acceptedSubmissions }
    }).select('difficulty category');
    
    // Calculate stats
    const stats = {
      totalSolved: solvedProblems.length,
      easySolved: solvedProblems.filter(p => p.difficulty === 'Easy').length,
      mediumSolved: solvedProblems.filter(p => p.difficulty === 'Medium').length,
      hardSolved: solvedProblems.filter(p => p.difficulty === 'Hard').length,
      categoriesBreakdown: {}
    };
    
    // Category breakdown
    solvedProblems.forEach(problem => {
      if (!stats.categoriesBreakdown[problem.category]) {
        stats.categoriesBreakdown[problem.category] = 0;
      }
      stats.categoriesBreakdown[problem.category]++;
    });
    
    // Get total problems count
    const totalProblems = await DSAProblem.countDocuments({ isActive: true });
    const easyTotal = await DSAProblem.countDocuments({ difficulty: 'Easy', isActive: true });
    const mediumTotal = await DSAProblem.countDocuments({ difficulty: 'Medium', isActive: true });
    const hardTotal = await DSAProblem.countDocuments({ difficulty: 'Hard', isActive: true });
    
    stats.totalProblems = totalProblems;
    stats.easyTotal = easyTotal;
    stats.mediumTotal = mediumTotal;
    stats.hardTotal = hardTotal;
    stats.solveRate = ((stats.totalSolved / totalProblems) * 100).toFixed(1);
    
    // Recent submissions
    const recentSubmissions = await ProblemSubmission.find({ userId })
      .populate('problemId', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      stats,
      recentSubmissions
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// Helper function to run test cases (simplified - in production use Docker)
async function runTestCases(code, language, testCases) {
  const results = [];
  
  for (const testCase of testCases) {
    try {
      // This is a simplified mock - in production, use proper code execution
      const result = mockExecuteCode(code, language, testCase.input);
      
      const passed = result.output.trim() === testCase.expectedOutput.trim();
      
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.output,
        passed,
        runtime: Math.floor(Math.random() * 100) + 10,
        memory: Math.floor(Math.random() * 50) + 5
      });
    } catch (error) {
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: '',
        passed: false,
        error: 'runtime'
      });
    }
  }
  
  return results;
}

// Mock code execution (replace with real execution in production)
function mockExecuteCode(code, language, input) {
  // This is a simplified mock that randomly returns success or failure
  // In production, use Docker containers or sandboxed environments
  
  const random = Math.random();
  
  if (random < 0.7) {
    // 70% chance of correct output
    if (input.includes('[2,7,11,15]') && input.includes('9')) {
      return { output: '[0,1]' };
    } else if (input.includes('[3,2,4]') && input.includes('6')) {
      return { output: '[1,2]' };
    } else if (input.includes('["h","e","l","l","o"]')) {
      return { output: '["o","l","l","e","h"]' };
    } else if (input === '121') {
      return { output: 'true' };
    } else if (input === '-121') {
      return { output: 'false' };
    } else if (input === '"abcabcbb"') {
      return { output: '3' };
    } else if (input === '2') {
      return { output: '2' };
    } else if (input === '3') {
      return { output: '3' };
    }
  }
  
  // Return random output for failure cases
  return { output: random < 0.5 ? '[]' : '0' };
}

export default router;