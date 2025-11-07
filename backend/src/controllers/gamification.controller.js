import Achievement from '../models/Achievement.js';
import User from '../models/User.js';
import UserActivity from '../models/UserActivity.js';

// Initialize default achievements
export const initializeAchievements = async () => {
  const defaultAchievements = [
    // Learning achievements
    {
      name: 'first-steps',
      title: 'First Steps',
      description: 'Complete your first AI tutor session',
      icon: '🎓',
      category: 'learning',
      difficulty: 'bronze',
      points: 10,
      requirement: 1,
      criteria: {
        type: 'count',
        metric: 'aiTutorSessions',
        target: 1,
        description: 'Complete 1 AI tutor session'
      },
      rewards: { xp: 50, coins: 100 }
    },
    {
      name: 'dedicated-learner',
      title: 'Dedicated Learner',
      description: 'Complete 50 AI tutor sessions',
      icon: '📚',
      category: 'learning',
      difficulty: 'silver',
      points: 50,
      requirement: 50,
      criteria: {
        type: 'count',
        metric: 'aiTutorSessions',
        target: 50,
        description: 'Complete 50 AI tutor sessions'
      },
      rewards: { xp: 500, coins: 1000 }
    },
    {
      name: 'master-student',
      title: 'Master Student',
      description: 'Complete 200 AI tutor sessions',
      icon: '🏆',
      category: 'learning',
      difficulty: 'gold',
      points: 200,
      requirement: 200,
      criteria: {
        type: 'count',
        metric: 'aiTutorSessions',
        target: 200,
        description: 'Complete 200 AI tutor sessions'
      },
      rewards: { xp: 2000, coins: 5000, unlockFeature: 'custom_learning_path' }
    },

    // Coding achievements
    {
      name: 'code-warrior',
      title: 'Code Warrior',
      description: 'Solve your first DSA problem',
      icon: '⚔️',
      category: 'coding',
      difficulty: 'bronze',
      points: 10,
      requirement: 1,
      criteria: {
        type: 'count',
        metric: 'dsaProblemsCompleted',
        target: 1,
        description: 'Solve 1 DSA problem'
      },
      rewards: { xp: 50, coins: 100 }
    },
    {
      name: 'problem-solver',
      title: 'Problem Solver',
      description: 'Solve 50 DSA problems',
      icon: '💻',
      category: 'coding',
      difficulty: 'silver',
      points: 50,
      requirement: 50,
      criteria: {
        type: 'count',
        metric: 'dsaProblemsCompleted',
        target: 50,
        description: 'Solve 50 DSA problems'
      },
      rewards: { xp: 500, coins: 1000 }
    },
    {
      name: 'algorithm-master',
      title: 'Algorithm Master',
      description: 'Solve 200 DSA problems',
      icon: '🧠',
      category: 'coding',
      difficulty: 'gold',
      points: 200,
      requirement: 200,
      criteria: {
        type: 'count',
        metric: 'dsaProblemsCompleted',
        target: 200,
        description: 'Solve 200 DSA problems'
      },
      rewards: { xp: 2000, coins: 5000 }
    },

    // Streak achievements
    {
      name: 'consistent',
      title: 'Consistent',
      description: 'Maintain a 7-day login streak',
      icon: '🔥',
      category: 'milestone',
      difficulty: 'silver',
      points: 30,
      requirement: 7,
      criteria: {
        type: 'streak',
        metric: 'loginStreak',
        target: 7,
        description: 'Login for 7 consecutive days'
      },
      rewards: { xp: 300, coins: 500 }
    },
    {
      name: 'unstoppable',
      title: 'Unstoppable',
      description: 'Maintain a 30-day login streak',
      icon: '🚀',
      category: 'milestone',
      difficulty: 'gold',
      points: 100,
      requirement: 30,
      criteria: {
        type: 'streak',
        metric: 'loginStreak',
        target: 30,
        description: 'Login for 30 consecutive days'
      },
      rewards: { xp: 1000, coins: 3000 }
    },
    {
      name: 'legend',
      title: 'Legend',
      description: 'Maintain a 100-day login streak',
      icon: '👑',
      category: 'milestone',
      difficulty: 'diamond',
      points: 500,
      requirement: 100,
      criteria: {
        type: 'streak',
        metric: 'loginStreak',
        target: 100,
        description: 'Login for 100 consecutive days'
      },
      rewards: { xp: 5000, coins: 10000, unlockFeature: 'legendary_badge' }
    },

    // Social achievements
    {
      name: 'social-butterfly',
      title: 'Social Butterfly',
      description: 'Make 10 friends',
      icon: '🦋',
      category: 'social',
      difficulty: 'bronze',
      points: 20,
      requirement: 10,
      criteria: {
        type: 'count',
        metric: 'friendsCount',
        target: 10,
        description: 'Have 10 friends'
      },
      rewards: { xp: 200, coins: 300 }
    },
    {
      name: 'popular',
      title: 'Popular',
      description: 'Make 50 friends',
      icon: '⭐',
      category: 'social',
      difficulty: 'silver',
      points: 50,
      requirement: 50,
      criteria: {
        type: 'count',
        metric: 'friendsCount',
        target: 50,
        description: 'Have 50 friends'
      },
      rewards: { xp: 500, coins: 1000 }
    },

    // Language achievements
    {
      name: 'polyglot-beginner',
      title: 'Polyglot Beginner',
      description: 'Complete 10 conversation practices',
      icon: '🗣️',
      category: 'language',
      difficulty: 'bronze',
      points: 10,
      requirement: 10,
      criteria: {
        type: 'count',
        metric: 'conversationPractices',
        target: 10,
        description: 'Complete 10 conversation practices'
      },
      rewards: { xp: 100, coins: 200 }
    },
    {
      name: 'fluent-speaker',
      title: 'Fluent Speaker',
      description: 'Complete 100 conversation practices',
      icon: '🌍',
      category: 'language',
      difficulty: 'gold',
      points: 150,
      requirement: 100,
      criteria: {
        type: 'count',
        metric: 'conversationPractices',
        target: 100,
        description: 'Complete 100 conversation practices'
      },
      rewards: { xp: 1500, coins: 3000 }
    },

    // Special achievements
    {
      name: 'early-adopter',
      title: 'Early Adopter',
      description: 'Join during the beta period',
      icon: '🎖️',
      category: 'special',
      difficulty: 'platinum',
      points: 1000,
      requirement: 1,
      criteria: {
        type: 'special',
        description: 'Join during beta'
      },
      rewards: { xp: 5000, coins: 10000 },
      isSecret: false
    },
    {
      name: 'referral-champion',
      title: 'Referral Champion',
      description: 'Refer 10 friends who become active users',
      icon: '🎁',
      category: 'special',
      difficulty: 'gold',
      points: 200,
      requirement: 10,
      criteria: {
        type: 'count',
        metric: 'referralsCompleted',
        target: 10,
        description: 'Refer 10 active users'
      },
      rewards: { xp: 2000, coins: 5000 }
    }
  ];

  for (const achievementData of defaultAchievements) {
    const existing = await Achievement.findOne({ name: achievementData.name });
    if (!existing) {
      await Achievement.create(achievementData);
    }
  }

  console.log('✅ Achievements initialized');
};

// Get all achievements
export const getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ isActive: true })
      .sort({ category: 1, difficulty: 1 });

    // Get user's unlocked achievements
    const userActivity = await UserActivity.findOne({ user: req.user._id });
    const unlockedIds = userActivity?.achievements?.map(a => a.achievement.toString()) || [];

    res.json({
      achievements: achievements.map(a => ({
        ...a.toObject(),
        unlocked: unlockedIds.includes(a._id.toString())
      }))
    });
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ message: 'Failed to get achievements' });
  }
};

// Get user's achievements
export const getUserAchievements = async (req, res) => {
  try {
    const userActivity = await UserActivity.findOne({ user: req.user._id })
      .populate('achievements.achievement');

    if (!userActivity) {
      return res.json({
        unlockedAchievements: [],
        stats: {
          xp: 0,
          level: 1,
          coins: 0
        }
      });
    }

    res.json({
      unlockedAchievements: userActivity.achievements || [],
      stats: {
        xp: userActivity.gamification?.xp || 0,
        level: userActivity.gamification?.level || 1,
        coins: userActivity.gamification?.coins || 0
      }
    });
  } catch (error) {
    console.error('Error getting user achievements:', error);
    res.status(500).json({ message: 'Failed to get user achievements' });
  }
};

// Check and unlock achievements
export const checkAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    let userActivity = await UserActivity.findOne({ user: userId });

    if (!userActivity) {
      userActivity = await UserActivity.create({
        user: userId,
        gamification: {
          level: 1,
          xp: 0,
          coins: 0
        }
      });
    }

    // Get all achievements
    const achievements = await Achievement.find({ isActive: true });
    const unlockedIds = userActivity.achievements.map(a => a.achievement.toString());

    // Check each achievement
    for (const achievement of achievements) {
      // Skip if already unlocked
      if (unlockedIds.includes(achievement._id.toString())) continue;

      let shouldUnlock = false;

      // Check criteria based on type
      if (achievement.criteria.type === 'count') {
        const metric = achievement.criteria.metric;
        const current = userActivity.metrics?.[metric] || 0;
        shouldUnlock = current >= achievement.criteria.target;
      } else if (achievement.criteria.type === 'streak') {
        const metric = achievement.criteria.metric;
        const current = userActivity.streaks?.[metric] || 0;
        shouldUnlock = current >= achievement.criteria.target;
      }

      // Unlock achievement
      if (shouldUnlock) {
        userActivity.achievements.push({
          achievement: achievement._id,
          unlockedAt: new Date()
        });

        // Add rewards
        if (achievement.rewards.xp) {
          userActivity.gamification.xp += achievement.rewards.xp;
        }
        if (achievement.rewards.coins) {
          userActivity.gamification.coins += achievement.rewards.coins;
        }

        // Check level up
        const newLevel = Math.floor(userActivity.gamification.xp / 1000) + 1;
        if (newLevel > userActivity.gamification.level) {
          userActivity.gamification.level = newLevel;
        }

        // Update achievement stats
        achievement.totalUnlocks += 1;
        achievement.unlockedBy.push(userId);
        await achievement.save();

        console.log(`🎉 Achievement unlocked: ${achievement.name} for user ${userId}`);
      }
    }

    await userActivity.save();
    return userActivity;
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { category = 'xp', timeframe = 'all', limit = 50 } = req.query;

    let sortField = 'gamification.xp';
    if (category === 'level') sortField = 'gamification.level';
    else if (category === 'coins') sortField = 'gamification.coins';
    else if (category === 'achievements') sortField = 'achievements';

    const leaderboard = await UserActivity.find()
      .populate('user', 'fullName profilePic username')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit));

    // Format leaderboard data for frontend
    const formattedLeaderboard = leaderboard.map((entry) => ({
      _id: entry._id,
      user: entry.user,
      xp: entry.gamification?.xp || 0,
      level: entry.gamification?.level || 1,
      achievementsCount: entry.achievements?.length || 0,
      problemsSolved: entry.metrics?.dsaProblemsCompleted || 0,
      referralsCount: entry.metrics?.referralsCompleted || 0
    }));

    res.json({
      leaderboard: formattedLeaderboard
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ message: 'Failed to get leaderboard' });
  }
};

// Increment metric (helper function)
export const incrementMetric = async (userId, metric, amount = 1) => {
  try {
    let userActivity = await UserActivity.findOne({ user: userId });

    if (!userActivity) {
      userActivity = await UserActivity.create({
        user: userId,
        gamification: { level: 1, xp: 0, coins: 0 }
      });
    }

    if (!userActivity.metrics) {
      userActivity.metrics = {};
    }

    userActivity.metrics[metric] = (userActivity.metrics[metric] || 0) + amount;
    await userActivity.save();

    // Check for new achievements
    await checkAchievements(userId);

    return userActivity;
  } catch (error) {
    console.error('Error incrementing metric:', error);
  }
};

// Update streak
export const updateStreak = async (userId, streakType) => {
  try {
    let userActivity = await UserActivity.findOne({ user: userId });

    if (!userActivity) {
      userActivity = await UserActivity.create({
        user: userId,
        gamification: { level: 1, xp: 0, coins: 0 }
      });
    }

    if (!userActivity.streaks) {
      userActivity.streaks = {};
    }

    const now = new Date();
    const lastActivity = userActivity.streaks[`${streakType}LastActivity`];

    if (!lastActivity) {
      // First activity
      userActivity.streaks[streakType] = 1;
      userActivity.streaks[`${streakType}LastActivity`] = now;
    } else {
      const daysSinceLastActivity = Math.floor((now - new Date(lastActivity)) / (1000 * 60 * 60 * 24));

      if (daysSinceLastActivity === 0) {
        // Same day, don't update
        return userActivity;
      } else if (daysSinceLastActivity === 1) {
        // Consecutive day
        userActivity.streaks[streakType] = (userActivity.streaks[streakType] || 0) + 1;
        userActivity.streaks[`${streakType}LastActivity`] = now;
      } else {
        // Streak broken
        userActivity.streaks[streakType] = 1;
        userActivity.streaks[`${streakType}LastActivity`] = now;
      }
    }

    await userActivity.save();

    // Check for streak achievements
    await checkAchievements(userId);

    return userActivity;
  } catch (error) {
    console.error('Error updating streak:', error);
  }
};
