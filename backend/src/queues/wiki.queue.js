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

export const wikiQueue = new Queue('wiki-processing', { connection });

let worker = null;

export function startWikiWorker() {
  // Import processRawEntry dynamically to avoid circular deps
  worker = new Worker(
    'wiki-processing',
    async (job) => {
      const { processRawEntry } = await import('../services/wiki.service.js');
      await processRawEntry(job.data.rawId);
    },
    {
      connection,
      concurrency: 3, // process 3 wiki jobs simultaneously
    }
  );

  worker.on('completed', (job) => {
    log.info('Wiki job completed', { jobId: job.id, rawId: job.data.rawId });
  });

  worker.on('failed', (job, err) => {
    log.error('Wiki job failed', { jobId: job?.id, rawId: job?.data?.rawId, error: err.message });
  });

  return worker;
}

export async function closeWikiQueue() {
  if (worker) await worker.close();
  await wikiQueue.close();
}
