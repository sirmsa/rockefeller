import { SymbolHandler, SymbolData, TechnicalIndicators, SymbolAnalysis } from '@/trading/SymbolHandler';
import { BinanceManager } from '@/trading/BinanceManager';
import Logger from '@/logging/Logger';
import ConfigManager from '@/core/ConfigManager';
import { SessionManager } from '@/utils/SessionManager';
import { ValidationUtils } from '@/utils/ValidationUtils';
import { ValidationError } from '@/utils/errors/CustomErrors';

// Mock dependencies
jest.mock('@/trading/BinanceManager');
jest.mock('@/logging/Logger');
jest.mock('@/core/ConfigManager');
jest.mock('@/utils/SessionManager');
jest.mock('@/utils/ValidationUtils');

describe('SymbolHandler', () => {
  let symbolHandler: SymbolHandler;
  let mockBinanceManager: jest.Mocked<BinanceManager>;
  let mockLogger: jest.Mocked<Logger>;
  let mockConfig: jest.Mocked<ConfigManager>;
  let mockSessionManager: jest.Mocked<SessionManager>;
  let mockValidationUtils: jest.Mocked<typeof ValidationUtils>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset singleton instance
    (SymbolHandler as any).instance = undefined;

    // Setup mock implementations
    mockBinanceManager = {
      getSymbolInfo: jest.fn(),
      getTicker24hr: jest.fn(),
      getKlines: jest.fn(),
      getInstance: jest.fn().mockReturnThis()
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      getInstance: jest.fn().mockReturnThis()
    } as any;

    mockConfig = {
      getInstance: jest.fn().mockReturnThis()
    } as any;

    mockSessionManager = {
      setCache: jest.fn(),
      getCache: jest.fn(),
      getInstance: jest.fn().mockReturnThis()
    } as any;

    mockValidationUtils = {
      validateSymbol: jest.fn().mockReturnValue({ isValid: true }),
      throwIfInvalid: jest.fn(),
      getInstance: jest.fn().mockReturnThis()
    } as any;

    // Apply mocks
    (BinanceManager.getInstance as jest.Mock).mockReturnValue(mockBinanceManager);
    (Logger.getInstance as jest.Mock).mockReturnValue(mockLogger);
    (ConfigManager.getInstance as jest.Mock).mockReturnValue(mockConfig);
    (SessionManager.getInstance as jest.Mock).mockReturnValue(mockSessionManager);
    (ValidationUtils.validateSymbol as any) = mockValidationUtils.validateSymbol;
    (ValidationUtils.throwIfInvalid as any) = mockValidationUtils.throwIfInvalid;

    // Create instance
    symbolHandler = SymbolHandler.getInstance();
  });

  afterEach(() => {
    // Cleanup
    if (symbolHandler) {
      symbolHandler.cleanup();
    }
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SymbolHandler.getInstance();
      const instance2 = SymbolHandler.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Symbol Initialization', () => {
    const mockSymbolInfo = {
      symbol: 'BTCUSDT',
      status: 'TRADING',
      baseAsset: 'BTC',
      baseAssetPrecision: 8,
      quoteAsset: 'USDT',
      quotePrecision: 8,
      quoteAssetPrecision: 8,
      orderTypes: ['LIMIT', 'MARKET'],
      icebergAllowed: true,
      ocoAllowed: true,
      isSpotTradingAllowed: true,
      isMarginTradingAllowed: false,
      filters: [],
      permissions: ['SPOT']
    };

    const mockTickerData = {
      symbol: 'BTCUSDT',
      lastPrice: '50000.00',
      priceChange: '1000.00',
      priceChangePercent: '2.00',
      volume: '1000.0',
      highPrice: '51000.00',
      lowPrice: '49000.00',
      weightedAvgPrice: '50000.00',
      prevClosePrice: '49000.00',
      lastQty: '0.001',
      bidPrice: '49999.00',
      bidQty: '1.0',
      askPrice: '50001.00',
      askQty: '1.0',
      openPrice: '49000.00',
      quoteVolume: '50000000.00',
      openTime: Date.now() - 86400000,
      closeTime: Date.now(),
      firstId: 1,
      lastId: 1000,
      count: 1000
    };

    beforeEach(() => {
      mockBinanceManager.getSymbolInfo.mockResolvedValue(mockSymbolInfo);
      mockBinanceManager.getTicker24hr.mockResolvedValue(mockTickerData);
    });

    it('should initialize symbol successfully', async () => {
      const result = await symbolHandler.initializeSymbol('BTCUSDT');

      expect(result).toMatchObject({
        symbol: 'BTCUSDT',
        info: mockSymbolInfo,
        currentPrice: 50000.00,
        priceChange24h: 1000.00,
        priceChangePercent24h: 2.00,
        volume24h: 1000.0,
        high24h: 51000.00,
        low24h: 49000.00
      });

      expect(mockBinanceManager.getSymbolInfo).toHaveBeenCalledWith('BTCUSDT');
      expect(mockBinanceManager.getTicker24hr).toHaveBeenCalledWith('BTCUSDT');
      expect(mockSessionManager.setCache).toHaveBeenCalledWith(
        'symbol_BTCUSDT',
        expect.any(Object),
        300000
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Symbol initialized',
        expect.objectContaining({
          type: 'SYMBOL_INITIALIZED',
          symbol: 'BTCUSDT',
          currentPrice: 50000.00,
          priceChangePercent: 2.00
        })
      );
    });

    it('should validate symbol before initialization', async () => {
      await symbolHandler.initializeSymbol('BTCUSDT');

      expect(mockValidationUtils.validateSymbol).toHaveBeenCalledWith('BTCUSDT');
      expect(mockValidationUtils.throwIfInvalid).toHaveBeenCalledWith(
        { isValid: true },
        'Symbol initialization'
      );
    });

    it('should throw error for invalid symbol', async () => {
      mockValidationUtils.validateSymbol.mockReturnValue({ isValid: false, errors: ['Invalid symbol'] as any });
      mockValidationUtils.throwIfInvalid.mockImplementation(() => {
        throw new ValidationError('Invalid symbol', 'symbol', 'INVALID', 'format');
      });

      await expect(symbolHandler.initializeSymbol('INVALID')).rejects.toThrow(ValidationError);
    });

    it('should throw error when symbol not found on Binance', async () => {
      mockBinanceManager.getSymbolInfo.mockResolvedValue(null);

      await expect(symbolHandler.initializeSymbol('INVALID')).rejects.toThrow(ValidationError);
    });

    it('should handle initialization errors', async () => {
      mockBinanceManager.getSymbolInfo.mockRejectedValue(new Error('API Error'));

      await expect(symbolHandler.initializeSymbol('BTCUSDT')).rejects.toThrow('API Error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to initialize symbol',
        expect.objectContaining({
          type: 'SYMBOL_INIT_ERROR',
          symbol: 'BTCUSDT'
        })
      );
    });
  });

  describe('Symbol Data Updates', () => {
    const mockSymbolData: SymbolData = {
      symbol: 'BTCUSDT',
      info: {
        symbol: 'BTCUSDT',
        status: 'TRADING',
        baseAsset: 'BTC',
        quoteAsset: 'USDT'
      } as any,
      currentPrice: 50000.00,
      priceChange24h: 1000.00,
      priceChangePercent24h: 2.00,
      volume24h: 1000.0,
      high24h: 51000.00,
      low24h: 49000.00,
      lastUpdated: new Date()
    };

    beforeEach(() => {
      // Mock cache access
      const symbolHandlerAny = symbolHandler as any;
      symbolHandlerAny.symbolCache.set('BTCUSDT', mockSymbolData);
      symbolHandlerAny.lastUpdate.set('BTCUSDT', Date.now());
    });

    it('should return cached data if recent', async () => {
      const result = await symbolHandler.updateSymbolData('BTCUSDT');

      expect(result).toEqual(mockSymbolData);
      expect(mockBinanceManager.getTicker24hr).not.toHaveBeenCalled();
    });

    it('should update data if cache is stale', async () => {
      // Make cache stale
      const symbolHandlerAny = symbolHandler as any;
      symbolHandlerAny.lastUpdate.set('BTCUSDT', Date.now() - 120000); // 2 minutes ago

      const newTickerData = {
        symbol: 'BTCUSDT',
        lastPrice: '51000.00',
        priceChange: '2000.00',
        priceChangePercent: '4.00',
        volume: '1200.0',
        highPrice: '52000.00',
        lowPrice: '50000.00',
        weightedAvgPrice: '51000.00',
        prevClosePrice: '50000.00',
        lastQty: '0.001',
        bidPrice: '50999.00',
        bidQty: '1.0',
        askPrice: '51001.00',
        askQty: '1.0',
        openPrice: '50000.00',
        quoteVolume: '61200000.00',
        openTime: Date.now() - 86400000,
        closeTime: Date.now(),
        firstId: 1,
        lastId: 1000,
        count: 1000
      };

      mockBinanceManager.getTicker24hr.mockResolvedValue(newTickerData);

      const result = await symbolHandler.updateSymbolData('BTCUSDT');

      expect(result.currentPrice).toBe(51000.00);
      expect(result.priceChangePercent24h).toBe(4.00);
      expect(mockBinanceManager.getTicker24hr).toHaveBeenCalledWith('BTCUSDT');
    });

    it('should handle update errors', async () => {
      const symbolHandlerAny = symbolHandler as any;
      symbolHandlerAny.lastUpdate.set('BTCUSDT', Date.now() - 120000);
      mockBinanceManager.getTicker24hr.mockRejectedValue(new Error('Update failed'));

      await expect(symbolHandler.updateSymbolData('BTCUSDT')).rejects.toThrow('Update failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to update symbol data',
        expect.objectContaining({
          type: 'SYMBOL_UPDATE_ERROR',
          symbol: 'BTCUSDT'
        })
      );
    });
  });

  describe('Symbol Data Retrieval', () => {
    it('should return cached data if available', async () => {
      const mockSymbolData: SymbolData = {
        symbol: 'BTCUSDT',
        info: {} as any,
        currentPrice: 50000.00,
        priceChange24h: 1000.00,
        priceChangePercent24h: 2.00,
        volume24h: 1000.0,
        high24h: 51000.00,
        low24h: 49000.00,
        lastUpdated: new Date()
      };

      const symbolHandlerAny = symbolHandler as any;
      symbolHandlerAny.symbolCache.set('BTCUSDT', mockSymbolData);

      const result = await symbolHandler.getSymbolData('BTCUSDT');

      expect(result).toEqual(mockSymbolData);
    });

    it('should return session cached data if available', async () => {
      const mockSymbolData: SymbolData = {
        symbol: 'BTCUSDT',
        info: {} as any,
        currentPrice: 50000.00,
        priceChange24h: 1000.00,
        priceChangePercent24h: 2.00,
        volume24h: 1000.0,
        high24h: 51000.00,
        low24h: 49000.00,
        lastUpdated: new Date()
      };

      mockSessionManager.getCache.mockReturnValue(mockSymbolData);

      const result = await symbolHandler.getSymbolData('BTCUSDT');

      expect(result).toEqual(mockSymbolData);
      expect(mockSessionManager.getCache).toHaveBeenCalledWith('symbol_BTCUSDT');
    });

    it('should initialize symbol if not found', async () => {
      mockBinanceManager.getSymbolInfo.mockResolvedValue({} as any);
      mockBinanceManager.getTicker24hr.mockResolvedValue({
        symbol: 'BTCUSDT',
        lastPrice: '50000.00',
        priceChange: '1000.00',
        priceChangePercent: '2.00',
        volume: '1000.0',
        highPrice: '51000.00',
        lowPrice: '49000.00',
        weightedAvgPrice: '50000.00',
        prevClosePrice: '49000.00',
        lastQty: '0.001',
        bidPrice: '49999.00',
        bidQty: '1.0',
        askPrice: '50001.00',
        askQty: '1.0',
        openPrice: '49000.00',
        quoteVolume: '50000000.00',
        openTime: Date.now() - 86400000,
        closeTime: Date.now(),
        firstId: 1,
        lastId: 1000,
        count: 1000
      });

      const result = await symbolHandler.getSymbolData('BTCUSDT');

      expect(result).toMatchObject({
        symbol: 'BTCUSDT',
        currentPrice: 50000.00
      });
    });
  });

  describe('Kline Data Retrieval', () => {
    const mockKlines = [
      {
        openTime: Date.now(),
        open: '50000.00',
        high: '51000.00',
        low: '49000.00',
        close: '50500.00',
        volume: '100.0',
        closeTime: Date.now() + 3600000,
        quoteAssetVolume: '5050000.00',
        numberOfTrades: 100,
        takerBuyBaseAssetVolume: '50.0',
        takerBuyQuoteAssetVolume: '2525000.00',
        ignore: '0'
      }
    ];

    beforeEach(() => {
      mockBinanceManager.getKlines.mockResolvedValue(mockKlines);
    });

    it('should retrieve kline data', async () => {
      const result = await symbolHandler.getKlineData('BTCUSDT', '1h', 100);

      expect(result).toEqual(mockKlines);
      expect(mockBinanceManager.getKlines).toHaveBeenCalledWith('BTCUSDT', '1h', 100);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Kline data retrieved',
        expect.objectContaining({
          type: 'KLINE_DATA_RETRIEVED',
          symbol: 'BTCUSDT',
          interval: '1h',
          limit: 100,
          count: 1
        })
      );
    });

    it('should handle kline data errors', async () => {
      mockBinanceManager.getKlines.mockRejectedValue(new Error('Kline error'));

      await expect(symbolHandler.getKlineData('BTCUSDT', '1h', 100)).rejects.toThrow('Kline error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to get kline data',
        expect.objectContaining({
          type: 'KLINE_DATA_ERROR',
          symbol: 'BTCUSDT',
          interval: '1h'
        })
      );
    });
  });

  describe('Technical Indicators', () => {
    const mockKlines = [
      { openTime: 1000, open: '50000.00', high: '51000.00', low: '49000.00', close: '50500.00', volume: '100.0', closeTime: 4600000, quoteAssetVolume: '5050000.00', numberOfTrades: 100, takerBuyBaseAssetVolume: '50.0', takerBuyQuoteAssetVolume: '2525000.00', ignore: '0' },
      { openTime: 4600000, open: '50500.00', high: '52000.00', low: '50000.00', close: '51500.00', volume: '120.0', closeTime: 8200000, quoteAssetVolume: '6180000.00', numberOfTrades: 120, takerBuyBaseAssetVolume: '60.0', takerBuyQuoteAssetVolume: '3090000.00', ignore: '0' },
      { openTime: 8200000, open: '51500.00', high: '53000.00', low: '51000.00', close: '52500.00', volume: '140.0', closeTime: 11800000, quoteAssetVolume: '7350000.00', numberOfTrades: 140, takerBuyBaseAssetVolume: '70.0', takerBuyQuoteAssetVolume: '3675000.00', ignore: '0' },
      // Add more klines to meet minimum requirement
      ...Array.from({ length: 50 }, (_, i) => ({
        openTime: 11800000 + (i * 3600000),
        open: (52500 + i * 100).toString(),
        high: (52500 + i * 200).toString(),
        low: (52500 + i * 50).toString(),
        close: (52500 + i * 150).toString(),
        volume: (140 + i * 10).toString(),
        closeTime: 11800000 + ((i + 1) * 3600000),
        quoteAssetVolume: ((52500 + i * 150) * (140 + i * 10)).toString(),
        numberOfTrades: 140 + i * 10,
        takerBuyBaseAssetVolume: ((140 + i * 10) / 2).toString(),
        takerBuyQuoteAssetVolume: ((52500 + i * 150) * (140 + i * 10) / 2).toString(),
        ignore: '0'
      }))
    ];

    it('should calculate technical indicators', () => {
      const currentPrice = 53000;
      const result = symbolHandler.calculateTechnicalIndicators(mockKlines, currentPrice);

      expect(result).toHaveProperty('rsi');
      expect(result).toHaveProperty('ma20');
      expect(result).toHaveProperty('ma50');
      expect(result).toHaveProperty('ema12');
      expect(result).toHaveProperty('ema26');
      expect(result).toHaveProperty('macd');
      expect(result).toHaveProperty('bollingerBands');
      expect(result).toHaveProperty('volume');
      expect(result).toHaveProperty('support');
      expect(result).toHaveProperty('resistance');
      expect(result).toHaveProperty('fibonacci');
      expect(result).toHaveProperty('trend');
      expect(result).toHaveProperty('strength');

      // Validate specific indicators
      expect(typeof result.rsi).toBe('number');
      expect(result.rsi).toBeGreaterThanOrEqual(0);
      expect(result.rsi).toBeLessThanOrEqual(100);

      expect(typeof result.ma20).toBe('number');
      expect(typeof result.ma50).toBe('number');
      expect(typeof result.ema12).toBe('number');
      expect(typeof result.ema26).toBe('number');

      expect(result.macd).toHaveProperty('macd');
      expect(result.macd).toHaveProperty('signal');
      expect(result.macd).toHaveProperty('histogram');

      expect(result.bollingerBands).toHaveProperty('upper');
      expect(result.bollingerBands).toHaveProperty('middle');
      expect(result.bollingerBands).toHaveProperty('lower');

      expect(result.volume).toHaveProperty('current');
      expect(result.volume).toHaveProperty('average');
      expect(result.volume).toHaveProperty('trend');

      expect(Array.isArray(result.support)).toBe(true);
      expect(Array.isArray(result.resistance)).toBe(true);

      expect(result.fibonacci).toHaveProperty('level0');
      expect(result.fibonacci).toHaveProperty('level236');
      expect(result.fibonacci).toHaveProperty('level382');
      expect(result.fibonacci).toHaveProperty('level500');
      expect(result.fibonacci).toHaveProperty('level618');
      expect(result.fibonacci).toHaveProperty('level786');
      expect(result.fibonacci).toHaveProperty('level100');

      expect(['bullish', 'bearish', 'neutral']).toContain(result.trend);
      expect(typeof result.strength).toBe('number');
      expect(result.strength).toBeGreaterThanOrEqual(0);
      expect(result.strength).toBeLessThanOrEqual(1);
    });

    it('should throw error for insufficient data', () => {
      const insufficientKlines = mockKlines.slice(0, 10); // Less than 50

      expect(() => {
        symbolHandler.calculateTechnicalIndicators(insufficientKlines, 53000);
      }).toThrow('Insufficient data for technical analysis (minimum 50 candles required)');
    });

    it('should calculate RSI correctly', () => {
      const prices = [100, 101, 102, 101, 100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 90];
      const symbolHandlerAny = symbolHandler as any;
      const rsi = symbolHandlerAny.calculateRSI(prices, 14);

      expect(typeof rsi).toBe('number');
      expect(rsi).toBeGreaterThanOrEqual(0);
      expect(rsi).toBeLessThanOrEqual(100);
    });

    it('should calculate moving averages correctly', () => {
      const prices = Array.from({ length: 50 }, (_, i) => 100 + i);
      const symbolHandlerAny = symbolHandler as any;
      
      const sma = symbolHandlerAny.calculateSMA(prices, 20);
      const ema = symbolHandlerAny.calculateEMA(prices, 20);

      expect(typeof sma).toBe('number');
      expect(typeof ema).toBe('number');
      expect(sma).toBeGreaterThan(0);
      expect(ema).toBeGreaterThan(0);
    });

    it('should calculate MACD correctly', () => {
      const prices = Array.from({ length: 50 }, (_, i) => 100 + i);
      const symbolHandlerAny = symbolHandler as any;
      const macd = symbolHandlerAny.calculateMACD(prices);

      expect(macd).toHaveProperty('macd');
      expect(macd).toHaveProperty('signal');
      expect(macd).toHaveProperty('histogram');
      expect(typeof macd.macd).toBe('number');
      expect(typeof macd.signal).toBe('number');
      expect(typeof macd.histogram).toBe('number');
    });

    it('should calculate Bollinger Bands correctly', () => {
      const prices = Array.from({ length: 50 }, (_, i) => 100 + i);
      const symbolHandlerAny = symbolHandler as any;
      const bb = symbolHandlerAny.calculateBollingerBands(prices, 20, 2);

      expect(bb).toHaveProperty('upper');
      expect(bb).toHaveProperty('middle');
      expect(bb).toHaveProperty('lower');
      expect(bb.upper).toBeGreaterThan(bb.middle);
      expect(bb.middle).toBeGreaterThan(bb.lower);
    });

    it('should analyze volume trends', () => {
      const volumes = Array.from({ length: 20 }, (_, i) => 100 + i * 5);
      const symbolHandlerAny = symbolHandler as any;
      const volume = symbolHandlerAny.analyzeVolume(volumes);

      expect(volume).toHaveProperty('current');
      expect(volume).toHaveProperty('average');
      expect(volume).toHaveProperty('trend');
      expect(['increasing', 'decreasing', 'stable']).toContain(volume.trend);
    });

    it('should calculate support and resistance levels', () => {
      const lows = [90, 91, 92, 93, 94, 95, 96, 97, 98, 99];
      const highs = [110, 111, 112, 113, 114, 115, 116, 117, 118, 119];
      const symbolHandlerAny = symbolHandler as any;
      
      const support = symbolHandlerAny.calculateSupportLevels(lows);
      const resistance = symbolHandlerAny.calculateResistanceLevels(highs);

      expect(Array.isArray(support)).toBe(true);
      expect(Array.isArray(resistance)).toBe(true);
      expect(support.length).toBeLessThanOrEqual(3);
      expect(resistance.length).toBeLessThanOrEqual(3);
    });

    it('should calculate Fibonacci retracements', () => {
      const high = 1000;
      const low = 800;
      const symbolHandlerAny = symbolHandler as any;
      const fib = symbolHandlerAny.calculateFibonacciRetracements(high, low);

      expect(fib).toHaveProperty('level0', high);
      expect(fib).toHaveProperty('level100', low);
      expect(fib.level236).toBeLessThan(fib.level0);
      expect(fib.level236).toBeGreaterThan(fib.level100);
    });

    it('should determine trend correctly', () => {
      const symbolHandlerAny = symbolHandler as any;
      
      // Bullish scenario
      const bullishTrend = symbolHandlerAny.determineTrend(105, 100, 95, 102, 98);
      expect(bullishTrend).toBe('bullish');

      // Bearish scenario
      const bearishTrend = symbolHandlerAny.determineTrend(95, 100, 105, 98, 102);
      expect(bearishTrend).toBe('bearish');

      // Neutral scenario
      const neutralTrend = symbolHandlerAny.determineTrend(100, 100, 100, 100, 100);
      expect(neutralTrend).toBe('neutral');
    });

    it('should calculate trend strength', () => {
      const symbolHandlerAny = symbolHandler as any;
      const strength = symbolHandlerAny.calculateTrendStrength(105, 100, 95, 60);

      expect(typeof strength).toBe('number');
      expect(strength).toBeGreaterThanOrEqual(0);
      expect(strength).toBeLessThanOrEqual(1);
    });
  });

  describe('Symbol Analysis', () => {
    const mockSymbolData: SymbolData = {
      symbol: 'BTCUSDT',
      info: {} as any,
      currentPrice: 50000.00,
      priceChange24h: 1000.00,
      priceChangePercent24h: 2.00,
      volume24h: 1000.0,
      high24h: 51000.00,
      low24h: 49000.00,
      lastUpdated: new Date()
    };

    const mockKlines = Array.from({ length: 100 }, (_, i) => ({
      openTime: Date.now() + (i * 3600000),
      open: (50000 + i * 10).toString(),
      high: (50000 + i * 20).toString(),
      low: (50000 + i * 5).toString(),
      close: (50000 + i * 15).toString(),
      volume: (1000 + i * 5).toString(),
      closeTime: Date.now() + ((i + 1) * 3600000),
      quoteAssetVolume: ((50000 + i * 15) * (1000 + i * 5)).toString(),
      numberOfTrades: 1000 + i * 5,
      takerBuyBaseAssetVolume: ((1000 + i * 5) / 2).toString(),
      takerBuyQuoteAssetVolume: ((50000 + i * 15) * (1000 + i * 5) / 2).toString(),
      ignore: '0'
    }));

    beforeEach(() => {
      // Mock dependencies
      const symbolHandlerAny = symbolHandler as any;
      symbolHandlerAny.symbolCache.set('BTCUSDT', mockSymbolData);
      symbolHandlerAny.lastUpdate.set('BTCUSDT', Date.now());

      mockBinanceManager.getKlines.mockResolvedValue(mockKlines);
    });

    it('should perform complete symbol analysis', async () => {
      const result = await symbolHandler.analyzeSymbol('BTCUSDT');

      expect(result).toMatchObject({
        symbol: 'BTCUSDT',
        data: mockSymbolData,
        technical: expect.any(Object),
        recommendation: expect.stringMatching(/^(buy|sell|hold)$/),
        reasoning: expect.any(String)
      });

      expect(result.technical).toHaveProperty('rsi');
      expect(result.technical).toHaveProperty('trend');
      expect(result.technical).toHaveProperty('strength');

      expect(mockSessionManager.setCache).toHaveBeenCalledWith(
        'analysis_BTCUSDT',
        expect.any(Object),
        300000
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Symbol analysis completed',
        expect.objectContaining({
          type: 'SYMBOL_ANALYSIS_COMPLETED',
          symbol: 'BTCUSDT',
          recommendation: expect.any(String)
        })
      );
    });

    it('should generate trading recommendations', () => {
      const symbolHandlerAny = symbolHandler as any;
      
      // Test bullish recommendation
      const bullishTechnical: TechnicalIndicators = {
        rsi: 25, // Oversold
        ma20: 49000,
        ma50: 48000,
        ema12: 49500,
        ema26: 48500,
        macd: { macd: 100, signal: 50, histogram: 50 },
        bollingerBands: { upper: 52000, middle: 50000, lower: 48000 },
        volume: { current: 1200, average: 1000, trend: 'increasing' as const },
        support: [48000, 47500, 47000],
        resistance: [52000, 52500, 53000],
        fibonacci: { level0: 52000, level236: 51000, level382: 50500, level500: 50000, level618: 49500, level786: 49000, level100: 48000 },
        trend: 'bullish' as const,
        strength: 0.8
      };

      const recommendation = symbolHandlerAny.generateRecommendation(bullishTechnical, mockSymbolData);
      expect(['buy', 'sell', 'hold']).toContain(recommendation);

      // Test reasoning generation
      const reasoning = symbolHandlerAny.generateReasoning(bullishTechnical, mockSymbolData);
      expect(typeof reasoning).toBe('string');
      expect(reasoning).toContain('Trend: bullish');
      expect(reasoning).toContain('RSI: 25.0');
    });

    it('should handle analysis errors', async () => {
      mockBinanceManager.getKlines.mockRejectedValue(new Error('Analysis failed'));

      await expect(symbolHandler.analyzeSymbol('BTCUSDT')).rejects.toThrow('Analysis failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to analyze symbol',
        expect.objectContaining({
          type: 'SYMBOL_ANALYSIS_ERROR',
          symbol: 'BTCUSDT'
        })
      );
    });
  });

  describe('Cache Management', () => {
    it('should get cached analysis', () => {
      const mockAnalysis: SymbolAnalysis = {
        symbol: 'BTCUSDT',
        timestamp: new Date(),
        data: {} as SymbolData,
        technical: {} as TechnicalIndicators
      };

      const symbolHandlerAny = symbolHandler as any;
      symbolHandlerAny.analysisCache.set('BTCUSDT', mockAnalysis);

      const result = symbolHandler.getCachedAnalysis('BTCUSDT');
      expect(result).toEqual(mockAnalysis);
    });

    it('should return null for non-existent cached analysis', () => {
      const result = symbolHandler.getCachedAnalysis('INVALID');
      expect(result).toBeNull();
    });

    it('should get tracked symbols', () => {
      const symbolHandlerAny = symbolHandler as any;
      symbolHandlerAny.symbolCache.set('BTCUSDT', {} as SymbolData);
      symbolHandlerAny.symbolCache.set('ETHUSDT', {} as SymbolData);

      const result = symbolHandler.getTrackedSymbols();
      expect(result).toContain('BTCUSDT');
      expect(result).toContain('ETHUSDT');
    });

    it('should remove symbol from tracking', () => {
      const symbolHandlerAny = symbolHandler as any;
      symbolHandlerAny.symbolCache.set('BTCUSDT', {} as SymbolData);
      symbolHandlerAny.analysisCache.set('BTCUSDT', {} as SymbolAnalysis);
      symbolHandlerAny.lastUpdate.set('BTCUSDT', Date.now());

      symbolHandler.removeSymbol('BTCUSDT');

      expect(symbolHandlerAny.symbolCache.has('BTCUSDT')).toBe(false);
      expect(symbolHandlerAny.analysisCache.has('BTCUSDT')).toBe(false);
      expect(symbolHandlerAny.lastUpdate.has('BTCUSDT')).toBe(false);
      expect(mockSessionManager.setCache).toHaveBeenCalledWith('symbol_BTCUSDT', null);
      expect(mockSessionManager.setCache).toHaveBeenCalledWith('analysis_BTCUSDT', null);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Symbol removed from tracking',
        expect.objectContaining({
          type: 'SYMBOL_REMOVED',
          symbol: 'BTCUSDT'
        })
      );
    });

    it('should get cache statistics', () => {
      const symbolHandlerAny = symbolHandler as any;
      symbolHandlerAny.symbolCache.set('BTCUSDT', {} as SymbolData);
      symbolHandlerAny.analysisCache.set('BTCUSDT', {} as SymbolAnalysis);

      const stats = symbolHandler.getCacheStats();

      expect(stats).toHaveProperty('trackedSymbols', 1);
      expect(stats).toHaveProperty('cachedAnalyses', 1);
      expect(stats).toHaveProperty('lastCleanup');
      expect(typeof stats.lastCleanup).toBe('number');
    });
  });
});
