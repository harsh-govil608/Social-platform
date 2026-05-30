import { Queue, Worker } from 'bullmq';
import { log } from '../lib/logger.js';

// Use REDIS_URL env var, fall back to localhost
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};
if (process.env.REDIS_URL) {
  // Parse redis://host:port format
  try {
    const url = new URL(process.env.REDIS_URL);
    connection.host = url.hostname;
    connection.port = parseInt(url.port || '6379');
    if (url.password) connection.password = url.password;
  } catch {}
}

export const matchingQueue = new Queue('match-recompute', { connection });

let worker = null;

export function startMatchingWorker() {
  worker = new Worker(
    'match-recompute',
    async (job) => {
      const { userId } = job.data;
      const { default: User } = await import('../models/User.js');
      const { findBestMatches } = await import('../lib/matchingAlgorithm.js');
      const redis = (await import('../lib/redis.js')).default;

      const user = await User.findById(userId).select(
        'nativeLanguage learningLanguage languageProficiency interests timezone availability learningGoals partnerPreferences blockedUsers'
      );
      if (!user) return;

      const excludeIds = [userId, ...(user.blockedUsers || [])];
      const candidates = await User.find({
        _id: { $nin: excludeIds },
        isOnboarded: true,
        isActive: true,
      }).select('fullName profilePic nativeLanguage learningLanguage languageProficiency location timezone bio interests isOnline availability learningGoals').limit(200);

      const matches = findBestMatches(user, candidates, 50);

      // Cache for 6 hours
      await redis.set(`matches:${userId}`, JSON.stringify(matches), 'EX', 6 * 60 * 60);
    },
    {
      connection,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    log.info('Match recompute job completed', { jobId: job.id, userId: job.data.userId });
  });

  worker.on('failed', (job, err) => {
    log.error('Match recompute job failed', { jobId: job?.id, userId: job?.data?.userId, error: err.message });
  });

  return worker;
}

export async function closeMatchingQueue() {
  if (worker) await worker.close();
  await matchingQueue.close();
}

export async function queueMatchRecompute(userId) {
  return matchingQueue.add('recompute', { userId: userId.toString() }, {
    attempts: 2,
    removeOnComplete: 50,
    removeOnFail: 20,
    // Deduplicate: don't queue if already queued for this user
    jobId: `recompute-${userId}`,
  });
}
