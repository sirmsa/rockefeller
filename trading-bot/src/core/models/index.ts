// Core data models and interfaces for the trading bot

export interface Symbol {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: 'TRADING' | 'BREAK' | 'AUCTION_MATCH';
  baseAssetPrecision: number;
  quotePrecision: number;
  quoteAssetPrecision: number;
  filters: SymbolFilter[];
  permissions: string[];
}

export interface SymbolFilter {
  filterType: 'PRICE_FILTER' | 'LOT_SIZE' | 'MIN_NOTIONAL' | 'MAX_NUM_ORDERS' | 'MAX_ALGO_ORDERS' | 'ICEBERG_PARTS' | 'PERCENT_PRICE' | 'MARKET_LOT_SIZE' | 'TRAILING_DELTA' | 'NOTIONAL';
  minPrice?: string;
  maxPrice?: string;
  tickSize?: string;
  minQty?: string;
  maxQty?: string;
  stepSize?: string;
  minNotional?: string;
  maxNumOrders?: number;
  maxAlgoOrders?: number;
  icebergParts?: number;
  multiplierUp?: string;
  multiplierDown?: string;
  avgPriceMins?: number;
  minTrailingAboveDelta?: number;
  maxTrailingAboveDelta?: number;
  minTrailingBelowDelta?: number;
  maxTrailingBelowDelta?: number;
  maxNotional?: string;
  applyMinToMarket?: boolean;
  applyMaxToMarket?: boolean;
  maxNumIcebergOrders?: number;
}

export interface KlineData {
  symbol: string;
  openTime: Date;
  closeTime: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  quoteVolume: number;
  trades: number;
  takerBuyBaseVolume: number;
  takerBuyQuoteVolume: number;
}

export interface PriceData {
  symbol: string;
  price: number;
  timestamp: Date;
  volume?: number;
}

export interface VolumeData {
  symbol: string;
  volume: number;
  quoteVolume: number;
  timestamp: Date;
}

export interface TechnicalIndicators {
  rsi: number;
  ma20: number;
  ma50: number;
  ema12: number;
  ema26: number;
  volume: number;
  volumeMA: number;
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
}

export interface OrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT_LIMIT';
  quantity: number;
  price?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  stopPrice?: number;
  icebergQty?: number;
  clientOrderId?: string;
}

export interface OrderResponse {
  symbol: string;
  orderId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'PENDING_CANCEL' | 'REJECTED' | 'EXPIRED';
  timeInForce: string;
  type: string;
  side: string;
}

export interface AccountInfo {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  accountType: string;
  balances: Balance[];
  permissions: string[];
}

export interface Balance {
  asset: string;
  free: string;
  locked: string;
}

export interface Portfolio {
  id: string;
  name: string;
  symbols: PortfolioSymbol[];
  totalBudget: number;
  maxBudgetPerSymbol: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: Date;
  isActive: boolean;
  binanceAccountId?: string;
  apiKeyPermissions?: Record<string, any>;
}

export interface PortfolioSymbol {
  symbol: string;
  allocatedBudget: number;
  currentPosition: number;
  entryPrice?: number;
  entryTime?: Date;
}

export interface AISymbolAnalysis {
  symbol: string;
  timestamp: Date;
  sentimentScore: number; // -1 to 1
  confidence: number; // 0 to 1
  sources: string[];
  newsSentiment: number;
  socialSentiment: number;
  marketSentiment: number;
  reasoning: string;
}

export interface TechnicalAnalysis {
  symbol: string;
  timestamp: Date;
  rsi: number;
  ma20: number;
  ma50: number;
  ema12: number;
  ema26: number;
  volume: number;
  volumeMA: number;
  fibonacciLevels: number[];
  supportLevels: number[];
  resistanceLevels: number[];
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: number; // 0 to 1
  stopLoss: number;
  takeProfit: number;
}

export interface Trade {
  id: string;
  portfolioId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT_LIMIT';
  quantity: number;
  price: number;
  executedQty: number;
  cummulativeQuoteQty: number;
  timestamp: Date;
  status: 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'PENDING_CANCEL' | 'REJECTED' | 'EXPIRED';
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  aiSentiment: AISymbolAnalysis;
  technicalAnalysis: TechnicalAnalysis;
  reasoning: string;
  pnl?: number;
  fees: number;
  binanceOrderId: number;
  clientOrderId?: string;
  icebergQty?: number;
  stopPrice?: number;
  origQuoteOrderQty?: number;
}

export interface TradingDecision {
  shouldTrade: boolean;
  side: 'BUY' | 'SELL';
  confidence: number;
  stopLoss: number;
  takeProfit: number;
  reasoning: string;
}

export interface PerformanceMetrics {
  totalValue: number;
  pnl: number;
  pnlPercentage: number;
  sharpeRatio?: number;
  sortinoRatio?: number;
  maxDrawdown?: number;
  winRate?: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  profitFactor?: number;
}

export interface RiskMetrics {
  valueAtRisk: number;
  expectedShortfall: number;
  portfolioBeta: number;
  correlationMatrix: Record<string, Record<string, number>>;
  volatility: number;
  maxExposure: number;
  currentExposure: number;
}

export type KlineInterval = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M';
