import { AISymbolAnalysis, SentimentAnalysis, SentimentConfig, WebhookSentimentPayload } from '../../src/trading/AISymbolAnalysis';

describe('AISymbolAnalysis', () => {
  let aiAnalysis: AISymbolAnalysis;

  beforeEach(() => {
    // Reset singleton instance for each test
    (AISymbolAnalysis as any).instance = undefined;
    aiAnalysis = AISymbolAnalysis.getInstance();
  });

  afterEach(() => {
    // Clean up any running analysis
    if (aiAnalysis.getStatus().isRunning) {
      aiAnalysis.stopAnalysis();
    }
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AISymbolAnalysis.getInstance();
      const instance2 = AISymbolAnalysis.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration', () => {
    it('should have default configuration', () => {
      const config = aiAnalysis.getConfig();
      
      expect(config.webhookPort).toBe(3001);
      expect(config.minConfidence).toBe(0.3);
      expect(config.sentimentThresholds.bullish).toBe(0.2);
      expect(config.sentimentThresholds.bearish).toBe(-0.2);
      expect(config.sentimentThresholds.strong).toBe(0.6);
      expect(config.sentimentThresholds.moderate).toBe(0.3);
    });

    it('should update configuration', () => {
      const newConfig: Partial<SentimentConfig> = {
        webhookPort: 3002,
        minConfidence: 0.5,
        sentimentThresholds: {
          bullish: 0.3,
          bearish: -0.3,
          strong: 0.7,
          moderate: 0.4,
        }
      };

      aiAnalysis.updateConfig(newConfig);
      const config = aiAnalysis.getConfig();

      expect(config.webhookPort).toBe(3002);
      expect(config.minConfidence).toBe(0.5);
      expect(config.sentimentThresholds.bullish).toBe(0.3);
      expect(config.sentimentThresholds.bearish).toBe(-0.3);
      expect(config.sentimentThresholds.strong).toBe(0.7);
      expect(config.sentimentThresholds.moderate).toBe(0.4);
    });
  });

  describe('Status', () => {
    it('should return initial status', () => {
      const status = aiAnalysis.getStatus();
      
      expect(status.isRunning).toBe(false);
      expect(status.activeSymbols).toHaveLength(0);
      expect(status.totalAnalyses).toBe(0);
      expect(status.webhookPort).toBe(3001);
    });

    it('should return status with running analysis', () => {
      const symbols = ['BTCUSDT', 'ETHUSDT'];
      aiAnalysis.startAnalysis(symbols);
      
      const status = aiAnalysis.getStatus();
      
      expect(status.isRunning).toBe(true);
      expect(status.activeSymbols).toEqual(symbols);
      expect(status.webhookPort).toBe(3001);
    });
  });

  describe('Analysis Control', () => {
    it('should start analysis for symbols', () => {
      const symbols = ['BTCUSDT', 'ETHUSDT'];
      const eventSpy = jest.fn();
      
      aiAnalysis.on('analysis_started', eventSpy);
      aiAnalysis.startAnalysis(symbols);
      
      expect(aiAnalysis.getStatus().isRunning).toBe(true);
      expect(aiAnalysis.getStatus().activeSymbols).toEqual(symbols);
      expect(eventSpy).toHaveBeenCalledWith({
        symbols,
        timestamp: expect.any(Date)
      });
    });

    it('should not start analysis if already running', () => {
      const symbols1 = ['BTCUSDT'];
      const symbols2 = ['ETHUSDT'];
      
      aiAnalysis.startAnalysis(symbols1);
      
      aiAnalysis.startAnalysis(symbols2);
      const finalStatus = aiAnalysis.getStatus();
      
      expect(finalStatus.activeSymbols).toEqual(symbols1);
      expect(finalStatus.activeSymbols).not.toEqual(symbols2);
    });

    it('should stop analysis', () => {
      const symbols = ['BTCUSDT', 'ETHUSDT'];
      const eventSpy = jest.fn();
      
      aiAnalysis.startAnalysis(symbols);
      aiAnalysis.on('analysis_stopped', eventSpy);
      aiAnalysis.stopAnalysis();
      
      expect(aiAnalysis.getStatus().isRunning).toBe(false);
      expect(eventSpy).toHaveBeenCalledWith({
        timestamp: expect.any(Date)
      });
    });

    it('should not stop analysis if not running', () => {
      expect(() => aiAnalysis.stopAnalysis()).not.toThrow();
    });

    it('should add symbol to running analysis', () => {
      const symbols = ['BTCUSDT'];
      aiAnalysis.startAnalysis(symbols);
      
      aiAnalysis.addSymbol('ETHUSDT');
      
      expect(aiAnalysis.getStatus().activeSymbols).toContain('ETHUSDT');
    });

    it('should remove symbol from analysis', () => {
      const symbols = ['BTCUSDT', 'ETHUSDT'];
      aiAnalysis.startAnalysis(symbols);
      
      aiAnalysis.removeSymbol('BTCUSDT');
      
      expect(aiAnalysis.getStatus().activeSymbols).not.toContain('BTCUSDT');
      expect(aiAnalysis.getStatus().activeSymbols).toContain('ETHUSDT');
    });
  });

  describe('Webhook Sentiment Processing', () => {
    it('should process webhook sentiment data', () => {
      const symbol = 'BTCUSDT';
      const eventSpy = jest.fn();
      
      aiAnalysis.on('sentiment_analysis', eventSpy);
      aiAnalysis.startAnalysis([symbol]);
      
      const payload: WebhookSentimentPayload = {
        symbol: 'BTCUSDT',
        sentiment: 0.5,
        confidence: 0.8,
        source: 'news_api',
        text: 'Positive news about Bitcoin',
        metadata: { category: 'business' }
      };
      
      aiAnalysis.addSentimentData(payload);
      
      expect(eventSpy).toHaveBeenCalled();
      const analysis = eventSpy.mock.calls[eventSpy.mock.calls.length - 1][0] as SentimentAnalysis;
      
      expect(analysis.symbol).toBe(symbol);
      expect(analysis.overallSentiment).toBeGreaterThan(0);
      expect(analysis.trend).toBe('bullish');
      expect(analysis.sources.news.length).toBeGreaterThan(0);
    });

    it('should ignore sentiment for untracked symbols', () => {
      const symbol = 'BTCUSDT';
      aiAnalysis.startAnalysis([symbol]);
      
      const payload: WebhookSentimentPayload = {
        symbol: 'UNTRACKED',
        sentiment: 0.5,
        confidence: 0.8,
        source: 'news_api'
      };
      
      // Should not throw error
      expect(() => aiAnalysis.addSentimentData(payload)).not.toThrow();
    });

    it('should aggregate multiple sentiment sources', () => {
      const symbol = 'BTCUSDT';
      const eventSpy = jest.fn();
      
      aiAnalysis.on('sentiment_analysis', eventSpy);
      aiAnalysis.startAnalysis([symbol]);
      
      // Add multiple sentiment sources
      const payloads: WebhookSentimentPayload[] = [
        { symbol: 'BTCUSDT', sentiment: 0.5, confidence: 0.8, source: 'news_api' },
        { symbol: 'BTCUSDT', sentiment: -0.2, confidence: 0.6, source: 'twitter' },
        { symbol: 'BTCUSDT', sentiment: 0.3, confidence: 0.9, source: 'vix' }
      ];
      
      payloads.forEach(payload => aiAnalysis.addSentimentData(payload));
      
      expect(eventSpy).toHaveBeenCalled();
      const analysis = eventSpy.mock.calls[eventSpy.mock.calls.length - 1][0] as SentimentAnalysis;
      
      expect(analysis.sources.news.length).toBeGreaterThan(0);
      expect(analysis.sources.social.length).toBeGreaterThan(0);
      expect(analysis.sources.market.length).toBeGreaterThan(0);
    });
  });

  describe('Sentiment Data Retrieval', () => {
    it('should get sentiment analysis for symbol', () => {
      const symbol = 'BTCUSDT';
      aiAnalysis.startAnalysis([symbol]);
      
      const payload: WebhookSentimentPayload = {
        symbol: 'BTCUSDT',
        sentiment: 0.5,
        confidence: 0.8,
        source: 'news_api'
      };
      
      aiAnalysis.addSentimentData(payload);
      
      const analysis = aiAnalysis.getSentimentAnalysis(symbol);
      
      expect(analysis).not.toBeNull();
      expect(analysis?.symbol).toBe(symbol);
    });

    it('should return null for non-existent symbol', () => {
      const analysis = aiAnalysis.getSentimentAnalysis('NONEXISTENT');
      expect(analysis).toBeNull();
    });

    it('should get sentiment history', () => {
      const symbol = 'BTCUSDT';
      aiAnalysis.startAnalysis([symbol]);
      
      // Add multiple sentiment data points
      for (let i = 0; i < 5; i++) {
        const payload: WebhookSentimentPayload = {
          symbol: 'BTCUSDT',
          sentiment: Math.random() * 2 - 1,
          confidence: 0.8,
          source: 'news_api'
        };
        aiAnalysis.addSentimentData(payload);
      }
      
      const history = aiAnalysis.getSentimentHistory(symbol);
      
      expect(history).toBeInstanceOf(Array);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0]?.symbol).toBe(symbol);
    });

    it('should get sentiment history with limit', () => {
      const symbol = 'BTCUSDT';
      aiAnalysis.startAnalysis([symbol]);
      
      // Add multiple sentiment data points
      for (let i = 0; i < 10; i++) {
        const payload: WebhookSentimentPayload = {
          symbol: 'BTCUSDT',
          sentiment: Math.random() * 2 - 1,
          confidence: 0.8,
          source: 'news_api'
        };
        aiAnalysis.addSentimentData(payload);
      }
      
      const history = aiAnalysis.getSentimentHistory(symbol, 5);
      
      expect(history.length).toBeLessThanOrEqual(5);
    });

    it('should get sentiment trend for period', () => {
      const symbol = 'BTCUSDT';
      aiAnalysis.startAnalysis([symbol]);
      
      const payload: WebhookSentimentPayload = {
        symbol: 'BTCUSDT',
        sentiment: 0.5,
        confidence: 0.8,
        source: 'news_api'
      };
      
      aiAnalysis.addSentimentData(payload);
      
      const trend = aiAnalysis.getSentimentTrend(symbol, 24); // 24 hours
      
      expect(trend).toBeInstanceOf(Array);
      trend.forEach(analysis => {
        expect(analysis.timestamp.getTime()).toBeGreaterThan(Date.now() - 24 * 60 * 60 * 1000);
      });
    });
  });

  describe('Sentiment Aggregation', () => {
    it('should aggregate sentiment from multiple sources', () => {
      const symbol = 'BTCUSDT';
      const eventSpy = jest.fn();
      
      aiAnalysis.on('sentiment_analysis', eventSpy);
      aiAnalysis.startAnalysis([symbol]);
      
      const payloads: WebhookSentimentPayload[] = [
        { symbol: 'BTCUSDT', sentiment: 0.5, confidence: 0.8, source: 'news_api' },
        { symbol: 'BTCUSDT', sentiment: -0.2, confidence: 0.6, source: 'twitter' },
        { symbol: 'BTCUSDT', sentiment: 0.3, confidence: 0.9, source: 'vix' }
      ];
      
      payloads.forEach(payload => aiAnalysis.addSentimentData(payload));
      
      expect(eventSpy).toHaveBeenCalled();
      const analysis = eventSpy.mock.calls[eventSpy.mock.calls.length - 1][0] as SentimentAnalysis;
      
      expect(analysis).not.toBeNull();
      expect(analysis.sources.news.length).toBeGreaterThan(0);
      expect(analysis.sources.social.length).toBeGreaterThan(0);
      expect(analysis.sources.market.length).toBeGreaterThan(0);
    });

    it('should handle empty sentiment data', () => {
      const symbol = 'EMPTY';
      aiAnalysis.startAnalysis([symbol]);
      
      const analysis = aiAnalysis.getSentimentAnalysis(symbol);
      
      expect(analysis).toBeNull(); // No sentiment data added, so should be null
    });
  });

  describe('Event Emission', () => {
    it('should emit sentiment analysis events', () => {
      const symbol = 'BTCUSDT';
      const eventSpy = jest.fn();
      
      aiAnalysis.on('sentiment_analysis', eventSpy);
      aiAnalysis.startAnalysis([symbol]);
      
      const payload: WebhookSentimentPayload = {
        symbol: 'BTCUSDT',
        sentiment: 0.5,
        confidence: 0.8,
        source: 'news_api'
      };
      
      aiAnalysis.addSentimentData(payload);
      
      expect(eventSpy).toHaveBeenCalled();
      const analysis = eventSpy.mock.calls[eventSpy.mock.calls.length - 1][0] as SentimentAnalysis;
      
      expect(analysis.symbol).toBe(symbol);
      expect(analysis.overallSentiment).toBeDefined();
      expect(analysis.confidence).toBeDefined();
      expect(analysis.trend).toBeDefined();
      expect(analysis.strength).toBeDefined();
      expect(analysis.reasoning).toBeDefined();
      expect(analysis.timestamp).toBeInstanceOf(Date);
    });

    it('should emit analysis started event', () => {
      const symbols = ['BTCUSDT', 'ETHUSDT'];
      const eventSpy = jest.fn();
      
      aiAnalysis.on('analysis_started', eventSpy);
      aiAnalysis.startAnalysis(symbols);
      
      expect(eventSpy).toHaveBeenCalledWith({
        symbols,
        timestamp: expect.any(Date)
      });
    });

    it('should emit analysis stopped event', () => {
      const symbols = ['BTCUSDT'];
      const eventSpy = jest.fn();
      
      aiAnalysis.startAnalysis(symbols);
      aiAnalysis.on('analysis_stopped', eventSpy);
      aiAnalysis.stopAnalysis();
      
      expect(eventSpy).toHaveBeenCalledWith({
        timestamp: expect.any(Date)
      });
    });
  });

  describe('Configuration Validation', () => {
    it('should validate sentiment thresholds', () => {
      const config = aiAnalysis.getConfig();
      
      expect(config.sentimentThresholds.bullish).toBeGreaterThan(config.sentimentThresholds.bearish);
      expect(config.sentimentThresholds.strong).toBeGreaterThan(config.sentimentThresholds.moderate);
      expect(config.sentimentThresholds.moderate).toBeGreaterThan(0);
    });
  });

  describe('Memory Management', () => {
    it('should limit sentiment history size', () => {
      const symbol = 'BTCUSDT';
      aiAnalysis.startAnalysis([symbol]);
      
      // Add many sentiment data points
      for (let i = 0; i < 150; i++) {
        const payload: WebhookSentimentPayload = {
          symbol: 'BTCUSDT',
          sentiment: Math.random() * 2 - 1,
          confidence: 0.8,
          source: 'news_api'
        };
        aiAnalysis.addSentimentData(payload);
      }
      
      const history = aiAnalysis.getSentimentHistory(symbol);
      
      // Should be limited to 100 analyses
      expect(history.length).toBeLessThanOrEqual(100);
    });
  });
});
