import OpenAI from "openai";
import dotenv from "dotenv";
import { log } from "./logger.js";

dotenv.config();

/**
 * AI client — prefers OpenAI when OPENAI_API_KEY is set (more reliable, faster).
 * Falls back to Hugging Face (free but rate-limited) when only HF_TOKEN is set.
 * Falls back to mock responses when neither is configured.
 */

let client = null;
let provider = "none";

if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith("sk-your")) {
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  provider = "openai";
  log.info("OpenAI AI client initialized");
} else if (process.env.HF_TOKEN) {
  client = new OpenAI({
    apiKey: process.env.HF_TOKEN,
    baseURL: "https://router.huggingface.co/v1",
  });
  provider = "huggingface";
  log.info("Hugging Face AI client initialized successfully");
} else {
  log.warn("No AI provider configured. Add OPENAI_API_KEY (recommended) or HF_TOKEN to .env");
}

// Default models per provider
const DEFAULT_MODEL = {
  openai: "gpt-4o-mini",          // fast, cheap, excellent quality
  huggingface: "meta-llama/Llama-3.2-3B-Instruct",
  none: null,
};

/**
 * Generate an AI response.
 * @param {Object} params
 * @param {string} params.systemPrompt - Role/instructions for the AI
 * @param {string} params.userMessage  - User's input
 * @param {string} [params.model]      - Override model (uses provider default if omitted)
 * @param {number} [params.temperature=0.7]
 * @param {number} [params.maxTokens=400]
 * @returns {Promise<string>}
 */
export async function generateAIResponse({
  systemPrompt,
  userMessage,
  model,
  temperature = 0.7,
  maxTokens = 800,
}) {
  if (!systemPrompt || !userMessage) {
    throw new Error("systemPrompt and userMessage are required");
  }

  if (!client) {
    log.warn("AI mock mode active — real response not generated", { userMessage: userMessage.slice(0, 50) });
    return `[MOCK AI RESPONSE] You asked: "${userMessage.slice(0, 100)}..."\n\nAdd OPENAI_API_KEY to .env for real AI responses.`;
  }

  const resolvedModel = model || DEFAULT_MODEL[provider];

  try {
    const completion = await client.chat.completions.create({
      model: resolvedModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const responseText = completion.choices?.[0]?.message?.content;

    if (!responseText) {
      return "I apologize, but I couldn't generate a proper response. Please try again.";
    }

    return responseText.trim();
  } catch (error) {
    log.error(`Error in generateAIResponse (${provider})`, { error: error.message });

    if (error.status === 429) {
      return "I'm currently experiencing high demand. Please try again in a moment.";
    }
    if (error.status === 401 || error.status === 403) {
      log.error("AI authentication error — check your API key");
      return "AI service authentication failed. Please contact support.";
    }

    return "I'm having trouble responding right now. Please try again in a moment.";
  }
}

/**
 * Shorter AI responses for hints, titles, quick suggestions.
 */
export async function generateShortAIResponse(params) {
  return generateAIResponse({
    ...params,
    maxTokens: Math.min(params.maxTokens || 150, 150),
  });
}

/**
 * Check if AI is configured.
 */
export function isAIConfigured() {
  return provider !== "none";
}

/**
 * Get the current AI provider name.
 */
export function getAIProvider() {
  return provider;
}

export const MODELS = {
  // OpenAI models
  GPT4O_MINI: "gpt-4o-mini",
  GPT4O: "gpt-4o",
  // Hugging Face fallback models
  FAST: "meta-llama/Llama-3.2-3B-Instruct",
  BALANCED: "meta-llama/Meta-Llama-3-8B-Instruct",
  SMART: "mistralai/Mistral-7B-Instruct-v0.3",
};

export const AI_PROVIDER = provider;

export default {
  generateAIResponse,
  generateShortAIResponse,
  isAIConfigured,
  MODELS,
  AI_PROVIDER,
};
