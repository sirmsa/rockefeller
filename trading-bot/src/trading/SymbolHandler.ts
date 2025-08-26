import Logger from '@/logging/Logger';
import { BinanceManager, 
  SymbolInfo, 
  KlineData, 
  TickerData
} from './BinanceManager';
import { SessionManager } from '@/utils/SessionManager';
import { ValidationUtils } from '@/utils/ValidationUtils';
import { ValidationError } from '@/utils/errors/CustomErrors';

export interface SymbolData {
  symbol: string;
  info: SymbolInfo;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  lastUpdated: Date;
}

export interface TechnicalIndicators {
  rsi: number;
  ma20: number;
  ma50: number;
  ema12: number;
  ema26: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  volume: {
    current: number;
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  support: number[];
  resistance: number[];
  fibonacci: {
    level0: number;
    level236: number;
    level382: number;
    level500: number;
    level618: number;
    level786: number;
    level100: number;
  };
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-1
}

export interface SymbolAnalysis {
  symbol: string;
  timestamp: Date;
  data: SymbolData;
  technical: TechnicalIndicators;
  sentiment?: number; // -1 to 1
  confidence?: number; // 0 to 1
  recommendation?: 'buy' | 'sell' | 'hold';
  reasoning?: string;
}

export class SymbolHandler {
  private static instance: SymbolHandler;
  private logger = Logger.getInstance();

  private binanceManager = BinanceManager.getInstance();
  private sessionManager = SessionManager.getInstance();
  
  private symbolCache: Map<string, SymbolData> = new Map();
  private analysisCache: Map<string, SymbolAnalysis> = new Map();
  private lastUpdate: Map<string, number> = new Map();
  private updateInterval: number = 60000; // 1 minute

  private cleanupInterval: NodeJS.Timeout;

  private constructor() {
    // Start periodic cleanup
    this.cleanupInterval = setInterval(() => this.cleanupCache(), 300000); // 5 minutes
  }

  public static getInstance(): SymbolHandler {
    if (!SymbolHandler.instance) {
      SymbolHandler.instance = new SymbolHandler();
    }
    return SymbolHandler.instance;
  }

  /**
   * Initialize symbol data
   */
  public async initializeSymbol(symbol: string): Promise<SymbolData> {
    try {
      // Validate symbol
      const validation = ValidationUtils.validateSymbol(symbol);
      ValidationUtils.throwIfInvalid(validation, 'Symbol initialization');

      // Get symbol info from Binance
      const symbolInfo = await this.binanceManager.getSymbolInfo(symbol);
      if (!symbolInfo) {
        throw new ValidationError(`Symbol ${symbol} not found on Binance`, 'symbol', symbol, 'exists');
      }

      // Get initial ticker data
      const ticker = await this.binanceManager.getTicker24hr(symbol) as TickerData;

      const symbolData: SymbolData = {
        symbol,
        info: symbolInfo,
        currentPrice: parseFloat(ticker.lastPrice),
        priceChange24h: parseFloat(ticker.priceChange),
        priceChangePercent24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.volume),
        high24h: parseFloat(ticker.highPrice),
        low24h: parseFloat(ticker.lowPrice),
        lastUpdated: new Date()
      };

      // Cache the data
      this.symbolCache.set(symbol, symbolData);
      this.lastUpdate.set(symbol, Date.now());

      // Save to session
      this.sessionManager.setCache(`symbol_${symbol}`, symbolData, 300000); // 5 minutes

      this.logger.info('Symbol initialized', {
        type: 'SYMBOL_INITIALIZED',
        symbol,
        currentPrice: symbolData.currentPrice,
        priceChangePercent: symbolData.priceChangePercent24h
      });

      return symbolData;
    } catch (error) {
      this.logger.error('Failed to initialize symbol', {
        type: 'SYMBOL_INIT_ERROR',
        symbol,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Update symbol data
   */
  public async updateSymbolData(symbol: string): Promise<SymbolData> {
    try {
      const lastUpdate = this.lastUpdate.get(symbol) || 0;
      const now = Date.now();

      // Check if update is needed
      if (now - lastUpdate < this.updateInterval) {
        const cached = this.symbolCache.get(symbol);
        if (cached) {
          return cached;
        }
      }

      // Get fresh ticker data
      const ticker = await this.binanceManager.getTicker24hr(symbol) as TickerData;
      
      // Get cached symbol info or fetch new
      let symbolInfo = this.symbolCache.get(symbol)?.info;
      if (!symbolInfo) {
        const fetchedSymbolInfo = await this.binanceManager.getSymbolInfo(symbol);
        if (!fetchedSymbolInfo) {
          throw new ValidationError(`Symbol ${symbol} not found`, 'symbol', symbol, 'exists');
        }
        symbolInfo = fetchedSymbolInfo;
      }

      const symbolData: SymbolData = {
        symbol,
        info: symbolInfo,
        currentPrice: parseFloat(ticker.lastPrice),
        priceChange24h: parseFloat(ticker.priceChange),
        priceChangePercent24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.volume),
        high24h: parseFloat(ticker.highPrice),
        low24h: parseFloat(ticker.lowPrice),
        lastUpdated: new Date()
      };

      // Update cache
      this.symbolCache.set(symbol, symbolData);
      this.lastUpdate.set(symbol, now);

      // Save to session
      this.sessionManager.setCache(`symbol_${symbol}`, symbolData, 300000);

      this.logger.debug('Symbol data updated', {
        type: 'SYMBOL_DATA_UPDATED',
        symbol,
        currentPrice: symbolData.currentPrice,
        priceChangePercent: symbolData.priceChangePercent24h
      });

      return symbolData;
    } catch (error) {
      this.logger.error('Failed to update symbol data', {
        type: 'SYMBOL_UPDATE_ERROR',
        symbol,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get symbol data (cached or fresh)
   */
  public async getSymbolData(symbol: string): Promise<SymbolData> {
    // Check cache first
    const cached = this.symbolCache.get(symbol);
    if (cached) {
      return cached;
    }

    // Check session cache
    const sessionCached = this.sessionManager.getCache(`symbol_${symbol}`);
    if (sessionCached) {
      this.symbolCache.set(symbol, sessionCached);
      this.lastUpdate.set(symbol, Date.now());
      return sessionCached;
    }

    // Initialize if not found
    return this.initializeSymbol(symbol);
  }

  /**
   * Get kline data for technical analysis
   */
  public async getKlineData(
    symbol: string,
    interval: string = '1h',
    limit: number = 100
  ): Promise<KlineData[]> {
    try {
      const klines = await this.binanceManager.getKlines(symbol, interval, limit);
      
      this.logger.debug('Kline data retrieved', {
        type: 'KLINE_DATA_RETRIEVED',
        symbol,
        interval,
        limit,
        count: klines.length
      });

      return klines;
    } catch (error) {
      this.logger.error('Failed to get kline data', {
        type: 'KLINE_DATA_ERROR',
        symbol,
        interval,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Calculate technical indicators
   */
  public calculateTechnicalIndicators(
    klines: KlineData[],
    currentPrice: number
  ): TechnicalIndicators {
    if (klines.length < 50) {
      throw new Error('Insufficient data for technical analysis (minimum 50 candles required)');
    }

    const closes = klines.map(k => parseFloat(k.close));
    const volumes = klines.map(k => parseFloat(k.volume));
    const highs = klines.map(k => parseFloat(k.high));
    const lows = klines.map(k => parseFloat(k.low));

    // Calculate RSI
    const rsi = this.calculateRSI(closes, 14);

    // Calculate Moving Averages
    const ma20 = this.calculateSMA(closes, 20);
    const ma50 = this.calculateSMA(closes, 50);
    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);

    // Calculate MACD
    const macd = this.calculateMACD(closes);

    // Calculate Bollinger Bands
    const bollingerBands = this.calculateBollingerBands(closes, 20, 2);

    // Calculate Volume Analysis
    const volume = this.analyzeVolume(volumes);

    // Calculate Support and Resistance
    const support = this.calculateSupportLevels(lows);
    const resistance = this.calculateResistanceLevels(highs);

    // Calculate Fibonacci Retracements
    const fibonacci = this.calculateFibonacciRetracements(
      Math.max(...highs),
      Math.min(...lows)
    );

    // Determine trend and strength
    const trend = this.determineTrend(currentPrice, ma20, ma50, ema12, ema26);
    const strength = this.calculateTrendStrength(currentPrice, ma20, ma50, rsi);

    return {
      rsi,
      ma20,
      ma50,
      ema12,
      ema26,
      macd,
      bollingerBands,
      volume,
      support,
      resistance,
      fibonacci,
      trend,
      strength
    };
  }

  /**
   * Calculate RSI (Relative Strength Index)
   */
  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) {
      return 50; // Neutral RSI if insufficient data
    }

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const currentPrice = prices[i];
      const previousPrice = prices[i - 1];
      if (currentPrice !== undefined && previousPrice !== undefined) {
        const change = currentPrice - previousPrice;
        if (change > 0) {
          gains += change;
        } else {
          losses -= change;
        }
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) {
      return 100;
    }

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * Calculate Simple Moving Average
   */
  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) {
      const lastPrice = prices[prices.length - 1];
      return lastPrice !== undefined ? lastPrice : 0;
    }

    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  /**
   * Calculate Exponential Moving Average
   */
  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) {
      const lastPrice = prices[prices.length - 1];
      return lastPrice !== undefined ? lastPrice : 0;
    }

    const multiplier = 2 / (period + 1);
    const firstPrice = prices[0];
    if (firstPrice === undefined) return 0;
    
    let ema = firstPrice;

    for (let i = 1; i < prices.length; i++) {
      const currentPrice = prices[i];
      if (currentPrice !== undefined) {
        ema = (currentPrice * multiplier) + (ema * (1 - multiplier));
      }
    }

    return ema;
  }

  /**
   * Calculate MACD
   */
  private calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    const signal = this.calculateEMA([macd], 9); // Simplified signal calculation
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  /**
   * Calculate Bollinger Bands
   */
  private calculateBollingerBands(
    prices: number[],
    period: number = 20,
    stdDev: number = 2
  ): { upper: number; middle: number; lower: number } {
    const sma = this.calculateSMA(prices, period);
    const variance = prices.slice(-period).reduce((sum, price) => {
      return sum + Math.pow(price - sma, 2);
    }, 0) / period;
    const standardDeviation = Math.sqrt(variance);

    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev)
    };
  }

  /**
   * Analyze volume trends
   */
  private analyzeVolume(volumes: number[]): { current: number; average: number; trend: 'increasing' | 'decreasing' | 'stable' } {
    const current = volumes[volumes.length - 1] || 0;
    const average = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    
    const recentVolumes = volumes.slice(-5);
    const recentAvg = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
    const previousAvg = volumes.slice(-10, -5).reduce((a, b) => a + b, 0) / 5;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentAvg > previousAvg * 1.1) {
      trend = 'increasing';
    } else if (recentAvg < previousAvg * 0.9) {
      trend = 'decreasing';
    }

    return { current, average, trend };
  }

  /**
   * Calculate support levels
   */
  private calculateSupportLevels(lows: number[]): number[] {
    const sortedLows = [...lows].sort((a, b) => a - b);
    const uniqueLows = [...new Set(sortedLows)];
    return uniqueLows.slice(0, 3); // Return top 3 support levels
  }

  /**
   * Calculate resistance levels
   */
  private calculateResistanceLevels(highs: number[]): number[] {
    const sortedHighs = [...highs].sort((a, b) => b - a);
    const uniqueHighs = [...new Set(sortedHighs)];
    return uniqueHighs.slice(0, 3); // Return top 3 resistance levels
  }

  /**
   * Calculate Fibonacci retracements
   */
  private calculateFibonacciRetracements(high: number, low: number): {
    level0: number;
    level236: number;
    level382: number;
    level500: number;
    level618: number;
    level786: number;
    level100: number;
  } {
    const range = high - low;
    
    return {
      level0: high,
      level236: high - (range * 0.236),
      level382: high - (range * 0.382),
      level500: high - (range * 0.500),
      level618: high - (range * 0.618),
      level786: high - (range * 0.786),
      level100: low
    };
  }

  /**
   * Determine trend direction
   */
  private determineTrend(
    currentPrice: number,
    ma20: number,
    ma50: number,
    ema12: number,
    ema26: number
  ): 'bullish' | 'bearish' | 'neutral' {
    const aboveMA20 = currentPrice > ma20;
    const aboveMA50 = currentPrice > ma50;
    const ema12AboveEMA26 = ema12 > ema26;

    // If all values are equal, it's neutral
    if (currentPrice === ma20 && ma20 === ma50 && ma50 === ema12 && ema12 === ema26) {
      return 'neutral';
    }

    if (aboveMA20 && aboveMA50 && ema12AboveEMA26) {
      return 'bullish';
    } else if (!aboveMA20 && !aboveMA50 && !ema12AboveEMA26) {
      return 'bearish';
    } else {
      return 'neutral';
    }
  }

  /**
   * Calculate trend strength (0-1)
   */
  private calculateTrendStrength(
    currentPrice: number,
    ma20: number,
    ma50: number,
    rsi: number
  ): number {
    const priceStrength = Math.abs(currentPrice - ma20) / ma20;
    const maStrength = Math.abs(ma20 - ma50) / ma50;
    const rsiStrength = Math.abs(rsi - 50) / 50;

    return Math.min((priceStrength + maStrength + rsiStrength) / 3, 1);
  }

  /**
   * Perform complete symbol analysis
   */
  public async analyzeSymbol(symbol: string): Promise<SymbolAnalysis> {
    try {
      // Get current symbol data
      const symbolData = await this.getSymbolData(symbol);

      // Get kline data for technical analysis
      const klines = await this.getKlineData(symbol, '1h', 100);

      // Calculate technical indicators
      const technical = this.calculateTechnicalIndicators(klines, symbolData.currentPrice);

      // Create analysis
      const analysis: SymbolAnalysis = {
        symbol,
        timestamp: new Date(),
        data: symbolData,
        technical,
        recommendation: this.generateRecommendation(technical, symbolData),
        reasoning: this.generateReasoning(technical, symbolData)
      };

      // Cache analysis
      this.analysisCache.set(symbol, analysis);
      this.sessionManager.setCache(`analysis_${symbol}`, analysis, 300000); // 5 minutes

      this.logger.info('Symbol analysis completed', {
        type: 'SYMBOL_ANALYSIS_COMPLETED',
        symbol,
        recommendation: analysis.recommendation,
        rsi: technical.rsi,
        trend: technical.trend,
        strength: technical.strength
      });

      return analysis;
    } catch (error) {
      this.logger.error('Failed to analyze symbol', {
        type: 'SYMBOL_ANALYSIS_ERROR',
        symbol,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Generate trading recommendation
   */
  private generateRecommendation(
    technical: TechnicalIndicators,
    data: SymbolData
  ): 'buy' | 'sell' | 'hold' {
    const { rsi, trend, strength, macd, bollingerBands } = technical;
    const currentPrice = data.currentPrice;

    // RSI conditions
    const rsiOversold = rsi < 30;
    const rsiOverbought = rsi > 70;

    // MACD conditions
    const macdBullish = macd.macd > macd.signal && macd.histogram > 0;
    const macdBearish = macd.macd < macd.signal && macd.histogram < 0;

    // Bollinger Bands conditions
    const nearLowerBand = currentPrice <= bollingerBands.lower * 1.02;
    const nearUpperBand = currentPrice >= bollingerBands.upper * 0.98;

    // Trend conditions
    const strongBullish = trend === 'bullish' && strength > 0.7;
    const strongBearish = trend === 'bearish' && strength > 0.7;

    // Generate recommendation
    if (strongBullish && rsiOversold && macdBullish && nearLowerBand) {
      return 'buy';
    } else if (strongBearish && rsiOverbought && macdBearish && nearUpperBand) {
      return 'sell';
    } else {
      return 'hold';
    }
  }

  /**
   * Generate reasoning for recommendation
   */
  private generateReasoning(
    technical: TechnicalIndicators,
    data: SymbolData
  ): string {
    const { rsi, trend, strength, macd, bollingerBands } = technical;
    
    let reasoning = `Trend: ${trend} (strength: ${(strength * 100).toFixed(1)}%), `;
    reasoning += `RSI: ${rsi.toFixed(1)}, `;
    reasoning += `MACD: ${macd.macd > macd.signal ? 'bullish' : 'bearish'}, `;
    reasoning += `Price vs BB: ${data.currentPrice > bollingerBands.upper ? 'above upper' : data.currentPrice < bollingerBands.lower ? 'below lower' : 'within bands'}`;
    
    return reasoning;
  }

  /**
   * Get cached analysis
   */
  public getCachedAnalysis(symbol: string): SymbolAnalysis | null {
    return this.analysisCache.get(symbol) || null;
  }

  /**
   * Get all tracked symbols
   */
  public getTrackedSymbols(): string[] {
    return Array.from(this.symbolCache.keys());
  }

  /**
   * Remove symbol from tracking
   */
  public removeSymbol(symbol: string): void {
    this.symbolCache.delete(symbol);
    this.analysisCache.delete(symbol);
    this.lastUpdate.delete(symbol);
    this.sessionManager.setCache(`symbol_${symbol}`, null);
    this.sessionManager.setCache(`analysis_${symbol}`, null);

    this.logger.info('Symbol removed from tracking', {
      type: 'SYMBOL_REMOVED',
      symbol
    });
  }

  /**
   * Cleanup old cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    const symbolsToRemove: string[] = [];

    for (const [symbol, lastUpdate] of this.lastUpdate.entries()) {
      if (now - lastUpdate > 3600000) { // 1 hour
        symbolsToRemove.push(symbol);
      }
    }

    for (const symbol of symbolsToRemove) {
      this.removeSymbol(symbol);
    }

    if (symbolsToRemove.length > 0) {
      this.logger.info('Cache cleanup completed', {
        type: 'SYMBOL_CACHE_CLEANUP',
        removedSymbols: symbolsToRemove.length
      });
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    trackedSymbols: number;
    cachedAnalyses: number;
    lastCleanup: number;
  } {
    return {
      trackedSymbols: this.symbolCache.size,
      cachedAnalyses: this.analysisCache.size,
      lastCleanup: Date.now()
    };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
