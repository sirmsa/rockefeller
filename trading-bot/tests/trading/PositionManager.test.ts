import { PositionManager, PositionConfig } from '../../src/trading/PositionManager';

describe('PositionManager', () => {
  let positionManager: PositionManager;

  beforeEach(() => {
    // Reset singleton instance
    (PositionManager as any).instance = undefined;
    positionManager = PositionManager.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PositionManager.getInstance();
      const instance2 = PositionManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration', () => {
    it('should have default configuration', () => {
      const config = positionManager.getConfig();
      expect(config.maxPositionsPerPortfolio).toBe(10);
      expect(config.maxRiskPerPosition).toBe(0.05);
      expect(config.maxTotalRisk).toBe(0.20);
      expect(config.correlationThreshold).toBe(0.7);
      expect(config.volatilityLookback).toBe(30);
      expect(config.kellyFraction).toBe(0.25);
      expect(config.enableRiskManagement).toBe(true);
      expect(config.enableCorrelationAnalysis).toBe(true);
      expect(config.enableVolatilityAdjustment).toBe(true);
    });

    it('should update configuration', () => {
      const newConfig: Partial<PositionConfig> = {
        maxPositionsPerPortfolio: 15,
        maxRiskPerPosition: 0.03,
        enableRiskManagement: false
      };

      const eventSpy = jest.fn();
      positionManager.on('config_updated', eventSpy);

      positionManager.updateConfig(newConfig);
      const config = positionManager.getConfig();

      expect(config.maxPositionsPerPortfolio).toBe(15);
      expect(config.maxRiskPerPosition).toBe(0.03);
      expect(config.enableRiskManagement).toBe(false);
      expect(eventSpy).toHaveBeenCalledWith(config);
    });
  });

  describe('Position Sizing', () => {
    it('should calculate position size with fixed method', () => {
      // Disable risk management to ensure fixed sizing
      positionManager.updateConfig({ enableRiskManagement: false });
      
      const sizing = positionManager.calculatePositionSize(
        'BTCUSDT',
        'test-portfolio',
        10000, // availableBudget
        0.7, // confidence
        100, // currentPrice
        0 // volatility (no volatility adjustment)
      );

      expect(sizing.symbol).toBe('BTCUSDT');
      expect(sizing.portfolioId).toBe('test-portfolio');
      expect(sizing.availableBudget).toBe(10000);
      expect(sizing.suggestedQuantity).toBeGreaterThan(0);
      expect(sizing.maxQuantity).toBe(100); // 10000 / 100
      expect(sizing.sizingMethod).toBe('FIXED');
      expect(sizing.confidence).toBe(0.7);
    });

    it('should calculate position size with Kelly criterion for high confidence', () => {
      const sizing = positionManager.calculatePositionSize(
        'BTCUSDT',
        'test-portfolio',
        10000,
        0.9, // High confidence
        100,
        0.02
      );

      expect(sizing.sizingMethod).toBe('KELLY');
    });

    it('should calculate position size with volatility adjustment', () => {
      const sizing = positionManager.calculatePositionSize(
        'BTCUSDT',
        'test-portfolio',
        10000,
        0.7,
        100,
        0.1 // High volatility
      );

      expect(sizing.sizingMethod).toBe('VOLATILITY');
    });

    it('should not exceed maximum quantity', () => {
      const sizing = positionManager.calculatePositionSize(
        'BTCUSDT',
        'test-portfolio',
        10000,
        0.7,
        100,
        0.02
      );

      expect(sizing.suggestedQuantity).toBeLessThanOrEqual(sizing.maxQuantity);
    });
  });

  describe('Position Risk Calculation', () => {
    it('should calculate position risk correctly', () => {
      const risk = positionManager.calculatePositionRisk(
        'BTCUSDT',
        'test-portfolio',
        1.0, // quantity
        100, // currentPrice
        10000 // portfolioValue
      );

      expect(risk.symbol).toBe('BTCUSDT');
      expect(risk.portfolioId).toBe('test-portfolio');
      expect(risk.currentRisk).toBe(0.01); // 1 * 100 / 10000
      expect(risk.maxRisk).toBe(0.05); // 5% from config
      expect(risk.totalRisk).toBeGreaterThan(0);
      expect(risk.riskLevel).toMatch(/LOW|MEDIUM|HIGH|CRITICAL/);
    });

    it('should calculate correlation risk', () => {
      // Set up correlation data
      positionManager.updateCorrelationMatrix('BTCUSDT', 'ETHUSDT', 0.8);
      
      // Mock existing positions by temporarily overriding the method
      const originalGetExistingPositions = (positionManager as any).getExistingPositions;
      (positionManager as any).getExistingPositions = () => [
        { symbol: 'ETHUSDT', risk: 0.02 }
      ];
      
      const risk = positionManager.calculatePositionRisk(
        'BTCUSDT',
        'test-portfolio',
        1.0,
        100,
        10000
      );

      // Restore original method
      (positionManager as any).getExistingPositions = originalGetExistingPositions;

      expect(risk.correlationRisk).toBeGreaterThan(0);
    });

    it('should calculate market risk', () => {
      // Set up volatility data
      positionManager.updateVolatilityData('BTCUSDT', [100, 101, 99, 102, 98]);
      
      const risk = positionManager.calculatePositionRisk(
        'BTCUSDT',
        'test-portfolio',
        1.0,
        100,
        10000
      );

      expect(risk.marketRisk).toBeGreaterThan(0);
    });

    it('should calculate liquidity risk', () => {
      const risk = positionManager.calculatePositionRisk(
        'BTCUSDT',
        'test-portfolio',
        1000, // Large quantity
        100,
        10000
      );

      expect(risk.liquidityRisk).toBeGreaterThan(0);
    });
  });

  describe('Position Validation', () => {
    it('should validate position successfully', () => {
      const validation = positionManager.validatePosition(
        'BTCUSDT',
        'test-portfolio',
        1.0,
        100,
        10000
      );

      expect(validation.isValid).toBe(true);
      expect(validation.risk).toBeDefined();
    });

    it('should reject position with high risk', () => {
      const validation = positionManager.validatePosition(
        'BTCUSDT',
        'test-portfolio',
        100, // Very large quantity
        100,
        10000
      );

      expect(validation.isValid).toBe(false);
      expect(validation.reason).toBeDefined();
    });

    it('should reject position exceeding maximum risk per position', () => {
      const validation = positionManager.validatePosition(
        'BTCUSDT',
        'test-portfolio',
        10, // Large quantity that exceeds 5% risk
        100,
        10000
      );

      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('Position risk exceeds maximum allowed');
    });
  });

  describe('Correlation Management', () => {
    it('should update correlation matrix', () => {
      positionManager.updateCorrelationMatrix('BTCUSDT', 'ETHUSDT', 0.8);
      
      const correlation = positionManager.getCorrelation('BTCUSDT', 'ETHUSDT');
      expect(correlation).toBe(0.8);
    });

    it('should get correlation bidirectionally', () => {
      positionManager.updateCorrelationMatrix('BTCUSDT', 'ETHUSDT', 0.8);
      
      const correlation1 = positionManager.getCorrelation('BTCUSDT', 'ETHUSDT');
      const correlation2 = positionManager.getCorrelation('ETHUSDT', 'BTCUSDT');
      
      expect(correlation1).toBe(0.8);
      expect(correlation2).toBe(0.8);
    });

    it('should return 1 for same symbol correlation', () => {
      const correlation = positionManager.getCorrelation('BTCUSDT', 'BTCUSDT');
      expect(correlation).toBe(1);
    });

    it('should return 0 for unknown correlation', () => {
      const correlation = positionManager.getCorrelation('BTCUSDT', 'UNKNOWN');
      expect(correlation).toBe(0);
    });
  });

  describe('Volatility Management', () => {
    it('should update volatility data', () => {
      const prices = [100, 101, 99, 102, 98, 103, 97];
      positionManager.updateVolatilityData('BTCUSDT', prices);
      
      const volatility = positionManager.getVolatility('BTCUSDT');
      expect(volatility).toBeGreaterThan(0);
    });

    it('should return default volatility for unknown symbol', () => {
      const volatility = positionManager.getVolatility('UNKNOWN');
      expect(volatility).toBe(0.02); // Default 2%
    });

    it('should handle insufficient price data', () => {
      positionManager.updateVolatilityData('BTCUSDT', [100]); // Only one price
      
      const volatility = positionManager.getVolatility('BTCUSDT');
      expect(volatility).toBe(0.02); // Should return default
    });
  });

  describe('Position History', () => {
    it('should add position to history', () => {
      const positionData = {
        symbol: 'BTCUSDT',
        quantity: 1.0,
        price: 100,
        action: 'BUY'
      };

      positionManager.addPositionToHistory('BTCUSDT', positionData);
      
      const history = positionManager.getPositionHistory('BTCUSDT');
      expect(history).toHaveLength(1);
      expect(history[0].symbol).toBe('BTCUSDT');
      expect(history[0].timestamp).toBeDefined();
    });

    it('should limit history to 100 entries', () => {
      // Add 105 entries
      for (let i = 0; i < 105; i++) {
        positionManager.addPositionToHistory('BTCUSDT', {
          symbol: 'BTCUSDT',
          quantity: 1.0,
          price: 100 + i,
          action: 'BUY'
        });
      }
      
      const history = positionManager.getPositionHistory('BTCUSDT');
      expect(history).toHaveLength(100);
    });

    it('should return empty array for unknown symbol', () => {
      const history = positionManager.getPositionHistory('UNKNOWN');
      expect(history).toEqual([]);
    });
  });

  describe('Status Management', () => {
    it('should return correct status', () => {
      const status = positionManager.getStatus();
      
      expect(status.correlationMatrixSize).toBe(0);
      expect(status.volatilityDataSize).toBe(0);
      expect(status.positionHistorySize).toBe(0);
    });

    it('should update status after adding data', () => {
      // Add some data
      positionManager.updateCorrelationMatrix('BTCUSDT', 'ETHUSDT', 0.8);
      positionManager.updateVolatilityData('BTCUSDT', [100, 101, 99]);
      positionManager.addPositionToHistory('BTCUSDT', { symbol: 'BTCUSDT', quantity: 1, price: 100, action: 'BUY' });
      
      const status = positionManager.getStatus();
      
      expect(status.correlationMatrixSize).toBe(1);
      expect(status.volatilityDataSize).toBe(1);
      expect(status.positionHistorySize).toBe(1);
    });
  });

  describe('Configuration Validation', () => {
    it('should handle disabled risk management', () => {
      positionManager.updateConfig({ enableRiskManagement: false });
      
      const sizing = positionManager.calculatePositionSize(
        'BTCUSDT',
        'test-portfolio',
        10000,
        0.7,
        100,
        0 // No volatility
      );

      expect(sizing.sizingMethod).toBe('FIXED');
    });

    it('should handle disabled correlation analysis', () => {
      positionManager.updateConfig({ enableCorrelationAnalysis: false });
      
      const risk = positionManager.calculatePositionRisk(
        'BTCUSDT',
        'test-portfolio',
        1.0,
        100,
        10000
      );

      expect(risk.correlationRisk).toBe(0);
    });

    it('should handle disabled volatility adjustment', () => {
      positionManager.updateConfig({ enableRiskManagement: false, enableVolatilityAdjustment: false });
      
      const sizing = positionManager.calculatePositionSize(
        'BTCUSDT',
        'test-portfolio',
        10000,
        0.7,
        100,
        0.1 // High volatility
      );

      expect(sizing.sizingMethod).toBe('FIXED');
    });
  });
});
