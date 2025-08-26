import winston from 'winston';
import path from 'path';
import ConfigManager from '@/core/ConfigManager';

class Logger {
  private static instance: Logger;
  private logger: winston.Logger;
  private config = ConfigManager.getInstance();

  private constructor() {
    const logConfig = this.config.loggingConfig;
    
    // Define log format
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    // Define console format for development
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
          log += ` ${JSON.stringify(meta)}`;
        }
        return log;
      })
    );

    // Create transports
    const transports: winston.transport[] = [
      // File transport for all logs
      new winston.transports.File({
        filename: path.join('logs', `trading-${new Date().toISOString().split('T')[0]}.log`),
        maxsize: logConfig.maxFileSize,
        maxFiles: logConfig.maxFiles,
        format: logFormat
      }),
      
      // File transport for errors only
      new winston.transports.File({
        filename: path.join('logs', `error-${new Date().toISOString().split('T')[0]}.log`),
        level: 'error',
        maxsize: logConfig.maxFileSize,
        maxFiles: logConfig.maxFiles,
        format: logFormat
      })
    ];

    // Add console transport for development
    if (this.config.isDevelopment) {
      transports.push(
        new winston.transports.Console({
          format: consoleFormat
        })
      );
    }

    // Create logger instance
    this.logger = winston.createLogger({
      level: logConfig.level,
      format: logFormat,
      transports,
      exitOnError: false
    });

    // Handle uncaught exceptions
    this.logger.exceptions.handle(
      new winston.transports.File({
        filename: path.join('logs', 'exceptions.log'),
        format: logFormat
      })
    );

    // Handle unhandled promise rejections
    this.logger.rejections.handle(
      new winston.transports.File({
        filename: path.join('logs', 'rejections.log'),
        format: logFormat
      })
    );
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Generic logging methods
  public info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, meta);
  }

  public warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, meta);
  }

  public error(message: string, meta?: Record<string, any>): void {
    this.logger.error(message, meta);
  }

  public debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, meta);
  }

  // Specialized logging methods
  public logTrade(trade: any): void {
    this.info('Trade executed', {
      type: 'TRADE',
      tradeId: trade.id,
      symbol: trade.symbol,
      side: trade.side,
      quantity: trade.quantity,
      price: trade.price,
      timestamp: trade.timestamp,
      status: trade.status
    });
  }

  public logAIAnalysis(analysis: any): void {
    this.info('AI Analysis completed', {
      type: 'AI_ANALYSIS',
      symbol: analysis.symbol,
      sentimentScore: analysis.sentimentScore,
      confidence: analysis.confidence,
      timestamp: analysis.timestamp
    });
  }

  public logTechnicalAnalysis(analysis: any): void {
    this.info('Technical Analysis completed', {
      type: 'TECHNICAL_ANALYSIS',
      symbol: analysis.symbol,
      trend: analysis.trend,
      strength: analysis.strength,
      timestamp: analysis.timestamp
    });
  }

  public logPortfolioUpdate(portfolio: any): void {
    this.info('Portfolio updated', {
      type: 'PORTFOLIO_UPDATE',
      portfolioId: portfolio.id,
      totalValue: portfolio.totalValue,
      pnl: portfolio.pnl,
      timestamp: new Date()
    });
  }

  public logApiRequest(method: string, url: string, statusCode: number, duration: number): void {
    if (this.config.loggingConfig.logApiRequests) {
      this.info('API Request', {
        type: 'API_REQUEST',
        method,
        url,
        statusCode,
        duration: `${duration}ms`
      });
    }
  }

  public logWebSocketEvent(event: string, data: any): void {
    if (this.config.loggingConfig.logWebSocketEvents) {
      this.debug('WebSocket Event', {
        type: 'WEBSOCKET_EVENT',
        event,
        data
      });
    }
  }

  public logRateLimitWarning(endpoint: string, limit: number, window: number): void {
    this.warn('Rate limit warning', {
      type: 'RATE_LIMIT_WARNING',
      endpoint,
      limit,
      window
    });
  }

  public logError(error: Error, context: string): void {
    this.error('Error occurred', {
      type: 'ERROR',
      context,
      message: error.message,
      stack: error.stack,
      timestamp: new Date()
    });
  }

  public logSystemEvent(event: string, data: any): void {
    this.info('System event', {
      type: 'SYSTEM_EVENT',
      event,
      data,
      timestamp: new Date()
    });
  }

  // Get the underlying winston logger for advanced usage
  public getWinstonLogger(): winston.Logger {
    return this.logger;
  }
}

export default Logger;
