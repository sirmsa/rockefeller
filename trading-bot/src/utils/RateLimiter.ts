import Logger from '@/logging/Logger';
import ConfigManager from '@/core/ConfigManager';

interface RateLimitConfig {
  limit: number;
  window: number; // in milliseconds
  keyPrefix: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private rateLimits: Map<string, RateLimitEntry> = new Map();
  private logger = Logger.getInstance();
  private config = ConfigManager.getInstance();

  private constructor() {
    // Clean up expired entries periodically
    setInterval(() => this.cleanupExpiredEntries(), 60000); // Every minute
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.rateLimits.entries()) {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.rateLimits.delete(key);
    }

    if (keysToDelete.length > 0) {
      this.logger.debug('Cleaned up expired rate limit entries', {
        type: 'RATE_LIMIT_CLEANUP',
        removedEntries: keysToDelete.length
      });
    }
  }

  /**
   * Check if a request is allowed based on rate limiting
   */
  public async checkLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `${config.keyPrefix}:${identifier}`;
    const now = Date.now();


    try {
      // Get current entry from memory
      let entry = this.rateLimits.get(key);
      
      // If no entry exists or window has expired, create new entry
      if (!entry || now > entry.resetTime) {
        entry = {
          count: 0,
          resetTime: now + config.window
        };
      }

      // Check if we're within the rate limit
      if (entry.count >= config.limit) {
        this.logger.warn('Rate limit exceeded', {
          type: 'RATE_LIMIT_EXCEEDED',
          identifier,
          limit: config.limit,
          window: config.window,
          currentCount: entry.count
        });

        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.resetTime
        };
      }

      // Increment the counter
      entry.count++;
      this.rateLimits.set(key, entry);

      const remaining = config.limit - entry.count;
      const resetTime = entry.resetTime;

      return {
        allowed: true,
        remaining,
        resetTime
      };
    } catch (error) {
      this.logger.error('Rate limit check failed', {
        type: 'RATE_LIMIT_CHECK_ERROR',
        identifier,
        error: error instanceof Error ? error.message : String(error)
      });

      // Allow the request if rate limiting fails
      return {
        allowed: true,
        remaining: config.limit,
        resetTime: now + config.window
      };
    }
  }

  /**
   * Wait until rate limit allows the request
   */
  public async waitForLimit(
    identifier: string,
    config: RateLimitConfig,
    maxWaitTime: number = 30000
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const result = await this.checkLimit(identifier, config);
      
      if (result.allowed) {
        return;
      }

      // Wait before retrying
      const waitTime = Math.min(1000, result.resetTime - Date.now());
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw new Error(`Rate limit wait timeout exceeded for ${identifier}`);
  }

  /**
   * Get rate limit info without consuming a request
   */
  public async getLimitInfo(
    identifier: string,
    config: RateLimitConfig
  ): Promise<{ current: number; remaining: number; resetTime: number }> {
    const key = `${config.keyPrefix}:${identifier}`;
    const now = Date.now();

    try {
      const entry = this.rateLimits.get(key);
      
      if (!entry || now > entry.resetTime) {
        return {
          current: 0,
          remaining: config.limit,
          resetTime: now + config.window
        };
      }

      return {
        current: entry.count,
        remaining: Math.max(0, config.limit - entry.count),
        resetTime: entry.resetTime
      };
    } catch (error) {
      this.logger.error('Failed to get rate limit info', {
        type: 'RATE_LIMIT_INFO_ERROR',
        identifier,
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        current: 0,
        remaining: config.limit,
        resetTime: now + config.window
      };
    }
  }

  /**
   * Reset rate limit for an identifier
   */
  public async resetLimit(identifier: string, config: RateLimitConfig): Promise<void> {
    const key = `${config.keyPrefix}:${identifier}`;
    
    try {
      this.rateLimits.delete(key);
      this.logger.info('Rate limit reset', {
        type: 'RATE_LIMIT_RESET',
        identifier
      });
    } catch (error) {
      this.logger.error('Failed to reset rate limit', {
        type: 'RATE_LIMIT_RESET_ERROR',
        identifier,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get default rate limit configs
   */
  public getDefaultConfigs() {
    const apiConfig = this.config.apiConfig;
    
    return {
      restApi: {
        limit: apiConfig.restRateLimit,
        window: 60000, // 1 minute
        keyPrefix: 'rate_limit:rest'
      },
      websocket: {
        limit: apiConfig.websocketRateLimit,
        window: 1000, // 1 second
        keyPrefix: 'rate_limit:ws'
      }
    };
  }

  /**
   * Get current rate limit statistics
   */
  public getStats(): {
    totalEntries: number;
    activeEntries: number;
  } {
    const now = Date.now();
    let activeEntries = 0;

    for (const entry of this.rateLimits.values()) {
      if (now <= entry.resetTime) {
        activeEntries++;
      }
    }

    return {
      totalEntries: this.rateLimits.size,
      activeEntries
    };
  }
}

export default RateLimiter;
