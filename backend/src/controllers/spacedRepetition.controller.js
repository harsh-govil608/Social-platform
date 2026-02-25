import VocabularyReview from '../models/VocabularyReview.js';
import DailyVocabularySession from '../models/DailyVocabularySession.js';
import User from '../models/User.js';
import { log } from '../lib/logger.js';
import {
    calculateNextReview,
    calculateMastery,
    sortByReviewPriority
} from '../lib/spacedRepetition.js';

// Starter vocabulary sets by language
const STARTER_WORDS = {
    Spanish: [
        { word: "hola", translation: "hello", exampleSentence: "Hola, ¿cómo estás?" },
        { word: "gracias", translation: "thank you", exampleSentence: "Muchas gracias por tu ayuda." },
        { word: "por favor", translation: "please", exampleSentence: "Un café, por favor." },
        { word: "buenos días", translation: "good morning", exampleSentence: "Buenos días, señora." },
        { word: "adiós", translation: "goodbye", exampleSentence: "Adiós, hasta mañana." },
        { word: "sí", translation: "yes", exampleSentence: "Sí, me gusta mucho." },
        { word: "no", translation: "no", exampleSentence: "No, gracias." },
        { word: "agua", translation: "water", exampleSentence: "Un vaso de agua, por favor." },
        { word: "amigo", translation: "friend", exampleSentence: "Él es mi mejor amigo." },
        { word: "casa", translation: "house", exampleSentence: "Mi casa es tu casa." },
    ],
    French: [
        { word: "bonjour", translation: "hello", exampleSentence: "Bonjour, comment allez-vous?" },
        { word: "merci", translation: "thank you", exampleSentence: "Merci beaucoup!" },
        { word: "s'il vous plaît", translation: "please", exampleSentence: "Un café, s'il vous plaît." },
        { word: "au revoir", translation: "goodbye", exampleSentence: "Au revoir, à demain!" },
        { word: "oui", translation: "yes", exampleSentence: "Oui, j'aime ça." },
        { word: "non", translation: "no", exampleSentence: "Non, merci." },
        { word: "eau", translation: "water", exampleSentence: "Un verre d'eau, s'il vous plaît." },
        { word: "ami", translation: "friend", exampleSentence: "Il est mon meilleur ami." },
        { word: "maison", translation: "house", exampleSentence: "C'est ma maison." },
        { word: "bonsoir", translation: "good evening", exampleSentence: "Bonsoir, madame." },
    ],
    German: [
        { word: "hallo", translation: "hello", exampleSentence: "Hallo, wie geht es dir?" },
        { word: "danke", translation: "thank you", exampleSentence: "Vielen Danke für Ihre Hilfe." },
        { word: "bitte", translation: "please", exampleSentence: "Einen Kaffee, bitte." },
        { word: "tschüss", translation: "goodbye", exampleSentence: "Tschüss, bis morgen!" },
        { word: "ja", translation: "yes", exampleSentence: "Ja, das gefällt mir." },
        { word: "nein", translation: "no", exampleSentence: "Nein, danke." },
        { word: "Wasser", translation: "water", exampleSentence: "Ein Glas Wasser, bitte." },
        { word: "Freund", translation: "friend", exampleSentence: "Er ist mein bester Freund." },
        { word: "Haus", translation: "house", exampleSentence: "Das ist mein Haus." },
        { word: "guten Morgen", translation: "good morning", exampleSentence: "Guten Morgen!" },
    ],
    Japanese: [
        { word: "こんにちは", translation: "hello", pronunciation: "konnichiwa", exampleSentence: "こんにちは、お元気ですか?" },
        { word: "ありがとう", translation: "thank you", pronunciation: "arigatou", exampleSentence: "ありがとうございます。" },
        { word: "お願いします", translation: "please", pronunciation: "onegaishimasu", exampleSentence: "コーヒーをお願いします。" },
        { word: "さようなら", translation: "goodbye", pronunciation: "sayounara", exampleSentence: "さようなら、また明日。" },
        { word: "はい", translation: "yes", pronunciation: "hai", exampleSentence: "はい、好きです。" },
        { word: "いいえ", translation: "no", pronunciation: "iie", exampleSentence: "いいえ、結構です。" },
        { word: "水", translation: "water", pronunciation: "mizu", exampleSentence: "水をください。" },
        { word: "友達", translation: "friend", pronunciation: "tomodachi", exampleSentence: "彼は私の友達です。" },
        { word: "家", translation: "house", pronunciation: "ie", exampleSentence: "これは私の家です。" },
        { word: "おはよう", translation: "good morning", pronunciation: "ohayou", exampleSentence: "おはようございます。" },
    ],
    Korean: [
        { word: "안녕하세요", translation: "hello", pronunciation: "annyeonghaseyo", exampleSentence: "안녕하세요, 잘 지내세요?" },
        { word: "감사합니다", translation: "thank you", pronunciation: "gamsahamnida", exampleSentence: "정말 감사합니다." },
        { word: "네", translation: "yes", pronunciation: "ne", exampleSentence: "네, 좋아요." },
        { word: "아니요", translation: "no", pronunciation: "aniyo", exampleSentence: "아니요, 괜찮습니다." },
        { word: "물", translation: "water", pronunciation: "mul", exampleSentence: "물 주세요." },
        { word: "친구", translation: "friend", pronunciation: "chingu", exampleSentence: "그는 내 친구입니다." },
        { word: "집", translation: "house", pronunciation: "jip", exampleSentence: "이것은 내 집입니다." },
        { word: "안녕히 가세요", translation: "goodbye", pronunciation: "annyeonghi gaseyo", exampleSentence: "안녕히 가세요!" },
        { word: "사랑", translation: "love", pronunciation: "sarang", exampleSentence: "사랑합니다." },
        { word: "좋은 아침", translation: "good morning", pronunciation: "joeun achim", exampleSentence: "좋은 아침이에요!" },
    ],
};

// Default starter words for any language not listed above
const DEFAULT_STARTER = [
    { word: "hello", translation: "hello (in your language)" },
    { word: "thank you", translation: "thank you (in your language)" },
    { word: "please", translation: "please (in your language)" },
    { word: "goodbye", translation: "goodbye (in your language)" },
    { word: "yes", translation: "yes (in your language)" },
    { word: "no", translation: "no (in your language)" },
    { word: "water", translation: "water (in your language)" },
    { word: "friend", translation: "friend (in your language)" },
    { word: "house", translation: "house (in your language)" },
    { word: "good morning", translation: "good morning (in your language)" },
];

/**
 * Get vocabulary words due for review
 */
export async function getDueReviews(req, res) {
    try {
        const userId = req.user._id;
        const { limit = 20, category, language } = req.query;

        const query = {
            userId,
            isActive: true,
            nextReviewDate: { $lte: new Date() }
        };

        if (category) query.category = category;
        if (language) query.targetLanguage = language;

        const dueReviews = await VocabularyReview.find(query)
            .sort({ nextReviewDate: 1 })
            .limit(parseInt(limit));

        // Sort by priority (most urgent first)
        const sortedReviews = sortByReviewPriority(dueReviews);

        res.status(200).json({
            success: true,
            count: sortedReviews.length,
            reviews: sortedReviews
        });
    } catch (error) {
        log.error('Error in getDueReviews:', error);
        res.status(500).json({ message: 'Failed to get due reviews' });
    }
}

/**
 * Submit a review for a vocabulary word
 */
export async function submitReview(req, res) {
    try {
        const userId = req.user._id;
        const { wordId } = req.params;
        const { quality } = req.body; // 0-5 rating

        if (quality === undefined || quality < 0 || quality > 5) {
            return res.status(400).json({
                message: 'Quality rating must be between 0 and 5'
            });
        }

        const review = await VocabularyReview.findOne({
            _id: wordId,
            userId,
            isActive: true
        });

        if (!review) {
            return res.status(404).json({ message: 'Vocabulary word not found' });
        }

        // Calculate next review using SM-2 algorithm
        const result = calculateNextReview(
            quality,
            review.repetitions,
            review.easeFactor,
            review.interval
        );

        // Update review record
        review.easeFactor = result.easeFactor;
        review.interval = result.interval;
        review.repetitions = result.repetitions;
        review.nextReviewDate = result.nextReviewDate;
        review.lastReviewDate = new Date();
        review.totalReviews += 1;
        if (quality >= 3) {
            review.correctReviews += 1;
        }

        // Check if word is mastered (7+ successful repetitions with high ease factor)
        if (review.repetitions >= 7 && review.easeFactor >= 2.0) {
            review.isMastered = true;
        }

        await review.save();

        res.status(200).json({
            success: true,
            message: quality >= 3 ? 'Correct!' : 'Keep practicing!',
            review: {
                ...review.toObject(),
                masteryPercentage: calculateMastery(review.repetitions, review.easeFactor)
            },
            nextReview: {
                interval: result.interval,
                nextReviewDate: result.nextReviewDate
            }
        });
    } catch (error) {
        log.error('Error in submitReview:', error);
        res.status(500).json({ message: 'Failed to submit review' });
    }
}

/**
 * Add a new vocabulary word
 */
export async function addWord(req, res) {
    try {
        const userId = req.user._id;
        const {
            word,
            translation,
            pronunciation,
            exampleSentence,
            exampleTranslation,
            notes,
            sourceLanguage,
            targetLanguage,
            category,
            tags,
            source,
            sourceId
        } = req.body;

        if (!word || !translation || !sourceLanguage || !targetLanguage) {
            return res.status(400).json({
                message: 'Word, translation, sourceLanguage, and targetLanguage are required'
            });
        }

        // Check for duplicate
        const existing = await VocabularyReview.findOne({
            userId,
            word: word.toLowerCase().trim(),
            sourceLanguage,
            targetLanguage
        });

        if (existing) {
            return res.status(400).json({
                message: 'This word is already in your vocabulary list'
            });
        }

        const newWord = await VocabularyReview.create({
            userId,
            word: word.toLowerCase().trim(),
            translation,
            pronunciation,
            exampleSentence,
            exampleTranslation,
            notes,
            sourceLanguage,
            targetLanguage,
            category: category || 'general',
            tags: tags || [],
            source: source || 'user',
            sourceId,
            nextReviewDate: new Date() // Review immediately available
        });

        res.status(201).json({
            success: true,
            message: 'Word added to vocabulary',
            word: newWord
        });
    } catch (error) {
        log.error('Error in addWord:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'This word is already in your vocabulary list' });
        }
        res.status(500).json({ message: 'Failed to add word' });
    }
}

/**
 * Bulk add vocabulary words
 */
export async function addWordsBulk(req, res) {
    try {
        const userId = req.user._id;
        const { words, sourceLanguage, targetLanguage, category, source, sourceId } = req.body;

        if (!words || !Array.isArray(words) || words.length === 0) {
            return res.status(400).json({ message: 'Words array is required' });
        }

        if (!sourceLanguage || !targetLanguage) {
            return res.status(400).json({ message: 'sourceLanguage and targetLanguage are required' });
        }

        const results = {
            added: 0,
            skipped: 0,
            errors: []
        };

        for (const wordData of words) {
            try {
                const { word, translation, pronunciation, exampleSentence } = wordData;

                if (!word || !translation) {
                    results.skipped++;
                    continue;
                }

                const existing = await VocabularyReview.findOne({
                    userId,
                    word: word.toLowerCase().trim(),
                    sourceLanguage,
                    targetLanguage
                });

                if (existing) {
                    results.skipped++;
                    continue;
                }

                await VocabularyReview.create({
                    userId,
                    word: word.toLowerCase().trim(),
                    translation,
                    pronunciation,
                    exampleSentence,
                    sourceLanguage,
                    targetLanguage,
                    category: category || 'general',
                    source: source || 'import',
                    sourceId,
                    nextReviewDate: new Date()
                });

                results.added++;
            } catch (err) {
                results.errors.push({ word: wordData.word, error: err.message });
            }
        }

        res.status(201).json({
            success: true,
            message: `Added ${results.added} words, skipped ${results.skipped} duplicates`,
            results
        });
    } catch (error) {
        log.error('Error in addWordsBulk:', error);
        res.status(500).json({ message: 'Failed to add words' });
    }
}

/**
 * Update a vocabulary word
 */
export async function updateWord(req, res) {
    try {
        const userId = req.user._id;
        const { wordId } = req.params;
        const updates = req.body;

        // Fields that can be updated
        const allowedUpdates = [
            'translation', 'pronunciation', 'exampleSentence',
            'exampleTranslation', 'notes', 'category', 'tags', 'isActive'
        ];

        const filteredUpdates = {};
        for (const key of allowedUpdates) {
            if (updates[key] !== undefined) {
                filteredUpdates[key] = updates[key];
            }
        }

        const word = await VocabularyReview.findOneAndUpdate(
            { _id: wordId, userId },
            filteredUpdates,
            { new: true }
        );

        if (!word) {
            return res.status(404).json({ message: 'Word not found' });
        }

        res.status(200).json({
            success: true,
            word
        });
    } catch (error) {
        log.error('Error in updateWord:', error);
        res.status(500).json({ message: 'Failed to update word' });
    }
}

/**
 * Delete a vocabulary word
 */
export async function deleteWord(req, res) {
    try {
        const userId = req.user._id;
        const { wordId } = req.params;

        const word = await VocabularyReview.findOneAndDelete({
            _id: wordId,
            userId
        });

        if (!word) {
            return res.status(404).json({ message: 'Word not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Word deleted successfully'
        });
    } catch (error) {
        log.error('Error in deleteWord:', error);
        res.status(500).json({ message: 'Failed to delete word' });
    }
}

/**
 * Get all vocabulary words for user
 */
export async function getVocabulary(req, res) {
    try {
        const userId = req.user._id;
        const {
            page = 1,
            limit = 50,
            category,
            language,
            search,
            sortBy = 'createdAt',
            order = 'desc',
            mastered
        } = req.query;

        const query = { userId, isActive: true };

        if (category) query.category = category;
        if (language) query.targetLanguage = language;
        if (mastered !== undefined) query.isMastered = mastered === 'true';
        if (search) {
            query.$or = [
                { word: { $regex: search, $options: 'i' } },
                { translation: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = order === 'asc' ? 1 : -1;

        const [words, total] = await Promise.all([
            VocabularyReview.find(query)
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(parseInt(limit)),
            VocabularyReview.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            words,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        log.error('Error in getVocabulary:', error);
        res.status(500).json({ message: 'Failed to get vocabulary' });
    }
}

/**
 * Get vocabulary statistics
 */
export async function getStats(req, res) {
    try {
        const userId = req.user._id;

        const stats = await VocabularyReview.getUserStats(userId);

        // Get category breakdown
        const categoryStats = await VocabularyReview.aggregate([
            { $match: { userId: userId, isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    mastered: {
                        $sum: { $cond: [{ $eq: ['$isMastered', true] }, 1, 0] }
                    }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get daily review counts for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const reviewHistory = await VocabularyReview.aggregate([
            {
                $match: {
                    userId: userId,
                    lastReviewDate: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$lastReviewDate' }
                    },
                    reviews: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                ...stats,
                categories: categoryStats,
                reviewHistory
            }
        });
    } catch (error) {
        log.error('Error in getStats:', error);
        res.status(500).json({ message: 'Failed to get statistics' });
    }
}

/**
 * Get upcoming reviews forecast
 */
export async function getReviewForecast(req, res) {
    try {
        const userId = req.user._id;
        const { days = 7 } = req.query;

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + parseInt(days));

        const forecast = await VocabularyReview.aggregate([
            {
                $match: {
                    userId: userId,
                    isActive: true,
                    nextReviewDate: { $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$nextReviewDate' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            forecast
        });
    } catch (error) {
        log.error('Error in getReviewForecast:', error);
        res.status(500).json({ message: 'Failed to get review forecast' });
    }
}

/**
 * Reset a word's progress (start over)
 */
export async function resetWord(req, res) {
    try {
        const userId = req.user._id;
        const { wordId } = req.params;

        const word = await VocabularyReview.findOneAndUpdate(
            { _id: wordId, userId },
            {
                easeFactor: 2.5,
                interval: 0,
                repetitions: 0,
                nextReviewDate: new Date(),
                isMastered: false
            },
            { new: true }
        );

        if (!word) {
            return res.status(404).json({ message: 'Word not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Word progress reset',
            word
        });
    } catch (error) {
        log.error('Error in resetWord:', error);
        res.status(500).json({ message: 'Failed to reset word' });
    }
}

/**
 * Get today's vocabulary session status
 */
export async function getTodaySession(req, res) {
    try {
        const userId = req.user._id;

        const session = await DailyVocabularySession.getTodaySession(userId);
        const remaining = session.getRemainingCapacity();
        const completionPercentage = session.getCompletionPercentage();

        // Get due reviews count
        const dueReviewsCount = await VocabularyReview.countDocuments({
            userId,
            isActive: true,
            nextReviewDate: { $lte: new Date() }
        });

        const isDoneForToday = session.hasReachedLimit() || dueReviewsCount === 0;

        res.status(200).json({
            success: true,
            session: {
                date: session.date,
                reviewsCompleted: session.reviewsCompleted,
                maxReviews: session.maxReviews,
                newWordsLearned: session.newWordsLearned,
                maxNewWords: session.maxNewWords,
                remaining,
                completionPercentage,
                isDoneForToday,
                dueReviewsCount: Math.min(dueReviewsCount, remaining.reviews),
                totalTimeSpent: session.totalTimeSpent,
                correctReviews: session.correctReviews,
                accuracy: session.reviewsCompleted > 0
                    ? Math.round((session.correctReviews / session.reviewsCompleted) * 100)
                    : 0
            }
        });
    } catch (error) {
        log.error('Error in getTodaySession:', error);
        res.status(500).json({ message: 'Failed to get today session' });
    }
}

/**
 * Submit a review with daily limit tracking
 */
export async function submitReviewWithLimit(req, res) {
    try {
        const userId = req.user._id;
        const { wordId } = req.params;
        const { quality } = req.body;

        // Get today's session
        const session = await DailyVocabularySession.getTodaySession(userId);

        // Check if daily limit reached
        if (!session.canDoReviews()) {
            return res.status(429).json({
                success: false,
                message: 'Daily review limit reached! Come back tomorrow.',
                isDoneForToday: true,
                session: {
                    reviewsCompleted: session.reviewsCompleted,
                    maxReviews: session.maxReviews
                }
            });
        }

        if (quality === undefined || quality < 0 || quality > 5) {
            return res.status(400).json({
                message: 'Quality rating must be between 0 and 5'
            });
        }

        const review = await VocabularyReview.findOne({
            _id: wordId,
            userId,
            isActive: true
        });

        if (!review) {
            return res.status(404).json({ message: 'Vocabulary word not found' });
        }

        // Check if already reviewed today
        const alreadyReviewed = session.reviewedWords.some(
            rw => rw.wordId.toString() === wordId
        );

        if (alreadyReviewed) {
            return res.status(400).json({
                message: 'Word already reviewed today'
            });
        }

        // Calculate next review using SM-2 algorithm
        const result = calculateNextReview(
            quality,
            review.repetitions,
            review.easeFactor,
            review.interval
        );

        // Update review record
        review.easeFactor = result.easeFactor;
        review.interval = result.interval;
        review.repetitions = result.repetitions;
        review.nextReviewDate = result.nextReviewDate;
        review.lastReviewDate = new Date();
        review.totalReviews += 1;
        if (quality >= 3) {
            review.correctReviews += 1;
        }

        // Check if word is mastered
        if (review.repetitions >= 7 && review.easeFactor >= 2.0) {
            review.isMastered = true;
        }

        await review.save();

        // Update session
        session.reviewsCompleted += 1;
        if (quality >= 3) {
            session.correctReviews += 1;
        }
        session.reviewedWords.push({
            wordId: review._id,
            quality,
            timestamp: new Date()
        });

        // Check if session is complete
        if (session.hasReachedLimit()) {
            session.isComplete = true;
            session.sessionEnded = new Date();
        }

        await session.save();

        const remaining = session.getRemainingCapacity();
        const isDoneForToday = session.hasReachedLimit();

        res.status(200).json({
            success: true,
            message: quality >= 3 ? 'Correct! 🎉' : 'Keep practicing! 💪',
            review: {
                ...review.toObject(),
                masteryPercentage: calculateMastery(review.repetitions, review.easeFactor)
            },
            nextReview: {
                interval: result.interval,
                nextReviewDate: result.nextReviewDate
            },
            session: {
                reviewsCompleted: session.reviewsCompleted,
                maxReviews: session.maxReviews,
                remaining,
                isDoneForToday,
                completionPercentage: session.getCompletionPercentage()
            }
        });
    } catch (error) {
        log.error('Error in submitReviewWithLimit:', error);
        res.status(500).json({ message: 'Failed to submit review' });
    }
}

/**
 * Get vocabulary words due for review with daily limit
 */
export async function getDueReviewsWithLimit(req, res) {
    try {
        const userId = req.user._id;
        const { category, language } = req.query;

        // Get today's session
        const session = await DailyVocabularySession.getTodaySession(userId);
        const remaining = session.getRemainingCapacity();

        if (!session.canDoReviews()) {
            return res.status(200).json({
                success: true,
                count: 0,
                reviews: [],
                isDoneForToday: true,
                message: '🎉 Great job! You\'ve completed today\'s vocabulary practice!',
                session: {
                    reviewsCompleted: session.reviewsCompleted,
                    maxReviews: session.maxReviews,
                    accuracy: session.reviewsCompleted > 0
                        ? Math.round((session.correctReviews / session.reviewsCompleted) * 100)
                        : 0
                }
            });
        }

        const query = {
            userId,
            isActive: true,
            nextReviewDate: { $lte: new Date() },
            _id: { $nin: session.reviewedWords.map(rw => rw.wordId) }
        };

        if (category) query.category = category;
        if (language) query.targetLanguage = language;

        const dueReviews = await VocabularyReview.find(query)
            .sort({ nextReviewDate: 1 })
            .limit(remaining.reviews);

        const sortedReviews = sortByReviewPriority(dueReviews);

        res.status(200).json({
            success: true,
            count: sortedReviews.length,
            reviews: sortedReviews,
            isDoneForToday: sortedReviews.length === 0 && session.reviewsCompleted > 0,
            session: {
                reviewsCompleted: session.reviewsCompleted,
                maxReviews: session.maxReviews,
                remaining,
                completionPercentage: session.getCompletionPercentage()
            }
        });
    } catch (error) {
        log.error('Error in getDueReviewsWithLimit:', error);
        res.status(500).json({ message: 'Failed to get due reviews' });
    }
}

/**
 * Get weekly vocabulary stats
 */
export async function getWeeklyStats(req, res) {
    try {
        const userId = req.user._id;

        const weeklyData = await DailyVocabularySession.getWeeklyStats(userId);
        const streak = await DailyVocabularySession.getUserStreak(userId);

        res.status(200).json({
            success: true,
            weeklyData,
            streak
        });
    } catch (error) {
        log.error('Error in getWeeklyStats:', error);
        res.status(500).json({ message: 'Failed to get weekly stats' });
    }
}

/**
 * Seed starter vocabulary words for a new user
 */
export async function seedStarterWords(req, res) {
    try {
        const userId = req.user._id;

        // Check if user already has words
        const existingCount = await VocabularyReview.countDocuments({ userId, isActive: true });
        if (existingCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'You already have vocabulary words. No need to seed.',
                existingCount,
            });
        }

        // Get user's learning language
        const user = await User.findById(userId).select('learningLanguage nativeLanguage');
        const targetLanguage = user?.learningLanguage || 'Spanish';
        const sourceLanguage = user?.nativeLanguage || 'English';

        const starterWords = STARTER_WORDS[targetLanguage] || DEFAULT_STARTER;

        let added = 0;
        for (const wordData of starterWords) {
            await VocabularyReview.create({
                userId,
                word: wordData.word,
                translation: wordData.translation,
                pronunciation: wordData.pronunciation || '',
                exampleSentence: wordData.exampleSentence || '',
                sourceLanguage,
                targetLanguage,
                category: 'basics',
                source: 'starter',
                nextReviewDate: new Date(),
            });
            added++;
        }

        res.status(201).json({
            success: true,
            message: `Added ${added} starter words for ${targetLanguage}`,
            added,
        });
    } catch (error) {
        log.error('Error in seedStarterWords:', error);
        res.status(500).json({ message: 'Failed to seed starter words' });
    }
}
