import Vocabulary from "../models/vocabulary.model.js";
import LearningProgress from "../models/LearningProgress.js";
import UserActivity from "../models/UserActivity.js";
import WordOfDayCompletion from "../models/WordOfDayCompletion.js";
import DailyWordCache from "../models/DailyWordCache.js";
import User from "../models/User.js";
import { generateAIResponse } from "../lib/ai.js";
import { log } from "../lib/logger.js";
import { VOCABULARY_SEEDS } from "../data/seedChallengesAndVocab.js";
import { fetchMerriamWebsterWOTD } from "../lib/wotdFetcher.js";

const XP_REWARD = 20;
const COINS_REWARD = 4;

// Get today's date string YYYY-MM-DD
const todayString = () => new Date().toISOString().split("T")[0];

// Pick a deterministic word index based on date
const dayIndex = () => {
  const start = new Date(new Date().getFullYear(), 0, 0);
  return Math.floor((Date.now() - start.getTime()) / 86400000);
};

// Sync XP to both stores (mirrors learning.controller.js pattern)
const updateUserXPAndCoins = async (userId, xpAmount, coinsAmount = 0) => {
  try {
    let userActivity = await UserActivity.findOne({ user: userId });
    if (!userActivity) {
      await UserActivity.create({
        user: userId,
        gamification: { level: 1, xp: xpAmount, coins: coinsAmount },
        metrics: {},
        streaks: {},
      });
    } else {
      userActivity.gamification.xp = (userActivity.gamification.xp || 0) + xpAmount;
      userActivity.gamification.coins = (userActivity.gamification.coins || 0) + coinsAmount;
      const newLevel = Math.floor(userActivity.gamification.xp / 1000) + 1;
      if (newLevel > userActivity.gamification.level) {
        userActivity.gamification.level = newLevel;
      }
      await userActivity.save();
    }
  } catch (err) {
    log.error("wordOfDay: updateUserXPAndCoins failed", { error: err.message });
  }
};

// Fallback English words when M-W RSS is unreachable
const FALLBACK_WORDS = [
  { word: "ephemeral", partOfSpeech: "adjective", definition: "Lasting for only a short time; transitory.", example: "The ephemeral beauty of cherry blossoms makes them all the more precious.", pronunciation: "ih-FEM-er-ul" },
  { word: "serendipity", partOfSpeech: "noun", definition: "The occurrence of events by chance in a happy or beneficial way.", example: "Finding that rare book was pure serendipity.", pronunciation: "ser-en-DIP-ih-tee" },
  { word: "eloquent", partOfSpeech: "adjective", definition: "Fluent or persuasive in speaking or writing.", example: "Her eloquent speech moved the entire audience.", pronunciation: "EL-oh-kwent" },
  { word: "resilient", partOfSpeech: "adjective", definition: "Able to recover quickly from difficulties; tough.", example: "Children are often more resilient than adults expect.", pronunciation: "rih-ZIL-ee-ent" },
  { word: "nuance", partOfSpeech: "noun", definition: "A subtle difference in or shade of meaning, expression, or sound.", example: "The translator struggled to capture every nuance of the original poem.", pronunciation: "NOO-ahns" },
  { word: "candid", partOfSpeech: "adjective", definition: "Truthful and straightforward; frank.", example: "I appreciate your candid feedback on my work.", pronunciation: "KAN-did" },
  { word: "tenacious", partOfSpeech: "adjective", definition: "Holding firmly to something; persistent and determined.", example: "Her tenacious spirit helped her overcome every obstacle.", pronunciation: "teh-NAY-shus" },
];

export const getEnglishWordOfDay = async (req, res) => {
  try {
    const today = todayString();

    // Return cached word for today if available
    const cached = await DailyWordCache.findOne({ date: today });
    if (cached) {
      return res.json({ success: true, word: cached });
    }

    // Try fetching from Merriam-Webster
    const fetched = await fetchMerriamWebsterWOTD();

    let wordData;
    if (fetched && fetched.word) {
      wordData = { date: today, ...fetched };
    } else {
      // Use deterministic fallback based on day of year
      const fallback = FALLBACK_WORDS[dayIndex() % FALLBACK_WORDS.length];
      wordData = { date: today, ...fallback, source: "fallback" };
    }

    const cached_doc = await DailyWordCache.create(wordData);
    return res.json({ success: true, word: cached_doc });
  } catch (err) {
    log.error("getEnglishWordOfDay error", { error: err.message });
    // Even on DB error, return something useful
    const fallback = FALLBACK_WORDS[dayIndex() % FALLBACK_WORDS.length];
    return res.json({ success: true, word: { ...fallback, date: todayString() } });
  }
};

export const getTodayWord = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = todayString();

    // Check if already completed today
    const existing = await WordOfDayCompletion.findOne({ user: userId, date: today });

    const user = await User.findById(userId);
    const language = user.learningLanguage || "spanish";

    // Fetch all active words for the language
    let words = await Vocabulary.find({ language, isActive: true }).lean();

    // Auto-seed if empty
    if (words.length === 0) {
      const seedData = VOCABULARY_SEEDS[language] || VOCABULARY_SEEDS["english"];
      if (seedData) {
        for (const word of seedData) {
          try { await Vocabulary.create({ ...word, language }); } catch (_) { /* skip duplicates */ }
        }
        words = await Vocabulary.find({ language, isActive: true }).lean();
      }
    }

    if (words.length === 0) {
      return res.status(404).json({ message: "No vocabulary found for your language" });
    }

    const word = words[dayIndex() % words.length];

    return res.json({
      word,
      alreadyCompleted: !!existing,
      completion: existing || null,
    });
  } catch (err) {
    log.error("wordOfDay getTodayWord error", { error: err.message });
    res.status(500).json({ message: "Internal server error" });
  }
};

export const submitSentence = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = todayString();
    const { userSentence, wordId } = req.body;

    if (!userSentence?.trim()) {
      return res.status(400).json({ message: "Sentence is required" });
    }

    // Once-per-day gate
    const existing = await WordOfDayCompletion.findOne({ user: userId, date: today });
    if (existing) {
      return res.status(409).json({
        message: "Already completed today",
        completion: existing,
        alreadyCompleted: true,
      });
    }

    const user = await User.findById(userId);
    const language = user.learningLanguage || "spanish";

    // Get today's word
    let words = await Vocabulary.find({ language, isActive: true }).lean();
    if (words.length === 0) {
      return res.status(404).json({ message: "No vocabulary found for your language" });
    }
    const wordDoc = wordId
      ? (await Vocabulary.findById(wordId).lean()) || words[dayIndex() % words.length]
      : words[dayIndex() % words.length];

    // AI validation
    const systemPrompt = `You are a language learning assistant validating a student's sentence.
Respond ONLY with a JSON object — no extra text, no markdown.
Schema: { "isCorrect": boolean, "score": number (0-100), "feedback": string, "correction": string }
- isCorrect: true if the word is used grammatically and meaningfully correctly
- score: 0-100 quality score
- feedback: encouraging 1-2 sentence comment
- correction: improved version of the sentence (or empty string if correct)`;

    const userMessage = `Language: ${language}
Word to use: "${wordDoc.word}" (meaning: "${wordDoc.translation}")
Student's sentence: "${userSentence.trim()}"
Validate whether the word is used correctly.`;

    let aiFeedback = { isCorrect: true, score: 75, feedback: "Good effort!", correction: "" };

    try {
      const aiRaw = await generateAIResponse({
        systemPrompt,
        userMessage,
        temperature: 0.3,
        maxTokens: 200,
      });

      const jsonMatch = aiRaw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        aiFeedback = {
          isCorrect: Boolean(parsed.isCorrect),
          score: Number(parsed.score) || 0,
          feedback: parsed.feedback || "",
          correction: parsed.correction || "",
        };
      }
    } catch (aiErr) {
      log.warn("wordOfDay AI parse failed, using default feedback", { error: aiErr.message });
    }

    // Award XP if score >= 60
    const passed = aiFeedback.isCorrect || aiFeedback.score >= 60;
    let xpAwarded = 0;
    let totalXP = 0;
    let leveledUp = false;
    let newLevel = 1;

    if (passed) {
      let progress = await LearningProgress.findOne({ user: userId });
      if (!progress) {
        progress = await LearningProgress.create({ user: userId, totalXP: 0, currentLevel: 1 });
      }
      const xpResult = progress.addXP(XP_REWARD);
      progress.updateStreak();
      await progress.save();
      await updateUserXPAndCoins(userId, XP_REWARD, COINS_REWARD);

      xpAwarded = xpResult.xpAdded || XP_REWARD;
      totalXP = xpResult.totalXP || progress.totalXP;
      leveledUp = xpResult.leveledUp || false;
      newLevel = xpResult.newLevel || progress.currentLevel;
    }

    // Save completion record
    const completion = await WordOfDayCompletion.create({
      user: userId,
      date: today,
      word: wordDoc.word,
      translation: wordDoc.translation,
      language,
      userSentence: userSentence.trim(),
      aiFeedback,
      xpAwarded,
    });

    return res.json({
      aiFeedback,
      xpAwarded,
      totalXP,
      leveledUp,
      newLevel,
      passed,
      completion,
    });
  } catch (err) {
    log.error("wordOfDay submitSentence error", { error: err.message });
    res.status(500).json({ message: "Internal server error" });
  }
};
