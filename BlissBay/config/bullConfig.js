import { Queue, Worker, QueueEvents, } from 'bullmq';
import Redis from 'ioredis';
import logger from './logger.js';

const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';

// Map to store queue events instances for cleanup and preventing duplicates
const queueEventsMap = new Map();

let redisClient;

const createMockRedisClient = () => ({
  on: () => {},
  connect: () => {},
  disconnect: () => {},
  quit: () => {},
});

try {
  if (REDIS_ENABLED) {
    redisClient = new Redis({
      port: parseInt(process.env.REDIS_PORT || '6379'),
      host: process.env.REDIS_HOST || '127.0.0.1',
      password: process.env.REDIS_PASSWORD || undefined,
      tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      reconnectOnError: (err) => {
        logger.error('Redis connection error', err);
        return false;
      },
    });
    redisClient.on('connect', () => logger.info('Redis client connected'));
    redisClient.on('error', (err) => logger.error('Redis client error', err));
  } else {
    logger.info('Redis is disabled. Using mock Redis client.');
    redisClient = createMockRedisClient();
  }
} catch (error) {
  logger.error('Failed to initialize Redis client', error);
  redisClient = createMockRedisClient();
}

// Default job options
const defaultJobOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 5000,
  },
  removeOnComplete: {
    age: 24 * 60 * 60,
    count: 1000,
  },
  removeOnFail: {
    age: 72 * 60 * 60,
  },
};

/**
 * Create a new BullMQ queue with proper Redis handling
 * @param {string} name - Queue name
 * @param {JobsOptions} jobOptions - Optional job configuration
 * @returns {Queue|Object} A BullMQ Queue or mock queue
 */
export function createQueue(name, jobOptions = {}) {
  if (!REDIS_ENABLED) {
    logger.info(`Creating mock queue: ${name}`);
    return {
      add: async () => ({ id: 'mock-job-' + Date.now() }),
    };
  }

  try {
    const queue = new Queue(name, {
      connection: redisClient,
      defaultJobOptions: {
        ...defaultJobOptions,
        ...jobOptions,
      },
    });

    // Prevent duplicate event listeners by checking if we already have QueueEvents for this queue
    if (!queueEventsMap.has(name)) {
      const queueEvents = new QueueEvents(name, { connection: redisClient });
      
      queueEvents.on('completed', ({ jobId }) => {
        logger.info(`Job completed in ${name}: ${jobId}`);
      });
      
      queueEvents.on('failed', ({ jobId, failedReason }) => {
        logger.error(`Job failed in ${name}: ${jobId}`, failedReason);
      });

      // Store the queueEvents instance for potential cleanup later
      queueEventsMap.set(name, queueEvents);
    }

    return queue;
  } catch (error) {
    logger.error(`Failed to create queue: ${name}`, error);
    return {
      add: async () => ({ id: 'mock-job-' + Date.now() }),
    };
  }
}

/**
 * Clean up queue events listeners
 * @param {string} name - Queue name to clean up events for
 */
export function cleanupQueueEvents(name) {
  if (queueEventsMap.has(name)) {
    const queueEvents = queueEventsMap.get(name);
    queueEvents.close().catch(err => logger.error(`Failed to close queue events for ${name}`, err));
    queueEventsMap.delete(name);
    logger.info(`Cleaned up queue events for ${name}`);
  }
}

/**
 * Clean up all queue events listeners
 */
export function cleanupAllQueueEvents() {
  for (const [name, queueEvents] of queueEventsMap.entries()) {
    queueEvents.close().catch(err => logger.error(`Failed to close queue events for ${name}`, err));
    logger.info(`Cleaned up queue events for ${name}`);
  }
  queueEventsMap.clear();
}

// Gracefully handle Redis client shutdown on app termination (e.g., SIGINT or SIGTERM)
if (REDIS_ENABLED) {
  process.on('SIGINT', () => {
    logger.info('Shutting down gracefully...');
    cleanupAllQueueEvents();
    redisClient.quit().then(() => {
      logger.info('Redis client disconnected');
      process.exit(0);
    }).catch((err) => {
      logger.error('Error while shutting down Redis client', err);
      process.exit(1);
    });
  });
}

export {
  redisClient,
  defaultJobOptions,
  REDIS_ENABLED,
  Worker,
  queueEventsMap,
};
