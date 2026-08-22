import { generateAIResponse, isAIConfigured } from "../lib/ai.js";
import WikiRaw from "../models/WikiRaw.js";
import WikiArticle from "../models/WikiArticle.js";
import WikiTemplate from "../models/WikiTemplate.js";
import { log } from "../lib/logger.js";
import { wikiQueue } from "../queues/wiki.queue.js";

// Built-in fallback templates (used when DB has no matching template)
const BUILTIN_TEMPLATES = {
  vocabulary: {
    system: `You are a lexicographer creating wiki articles about words and vocabulary. Return ONLY valid JSON, no markdown fences.`,
    userTemplate: (content) => `Create a wiki article for this vocabulary content:\n\n${content}\n\nReturn ONLY this JSON:\n{\n  "title": "The main word or phrase",\n  "summary": "One sentence definition",\n  "body": "Full article with ## Definition, ## Etymology, ## Usage Examples, ## Related Words sections",\n  "claims": [{ "fact": "specific verifiable claim", "confidence": 0.9, "source": "inferred" }],\n  "tags": ["vocabulary"],\n  "type": "vocabulary"\n}`,
  },
  language_term: {
    system: `You are a linguistics expert creating wiki articles about grammar rules and language concepts. Return ONLY valid JSON, no markdown fences.`,
    userTemplate: (content) => `Create a wiki article for this language/grammar content:\n\n${content}\n\nReturn ONLY this JSON:\n{\n  "title": "The grammar term or concept",\n  "summary": "One sentence explanation",\n  "body": "Full article with ## Definition, ## Rules, ## Examples, ## Exceptions sections",\n  "claims": [{ "fact": "specific verifiable claim", "confidence": 0.9, "source": "inferred" }],\n  "tags": ["grammar", "language"],\n  "type": "language_term"\n}`,
  },
  general: {
    system: `You are a knowledgeable encyclopedist creating structured wiki articles. Return ONLY valid JSON, no markdown fences.`,
    userTemplate: (content) => `Create a wiki article from this content:\n\n${content}\n\nReturn ONLY this JSON:\n{\n  "title": "Concise descriptive title",\n  "summary": "One sentence summary",\n  "body": "Full wiki article with ## headers to organize sections. Be comprehensive and factual.",\n  "claims": [{ "fact": "specific verifiable claim", "confidence": 0.9, "source": "inferred" }],\n  "tags": ["relevant", "tags"],\n  "type": "general"\n}`,
  },
};

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function makeSlugUnique(baseSlug) {
  let slug = baseSlug;
  let count = 1;
  while (await WikiArticle.exists({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }
  return slug;
}

function detectSourceType(content) {
  const lower = content.toLowerCase();
  if (/\b(conjugat|subjunctive|grammar|syntax|morphol|phonem|verb|noun|adjective|adverb|preposition|tense)\b/.test(lower)) {
    return "language_term";
  }
  if (/\b(definition|etymology|synonym|antonym|plural|pronunciation|word class|part of speech)\b/.test(lower)) {
    return "vocabulary";
  }
  return "general";
}

async function getTemplate(sourceType) {
  const dbTemplate = await WikiTemplate.findOne({ type: sourceType });
  if (dbTemplate) {
    return {
      system: dbTemplate.systemPrompt,
      userTemplate: (c) => dbTemplate.userPromptTemplate.replace("{{content}}", c),
    };
  }
  return BUILTIN_TEMPLATES[sourceType] || BUILTIN_TEMPLATES.general;
}

function parseAIResponse(text) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("AI response was not valid JSON");
  }
}

async function checkContradictions(newClaims, existingArticle, rawId) {
  if (!existingArticle.claims.length || !newClaims.length) return [];

  const existingFacts = existingArticle.claims.map((c) => c.fact).join("\n");
  const newFacts = newClaims.map((c) => c.fact).join("\n");

  const response = await generateAIResponse({
    systemPrompt: `You are a fact-checker. Compare two claim sets about the same topic and identify direct contradictions. Return ONLY a JSON array. If none found, return [].`,
    userMessage: `Existing claims:\n${existingFacts}\n\nNew claims:\n${newFacts}\n\nReturn ONLY JSON array: [{"claim": "new claim text", "conflictsWith": "existing claim text"}]`,
    maxTokens: 400,
    temperature: 0.2,
  });

  try {
    const parsed = parseAIResponse(response);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c) => ({
      claim: c.claim || "",
      conflictsWith: c.conflictsWith || "",
      rawSource: rawId,
      resolved: false,
    }));
  } catch {
    return [];
  }
}

export async function ingestContent({ source, content, url, title, metadata, submittedBy }) {
  const raw = await WikiRaw.create({
    source,
    content: content || url,
    url,
    title,
    metadata: metadata || {},
    submittedBy,
    status: "pending",
  });

  // Process asynchronously — don't block the HTTP response
  // Note: entries in "pending" status on restart can be retried via the retry endpoint
  await wikiQueue.add('process-raw', { rawId: raw._id.toString() }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  });

  return raw;
}

export async function processRawEntry(rawId) {
  const raw = await WikiRaw.findById(rawId);
  if (!raw) throw new Error(`WikiRaw ${rawId} not found`);

  try {
    if (!isAIConfigured()) {
      await WikiRaw.findByIdAndUpdate(rawId, {
        status: "failed",
        error: "No AI provider configured. Add OPENAI_API_KEY or HF_TOKEN to backend/.env",
      });
      return;
    }

    await WikiRaw.findByIdAndUpdate(rawId, { status: "processing" });

    let content = raw.content;

    // Fetch URL content if only a URL was provided
    if (raw.url && content === raw.url) {
      try {
        const res = await fetch(raw.url, { signal: AbortSignal.timeout(10000) });
        const html = await res.text();
        content = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 4000);
      } catch (err) {
        log.warn("Failed to fetch URL for wiki ingest", { url: raw.url, error: err.message });
      }
    }

    const sourceType = detectSourceType(content);
    const template = await getTemplate(sourceType);

    const aiResponse = await generateAIResponse({
      systemPrompt: template.system,
      userMessage: template.userTemplate(content.slice(0, 3000)),
      maxTokens: 1200,
      temperature: 0.3,
    });

    let parsed;
    try {
      parsed = parseAIResponse(aiResponse);
    } catch (err) {
      await WikiRaw.findByIdAndUpdate(rawId, { status: "failed", error: `JSON parse failed: ${err.message}` });
      return;
    }

    const { title, summary, body, claims = [], tags = [], type = "general" } = parsed;

    if (!title || !body) {
      await WikiRaw.findByIdAndUpdate(rawId, { status: "failed", error: "AI returned incomplete article" });
      return;
    }

    // Escape special regex chars before using title in a regex query
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existing = await WikiArticle.findOne({
      title: { $regex: new RegExp(`^${escapedTitle}$`, "i") },
    });

    if (existing) {
      const contradictions = await checkContradictions(claims, existing, rawId);

      const existingFacts = new Set(existing.claims.map((c) => c.fact.toLowerCase()));
      const newUniqueClaims = claims.filter((c) => !existingFacts.has(c.fact.toLowerCase()));

      await WikiArticle.findByIdAndUpdate(existing._id, {
        $push: {
          sources: rawId,
          claims: { $each: newUniqueClaims },
          contradictions: { $each: contradictions },
        },
        $addToSet: { tags: { $each: tags } },
        lastEnrichedAt: new Date(),
        // Update body only if new version is significantly richer
        ...(body.length > existing.body.length ? { body, summary } : {}),
      });

      await WikiRaw.findByIdAndUpdate(rawId, { status: "processed", articleId: existing._id });
      log.info("Wiki article enriched", { title, articleId: existing._id });
    } else {
      const baseSlug = generateSlug(title);
      const slug = await makeSlugUnique(baseSlug);

      const article = await WikiArticle.create({
        title,
        slug,
        summary,
        body,
        type,
        claims,
        tags,
        sources: [rawId],
        lastEnrichedAt: new Date(),
      });

      await WikiRaw.findByIdAndUpdate(rawId, { status: "processed", articleId: article._id });
      log.info("Wiki article created", { title, slug, articleId: article._id });
    }
  } catch (err) {
    log.error("processRawEntry failed", { rawId, error: err.message });
    await WikiRaw.findByIdAndUpdate(rawId, { status: "failed", error: err.message });
  }
}
