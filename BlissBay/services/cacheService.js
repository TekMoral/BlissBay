import { redisClient, REDIS_ENABLED } from '../config/bullConfig.js';
import logger from '../config/logger.js';

/**
 * Cache service for handling Redis caching operations
 */
class CacheService {
  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in seconds (default: 1 hour)
   * @returns {Promise<string>} - Redis response
   */
  async set(key, data, ttl = 3600) {
    if (!REDIS_ENABLED) return null;
    
    try {
      const serializedData = JSON.stringify(data);
      if (ttl) {
        return await redisClient.setex(key, ttl, serializedData);
      }
      return await redisClient.set(key, serializedData);
    } catch (error) {
      logger.error('Cache set error:', error);
      return null; // Continue execution even if caching fails
    }
  }

  /**
   * Get data from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Parsed data or null if not found
   */
  async get(key) {
    if (!REDIS_ENABLED) return null;
    
    try {
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      logger.error('Cache get error:', error);
      return null; // Return null to trigger a fresh data fetch
    }
  }

  /**
   * Delete data from cache
   * @param {string} key - Cache key
   * @returns {Promise<number>} - Number of keys removed
   */
  async delete(key) {
    if (!REDIS_ENABLED) return 0;
    
    try {
      return await redisClient.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
      return 0;
    }
  }

  /**
   * Delete multiple keys with a pattern using scan (non-blocking)
   * @param {string} pattern - Key pattern to match (e.g., 'categories:*')
   * @returns {Promise<number>} - Number of keys removed
   */
  async deleteByPattern(pattern) {
    if (!REDIS_ENABLED) return 0;
    
    try {
      let cursor = '0';
      let keysToDelete = [];
      let totalDeleted = 0;
      
      do {
        // Scan for keys matching the pattern
        const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        
        if (keys.length > 0) {
          keysToDelete = keysToDelete.concat(keys);
          
          // Delete in batches to avoid large single operations
          if (keysToDelete.length >= 100) {
            const deleted = await redisClient.del(keysToDelete);
            totalDeleted += deleted;
            keysToDelete = [];
          }
        }
      } while (cursor !== '0');
      
      // Delete any remaining keys
      if (keysToDelete.length > 0) {
        const deleted = await redisClient.del(keysToDelete);
        totalDeleted += deleted;
      }
      
      return totalDeleted;
    } catch (error) {
      logger.error('Cache deleteByPattern error:', error);
      return 0;
    }
  }
}

export default new CacheService();