import { TechnicalAnalysisEngine, TechnicalConfig, KlineData } from '../../src/trading/TechnicalAnalysisEngine';

describe('TechnicalAnalysisEngine', () => {
  let techAnalysis: TechnicalAnalysisEngine;
  let mockKlineData: KlineData[];

  beforeEach(() => {
    // Reset singleton instance for each test
    (TechnicalAnalysisEngine as any).instance = undefined;
    techAnalysis = TechnicalAnalysisEngine.getInstance();

    // Create mock kline data
    mockKlineData = Array.from({ length: 50 }, (_, i) => ({
      openTime: Date.now() - (50 - i) * 3600000,
      open: 100 + Math.sin(i * 0.1) * 10,
      high: 105 + Math.sin(i * 0.1) * 10,
      low: 95 + Math.sin(i * 0.1) * 10,
      close: 102 + Math.sin(i * 0.1) * 10,
      volume: 1000 + Math.random() * 500,
      closeTime: Date.now() - (50 - i) * 3600000 + 3600000,
      quoteAssetVolume: 100000 + Math.random() * 50000,
      numberOfTrades: 100 + Math.floor(Math.random() * 50),
      takerBuyBaseAssetVolume: 500 + Math.random() * 250,
      takerBuyQuoteAssetVolume: 50000 + Math.random() * 25000
    }));
  });

  afterEach(() => {
    // Clean up any running analysis
    if (techAnalysis.getStatus().isRunning) {
      techAnalysis.stopAnalysis();
    }
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = TechnicalAnalysisEngine.getInstance();
      const instance2 = TechnicalAnalysisEngine.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration', () => {
    it('should have default configuration', () => {
      const config = techAnalysis.getConfig();
      expect(config.rsiPeriod).toBe(14);
      expect(config.rsiOverbought).toBe(70);
      expect(config.rsiOversold).toBe(30);
      expect(config.maPeriod).toBe(20);
      expect(config.emaPeriod).toBe(20);
      expect(config.volumePeriod).toBe(20);
      expect(config.fibonacciLevels).toEqual([0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]);
    });

    it('should update configuration', () => {
      const newConfig: Partial<TechnicalConfig> = {
        rsiPeriod: 21,
        rsiOverbought: 75,
        rsiOversold: 25
      };

      const eventSpy = jest.fn();
      techAnalysis.on('config_updated', eventSpy);

      techAnalysis.updateConfig(newConfig);
      const config = techAnalysis.getConfig();

      expect(config.rsiPeriod).toBe(21);
      expect(config.rsiOverbought).toBe(75);
      expect(config.rsiOversold).toBe(25);
      expect(eventSpy).toHaveBeenCalledWith(config);
    });
  });

  describe('Analysis Control', () => {
    it('should start analysis for symbols', () => {
      const symbols = ['BTCUSDT', 'ETHUSDT'];
      const eventSpy = jest.fn();
      techAnalysis.on('analysis_started', eventSpy);

      techAnalysis.startAnalysis(symbols);
      const status = techAnalysis.getStatus();

      expect(status.isRunning).toBe(true);
      expect(status.activeSymbols).toEqual(symbols);
      expect(eventSpy).toHaveBeenCalledWith(symbols);
    });

    it('should stop analysis', () => {
      techAnalysis.startAnalysis(['BTCUSDT']);
      const eventSpy = jest.fn();
      techAnalysis.on('analysis_stopped', eventSpy);

      techAnalysis.stopAnalysis();
      const status = techAnalysis.getStatus();

      expect(status.isRunning).toBe(false);
      expect(status.activeSymbols).toEqual([]);
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should add symbol to analysis', () => {
      const eventSpy = jest.fn();
      techAnalysis.on('symbol_added', eventSpy);

      techAnalysis.addSymbol('BTCUSDT');
      const status = techAnalysis.getStatus();

      expect(status.activeSymbols).toContain('BTCUSDT');
      expect(eventSpy).toHaveBeenCalledWith('BTCUSDT');
    });

    it('should remove symbol from analysis', () => {
      techAnalysis.addSymbol('BTCUSDT');
      const eventSpy = jest.fn();
      techAnalysis.on('symbol_removed', eventSpy);

      techAnalysis.removeSymbol('BTCUSDT');
      const status = techAnalysis.getStatus();

      expect(status.activeSymbols).not.toContain('BTCUSDT');
      expect(eventSpy).toHaveBeenCalledWith('BTCUSDT');
    });
  });

  describe('Technical Analysis Execution', () => {
    it('should perform technical analysis successfully', async () => {
      const eventSpy = jest.fn();
      techAnalysis.on('technical_analysis', eventSpy);

      const analysis = await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);

      expect(analysis.symbol).toBe('BTCUSDT');
      expect(analysis.indicators.rsi).toBeGreaterThan(0);
      expect(analysis.indicators.rsi).toBeLessThan(100);
      expect(analysis.indicators.ma.sma).toBeGreaterThan(0);
      expect(analysis.indicators.ma.ema).toBeGreaterThan(0);
      expect(analysis.indicators.volume.trend).toMatch(/increasing|decreasing|stable/);
      expect(analysis.indicators.fibonacci.retracements).toHaveLength(7);
      expect(analysis.trend).toMatch(/bullish|bearish|neutral/);
      expect(analysis.strength).toMatch(/weak|moderate|strong/);
      expect(analysis.confidence).toBeGreaterThan(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
      expect(analysis.signals).toHaveProperty('buy');
      expect(analysis.signals).toHaveProperty('sell');
      expect(analysis.signals).toHaveProperty('hold');
      expect(analysis.reasoning).toBeTruthy();
      expect(eventSpy).toHaveBeenCalledWith(analysis);
    });

    it('should handle insufficient data error', async () => {
      const insufficientData = mockKlineData.slice(0, 5); // Less than required periods
      const eventSpy = jest.fn();
      techAnalysis.on('analysis_error', eventSpy);

      await expect(techAnalysis.performTechnicalAnalysis('BTCUSDT', insufficientData))
        .rejects.toThrow('Insufficient data for technical analysis');

      expect(eventSpy).toHaveBeenCalledWith({
        symbol: 'BTCUSDT',
        error: 'Insufficient data for technical analysis'
      });
    });

    it('should calculate RSI correctly', async () => {
      const analysis = await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      expect(analysis.indicators.rsi).toBeGreaterThan(0);
      expect(analysis.indicators.rsi).toBeLessThan(100);
    });

    it('should calculate moving averages correctly', async () => {
      const analysis = await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      expect(analysis.indicators.ma.sma).toBeGreaterThan(0);
      expect(analysis.indicators.ma.ema).toBeGreaterThan(0);
      expect(typeof analysis.indicators.ma.sma).toBe('number');
      expect(typeof analysis.indicators.ma.ema).toBe('number');
    });

    it('should calculate volume trend correctly', async () => {
      const analysis = await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      expect(analysis.indicators.volume.trend).toMatch(/increasing|decreasing|stable/);
      expect(analysis.indicators.volume.average).toBeGreaterThan(0);
      expect(analysis.indicators.volume.ratio).toBeGreaterThan(0);
    });

    it('should calculate Fibonacci retracements correctly', async () => {
      const analysis = await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      expect(analysis.indicators.fibonacci.retracements).toHaveLength(7);
      expect(analysis.indicators.fibonacci.support).toBeGreaterThan(0);
      expect(analysis.indicators.fibonacci.resistance).toBeGreaterThan(0);
    });

    it('should calculate support and resistance correctly', async () => {
      const analysis = await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      expect(analysis.indicators.support).toBeGreaterThan(0);
      expect(analysis.indicators.resistance).toBeGreaterThan(0);
      expect(analysis.indicators.resistance).toBeGreaterThan(analysis.indicators.support);
    });
  });

  describe('Advanced Indicators', () => {
    it('should calculate MACD when configured', async () => {
      techAnalysis.updateConfig({
        macdPeriod: { fast: 12, slow: 26, signal: 9 }
      });

      const analysis = await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      expect(analysis.indicators.macd).toBeDefined();
      if (analysis.indicators.macd) {
        expect(typeof analysis.indicators.macd.macd).toBe('number');
        expect(typeof analysis.indicators.macd.signal).toBe('number');
        expect(typeof analysis.indicators.macd.histogram).toBe('number');
      }
    });

    it('should calculate Bollinger Bands when configured', async () => {
      techAnalysis.updateConfig({
        bollingerPeriod: 20,
        bollingerStdDev: 2
      });

      const analysis = await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      expect(analysis.indicators.bollingerBands).toBeDefined();
      if (analysis.indicators.bollingerBands) {
        expect(analysis.indicators.bollingerBands.upper).toBeGreaterThan(analysis.indicators.bollingerBands.middle);
        expect(analysis.indicators.bollingerBands.middle).toBeGreaterThan(analysis.indicators.bollingerBands.lower);
      }
    });

    it('should calculate Stochastic when configured', async () => {
      techAnalysis.updateConfig({
        stochasticPeriod: 14
      });

      const analysis = await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      expect(analysis.indicators.stochastic).toBeDefined();
      if (analysis.indicators.stochastic) {
        expect(analysis.indicators.stochastic.k).toBeGreaterThanOrEqual(0);
        expect(analysis.indicators.stochastic.k).toBeLessThanOrEqual(100);
        expect(analysis.indicators.stochastic.d).toBeGreaterThanOrEqual(0);
        expect(analysis.indicators.stochastic.d).toBeLessThanOrEqual(100);
      }
    });

    it('should calculate Williams %R when configured', async () => {
      techAnalysis.updateConfig({
        williamsRPeriod: 14
      });

      const analysis = await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      expect(analysis.indicators.williamsR).toBeDefined();
      if (analysis.indicators.williamsR) {
        expect(analysis.indicators.williamsR).toBeGreaterThanOrEqual(-100);
        expect(analysis.indicators.williamsR).toBeLessThanOrEqual(0);
      }
    });

    it('should calculate ATR when configured', async () => {
      techAnalysis.updateConfig({
        atrPeriod: 14
      });

      const analysis = await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      expect(analysis.indicators.atr).toBeDefined();
      if (analysis.indicators.atr) {
        expect(analysis.indicators.atr).toBeGreaterThan(0);
      }
    });
  });

  describe('Trend and Signal Analysis', () => {
    it('should determine trend correctly', async () => {
      const analysis = await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      expect(analysis.trend).toMatch(/bullish|bearish|neutral/);
    });

    it('should determine strength correctly', async () => {
      const analysis = await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      expect(analysis.strength).toMatch(/weak|moderate|strong/);
    });

    it('should calculate confidence correctly', async () => {
      const analysis = await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      expect(analysis.confidence).toBeGreaterThan(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
    });

    it('should generate trading signals correctly', async () => {
      const analysis = await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      expect(analysis.signals.buy).toBeDefined();
      expect(analysis.signals.sell).toBeDefined();
      expect(analysis.signals.hold).toBeDefined();
      
      // Only one signal should be true
      const trueSignals = [analysis.signals.buy, analysis.signals.sell, analysis.signals.hold]
        .filter(signal => signal).length;
      expect(trueSignals).toBe(1);
    });

    it('should generate reasoning correctly', async () => {
      const analysis = await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      expect(analysis.reasoning).toBeTruthy();
      expect(typeof analysis.reasoning).toBe('string');
      expect(analysis.reasoning.length).toBeGreaterThan(0);
    });
  });

  describe('Data Retrieval', () => {
    it('should retrieve latest technical analysis', async () => {
      await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      const analysis = techAnalysis.getTechnicalAnalysis('BTCUSDT');
      
      expect(analysis).toBeDefined();
      expect(analysis?.symbol).toBe('BTCUSDT');
    });

    it('should retrieve analysis history', async () => {
      await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      
      const history = techAnalysis.getAnalysisHistory('BTCUSDT');
      
      expect(history).toHaveLength(2);
      expect(history[0]?.symbol).toBe('BTCUSDT');
      expect(history[1]?.symbol).toBe('BTCUSDT');
    });

    it('should limit history to 100 entries', async () => {
      // Perform 105 analyses
      for (let i = 0; i < 105; i++) {
        await techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData);
      }
      
      const history = techAnalysis.getAnalysisHistory('BTCUSDT');
      
      expect(history).toHaveLength(100);
    });

    it('should return empty array for non-existent symbol', () => {
      const history = techAnalysis.getAnalysisHistory('NONEXISTENT');
      
      expect(history).toEqual([]);
    });

    it('should return undefined for non-existent symbol analysis', () => {
      const analysis = techAnalysis.getTechnicalAnalysis('NONEXISTENT');
      
      expect(analysis).toBeUndefined();
    });
  });

  describe('Status Management', () => {
    it('should return correct status when not running', () => {
      const status = techAnalysis.getStatus();
      
      expect(status.isRunning).toBe(false);
      expect(status.activeSymbols).toEqual([]);
    });

    it('should return correct status when running', () => {
      techAnalysis.startAnalysis(['BTCUSDT', 'ETHUSDT']);
      const status = techAnalysis.getStatus();
      
      expect(status.isRunning).toBe(true);
      expect(status.activeSymbols).toEqual(['BTCUSDT', 'ETHUSDT']);
    });
  });

  describe('Configuration Validation', () => {
    it('should handle invalid RSI periods', async () => {
      techAnalysis.updateConfig({ rsiPeriod: 0 });
      
      await expect(techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData))
        .rejects.toThrow('Invalid configuration: periods must be greater than 0');
    });

    it('should handle invalid moving average periods', async () => {
      techAnalysis.updateConfig({ maPeriod: 0, emaPeriod: 0 });
      
      await expect(techAnalysis.performTechnicalAnalysis('BTCUSDT', mockKlineData))
        .rejects.toThrow('Invalid configuration: periods must be greater than 0');
    });
  });
});
