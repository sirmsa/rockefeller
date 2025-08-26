import { EventEmitter } from 'events';

// Position Management Interfaces
export interface PositionRisk {
  symbol: string;
  portfolioId: string;
  currentRisk: number; // Current risk percentage
  maxRisk: number; // Maximum allowed risk
  correlationRisk: number; // Risk from correlated positions
  marketRisk: number; // Market volatility risk
  liquidityRisk: number; // Liquidity risk
  totalRisk: number; // Combined risk score
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface PositionSizing {
  symbol: string;
  portfolioId: string;
  availableBudget: number;
  suggestedQuantity: number;
  maxQuantity: number;
  riskAdjustedQuantity: number;
  sizingMethod: 'FIXED' | 'KELLY' | 'RISK_PARITY' | 'VOLATILITY';
  confidence: number;
}

export interface CorrelationMatrix {
  [symbol: string]: {
    [correlatedSymbol: string]: number; // Correlation coefficient (-1 to 1)
  };
}

export interface PositionConfig {
  maxPositionsPerPortfolio: number;
  maxRiskPerPosition: number; // Percentage of portfolio
  maxTotalRisk: number; // Maximum total portfolio risk
  correlationThreshold: number; // Maximum allowed correlation
  volatilityLookback: number; // Days for volatility calculation
  kellyFraction: number; // Kelly criterion fraction (0-1)
  enableRiskManagement: boolean;
  enableCorrelationAnalysis: boolean;
  enableVolatilityAdjustment: boolean;
}

export class PositionManager extends EventEmitter {
  private static instance: PositionManager;
  private config: PositionConfig;
  private correlationMatrix: CorrelationMatrix = {};
  private volatilityData: Map<string, number[]> = new Map();
  private positionHistory: Map<string, any[]> = new Map();

  private constructor() {
    super();
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): PositionManager {
    if (!PositionManager.instance) {
      PositionManager.instance = new PositionManager();
    }
    return PositionManager.instance;
  }

  private getDefaultConfig(): PositionConfig {
    return {
      maxPositionsPerPortfolio: 10,
      maxRiskPerPosition: 0.05, // 5% per position
      maxTotalRisk: 0.20, // 20% total portfolio risk
      correlationThreshold: 0.7, // 70% correlation threshold
      volatilityLookback: 30, // 30 days
      kellyFraction: 0.25, // 25% of Kelly criterion
      enableRiskManagement: true,
      enableCorrelationAnalysis: true,
      enableVolatilityAdjustment: true
    };
  }

  public updateConfig(newConfig: Partial<PositionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config_updated', this.config);
  }

  public getConfig(): PositionConfig {
    return { ...this.config };
  }

  public calculatePositionSize(
    symbol: string,
    portfolioId: string,
    availableBudget: number,
    confidence: number,
    currentPrice: number,
    volatility?: number
  ): PositionSizing {
    const baseQuantity = availableBudget * this.config.maxRiskPerPosition / currentPrice;
    
    let sizingMethod: 'FIXED' | 'KELLY' | 'RISK_PARITY' | 'VOLATILITY' = 'FIXED';
    let suggestedQuantity = baseQuantity;
    let maxQuantity = availableBudget / currentPrice;

    // Apply Kelly Criterion if confidence is high
    if (confidence > 0.8) {
      const kellyQuantity = this.calculateKellyCriterion(confidence, volatility);
      suggestedQuantity = Math.min(suggestedQuantity, kellyQuantity * this.config.kellyFraction);
      sizingMethod = 'KELLY';
    }
    // Apply volatility adjustment if Kelly wasn't applied
    else if (this.config.enableVolatilityAdjustment && volatility) {
      const volatilityAdjustedQuantity = this.adjustForVolatility(suggestedQuantity, volatility);
      suggestedQuantity = Math.min(suggestedQuantity, volatilityAdjustedQuantity);
      sizingMethod = 'VOLATILITY';
    }
    // Apply risk parity if no other method was applied and risk management is enabled
    else if (this.config.enableRiskManagement) {
      const riskParityQuantity = this.calculateRiskParity(symbol, portfolioId, availableBudget, currentPrice);
      suggestedQuantity = Math.min(suggestedQuantity, riskParityQuantity);
      sizingMethod = 'RISK_PARITY';
    }
    // Default to fixed sizing if no other method applies
    else {
      sizingMethod = 'FIXED';
    }

    // Ensure quantity doesn't exceed maximum
    suggestedQuantity = Math.min(suggestedQuantity, maxQuantity);

    return {
      symbol,
      portfolioId,
      availableBudget,
      suggestedQuantity,
      maxQuantity,
      riskAdjustedQuantity: suggestedQuantity,
      sizingMethod,
      confidence
    };
  }

  private calculateKellyCriterion(confidence: number, _volatility?: number): number {
    // Simplified Kelly Criterion: f = (bp - q) / b
    // where b = odds received, p = probability of win, q = probability of loss
    const winProbability = confidence;
    const lossProbability = 1 - confidence;
    const oddsReceived = 2; // Assuming 1:1 odds (can be adjusted based on stop-loss/take-profit)
    
    const kellyFraction = (oddsReceived * winProbability - lossProbability) / oddsReceived;
    return Math.max(0, kellyFraction); // Don't allow negative Kelly
  }

  private adjustForVolatility(quantity: number, volatility: number): number {
    // Reduce position size for high volatility
    const volatilityAdjustment = Math.max(0.1, 1 - (volatility * 2));
    return quantity * volatilityAdjustment;
  }

  private calculateRiskParity(_symbol: string, _portfolioId: string, availableBudget: number, currentPrice: number): number {
    // Calculate equal risk contribution across all positions
    const existingPositions = this.getExistingPositions(_portfolioId);
    const totalPositions = existingPositions.length + 1;
    
    if (totalPositions === 1) {
      return availableBudget * this.config.maxRiskPerPosition / currentPrice;
    }

    // Equal risk allocation
    const equalRiskBudget = availableBudget / totalPositions;
    return equalRiskBudget * this.config.maxRiskPerPosition / currentPrice;
  }

  private getExistingPositions(_portfolioId: string): any[] {
    // This would integrate with the actual position data
    // For now, return empty array
    return [];
  }

  public calculatePositionRisk(
    symbol: string,
    portfolioId: string,
    quantity: number,
    currentPrice: number,
    portfolioValue: number
  ): PositionRisk {
    const currentRisk = (quantity * currentPrice) / portfolioValue;
    
    // Calculate correlation risk
    const correlationRisk = this.calculateCorrelationRisk(symbol, portfolioId);
    
    // Calculate market risk (simplified)
    const marketRisk = this.calculateMarketRisk(symbol);
    
    // Calculate liquidity risk (simplified)
    const liquidityRisk = this.calculateLiquidityRisk(symbol, quantity);
    
    // Calculate total risk
    const totalRisk = currentRisk + correlationRisk + marketRisk + liquidityRisk;
    
    // Determine risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (totalRisk < 0.05) riskLevel = 'LOW';
    else if (totalRisk < 0.10) riskLevel = 'MEDIUM';
    else if (totalRisk < 0.20) riskLevel = 'HIGH';
    else riskLevel = 'CRITICAL';

    return {
      symbol,
      portfolioId,
      currentRisk,
      maxRisk: this.config.maxRiskPerPosition,
      correlationRisk,
      marketRisk,
      liquidityRisk,
      totalRisk,
      riskLevel
    };
  }

  private calculateCorrelationRisk(symbol: string, portfolioId: string): number {
    if (!this.config.enableCorrelationAnalysis) return 0;

    const existingPositions = this.getExistingPositions(portfolioId);
    let totalCorrelationRisk = 0;

    for (const position of existingPositions) {
      const correlation = this.getCorrelation(symbol, position.symbol);
      if (Math.abs(correlation) > this.config.correlationThreshold) {
        totalCorrelationRisk += Math.abs(correlation) * 0.02; // 2% risk per highly correlated position
      }
    }

    return totalCorrelationRisk;
  }

  private calculateMarketRisk(symbol: string): number {
    const volatility = this.getVolatility(symbol);
    return volatility * 0.1; // 10% of volatility as market risk
  }

  private calculateLiquidityRisk(_symbol: string, quantity: number): number {
    // Simplified liquidity risk calculation
    // In practice, this would use volume data and bid-ask spreads
    const baseLiquidityRisk = 0.01; // 1% base liquidity risk
    const quantityRisk = Math.min(quantity / 1000, 0.05); // Up to 5% for large quantities
    return baseLiquidityRisk + quantityRisk;
  }

  public updateCorrelationMatrix(symbol: string, correlatedSymbol: string, correlation: number): void {
    if (!this.correlationMatrix[symbol]) {
      this.correlationMatrix[symbol] = {};
    }
    this.correlationMatrix[symbol][correlatedSymbol] = correlation;
  }

  public getCorrelation(symbol1: string, symbol2: string): number {
    if (symbol1 === symbol2) return 1;
    
    const correlation1 = this.correlationMatrix[symbol1]?.[symbol2];
    const correlation2 = this.correlationMatrix[symbol2]?.[symbol1];
    
    return correlation1 || correlation2 || 0;
  }

  public updateVolatilityData(symbol: string, prices: number[]): void {
    if (prices.length < 2) return;

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push(((prices[i] || 0) - (prices[i - 1] || 0)) / (prices[i - 1] || 1));
    }

    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);

    this.volatilityData.set(symbol, [volatility, ...(this.volatilityData.get(symbol) || []).slice(0, this.config.volatilityLookback - 1)]);
  }

  public getVolatility(symbol: string): number {
    const volatilityHistory = this.volatilityData.get(symbol);
    if (!volatilityHistory || volatilityHistory.length === 0) return 0.02; // Default 2% volatility
    
    return volatilityHistory[0] || 0.02;
  }

  public validatePosition(
    symbol: string,
    portfolioId: string,
    quantity: number,
    currentPrice: number,
    portfolioValue: number
  ): { isValid: boolean; reason?: string; risk?: PositionRisk } {
    // Check if we can add more positions
    const existingPositions = this.getExistingPositions(portfolioId);
    if (existingPositions.length >= this.config.maxPositionsPerPortfolio) {
      return { isValid: false, reason: 'Maximum positions per portfolio reached' };
    }

    // Calculate position risk
    const risk = this.calculatePositionRisk(symbol, portfolioId, quantity, currentPrice, portfolioValue);

    // Check individual position risk
    if (risk.currentRisk > this.config.maxRiskPerPosition) {
      return { isValid: false, reason: 'Position risk exceeds maximum allowed', risk };
    }

    // Check total portfolio risk
    const totalPortfolioRisk = this.calculateTotalPortfolioRisk(portfolioId, risk.currentRisk);
    if (totalPortfolioRisk > this.config.maxTotalRisk) {
      return { isValid: false, reason: 'Total portfolio risk exceeds maximum allowed', risk };
    }

    // Check correlation risk
    if (risk.correlationRisk > 0.1) { // 10% correlation risk threshold
      return { isValid: false, reason: 'High correlation risk detected', risk };
    }

    return { isValid: true, risk };
  }

  private calculateTotalPortfolioRisk(portfolioId: string, newPositionRisk: number): number {
    const existingPositions = this.getExistingPositions(portfolioId);
    const existingRisk = existingPositions.reduce((total, pos) => total + (pos.risk || 0), 0);
    return existingRisk + newPositionRisk;
  }

  public getPositionHistory(symbol: string): any[] {
    return this.positionHistory.get(symbol) || [];
  }

  public addPositionToHistory(symbol: string, positionData: any): void {
    const history = this.positionHistory.get(symbol) || [];
    history.push({ ...positionData, timestamp: new Date() });
    
    // Keep only last 100 entries
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.positionHistory.set(symbol, history);
  }

  public getStatus(): { 
    correlationMatrixSize: number; 
    volatilityDataSize: number; 
    positionHistorySize: number 
  } {
    return {
      correlationMatrixSize: Object.keys(this.correlationMatrix).length,
      volatilityDataSize: this.volatilityData.size,
      positionHistorySize: this.positionHistory.size
    };
  }
}
