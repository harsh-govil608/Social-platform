import WikiTemplate from "../models/WikiTemplate.js";

const TEMPLATES = [
  {
    name: "Vocabulary Term",
    type: "vocabulary",
    description: "For individual words and their definitions",
    systemPrompt: `You are a lexicographer creating wiki articles about words and vocabulary. Return ONLY valid JSON, no markdown fences or extra text.`,
    userPromptTemplate: `Create a wiki article for this vocabulary content:\n\n{{content}}\n\nReturn ONLY this JSON structure:\n{\n  "title": "The main word or phrase",\n  "summary": "One sentence definition",\n  "body": "Full article with ## Definition, ## Etymology, ## Usage Examples, ## Related Words sections",\n  "claims": [{ "fact": "specific verifiable claim", "confidence": 0.9, "source": "inferred" }],\n  "tags": ["vocabulary"],\n  "type": "vocabulary"\n}`,
    isDefault: true,
  },
  {
    name: "Language Grammar Term",
    type: "language_term",
    description: "For grammar rules, linguistic concepts, and language structure",
    systemPrompt: `You are a linguistics expert creating wiki articles about grammar rules and language concepts. Return ONLY valid JSON, no markdown fences or extra text.`,
    userPromptTemplate: `Create a wiki article for this language/grammar content:\n\n{{content}}\n\nReturn ONLY this JSON structure:\n{\n  "title": "The grammar term or concept",\n  "summary": "One sentence explanation",\n  "body": "Full article with ## Definition, ## Rules, ## Examples, ## Exceptions sections",\n  "claims": [{ "fact": "specific verifiable claim", "confidence": 0.9, "source": "inferred" }],\n  "tags": ["grammar", "language"],\n  "type": "language_term"\n}`,
    isDefault: true,
  },
  {
    name: "General Knowledge",
    type: "general",
    description: "For general topics, concepts, and knowledge",
    systemPrompt: `You are a knowledgeable encyclopedist creating structured wiki articles. Extract key facts and claims. Return ONLY valid JSON, no markdown fences or extra text.`,
    userPromptTemplate: `Create a wiki article from this content:\n\n{{content}}\n\nReturn ONLY this JSON structure:\n{\n  "title": "Concise descriptive title",\n  "summary": "One sentence summary",\n  "body": "Full wiki article with ## headers to organize sections. Be comprehensive and factual.",\n  "claims": [{ "fact": "specific verifiable claim", "confidence": 0.9, "source": "inferred" }],\n  "tags": ["relevant", "tags"],\n  "type": "general"\n}`,
    isDefault: true,
  },
];

export async function seedWikiTemplates() {
  for (const t of TEMPLATES) {
    await WikiTemplate.findOneAndUpdate({ name: t.name }, t, { upsert: true, new: true });
  }
}
