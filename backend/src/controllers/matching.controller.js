import User from '../models/User.js';
import { findBestMatches, getMatchQuality } from '../lib/matchingAlgorithm.js';

/**
 * Get partner matches for the authenticated user
 */
export async function getPartnerMatches(req, res) {
    try {
        const userId = req.user._id;
        const { limit = 20, offset = 0 } = req.query;

        // Get current user with matching preferences
        const user = await User.findById(userId).select(
            'nativeLanguage learningLanguage languageProficiency interests timezone availability learningGoals partnerPreferences blockedUsers friends'
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.nativeLanguage || !user.learningLanguage) {
            return res.status(400).json({
                message: 'Please complete your language profile first',
                missingFields: ['nativeLanguage', 'learningLanguage'].filter(
                    f => !user[f]
                )
            });
        }

        // Build query for potential matches
        const excludeIds = [
            userId,
            ...(user.blockedUsers || []),
            ...(user.friends || [])
        ];

        const candidates = await User.find({
            _id: { $nin: excludeIds },
            isOnboarded: true,
            isActive: true,
            // At least one matching language
            $or: [
                { nativeLanguage: user.learningLanguage },
                { learningLanguage: user.nativeLanguage },
                { learningLanguage: user.learningLanguage }
            ]
        })
        .select('fullName profilePic nativeLanguage learningLanguage languageProficiency location timezone bio interests isOnline availability learningGoals')
        .limit(100); // Get more than needed to filter

        // Calculate scores and find best matches
        const matches = findBestMatches(user, candidates, parseInt(limit));

        // Add quality labels
        const enrichedMatches = matches.map(match => ({
            ...match,
            quality: getMatchQuality(match.score)
        }));

        res.status(200).json({
            success: true,
            matches: enrichedMatches.slice(parseInt(offset)),
            total: enrichedMatches.length
        });
    } catch (error) {
        console.error('Error in getPartnerMatches:', error);
        res.status(500).json({ message: 'Failed to find partner matches' });
    }
}

/**
 * Update user's matching preferences
 */
export async function updateMatchingPreferences(req, res) {
    try {
        const userId = req.user._id;
        const {
            timezone,
            learningGoals,
            availability,
            languageProficiency,
            partnerPreferences
        } = req.body;

        const updates = {};

        if (timezone !== undefined) updates.timezone = timezone;
        if (learningGoals !== undefined) updates.learningGoals = learningGoals;
        if (availability !== undefined) updates.availability = availability;
        if (languageProficiency !== undefined) updates.languageProficiency = languageProficiency;
        if (partnerPreferences !== undefined) updates.partnerPreferences = partnerPreferences;

        const user = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Matching preferences updated',
            user: {
                timezone: user.timezone,
                learningGoals: user.learningGoals,
                availability: user.availability,
                languageProficiency: user.languageProficiency,
                partnerPreferences: user.partnerPreferences
            }
        });
    } catch (error) {
        console.error('Error in updateMatchingPreferences:', error);
        res.status(500).json({ message: 'Failed to update preferences' });
    }
}

/**
 * Get user's current matching preferences
 */
export async function getMatchingPreferences(req, res) {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select(
            'nativeLanguage learningLanguage timezone learningGoals availability languageProficiency partnerPreferences interests'
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            preferences: {
                nativeLanguage: user.nativeLanguage,
                learningLanguage: user.learningLanguage,
                timezone: user.timezone,
                learningGoals: user.learningGoals,
                availability: user.availability,
                languageProficiency: user.languageProficiency,
                partnerPreferences: user.partnerPreferences,
                interests: user.interests
            }
        });
    } catch (error) {
        console.error('Error in getMatchingPreferences:', error);
        res.status(500).json({ message: 'Failed to get preferences' });
    }
}

/**
 * Get detailed profile of a potential partner
 */
export async function getPartnerProfile(req, res) {
    try {
        const { partnerId } = req.params;
        const userId = req.user._id;

        const partner = await User.findById(partnerId).select(
            'fullName profilePic nativeLanguage learningLanguage languageProficiency location timezone bio interests isOnline lastSeen availability learningGoals'
        );

        if (!partner) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get current user for compatibility calculation
        const user = await User.findById(userId).select(
            'nativeLanguage learningLanguage languageProficiency interests timezone availability learningGoals'
        );

        // Calculate compatibility score
        const { findBestMatches: _, calculateCompatibilityScore } = await import('../lib/matchingAlgorithm.js');
        const compatibility = calculateCompatibilityScore(user, partner);

        res.status(200).json({
            success: true,
            partner: {
                _id: partner._id,
                fullName: partner.fullName,
                profilePic: partner.profilePic,
                nativeLanguage: partner.nativeLanguage,
                learningLanguage: partner.learningLanguage,
                languageProficiency: partner.languageProficiency,
                location: partner.location,
                timezone: partner.timezone,
                bio: partner.bio,
                interests: partner.interests,
                isOnline: partner.isOnline,
                lastSeen: partner.lastSeen,
                availability: partner.availability,
                learningGoals: partner.learningGoals
            },
            compatibility: {
                score: compatibility.score,
                breakdown: compatibility.breakdown,
                quality: getMatchQuality(compatibility.score)
            }
        });
    } catch (error) {
        console.error('Error in getPartnerProfile:', error);
        res.status(500).json({ message: 'Failed to get partner profile' });
    }
}

/**
 * Search for specific language partners
 */
export async function searchPartners(req, res) {
    try {
        const userId = req.user._id;
        const {
            nativeLanguage,
            learningLanguage,
            proficiency,
            timezone,
            limit = 20
        } = req.query;

        // Get user's blocked list
        const user = await User.findById(userId).select('blockedUsers friends');

        const excludeIds = [
            userId,
            ...(user?.blockedUsers || []),
            ...(user?.friends || [])
        ];

        const query = {
            _id: { $nin: excludeIds },
            isOnboarded: true,
            isActive: true
        };

        if (nativeLanguage) query.nativeLanguage = { $regex: nativeLanguage, $options: 'i' };
        if (learningLanguage) query.learningLanguage = { $regex: learningLanguage, $options: 'i' };
        if (proficiency) query.languageProficiency = proficiency;
        if (timezone) query.timezone = { $regex: timezone, $options: 'i' };

        const partners = await User.find(query)
            .select('fullName profilePic nativeLanguage learningLanguage languageProficiency location timezone bio interests isOnline')
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            partners,
            count: partners.length
        });
    } catch (error) {
        console.error('Error in searchPartners:', error);
        res.status(500).json({ message: 'Failed to search partners' });
    }
}
