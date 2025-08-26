import ConfigManager from '@/core/ConfigManager';

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    // Reset environment variables for testing
    process.env['NODE_ENV'] = 'test';
    process.env['BINANCE_API_KEY'] = 'test_api_key';
    process.env['BINANCE_SECRET_KEY'] = 'test_secret_key';
    process.env['JWT_SECRET'] = 'test_jwt_secret';
    process.env['ENCRYPTION_KEY'] = 'test_encryption_key';
    
    // Get fresh instance
    configManager = ConfigManager.getInstance();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env['NODE_ENV'];
    delete process.env['BINANCE_API_KEY'];
    delete process.env['BINANCE_SECRET_KEY'];
    delete process.env['JWT_SECRET'];
    delete process.env['ENCRYPTION_KEY'];
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = ConfigManager.getInstance();
      const instance2 = ConfigManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('environment detection', () => {
    it('should detect test environment', () => {
      expect(configManager.isTest).toBe(true);
      expect(configManager.isDevelopment).toBe(false);
      expect(configManager.isProduction).toBe(false);
    });

    it('should detect development environment', () => {
      // Reset the singleton by clearing the instance
      (ConfigManager as any).instance = undefined;
      process.env['NODE_ENV'] = 'development';
      const devConfig = ConfigManager.getInstance();
      expect(devConfig.isDevelopment).toBe(true);
    });

    it('should detect production environment', () => {
      // Reset the singleton by clearing the instance
      (ConfigManager as any).instance = undefined;
      process.env['NODE_ENV'] = 'production';
      const prodConfig = ConfigManager.getInstance();
      expect(prodConfig.isProduction).toBe(true);
    });
  });

  describe('configuration getters', () => {
    it('should return binance configuration', () => {
      const binanceConfig = configManager.binanceConfig;
      expect(binanceConfig.apiKey).toBe('test_api_key');
      expect(binanceConfig.secretKey).toBe('test_secret_key');
      expect(binanceConfig.testnet).toBe(false);
      expect(binanceConfig.recvWindow).toBe(60000);
      expect(binanceConfig.useServerTime).toBe(true);
    });

    it('should return session configuration', () => {
      const sessionConfig = configManager.sessionConfig;
      expect(sessionConfig.sessionDir).toBe('sessions');
      expect(sessionConfig.cleanupInterval).toBe(3600000);
    });

    it('should return trading configuration', () => {
      const tradingConfig = configManager.tradingConfig;
      expect(tradingConfig.maxPositionsPerPortfolio).toBe(10);
      expect(tradingConfig.defaultStopLossPercentage).toBe(2.0);
      expect(tradingConfig.defaultTakeProfitPercentage).toBe(4.0);
      expect(tradingConfig.maxSlippagePercentage).toBe(0.5);
      expect(tradingConfig.minTradeAmount).toBe(10.0);
      expect(tradingConfig.defaultTimeInForce).toBe('GTC');
    });

    it('should return AI configuration', () => {
      const aiConfig = configManager.aiConfig;
      expect(aiConfig.sentimentPollingInterval).toBe(600000);
      expect(aiConfig.confidenceThreshold).toBe(0.7);
      expect(aiConfig.sentimentWeight).toBe(0.4);
      expect(aiConfig.technicalWeight).toBe(0.6);
    });

    it('should return risk configuration', () => {
      const riskConfig = configManager.riskConfig;
      expect(riskConfig.maxPortfolioRisk).toBe(0.05);
      expect(riskConfig.maxSymbolRisk).toBe(0.02);
      expect(riskConfig.correlationThreshold).toBe(0.8);
      expect(riskConfig.circuitBreakerThreshold).toBe(0.1);
      expect(riskConfig.maxLeverage).toBe(1);
      expect(riskConfig.marginType).toBe('ISOLATED');
    });

    it('should return API configuration', () => {
      const apiConfig = configManager.apiConfig;
      expect(apiConfig.restRateLimit).toBe(1200);
      expect(apiConfig.websocketRateLimit).toBe(5);
      expect(apiConfig.maxWebSocketConnections).toBe(100);
      expect(apiConfig.heartbeatInterval).toBe(30000);
      expect(apiConfig.reconnectAttempts).toBe(5);
      expect(apiConfig.reconnectDelay).toBe(1000);
    });

    it('should return logging configuration', () => {
      const loggingConfig = configManager.loggingConfig;
      expect(loggingConfig.level).toBe('info');
      expect(loggingConfig.maxFileSize).toBe(5242880);
      expect(loggingConfig.maxFiles).toBe(5);
      expect(loggingConfig.logApiRequests).toBe(true);
      expect(loggingConfig.logWebSocketEvents).toBe(true);
    });

    it('should return security configuration', () => {
      const securityConfig = configManager.securityConfig;
      expect(securityConfig.jwtSecret).toBe('test_jwt_secret');
      expect(securityConfig.jwtExpiresIn).toBe('24h');
      expect(securityConfig.encryptionKey).toBe('test_encryption_key');
    });
  });

  describe('validation', () => {
    it('should throw error for missing required fields', () => {
      // Reset the singleton by clearing the instance
      (ConfigManager as any).instance = undefined;
      delete process.env['BINANCE_API_KEY'];
      delete process.env['BINANCE_SECRET_KEY'];
      delete process.env['JWT_SECRET'];
      delete process.env['ENCRYPTION_KEY'];

      expect(() => {
        ConfigManager.getInstance();
      }).toThrow();
    });

    it('should use default values for optional fields', () => {
      const config = configManager.getConfig();
      expect(config.PORT).toBe(3000);
      expect(config.APP_NAME).toBe('TradingBot');
      expect(config.SESSION_DIR).toBe('sessions');
      expect(config.SESSION_CLEANUP_INTERVAL).toBe(3600000);
    });
  });
});
