import { EventEmitter } from 'events';
import * as http from 'http';

// Sentiment Analysis Interfaces
export interface SentimentData {
  source: string;
  symbol: string;
  sentiment: number; // -1 to 1 (negative to positive)
  confidence: number; // 0 to 1
  timestamp: Date;
  text?: string | undefined;
  url?: string | undefined;
  metadata?: Record<string, any> | undefined;
}

export interface SentimentAnalysis {
  symbol: string;
  overallSentiment: number; // -1 to 1
  confidence: number; // 0 to 1
  sources: {
    news: SentimentData[];
    social: SentimentData[];
    market: SentimentData[];
  };
  reasoning: string;
  timestamp: Date;
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: 'weak' | 'moderate' | 'strong';
}

export interface SentimentConfig {
  webhookPort: number; // Port for receiving webhook sentiment data
  minConfidence: number;
  sentimentThresholds: {
    bullish: number;
    bearish: number;
    strong: number;
    moderate: number;
  };
}

export interface SentimentHistory {
  symbol: string;
  analyses: SentimentAnalysis[];
  lastUpdated: Date;
}

export interface WebhookSentimentPayload {
  symbol: string;
  sentiment: number;
  confidence: number;
  source: string;
  text?: string | undefined;
  url?: string | undefined;
  metadata?: Record<string, any> | undefined;
}

export class AISymbolAnalysis extends EventEmitter {
  private static instance: AISymbolAnalysis;
  private config: SentimentConfig;
  private sentimentHistory: Map<string, SentimentHistory> = new Map();
  private pendingSentimentData: Map<string, SentimentData[]> = new Map();
  private isRunning: boolean = false;
  private webhookServer: http.Server | null = null;

  private constructor() {
    super();
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): AISymbolAnalysis {
    if (!AISymbolAnalysis.instance) {
      AISymbolAnalysis.instance = new AISymbolAnalysis();
    }
    return AISymbolAnalysis.instance;
  }

  private getDefaultConfig(): SentimentConfig {
    return {
      webhookPort: 3001,
      minConfidence: 0.3,
      sentimentThresholds: {
        bullish: 0.2,
        bearish: -0.2,
        strong: 0.6,
        moderate: 0.3,
      },
    };
  }

  public startAnalysis(symbols: string[]): void {
    if (this.isRunning) {
      console.log('AISymbolAnalysis is already running');
      return;
    }

    this.isRunning = true;
    console.log(`Starting AI sentiment analysis for ${symbols.length} symbols`);
    
    // Initialize sentiment data storage for each symbol
    symbols.forEach(symbol => {
      this.pendingSentimentData.set(symbol, []);
      // this.pendingSentimentData.set(symbol, []);
    });

    // Start webhook server to receive sentiment data
    this.startWebhookServer();

    this.emit('analysis_started', { symbols, timestamp: new Date() });
  }

  public stopAnalysis(): void {
    if (!this.isRunning) {
      console.log('AISymbolAnalysis is not running');
      return;
    }

    this.isRunning = false;
    console.log('Stopping AI sentiment analysis');

    // Stop webhook server
    if (this.webhookServer) {
      this.webhookServer.close();
      this.webhookServer = null;
    }

    this.emit('analysis_stopped', { timestamp: new Date() });
  }

  public addSymbol(symbol: string): void {
    this.pendingSentimentData.set(symbol, []);
    if (this.isRunning) {
      // this.pendingSentimentData.set(symbol, []);
      console.log(`Added symbol to analysis: ${symbol}`);
    }
  }

  public removeSymbol(symbol: string): void {
    this.pendingSentimentData.delete(symbol);
    console.log(`Removed symbol from analysis: ${symbol}`);
  }

  private startWebhookServer(): void {
    this.webhookServer = http.createServer((req, res) => {
      if (req.method === 'POST' && req.url === '/webhook/sentiment') {
        let body = '';
        
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const payload: WebhookSentimentPayload = JSON.parse(body);
            this.processWebhookSentiment(payload);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Sentiment data received' }));
          } catch (error) {
            console.error('Error processing webhook sentiment:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid payload' }));
          }
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Not found' }));
      }
    });

    this.webhookServer.listen(this.config.webhookPort, () => {
      console.log(`Webhook server listening on port ${this.config.webhookPort}`);
    });
  }

  private processWebhookSentiment(payload: WebhookSentimentPayload): void {
    const { symbol, sentiment, confidence, source, text, url, metadata } = payload;
    
    // Validate the symbol is being tracked
    if (!this.pendingSentimentData.has(symbol)) {
      console.warn(`Received sentiment for untracked symbol: ${symbol}`);
      return;
    }

    // Create sentiment data object
    const sentimentData: SentimentData = {
      source,
      symbol,
      sentiment,
      confidence,
      timestamp: new Date(),
      text,
      url,
      metadata
    };

    // Add to pending data for this symbol
    const symbolData = this.pendingSentimentData.get(symbol) || [];
    symbolData.push(sentimentData);
    this.pendingSentimentData.set(symbol, symbolData);

    console.log(`Received sentiment for ${symbol}: ${sentiment} (${source})`);

    // Trigger sentiment analysis if we have enough data
    this.triggerSentimentAnalysis(symbol);
  }

  private triggerSentimentAnalysis(symbol: string): void {
    const symbolData = this.pendingSentimentData.get(symbol) || [];
    
    // Only analyze if we have data and confidence is sufficient
    if (symbolData.length > 0) {
      const analysis = this.aggregateSentiment(symbol, symbolData);
      
      // Store in history
      this.updateSentimentHistory(symbol, analysis);
      
      // Clear pending data for this symbol
      // this.pendingSentimentData.set(symbol, []);
      
      // Emit analysis result
      this.emit('sentiment_analysis', analysis);
      
      console.log(`Completed sentiment analysis for ${symbol}: ${analysis.trend} (${analysis.overallSentiment.toFixed(3)})`);
    }
  }

  private aggregateSentiment(symbol: string, sentimentData: SentimentData[]): SentimentAnalysis {
    if (sentimentData.length === 0) {
      return this.createNeutralAnalysis(symbol);
    }

    // Group by source type
    const newsData = sentimentData.filter(d => d.source.includes('news') || d.source.includes('article') || d.source.includes('api') || d.source === 'news_api');
    const socialData = sentimentData.filter(d => d.source.includes('social') || d.source.includes('twitter') || d.source.includes('reddit') || d.source === 'twitter');
    const marketData = sentimentData.filter(d => d.source.includes('market') || d.source.includes('vix') || d.source.includes('fear') || d.source === 'vix');

    // Calculate weighted sentiment for each type
    const newsSentiment = this.calculateWeightedSentiment(newsData);
    const socialSentiment = this.calculateWeightedSentiment(socialData);
    const marketSentiment = this.calculateWeightedSentiment(marketData);

    // Calculate overall weighted sentiment
    const overallSentiment = this.calculateOverallSentiment({
      news: newsSentiment,
      social: socialSentiment,
      market: marketSentiment
    });

    // Determine trend and strength
    const trend = this.determineTrend(overallSentiment);
    const strength = this.determineStrength(Math.abs(overallSentiment));

    // Generate reasoning
    const reasoning = this.generateReasoning({
      overallSentiment,
      newsSentiment,
      socialSentiment,
      marketSentiment,
      trend,
      strength
    });

    return {
      symbol,
      overallSentiment,
      confidence: this.calculateOverallConfidence(sentimentData),
      sources: {
        news: newsData,
        social: socialData,
        market: marketData
      },
      reasoning,
      timestamp: new Date(),
      trend,
      strength
    };
  }

  private calculateWeightedSentiment(data: SentimentData[]): { sentiment: number; confidence: number } {
    if (data.length === 0) {
      return { sentiment: 0, confidence: 0 };
    }

    let totalWeight = 0;
    let weightedSentiment = 0;
    let totalConfidence = 0;

    data.forEach(item => {
      const weight = item.confidence; // Use confidence as weight
      
      weightedSentiment += item.sentiment * weight;
      totalWeight += weight;
      totalConfidence += item.confidence;
    });

    return {
      sentiment: totalWeight > 0 ? weightedSentiment / totalWeight : 0,
      confidence: data.length > 0 ? totalConfidence / data.length : 0
    };
  }

  private calculateOverallSentiment(typeSentiments: {
    news: { sentiment: number; confidence: number };
    social: { sentiment: number; confidence: number };
    market: { sentiment: number; confidence: number };
  }): number {
    const weights = { news: 0.4, social: 0.3, market: 0.3 };
    
    let totalWeight = 0;
    let weightedSentiment = 0;

    Object.entries(typeSentiments).forEach(([type, data]) => {
      const weight = weights[type as keyof typeof weights] * data.confidence;
      weightedSentiment += data.sentiment * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSentiment / totalWeight : 0;
  }

  private determineTrend(sentiment: number): 'bullish' | 'bearish' | 'neutral' {
    if (sentiment > this.config.sentimentThresholds.bullish) {
      return 'bullish';
    } else if (sentiment < this.config.sentimentThresholds.bearish) {
      return 'bearish';
    } else {
      return 'neutral';
    }
  }

  private determineStrength(absSentiment: number): 'weak' | 'moderate' | 'strong' {
    if (absSentiment > this.config.sentimentThresholds.strong) {
      return 'strong';
    } else if (absSentiment > this.config.sentimentThresholds.moderate) {
      return 'moderate';
    } else {
      return 'weak';
    }
  }

  private generateReasoning(data: {
    overallSentiment: number;
    newsSentiment: { sentiment: number; confidence: number };
    socialSentiment: { sentiment: number; confidence: number };
    marketSentiment: { sentiment: number; confidence: number };
    trend: string;
    strength: string;
  }): string {
    const { overallSentiment, newsSentiment, socialSentiment, marketSentiment, trend, strength } = data;
    
    let reasoning = `Overall sentiment is ${trend} (${strength}) with a score of ${overallSentiment.toFixed(3)}. `;
    
    if (newsSentiment.confidence > 0.5) {
      reasoning += `News sentiment is ${newsSentiment.sentiment > 0 ? 'positive' : 'negative'} (${newsSentiment.sentiment.toFixed(3)}). `;
    }
    
    if (socialSentiment.confidence > 0.5) {
      reasoning += `Social media sentiment is ${socialSentiment.sentiment > 0 ? 'positive' : 'negative'} (${socialSentiment.sentiment.toFixed(3)}). `;
    }
    
    if (marketSentiment.confidence > 0.5) {
      reasoning += `Market sentiment is ${marketSentiment.sentiment > 0 ? 'positive' : 'negative'} (${marketSentiment.sentiment.toFixed(3)}). `;
    }
    
    return reasoning.trim();
  }

  private calculateOverallConfidence(data: SentimentData[]): number {
    if (data.length === 0) return 0;
    
    const totalConfidence = data.reduce((sum, item) => sum + item.confidence, 0);
    return totalConfidence / data.length;
  }

  private createNeutralAnalysis(symbol: string): SentimentAnalysis {
    return {
      symbol,
      overallSentiment: 0,
      confidence: 0,
      sources: { news: [], social: [], market: [] },
      reasoning: 'No sentiment data available',
      timestamp: new Date(),
      trend: 'neutral',
      strength: 'weak'
    };
  }

  private updateSentimentHistory(symbol: string, analysis: SentimentAnalysis): void {
    let history = this.sentimentHistory.get(symbol);
    
    if (!history) {
      history = {
        symbol,
        analyses: [],
        lastUpdated: new Date()
      };
    }
    
    history.analyses.push(analysis);
    history.lastUpdated = new Date();
    
    // Keep only last 100 analyses to prevent memory bloat
    if (history.analyses.length > 100) {
      history.analyses = history.analyses.slice(-100);
    }
    
    this.sentimentHistory.set(symbol, history);
  }

  // Public API methods
  public getSentimentAnalysis(symbol: string): SentimentAnalysis | null {
    const history = this.sentimentHistory.get(symbol);
    return history?.analyses[history.analyses.length - 1] || null;
  }

  public getSentimentHistory(symbol: string, limit: number = 10): SentimentAnalysis[] {
    const history = this.sentimentHistory.get(symbol);
    if (!history) return [];
    
    return history.analyses.slice(-limit);
  }

  public getSentimentTrend(symbol: string, period: number = 24): SentimentAnalysis[] {
    const history = this.sentimentHistory.get(symbol);
    if (!history) return [];
    
    const cutoffTime = new Date(Date.now() - period * 60 * 60 * 1000); // hours to milliseconds
    return history.analyses.filter(analysis => analysis.timestamp > cutoffTime);
  }

  public updateConfig(newConfig: Partial<SentimentConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('AISymbolAnalysis configuration updated');
  }

  public getConfig(): SentimentConfig {
    return { ...this.config };
  }

  public getStatus(): {
    isRunning: boolean;
    activeSymbols: string[];
    totalAnalyses: number;
    webhookPort: number;
  } {
    return {
      isRunning: this.isRunning,
      activeSymbols: Array.from(this.pendingSentimentData.keys()),
      totalAnalyses: Array.from(this.sentimentHistory.values()).reduce((sum, history) => sum + history.analyses.length, 0),
      webhookPort: this.config.webhookPort
    };
  }

  // Method to manually add sentiment data (for testing or direct integration)
  public addSentimentData(payload: WebhookSentimentPayload): void {
    this.processWebhookSentiment(payload);
  }
}
