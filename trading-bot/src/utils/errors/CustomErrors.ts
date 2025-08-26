/**
 * Base custom error class for the trading bot
 */
export class TradingBotError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    this.context = context || {};

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * API-related errors
 */
export class APIError extends TradingBotError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly endpoint?: string,
    context?: Record<string, any>
  ) {
    super(message, 'API_ERROR', context);
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}

/**
 * Binance API specific errors
 */
export class BinanceAPIError extends APIError {
  constructor(
    message: string,
    public readonly binanceErrorCode?: number,
    public readonly binanceErrorMessage?: string,
    statusCode?: number,
    endpoint?: string,
    context?: Record<string, any>
  ) {
    super(message, statusCode, endpoint, context);
    (this as any).code = 'BINANCE_API_ERROR';
    this.binanceErrorCode = binanceErrorCode;
    this.binanceErrorMessage = binanceErrorMessage;
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends TradingBotError {
  constructor(
    message: string,
    public readonly limit: number,
    public readonly window: number,
    public readonly resetTime: number,
    context?: Record<string, any>
  ) {
    super(message, 'RATE_LIMIT_ERROR', context);
    this.limit = limit;
    this.window = window;
    this.resetTime = resetTime;
  }
}

/**
 * Database-related errors
 */
export class DatabaseError extends TradingBotError {
  constructor(
    message: string,
    public readonly query?: string,
    public readonly params?: any[],
    context?: Record<string, any>
  ) {
    super(message, 'DATABASE_ERROR', context);
    this.query = query;
    this.params = params;
  }
}

/**
 * Configuration errors
 */
export class ConfigurationError extends TradingBotError {
  constructor(
    message: string,
    public readonly configKey?: string,
    public readonly configValue?: any,
    context?: Record<string, any>
  ) {
    super(message, 'CONFIGURATION_ERROR', context);
    this.configKey = configKey;
    this.configValue = configValue;
  }
}

/**
 * Validation errors
 */
export class ValidationError extends TradingBotError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: any,
    public readonly validationRule?: string,
    context?: Record<string, any>
  ) {
    super(message, 'VALIDATION_ERROR', context);
    this.field = field;
    this.value = value;
    this.validationRule = validationRule;
  }
}

/**
 * Trading-specific errors
 */
export class TradingError extends TradingBotError {
  constructor(
    message: string,
    public readonly symbol?: string,
    public readonly orderType?: string,
    public readonly side?: string,
    context?: Record<string, any>
  ) {
    super(message, 'TRADING_ERROR', context);
    this.symbol = symbol;
    this.orderType = orderType;
    this.side = side;
  }
}

/**
 * Portfolio-related errors
 */
export class PortfolioError extends TradingBotError {
  constructor(
    message: string,
    public readonly portfolioId?: string,
    public readonly operation?: string,
    context?: Record<string, any>
  ) {
    super(message, 'PORTFOLIO_ERROR', context);
    this.portfolioId = portfolioId;
    this.operation = operation;
  }
}

/**
 * WebSocket-related errors
 */
export class WebSocketError extends TradingBotError {
  constructor(
    message: string,
    public readonly connectionId?: string,
    public readonly event?: string,
    context?: Record<string, any>
  ) {
    super(message, 'WEBSOCKET_ERROR', context);
    this.connectionId = connectionId;
    this.event = event;
  }
}

/**
 * Redis-related errors
 */
export class RedisError extends TradingBotError {
  constructor(
    message: string,
    public readonly operation?: string,
    public readonly key?: string,
    context?: Record<string, any>
  ) {
    super(message, 'REDIS_ERROR', context);
    this.operation = operation;
    this.key = key;
  }
}

/**
 * Authentication and authorization errors
 */
export class AuthError extends TradingBotError {
  constructor(
    message: string,
    public readonly authType?: string,
    public readonly userId?: string,
    context?: Record<string, any>
  ) {
    super(message, 'AUTH_ERROR', context);
    this.authType = authType;
    this.userId = userId;
  }
}

/**
 * Network and connectivity errors
 */
export class NetworkError extends TradingBotError {
  constructor(
    message: string,
    public readonly url?: string,
    public readonly method?: string,
    public readonly timeout?: number,
    context?: Record<string, any>
  ) {
    super(message, 'NETWORK_ERROR', context);
    this.url = url;
    this.method = method;
    this.timeout = timeout;
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends TradingBotError {
  constructor(
    message: string,
    public readonly operation?: string,
    public readonly timeoutMs?: number,
    context?: Record<string, any>
  ) {
    super(message, 'TIMEOUT_ERROR', context);
    this.operation = operation;
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Circuit breaker errors
 */
export class CircuitBreakerError extends TradingBotError {
  constructor(
    message: string,
    public readonly service?: string,
    public readonly failureCount?: number,
    public readonly threshold?: number,
    context?: Record<string, any>
  ) {
    super(message, 'CIRCUIT_BREAKER_ERROR', context);
    this.service = service;
    this.failureCount = failureCount;
    this.threshold = threshold;
  }
}
