import Logger from '@/logging/Logger';
import { TradingBotError, APIError, RateLimitError, TimeoutError, BinanceAPIError, NetworkError } from './CustomErrors';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // in milliseconds
  maxDelay: number; // in milliseconds
  backoffMultiplier: number;
  retryableErrors: string[];
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number; // in milliseconds
  monitoringWindow: number; // in milliseconds
}

export class ErrorRecovery {
  private static instance: ErrorRecovery;
  private logger = Logger.getInstance();

  private constructor() {}

  public static getInstance(): ErrorRecovery {
    if (!ErrorRecovery.instance) {
      ErrorRecovery.instance = new ErrorRecovery();
    }
    return ErrorRecovery.instance;
  }

  /**
   * Default retry configuration
   */
  public getDefaultRetryConfig(): RetryConfig {
    return {
      maxAttempts: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 30000, // 30 seconds
      backoffMultiplier: 2,
      retryableErrors: [
        'API_ERROR',
        'NETWORK_ERROR',
        'TIMEOUT_ERROR',
        'RATE_LIMIT_ERROR'
      ]
    };
  }

  /**
   * Default circuit breaker configuration
   */
  public getDefaultCircuitBreakerConfig(): CircuitBreakerConfig {
    return {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringWindow: 300000 // 5 minutes
    };
  }

  /**
   * Check if an error is retryable
   */
  public isRetryableError(error: TradingBotError, config: RetryConfig): boolean {
    // Check if error code is in retryable list
    if (!config.retryableErrors.includes(error.code)) {
      return false;
    }

    // Don't retry rate limit errors immediately
    if (error instanceof RateLimitError) {
      const now = Date.now();
      if (now < error.resetTime) {
        return false;
      }
    }

    // Don't retry validation or configuration errors
    if (error.code === 'VALIDATION_ERROR' || error.code === 'CONFIGURATION_ERROR') {
      return false;
    }

    return true;
  }

  /**
   * Calculate delay for retry with exponential backoff
   */
  public calculateRetryDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }

  /**
   * Retry a function with exponential backoff
   */
  public async retryWithBackoff<T>(
    operation: () => Promise<T>,
    config: RetryConfig = this.getDefaultRetryConfig(),
    context?: string
  ): Promise<T> {
    let lastError: TradingBotError;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof TradingBotError ? error : new TradingBotError(
          error instanceof Error ? error.message : String(error),
          'UNKNOWN_ERROR'
        );

        this.logger.warn('Operation failed, attempting retry', {
          type: 'RETRY_ATTEMPT',
          context,
          attempt,
          maxAttempts: config.maxAttempts,
          errorCode: lastError.code,
          errorMessage: lastError.message
        });

        // Check if we should retry
        if (!this.isRetryableError(lastError, config) || attempt === config.maxAttempts) {
          break;
        }

        // Calculate delay
        const delay = this.calculateRetryDelay(attempt, config);
        
        // Special handling for rate limit errors
        if (lastError instanceof RateLimitError) {
          const rateLimitDelay = Math.max(delay, lastError.resetTime - Date.now());
          this.logger.info('Rate limit hit, waiting for reset', {
            type: 'RATE_LIMIT_WAIT',
            context,
            resetTime: lastError.resetTime,
            waitTime: rateLimitDelay
          });
          await this.sleep(rateLimitDelay);
        } else {
          this.logger.info('Waiting before retry', {
            type: 'RETRY_WAIT',
            context,
            attempt,
            delay
          });
          await this.sleep(delay);
        }
      }
    }

    this.logger.error('Operation failed after all retry attempts', {
      type: 'RETRY_FAILED',
      context,
      maxAttempts: config.maxAttempts,
      finalErrorCode: lastError!.code,
      finalErrorMessage: lastError!.message
    });

    throw lastError!;
  }

  /**
   * Circuit breaker implementation
   */
  public createCircuitBreaker<T>(
    operation: () => Promise<T>,
    config: CircuitBreakerConfig = this.getDefaultCircuitBreakerConfig(),
    context?: string
  ): () => Promise<T> {
    let failureCount = 0;
    let lastFailureTime = 0;
    let state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

    return async (): Promise<T> => {
      const now = Date.now();

      // Check if circuit breaker is open
      if (state === 'OPEN') {
        if (now - lastFailureTime >= config.recoveryTimeout) {
          state = 'HALF_OPEN';
          this.logger.info('Circuit breaker transitioning to half-open', {
            type: 'CIRCUIT_BREAKER_HALF_OPEN',
            context
          });
        } else {
          throw new TradingBotError(
            'Circuit breaker is open',
            'CIRCUIT_BREAKER_ERROR',
            { context, state, lastFailureTime, recoveryTimeout: config.recoveryTimeout }
          );
        }
      }

      try {
        const result = await operation();
        
        // Success - reset failure count and close circuit
        if (state === 'HALF_OPEN') {
          state = 'CLOSED';
          this.logger.info('Circuit breaker closed after successful operation', {
            type: 'CIRCUIT_BREAKER_CLOSED',
            context
          });
        }
        
        failureCount = 0;
        return result;
      } catch (error) {
        failureCount++;
        lastFailureTime = now;

        this.logger.warn('Operation failed, updating circuit breaker', {
          type: 'CIRCUIT_BREAKER_FAILURE',
          context,
          failureCount,
          threshold: config.failureThreshold,
          state
        });

        // Check if we should open the circuit
        if (failureCount >= config.failureThreshold) {
          state = 'OPEN';
          this.logger.error('Circuit breaker opened due to too many failures', {
            type: 'CIRCUIT_BREAKER_OPENED',
            context,
            failureCount,
            threshold: config.failureThreshold
          });
        }

        throw error;
      }
    };
  }

  /**
   * Handle API errors with proper categorization
   */
  public handleAPIError(error: any, endpoint?: string, context?: Record<string, any>): never {
    let apiError: APIError;

    if (error instanceof APIError) {
      apiError = error;
    } else if (error.response) {
      // Axios error
      const statusCode = error.response.status;
      const message = error.response.data?.msg || error.message || 'API request failed';
      
      if (error.response.data?.code) {
        // Binance API error
        apiError = new BinanceAPIError(
          message,
          error.response.data.code,
          error.response.data.msg,
          statusCode,
          endpoint,
          context
        );
      } else {
        apiError = new APIError(message, statusCode, endpoint, context);
      }
    } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      apiError = new TimeoutError(
        'Request timeout',
        endpoint,
        error.timeout,
        context
      );
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      apiError = new NetworkError(
        'Network connection failed',
        endpoint,
        'GET',
        undefined,
        context
      );
    } else {
      apiError = new APIError(
        error.message || 'Unknown API error',
        undefined,
        endpoint,
        context
      );
    }

    this.logger.error('API error occurred', {
      type: 'API_ERROR',
      endpoint,
      errorCode: apiError.code,
      statusCode: apiError.statusCode,
      message: apiError.message,
      context
    });

    throw apiError;
  }

  /**
   * Sleep utility function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a timeout wrapper for operations
   */
  public withTimeout<T>(
    operation: Promise<T>,
    timeoutMs: number,
    context?: string
  ): Promise<T> {
    return Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new TimeoutError(
            `Operation timed out after ${timeoutMs}ms`,
            context,
            timeoutMs
          ));
        }, timeoutMs);
      })
    ]);
  }
}
