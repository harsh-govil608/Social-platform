/**
 * Language Partner Matching Algorithm
 *
 * Calculates compatibility scores between users based on:
 * - Language exchange potential (native ↔ learning)
 * - Proficiency levels
 * - Interests overlap
 * - Timezone compatibility
 * - Availability overlap
 * - Learning goals alignment
 */

/**
 * Calculate overall compatibility score between two users
 *
 * @param {Object} user - The user looking for partners
 * @param {Object} candidate - A potential partner
 * @returns {Object} { score, breakdown }
 */
export function calculateCompatibilityScore(user, candidate) {
    const breakdown = {
        languageExchange: 0,
        proficiencyMatch: 0,
        interestsOverlap: 0,
        timezoneCompatibility: 0,
        availabilityOverlap: 0,
        goalsAlignment: 0
    };

    // Language exchange potential (max 30 points)
    // Best: User's native is candidate's learning AND vice versa
    breakdown.languageExchange = calculateLanguageExchangeScore(user, candidate);

    // Proficiency match (max 15 points)
    // Similar proficiency levels work well together
    breakdown.proficiencyMatch = calculateProficiencyScore(user, candidate);

    // Interests overlap (max 20 points)
    breakdown.interestsOverlap = calculateInterestsScore(user.interests, candidate.interests);

    // Timezone compatibility (max 15 points)
    breakdown.timezoneCompatibility = calculateTimezoneScore(user.timezone, candidate.timezone);

    // Availability overlap (max 10 points)
    breakdown.availabilityOverlap = calculateAvailabilityScore(user.availability, candidate.availability);

    // Learning goals alignment (max 10 points)
    breakdown.goalsAlignment = calculateGoalsScore(user.learningGoals, candidate.learningGoals);

    // Calculate total score (max 100)
    const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);

    return {
        score: Math.round(totalScore),
        breakdown,
        candidate: {
            _id: candidate._id,
            fullName: candidate.fullName,
            profilePic: candidate.profilePic,
            nativeLanguage: candidate.nativeLanguage,
            learningLanguage: candidate.learningLanguage,
            languageProficiency: candidate.languageProficiency,
            location: candidate.location,
            timezone: candidate.timezone,
            bio: candidate.bio,
            interests: candidate.interests,
            isOnline: candidate.isOnline
        }
    };
}

/**
 * Calculate language exchange score
 * Perfect match: User teaches what candidate wants to learn AND learns what candidate can teach
 */
function calculateLanguageExchangeScore(user, candidate) {
    let score = 0;

    // Check if languages are compatible for exchange
    const userTeaches = user.nativeLanguage?.toLowerCase();
    const userLearns = user.learningLanguage?.toLowerCase();
    const candidateTeaches = candidate.nativeLanguage?.toLowerCase();
    const candidateLearns = candidate.learningLanguage?.toLowerCase();

    // Perfect exchange: both can teach each other
    if (userTeaches === candidateLearns && userLearns === candidateTeaches) {
        score = 30; // Maximum score
    }
    // One-way match: user can help candidate OR candidate can help user
    else if (userTeaches === candidateLearns || userLearns === candidateTeaches) {
        score = 15;
    }
    // Same learning language: can practice together
    else if (userLearns === candidateLearns) {
        score = 10;
    }

    return score;
}

/**
 * Calculate proficiency match score
 * Slightly different levels work well (teacher-student dynamic)
 */
function calculateProficiencyScore(user, candidate) {
    const levels = ['beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'native'];

    const userLevel = levels.indexOf(user.languageProficiency || 'beginner');
    const candidateLevel = levels.indexOf(candidate.languageProficiency || 'beginner');

    const levelDiff = Math.abs(userLevel - candidateLevel);

    // Same level or 1 level apart is ideal
    if (levelDiff <= 1) return 15;
    if (levelDiff === 2) return 10;
    if (levelDiff === 3) return 5;
    return 2; // Still some value even with big differences
}

/**
 * Calculate interests overlap score
 */
function calculateInterestsScore(userInterests = [], candidateInterests = []) {
    if (!userInterests.length || !candidateInterests.length) return 5; // Base score

    const userSet = new Set(userInterests.map(i => i.toLowerCase()));
    const candidateSet = new Set(candidateInterests.map(i => i.toLowerCase()));

    let overlap = 0;
    for (const interest of userSet) {
        if (candidateSet.has(interest)) overlap++;
    }

    const overlapRatio = overlap / Math.max(userSet.size, candidateSet.size);

    // Scale to max 20 points
    return Math.round(overlapRatio * 20);
}

/**
 * Calculate timezone compatibility score
 * Closer timezones = easier to schedule sessions
 */
function calculateTimezoneScore(userTz, candidateTz) {
    if (!userTz || !candidateTz) return 7; // Default middle score

    // Try to parse timezone offsets
    const userOffset = parseTimezoneOffset(userTz);
    const candidateOffset = parseTimezoneOffset(candidateTz);

    if (userOffset === null || candidateOffset === null) return 7;

    const hourDiff = Math.abs(userOffset - candidateOffset);

    // Within 3 hours: excellent
    if (hourDiff <= 3) return 15;
    // Within 6 hours: good
    if (hourDiff <= 6) return 10;
    // Within 9 hours: manageable
    if (hourDiff <= 9) return 5;
    // More than 9 hours: difficult but possible
    return 2;
}

/**
 * Parse timezone string to get offset in hours
 */
function parseTimezoneOffset(tz) {
    if (!tz) return null;

    // Handle formats like "UTC+5", "GMT-8", "EST", etc.
    const match = tz.match(/([+-]?)(\d+)/);
    if (match) {
        const sign = match[1] === '-' ? -1 : 1;
        return sign * parseInt(match[2], 10);
    }

    // Common timezone abbreviations
    const tzOffsets = {
        'UTC': 0, 'GMT': 0,
        'EST': -5, 'EDT': -4,
        'CST': -6, 'CDT': -5,
        'MST': -7, 'MDT': -6,
        'PST': -8, 'PDT': -7,
        'CET': 1, 'CEST': 2,
        'JST': 9, 'KST': 9,
        'IST': 5.5, 'AEST': 10
    };

    const upperTz = tz.toUpperCase().trim();
    if (tzOffsets[upperTz] !== undefined) {
        return tzOffsets[upperTz];
    }

    return null;
}

/**
 * Calculate availability overlap score
 */
function calculateAvailabilityScore(userAvailability = [], candidateAvailability = []) {
    if (!userAvailability.length || !candidateAvailability.length) return 3;

    let overlapHours = 0;

    for (const userSlot of userAvailability) {
        for (const candidateSlot of candidateAvailability) {
            if (userSlot.day === candidateSlot.day) {
                // Calculate overlap hours
                const start = Math.max(userSlot.startHour || 0, candidateSlot.startHour || 0);
                const end = Math.min(userSlot.endHour || 24, candidateSlot.endHour || 24);
                if (end > start) {
                    overlapHours += (end - start);
                }
            }
        }
    }

    // Scale: 10+ overlapping hours = max score
    return Math.min(10, overlapHours);
}

/**
 * Calculate learning goals alignment score
 */
function calculateGoalsScore(userGoals = [], candidateGoals = []) {
    if (!userGoals.length || !candidateGoals.length) return 3;

    const userSet = new Set(userGoals.map(g => g.toLowerCase()));
    const candidateSet = new Set(candidateGoals.map(g => g.toLowerCase()));

    let overlap = 0;
    for (const goal of userSet) {
        if (candidateSet.has(goal)) overlap++;
    }

    const overlapRatio = overlap / Math.max(userSet.size, candidateSet.size);

    return Math.round(overlapRatio * 10);
}

/**
 * Find best matches for a user
 *
 * @param {Object} user - The user looking for partners
 * @param {Array} candidates - Array of potential partners
 * @param {number} limit - Max number of results
 * @returns {Array} Sorted array of matches with scores
 */
export function findBestMatches(user, candidates, limit = 20) {
    const matches = candidates
        .filter(c => c._id.toString() !== user._id.toString()) // Exclude self
        .map(candidate => calculateCompatibilityScore(user, candidate))
        .filter(match => match.score >= 5) // Minimum threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return matches;
}

/**
 * Get match quality label
 */
export function getMatchQuality(score) {
    if (score >= 80) return { label: 'Excellent', color: 'success' };
    if (score >= 60) return { label: 'Great', color: 'info' };
    if (score >= 40) return { label: 'Good', color: 'warning' };
    return { label: 'Fair', color: 'neutral' };
}

export default {
    calculateCompatibilityScore,
    findBestMatches,
    getMatchQuality
};
