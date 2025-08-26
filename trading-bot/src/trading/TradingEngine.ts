import { EventEmitter } from 'events';
import { AISymbolAnalysis, SentimentAnalysis } from './AISymbolAnalysis';
import { TechnicalAnalysisEngine, TechnicalAnalysis } from './TechnicalAnalysisEngine';
import { BinanceManager } from './BinanceManager';
import { PortfolioManager } from './PortfolioManager';

// Trading Engine Interfaces
export interface TradeDecision {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0 to 1
  reasoning: string;
  sentimentAnalysis?: SentimentAnalysis | undefined;
  technicalAnalysis?: TechnicalAnalysis | undefined;
  timestamp: Date;
  portfolioId: string;
  suggestedQuantity?: number;
  suggestedPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface Position {
  symbol: string;
  portfolioId: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
  stopLoss?: number | undefined;
  takeProfit?: number | undefined;
  entryTime: Date;
  lastUpdateTime: Date;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  tradeId: string;
}

export interface Order {
  symbol: string;
  portfolioId: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT';
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  orderId: string;
  clientOrderId: string;
  timestamp: Date;
  filledQuantity?: number;
  averagePrice?: number;
  commission?: number;
}

export interface TradingConfig {
  maxPositionsPerPortfolio: number;
  maxRiskPerTrade: number; // Percentage of portfolio
  defaultStopLoss: number; // Percentage
  defaultTakeProfit: number; // Percentage
  minConfidenceThreshold: number; // Minimum confidence to execute trades
  sentimentWeight: number; // Weight for sentiment in decision making (0-1)
  technicalWeight: number; // Weight for technical analysis in decision making (0-1)
  maxSlippage: number; // Maximum allowed slippage percentage
  enableAutoTrading: boolean;
  enableStopLoss: boolean;
  enableTakeProfit: boolean;
}

export class TradingEngine extends EventEmitter {
  private static instance: TradingEngine;
  private config: TradingConfig;
  private activePositions: Map<string, Position> = new Map();
  private pendingOrders: Map<string, Order> = new Map();
  private tradeHistory: TradeDecision[] = [];
  private isRunning: boolean = false;
  private decisionInterval: NodeJS.Timeout | null = null;

  // Dependencies
  private aiAnalysis: AISymbolAnalysis;
  private techAnalysis: TechnicalAnalysisEngine;
  private binanceManager: BinanceManager;
  private portfolioManager: PortfolioManager;

  private constructor() {
    super();
    this.config = this.getDefaultConfig();
    
    // Initialize dependencies
    this.aiAnalysis = AISymbolAnalysis.getInstance();
    this.techAnalysis = TechnicalAnalysisEngine.getInstance();
    this.binanceManager = BinanceManager.getInstance();
    this.portfolioManager = PortfolioManager.getInstance();
  }

  public static getInstance(): TradingEngine {
    if (!TradingEngine.instance) {
      TradingEngine.instance = new TradingEngine();
    }
    return TradingEngine.instance;
  }

  private getDefaultConfig(): TradingConfig {
    return {
      maxPositionsPerPortfolio: 5,
      maxRiskPerTrade: 0.02, // 2% of portfolio
      defaultStopLoss: 0.05, // 5%
      defaultTakeProfit: 0.10, // 10%
      minConfidenceThreshold: 0.7, // 70% confidence required
      sentimentWeight: 0.4, // 40% weight for sentiment
      technicalWeight: 0.6, // 60% weight for technical analysis
      maxSlippage: 0.01, // 1% maximum slippage
      enableAutoTrading: false, // Disabled by default for safety
      enableStopLoss: true,
      enableTakeProfit: true
    };
  }

  public updateConfig(newConfig: Partial<TradingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config_updated', this.config);
  }

  public getConfig(): TradingConfig {
    return { ...this.config };
  }

  public startTrading(portfolioId: string, symbols: string[]): void {
    if (this.isRunning) {
      throw new Error('Trading engine is already running');
    }

    this.isRunning = true;
    
    // Start analysis for symbols
    this.aiAnalysis.startAnalysis(symbols);
    this.techAnalysis.startAnalysis(symbols);

    // Set up decision interval (every 5 minutes)
    this.decisionInterval = setInterval(() => {
      this.makeTradingDecisions(portfolioId, symbols);
    }, 5 * 60 * 1000);

    this.emit('trading_started', { portfolioId, symbols });
  }

  public stopTrading(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    // Stop analysis
    this.aiAnalysis.stopAnalysis();
    this.techAnalysis.stopAnalysis();

    // Clear decision interval
    if (this.decisionInterval) {
      clearInterval(this.decisionInterval);
      this.decisionInterval = null;
    }

    this.emit('trading_stopped');
  }

  public async makeTradingDecisions(portfolioId: string, symbols: string[]): Promise<TradeDecision[]> {
    const decisions: TradeDecision[] = [];

    for (const symbol of symbols) {
      try {
        const decision = await this.analyzeSymbol(portfolioId, symbol);
        if (decision) {
          decisions.push(decision);
          this.tradeHistory.push(decision);
          
          // Emit decision event
          this.emit('trade_decision', decision);

          // Execute trade if auto-trading is enabled and confidence is high enough
          if (this.config.enableAutoTrading && decision.confidence >= this.config.minConfidenceThreshold) {
            await this.executeTrade(decision);
          }
        }
      } catch (error) {
        this.emit('decision_error', { symbol, error: (error as Error).message });
      }
    }

    return decisions;
  }

  private async analyzeSymbol(portfolioId: string, symbol: string): Promise<TradeDecision | null> {
    try {
            // Get current market data
      const binanceKlineData = await this.binanceManager.getKlines(symbol, '1h', 100);
      if (!binanceKlineData || binanceKlineData.length === 0) {
        return null;
      }

      // Convert Binance KlineData to TechnicalAnalysisEngine KlineData format
      const klineData = binanceKlineData.map(kline => ({
        openTime: kline.openTime,
        open: parseFloat(kline.open),
        high: parseFloat(kline.high),
        low: parseFloat(kline.low),
        close: parseFloat(kline.close),
        volume: parseFloat(kline.volume),
        closeTime: kline.closeTime,
        quoteAssetVolume: parseFloat(kline.quoteAssetVolume),
        numberOfTrades: kline.numberOfTrades,
        takerBuyBaseAssetVolume: parseFloat(kline.takerBuyBaseAssetVolume),
        takerBuyQuoteAssetVolume: parseFloat(kline.takerBuyQuoteAssetVolume)
      }));

      // Get sentiment analysis
      const sentimentAnalysis = this.aiAnalysis.getSentimentAnalysis(symbol);
      
      // Get technical analysis
      const technicalAnalysis = await this.techAnalysis.performTechnicalAnalysis(symbol, klineData);
      
      // Get current position for this symbol
      const currentPosition = this.getPosition(portfolioId, symbol);
      
      // Make trading decision
      const decision = this.makeDecision(symbol, portfolioId, sentimentAnalysis || undefined, technicalAnalysis, currentPosition);
      
      return decision;
    } catch (error) {
      this.emit('analysis_error', { symbol, error: (error as Error).message });
      return null;
    }
  }

  private makeDecision(
    symbol: string,
    portfolioId: string,
    sentimentAnalysis?: SentimentAnalysis,
    technicalAnalysis?: TechnicalAnalysis,
    currentPosition?: Position
  ): TradeDecision {
    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 0.5; // Base confidence
    let reasoning = 'No clear signals';

    // Calculate sentiment score
    let sentimentScore = 0;
    if (sentimentAnalysis) {
      sentimentScore = sentimentAnalysis.overallSentiment;
      confidence += Math.abs(sentimentScore) * this.config.sentimentWeight;
    }

    // Calculate technical score
    let technicalScore = 0;
    if (technicalAnalysis) {
      if (technicalAnalysis.signals.buy) technicalScore = 1;
      else if (technicalAnalysis.signals.sell) technicalScore = -1;
      confidence += Math.abs(technicalScore) * this.config.technicalWeight;
    }

    // Determine action based on current position and signals
    if (currentPosition) {
      // We have an open position
      if (currentPosition.side === 'LONG') {
        if (technicalScore < -0.5 || sentimentScore < -0.5) {
          action = 'SELL';
          reasoning = 'Exit long position due to bearish signals';
        }
      } else if (currentPosition.side === 'SHORT') {
        if (technicalScore > 0.5 || sentimentScore > 0.5) {
          action = 'SELL'; // Close short position by buying
          reasoning = 'Exit short position due to bullish signals';
        }
      }
    } else {
      // No current position - look for entry signals
      if (technicalScore > 0.7 && sentimentScore > 0.3) {
        action = 'BUY';
        reasoning = 'Strong bullish signals from both technical and sentiment analysis';
      } else if (technicalScore < -0.7 && sentimentScore < -0.3) {
        action = 'SELL';
        reasoning = 'Strong bearish signals from both technical and sentiment analysis';
      }
    }

    // Calculate suggested quantity and prices
    const suggestedQuantity = this.calculatePositionSize(portfolioId, symbol);
    const currentPrice = technicalAnalysis?.indicators.ma.sma || 0;
    const suggestedPrice = currentPrice;
    
    // Calculate stop loss and take profit
    const stopLoss = this.config.enableStopLoss ? 
      currentPrice * (1 - this.config.defaultStopLoss) : undefined;
    const takeProfit = this.config.enableTakeProfit ? 
      currentPrice * (1 + this.config.defaultTakeProfit) : undefined;

    return {
      symbol,
      action,
      confidence: Math.min(confidence, 1.0),
      reasoning,
      sentimentAnalysis,
      technicalAnalysis,
      timestamp: new Date(),
      portfolioId,
      suggestedQuantity,
      suggestedPrice,
      ...(stopLoss !== undefined && { stopLoss }),
      ...(takeProfit !== undefined && { takeProfit })
    };
  }

  private calculatePositionSize(portfolioId: string, _symbol: string): number {
    try {
      const portfolio = this.portfolioManager.getPortfolio(portfolioId);
      if (!portfolio) return 0;

      const availableBudget = (portfolio.budget.total || 0) * this.config.maxRiskPerTrade;
      const currentPrice = 100; // This should come from market data
      
      return availableBudget / currentPrice;
    } catch (error) {
      return 0;
    }
  }

  public async executeTrade(decision: TradeDecision): Promise<Order | null> {
    try {
      if (!decision.suggestedQuantity || !decision.suggestedPrice) {
        throw new Error('Invalid trade parameters');
      }

      // Create order
      const order: Order = {
        symbol: decision.symbol,
        portfolioId: decision.portfolioId,
        side: decision.action === 'HOLD' ? 'BUY' : decision.action, // Convert HOLD to BUY for order
        orderType: 'MARKET',
        quantity: decision.suggestedQuantity,
        price: decision.suggestedPrice,
        status: 'PENDING',
        orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        clientOrderId: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };

      // Place order with Binance
      const binanceOrder = await this.binanceManager.placeOrder({
        symbol: order.symbol,
        side: order.side,
        type: order.orderType,
        quantity: order.quantity,
        ...(order.price !== undefined && { price: order.price })
      });

      // Update order with Binance response
      order.orderId = binanceOrder.orderId.toString();
      order.status = 'FILLED';
      order.filledQuantity = parseFloat(binanceOrder.executedQty);
      order.averagePrice = parseFloat(binanceOrder.price);
      order.commission = binanceOrder.fills?.[0]?.commission ? parseFloat(binanceOrder.fills[0].commission) : 0;

      // Create or update position
      this.updatePosition(decision, order);

      // Add stop loss and take profit orders if enabled
      if (decision.stopLoss && this.config.enableStopLoss) {
        await this.placeStopLossOrder(decision, order);
      }

      if (decision.takeProfit && this.config.enableTakeProfit) {
        await this.placeTakeProfitOrder(decision, order);
      }

      this.pendingOrders.set(order.orderId, order);
      this.emit('order_executed', order);

      return order;
    } catch (error) {
      this.emit('execution_error', { decision, error: (error as Error).message });
      return null;
    }
  }

  private updatePosition(decision: TradeDecision, order: Order): void {
    const positionKey = `${decision.portfolioId}_${decision.symbol}`;
    const currentPosition = this.activePositions.get(positionKey);

    if (decision.action === 'BUY') {
      if (currentPosition && currentPosition.side === 'LONG') {
        // Add to existing long position
        currentPosition.quantity += order.filledQuantity || order.quantity;
        currentPosition.lastUpdateTime = new Date();
      } else {
        // Create new long position
        const newPosition: Position = {
          symbol: decision.symbol,
          portfolioId: decision.portfolioId,
          side: 'LONG',
          quantity: order.filledQuantity || order.quantity,
          entryPrice: order.averagePrice || order.price || 0,
          currentPrice: order.averagePrice || order.price || 0,
          unrealizedPnL: 0,
          realizedPnL: 0,
          stopLoss: decision.stopLoss,
          takeProfit: decision.takeProfit,
          entryTime: new Date(),
          lastUpdateTime: new Date(),
          status: 'OPEN',
          tradeId: order.orderId
        };
        this.activePositions.set(positionKey, newPosition);
      }
    } else if (decision.action === 'SELL') {
      if (currentPosition) {
        // Close or reduce position
        if (currentPosition.side === 'LONG') {
          const closeQuantity = Math.min(currentPosition.quantity, order.filledQuantity || order.quantity);
          const pnl = (order.averagePrice || order.price || 0) - currentPosition.entryPrice;
          
          currentPosition.realizedPnL += pnl * closeQuantity;
          currentPosition.quantity -= closeQuantity;
          
          if (currentPosition.quantity <= 0) {
            currentPosition.status = 'CLOSED';
            this.activePositions.delete(positionKey);
          }
        }
      }
    }
  }

  private async placeStopLossOrder(decision: TradeDecision, order: Order): Promise<void> {
    try {
      const stopLossOrder = await this.binanceManager.placeOrder({
        symbol: decision.symbol,
        side: 'SELL',
        type: 'STOP_LOSS',
        quantity: order.quantity,
        stopPrice: decision.stopLoss!
      });

      this.emit('stop_loss_placed', { order, stopLossOrder });
    } catch (error) {
      this.emit('stop_loss_error', { order, error: (error as Error).message });
    }
  }

  private async placeTakeProfitOrder(decision: TradeDecision, order: Order): Promise<void> {
    try {
      const takeProfitOrder = await this.binanceManager.placeOrder({
        symbol: decision.symbol,
        side: 'SELL',
        type: 'TAKE_PROFIT',
        quantity: order.quantity,
        stopPrice: decision.takeProfit!
      });

      this.emit('take_profit_placed', { order, takeProfitOrder });
    } catch (error) {
      this.emit('take_profit_error', { order, error: (error as Error).message });
    }
  }

  public getPosition(portfolioId: string, symbol: string): Position | undefined {
    const positionKey = `${portfolioId}_${symbol}`;
    return this.activePositions.get(positionKey);
  }

  public getAllPositions(portfolioId: string): Position[] {
    return Array.from(this.activePositions.values())
      .filter(position => position.portfolioId === portfolioId);
  }

  public getOrder(orderId: string): Order | undefined {
    return this.pendingOrders.get(orderId);
  }

  public getAllOrders(portfolioId: string): Order[] {
    return Array.from(this.pendingOrders.values())
      .filter(order => order.portfolioId === portfolioId);
  }

  public getTradeHistory(portfolioId: string): TradeDecision[] {
    return this.tradeHistory.filter(decision => decision.portfolioId === portfolioId);
  }

  public getStatus(): { isRunning: boolean; activePositions: number; pendingOrders: number } {
    return {
      isRunning: this.isRunning,
      activePositions: this.activePositions.size,
      pendingOrders: this.pendingOrders.size
    };
  }

  public async updatePositionPrices(): Promise<void> {
    for (const [, position] of this.activePositions) {
      try {
        const ticker = await this.binanceManager.getTicker24hr(position.symbol);
        if (ticker && !Array.isArray(ticker)) {
          position.currentPrice = parseFloat(ticker.lastPrice);
          position.unrealizedPnL = position.side === 'LONG' 
            ? (position.currentPrice - position.entryPrice) * position.quantity
            : (position.entryPrice - position.currentPrice) * position.quantity;
          position.lastUpdateTime = new Date();
        }
      } catch (error) {
        this.emit('price_update_error', { position, error: (error as Error).message });
      }
    }
  }
}
