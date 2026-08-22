import axios from "axios";
import { log } from "./logger.js";

/**
 * Fetches the Merriam-Webster Word of the Day from their RSS2 feed.
 * Returns { word, partOfSpeech, definition, example, pronunciation } or null on failure.
 */
export async function fetchMerriamWebsterWOTD() {
  try {
    const { data: xml } = await axios.get(
      "https://www.merriam-webster.com/wotd/feed/rss2",
      {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; LangApp/1.0)" },
        responseType: "text",
      }
    );

    // First <title> after the channel title is the word entry
    // Format: "Word of the Day: <word>"
    const wordMatch = xml.match(/<title>Word of the Day:\s*([^<]+)<\/title>/i);
    if (!wordMatch) return null;
    const word = wordMatch[1].trim();

    // CDATA description blocks — first belongs to the channel, second to the item
    const cdataBlocks = [...xml.matchAll(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/g)];
    const rawDesc = cdataBlocks[1]?.[1] || cdataBlocks[0]?.[1] || "";

    // Strip HTML tags and decode basic HTML entities
    const clean = (str) =>
      str
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const cleanDesc = clean(rawDesc);

    // Try to extract part of speech (usually near the beginning)
    const posMatch = cleanDesc.match(
      /\b(noun|verb|adjective|adverb|pronoun|preposition|conjunction|interjection)\b/i
    );
    const partOfSpeech = posMatch ? posMatch[1].toLowerCase() : "";

    // Try to extract example sentence — look for quoted text or a sentence with the word
    const exampleMatch = cleanDesc.match(/"([^"]{20,200})"/);
    const example = exampleMatch ? exampleMatch[1] : "";

    // Definition: take up to 300 chars of cleaned description (skip duplicate word/pos)
    const definition = cleanDesc.substring(0, 300);

    // Try to extract pronunciation from <wotd:pronunciation> or similar
    const pronMatch = xml.match(/<wotd:pronunciation>([^<]+)<\/wotd:pronunciation>/);
    const pronunciation = pronMatch ? pronMatch[1].trim() : "";

    return { word, partOfSpeech, definition, example, pronunciation };
  } catch (err) {
    log.warn("wotdFetcher: failed to fetch M-W RSS", { error: err.message });
    return null;
  }
}
