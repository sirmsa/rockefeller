import dotenv from 'dotenv';
import { z } from 'zod';

/**
 * Configuration Manager for the AI Trading Bot
 * 
 * This class manages all application configuration including:
 * - Environment variables
 * - Binance API configuration
 * - Database settings
 * - Trading parameters
 * - AI analysis settings
 * - Risk management configuration
 * 
 * Uses Zod for strict validation of all configuration values.
 * Implements singleton pattern for global access.
 */
// Load environment variables
dotenv.config();

// Configuration schema validation
const ConfigSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  APP_NAME: z.string().default('TradingBot'),

  // Binance API Configuration
  BINANCE_API_KEY: z.string().min(1, 'Binance API key is required'),
  BINANCE_SECRET_KEY: z.string().min(1, 'Binance secret key is required'),
  BINANCE_TESTNET: z.string().transform((val: string) => val === 'true').default('false'),
  BINANCE_RECV_WINDOW: z.string().transform(Number).default('60000'),
  BINANCE_USE_SERVER_TIME: z.string().transform((val: string) => val === 'true').default('true'),

  // Session Storage Configuration
  SESSION_DIR: z.string().default('sessions'),
  SESSION_CLEANUP_INTERVAL: z.string().transform(Number).default('3600000'), // 1 hour

  // Trading Configuration
  MAX_POSITIONS_PER_PORTFOLIO: z.string().transform(Number).default('10'),
  DEFAULT_STOP_LOSS_PERCENTAGE: z.string().transform(Number).default('2.0'),
  DEFAULT_TAKE_PROFIT_PERCENTAGE: z.string().transform(Number).default('4.0'),
  MAX_SLIPPAGE_PERCENTAGE: z.string().transform(Number).default('0.5'),
  MIN_TRADE_AMOUNT: z.string().transform(Number).default('10.0'),
  DEFAULT_TIME_IN_FORCE: z.enum(['GTC', 'IOC', 'FOK']).default('GTC'),
  ENABLE_ICEBERG_ORDERS: z.string().transform((val: string) => val === 'true').default('false'),
  MAX_ALGO_ORDERS: z.string().transform(Number).default('5'),

  // AI Configuration
  SENTIMENT_POLLING_INTERVAL: z.string().transform(Number).default('600000'),
  CONFIDENCE_THRESHOLD: z.string().transform(Number).default('0.7'),
  SENTIMENT_WEIGHT: z.string().transform(Number).default('0.4'),
  TECHNICAL_WEIGHT: z.string().transform(Number).default('0.6'),

  // Risk Management
  MAX_PORTFOLIO_RISK: z.string().transform(Number).default('0.05'),
  MAX_SYMBOL_RISK: z.string().transform(Number).default('0.02'),
  CORRELATION_THRESHOLD: z.string().transform(Number).default('0.8'),
  CIRCUIT_BREAKER_THRESHOLD: z.string().transform(Number).default('0.1'),
  MAX_LEVERAGE: z.string().transform(Number).default('1'),
  MARGIN_TYPE: z.enum(['ISOLATED', 'CROSSED']).default('ISOLATED'),

  // API Rate Limiting
  REST_RATE_LIMIT: z.string().transform(Number).default('1200'),
  WEBSOCKET_RATE_LIMIT: z.string().transform(Number).default('5'),
  MAX_WEBSOCKET_CONNECTIONS: z.string().transform(Number).default('100'),
  HEARTBEAT_INTERVAL: z.string().transform(Number).default('30000'),
  RECONNECT_ATTEMPTS: z.string().transform(Number).default('5'),
  RECONNECT_DELAY: z.string().transform(Number).default('1000'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_MAX_FILE_SIZE: z.string().transform(Number).default('5242880'),
  LOG_MAX_FILES: z.string().transform(Number).default('5'),
  LOG_API_REQUESTS: z.string().transform((val: string) => val === 'true').default('true'),
  LOG_WEBSOCKET_EVENTS: z.string().transform((val: string) => val === 'true').default('true'),

  // Security
  JWT_SECRET: z.string().min(1, 'JWT secret is required'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  ENCRYPTION_KEY: z.string().min(1, 'Encryption key is required'),

  // External APIs
  NEWS_API_KEY: z.string().optional(),
  TWITTER_API_KEY: z.string().optional(),
  TWITTER_API_SECRET: z.string().optional(),
  TWITTER_ACCESS_TOKEN: z.string().optional(),
  TWITTER_ACCESS_TOKEN_SECRET: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Configuration Manager singleton class
 * 
 * Provides centralized configuration management with validation
 * and type-safe access to all application settings.
 */
class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    try {
      this.config = ConfigSchema.parse(process.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Configuration validation failed:');
        error.errors.forEach((err: z.ZodIssue) => {
          console.error(`- ${err.path.join('.')}: ${err.message}`);
        });
        // Don't exit in test mode
        if (process.env['NODE_ENV'] !== 'test') {
          process.exit(1);
        }
      }
      throw error;
    }
  }

  /**
   * Get the singleton instance of ConfigManager
   * 
   * @returns The singleton ConfigManager instance
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Get the complete configuration object
   * 
   * @returns The validated configuration object
   */
  public getConfig(): Config {
    return this.config;
  }

  /**
   * Convenience getters for environment detection
   */
  
  /**
   * Check if the application is running in development mode
   * 
   * @returns True if NODE_ENV is 'development'
   */
  public get isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  /**
   * Check if the application is running in production mode
   * 
   * @returns True if NODE_ENV is 'production'
   */
  public get isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  /**
   * Check if the application is running in test mode
   * 
   * @returns True if NODE_ENV is 'test'
   */
  public get isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  /**
   * Get Binance API configuration
   * 
   * @returns Object containing Binance API settings
   */
  public get binanceConfig() {
    return {
      apiKey: this.config.BINANCE_API_KEY,
      secretKey: this.config.BINANCE_SECRET_KEY,
      testnet: this.config.BINANCE_TESTNET,
      recvWindow: this.config.BINANCE_RECV_WINDOW,
      useServerTime: this.config.BINANCE_USE_SERVER_TIME,
    };
  }

  /**
   * Get session storage configuration
   * 
   * @returns Object containing session storage settings
   */
  public get sessionConfig() {
    return {
      sessionDir: this.config.SESSION_DIR,
      cleanupInterval: this.config.SESSION_CLEANUP_INTERVAL,
    };
  }

  public get tradingConfig() {
    return {
      maxPositionsPerPortfolio: this.config.MAX_POSITIONS_PER_PORTFOLIO,
      defaultStopLossPercentage: this.config.DEFAULT_STOP_LOSS_PERCENTAGE,
      defaultTakeProfitPercentage: this.config.DEFAULT_TAKE_PROFIT_PERCENTAGE,
      maxSlippagePercentage: this.config.MAX_SLIPPAGE_PERCENTAGE,
      minTradeAmount: this.config.MIN_TRADE_AMOUNT,
      defaultTimeInForce: this.config.DEFAULT_TIME_IN_FORCE,
      enableIcebergOrders: this.config.ENABLE_ICEBERG_ORDERS,
      maxAlgoOrders: this.config.MAX_ALGO_ORDERS,
    };
  }

  public get aiConfig() {
    return {
      sentimentPollingInterval: this.config.SENTIMENT_POLLING_INTERVAL,
      confidenceThreshold: this.config.CONFIDENCE_THRESHOLD,
      sentimentWeight: this.config.SENTIMENT_WEIGHT,
      technicalWeight: this.config.TECHNICAL_WEIGHT,
    };
  }

  public get riskConfig() {
    return {
      maxPortfolioRisk: this.config.MAX_PORTFOLIO_RISK,
      maxSymbolRisk: this.config.MAX_SYMBOL_RISK,
      correlationThreshold: this.config.CORRELATION_THRESHOLD,
      circuitBreakerThreshold: this.config.CIRCUIT_BREAKER_THRESHOLD,
      maxLeverage: this.config.MAX_LEVERAGE,
      marginType: this.config.MARGIN_TYPE,
    };
  }

  public get apiConfig() {
    return {
      restRateLimit: this.config.REST_RATE_LIMIT,
      websocketRateLimit: this.config.WEBSOCKET_RATE_LIMIT,
      maxWebSocketConnections: this.config.MAX_WEBSOCKET_CONNECTIONS,
      heartbeatInterval: this.config.HEARTBEAT_INTERVAL,
      reconnectAttempts: this.config.RECONNECT_ATTEMPTS,
      reconnectDelay: this.config.RECONNECT_DELAY,
    };
  }

  public get loggingConfig() {
    return {
      level: this.config.LOG_LEVEL,
      maxFileSize: this.config.LOG_MAX_FILE_SIZE,
      maxFiles: this.config.LOG_MAX_FILES,
      logApiRequests: this.config.LOG_API_REQUESTS,
      logWebSocketEvents: this.config.LOG_WEBSOCKET_EVENTS,
    };
  }

  public get securityConfig() {
    return {
      jwtSecret: this.config.JWT_SECRET,
      jwtExpiresIn: this.config.JWT_EXPIRES_IN,
      encryptionKey: this.config.ENCRYPTION_KEY,
    };
  }
}

export default ConfigManager;
