import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import StorySubmission from "../models/StorySubmission.js";
import UserActivity from "../models/UserActivity.js";
import User from "../models/User.js";

const router = express.Router();

// AI rating function (simulated - in production, use OpenAI or similar)
function generateAIRating(content, language, difficulty) {
  // Simulate AI analysis
  const wordCount = content.split(/\s+/).length;
  const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim()).length;
  const avgWordsPerSentence = wordCount / sentenceCount;
  
  // Generate scores based on simple heuristics
  const grammar = Math.min(10, 5 + Math.random() * 5);
  const creativity = Math.min(10, 4 + Math.random() * 6);
  const coherence = Math.min(10, 5 + Math.random() * 5);
  const vocabulary = Math.min(10, 4 + Math.random() * 6);
  const engagement = Math.min(10, 5 + Math.random() * 5);
  
  const overallScore = (grammar + creativity + coherence + vocabulary + engagement) / 5;
  
  // Generate feedback based on scores
  const feedbackParts = [];
  
  if (grammar > 7) feedbackParts.push("Excellent grammar and sentence structure!");
  else if (grammar > 5) feedbackParts.push("Good grammar with minor improvements needed.");
  else feedbackParts.push("Focus on improving grammar and punctuation.");
  
  if (creativity > 7) feedbackParts.push("Very creative and imaginative storytelling!");
  else if (creativity > 5) feedbackParts.push("Good creativity, try adding more unique elements.");
  else feedbackParts.push("Explore more creative ideas and plot twists.");
  
  if (vocabulary > 7) feedbackParts.push("Rich vocabulary usage!");
  else if (vocabulary > 5) feedbackParts.push("Good vocabulary, consider using more varied words.");
  else feedbackParts.push("Expand your vocabulary for better expression.");
  
  if (coherence > 7) feedbackParts.push("Well-structured and coherent narrative.");
  else if (coherence > 5) feedbackParts.push("Generally coherent with some flow improvements needed.");
  else feedbackParts.push("Work on story flow and logical progression.");
  
  return {
    score: Math.round(overallScore * 10) / 10,
    feedback: feedbackParts.join(" "),
    criteria: {
      grammar: Math.round(grammar * 10) / 10,
      creativity: Math.round(creativity * 10) / 10,
      coherence: Math.round(coherence * 10) / 10,
      vocabulary: Math.round(vocabulary * 10) / 10,
      engagement: Math.round(engagement * 10) / 10
    }
  };
}

// Submit a story
router.post("/submit", protectRoute, async (req, res) => {
  try {
    const { 
      title, 
      content, 
      prompts, 
      language, 
      difficulty, 
      challengeType,
      timeSpent 
    } = req.body;
    const userId = req.user._id;
    
    // Generate AI rating
    const aiRating = generateAIRating(content, language, difficulty);
    
    // Calculate rewards based on AI rating
    const baseXP = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 100 : 150;
    const xpEarned = Math.round(baseXP * (aiRating.score / 10));
    const coinsEarned = Math.round(xpEarned / 5);
    
    // Create story submission
    const story = await StorySubmission.create({
      userId,
      title,
      content,
      prompts,
      language,
      difficulty,
      challengeType: challengeType || 'story_builder',
      wordCount: content.split(/\s+/).length,
      timeSpent: timeSpent || 300, // default 5 minutes
      aiRating,
      xpEarned,
      coinsEarned
    });
    
    // Update user activity
    const activity = await UserActivity.findOne({ user: userId });
    if (activity) {
      const today = new Date().toDateString();
      let todaySession = activity.dailySessions.find(s => 
        new Date(s.date).toDateString() === today
      );
      
      if (!todaySession) {
        todaySession = {
          date: new Date(),
          activities: [],
          completedChallenges: [],
          storiesWritten: 0
        };
        activity.dailySessions.push(todaySession);
      }
      
      todaySession.storiesWritten = (todaySession.storiesWritten || 0) + 1;
      todaySession.completedChallenges.push({
        challengeType: 'story_builder',
        xpEarned,
        coinsEarned,
        completedAt: new Date()
      });
      
      await activity.save();
    }
    
    // Update user's XP and coins
    const user = await User.findById(userId);
    user.totalXP = (user.totalXP || 0) + xpEarned;
    await user.save();
    
    res.json({
      success: true,
      story,
      rewards: { xp: xpEarned, coins: coinsEarned }
    });
  } catch (error) {
    console.error("Error submitting story:", error);
    res.status(500).json({ message: "Failed to submit story" });
  }
});

// Get user's stories
router.get("/my-stories", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    
    const stories = await StorySubmission.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'fullName profilePic');
    
    const total = await StorySubmission.countDocuments({ userId });
    
    res.json({
      stories,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: "Failed to fetch stories" });
  }
});

// Get public stories for review
router.get("/public", protectRoute, async (req, res) => {
  try {
    const { page = 1, limit = 10, language, difficulty } = req.query;
    const userId = req.user._id;
    
    const query = { 
      isPublic: true,
      userId: { $ne: userId } // Exclude user's own stories
    };
    
    if (language) query.language = language;
    if (difficulty) query.difficulty = difficulty;
    
    const stories = await StorySubmission.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'fullName profilePic')
      .populate('userRatings.userId', 'fullName profilePic');
    
    const total = await StorySubmission.countDocuments(query);
    
    res.json({
      stories,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Error fetching public stories:", error);
    res.status(500).json({ message: "Failed to fetch stories" });
  }
});

// Rate a story
router.post("/:storyId/rate", protectRoute, async (req, res) => {
  try {
    const { storyId } = req.params;
    const { score, feedback } = req.body;
    const userId = req.user._id;
    
    if (score < 0 || score > 10) {
      return res.status(400).json({ message: "Score must be between 0 and 10" });
    }
    
    const story = await StorySubmission.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }
    
    // Check if user already rated this story
    const existingRating = story.userRatings.find(r => 
      r.userId.toString() === userId.toString()
    );
    
    if (existingRating) {
      // Update existing rating
      existingRating.score = score;
      existingRating.feedback = feedback;
      existingRating.ratedAt = new Date();
    } else {
      // Add new rating
      story.userRatings.push({
        userId,
        score,
        feedback,
        ratedAt: new Date()
      });
      story.totalUserRatings += 1;
    }
    
    // Recalculate average rating
    story.averageUserRating = story.calculateAverageRating();
    
    await story.save();
    
    // Give small reward to reviewer
    const user = await User.findById(userId);
    user.totalXP = (user.totalXP || 0) + 5; // 5 XP for reviewing
    await user.save();
    
    res.json({
      success: true,
      averageRating: story.averageUserRating,
      totalRatings: story.totalUserRatings
    });
  } catch (error) {
    console.error("Error rating story:", error);
    res.status(500).json({ message: "Failed to rate story" });
  }
});

// Like/unlike a story
router.post("/:storyId/like", protectRoute, async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user._id;
    
    const story = await StorySubmission.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }
    
    const likeIndex = story.likes.indexOf(userId);
    if (likeIndex > -1) {
      story.likes.splice(likeIndex, 1);
    } else {
      story.likes.push(userId);
    }
    
    await story.save();
    
    res.json({
      success: true,
      likes: story.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error("Error liking story:", error);
    res.status(500).json({ message: "Failed to like story" });
  }
});

// Get story details
router.get("/:storyId", protectRoute, async (req, res) => {
  try {
    const { storyId } = req.params;
    
    const story = await StorySubmission.findById(storyId)
      .populate('userId', 'fullName profilePic')
      .populate('userRatings.userId', 'fullName profilePic');
    
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }
    
    // Increment view count
    story.views += 1;
    await story.save();
    
    res.json(story);
  } catch (error) {
    console.error("Error fetching story:", error);
    res.status(500).json({ message: "Failed to fetch story" });
  }
});

// Get leaderboard
router.get("/leaderboard/top", protectRoute, async (req, res) => {
  try {
    const { period = 'week', limit = 10 } = req.query;
    
    let dateFilter = new Date();
    if (period === 'day') {
      dateFilter.setDate(dateFilter.getDate() - 1);
    } else if (period === 'week') {
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (period === 'month') {
      dateFilter.setMonth(dateFilter.getMonth() - 1);
    }
    
    const topStories = await StorySubmission.find({
      isPublic: true,
      createdAt: { $gte: dateFilter }
    })
      .sort({ averageUserRating: -1, 'aiRating.score': -1 })
      .limit(limit)
      .populate('userId', 'fullName profilePic');
    
    res.json(topStories);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

export default router;