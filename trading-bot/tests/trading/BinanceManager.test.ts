import { BinanceManager } from '@/trading/BinanceManager';
import Logger from '@/logging/Logger';
import ConfigManager from '@/core/ConfigManager';
import RateLimiter from '@/utils/RateLimiter';
import { WebSocketManager } from '@/utils/WebSocketManager';
import CryptoUtils from '@/utils/CryptoUtils';
import { ErrorRecovery } from '@/utils/errors/ErrorRecovery';

// Mock dependencies
jest.mock('binance-api-node');
jest.mock('@/logging/Logger');
jest.mock('@/core/ConfigManager');
jest.mock('@/utils/RateLimiter');
jest.mock('@/utils/WebSocketManager');
jest.mock('@/utils/CryptoUtils');
jest.mock('@/utils/errors/ErrorRecovery');

describe('BinanceManager', () => {
  let binanceManager: BinanceManager;
  let mockClient: any;
  let mockLogger: jest.Mocked<Logger>;
  let mockConfig: jest.Mocked<ConfigManager>;
  let mockRateLimiter: jest.Mocked<RateLimiter>;
  let mockWsManager: jest.Mocked<WebSocketManager>;
  let mockCryptoUtils: jest.Mocked<CryptoUtils>;
  let mockErrorRecovery: jest.Mocked<ErrorRecovery>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset singleton instance
    (BinanceManager as any).instance = undefined;

    // Setup mock implementations
    mockClient = {
      time: jest.fn(),
      exchangeInfo: jest.fn(),
      accountInfo: jest.fn(),
      dailyStats: jest.fn(),
      candles: jest.fn(),
      order: jest.fn(),
      cancelOrder: jest.fn(),
      getOrder: jest.fn(),
      openOrders: jest.fn(),
      allOrders: jest.fn(),
      trades: jest.fn(),
      depth: jest.fn(),
      ping: jest.fn(),
      ws: {
        userDataStream: jest.fn(),
        userDataStreamKeepAlive: jest.fn(),
        userDataStreamClose: jest.fn()
      }
    };

    // Mock Binance constructor
    const mockBinance = jest.fn(() => mockClient);
    require('binance-api-node').default = mockBinance;

    // Setup other mocks
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      getInstance: jest.fn().mockReturnThis()
    } as any;

    mockConfig = {
      binanceConfig: {
        apiKey: 'test-api-key',
        secretKey: 'test-secret-key',
        testnet: true,
        recvWindow: 60000,
        useServerTime: true
      },
      getInstance: jest.fn().mockReturnThis()
    } as any;

    mockRateLimiter = {
      getDefaultConfigs: jest.fn().mockReturnValue({
        restApi: { limit: 1200, window: 60000, keyPrefix: 'binance_rest' }
      }),
      checkLimit: jest.fn().mockResolvedValue({ allowed: true, remaining: 1199, resetTime: Date.now() + 60000 }),
      getInstance: jest.fn().mockReturnThis()
    } as any;

    mockWsManager = {
      createConnection: jest.fn(),
      closeConnection: jest.fn(),
      closeAllConnections: jest.fn(),
      getInstance: jest.fn().mockReturnThis()
    } as any;

    mockCryptoUtils = {
      generateClientOrderId: jest.fn().mockReturnValue('test-client-order-id'),
      getInstance: jest.fn().mockReturnThis()
    } as any;

    mockErrorRecovery = {
      retryWithBackoff: jest.fn().mockImplementation((fn) => fn()),
      getDefaultRetryConfig: jest.fn().mockReturnValue({ maxRetries: 3, baseDelay: 1000 }),
      handleAPIError: jest.fn(),
      getInstance: jest.fn().mockReturnThis()
    } as any;

    // Apply mocks
    (Logger.getInstance as jest.Mock).mockReturnValue(mockLogger);
    (ConfigManager.getInstance as jest.Mock).mockReturnValue(mockConfig);
    (RateLimiter.getInstance as jest.Mock).mockReturnValue(mockRateLimiter);
    (WebSocketManager.getInstance as jest.Mock).mockReturnValue(mockWsManager);
    (CryptoUtils.getInstance as jest.Mock).mockReturnValue(mockCryptoUtils);
    (ErrorRecovery.getInstance as jest.Mock).mockReturnValue(mockErrorRecovery);

    // Create instance
    binanceManager = BinanceManager.getInstance();
  });

  afterEach(() => {
    // Cleanup
    if (binanceManager) {
      binanceManager.cleanup();
    }
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = BinanceManager.getInstance();
      const instance2 = BinanceManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Binance client initialized',
        expect.objectContaining({
          type: 'BINANCE_CLIENT_INITIALIZED',
          testnet: true,
          recvWindow: 60000,
          useServerTime: true
        })
      );
    });

    it('should sync server time when enabled', async () => {
      mockClient.time.mockResolvedValue({ serverTime: Date.now() });
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockClient.time).toHaveBeenCalled();
    });

    it('should handle initialization errors', () => {
      // Reset instance to test error handling
      (BinanceManager as any).instance = undefined;
      
      const mockBinance = jest.fn(() => {
        throw new Error('Initialization failed');
      });
      require('binance-api-node').default = mockBinance;

      expect(() => BinanceManager.getInstance()).toThrow();
    });
  });

  describe('API Methods', () => {
    beforeEach(() => {
      // Setup successful API responses
      mockClient.exchangeInfo.mockResolvedValue({
        symbols: [
          {
            symbol: 'BTCUSDT',
            status: 'TRADING',
            baseAsset: 'BTC',
            quoteAsset: 'USDT'
          }
        ]
      });

      mockClient.accountInfo.mockResolvedValue({
        makerCommission: 15,
        takerCommission: 15,
        canTrade: true,
        balances: [
          { asset: 'BTC', free: '1.0', locked: '0.0' },
          { asset: 'USDT', free: '1000.0', locked: '0.0' }
        ]
      });

      mockClient.dailyStats.mockResolvedValue({
        symbol: 'BTCUSDT',
        lastPrice: '50000.00',
        priceChange: '1000.00',
        priceChangePercent: '2.00',
        volume: '1000.0',
        highPrice: '51000.00',
        lowPrice: '49000.00'
      });

      mockClient.candles.mockResolvedValue([
        {
          openTime: Date.now(),
          open: '50000.00',
          high: '51000.00',
          low: '49000.00',
          close: '50500.00',
          volume: '100.0',
          closeTime: Date.now() + 3600000
        }
      ]);
    });

    describe('getExchangeInfo', () => {
      it('should return exchange information', async () => {
        const result = await binanceManager.getExchangeInfo();
        
        expect(result).toHaveProperty('symbols');
        expect(result.symbols).toHaveLength(1);
        expect(result.symbols?.[0]?.symbol).toBe('BTCUSDT');
        expect(mockClient.exchangeInfo).toHaveBeenCalled();
      });
    });

    describe('getSymbolInfo', () => {
      it('should return symbol information', async () => {
        const result = await binanceManager.getSymbolInfo('BTCUSDT');
        
        expect(result).toBeDefined();
        expect(result?.symbol).toBe('BTCUSDT');
        expect(result?.status).toBe('TRADING');
      });

      it('should return null for non-existent symbol', async () => {
        const result = await binanceManager.getSymbolInfo('INVALID');
        
        expect(result).toBeNull();
      });
    });

    describe('getAccountInfo', () => {
      it('should return account information', async () => {
        const result = await binanceManager.getAccountInfo();
        
        expect(result).toHaveProperty('makerCommission');
        expect(result).toHaveProperty('takerCommission');
        expect(result).toHaveProperty('canTrade');
        expect(result).toHaveProperty('balances');
        expect(result.balances).toHaveLength(2);
        expect(mockClient.accountInfo).toHaveBeenCalled();
      });
    });

    describe('getBalance', () => {
      it('should return balance for specific asset', async () => {
        const result = await binanceManager.getBalance('BTC');
        
        expect(result).toBeDefined();
        expect(result?.free).toBe('1.0');
        expect(result?.locked).toBe('0.0');
      });

      it('should return null for non-existent asset', async () => {
        const result = await binanceManager.getBalance('INVALID');
        
        expect(result).toBeNull();
      });
    });

    describe('getTicker24hr', () => {
      it('should return ticker for specific symbol', async () => {
        const result = await binanceManager.getTicker24hr('BTCUSDT');
        
        expect(result).toHaveProperty('symbol', 'BTCUSDT');
        expect(result).toHaveProperty('lastPrice', '50000.00');
        expect(mockClient.dailyStats).toHaveBeenCalledWith({ symbol: 'BTCUSDT' });
      });

      it('should return all tickers when no symbol provided', async () => {
        const result = await binanceManager.getTicker24hr();
        
        expect(result).toBeDefined();
        expect(mockClient.dailyStats).toHaveBeenCalledWith();
      });
    });

    describe('getKlines', () => {
      it('should return kline data', async () => {
        const result = await binanceManager.getKlines('BTCUSDT', '1h', 100);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('open', '50000.00');
        expect(result[0]).toHaveProperty('close', '50500.00');
        expect(mockClient.candles).toHaveBeenCalledWith({
          symbol: 'BTCUSDT',
          interval: '1h',
          limit: 100
        });
      });

      it('should include start and end time when provided', async () => {
        const startTime = Date.now() - 86400000; // 24 hours ago
        const endTime = Date.now();
        
        await binanceManager.getKlines('BTCUSDT', '1h', 100, startTime, endTime);
        
        expect(mockClient.candles).toHaveBeenCalledWith({
          symbol: 'BTCUSDT',
          interval: '1h',
          limit: 100,
          startTime,
          endTime
        });
      });
    });
  });

  describe('Order Management', () => {
    beforeEach(() => {
      mockClient.order.mockResolvedValue({
        symbol: 'BTCUSDT',
        orderId: 12345,
        clientOrderId: 'test-client-order-id',
        transactTime: Date.now(),
        price: '50000.00',
        origQty: '0.001',
        executedQty: '0.001',
        status: 'FILLED',
        side: 'BUY',
        type: 'MARKET'
      });

      mockClient.cancelOrder.mockResolvedValue({
        symbol: 'BTCUSDT',
        orderId: 12345,
        status: 'CANCELED'
      });

      mockClient.getOrder.mockResolvedValue({
        symbol: 'BTCUSDT',
        orderId: 12345,
        status: 'FILLED'
      });

      mockClient.openOrders.mockResolvedValue([]);
      mockClient.allOrders.mockResolvedValue([]);
    });

    describe('placeOrder', () => {
      it('should place a market order', async () => {
        const orderRequest = {
          symbol: 'BTCUSDT',
          side: 'BUY' as const,
          type: 'MARKET' as const,
          quantity: 0.001
        };

        const result = await binanceManager.placeOrder(orderRequest);
        
        expect(result).toHaveProperty('symbol', 'BTCUSDT');
        expect(result).toHaveProperty('orderId', 12345);
        expect(result).toHaveProperty('status', 'FILLED');
        expect(mockClient.order).toHaveBeenCalledWith(
          expect.objectContaining({
            symbol: 'BTCUSDT',
            side: 'BUY',
            type: 'MARKET',
            quantity: 0.001,
            newClientOrderId: 'test-client-order-id'
          })
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Placing order',
          expect.objectContaining({
            type: 'BINANCE_ORDER_PLACE',
            symbol: 'BTCUSDT',
            side: 'BUY'
          })
        );
      });

      it('should place a limit order', async () => {
        const orderRequest = {
          symbol: 'BTCUSDT',
          side: 'SELL' as const,
          type: 'LIMIT' as const,
          quantity: 0.001,
          price: 51000,
          timeInForce: 'GTC' as const
        };

        await binanceManager.placeOrder(orderRequest);
        
        expect(mockClient.order).toHaveBeenCalledWith(
          expect.objectContaining({
            symbol: 'BTCUSDT',
            side: 'SELL',
            type: 'LIMIT',
            quantity: 0.001,
            price: 51000,
            timeInForce: 'GTC'
          })
        );
      });
    });

    describe('cancelOrder', () => {
      it('should cancel order by order ID', async () => {
        const result = await binanceManager.cancelOrder('BTCUSDT', 12345);
        
        expect(result).toHaveProperty('status', 'CANCELED');
        expect(mockClient.cancelOrder).toHaveBeenCalledWith({
          symbol: 'BTCUSDT',
          orderId: 12345
        });
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Canceling order',
          expect.objectContaining({
            type: 'BINANCE_ORDER_CANCEL',
            symbol: 'BTCUSDT',
            orderId: 12345
          })
        );
      });

      it('should cancel order by client order ID', async () => {
        await binanceManager.cancelOrder('BTCUSDT', undefined, 'test-client-id');
        
        expect(mockClient.cancelOrder).toHaveBeenCalledWith({
          symbol: 'BTCUSDT',
          origClientOrderId: 'test-client-id'
        });
      });
    });

    describe('getOrder', () => {
      it('should get order by order ID', async () => {
        const result = await binanceManager.getOrder('BTCUSDT', 12345);
        
        expect(result).toHaveProperty('status', 'FILLED');
        expect(mockClient.getOrder).toHaveBeenCalledWith({
          symbol: 'BTCUSDT',
          orderId: 12345
        });
      });
    });

    describe('getOpenOrders', () => {
      it('should get open orders for symbol', async () => {
        const result = await binanceManager.getOpenOrders('BTCUSDT');
        
        expect(Array.isArray(result)).toBe(true);
        expect(mockClient.openOrders).toHaveBeenCalledWith({ symbol: 'BTCUSDT' });
      });

      it('should get all open orders when no symbol provided', async () => {
        await binanceManager.getOpenOrders();
        
        expect(mockClient.openOrders).toHaveBeenCalledWith({});
      });
    });

    describe('getAllOrders', () => {
      it('should get all orders for symbol', async () => {
        const result = await binanceManager.getAllOrders('BTCUSDT');
        
        expect(Array.isArray(result)).toBe(true);
        expect(mockClient.allOrders).toHaveBeenCalledWith({
          symbol: 'BTCUSDT',
          limit: 500
        });
      });
    });
  });

  describe('Market Data', () => {
    beforeEach(() => {
      mockClient.trades.mockResolvedValue([
        {
          id: 1,
          price: '50000.00',
          qty: '0.001',
          time: Date.now()
        }
      ]);

      mockClient.depth.mockResolvedValue({
        lastUpdateId: 12345,
        bids: [['50000.00', '1.0']],
        asks: [['50001.00', '1.0']]
      });
    });

    describe('getRecentTrades', () => {
      it('should return recent trades', async () => {
        const result = await binanceManager.getRecentTrades('BTCUSDT', 100);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toHaveProperty('price', '50000.00');
        expect(mockClient.trades).toHaveBeenCalledWith({
          symbol: 'BTCUSDT',
          limit: 100
        });
      });
    });

    describe('getOrderBook', () => {
      it('should return order book', async () => {
        const result = await binanceManager.getOrderBook('BTCUSDT', 100);
        
        expect(result).toHaveProperty('bids');
        expect(result).toHaveProperty('asks');
        expect(mockClient.depth).toHaveBeenCalledWith({
          symbol: 'BTCUSDT',
          limit: 100
        });
      });
    });
  });

  describe('User Data Stream', () => {
    beforeEach(() => {
      mockClient.ws.userDataStream.mockResolvedValue({
        listenKey: 'test-listen-key'
      });
      mockClient.ws.userDataStreamKeepAlive.mockResolvedValue({});
      mockClient.ws.userDataStreamClose.mockResolvedValue({});
    });

    describe('createUserDataStream', () => {
      it('should create user data stream', async () => {
        const result = await binanceManager.createUserDataStream();
        
        expect(result).toBe('test-listen-key');
        expect(mockClient.ws.userDataStream).toHaveBeenCalled();
        expect(mockLogger.info).toHaveBeenCalledWith(
          'User data stream created',
          expect.objectContaining({
            type: 'BINANCE_USER_DATA_STREAM_CREATED',
            listenKey: 'test-listen-key'
          })
        );
      });

      it('should handle creation errors', async () => {
        mockClient.ws.userDataStream.mockRejectedValue(new Error('Stream creation failed'));
        
        await expect(binanceManager.createUserDataStream()).rejects.toThrow();
        expect(mockLogger.error).toHaveBeenCalled();
      });
    });

    describe('keepUserDataStreamAlive', () => {
      it('should keep stream alive', async () => {
        // First create a stream
        await binanceManager.createUserDataStream();
        
        // Then keep it alive
        await binanceManager.keepUserDataStreamAlive();
        
        expect(mockClient.ws.userDataStreamKeepAlive).toHaveBeenCalledWith('test-listen-key');
      });

      it('should throw error if no stream active', async () => {
        await expect(binanceManager.keepUserDataStreamAlive()).rejects.toThrow('No user data stream active');
      });
    });

    describe('closeUserDataStream', () => {
      it('should close stream', async () => {
        // First create a stream
        await binanceManager.createUserDataStream();
        
        // Then close it
        await binanceManager.closeUserDataStream();
        
        expect(mockClient.ws.userDataStreamClose).toHaveBeenCalledWith('test-listen-key');
        expect(mockLogger.info).toHaveBeenCalledWith(
          'User data stream closed',
          expect.objectContaining({
            type: 'BINANCE_USER_DATA_STREAM_CLOSED',
            listenKey: 'test-listen-key'
          })
        );
      });

      it('should handle close errors gracefully', async () => {
        mockClient.ws.userDataStreamClose.mockRejectedValue(new Error('Close failed'));
        
        // First create a stream
        await binanceManager.createUserDataStream();
        
        // Then close it (should not throw)
        await expect(binanceManager.closeUserDataStream()).resolves.toBeUndefined();
        expect(mockLogger.error).toHaveBeenCalled();
      });
    });
  });

  describe('WebSocket Management', () => {
    it('should create WebSocket connection', async () => {
      const streams = ['btcusdt@ticker', 'btcusdt@kline_1h'];
      const onMessage = jest.fn();
      const onError = jest.fn();
      
      const connectionId = await binanceManager.connectWebSocket(streams, onMessage, onError);
      
      expect(connectionId).toMatch(/^binance_\d+$/);
      expect(mockWsManager.createConnection).toHaveBeenCalledWith(
        connectionId,
        expect.objectContaining({
          url: 'wss://stream.binance.com:9443/ws/btcusdt@ticker/btcusdt@kline_1h'
        }),
        onMessage,
        onError,
        expect.any(Function)
      );
    });

    it('should disconnect WebSocket', async () => {
      const connectionId = 'test-connection';
      
      await binanceManager.disconnectWebSocket(connectionId);
      
      expect(mockWsManager.closeConnection).toHaveBeenCalledWith(connectionId);
    });
  });

  describe('Connection Management', () => {
    describe('testConnection', () => {
      it('should return true for successful connection', async () => {
        mockClient.ping.mockResolvedValue({});
        
        const result = await binanceManager.testConnection();
        
        expect(result).toBe(true);
        expect(mockClient.ping).toHaveBeenCalled();
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Binance connection test successful',
          expect.objectContaining({
            type: 'BINANCE_CONNECTION_TEST_SUCCESS'
          })
        );
      });

      it('should return false for failed connection', async () => {
        mockClient.ping.mockRejectedValue(new Error('Connection failed'));
        
        const result = await binanceManager.testConnection();
        
        expect(result).toBe(false);
        expect(mockLogger.error).toHaveBeenCalled();
      });
    });

    describe('getConnectionStatus', () => {
      it('should return connection status', () => {
        const status = binanceManager.getConnectionStatus();
        
        expect(status).toHaveProperty('isConnected');
        expect(status).toHaveProperty('serverTimeOffset');
        expect(status).toHaveProperty('userDataStreamActive');
        expect(status).toHaveProperty('reconnectAttempts');
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should check rate limits before API calls', async () => {
      await binanceManager.getExchangeInfo();
      
      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        'exchangeInfo',
        expect.objectContaining({
          limit: 1200,
          window: 60000,
          keyPrefix: 'binance_rest'
        })
      );
    });

    it('should throw RateLimitError when limit exceeded', async () => {
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000
      });
      
      await expect(binanceManager.getExchangeInfo()).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should use error recovery for API calls', async () => {
      mockClient.exchangeInfo.mockRejectedValue(new Error('API Error'));
      
      await expect(binanceManager.getExchangeInfo()).rejects.toThrow();
      
      expect(mockErrorRecovery.retryWithBackoff).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources', async () => {
      await binanceManager.cleanup();
      
      expect(mockWsManager.closeAllConnections).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'BinanceManager cleanup completed',
        expect.objectContaining({
          type: 'BINANCE_MANAGER_CLEANUP'
        })
      );
    });

    it('should handle cleanup errors gracefully', async () => {
      mockWsManager.closeAllConnections.mockRejectedValue(new Error('Cleanup failed'));
      
      await expect(binanceManager.cleanup()).resolves.toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
