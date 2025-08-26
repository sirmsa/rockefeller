import { TradingEngine, TradeDecision, TradingConfig } from '../../src/trading/TradingEngine';
import { AISymbolAnalysis } from '../../src/trading/AISymbolAnalysis';
import { TechnicalAnalysisEngine } from '../../src/trading/TechnicalAnalysisEngine';
import { BinanceManager } from '../../src/trading/BinanceManager';
import { PortfolioManager } from '../../src/trading/PortfolioManager';

// Mock dependencies
jest.mock('../../src/trading/AISymbolAnalysis');
jest.mock('../../src/trading/TechnicalAnalysisEngine');
jest.mock('../../src/trading/BinanceManager');
jest.mock('../../src/trading/PortfolioManager');

describe('TradingEngine', () => {
  let tradingEngine: TradingEngine;
  let mockAIAnalysis: jest.Mocked<AISymbolAnalysis>;
  let mockTechAnalysis: jest.Mocked<TechnicalAnalysisEngine>;
  let mockBinanceManager: jest.Mocked<BinanceManager>;
  let mockPortfolioManager: jest.Mocked<PortfolioManager>;

  beforeEach(() => {
    // Reset singleton instance
    (TradingEngine as any).instance = undefined;
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Get mocked instances (simplified approach)
    mockAIAnalysis = AISymbolAnalysis.getInstance() as any;
    mockTechAnalysis = TechnicalAnalysisEngine.getInstance() as any;
    mockBinanceManager = BinanceManager.getInstance() as any;
    mockPortfolioManager = PortfolioManager.getInstance() as any;
    
    // Setup default mock implementations
    mockAIAnalysis.startAnalysis = jest.fn();
    mockAIAnalysis.stopAnalysis = jest.fn();
    mockAIAnalysis.getSentimentAnalysis = jest.fn().mockReturnValue({
      symbol: 'BTCUSDT',
      overallSentiment: 0.5,
      confidence: 0.8,
      sources: { news: [], social: [], market: [] },
      reasoning: 'Test sentiment',
      timestamp: new Date(),
      trend: 'neutral',
      strength: 'moderate'
    });

    mockTechAnalysis.startAnalysis = jest.fn();
    mockTechAnalysis.stopAnalysis = jest.fn();
    mockTechAnalysis.performTechnicalAnalysis = jest.fn().mockResolvedValue({
      symbol: 'BTCUSDT',
      timeframe: '1h',
      indicators: {
        rsi: 50,
        ma: { sma: 100, ema: 101 },
        volume: { trend: 'stable', average: 1000, ratio: 1.0 },
        fibonacci: { retracements: [100, 99, 98, 97, 96, 95, 94], support: 96, resistance: 98 },
        support: 95,
        resistance: 105
      },
      timestamp: new Date(),
      trend: 'neutral',
      strength: 'moderate',
      confidence: 0.7,
      signals: { buy: false, sell: false, hold: true },
      reasoning: 'Test technical analysis'
    });

    mockBinanceManager.getKlines = jest.fn().mockResolvedValue([
      {
        openTime: Date.now(),
        open: 100,
        high: 105,
        low: 95,
        close: 102,
        volume: 1000,
        closeTime: Date.now() + 3600000,
        quoteAssetVolume: 100000,
        numberOfTrades: 100,
        takerBuyBaseAssetVolume: 500,
        takerBuyQuoteAssetVolume: 50000
      }
    ]);

    mockBinanceManager.placeOrder = jest.fn().mockResolvedValue({
      orderId: 12345,
      symbol: 'BTCUSDT',
      status: 'FILLED',
      side: 'BUY',
      type: 'MARKET',
      origQty: '1.0',
      executedQty: '1.0',
      price: '100.0',
      avgPrice: '100.0',
      commission: '0.1',
      commissionAsset: 'USDT',
      time: Date.now(),
      updateTime: Date.now(),
      clientOrderId: 'test_client_id'
    });

    mockPortfolioManager.getPortfolio = jest.fn().mockReturnValue({
      id: 'test-portfolio',
      name: 'Test Portfolio',
      budget: 10000,
      symbols: ['BTCUSDT'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    tradingEngine = TradingEngine.getInstance();
  });

  afterEach(() => {
    // Clean up any running trading
    if (tradingEngine.getStatus().isRunning) {
      tradingEngine.stopTrading();
    }
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = TradingEngine.getInstance();
      const instance2 = TradingEngine.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration', () => {
    it('should have default configuration', () => {
      const config = tradingEngine.getConfig();
      expect(config.maxPositionsPerPortfolio).toBe(5);
      expect(config.maxRiskPerTrade).toBe(0.02);
      expect(config.defaultStopLoss).toBe(0.05);
      expect(config.defaultTakeProfit).toBe(0.10);
      expect(config.minConfidenceThreshold).toBe(0.7);
      expect(config.sentimentWeight).toBe(0.4);
      expect(config.technicalWeight).toBe(0.6);
      expect(config.maxSlippage).toBe(0.01);
      expect(config.enableAutoTrading).toBe(false);
      expect(config.enableStopLoss).toBe(true);
      expect(config.enableTakeProfit).toBe(true);
    });

    it('should update configuration', () => {
      const newConfig: Partial<TradingConfig> = {
        maxPositionsPerPortfolio: 10,
        maxRiskPerTrade: 0.05,
        enableAutoTrading: true
      };

      const eventSpy = jest.fn();
      tradingEngine.on('config_updated', eventSpy);

      tradingEngine.updateConfig(newConfig);
      const config = tradingEngine.getConfig();

      expect(config.maxPositionsPerPortfolio).toBe(10);
      expect(config.maxRiskPerTrade).toBe(0.05);
      expect(config.enableAutoTrading).toBe(true);
      expect(eventSpy).toHaveBeenCalledWith(config);
    });
  });

  describe('Trading Control', () => {
    it('should start trading', () => {
      const symbols = ['BTCUSDT', 'ETHUSDT'];
      const portfolioId = 'test-portfolio';
      const eventSpy = jest.fn();
      tradingEngine.on('trading_started', eventSpy);

      tradingEngine.startTrading(portfolioId, symbols);
      const status = tradingEngine.getStatus();

      expect(status.isRunning).toBe(true);
      expect(mockAIAnalysis.startAnalysis).toHaveBeenCalledWith(symbols);
      expect(mockTechAnalysis.startAnalysis).toHaveBeenCalledWith(symbols);
      expect(eventSpy).toHaveBeenCalledWith({ portfolioId, symbols });
    });

    it('should stop trading', () => {
      tradingEngine.startTrading('test-portfolio', ['BTCUSDT']);
      const eventSpy = jest.fn();
      tradingEngine.on('trading_stopped', eventSpy);

      tradingEngine.stopTrading();
      const status = tradingEngine.getStatus();

      expect(status.isRunning).toBe(false);
      expect(mockAIAnalysis.stopAnalysis).toHaveBeenCalled();
      expect(mockTechAnalysis.stopAnalysis).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should not start trading if already running', () => {
      tradingEngine.startTrading('test-portfolio', ['BTCUSDT']);
      
      expect(() => {
        tradingEngine.startTrading('test-portfolio', ['ETHUSDT']);
      }).toThrow('Trading engine is already running');
    });
  });

  describe('Trading Decisions', () => {
    it('should make trading decisions successfully', async () => {
      const symbols = ['BTCUSDT'];
      const portfolioId = 'test-portfolio';

      const decisions = await tradingEngine.makeTradingDecisions(portfolioId, symbols);

      expect(decisions).toHaveLength(1);
      expect(decisions[0]?.symbol).toBe('BTCUSDT');
      expect(decisions[0]?.portfolioId).toBe(portfolioId);
      expect(decisions[0]?.action).toMatch(/BUY|SELL|HOLD/);
      expect(decisions[0]?.confidence).toBeGreaterThan(0);
      expect(decisions[0]?.confidence).toBeLessThanOrEqual(1);
      expect(decisions[0]?.reasoning).toBeTruthy();
      expect(decisions[0]?.sentimentAnalysis).toBeDefined();
      expect(decisions[0]?.technicalAnalysis).toBeDefined();
    });

    it('should handle analysis errors gracefully', async () => {
      mockBinanceManager.getKlines = jest.fn().mockRejectedValue(new Error('API Error'));
      
      const eventSpy = jest.fn();
      tradingEngine.on('decision_error', eventSpy);

      const decisions = await tradingEngine.makeTradingDecisions('test-portfolio', ['BTCUSDT']);

      expect(decisions).toHaveLength(0);
      expect(eventSpy).toHaveBeenCalledWith({
        symbol: 'BTCUSDT',
        error: 'API Error'
      });
    });

    it('should handle insufficient data', async () => {
      mockBinanceManager.getKlines = jest.fn().mockResolvedValue([]);
      
      const decisions = await tradingEngine.makeTradingDecisions('test-portfolio', ['BTCUSDT']);

      expect(decisions).toHaveLength(0);
    });
  });

  describe('Trade Execution', () => {
    it('should execute trade successfully', async () => {
      const decision: TradeDecision = {
        symbol: 'BTCUSDT',
        action: 'BUY',
        confidence: 0.8,
        reasoning: 'Strong bullish signals',
        timestamp: new Date(),
        portfolioId: 'test-portfolio',
        suggestedQuantity: 1.0,
        suggestedPrice: 100.0,
        stopLoss: 95.0,
        takeProfit: 110.0
      };

      const eventSpy = jest.fn();
      tradingEngine.on('order_executed', eventSpy);

      const order = await tradingEngine.executeTrade(decision);

      expect(order).toBeDefined();
      expect(order?.symbol).toBe('BTCUSDT');
      expect(order?.side).toBe('BUY');
      expect(order?.status).toBe('FILLED');
      expect(mockBinanceManager.placeOrder).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith(order);
    });

    it('should handle execution errors', async () => {
      mockBinanceManager.placeOrder = jest.fn().mockRejectedValue(new Error('Order failed'));
      
      const decision: TradeDecision = {
        symbol: 'BTCUSDT',
        action: 'BUY',
        confidence: 0.8,
        reasoning: 'Test',
        timestamp: new Date(),
        portfolioId: 'test-portfolio',
        suggestedQuantity: 1.0,
        suggestedPrice: 100.0
      };

      const eventSpy = jest.fn();
      tradingEngine.on('execution_error', eventSpy);

      const order = await tradingEngine.executeTrade(decision);

      expect(order).toBeNull();
      expect(eventSpy).toHaveBeenCalledWith({
        decision,
        error: 'Order failed'
      });
    });

    it('should validate trade parameters', async () => {
      const decision: TradeDecision = {
        symbol: 'BTCUSDT',
        action: 'BUY',
        confidence: 0.8,
        reasoning: 'Test',
        timestamp: new Date(),
        portfolioId: 'test-portfolio'
        // Missing suggestedQuantity and suggestedPrice
      };

      const order = await tradingEngine.executeTrade(decision);

      expect(order).toBeNull();
    });
  });

  describe('Position Management', () => {
    it('should get position', () => {
      const position = tradingEngine.getPosition('test-portfolio', 'BTCUSDT');
      expect(position).toBeUndefined(); // No position exists initially
    });

    it('should get all positions for portfolio', () => {
      const positions = tradingEngine.getAllPositions('test-portfolio');
      expect(positions).toEqual([]); // No positions initially
    });

    it('should update position prices', async () => {
      mockBinanceManager.getTicker24hr = jest.fn().mockResolvedValue({
        symbol: 'BTCUSDT',
        priceChange: '5.0',
        priceChangePercent: '5.0',
        weightedAvgPrice: '105.0',
        prevClosePrice: '100.0',
        lastPrice: '105.0',
        lastQty: '1.0',
        bidPrice: '104.9',
        bidQty: '10.0',
        askPrice: '105.1',
        askQty: '10.0',
        openPrice: '100.0',
        highPrice: '110.0',
        lowPrice: '95.0',
        volume: '1000',
        quoteVolume: '105000',
        openTime: Date.now(),
        closeTime: Date.now(),
        firstId: 1,
        lastId: 100,
        count: 100
      });

      await tradingEngine.updatePositionPrices();
      // This should not throw any errors even with no positions
    });
  });

  describe('Order Management', () => {
    it('should get order', () => {
      const order = tradingEngine.getOrder('non-existent');
      expect(order).toBeUndefined();
    });

    it('should get all orders for portfolio', () => {
      const orders = tradingEngine.getAllOrders('test-portfolio');
      expect(orders).toEqual([]); // No orders initially
    });
  });

  describe('Trade History', () => {
    it('should get trade history for portfolio', () => {
      const history = tradingEngine.getTradeHistory('test-portfolio');
      expect(history).toEqual([]); // No history initially
    });

    it('should add decisions to history', async () => {
      await tradingEngine.makeTradingDecisions('test-portfolio', ['BTCUSDT']);
      
      const history = tradingEngine.getTradeHistory('test-portfolio');
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('Status Management', () => {
    it('should return correct status when not running', () => {
      const status = tradingEngine.getStatus();
      
      expect(status.isRunning).toBe(false);
      expect(status.activePositions).toBe(0);
      expect(status.pendingOrders).toBe(0);
    });

    it('should return correct status when running', () => {
      tradingEngine.startTrading('test-portfolio', ['BTCUSDT']);
      const status = tradingEngine.getStatus();
      
      expect(status.isRunning).toBe(true);
    });
  });

  describe('Event Emission', () => {
    it('should emit trade decision events', async () => {
      const eventSpy = jest.fn();
      tradingEngine.on('trade_decision', eventSpy);

      await tradingEngine.makeTradingDecisions('test-portfolio', ['BTCUSDT']);

      expect(eventSpy).toHaveBeenCalled();
      const decision = eventSpy.mock.calls[0][0];
      expect(decision.symbol).toBe('BTCUSDT');
    });

    it('should emit analysis error events', async () => {
      mockBinanceManager.getKlines = jest.fn().mockRejectedValue(new Error('Test error'));
      
      const eventSpy = jest.fn();
      tradingEngine.on('analysis_error', eventSpy);

      await tradingEngine.makeTradingDecisions('test-portfolio', ['BTCUSDT']);

      expect(eventSpy).toHaveBeenCalledWith({
        symbol: 'BTCUSDT',
        error: 'Test error'
      });
    });
  });
});
