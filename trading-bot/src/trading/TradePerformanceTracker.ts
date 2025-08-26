import { EventEmitter } from 'events';

// Trade Performance Interfaces
export interface TradePerformance {
  symbol: string;
  portfolioId: string;
  tradeId: string;
  entryTime: Date;
  exitTime?: Date;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  side: 'LONG' | 'SHORT';
  pnl: number;
  pnlPercentage: number;
  duration: number; // in milliseconds
  status: 'OPEN' | 'CLOSED' | 'PARTIALLY_CLOSED';
  fees: number;
  slippage: number;
  strategy: string;
  aiConfidence: number;
  technicalConfidence: number;
  reasoning: string;
}

export interface PerformanceMetrics {
  symbol: string;
  portfolioId: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averagePnL: number;
  totalPnL: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  averageTradeDuration: number;
  bestTrade: number;
  worstTrade: number;
  averageFees: number;
  averageSlippage: number;
  timestamp: Date;
}

export interface PerformanceConfig {
  enableRealTimeTracking: boolean;
  enableDrawdownCalculation: boolean;
  enableSharpeRatio: boolean;
  enableProfitFactor: boolean;
  performanceUpdateInterval: number; // milliseconds
  maxHistorySize: number;
  enableAlerts: boolean;
  alertThresholds: {
    maxDrawdown: number;
    minWinRate: number;
    maxLossStreak: number;
  };
}

export class TradePerformanceTracker extends EventEmitter {
  private static instance: TradePerformanceTracker;
  private config: PerformanceConfig;
  private tradeHistory: Map<string, TradePerformance[]> = new Map();
  private performanceMetrics: Map<string, PerformanceMetrics> = new Map();
  private updateInterval?: NodeJS.Timeout;

  private constructor() {
    super();
    this.config = this.getDefaultConfig();
    this.startRealTimeTracking();
  }

  public static getInstance(): TradePerformanceTracker {
    if (!TradePerformanceTracker.instance) {
      TradePerformanceTracker.instance = new TradePerformanceTracker();
    }
    return TradePerformanceTracker.instance;
  }

  private getDefaultConfig(): PerformanceConfig {
    return {
      enableRealTimeTracking: true,
      enableDrawdownCalculation: true,
      enableSharpeRatio: true,
      enableProfitFactor: true,
      performanceUpdateInterval: 60000, // 1 minute
      maxHistorySize: 1000,
      enableAlerts: true,
      alertThresholds: {
        maxDrawdown: 0.10, // 10%
        minWinRate: 0.50, // 50%
        maxLossStreak: 5
      }
    };
  }

  public updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config_updated', this.config);
  }

  public getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  public addTrade(trade: TradePerformance): void {
    const key = `${trade.portfolioId}_${trade.symbol}`;
    const history = this.tradeHistory.get(key) || [];
    
    history.push(trade);
    
    // Keep history size within limits
    if (history.length > this.config.maxHistorySize) {
      history.splice(0, history.length - this.config.maxHistorySize);
    }
    
    this.tradeHistory.set(key, history);
    
    // Update metrics
    this.updatePerformanceMetrics(key);
    
    this.emit('trade_added', trade);
  }

  public updateTrade(tradeId: string, updates: Partial<TradePerformance>): void {
    for (const [key, history] of this.tradeHistory) {
      const tradeIndex = history.findIndex(t => t.tradeId === tradeId);
      if (tradeIndex !== -1) {
        const updatedTrade = { ...history[tradeIndex], ...updates };
        
        // Calculate PnL if exit price is provided
        if (updates.exitPrice && !updates.pnl) {
          const trade = history[tradeIndex];
          const pnl = trade.side === 'LONG' 
            ? (updates.exitPrice - trade.entryPrice) * trade.quantity
            : (trade.entryPrice - updates.exitPrice) * trade.quantity;
          
          updatedTrade.pnl = pnl;
          updatedTrade.pnlPercentage = pnl / (trade.entryPrice * trade.quantity);
          
          if (updates.exitTime) {
            updatedTrade.duration = updates.exitTime.getTime() - trade.entryTime.getTime();
          }
        }
        
        history[tradeIndex] = updatedTrade;
        this.updatePerformanceMetrics(key);
        this.emit('trade_updated', updatedTrade);
        break;
      }
    }
  }

  public getTradeHistory(symbol: string, portfolioId: string): TradePerformance[] {
    const key = `${portfolioId}_${symbol}`;
    return this.tradeHistory.get(key) || [];
  }

  public getPerformanceMetrics(symbol: string, portfolioId: string): PerformanceMetrics | null {
    const key = `${portfolioId}_${symbol}`;
    return this.performanceMetrics.get(key) || null;
  }

  public getAllPerformanceMetrics(): PerformanceMetrics[] {
    return Array.from(this.performanceMetrics.values());
  }

  private updatePerformanceMetrics(key: string): void {
    const history = this.tradeHistory.get(key);
    if (!history || history.length === 0) return;

    const [portfolioId, symbol] = key.split('_');
    const closedTrades = history.filter(t => t.status === 'CLOSED');
    
    if (closedTrades.length === 0) return;

    const totalTrades = closedTrades.length;
    const winningTrades = closedTrades.filter(t => t.pnl > 0).length;
    const losingTrades = closedTrades.filter(t => t.pnl < 0).length;
    const winRate = winningTrades / totalTrades;
    
    const totalPnL = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
    const averagePnL = totalPnL / totalTrades;
    
    const pnls = closedTrades.map(t => t.pnl);
    const bestTrade = Math.max(...pnls);
    const worstTrade = Math.min(...pnls);
    
    const averageTradeDuration = closedTrades.reduce((sum, t) => sum + t.duration, 0) / totalTrades;
    const averageFees = closedTrades.reduce((sum, t) => sum + t.fees, 0) / totalTrades;
    const averageSlippage = closedTrades.reduce((sum, t) => sum + t.slippage, 0) / totalTrades;

    // Calculate max drawdown
    let maxDrawdown = 0;
    if (this.config.enableDrawdownCalculation) {
      maxDrawdown = this.calculateMaxDrawdown(closedTrades);
    }

    // Calculate Sharpe ratio
    let sharpeRatio = 0;
    if (this.config.enableSharpeRatio) {
      sharpeRatio = this.calculateSharpeRatio(closedTrades);
    }

    // Calculate profit factor
    let profitFactor = 0;
    if (this.config.enableProfitFactor) {
      profitFactor = this.calculateProfitFactor(closedTrades);
    }

    const metrics: PerformanceMetrics = {
      symbol,
      portfolioId,
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      averagePnL,
      totalPnL,
      maxDrawdown,
      sharpeRatio,
      profitFactor,
      averageTradeDuration,
      bestTrade,
      worstTrade,
      averageFees,
      averageSlippage,
      timestamp: new Date()
    };

    this.performanceMetrics.set(key, metrics);
    
    // Check for alerts
    if (this.config.enableAlerts) {
      this.checkAlerts(metrics);
    }
    
    this.emit('metrics_updated', metrics);
  }

  private calculateMaxDrawdown(trades: TradePerformance[]): number {
    let peak = 0;
    let maxDrawdown = 0;
    let runningPnL = 0;

    for (const trade of trades) {
      runningPnL += trade.pnl;
      
      if (runningPnL > peak) {
        peak = runningPnL;
      }
      
      const drawdown = (peak - runningPnL) / Math.max(peak, 1);
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  private calculateSharpeRatio(trades: TradePerformance[]): number {
    if (trades.length < 2) return 0;

    const returns = trades.map(t => t.pnlPercentage);
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    // Assuming risk-free rate of 0 for simplicity
    return stdDev > 0 ? meanReturn / stdDev : 0;
  }

  private calculateProfitFactor(trades: TradePerformance[]): number {
    const grossProfit = trades
      .filter(t => t.pnl > 0)
      .reduce((sum, t) => sum + t.pnl, 0);
    
    const grossLoss = Math.abs(trades
      .filter(t => t.pnl < 0)
      .reduce((sum, t) => sum + t.pnl, 0));
    
    return grossLoss > 0 ? grossProfit / grossLoss : 0;
  }

  private checkAlerts(metrics: PerformanceMetrics): void {
    const { alertThresholds } = this.config;
    
    if (metrics.maxDrawdown > alertThresholds.maxDrawdown) {
      this.emit('alert', {
        type: 'HIGH_DRAWDOWN',
        message: `High drawdown detected: ${(metrics.maxDrawdown * 100).toFixed(2)}%`,
        metrics
      });
    }
    
    if (metrics.winRate < alertThresholds.minWinRate) {
      this.emit('alert', {
        type: 'LOW_WIN_RATE',
        message: `Low win rate detected: ${(metrics.winRate * 100).toFixed(2)}%`,
        metrics
      });
    }
    
    // Check for loss streak
    const recentTrades = this.getRecentTrades(metrics.symbol, metrics.portfolioId, 10);
    const lossStreak = this.calculateLossStreak(recentTrades);
    
    if (lossStreak >= alertThresholds.maxLossStreak) {
      this.emit('alert', {
        type: 'LOSS_STREAK',
        message: `Loss streak detected: ${lossStreak} consecutive losses`,
        metrics
      });
    }
  }

  private getRecentTrades(symbol: string, portfolioId: string, count: number): TradePerformance[] {
    const history = this.getTradeHistory(symbol, portfolioId);
    return history.slice(-count);
  }

  private calculateLossStreak(trades: TradePerformance[]): number {
    let streak = 0;
    for (let i = trades.length - 1; i >= 0; i--) {
      if (trades[i].pnl < 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  private startRealTimeTracking(): void {
    if (!this.config.enableRealTimeTracking) return;

    this.updateInterval = setInterval(() => {
      // Update all performance metrics
      for (const key of this.tradeHistory.keys()) {
        this.updatePerformanceMetrics(key);
      }
    }, this.config.performanceUpdateInterval);
  }

  public stopRealTimeTracking(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
  }

  public getStatus(): { 
    tradeHistorySize: number; 
    metricsSize: number; 
    config: PerformanceConfig 
  } {
    return {
      tradeHistorySize: this.tradeHistory.size,
      metricsSize: this.performanceMetrics.size,
      config: this.config
    };
  }

  public clearHistory(symbol?: string, portfolioId?: string): void {
    if (symbol && portfolioId) {
      const key = `${portfolioId}_${symbol}`;
      this.tradeHistory.delete(key);
      this.performanceMetrics.delete(key);
    } else {
      this.tradeHistory.clear();
      this.performanceMetrics.clear();
    }
    
    this.emit('history_cleared', { symbol, portfolioId });
  }
}
