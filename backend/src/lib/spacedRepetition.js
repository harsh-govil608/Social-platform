/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Based on the SuperMemo SM-2 algorithm by Piotr Wozniak
 * https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 *
 * Quality ratings:
 * 0 - Complete blackout, no memory
 * 1 - Incorrect, but upon seeing the answer, remembered
 * 2 - Incorrect, but upon seeing the answer, it seemed easy
 * 3 - Correct with serious difficulty
 * 4 - Correct with some hesitation
 * 5 - Perfect response
 */

/**
 * Calculate the next review date and ease factor based on user response
 *
 * @param {number} quality - User's response quality (0-5)
 * @param {number} repetitions - Number of successful repetitions
 * @param {number} easeFactor - Current ease factor (default 2.5)
 * @param {number} interval - Current interval in days
 * @returns {Object} { interval, repetitions, easeFactor, nextReviewDate }
 */
export function calculateNextReview(quality, repetitions = 0, easeFactor = 2.5, interval = 0) {
  // Clamp quality to valid range
  quality = Math.max(0, Math.min(5, Math.round(quality)));

  let newRepetitions = repetitions;
  let newEaseFactor = easeFactor;
  let newInterval = interval;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1; // First successful review: 1 day
    } else if (repetitions === 1) {
      newInterval = 6; // Second successful review: 6 days
    } else {
      // Subsequent reviews: multiply previous interval by ease factor
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Incorrect response - reset to beginning
    newRepetitions = 0;
    newInterval = 1;
  }

  // Update ease factor using SM-2 formula
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ensure ease factor doesn't go below 1.3
  newEaseFactor = Math.max(1.3, newEaseFactor);

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  nextReviewDate.setHours(0, 0, 0, 0); // Reset to midnight

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: Math.round(newEaseFactor * 100) / 100, // Round to 2 decimal places
    nextReviewDate
  };
}

/**
 * Get the difficulty rating based on ease factor
 *
 * @param {number} easeFactor - The ease factor
 * @returns {string} Difficulty rating (easy, medium, hard)
 */
export function getDifficultyRating(easeFactor) {
  if (easeFactor >= 2.5) return 'easy';
  if (easeFactor >= 1.8) return 'medium';
  return 'hard';
}

/**
 * Calculate mastery percentage based on review history
 *
 * @param {number} repetitions - Successful repetition count
 * @param {number} easeFactor - Current ease factor
 * @returns {number} Mastery percentage (0-100)
 */
export function calculateMastery(repetitions, easeFactor) {
  // Base mastery on repetitions (max contribution: 70%)
  const repetitionScore = Math.min(repetitions / 7, 1) * 70;

  // Add ease factor bonus (max contribution: 30%)
  const easeScore = ((easeFactor - 1.3) / (3.0 - 1.3)) * 30;

  return Math.round(Math.min(100, repetitionScore + easeScore));
}

/**
 * Get review urgency for sorting
 *
 * @param {Date} nextReviewDate - Scheduled review date
 * @returns {number} Urgency score (higher = more urgent)
 */
export function getReviewUrgency(nextReviewDate) {
  const now = new Date();
  const diffMs = nextReviewDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // Overdue items have high positive urgency
  // Future items have negative urgency
  return -diffDays;
}

/**
 * Sort vocabulary items by review priority
 *
 * @param {Array} items - Array of vocabulary review items
 * @returns {Array} Sorted items (most urgent first)
 */
export function sortByReviewPriority(items) {
  return items.sort((a, b) => {
    const urgencyA = getReviewUrgency(new Date(a.nextReviewDate));
    const urgencyB = getReviewUrgency(new Date(b.nextReviewDate));
    return urgencyB - urgencyA; // Higher urgency first
  });
}

/**
 * Get quality rating description
 *
 * @param {number} quality - Quality rating (0-5)
 * @returns {string} Human-readable description
 */
export function getQualityDescription(quality) {
  const descriptions = {
    0: "Complete blackout - couldn't recall at all",
    1: "Wrong, but recognized the answer",
    2: "Wrong, but answer seemed easy to remember",
    3: "Correct, but with serious difficulty",
    4: "Correct, with some hesitation",
    5: "Perfect! Instant recall"
  };
  return descriptions[quality] || "Unknown";
}

/**
 * Estimate time to mastery based on current progress
 *
 * @param {number} repetitions - Current repetition count
 * @param {number} easeFactor - Current ease factor
 * @returns {number} Estimated days to mastery
 */
export function estimateTimeToMastery(repetitions, easeFactor) {
  const targetRepetitions = 7;
  const remainingReps = Math.max(0, targetRepetitions - repetitions);

  if (remainingReps === 0) return 0;

  // Estimate based on average interval growth
  let totalDays = 0;
  let currentInterval = repetitions === 0 ? 1 : Math.pow(easeFactor, repetitions - 1);

  for (let i = 0; i < remainingReps; i++) {
    currentInterval = Math.round(currentInterval * easeFactor);
    totalDays += currentInterval;
  }

  return totalDays;
}

export default {
  calculateNextReview,
  getDifficultyRating,
  calculateMastery,
  getReviewUrgency,
  sortByReviewPriority,
  getQualityDescription,
  estimateTimeToMastery
};
