import { ingestContent, processRawEntry } from "../services/wiki.service.js";
import WikiArticle from "../models/WikiArticle.js";
import WikiRaw from "../models/WikiRaw.js";
import { log } from "../lib/logger.js";
import { wikiQueue } from "../queues/wiki.queue.js";

export const ingest = async (req, res) => {
  try {
    const { source = "manual", content, url, title, metadata } = req.body;

    if (!content && !url) {
      return res.status(400).json({ success: false, message: "Provide content or url" });
    }

    const raw = await ingestContent({
      source,
      content: content || url,
      url,
      title,
      metadata,
      submittedBy: req.user._id,
    });

    res.status(202).json({ success: true, message: "Queued for processing", rawId: raw._id });
  } catch (err) {
    log.error("Wiki ingest controller error", { error: err.message });
    res.status(500).json({ success: false, message: "Failed to queue content" });
  }
};

export const getArticles = async (req, res) => {
  try {
    const { page = 1, limit = 12, type, q } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = { isPublished: true };
    if (type && type !== "all") filter.type = type;
    if (q) filter.$text = { $search: q };

    const [articles, total] = await Promise.all([
      WikiArticle.find(filter)
        .sort(q ? { score: { $meta: "textScore" } } : { updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("title slug summary tags type viewCount sources updatedAt"),
      WikiArticle.countDocuments(filter),
    ]);

    res.json({
      success: true,
      articles,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    log.error("getArticles error", { error: err.message });
    res.status(500).json({ success: false, message: "Failed to fetch articles" });
  }
};

export const getArticle = async (req, res) => {
  try {
    const article = await WikiArticle.findOne({ slug: req.params.slug, isPublished: true })
      .populate("sources", "source url title createdAt")
      .populate("contradictions.rawSource", "source url title");

    if (!article) return res.status(404).json({ success: false, message: "Article not found" });

    await WikiArticle.findByIdAndUpdate(article._id, { $inc: { viewCount: 1 } });

    res.json({ success: true, article });
  } catch (err) {
    log.error("getArticle error", { error: err.message });
    res.status(500).json({ success: false, message: "Failed to fetch article" });
  }
};

export const getRawStatus = async (req, res) => {
  try {
    const raw = await WikiRaw.findById(req.params.rawId).select("status error articleId");
    if (!raw) return res.status(404).json({ success: false, message: "Raw entry not found" });
    res.json({ success: true, ...raw.toObject() });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch status" });
  }
};

// Retry failed or stuck pending entries
export const retryRaw = async (req, res) => {
  try {
    const raw = await WikiRaw.findById(req.params.rawId);
    if (!raw) return res.status(404).json({ success: false, message: "Raw entry not found" });

    if (!["failed", "pending"].includes(raw.status)) {
      return res.status(400).json({ success: false, message: `Entry is ${raw.status}, cannot retry` });
    }

    await WikiRaw.findByIdAndUpdate(raw._id, { status: "pending", error: null });
    await wikiQueue.add('process-raw', { rawId: raw._id.toString() }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });

    res.json({ success: true, message: "Retry queued" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to retry" });
  }
};

export const getQueueStats = async (req, res) => {
  try {
    const counts = await wikiQueue.getJobCounts();
    res.json({ success: true, counts });
  } catch (err) {
    log.error("getQueueStats error", { error: err.message });
    res.status(500).json({ success: false, message: "Failed to fetch queue stats" });
  }
};
