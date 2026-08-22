import OpenAI from "openai";
import CircuitBreaker from "opossum";
import dotenv from "dotenv";
import { log } from "./logger.js";

dotenv.config();

/**
 * AI client — priority order:
 * 1. Groq       (GROQ_API_KEY)   — free, very fast, best free option
 * 2. OpenAI     (OPENAI_API_KEY) — paid, most reliable
 * 3. Hugging Face (HF_TOKEN)     — free but slow and unreliable
 * 4. Mock                        — no AI configured
 */

let client = null;
let provider = "none";

if (process.env.GROQ_API_KEY) {
  client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
  provider = "groq";
  log.info("Groq AI client initialized (free & fast)");
} else if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith("sk-your")) {
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  provider = "openai";
  log.info("OpenAI AI client initialized");
} else if (process.env.HF_TOKEN) {
  client = new OpenAI({
    apiKey: process.env.HF_TOKEN,
    baseURL: "https://router.huggingface.co/v1",
  });
  provider = "huggingface";
  log.info("Hugging Face AI client initialized");
} else {
  log.warn("No AI provider configured. Add GROQ_API_KEY to .env (free at console.groq.com)");
}

// Circuit breaker config
const circuitBreakerOptions = {
  timeout: 15000,                // 15s — if AI takes longer, treat as failure
  errorThresholdPercentage: 50,  // open if >50% of requests fail
  resetTimeout: 30000,           // try again after 30s
  volumeThreshold: 5,            // need at least 5 requests before opening
};

/**
 * Raw AI call — wrapped by the circuit breaker.
 * Rethrows 5xx/timeout errors so the breaker counts them as failures.
 * Returns user-friendly strings for 429/401 so the breaker does NOT count
 * those as provider outages.
 */
async function callAI({ resolvedModel, systemPrompt, userMessage, temperature, maxTokens }) {
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
    return completion.choices?.[0]?.message?.content;
  } catch (error) {
    if (error.status === 429) {
      return "I'm currently experiencing high demand. Please try again in a moment.";
    }
    if (error.status === 401 || error.status === 403) {
      log.error("AI authentication error — check your API key");
      return "AI service authentication failed. Please contact support.";
    }
    // Rethrow so the circuit breaker counts this as a failure
    throw error;
  }
}

const aiBreaker = client ? new CircuitBreaker(callAI, circuitBreakerOptions) : null;

aiBreaker?.on("open", () => log.warn("AI circuit breaker OPEN — provider appears down"));
aiBreaker?.on("halfOpen", () => log.info("AI circuit breaker HALF-OPEN — testing recovery"));
aiBreaker?.on("close", () => log.info("AI circuit breaker CLOSED — provider recovered"));
aiBreaker?.on("fallback", () => log.warn("AI circuit breaker fallback triggered"));

// Default models per provider
const DEFAULT_MODEL = {
  groq: "llama-3.1-8b-instant",           // free, fast, great quality
  openai: "gpt-4o-mini",
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
    const responseText = await aiBreaker.fire({ resolvedModel, systemPrompt, userMessage, temperature, maxTokens });

    if (!responseText) {
      return "I apologize, but I couldn't generate a proper response. Please try again.";
    }

    return responseText.trim();
  } catch (error) {
    log.error(`Error in generateAIResponse (${provider})`, { error: error.message });

    // Circuit breaker open — fail fast
    if (error.name === "OpenCircuitError") {
      return "AI service is temporarily unavailable. Please try again in a moment.";
    }

    return "AI service is temporarily unavailable. Please try again in a moment.";
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

/**
 * Get circuit breaker stats for health checks / monitoring.
 */
export function getCircuitBreakerStats() {
  if (!aiBreaker) return { configured: false };
  return {
    configured: true,
    state: aiBreaker.opened ? "open" : aiBreaker.halfOpen ? "half-open" : "closed",
    stats: aiBreaker.stats,
  };
}

export const MODELS = {
  // Groq (free)
  GROQ_FAST: "llama-3.1-8b-instant",
  GROQ_SMART: "llama-3.3-70b-versatile",
  // OpenAI (paid)
  GPT4O_MINI: "gpt-4o-mini",
  GPT4O: "gpt-4o",
  // Hugging Face (free, slow)
  FAST: "meta-llama/Llama-3.2-3B-Instruct",
  BALANCED: "meta-llama/Meta-Llama-3-8B-Instruct",
};

export const AI_PROVIDER = provider;

export default {
  generateAIResponse,
  generateShortAIResponse,
  isAIConfigured,
  getCircuitBreakerStats,
  MODELS,
  AI_PROVIDER,
};
