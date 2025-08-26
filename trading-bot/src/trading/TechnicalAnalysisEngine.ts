import { EventEmitter } from 'events';

// Technical Analysis Interfaces
export interface KlineData {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  quoteAssetVolume: number;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: number;
  takerBuyQuoteAssetVolume: number;
}

export interface TechnicalIndicators {
  rsi: number;
  ma: {
    sma: number;
    ema: number;
  };
  volume: {
    trend: 'increasing' | 'decreasing' | 'stable';
    average: number;
    ratio: number;
  };
  fibonacci: {
    retracements: number[];
    support: number;
    resistance: number;
  };
  support: number;
  resistance: number;
  macd?: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands?: {
    upper: number;
    middle: number;
    lower: number;
  };
  stochastic?: {
    k: number;
    d: number;
  };
  williamsR?: number;
  atr?: number;
}

export interface TechnicalAnalysis {
  symbol: string;
  timeframe: string;
  indicators: TechnicalIndicators;
  timestamp: Date;
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: 'weak' | 'moderate' | 'strong';
  confidence: number; // 0 to 1
  signals: {
    buy: boolean;
    sell: boolean;
    hold: boolean;
  };
  reasoning: string;
}

export interface TechnicalConfig {
  rsiPeriod: number;
  rsiOverbought: number;
  rsiOversold: number;
  maPeriod: number;
  emaPeriod: number;
  volumePeriod: number;
  fibonacciLevels: number[];
  supportResistancePeriod: number;
  macdPeriod?: {
    fast: number;
    slow: number;
    signal: number;
  };
  bollingerPeriod?: number;
  bollingerStdDev?: number;
  stochasticPeriod?: number;
  williamsRPeriod?: number;
  atrPeriod?: number;
}

export class TechnicalAnalysisEngine extends EventEmitter {
  private static instance: TechnicalAnalysisEngine;
  private config: TechnicalConfig;
  private analysisHistory: Map<string, TechnicalAnalysis[]> = new Map();
  private activeAnalysis: Set<string> = new Set();

  private constructor() {
    super();
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): TechnicalAnalysisEngine {
    if (!TechnicalAnalysisEngine.instance) {
      TechnicalAnalysisEngine.instance = new TechnicalAnalysisEngine();
    }
    return TechnicalAnalysisEngine.instance;
  }

  private getDefaultConfig(): TechnicalConfig {
    return {
      rsiPeriod: 14,
      rsiOverbought: 70,
      rsiOversold: 30,
      maPeriod: 20,
      emaPeriod: 20,
      volumePeriod: 20,
      fibonacciLevels: [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1],
      supportResistancePeriod: 20,
      macdPeriod: {
        fast: 12,
        slow: 26,
        signal: 9
      },
      bollingerPeriod: 20,
      bollingerStdDev: 2,
      stochasticPeriod: 14,
      williamsRPeriod: 14,
      atrPeriod: 14
    };
  }

  public updateConfig(newConfig: Partial<TechnicalConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config_updated', this.config);
  }

  public getConfig(): TechnicalConfig {
    return { ...this.config };
  }

  public startAnalysis(symbols: string[]): void {
    symbols.forEach(symbol => {
      this.activeAnalysis.add(symbol);
      this.analysisHistory.set(symbol, []);
    });
    this.emit('analysis_started', symbols);
  }

  public stopAnalysis(): void {
    this.activeAnalysis.clear();
    this.emit('analysis_stopped');
  }

  public addSymbol(symbol: string): void {
    this.activeAnalysis.add(symbol);
    this.analysisHistory.set(symbol, []);
    this.emit('symbol_added', symbol);
  }

  public removeSymbol(symbol: string): void {
    this.activeAnalysis.delete(symbol);
    this.analysisHistory.delete(symbol);
    this.emit('symbol_removed', symbol);
  }

  public async performTechnicalAnalysis(symbol: string, klineData: KlineData[]): Promise<TechnicalAnalysis> {
    try {
      // Validate configuration periods
      if (this.config.rsiPeriod <= 0 || this.config.maPeriod <= 0 || this.config.volumePeriod <= 0) {
        throw new Error('Invalid configuration: periods must be greater than 0');
      }
      
      if (klineData.length < Math.max(this.config.rsiPeriod, this.config.maPeriod, this.config.volumePeriod)) {
        throw new Error('Insufficient data for technical analysis');
      }

      const indicators = this.calculateIndicators(klineData);
      const analysis = this.createAnalysis(symbol, indicators, klineData);
      
      this.updateAnalysisHistory(symbol, analysis);
      this.emit('technical_analysis', analysis);
      
      return analysis;
    } catch (error) {
      this.emit('analysis_error', { symbol, error: (error as Error).message });
      throw error;
    }
  }

  private calculateIndicators(klineData: KlineData[]): TechnicalIndicators {
    const closes = klineData.map(k => k.close);
    const highs = klineData.map(k => k.high);
    const lows = klineData.map(k => k.low);
    const volumes = klineData.map(k => k.volume);

    const baseIndicators = {
      rsi: this.calculateRSI(closes),
      ma: {
        sma: this.calculateSMA(closes),
        ema: this.calculateEMA(closes)
      },
      volume: this.calculateVolumeTrend(volumes),
      fibonacci: this.calculateFibonacciRetracements(highs, lows),
      support: this.calculateSupport(lows),
      resistance: this.calculateResistance(highs)
    };

    // Add optional indicators
    const macd = this.calculateMACD(closes);
    const bollingerBands = this.calculateBollingerBands(closes);
    const stochastic = this.calculateStochastic(highs, lows, closes);
    const williamsR = this.calculateWilliamsR(highs, lows, closes);
    const atr = this.calculateATR(highs, lows, closes);

    return {
      ...baseIndicators,
      ...(macd && { macd }),
      ...(bollingerBands && { bollingerBands }),
      ...(stochastic && { stochastic }),
      ...(williamsR !== undefined && { williamsR }),
      ...(atr !== undefined && { atr })
    };
  }

  private calculateRSI(prices: number[]): number {
    if (prices.length < this.config.rsiPeriod + 1) {
      return 50; // Neutral RSI
    }

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= this.config.rsiPeriod; i++) {
      const change = prices[i]! - prices[i - 1]!;
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    let avgGain = gains / this.config.rsiPeriod;
    let avgLoss = losses / this.config.rsiPeriod;

    // Calculate RSI using exponential smoothing
    for (let i = this.config.rsiPeriod + 1; i < prices.length; i++) {
      const change = prices[i]! - prices[i - 1]!;
      if (change > 0) {
        avgGain = (avgGain * (this.config.rsiPeriod - 1) + change) / this.config.rsiPeriod;
        avgLoss = (avgLoss * (this.config.rsiPeriod - 1)) / this.config.rsiPeriod;
      } else {
        avgGain = (avgGain * (this.config.rsiPeriod - 1)) / this.config.rsiPeriod;
        avgLoss = (avgLoss * (this.config.rsiPeriod - 1) + Math.abs(change)) / this.config.rsiPeriod;
      }
    }

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateSMA(prices: number[]): number {
    const period = Math.min(this.config.maPeriod, prices.length);
    const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
    return sum / period;
  }

  private calculateEMA(prices: number[]): number {
    const period = Math.min(this.config.emaPeriod, prices.length);
    const multiplier = 2 / (period + 1);
    
    let ema = prices[0]!;
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i]! * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  private calculateVolumeTrend(volumes: number[]): { trend: 'increasing' | 'decreasing' | 'stable'; average: number; ratio: number } {
    const period = Math.min(this.config.volumePeriod, volumes.length);
    const recentVolumes = volumes.slice(-period);
    const average = recentVolumes.reduce((acc, vol) => acc + vol, 0) / period;
    const currentVolume = volumes[volumes.length - 1]!;
    const ratio = currentVolume / average;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (ratio > 1.2) {
      trend = 'increasing';
    } else if (ratio < 0.8) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    return { trend, average, ratio };
  }

  private calculateFibonacciRetracements(highs: number[], lows: number[]): { retracements: number[]; support: number; resistance: number } {
    const high = Math.max(...highs.slice(-this.config.supportResistancePeriod));
    const low = Math.min(...lows.slice(-this.config.supportResistancePeriod));
    const range = high - low;

    const retracements = this.config.fibonacciLevels.map(level => high - (range * level));
    const support = retracements[4]!; // 0.618 level
    const resistance = retracements[2]!; // 0.382 level

    return { retracements, support, resistance };
  }

  private calculateSupport(lows: number[]): number {
    const period = Math.min(this.config.supportResistancePeriod, lows.length);
    return Math.min(...lows.slice(-period));
  }

  private calculateResistance(highs: number[]): number {
    const period = Math.min(this.config.supportResistancePeriod, highs.length);
    return Math.max(...highs.slice(-period));
  }

  private calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } | undefined {
    if (!this.config.macdPeriod || prices.length < this.config.macdPeriod.slow) {
      return undefined;
    }

    const ema12 = this.calculateEMAWithPeriod(prices, this.config.macdPeriod.fast);
    const ema26 = this.calculateEMAWithPeriod(prices, this.config.macdPeriod.slow);
    const macd = ema12 - ema26;
    
    // Calculate signal line (EMA of MACD)
    const macdValues = [macd]; // Simplified - would need full MACD history
    const signal = this.calculateEMAWithPeriod(macdValues, this.config.macdPeriod.signal);
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  private calculateEMAWithPeriod(prices: number[], period: number): number {
    const multiplier = 2 / (period + 1);
    let ema = prices[0]!;
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i]! * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  private calculateBollingerBands(prices: number[]): { upper: number; middle: number; lower: number } | undefined {
    if (!this.config.bollingerPeriod || prices.length < this.config.bollingerPeriod) {
      return undefined;
    }

    const period = Math.min(this.config.bollingerPeriod, prices.length);
    const recentPrices = prices.slice(-period);
    const sma = recentPrices.reduce((acc, price) => acc + price, 0) / period;
    
    const variance = recentPrices.reduce((acc, price) => acc + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    const upper = sma + (stdDev * this.config.bollingerStdDev!);
    const lower = sma - (stdDev * this.config.bollingerStdDev!);

    return { upper, middle: sma, lower };
  }

  private calculateStochastic(highs: number[], lows: number[], closes: number[]): { k: number; d: number } | undefined {
    if (!this.config.stochasticPeriod || closes.length < this.config.stochasticPeriod) {
      return undefined;
    }

    const period = Math.min(this.config.stochasticPeriod, closes.length);
    const recentHighs = highs.slice(-period);
    const recentLows = lows.slice(-period);
    const recentCloses = closes.slice(-period);
    
    const highestHigh = Math.max(...recentHighs);
    const lowestLow = Math.min(...recentLows);
    const currentClose = recentCloses[recentCloses.length - 1]!;
    
    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    const d = k; // Simplified - would need K% history for D%

    return { k, d };
  }

  private calculateWilliamsR(highs: number[], lows: number[], closes: number[]): number | undefined {
    if (!this.config.williamsRPeriod || closes.length < this.config.williamsRPeriod) {
      return undefined;
    }

    const period = Math.min(this.config.williamsRPeriod, closes.length);
    const recentHighs = highs.slice(-period);
    const recentLows = lows.slice(-period);
    const currentClose = closes[closes.length - 1]!;
    
    const highestHigh = Math.max(...recentHighs);
    const lowestLow = Math.min(...recentLows);
    
    return ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
  }

  private calculateATR(highs: number[], lows: number[], closes: number[]): number | undefined {
    if (!this.config.atrPeriod || closes.length < this.config.atrPeriod) {
      return undefined;
    }

    const period = Math.min(this.config.atrPeriod, closes.length);
    const trueRanges: number[] = [];

    for (let i = 1; i < closes.length; i++) {
      const highLow = highs[i]! - lows[i]!;
      const highClose = Math.abs(highs[i]! - closes[i - 1]!);
      const lowClose = Math.abs(lows[i]! - closes[i - 1]!);
      trueRanges.push(Math.max(highLow, highClose, lowClose));
    }

    const recentTR = trueRanges.slice(-period);
    return recentTR.reduce((acc, tr) => acc + tr, 0) / period;
  }

  private createAnalysis(symbol: string, indicators: TechnicalIndicators, klineData: KlineData[]): TechnicalAnalysis {
    const currentPrice = klineData[klineData.length - 1]!.close;
    const trend = this.determineTrend(indicators, currentPrice);
    const strength = this.determineStrength(indicators);
    const confidence = this.calculateConfidence(indicators);
    const signals = this.generateSignals(indicators, currentPrice);
    const reasoning = this.generateReasoning(indicators, signals);

    return {
      symbol,
      timeframe: '1h', // Default timeframe
      indicators,
      timestamp: new Date(),
      trend,
      strength,
      confidence,
      signals,
      reasoning
    };
  }

  private determineTrend(indicators: TechnicalIndicators, currentPrice: number): 'bullish' | 'bearish' | 'neutral' {
    let bullishSignals = 0;
    let bearishSignals = 0;

    // RSI signals
    if (indicators.rsi < this.config.rsiOversold) bullishSignals++;
    else if (indicators.rsi > this.config.rsiOverbought) bearishSignals++;

    // Moving average signals
    if (currentPrice > indicators.ma.sma) bullishSignals++;
    else if (currentPrice < indicators.ma.sma) bearishSignals++;

    if (currentPrice > indicators.ma.ema) bullishSignals++;
    else if (currentPrice < indicators.ma.ema) bearishSignals++;

    // Volume signals
    if (indicators.volume.trend === 'increasing') bullishSignals++;
    else if (indicators.volume.trend === 'decreasing') bearishSignals++;

    // Support/Resistance signals
    if (currentPrice > indicators.resistance) bullishSignals++;
    else if (currentPrice < indicators.support) bearishSignals++;

    // MACD signals
    if (indicators.macd) {
      if (indicators.macd.histogram > 0) bullishSignals++;
      else if (indicators.macd.histogram < 0) bearishSignals++;
    }

    // Bollinger Bands signals
    if (indicators.bollingerBands) {
      if (currentPrice < indicators.bollingerBands.lower) bullishSignals++;
      else if (currentPrice > indicators.bollingerBands.upper) bearishSignals++;
    }

    if (bullishSignals > bearishSignals) return 'bullish';
    if (bearishSignals > bullishSignals) return 'bearish';
    return 'neutral';
  }

  private determineStrength(indicators: TechnicalIndicators): 'weak' | 'moderate' | 'strong' {
    let strengthScore = 0;

    // RSI strength
    if (indicators.rsi < 20 || indicators.rsi > 80) strengthScore += 2;
    else if (indicators.rsi < 30 || indicators.rsi > 70) strengthScore += 1;

    // Volume strength
    if (indicators.volume.ratio > 1.5) strengthScore += 2;
    else if (indicators.volume.ratio > 1.2) strengthScore += 1;

    // MACD strength
    if (indicators.macd && Math.abs(indicators.macd.histogram) > 0.5) strengthScore += 1;

    if (strengthScore >= 4) return 'strong';
    if (strengthScore >= 2) return 'moderate';
    return 'weak';
  }

  private calculateConfidence(indicators: TechnicalIndicators): number {
    let confidence = 0.5; // Base confidence

    // RSI confidence
    if (indicators.rsi < 30 || indicators.rsi > 70) confidence += 0.1;

    // Volume confidence
    if (indicators.volume.ratio > 1.2) confidence += 0.1;

    // MACD confidence
    if (indicators.macd && Math.abs(indicators.macd.histogram) > 0.3) confidence += 0.1;

    // Bollinger Bands confidence
    if (indicators.bollingerBands) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private generateSignals(indicators: TechnicalIndicators, currentPrice: number): { buy: boolean; sell: boolean; hold: boolean } {
    let buySignals = 0;
    let sellSignals = 0;

    // RSI signals
    if (indicators.rsi < this.config.rsiOversold) buySignals++;
    else if (indicators.rsi > this.config.rsiOverbought) sellSignals++;

    // Moving average signals
    if (currentPrice > indicators.ma.sma && currentPrice > indicators.ma.ema) buySignals++;
    else if (currentPrice < indicators.ma.sma && currentPrice < indicators.ma.ema) sellSignals++;

    // Volume signals
    if (indicators.volume.trend === 'increasing') buySignals++;
    else if (indicators.volume.trend === 'decreasing') sellSignals++;

    // MACD signals
    if (indicators.macd && indicators.macd.histogram > 0) buySignals++;
    else if (indicators.macd && indicators.macd.histogram < 0) sellSignals++;

    // Bollinger Bands signals
    if (indicators.bollingerBands) {
      if (currentPrice < indicators.bollingerBands.lower) buySignals++;
      else if (currentPrice > indicators.bollingerBands.upper) sellSignals++;
    }

    const buy = buySignals > sellSignals && buySignals >= 2;
    const sell = sellSignals > buySignals && sellSignals >= 2;
    const hold = !buy && !sell;

    return { buy, sell, hold };
  }

  private generateReasoning(indicators: TechnicalIndicators, signals: any): string {
    const reasons: string[] = [];

    // RSI reasoning
    if (indicators.rsi < this.config.rsiOversold) {
      reasons.push(`RSI oversold (${indicators.rsi.toFixed(2)})`);
    } else if (indicators.rsi > this.config.rsiOverbought) {
      reasons.push(`RSI overbought (${indicators.rsi.toFixed(2)})`);
    }

    // Moving average reasoning
    if (indicators.ma.sma > indicators.ma.ema) {
      reasons.push('SMA above EMA (bullish momentum)');
    } else {
      reasons.push('EMA above SMA (bearish momentum)');
    }

    // Volume reasoning
    if (indicators.volume.trend === 'increasing') {
      reasons.push(`Volume increasing (${indicators.volume.ratio.toFixed(2)}x average)`);
    } else if (indicators.volume.trend === 'decreasing') {
      reasons.push(`Volume decreasing (${indicators.volume.ratio.toFixed(2)}x average)`);
    }

    // MACD reasoning
    if (indicators.macd) {
      if (indicators.macd.histogram > 0) {
        reasons.push('MACD histogram positive');
      } else {
        reasons.push('MACD histogram negative');
      }
    }

    // Signal reasoning
    if (signals.buy) {
      reasons.push('Multiple buy signals detected');
    } else if (signals.sell) {
      reasons.push('Multiple sell signals detected');
    } else {
      reasons.push('Mixed signals - holding position');
    }

    return reasons.join('. ');
  }

  private updateAnalysisHistory(symbol: string, analysis: TechnicalAnalysis): void {
    const history = this.analysisHistory.get(symbol) || [];
    history.push(analysis);
    
    // Keep only last 100 analyses
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.analysisHistory.set(symbol, history);
  }

  public getTechnicalAnalysis(symbol: string): TechnicalAnalysis | undefined {
    const history = this.analysisHistory.get(symbol);
    return history ? history[history.length - 1] : undefined;
  }

  public getAnalysisHistory(symbol: string): TechnicalAnalysis[] {
    return this.analysisHistory.get(symbol) || [];
  }

  public getStatus(): { isRunning: boolean; activeSymbols: string[] } {
    return {
      isRunning: this.activeAnalysis.size > 0,
      activeSymbols: Array.from(this.activeAnalysis)
    };
  }
}
