// notificationWorker.js
import { Worker } from 'bullmq';
import { redisClient } from '../config/bullConfig.js';
import Notification from '../models/notificationSchema.js';
import logger from '../config/logger.js';

// Create a worker to process notification jobs
const notificationWorker = new Worker('notifications', async (job) => {
  const { type, data, userId } = job.data;
  
  logger.info(`Processing ${type} notification for user ${userId}`, { 
    jobId: job.id,
    notificationData: data 
  });
  
  try {
    // Save notification to database
    const notification = await Notification.create({
      user: userId,
      type,
      data,
      status: 'processed',
      processedAt: new Date()
    });

    logger.info(`Notification saved to database`, {
      notificationId: notification._id,
      type
    });

    return notification;
  } catch (error) {
    logger.error(`Failed to process notification for user ${userId}`, {
      error: error.message,
      stack: error.stack,
      jobData: job.data
    });
    throw error; // Will trigger BullMQ's retry mechanism
  }
}, { 
  connection: redisClient,
  concurrency: 5 // Process up to 5 jobs at once
});

// Handle worker events
notificationWorker.on('completed', (job) => {
  logger.info(`Notification job ${job.id} completed successfully`);
});

notificationWorker.on('failed', (job, error) => {
  logger.error(`Notification job ${job.id} failed`, error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await notificationWorker.close();
  logger.info('Notification worker closed');
});

process.on('SIGTERM', async () => {
  await notificationWorker.close();
  logger.info('Notification worker closed');
});

logger.info('Notification worker started');
