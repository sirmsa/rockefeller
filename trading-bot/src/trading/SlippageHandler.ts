import { EventEmitter } from 'events';

// Slippage Management Interfaces
export interface SlippageConfig {
  maxSlippage: number; // Maximum allowed slippage percentage
  slippageTolerance: number; // Tolerance for acceptable slippage
  enableSlippageProtection: boolean;
  slippageCalculationMethod: 'PERCENTAGE' | 'ABSOLUTE' | 'HYBRID';
  retryOnHighSlippage: boolean;
  maxRetries: number;
}

export interface SlippageAnalysis {
  symbol: string;
  expectedPrice: number;
  actualPrice: number;
  slippagePercentage: number;
  slippageAmount: number;
  isAcceptable: boolean;
  timestamp: Date;
  orderId: string;
  side: 'BUY' | 'SELL';
  quantity: number;
}

export interface ExecutionAnalytics {
  symbol: string;
  totalTrades: number;
  averageSlippage: number;
  maxSlippage: number;
  minSlippage: number;
  slippageDistribution: {
    low: number; // 0-1%
    medium: number; // 1-3%
    high: number; // 3-5%
    extreme: number; // >5%
  };
  executionTime: {
    average: number;
    min: number;
    max: number;
  };
  successRate: number;
  timestamp: Date;
}

export class SlippageHandler extends EventEmitter {
  private static instance: SlippageHandler;
  private config: SlippageConfig;
  private slippageHistory: Map<string, SlippageAnalysis[]> = new Map();
  private executionAnalytics: Map<string, ExecutionAnalytics> = new Map();

  private constructor() {
    super();
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): SlippageHandler {
    if (!SlippageHandler.instance) {
      SlippageHandler.instance = new SlippageHandler();
    }
    return SlippageHandler.instance;
  }

  private getDefaultConfig(): SlippageConfig {
    return {
      maxSlippage: 0.02, // 2% maximum slippage
      slippageTolerance: 0.005, // 0.5% tolerance
      enableSlippageProtection: true,
      slippageCalculationMethod: 'PERCENTAGE',
      retryOnHighSlippage: true,
      maxRetries: 3
    };
  }

  public updateConfig(newConfig: Partial<SlippageConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config_updated', this.config);
  }

  public getConfig(): SlippageConfig {
    return { ...this.config };
  }

  public calculateSlippage(
    symbol: string,
    expectedPrice: number,
    actualPrice: number,
    side: 'BUY' | 'SELL',
    quantity: number,
    orderId: string
  ): SlippageAnalysis {
    let slippagePercentage: number;
    let slippageAmount: number;

    switch (this.config.slippageCalculationMethod) {
      case 'PERCENTAGE':
        slippagePercentage = Math.abs((actualPrice - expectedPrice) / expectedPrice);
        slippageAmount = Math.abs(actualPrice - expectedPrice) * quantity;
        break;
      
      case 'ABSOLUTE':
        slippageAmount = Math.abs(actualPrice - expectedPrice) * quantity;
        slippagePercentage = slippageAmount / (expectedPrice * quantity);
        break;
      
      case 'HYBRID':
        const percentageSlippage = Math.abs((actualPrice - expectedPrice) / expectedPrice);
        const absoluteSlippage = Math.abs(actualPrice - expectedPrice) * quantity;
        slippagePercentage = percentageSlippage;
        slippageAmount = absoluteSlippage;
        break;
      
      default:
        slippagePercentage = Math.abs((actualPrice - expectedPrice) / expectedPrice);
        slippageAmount = Math.abs(actualPrice - expectedPrice) * quantity;
    }

    const isAcceptable = slippagePercentage <= this.config.maxSlippage;

    const analysis: SlippageAnalysis = {
      symbol,
      expectedPrice,
      actualPrice,
      slippagePercentage,
      slippageAmount,
      isAcceptable,
      timestamp: new Date(),
      orderId,
      side,
      quantity
    };

    // Add to history
    this.addSlippageToHistory(symbol, analysis);

    // Update analytics
    this.updateExecutionAnalytics(symbol, analysis);

    // Emit events
    if (!isAcceptable) {
      this.emit('high_slippage', analysis);
    }

    this.emit('slippage_analyzed', analysis);

    return analysis;
  }

  public validateSlippage(slippageAnalysis: SlippageAnalysis): boolean {
    if (!this.config.enableSlippageProtection) {
      return true;
    }

    return slippageAnalysis.isAcceptable;
  }

  public shouldRetryOrder(slippageAnalysis: SlippageAnalysis, retryCount: number): boolean {
    if (!this.config.retryOnHighSlippage) {
      return false;
    }

    if (retryCount >= this.config.maxRetries) {
      return false;
    }

    return !slippageAnalysis.isAcceptable;
  }

  public calculateOptimalOrderSize(
    _symbol: string,
    baseQuantity: number,
    currentSlippage: number
  ): number {
    if (!this.config.enableSlippageProtection) {
      return baseQuantity;
    }

    // Reduce order size if slippage is high
    if (currentSlippage > this.config.maxSlippage * 0.5) {
      const reductionFactor = 1 - (currentSlippage / this.config.maxSlippage);
      return baseQuantity * Math.max(0.1, reductionFactor);
    }

    return baseQuantity;
  }

  public getSlippageHistory(symbol: string): SlippageAnalysis[] {
    return this.slippageHistory.get(symbol) || [];
  }

  public getExecutionAnalytics(symbol: string): ExecutionAnalytics | null {
    return this.executionAnalytics.get(symbol) || null;
  }

  public getAllExecutionAnalytics(): ExecutionAnalytics[] {
    return Array.from(this.executionAnalytics.values());
  }

  private addSlippageToHistory(symbol: string, analysis: SlippageAnalysis): void {
    const history = this.slippageHistory.get(symbol) || [];
    history.push(analysis);
    
    // Keep only last 100 entries
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.slippageHistory.set(symbol, history);
  }

  private updateExecutionAnalytics(symbol: string, _analysis: SlippageAnalysis): void {
    const history = this.getSlippageHistory(symbol);

    if (history.length === 0) return;

    const slippages = history.map(h => h.slippagePercentage);
    const averageSlippage = slippages.reduce((sum, s) => sum + s, 0) / slippages.length;
    const maxSlippage = Math.max(...slippages);
    const minSlippage = Math.min(...slippages);

    // Calculate slippage distribution
    const distribution = {
      low: slippages.filter(s => s <= 0.01).length,
      medium: slippages.filter(s => s > 0.01 && s <= 0.03).length,
      high: slippages.filter(s => s > 0.03 && s <= 0.05).length,
      extreme: slippages.filter(s => s > 0.05).length
    };

    // Calculate success rate
    const successfulTrades = history.filter(h => h.isAcceptable).length;
    const successRate = successfulTrades / history.length;

    const analytics: ExecutionAnalytics = {
      symbol,
      totalTrades: history.length,
      averageSlippage,
      maxSlippage,
      minSlippage,
      slippageDistribution: distribution,
      executionTime: {
        average: 0, // Would need execution time data
        min: 0,
        max: 0
      },
      successRate,
      timestamp: new Date()
    };

    this.executionAnalytics.set(symbol, analytics);
    this.emit('analytics_updated', analytics);
  }

  public getStatus(): { 
    slippageHistorySize: number; 
    analyticsSize: number; 
    config: SlippageConfig 
  } {
    return {
      slippageHistorySize: this.slippageHistory.size,
      analyticsSize: this.executionAnalytics.size,
      config: this.config
    };
  }

  public clearHistory(symbol?: string): void {
    if (symbol) {
      this.slippageHistory.delete(symbol);
      this.executionAnalytics.delete(symbol);
    } else {
      this.slippageHistory.clear();
      this.executionAnalytics.clear();
    }
    
    this.emit('history_cleared', { symbol });
  }
}
