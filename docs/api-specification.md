# Rockefeller Day-Trader AI System - API Specification

## System Overview

The Rockefeller Day-Trader AI System is a **fully automated cryptocurrency trading platform** that enables users to create and manage portfolios with selected symbols. The system makes **autonomous trading decisions** based on **technical analysis**, **mathematical predictions**, and **real-time sentiment analysis** from internet/coin analysis sources. The platform operates on **minute-to-minute timeframes** with **sub-second execution** and **comprehensive analytics**.

## API Routes Structure

### Portfolio Management API Routes (`/api/portfolios`)

The central API routes responsible for **portfolio management**, **symbol selection**, and **budget allocation**. Designed for **multi-portfolio support** and **automated trading operations**.

#### Core Portfolio Endpoints

```typescript
// POST /api/portfolios
interface CreatePortfolioRequest {
  name: string;
  budget: number;
  symbols: string[];
  riskSettings?: RiskSettings;
}

interface CreatePortfolioResponse {
  success: boolean;
  data: Portfolio;
  message?: string;
}

// GET /api/portfolios
interface GetPortfoliosResponse {
  success: boolean;
  data: Portfolio[];
  message?: string;
}

// GET /api/portfolios/:id
interface GetPortfolioRequest {
  portfolioId: string;
}

interface GetPortfolioResponse {
  success: boolean;
  data: Portfolio;
  message?: string;
}

// PUT /api/portfolios/:id
interface UpdatePortfolioRequest {
  portfolioId: string;
  updates: PortfolioUpdates;
}

interface UpdatePortfolioResponse {
  success: boolean;
  data: Portfolio;
  message?: string;
}

// DELETE /api/portfolios/:id
interface DeletePortfolioRequest {
  portfolioId: string;
}

interface DeletePortfolioResponse {
  success: boolean;
  data: boolean;
  message?: string;
}

// POST /api/portfolios/:id/symbols
interface AddSymbolRequest {
  portfolioId: string;
  symbol: string;
  allocation?: number;
}

interface AddSymbolResponse {
  success: boolean;
  data: boolean;
  message?: string;
}

// DELETE /api/portfolios/:id/symbols/:symbol
interface RemoveSymbolRequest {
  portfolioId: string;
  symbol: string;
}

interface RemoveSymbolResponse {
  success: boolean;
  data: boolean;
  message?: string;
}

// PUT /api/portfolios/:id/budget
interface UpdateBudgetRequest {
  portfolioId: string;
  budget: number;
}

interface UpdateBudgetResponse {
  success: boolean;
  data: boolean;
  message?: string;
}

// GET /api/portfolios/:id/performance
interface GetPerformanceRequest {
  portfolioId: string;
  timeframe?: string; // 1d, 7d, 30d, 90d, 1y
}

interface GetPerformanceResponse {
  success: boolean;
  data: PortfolioPerformance;
  message?: string;
}
```

#### Data Models (Portfolio Management)

```typescript
interface Portfolio {
  id: string;
  name: string;
  userId: string;
  budget: number;
  allocatedBudget: number;
  symbols: PortfolioSymbol[];
  riskSettings: RiskSettings;
  performance: PortfolioPerformance;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioSymbol {
  symbol: string;
  allocation: number; // Percentage of portfolio budget
  currentValue: number;
  performance: number; // ROI percentage
  sentiment: SentimentData;
  isActive: boolean;
  lastUpdated: string;
}

interface RiskSettings {
  maxPositionSize: number; // Maximum percentage per position
  maxDailyLoss: number; // Maximum daily loss percentage
  maxDrawdown: number; // Maximum drawdown percentage
  stopLossPercentage: number; // Default stop loss percentage
  takeProfitPercentage: number; // Default take profit percentage
  correlationLimit: number; // Maximum correlation between positions
}

interface PortfolioPerformance {
  totalValue: number;
  totalPnL: number;
  totalROI: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalTrades: number;
  profitableTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  bestTrade: number;
  worstTrade: number;
  lastUpdated: string;
}

interface PortfolioUpdates {
  name?: string;
  budget?: number;
  riskSettings?: Partial<RiskSettings>;
  isActive?: boolean;
}
```

### AI Trading API Routes (`/api/trading`)

API routes responsible for **automated trading decisions**, **position management**, and **AI-driven execution**.

#### Core Trading Endpoints

```typescript
// POST /api/trading/analyze-portfolio
interface AnalyzePortfolioRequest {
  portfolioId: string;
}

interface AnalyzePortfolioResponse {
  success: boolean;
  data: TradingDecision[];
  message?: string;
}

// POST /api/trading/execute-decision
interface ExecuteDecisionRequest {
  decision: TradingDecision;
}

interface ExecuteDecisionResponse {
  success: boolean;
  data: Position;
  message?: string;
}

// GET /api/trading/positions/:portfolioId
interface GetPositionsRequest {
  portfolioId: string;
  status?: 'OPEN' | 'CLOSED' | 'ALL';
}

interface GetPositionsResponse {
  success: boolean;
  data: Position[];
  message?: string;
}

// POST /api/trading/close-position
interface ClosePositionRequest {
  positionId: string;
  reason: string;
}

interface ClosePositionResponse {
  success: boolean;
  data: boolean;
  message?: string;
}

// PUT /api/trading/update-position-risk
interface UpdatePositionRiskRequest {
  positionId: string;
  stopLoss?: number;
  takeProfit?: number;
}

interface UpdatePositionRiskResponse {
  success: boolean;
  data: boolean;
  message?: string;
}

// POST /api/trading/start-automation
interface StartAutomationRequest {
  portfolioId: string;
}

interface StartAutomationResponse {
  success: boolean;
  data: boolean;
  message?: string;
}

// POST /api/trading/stop-automation
interface StopAutomationRequest {
  portfolioId: string;
}

interface StopAutomationResponse {
  success: boolean;
  data: boolean;
  message?: string;
}

// GET /api/trading/automation-status/:portfolioId
interface GetAutomationStatusRequest {
  portfolioId: string;
}

interface GetAutomationStatusResponse {
  success: boolean;
  data: AutomationStatus;
  message?: string;
}
```

#### Data Models (Trading)

```typescript
interface TradingDecision {
  id: string;
  portfolioId: string;
  symbol: string;
  decision: 'BUY' | 'SELL' | 'HOLD' | 'CLOSE';
  confidence: number; // 0.0 to 1.0
  reasoning: string;
  technicalAnalysis: TechnicalAnalysis;
  mathematicalPrediction: PricePrediction;
  sentimentAnalysis: SentimentAnalysis;
  riskAssessment: RiskAssessment;
  suggestedSize: number;
  suggestedStopLoss: number;
  suggestedTakeProfit: number;
  timestamp: string;
}

interface Position {
  id: string;
  portfolioId: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  unrealizedPnL: number;
  unrealizedROI: number;
  status: 'OPEN' | 'CLOSED';
  entryDecision: TradingDecision;
  exitDecision?: TradingDecision;
  entryTime: string;
  exitTime?: string;
  duration?: string;
}

interface AutomationStatus {
  portfolioId: string;
  isAutomated: boolean;
  lastDecision: string;
  activePositions: number;
  totalPnL: number;
  lastUpdated: string;
}

interface TechnicalAnalysis {
  symbol: string;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    width: number;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    ema12: number;
    ema26: number;
  };
  support: number[];
  resistance: number[];
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: number; // 0.0 to 1.0
  timestamp: string;
}

interface PricePrediction {
  symbol: string;
  predictedPrice: number;
  confidence: number;
  timeframe: string; // 5m, 15m, 1h, 4h
  direction: 'UP' | 'DOWN' | 'SIDEWAYS';
  probability: number; // 0.0 to 1.0
  factors: string[];
  timestamp: string;
}

interface RiskAssessment {
  symbol: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  volatility: number;
  correlation: number;
  maxPositionSize: number;
  suggestedStopLoss: number;
  suggestedTakeProfit: number;
  riskRewardRatio: number;
  timestamp: string;
}
```

### Sentiment Analysis API Routes (`/api/sentiment`)

API routes providing **AI sentiment analysis** from internet/coin analysis sources and **sentiment integration** into trading decisions.

#### Core Sentiment Endpoints

```typescript
// GET /api/sentiment/:symbol
interface GetSentimentRequest {
  symbol: string;
}

interface GetSentimentResponse {
  success: boolean;
  data: AggregatedSentiment;
  message?: string;
}

// POST /api/sentiment/poll-internet
interface PollInternetSentimentRequest {
  symbol: string;
}

interface PollInternetSentimentResponse {
  success: boolean;
  data: SentimentData;
  message?: string;
}

// POST /api/sentiment/poll-coin-analysis
interface PollCoinAnalysisSentimentRequest {
  symbol: string;
}

interface PollCoinAnalysisSentimentResponse {
  success: boolean;
  data: SentimentData;
  message?: string;
}

// POST /api/sentiment/aggregate
interface AggregateSentimentRequest {
  symbol: string;
}

interface AggregateSentimentResponse {
  success: boolean;
  data: AggregatedSentiment;
  message?: string;
}

// GET /api/sentiment/history/:symbol
interface GetSentimentHistoryRequest {
  symbol: string;
  timeframe?: string; // 1h, 4h, 1d, 7d
  limit?: number;
}

interface GetSentimentHistoryResponse {
  success: boolean;
  data: SentimentHistory[];
  message?: string;
}

// POST /api/sentiment/start-polling
interface StartPollingRequest {
  symbols: string[];
  interval?: number; // Minutes
}

interface StartPollingResponse {
  success: boolean;
  data: boolean;
  message?: string;
}

// POST /api/sentiment/stop-polling
interface StopPollingRequest {
  symbols: string[];
}

interface StopPollingResponse {
  success: boolean;
  data: boolean;
  message?: string;
}

// GET /api/sentiment/polling-status
interface GetPollingStatusResponse {
  success: boolean;
  data: PollingStatus;
  message?: string;
}
```

#### Data Models (Sentiment Analysis)

```typescript
interface SentimentData {
  symbol: string;
  source: 'INTERNET' | 'COIN_ANALYSIS' | 'AGGREGATED';
  sentiment: number; // -1.0 to 1.0
  confidence: number; // 0.0 to 1.0
  volume: number;
  positiveMentions: number;
  negativeMentions: number;
  neutralMentions: number;
  totalMentions: number;
  keywords: string[];
  metadata: Record<string, any>;
  timestamp: string;
}

interface AggregatedSentiment {
  symbol: string;
  overallSentiment: number; // -1.0 to 1.0
  internetSentiment: number;
  coinAnalysisSentiment: number;
  confidence: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  trendStrength: number; // 0.0 to 1.0
  impact: SentimentImpact;
  lastUpdated: string;
}

interface SentimentImpact {
  symbol: string;
  impactScore: number; // -1.0 to 1.0
  tradingSignal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  expectedPriceMovement: number; // Percentage
  timeframe: string;
  timestamp: string;
}

interface SentimentHistory {
  symbol: string;
  sentiment: number;
  source: string;
  timestamp: string;
}

interface PollingStatus {
  activeSymbols: string[];
  lastPollTime: string;
  nextPollTime: string;
  pollingInterval: number; // Minutes
  isActive: boolean;
}
```

### Analytics API Routes (`/api/analytics`)

API routes providing **comprehensive analytics** for portfolio performance, trading decisions, and sentiment impact.

#### Core Analytics Endpoints

```typescript
// GET /api/analytics/portfolio/:portfolioId
interface GetPortfolioAnalyticsRequest {
  portfolioId: string;
  timeframe?: string; // 1d, 7d, 30d, 90d, 1y
}

interface GetPortfolioAnalyticsResponse {
  success: boolean;
  data: PortfolioAnalytics;
  message?: string;
}

// GET /api/analytics/trading-decisions/:portfolioId
interface GetTradingDecisionsRequest {
  portfolioId: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

interface GetTradingDecisionsResponse {
  success: boolean;
  data: TradingDecision[];
  message?: string;
}

// GET /api/analytics/ai-performance/:portfolioId
interface GetAIPerformanceRequest {
  portfolioId: string;
  timeframe?: string;
}

interface GetAIPerformanceResponse {
  success: boolean;
  data: AIPerformanceMetrics;
  message?: string;
}

// GET /api/analytics/sentiment-impact/:symbol
interface GetSentimentImpactRequest {
  symbol: string;
  timeframe?: string;
}

interface GetSentimentImpactResponse {
  success: boolean;
  data: SentimentImpactAnalysis;
  message?: string;
}

// GET /api/analytics/risk-metrics/:portfolioId
interface GetRiskMetricsRequest {
  portfolioId: string;
  timeframe?: string;
}

interface GetRiskMetricsResponse {
  success: boolean;
  data: RiskMetrics;
  message?: string;
}

// GET /api/analytics/strategy-performance/:portfolioId
interface GetStrategyPerformanceRequest {
  portfolioId: string;
  timeframe?: string;
}

interface GetStrategyPerformanceResponse {
  success: boolean;
  data: StrategyPerformance;
  message?: string;
}
```

#### Data Models (Analytics)

```typescript
interface PortfolioAnalytics {
  portfolioId: string;
  performance: PortfolioPerformance;
  riskMetrics: RiskMetrics;
  tradingMetrics: TradingMetrics;
  sentimentMetrics: SentimentMetrics;
  timeframe: string;
  lastUpdated: string;
}

interface TradingMetrics {
  totalTrades: number;
  profitableTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  bestTrade: number;
  worstTrade: number;
  averageHoldTime: string;
  totalVolume: number;
  averageVolume: number;
}

interface SentimentMetrics {
  averageSentiment: number;
  sentimentCorrelation: number;
  sentimentAccuracy: number;
  bullishSentimentCount: number;
  bearishSentimentCount: number;
  neutralSentimentCount: number;
  sentimentImpact: number;
}

interface AIPerformanceMetrics {
  decisionAccuracy: number;
  signalQuality: number;
  modelPerformance: number;
  technicalAccuracy: number;
  mathematicalAccuracy: number;
  sentimentAccuracy: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
}

interface SentimentImpactAnalysis {
  symbol: string;
  sentimentCorrelation: number;
  priceImpact: number;
  tradingSignalAccuracy: number;
  sentimentTrendAccuracy: number;
  impactMetrics: {
    positiveImpact: number;
    negativeImpact: number;
    neutralImpact: number;
  };
  timeframe: string;
}

interface RiskMetrics {
  maxDrawdown: number;
  sharpeRatio: number;
  sortinoRatio: number;
  volatility: number;
  var95: number; // Value at Risk 95%
  cvar95: number; // Conditional Value at Risk 95%
  beta: number;
  correlation: number;
  downsideDeviation: number;
}

interface StrategyPerformance {
  strategyName: string;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalReturn: number;
  averageReturn: number;
  bestPeriod: string;
  worstPeriod: string;
}
```

## WebSocket API (`/api/websocket`)

Real-time data streaming for live market updates, trading signals, and portfolio updates.

```typescript
// WebSocket Connection
interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

// Portfolio Updates
interface PortfolioUpdate extends WebSocketMessage {
  type: 'PORTFOLIO_UPDATE';
  data: {
    portfolioId: string;
    totalValue: number;
    totalPnL: number;
    activePositions: number;
    lastUpdate: string;
  };
}

// Trading Decision Updates
interface TradingDecisionUpdate extends WebSocketMessage {
  type: 'TRADING_DECISION';
  data: TradingDecision;
}

// Position Updates
interface PositionUpdate extends WebSocketMessage {
  type: 'POSITION_UPDATE';
  data: Position;
}

// Sentiment Updates
interface SentimentUpdate extends WebSocketMessage {
  type: 'SENTIMENT_UPDATE';
  data: {
    symbol: string;
    sentiment: number;
    source: string;
    impact: SentimentImpact;
  };
}

// Market Data Updates
interface MarketDataUpdate extends WebSocketMessage {
  type: 'MARKET_DATA_UPDATE';
  data: MarketData;
}

// Automation Status Updates
interface AutomationStatusUpdate extends WebSocketMessage {
  type: 'AUTOMATION_STATUS';
  data: AutomationStatus;
}
```

## Error Handling & Response Models

### Standard Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}

interface ErrorResponse {
  errorCode: string;
  message: string;
  details?: string;
  timestamp: string;
  requestId?: string;
}
```

### Common Error Codes

```typescript
const ErrorCodes = {
  // Portfolio Errors
  PORTFOLIO_NOT_FOUND: 'PORTFOLIO_NOT_FOUND',
  INSUFFICIENT_BUDGET: 'INSUFFICIENT_BUDGET',
  SYMBOL_ALREADY_EXISTS: 'SYMBOL_ALREADY_EXISTS',
  SYMBOL_NOT_FOUND: 'SYMBOL_NOT_FOUND',
  
  // Trading Errors
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  POSITION_LIMIT_EXCEEDED: 'POSITION_LIMIT_EXCEEDED',
  RISK_LIMIT_EXCEEDED: 'RISK_LIMIT_EXCEEDED',
  TRADING_DISABLED: 'TRADING_DISABLED',
  
  // Sentiment Errors
  SENTIMENT_SOURCE_UNAVAILABLE: 'SENTIMENT_SOURCE_UNAVAILABLE',
  SENTIMENT_POLLING_FAILED: 'SENTIMENT_POLLING_FAILED',
  SENTIMENT_DATA_INVALID: 'SENTIMENT_DATA_INVALID',
  
  // System Errors
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATA_UNAVAILABLE: 'DATA_UNAVAILABLE',
  ANALYSIS_FAILED: 'ANALYSIS_FAILED',
  PERSISTENCE_FAILED: 'PERSISTENCE_FAILED',
  
  // AI Errors
  AI_ANALYSIS_FAILED: 'AI_ANALYSIS_FAILED',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
  MODEL_UNAVAILABLE: 'MODEL_UNAVAILABLE',
  CONFIDENCE_TOO_LOW: 'CONFIDENCE_TOO_LOW',
} as const;
```

## Configuration & Settings

### User Configuration Model

```typescript
interface UserConfiguration {
  // Portfolio Configuration
  defaultPortfolioSettings: {
    maxPositionSize: number;
    maxDailyLoss: number;
    maxDrawdown: number;
    stopLossPercentage: number;
    takeProfitPercentage: number;
  };
  
  // Trading Configuration
  tradingSettings: {
    enableAutomation: boolean;
    minConfidence: number;
    maxConcurrentPositions: number;
    tradingHours: {
      start: string;
      end: string;
    };
  };
  
  // Sentiment Configuration
  sentimentSettings: {
    enableSentimentAnalysis: boolean;
    pollingInterval: number; // Minutes
    minSentimentConfidence: number;
    sentimentWeight: number; // 0.0 to 1.0
  };
  
  // Risk Configuration
  riskSettings: {
    maxPortfolioRisk: number;
    correlationLimit: number;
    volatilityLimit: number;
    enableCircuitBreakers: boolean;
  };
  
  // Analytics Configuration
  analyticsSettings: {
    enableRealTimeAnalytics: boolean;
    analyticsUpdateInterval: number; // Minutes
    enablePerformanceAlerts: boolean;
    enableRiskAlerts: boolean;
  };
}
```

This API specification provides a comprehensive foundation for implementing the Rockefeller AI Trading System with clear Next.js API routes, TypeScript interfaces, and error handling patterns for automated portfolio management and trading.
