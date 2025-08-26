import { SlippageHandler, SlippageConfig, SlippageAnalysis } from '../../src/trading/SlippageHandler';

describe('SlippageHandler', () => {
  let slippageHandler: SlippageHandler;

  beforeEach(() => {
    // Reset singleton instance
    (SlippageHandler as any).instance = undefined;
    slippageHandler = SlippageHandler.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SlippageHandler.getInstance();
      const instance2 = SlippageHandler.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration', () => {
    it('should have default configuration', () => {
      const config = slippageHandler.getConfig();
      expect(config.maxSlippage).toBe(0.02);
      expect(config.slippageTolerance).toBe(0.005);
      expect(config.enableSlippageProtection).toBe(true);
      expect(config.slippageCalculationMethod).toBe('PERCENTAGE');
      expect(config.retryOnHighSlippage).toBe(true);
      expect(config.maxRetries).toBe(3);
    });

    it('should update configuration', () => {
      const newConfig: Partial<SlippageConfig> = {
        maxSlippage: 0.03,
        slippageCalculationMethod: 'ABSOLUTE'
      };

      const eventSpy = jest.fn();
      slippageHandler.on('config_updated', eventSpy);

      slippageHandler.updateConfig(newConfig);
      const config = slippageHandler.getConfig();

      expect(config.maxSlippage).toBe(0.03);
      expect(config.slippageCalculationMethod).toBe('ABSOLUTE');
      expect(eventSpy).toHaveBeenCalledWith(config);
    });
  });

  describe('Slippage Calculation', () => {
    it('should calculate slippage with percentage method', () => {
      const analysis = slippageHandler.calculateSlippage(
        'BTCUSDT',
        100, // expected price
        102, // actual price
        'BUY',
        1.0,
        'order123'
      );

      expect(analysis.symbol).toBe('BTCUSDT');
      expect(analysis.expectedPrice).toBe(100);
      expect(analysis.actualPrice).toBe(102);
      expect(analysis.slippagePercentage).toBe(0.02); // 2%
      expect(analysis.slippageAmount).toBe(2); // $2
      expect(analysis.isAcceptable).toBe(true); // Within 2% limit
      expect(analysis.side).toBe('BUY');
      expect(analysis.quantity).toBe(1.0);
      expect(analysis.orderId).toBe('order123');
    });

    it('should calculate slippage with absolute method', () => {
      slippageHandler.updateConfig({ slippageCalculationMethod: 'ABSOLUTE' });

      const analysis = slippageHandler.calculateSlippage(
        'BTCUSDT',
        100,
        102,
        'BUY',
        1.0,
        'order123'
      );

      expect(analysis.slippageAmount).toBe(2);
      expect(analysis.slippagePercentage).toBe(0.02);
    });

    it('should detect high slippage', () => {
      const analysis = slippageHandler.calculateSlippage(
        'BTCUSDT',
        100,
        105, // 5% slippage
        'BUY',
        1.0,
        'order123'
      );

      expect(analysis.slippagePercentage).toBe(0.05);
      expect(analysis.isAcceptable).toBe(false); // Exceeds 2% limit
    });

    it('should handle sell orders correctly', () => {
      const analysis = slippageHandler.calculateSlippage(
        'BTCUSDT',
        100,
        98, // Lower price for sell
        'SELL',
        1.0,
        'order123'
      );

      expect(analysis.slippagePercentage).toBe(0.02);
      expect(analysis.slippageAmount).toBe(2);
    });
  });

  describe('Slippage Validation', () => {
    it('should validate acceptable slippage', () => {
      const analysis: SlippageAnalysis = {
        symbol: 'BTCUSDT',
        expectedPrice: 100,
        actualPrice: 101,
        slippagePercentage: 0.01,
        slippageAmount: 1,
        isAcceptable: true,
        timestamp: new Date(),
        orderId: 'order123',
        side: 'BUY',
        quantity: 1.0
      };

      const isValid = slippageHandler.validateSlippage(analysis);
      expect(isValid).toBe(true);
    });

    it('should reject high slippage', () => {
      const analysis: SlippageAnalysis = {
        symbol: 'BTCUSDT',
        expectedPrice: 100,
        actualPrice: 105,
        slippagePercentage: 0.05,
        slippageAmount: 5,
        isAcceptable: false,
        timestamp: new Date(),
        orderId: 'order123',
        side: 'BUY',
        quantity: 1.0
      };

      const isValid = slippageHandler.validateSlippage(analysis);
      expect(isValid).toBe(false);
    });

    it('should allow high slippage when protection is disabled', () => {
      slippageHandler.updateConfig({ enableSlippageProtection: false });

      const analysis: SlippageAnalysis = {
        symbol: 'BTCUSDT',
        expectedPrice: 100,
        actualPrice: 105,
        slippagePercentage: 0.05,
        slippageAmount: 5,
        isAcceptable: false,
        timestamp: new Date(),
        orderId: 'order123',
        side: 'BUY',
        quantity: 1.0
      };

      const isValid = slippageHandler.validateSlippage(analysis);
      expect(isValid).toBe(true);
    });
  });

  describe('Retry Logic', () => {
    it('should recommend retry for high slippage', () => {
      const analysis: SlippageAnalysis = {
        symbol: 'BTCUSDT',
        expectedPrice: 100,
        actualPrice: 105,
        slippagePercentage: 0.05,
        slippageAmount: 5,
        isAcceptable: false,
        timestamp: new Date(),
        orderId: 'order123',
        side: 'BUY',
        quantity: 1.0
      };

      const shouldRetry = slippageHandler.shouldRetryOrder(analysis, 0);
      expect(shouldRetry).toBe(true);
    });

    it('should not retry after max attempts', () => {
      const analysis: SlippageAnalysis = {
        symbol: 'BTCUSDT',
        expectedPrice: 100,
        actualPrice: 105,
        slippagePercentage: 0.05,
        slippageAmount: 5,
        isAcceptable: false,
        timestamp: new Date(),
        orderId: 'order123',
        side: 'BUY',
        quantity: 1.0
      };

      const shouldRetry = slippageHandler.shouldRetryOrder(analysis, 3);
      expect(shouldRetry).toBe(false);
    });

    it('should not retry when retry is disabled', () => {
      slippageHandler.updateConfig({ retryOnHighSlippage: false });

      const analysis: SlippageAnalysis = {
        symbol: 'BTCUSDT',
        expectedPrice: 100,
        actualPrice: 105,
        slippagePercentage: 0.05,
        slippageAmount: 5,
        isAcceptable: false,
        timestamp: new Date(),
        orderId: 'order123',
        side: 'BUY',
        quantity: 1.0
      };

      const shouldRetry = slippageHandler.shouldRetryOrder(analysis, 0);
      expect(shouldRetry).toBe(false);
    });
  });

  describe('Order Size Optimization', () => {
    it('should reduce order size for high slippage', () => {
      const baseQuantity = 1.0;
      const highSlippage = 0.03; // 3%

      const optimalSize = slippageHandler.calculateOptimalOrderSize(
        'BTCUSDT',
        baseQuantity,
        highSlippage
      );

      expect(optimalSize).toBeLessThan(baseQuantity);
    });

    it('should not reduce order size for low slippage', () => {
      const baseQuantity = 1.0;
      const lowSlippage = 0.005; // 0.5%

      const optimalSize = slippageHandler.calculateOptimalOrderSize(
        'BTCUSDT',
        baseQuantity,
        lowSlippage
      );

      expect(optimalSize).toBe(baseQuantity);
    });

    it('should not reduce order size when protection is disabled', () => {
      slippageHandler.updateConfig({ enableSlippageProtection: false });

      const baseQuantity = 1.0;
      const highSlippage = 0.03;

      const optimalSize = slippageHandler.calculateOptimalOrderSize(
        'BTCUSDT',
        baseQuantity,
        highSlippage
      );

      expect(optimalSize).toBe(baseQuantity);
    });
  });

  describe('History Management', () => {
    it('should add slippage to history', () => {
      slippageHandler.calculateSlippage(
        'BTCUSDT',
        100,
        102,
        'BUY',
        1.0,
        'order123'
      );

      const history = slippageHandler.getSlippageHistory('BTCUSDT');
      expect(history).toHaveLength(1);
      expect(history[0]?.symbol).toBe('BTCUSDT');
    });

    it('should limit history size', () => {
      // Add more than 100 entries
      for (let i = 0; i < 105; i++) {
        slippageHandler.calculateSlippage(
          'BTCUSDT',
          100,
          100 + i,
          'BUY',
          1.0,
          `order${i}`
        );
      }

      const history = slippageHandler.getSlippageHistory('BTCUSDT');
      expect(history).toHaveLength(100);
    });

    it('should return empty array for unknown symbol', () => {
      const history = slippageHandler.getSlippageHistory('UNKNOWN');
      expect(history).toEqual([]);
    });
  });

  describe('Execution Analytics', () => {
    it('should generate execution analytics', () => {
      // Add multiple trades
      slippageHandler.calculateSlippage('BTCUSDT', 100, 101, 'BUY', 1.0, 'order1');
      slippageHandler.calculateSlippage('BTCUSDT', 100, 102, 'BUY', 1.0, 'order2');
      slippageHandler.calculateSlippage('BTCUSDT', 100, 103, 'BUY', 1.0, 'order3');

      const analytics = slippageHandler.getExecutionAnalytics('BTCUSDT');
      expect(analytics).toBeDefined();
      expect(analytics?.symbol).toBe('BTCUSDT');
      expect(analytics?.totalTrades).toBe(3);
      expect(analytics?.averageSlippage).toBeGreaterThan(0);
    });

    it('should calculate slippage distribution', () => {
      // Add trades with different slippage levels
      slippageHandler.calculateSlippage('BTCUSDT', 100, 100.5, 'BUY', 1.0, 'order1'); // 0.5%
      slippageHandler.calculateSlippage('BTCUSDT', 100, 102, 'BUY', 1.0, 'order2');   // 2%
      slippageHandler.calculateSlippage('BTCUSDT', 100, 104, 'BUY', 1.0, 'order3');   // 4%

      const analytics = slippageHandler.getExecutionAnalytics('BTCUSDT');
      expect(analytics?.slippageDistribution.low).toBe(1);
      expect(analytics?.slippageDistribution.medium).toBe(1);
      expect(analytics?.slippageDistribution.high).toBe(1);
    });

    it('should return null for unknown symbol', () => {
      const analytics = slippageHandler.getExecutionAnalytics('UNKNOWN');
      expect(analytics).toBeNull();
    });
  });

  describe('Event Emission', () => {
    it('should emit high slippage events', () => {
      const eventSpy = jest.fn();
      slippageHandler.on('high_slippage', eventSpy);

      slippageHandler.calculateSlippage(
        'BTCUSDT',
        100,
        105, // 5% slippage
        'BUY',
        1.0,
        'order123'
      );

      expect(eventSpy).toHaveBeenCalled();
      const analysis = eventSpy.mock.calls[0][0];
      expect(analysis.slippagePercentage).toBe(0.05);
    });

    it('should emit slippage analyzed events', () => {
      const eventSpy = jest.fn();
      slippageHandler.on('slippage_analyzed', eventSpy);

      slippageHandler.calculateSlippage(
        'BTCUSDT',
        100,
        102,
        'BUY',
        1.0,
        'order123'
      );

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should emit analytics updated events', () => {
      const eventSpy = jest.fn();
      slippageHandler.on('analytics_updated', eventSpy);

      slippageHandler.calculateSlippage(
        'BTCUSDT',
        100,
        102,
        'BUY',
        1.0,
        'order123'
      );

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('Status Management', () => {
    it('should return correct status', () => {
      const status = slippageHandler.getStatus();
      
      expect(status.slippageHistorySize).toBe(0);
      expect(status.analyticsSize).toBe(0);
      expect(status.config).toBeDefined();
    });

    it('should update status after adding data', () => {
      slippageHandler.calculateSlippage(
        'BTCUSDT',
        100,
        102,
        'BUY',
        1.0,
        'order123'
      );

      const status = slippageHandler.getStatus();
      
      expect(status.slippageHistorySize).toBe(1);
      expect(status.analyticsSize).toBe(1);
    });
  });

  describe('History Clearing', () => {
    it('should clear history for specific symbol', () => {
      slippageHandler.calculateSlippage('BTCUSDT', 100, 102, 'BUY', 1.0, 'order1');
      slippageHandler.calculateSlippage('ETHUSDT', 100, 102, 'BUY', 1.0, 'order2');

      const eventSpy = jest.fn();
      slippageHandler.on('history_cleared', eventSpy);

      slippageHandler.clearHistory('BTCUSDT');

      expect(eventSpy).toHaveBeenCalledWith({ symbol: 'BTCUSDT' });
      expect(slippageHandler.getSlippageHistory('BTCUSDT')).toEqual([]);
      expect(slippageHandler.getSlippageHistory('ETHUSDT')).toHaveLength(1);
    });

    it('should clear all history', () => {
      slippageHandler.calculateSlippage('BTCUSDT', 100, 102, 'BUY', 1.0, 'order1');
      slippageHandler.calculateSlippage('ETHUSDT', 100, 102, 'BUY', 1.0, 'order2');

      slippageHandler.clearHistory();

      expect(slippageHandler.getSlippageHistory('BTCUSDT')).toEqual([]);
      expect(slippageHandler.getSlippageHistory('ETHUSDT')).toEqual([]);
    });
  });
});
