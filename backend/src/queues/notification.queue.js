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

export const notificationQueue = new Queue('notification-delivery', { connection });

let worker = null;

export function startNotificationWorker() {
  worker = new Worker(
    'notification-delivery',
    async (job) => {
      const { recipient, sender, type, entityId, entityModel, message } = job.data;

      // 1. Create the Notification document
      const { default: Notification } = await import('../models/Notification.js');
      const notification = await Notification.create({
        recipient, sender, type, entityId, entityModel, message
      });

      // 2. Populate sender for the socket payload
      await notification.populate('sender', 'fullName profilePic');

      // 3. Emit via Socket.io
      const { emitNotification } = await import('../lib/socketService.js');
      emitNotification(recipient, notification);
    },
    {
      connection,
      concurrency: 10,
    }
  );

  worker.on('completed', (job) => {
    log.info('Notification job completed', { jobId: job.id, type: job.data.type });
  });

  worker.on('failed', (job, err) => {
    log.error('Notification job failed', { jobId: job?.id, type: job?.data?.type, error: err.message });
  });

  return worker;
}

export async function closeNotificationQueue() {
  if (worker) await worker.close();
  await notificationQueue.close();
}

export async function queueNotification({ recipient, sender, type, entityId, entityModel, message }) {
  return notificationQueue.add('deliver', {
    recipient: recipient.toString(),
    sender: sender.toString(),
    type,
    entityId: entityId?.toString(),
    entityModel,
    message,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 200,
    removeOnFail: 100,
  });
}
