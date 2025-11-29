import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Hugging Face client (OpenAI-compatible API)
let hfClient = null;
let isConfigured = false;

try {
  if (!process.env.HF_TOKEN) {
    console.warn("⚠️  HF_TOKEN not found. AI features will use mock responses.");
    console.warn("   To enable real AI, add HF_TOKEN to your .env file");
    console.warn("   Get token from: https://huggingface.co/settings/tokens");
  } else {
    hfClient = new OpenAI({
      apiKey: process.env.HF_TOKEN,
      baseURL: "https://router.huggingface.co/v1"
    });
    isConfigured = true;
    console.log("✅ Hugging Face AI client initialized successfully");
  }
} catch (error) {
  console.error("❌ Failed to initialize Hugging Face client:", error);
}

/**
 * Main AI response generator - use this from any controller/service
 * 
 * @param {Object} params
 * @param {string} params.systemPrompt - AI instructions/role (e.g., "You are a helpful tutor")
 * @param {string} params.userMessage - User's input or conversation context
 * @param {string} [params.model] - Hugging Face model (default: Llama-3.2-3B)
 * @param {number} [params.temperature] - Creativity 0-1 (default: 0.7)
 * @param {number} [params.maxTokens] - Max response length (default: 400)
 * @returns {Promise<string>} AI-generated response
 */
export async function generateAIResponse({
  systemPrompt,
  userMessage,
  model = "meta-llama/Llama-3.2-3B-Instruct",
  temperature = 0.7,
  maxTokens = 400
}) {
  // Validate inputs
  if (!systemPrompt || !userMessage) {
    throw new Error("systemPrompt and userMessage are required");
  }

  // Mock mode fallback (no token configured)
  if (!hfClient) {
    return `[MOCK AI RESPONSE] You asked: "${userMessage.slice(0, 100)}..."\n\nThis is a mock response. Add HF_TOKEN to .env for real AI.`;
  }

  try {
    const completion = await hfClient.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature,
      max_tokens: maxTokens
    });

    const responseText = completion.choices?.[0]?.message?.content;
    
    if (!responseText) {
      console.error("Empty response from Hugging Face");
      return "I apologize, but I couldn't generate a proper response. Please try again.";
    }

    return responseText.trim();

  } catch (error) {
    console.error("Error in generateAIResponse:", error.message);
    
    // Handle specific error types
    if (error.status === 429) {
      return "I'm currently experiencing high demand. Please try again in a moment.";
    }
    
    if (error.status === 401 || error.status === 403) {
      console.error("Authentication error - check HF_TOKEN permissions");
      return "AI service authentication failed. Please contact support.";
    }

    // Generic fallback
    return "I'm having trouble responding right now. Please try again in a moment.";
  }
}

/**
 * Shorter AI responses (for hints, titles, quick suggestions)
 * 
 * @param {Object} params - Same as generateAIResponse
 * @returns {Promise<string>} Short AI response (max 150 tokens)
 */
export async function generateShortAIResponse(params) {
  return generateAIResponse({
    ...params,
    maxTokens: Math.min(params.maxTokens || 150, 150)
  });
}

/**
 * Check if AI is properly configured
 * 
 * @returns {boolean} True if HF_TOKEN is set and client initialized
 */
export function isAIConfigured() {
  return isConfigured;
}

/**
 * Available models (free on Hugging Face)
 */
export const MODELS = {
  FAST: "meta-llama/Llama-3.2-3B-Instruct",      // Fast, lightweight
  BALANCED: "meta-llama/Meta-Llama-3-8B-Instruct", // Better quality
  SMART: "mistralai/Mistral-7B-Instruct-v0.3"    // Good reasoning
};

export default {
  generateAIResponse,
  generateShortAIResponse,
  isAIConfigured,
  MODELS
};