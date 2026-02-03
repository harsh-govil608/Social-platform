import VocabularyReview from '../models/VocabularyReview.js';
import {
    calculateNextReview,
    calculateMastery,
    sortByReviewPriority
} from '../lib/spacedRepetition.js';

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
        console.error('Error in getDueReviews:', error);
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
        console.error('Error in submitReview:', error);
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
        console.error('Error in addWord:', error);
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
        console.error('Error in addWordsBulk:', error);
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
        console.error('Error in updateWord:', error);
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
        console.error('Error in deleteWord:', error);
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
        console.error('Error in getVocabulary:', error);
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
        console.error('Error in getStats:', error);
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
        console.error('Error in getReviewForecast:', error);
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
        console.error('Error in resetWord:', error);
        res.status(500).json({ message: 'Failed to reset word' });
    }
}
