import { EventEmitter } from 'events';

// Advanced Trade Validation Interfaces
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  validate: (trade: TradeValidationData) => ValidationResult;
}

export interface TradeValidationData {
  symbol: string;
  portfolioId: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  orderType: string;
  timestamp: Date;
  aiConfidence: number;
  technicalConfidence: number;
  marketData: {
    volume: number;
    volatility: number;
    spread: number;
    liquidity: number;
  };
  portfolioData: {
    currentPositions: number;
    totalValue: number;
    availableBalance: number;
    riskExposure: number;
  };
  marketConditions: {
    isHighVolatility: boolean;
    isLowLiquidity: boolean;
    isNewsEvent: boolean;
    isMarketOpen: boolean;
  };
}

export interface ValidationResult {
  isValid: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details?: any;
  recommendations?: string[];
}

export interface ValidationConfig {
  enableAdvancedValidation: boolean;
  enableMarketConditionChecks: boolean;
  enablePortfolioRiskChecks: boolean;
  enableLiquidityChecks: boolean;
  enableVolatilityChecks: boolean;
  maxValidationTime: number; // milliseconds
  enableValidationCaching: boolean;
  cacheExpiryTime: number; // milliseconds
}

export class AdvancedTradeValidator extends EventEmitter {
  private static instance: AdvancedTradeValidator;
  private config: ValidationConfig;
  private validationRules: Map<string, ValidationRule> = new Map();
  private validationCache: Map<string, { result: ValidationResult; timestamp: number }> = new Map();

  private constructor() {
    super();
    this.config = this.getDefaultConfig();
    this.initializeValidationRules();
  }

  public static getInstance(): AdvancedTradeValidator {
    if (!AdvancedTradeValidator.instance) {
      AdvancedTradeValidator.instance = new AdvancedTradeValidator();
    }
    return AdvancedTradeValidator.instance;
  }

  private getDefaultConfig(): ValidationConfig {
    return {
      enableAdvancedValidation: true,
      enableMarketConditionChecks: true,
      enablePortfolioRiskChecks: true,
      enableLiquidityChecks: true,
      enableVolatilityChecks: true,
      maxValidationTime: 5000, // 5 seconds
      enableValidationCaching: true,
      cacheExpiryTime: 30000 // 30 seconds
    };
  }

  public updateConfig(newConfig: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config_updated', this.config);
  }

  public getConfig(): ValidationConfig {
    return { ...this.config };
  }

  private initializeValidationRules(): void {
    // Market condition rules
    this.addValidationRule({
      id: 'market_volatility',
      name: 'Market Volatility Check',
      description: 'Check if market volatility is acceptable for trading',
      enabled: this.config.enableVolatilityChecks,
      severity: 'HIGH',
      validate: (trade) => this.validateMarketVolatility(trade)
    });

    this.addValidationRule({
      id: 'liquidity_check',
      name: 'Liquidity Check',
      description: 'Verify sufficient liquidity for the trade',
      enabled: this.config.enableLiquidityChecks,
      severity: 'CRITICAL',
      validate: (trade) => this.validateLiquidity(trade)
    });

    this.addValidationRule({
      id: 'portfolio_risk',
      name: 'Portfolio Risk Check',
      description: 'Check if trade fits within portfolio risk limits',
      enabled: this.config.enablePortfolioRiskChecks,
      severity: 'HIGH',
      validate: (trade) => this.validatePortfolioRisk(trade)
    });

    this.addValidationRule({
      id: 'market_conditions',
      name: 'Market Conditions Check',
      description: 'Check overall market conditions',
      enabled: this.config.enableMarketConditionChecks,
      severity: 'MEDIUM',
      validate: (trade) => this.validateMarketConditions(trade)
    });

    this.addValidationRule({
      id: 'confidence_check',
      name: 'AI and Technical Confidence Check',
      description: 'Verify AI and technical analysis confidence levels',
      enabled: true,
      severity: 'MEDIUM',
      validate: (trade) => this.validateConfidence(trade)
    });

    this.addValidationRule({
      id: 'position_limit',
      name: 'Position Limit Check',
      description: 'Check if trade exceeds position limits',
      enabled: true,
      severity: 'HIGH',
      validate: (trade) => this.validatePositionLimit(trade)
    });

    this.addValidationRule({
      id: 'spread_check',
      name: 'Bid-Ask Spread Check',
      description: 'Check if spread is reasonable for the trade',
      enabled: true,
      severity: 'MEDIUM',
      validate: (trade) => this.validateSpread(trade)
    });
  }

  public addValidationRule(rule: ValidationRule): void {
    this.validationRules.set(rule.id, rule);
    this.emit('rule_added', rule);
  }

  public removeValidationRule(ruleId: string): void {
    this.validationRules.delete(ruleId);
    this.emit('rule_removed', ruleId);
  }

  public enableValidationRule(ruleId: string): void {
    const rule = this.validationRules.get(ruleId);
    if (rule) {
      rule.enabled = true;
      this.emit('rule_enabled', ruleId);
    }
  }

  public disableValidationRule(ruleId: string): void {
    const rule = this.validationRules.get(ruleId);
    if (rule) {
      rule.enabled = false;
      this.emit('rule_disabled', ruleId);
    }
  }

  public async validateTrade(tradeData: TradeValidationData): Promise<ValidationResult[]> {
    const cacheKey = this.generateCacheKey(tradeData);
    
    // Check cache first
    if (this.config.enableValidationCaching) {
      const cached = this.validationCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheExpiryTime) {
        return [cached.result];
      }
    }

    const results: ValidationResult[] = [];
    const startTime = Date.now();

    // Run all enabled validation rules
    for (const rule of this.validationRules.values()) {
      if (!rule.enabled) continue;

      // Check timeout
      if (Date.now() - startTime > this.config.maxValidationTime) {
        results.push({
          isValid: false,
          severity: 'HIGH',
          message: 'Validation timeout exceeded',
          details: { ruleId: rule.id }
        });
        break;
      }

      try {
        const result = rule.validate(tradeData);
        results.push(result);
        
        // Stop on critical failures
        if (result.severity === 'CRITICAL' && !result.isValid) {
          break;
        }
      } catch (error) {
        results.push({
          isValid: false,
          severity: 'HIGH',
          message: `Validation rule error: ${(error as Error).message}`,
          details: { ruleId: rule.id, error: (error as Error).message }
        });
      }
    }

    // Cache result
    if (this.config.enableValidationCaching && results.length > 0) {
      const overallResult = this.aggregateResults(results);
      this.validationCache.set(cacheKey, {
        result: overallResult,
        timestamp: Date.now()
      });
    }

    this.emit('trade_validated', { tradeData, results });
    return results;
  }

  private generateCacheKey(tradeData: TradeValidationData): string {
    return `${tradeData.symbol}_${tradeData.side}_${tradeData.quantity}_${tradeData.price}_${tradeData.timestamp.getTime()}`;
  }

  private aggregateResults(results: ValidationResult[]): ValidationResult {
    const criticalFailures = results.filter(r => r.severity === 'CRITICAL' && !r.isValid);
    const highFailures = results.filter(r => r.severity === 'HIGH' && !r.isValid);
    
    if (criticalFailures.length > 0) {
      return {
        isValid: false,
        severity: 'CRITICAL',
        message: 'Critical validation failures detected',
        details: { failures: criticalFailures }
      };
    }
    
    if (highFailures.length > 0) {
      return {
        isValid: false,
        severity: 'HIGH',
        message: 'High severity validation failures detected',
        details: { failures: highFailures }
      };
    }
    
    const warnings = results.filter(r => r.severity === 'MEDIUM' && !r.isValid);
    
    return {
      isValid: true,
      severity: warnings.length > 0 ? 'MEDIUM' : 'LOW',
      message: warnings.length > 0 ? 'Trade valid with warnings' : 'Trade validation passed',
      details: { warnings }
    };
  }

  // Validation rule implementations
  private validateMarketVolatility(trade: TradeValidationData): ValidationResult {
    const { volatility } = trade.marketData;
    
    if (volatility > 0.05) { // 5% volatility threshold
      return {
        isValid: false,
        severity: 'HIGH',
        message: 'Market volatility too high for safe trading',
        details: { volatility },
        recommendations: ['Consider reducing position size', 'Wait for volatility to decrease']
      };
    }
    
    if (volatility > 0.03) { // 3% volatility threshold
      return {
        isValid: true,
        severity: 'MEDIUM',
        message: 'High volatility detected - trade with caution',
        details: { volatility },
        recommendations: ['Consider reducing position size']
      };
    }
    
    return {
      isValid: true,
      severity: 'LOW',
      message: 'Volatility within acceptable range'
    };
  }

  private validateLiquidity(trade: TradeValidationData): ValidationResult {
    const { liquidity } = trade.marketData;
    const requiredLiquidity = trade.quantity * trade.price * 0.1; // 10% of trade value
    
    if (liquidity < requiredLiquidity) {
      return {
        isValid: false,
        severity: 'CRITICAL',
        message: 'Insufficient liquidity for trade',
        details: { liquidity, requiredLiquidity },
        recommendations: ['Reduce position size', 'Wait for better liquidity']
      };
    }
    
    return {
      isValid: true,
      severity: 'LOW',
      message: 'Sufficient liquidity available'
    };
  }

  private validatePortfolioRisk(trade: TradeValidationData): ValidationResult {
    const { riskExposure, totalValue } = trade.portfolioData;
    const tradeValue = trade.quantity * trade.price;
    const newRiskExposure = riskExposure + (tradeValue / totalValue);
    
    if (newRiskExposure > 0.2) { // 20% risk exposure limit
      return {
        isValid: false,
        severity: 'HIGH',
        message: 'Trade would exceed portfolio risk limits',
        details: { currentRisk: riskExposure, newRisk: newRiskExposure },
        recommendations: ['Reduce position size', 'Close other positions first']
      };
    }
    
    return {
      isValid: true,
      severity: 'LOW',
      message: 'Trade within portfolio risk limits'
    };
  }

  private validateMarketConditions(trade: TradeValidationData): ValidationResult {
    const { isHighVolatility, isLowLiquidity, isNewsEvent, isMarketOpen } = trade.marketConditions;
    
    if (!isMarketOpen) {
      return {
        isValid: false,
        severity: 'CRITICAL',
        message: 'Market is closed',
        details: { marketOpen: isMarketOpen }
      };
    }
    
    if (isNewsEvent) {
      return {
        isValid: false,
        severity: 'HIGH',
        message: 'News event detected - avoid trading',
        details: { newsEvent: isNewsEvent },
        recommendations: ['Wait for news event to pass']
      };
    }
    
    if (isHighVolatility && isLowLiquidity) {
      return {
        isValid: false,
        severity: 'HIGH',
        message: 'Poor market conditions detected',
        details: { highVolatility: isHighVolatility, lowLiquidity: isLowLiquidity },
        recommendations: ['Wait for better market conditions']
      };
    }
    
    return {
      isValid: true,
      severity: 'LOW',
      message: 'Market conditions acceptable'
    };
  }

  private validateConfidence(trade: TradeValidationData): ValidationResult {
    const { aiConfidence, technicalConfidence } = trade;
    const averageConfidence = (aiConfidence + technicalConfidence) / 2;
    
    if (averageConfidence < 0.5) {
      return {
        isValid: false,
        severity: 'HIGH',
        message: 'Low confidence in trade signals',
        details: { aiConfidence, technicalConfidence, averageConfidence },
        recommendations: ['Wait for stronger signals', 'Reduce position size']
      };
    }
    
    if (averageConfidence < 0.7) {
      return {
        isValid: true,
        severity: 'MEDIUM',
        message: 'Moderate confidence in trade signals',
        details: { aiConfidence, technicalConfidence, averageConfidence },
        recommendations: ['Consider reducing position size']
      };
    }
    
    return {
      isValid: true,
      severity: 'LOW',
      message: 'High confidence in trade signals'
    };
  }

  private validatePositionLimit(trade: TradeValidationData): ValidationResult {
    const { currentPositions } = trade.portfolioData;
    const maxPositions = 10; // Configurable
    
    if (currentPositions >= maxPositions) {
      return {
        isValid: false,
        severity: 'HIGH',
        message: 'Maximum number of positions reached',
        details: { currentPositions, maxPositions },
        recommendations: ['Close existing positions before opening new ones']
      };
    }
    
    return {
      isValid: true,
      severity: 'LOW',
      message: 'Position limit not exceeded'
    };
  }

  private validateSpread(trade: TradeValidationData): ValidationResult {
    const { spread } = trade.marketData;
    const maxSpread = 0.002; // 0.2% max spread
    
    if (spread > maxSpread) {
      return {
        isValid: false,
        severity: 'MEDIUM',
        message: 'Bid-ask spread too wide',
        details: { spread, maxSpread },
        recommendations: ['Wait for tighter spreads', 'Consider using limit orders']
      };
    }
    
    return {
      isValid: true,
      severity: 'LOW',
      message: 'Spread within acceptable range'
    };
  }

  public getValidationRules(): ValidationRule[] {
    return Array.from(this.validationRules.values());
  }

  public getStatus(): { 
    rulesCount: number; 
    cacheSize: number; 
    config: ValidationConfig 
  } {
    return {
      rulesCount: this.validationRules.size,
      cacheSize: this.validationCache.size,
      config: this.config
    };
  }

  public clearCache(): void {
    this.validationCache.clear();
    this.emit('cache_cleared');
  }
}
