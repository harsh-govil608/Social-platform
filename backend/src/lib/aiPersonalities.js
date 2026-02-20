/**
 * AI Tutor - Single Supportive Coach
 *
 * Simplified to one supportive coaching style focused on:
 * - Correcting mistakes gently
 * - Suggesting better phrasing
 * - Adapting difficulty based on user level
 * - Directly tied to daily task practice
 */

export const SUPPORTIVE_COACH = {
    name: 'AI Coach',
    avatar: '🎯',
    description: 'Your supportive language coach that helps you improve through gentle corrections and adaptive practice.',
    traits: ['Encouraging', 'Patient', 'Adaptive', 'Focused'],
    systemPrompt: `You are a supportive language learning coach. Your role is to help students during their daily practice:

Teaching Guidelines:
- Correct mistakes gently and explain why
- Suggest better phrasing when appropriate
- Adapt difficulty based on the user's level
- Keep responses concise and actionable (2-3 sentences max)
- Focus on the specific task at hand, not open-ended chat
- Provide immediate, practical feedback
- Encourage consistent daily practice

Response Format:
- If correct: Brief positive feedback
- If incorrect: Gentle correction + brief explanation
- Always include one actionable tip for improvement`,
    errorResponses: [
        "Good try! Here's a small adjustment:",
        "Almost there! Let me help you with this:",
        "I see what you're going for. Let's refine it:",
        "Nice effort! Here's how to improve it:"
    ],
    successResponses: [
        "Well done! That's correct.",
        "Great job! You've got it.",
        "Perfect! Keep it up.",
        "Excellent work!"
    ],
    feedbackStyle: 'supportive'
};

/**
 * Get the supportive coach (only option now)
 */
export function getCoach() {
    return SUPPORTIVE_COACH;
}

/**
 * Get system prompt with context
 */
export function getSystemPrompt(context = {}) {
    let prompt = SUPPORTIVE_COACH.systemPrompt;

    // Add context-specific instructions
    if (context.language) {
        prompt += `\n\nThe student is learning ${context.language}.`;
    }
    if (context.level) {
        prompt += `\nTheir current level is ${context.level}.`;
    }
    if (context.topic) {
        prompt += `\nCurrent task: ${context.topic}.`;
    }

    return prompt;
}

/**
 * Get random response based on success/error
 */
export function getResponse(isSuccess) {
    const responses = isSuccess ? SUPPORTIVE_COACH.successResponses : SUPPORTIVE_COACH.errorResponses;
    return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Format feedback in supportive style
 */
export function formatFeedback(feedback, isCorrect) {
    const prefix = getResponse(isCorrect);
    return `${prefix}\n\n${feedback}`;
}

/**
 * Get practice starter for daily tasks
 */
export function getPracticeStarter(taskType) {
    const starters = {
        vocabulary: "Let's practice your vocabulary! I'll help you as you work through these words.",
        grammar: "Time to practice grammar! I'm here to guide you through it.",
        conversation: "Let's have a conversation practice! I'll provide feedback as we go.",
        reading: "Let's work on reading comprehension together!",
        listening: "Time for listening practice! I'll help you understand better."
    };
    return starters[taskType] || "Let's practice together! I'm here to help.";
}

export default {
    SUPPORTIVE_COACH,
    getCoach,
    getSystemPrompt,
    getResponse,
    formatFeedback,
    getPracticeStarter
};
