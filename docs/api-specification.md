# Rockefeller AI Trading System - API Specification

## Service Interfaces

### IRockefellerAIService (Core AI Decision Engine)

The central service responsible for all AI-driven trading decisions, technical analysis, and market assessment.

#### Core Analysis Methods

```csharp
public interface IRockefellerAIService
{
    // Primary Analysis Methods
    Task<AIStrategyAnalysis> AnalyzeStrategyOnTheFlyAsync(string symbol, string strategyType, Dictionary<string, object> parameters);
    Task<AIStrategyAnalysis> AnalyzeCurrentMarketConditionsAsync(string symbol);
    
    // Market Regime Detection
    Task<MarketRegime> DetectMarketRegimeAsync(string symbol);
    Task<MarketRegime> GetCurrentMarketRegimeAsync(string symbol);
    
    // Risk Assessment
    Task<RiskAssessment> AssessTradeRiskAsync(string symbol, string strategyType, decimal positionSize);
    Task<RiskAssessment> GetCurrentRiskProfileAsync(string symbol);
    
    // Technical Analysis
    Task<TechnicalAnalysisResult> PerformTechnicalAnalysisAsync(string symbol, List<string> indicators);
    Task<TechnicalAnalysisResult> GetLatestTechnicalAnalysisAsync(string symbol);
    
    // Market Sentiment
    Task<MarketSentimentAnalysis> AnalyzeMarketSentimentAsync(string symbol);
    Task<MarketSentimentAnalysis> GetCurrentSentimentAsync(string symbol);
    
    // Trading Signals
    Task<List<AITradingSignal>> GenerateTradingSignalsAsync(string symbol, string timeframe);
    Task<TradingSignal> GetLatestTradingSignalAsync(string symbol);
    
    // Performance Prediction
    Task<PerformancePrediction> PredictStrategyPerformanceAsync(string strategyType, string symbol, int days);
    Task<PerformancePrediction> GetPerformancePredictionAsync(string symbol);
    
    // Real-time Analysis
    Task<RealTimeAnalysis> GetRealTimeAnalysisAsync(string symbol);
    Task<bool> UpdateRealTimeAnalysisAsync(string symbol, RealTimeAnalysis analysis);
}
```

#### Data Models

```csharp
public class AIStrategyAnalysis
{
    public string Id { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string StrategyType { get; set; } = string.Empty;
    
    // Analysis Results
    public string Recommendation { get; set; } = string.Empty; // BUY, SELL, HOLD, WAIT
    public decimal Confidence { get; set; } // 0.0 to 1.0
    public string Reasoning { get; set; } = string.Empty;
    
    // Technical Analysis
    public TechnicalAnalysisResult TechnicalIndicators { get; set; } = new();
    public MarketSentimentAnalysis Sentiment { get; set; } = new();
    public List<AITradingSignal> Signals { get; set; } = [];
    
    // Risk Assessment
    public RiskAssessment Risk { get; set; } = new();
    public PerformancePrediction Prediction { get; set; } = new();
    public MarketRegime MarketRegime { get; set; } = new();
    
    // Metadata
    public DateTime AnalysisTime { get; set; }
    public TimeSpan AnalysisDuration { get; set; }
    public Dictionary<string, object> Parameters { get; set; } = new();
}

public class TechnicalAnalysisResult
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    
    // Technical Indicators
    public Dictionary<string, decimal> Indicators { get; set; } = new();
    public Dictionary<string, string> Signals { get; set; } = new(); // BUY, SELL, NEUTRAL
    
    // Support/Resistance
    public List<decimal> SupportLevels { get; set; } = [];
    public List<decimal> ResistanceLevels { get; set; } = [];
    
    // Trend Analysis
    public string TrendDirection { get; set; } = string.Empty; // UP, DOWN, SIDEWAYS
    public decimal TrendStrength { get; set; } // 0.0 to 1.0
    public string TrendDuration { get; set; } = string.Empty; // SHORT, MEDIUM, LONG
    
    // Volatility
    public decimal Volatility { get; set; }
    public decimal AverageTrueRange { get; set; }
    public decimal BollingerBandWidth { get; set; }
}

public class MarketSentimentAnalysis
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    
    // Sentiment Scores
    public decimal OverallSentiment { get; set; } // -1.0 to 1.0
    public decimal NewsSentiment { get; set; } // -1.0 to 1.0
    public decimal SocialMediaSentiment { get; set; } // -1.0 to 1.0
    public decimal MarketPsychologySentiment { get; set; } // -1.0 to 1.0
    
    // Market Psychology
    public string MarketMood { get; set; } = string.Empty; // FEAR, GREED, NEUTRAL
    public decimal FearGreedIndex { get; set; } // 0 to 100
    public string MarketRegime { get; set; } = string.Empty; // BULL, BEAR, SIDEWAYS
    
    // News Analysis
    public List<NewsItem> RecentNews { get; set; } = [];
    public decimal NewsImpactScore { get; set; } // 0.0 to 1.0
    public string NewsSentimentTrend { get; set; } = string.Empty; // IMPROVING, DETERIORATING, STABLE
}

public class RiskAssessment
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    
    // Risk Metrics
    public decimal RiskScore { get; set; } // 0.0 to 1.0
    public decimal VolatilityRisk { get; set; }
    public decimal LiquidityRisk { get; set; }
    public decimal MarketRisk { get; set; }
    
    // Position Sizing
    public decimal RecommendedPositionSize { get; set; }
    public decimal MaximumPositionSize { get; set; }
    public decimal RiskAdjustedSize { get; set; }
    
    // Risk Controls
    public decimal RecommendedStopLoss { get; set; }
    public decimal RecommendedTakeProfit { get; set; }
    public decimal MaximumDrawdown { get; set; }
    
    // Market Conditions
    public string RiskLevel { get; set; } = string.Empty; // LOW, MEDIUM, HIGH, EXTREME
    public string RiskTrend { get; set; } = string.Empty; // IMPROVING, DETERIORATING, STABLE
}
```

### ITradingService (Position Management & Execution)

Service responsible for managing trading positions, order execution, and risk management.

#### Core Methods

```csharp
public interface ITradingService
{
    // Position Management
    Task<bool> OpenPositionAsync(string symbol, string side, decimal size, decimal price, string strategy);
    Task<bool> ClosePositionAsync(string positionId, decimal price, string reason);
    Task<bool> UpdatePositionAsync(string positionId, decimal stopLoss, decimal takeProfit);
    Task<bool> ModifyPositionAsync(string positionId, decimal newSize, decimal newPrice);
    
    // Position Queries
    Task<List<RockefellerPosition>> GetActivePositionsAsync();
    Task<RockefellerPosition?> GetPositionAsync(string positionId);
    Task<List<RockefellerPosition>> GetPositionsBySymbolAsync(string symbol);
    Task<List<RockefellerPosition>> GetPositionsByStrategyAsync(string strategy);
    
    // Risk Management
    Task<bool> ValidatePositionAsync(string symbol, decimal size, decimal price);
    Task<RiskAssessment> AssessPositionRiskAsync(string positionId);
    Task<bool> CheckRiskLimitsAsync(string symbol, decimal size);
    
    // Trading Control
    Task<bool> StartTradingAsync();
    Task<bool> StopTradingAsync();
    Task<bool> PauseTradingAsync();
    Task<TradingStatus> GetTradingStatusAsync();
    
    // Portfolio Management
    Task<PortfolioSummary> GetPortfolioSummaryAsync();
    Task<decimal> GetTotalPortfolioValueAsync();
    Task<decimal> GetUnrealizedPnLAsync();
    Task<decimal> GetRealizedPnLAsync();
}
```

#### Data Models

```csharp
public class RockefellerPosition
{
    public string Id { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Side { get; set; } = string.Empty; // LONG, SHORT
    public decimal Size { get; set; }
    public decimal EntryPrice { get; set; }
    public DateTime EntryTime { get; set; }
    
    // Current State
    public decimal CurrentPrice { get; set; }
    public decimal UnrealizedPnL { get; set; }
    public decimal UnrealizedROI { get; set; }
    public string Status { get; set; } = string.Empty; // OPEN, CLOSED, PENDING
    
    // Risk Management
    public decimal StopLoss { get; set; }
    public decimal TakeProfit { get; set; }
    public decimal MaxDrawdown { get; set; }
    
    // AI Context
    public string Strategy { get; set; } = string.Empty;
    public string EntryReason { get; set; } = string.Empty;
    public decimal EntryConfidence { get; set; }
    public AIAnalysisRecord EntryAnalysis { get; set; } = new();
    
    // Performance Tracking
    public decimal PeakValue { get; set; }
    public decimal TroughValue { get; set; }
    public TimeSpan Duration { get; set; }
}

public class PortfolioSummary
{
    public decimal TotalValue { get; set; }
    public decimal CashBalance { get; set; }
    public decimal InvestedAmount { get; set; }
    public decimal UnrealizedPnL { get; set; }
    public decimal RealizedPnL { get; set; }
    public decimal TotalPnL { get; set; }
    
    // Risk Metrics
    public decimal TotalRisk { get; set; }
    public decimal MaxDrawdown { get; set; }
    public decimal SharpeRatio { get; set; }
    public decimal Volatility { get; set; }
    
    // Position Summary
    public int TotalPositions { get; set; }
    public int LongPositions { get; set; }
    public int ShortPositions { get; set; }
    public int ProfitablePositions { get; set; }
    public int LosingPositions { get; set; }
    
    // Performance
    public decimal WinRate { get; set; }
    public decimal AverageWin { get; set; }
    public decimal AverageLoss { get; set; }
    public decimal ProfitFactor { get; set; }
}
```

### IMarketDataService (Real-time Market Data)

Service providing real-time market data, price feeds, and market analysis.

#### Core Methods

```csharp
public interface IMarketDataService
{
    // Real-time Data
    Task<MarketData> GetMarketDataAsync(string symbol);
    Task<OrderBook> GetOrderBookAsync(string symbol, int depth = 20);
    Task<List<PriceHistory>> GetPriceHistoryAsync(string symbol, string timeframe, int count = 100);
    
    // Market Analysis
    Task<MarketDepth> GetMarketDepthAsync(string symbol);
    Task<VolumeAnalysis> GetVolumeAnalysisAsync(string symbol);
    Task<LiquidityAnalysis> GetLiquidityAnalysisAsync(string symbol);
    
    // Price Feeds
    Task<decimal> GetCurrentPriceAsync(string symbol);
    Task<decimal> GetBidPriceAsync(string symbol);
    Task<decimal> GetAskPriceAsync(string symbol);
    Task<decimal> GetLastPriceAsync(string symbol);
    
    // Market Statistics
    Task<MarketStatistics> GetMarketStatisticsAsync(string symbol);
    Task<VolatilityMetrics> GetVolatilityMetricsAsync(string symbol);
    Task<CorrelationMatrix> GetCorrelationMatrixAsync(List<string> symbols);
    
    // Real-time Updates
    Task<IObservable<MarketDataUpdate>> SubscribeToMarketDataAsync(string symbol);
    Task<IObservable<PriceUpdate>> SubscribeToPriceUpdatesAsync(string symbol);
    Task<IObservable<VolumeUpdate>> SubscribeToVolumeUpdatesAsync(string symbol);
}
```

#### Data Models

```csharp
public class MarketData
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    
    // Price Data
    public decimal Open { get; set; }
    public decimal High { get; set; }
    public decimal Low { get; set; }
    public decimal Close { get; set; }
    public decimal Last { get; set; }
    public decimal Bid { get; set; }
    public decimal Ask { get; set; }
    
    // Volume Data
    public decimal Volume { get; set; }
    public decimal QuoteVolume { get; set; }
    public decimal VolumeWeightedAveragePrice { get; set; }
    
    // Market Metrics
    public decimal PriceChange { get; set; }
    public decimal PriceChangePercent { get; set; }
    public decimal High24h { get; set; }
    public decimal Low24h { get; set; }
    public decimal Volume24h { get; set; }
    
    // Additional Data
    public decimal NumberOfTrades { get; set; }
    public decimal TakerBuyBaseVolume { get; set; }
    public decimal TakerBuyQuoteVolume { get; set; }
}

public class OrderBook
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public long LastUpdateId { get; set; }
    
    // Order Book Data
    public List<OrderBookEntry> Bids { get; set; } = [];
    public List<OrderBookEntry> Asks { get; set; } = [];
    
    // Calculated Metrics
    public decimal Spread { get; set; }
    public decimal MidPrice { get; set; }
    public decimal BidVolume { get; set; }
    public decimal AskVolume { get; set; }
    public decimal TotalVolume { get; set; }
}

public class OrderBookEntry
{
    public decimal Price { get; set; }
    public decimal Quantity { get; set; }
    public decimal TotalValue { get; set; }
    public decimal CumulativeVolume { get; set; }
}
```

### IAnalyticsService (Performance & Historical Analysis)

Service providing trading performance analytics, historical data analysis, and success metrics.

#### Core Methods

```csharp
public interface IAnalyticsService
{
    // Performance Metrics
    Task<AnalyticsData> GetAnalyticsDataAsync();
    Task<PerformanceMetrics> GetPerformanceMetricsAsync(DateTime startDate, DateTime endDate);
    Task<List<PerformanceMetric>> GetPerformanceMetricsAsync(string metricName, DateTime startDate, DateTime endDate, string? symbol = null);
    
    // Trade Analysis
    Task<List<Trade>> GetRecentTradesAsync(int count = 100);
    Task<List<Trade>> GetTradesBySymbolAsync(string symbol, DateTime startDate, DateTime endDate);
    Task<List<Trade>> GetTradesByStrategyAsync(string strategy, DateTime startDate, DateTime endDate);
    
    // Portfolio Analysis
    Task<PortfolioAnalytics> GetPortfolioAnalyticsAsync(DateTime startDate, DateTime endDate);
    Task<RiskAnalytics> GetRiskAnalyticsAsync(DateTime startDate, DateTime endDate);
    Task<CorrelationAnalytics> GetCorrelationAnalyticsAsync(List<string> symbols, DateTime startDate, DateTime endDate);
    
    // AI Performance
    Task<AIPerformanceMetrics> GetAIPerformanceMetricsAsync(DateTime startDate, DateTime endDate);
    Task<List<AIDecisionAnalysis>> GetAIDecisionAnalysisAsync(string symbol, DateTime startDate, DateTime endDate);
    Task<AISuccessRate> GetAISuccessRateAsync(DateTime startDate, DateTime endDate);
}
```

#### Data Models

```csharp
public class AnalyticsData
{
    // Performance Metrics
    public decimal TotalReturn { get; set; }
    public decimal WinRate { get; set; }
    public int TotalTrades { get; set; }
    public string AverageHoldTime { get; set; } = string.Empty;
    
    // Risk Metrics
    public decimal SharpeRatio { get; set; }
    public decimal MaxDrawdown { get; set; }
    public decimal Volatility { get; set; }
    
    // Trading Data
    public List<Trade> RecentTrades { get; set; } = [];
    public List<StrategyPerformance> StrategyPerformance { get; set; } = [];
    public PerformanceHistory PerformanceHistory { get; set; } = new();
}

public class Trade
{
    public string Id { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // LONG, SHORT
    public decimal EntryPrice { get; set; }
    public decimal? ExitPrice { get; set; }
    public decimal Size { get; set; }
    public decimal PnL { get; set; }
    public string Duration { get; set; } = string.Empty;
    
    // AI Context
    public string Strategy { get; set; } = string.Empty;
    public decimal EntryConfidence { get; set; }
    public string EntryReason { get; set; } = string.Empty;
    public string ExitReason { get; set; } = string.Empty;
    
    // Timestamps
    public DateTime EntryTime { get; set; }
    public DateTime? ExitTime { get; set; }
}

public class StrategyPerformance
{
    public string Name { get; set; } = string.Empty;
    public int TradeCount { get; set; }
    public decimal Return { get; set; }
    public decimal WinRate { get; set; }
    public decimal AverageReturn { get; set; }
    public decimal MaxDrawdown { get; set; }
    public decimal SharpeRatio { get; set; }
}
```

## Data Persistence Models

### AI Analysis Records

```csharp
public class AIAnalysisRecord
{
    public string Id { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    
    // Analysis Type
    public string AnalysisType { get; set; } = string.Empty; // ENTRY, EXIT, MONITORING
    public string Strategy { get; set; } = string.Empty;
    public Dictionary<string, object> Parameters { get; set; } = new();
    
    // Technical Analysis Results
    public TechnicalAnalysisResult TechnicalAnalysis { get; set; } = new();
    public Dictionary<string, decimal> Indicators { get; set; } = new();
    public Dictionary<string, string> IndicatorSignals { get; set; } = new();
    
    // AI Reasoning
    public string Decision { get; set; } = string.Empty; // BUY, SELL, HOLD, WAIT
    public decimal Confidence { get; set; } // 0.0 to 1.0
    public string Reasoning { get; set; } = string.Empty;
    public List<string> SupportingFactors { get; set; } = [];
    public List<string> RiskFactors { get; set; } = [];
    
    // Market Context
    public MarketContext MarketContext { get; set; } = new();
    public RiskAssessment RiskAssessment { get; set; } = new();
    public MarketSentimentAnalysis Sentiment { get; set; } = new();
    
    // Performance Tracking
    public bool WasSuccessful { get; set; }
    public decimal? ActualReturn { get; set; }
    public string? PostTradeAnalysis { get; set; }
    public DateTime? PostTradeAnalysisDate { get; set; }
    
    // Metadata
    public string Version { get; set; } = string.Empty;
    public Dictionary<string, object> Metadata { get; set; } = new();
}

public class MarketContext
{
    public DateTime Timestamp { get; set; }
    public string MarketRegime { get; set; } = string.Empty;
    public decimal MarketVolatility { get; set; }
    public string MarketTrend { get; set; } = string.Empty;
    public decimal MarketStrength { get; set; }
    
    // Economic Indicators
    public decimal FearGreedIndex { get; set; }
    public string MarketMood { get; set; } = string.Empty;
    public decimal MarketCorrelation { get; set; }
    
    // External Factors
    public List<string> MarketEvents { get; set; } = [];
    public List<string> NewsHeadlines { get; set; } = [];
    public string OverallMarketSentiment { get; set; } = string.Empty;
}
```

### Position History

```csharp
public class PositionHistory
{
    public string Id { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Side { get; set; } = string.Empty; // LONG, SHORT
    public string Strategy { get; set; } = string.Empty;
    
    // Entry Details
    public DateTime EntryTime { get; set; }
    public decimal EntryPrice { get; set; }
    public decimal Size { get; set; }
    public decimal EntryValue { get; set; }
    public AIAnalysisRecord EntryAnalysis { get; set; } = new();
    
    // Exit Details
    public DateTime? ExitTime { get; set; }
    public decimal? ExitPrice { get; set; }
    public decimal? ExitValue { get; set; }
    public string? ExitReason { get; set; }
    public AIAnalysisRecord? ExitAnalysis { get; set; }
    
    // Performance Metrics
    public decimal? PnL { get; set; }
    public decimal? ROI { get; set; }
    public decimal MaxDrawdown { get; set; }
    public decimal PeakValue { get; set; }
    public decimal TroughValue { get; set; }
    public TimeSpan Duration { get; set; }
    
    // Risk Management
    public decimal InitialStopLoss { get; set; }
    public decimal InitialTakeProfit { get; set; }
    public List<RiskAdjustment> RiskAdjustments { get; set; } = [];
    
    // AI Performance
    public decimal EntryConfidence { get; set; }
    public decimal ExitConfidence { get; set; }
    public bool WasSuccessful { get; set; }
    public string SuccessReason { get; set; } = string.Empty;
}

public class RiskAdjustment
{
    public DateTime Timestamp { get; set; }
    public string Type { get; set; } = string.Empty; // STOP_LOSS, TAKE_PROFIT, POSITION_SIZE
    public decimal OldValue { get; set; }
    public decimal NewValue { get; set; }
    public string Reason { get; set; } = string.Empty;
    public AIAnalysisRecord Analysis { get; set; } = new();
}
```

## Error Handling & Response Models

### Standard Response Format

```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public List<string> Errors { get; set; } = [];
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class ErrorResponse
{
    public string ErrorCode { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Details { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? RequestId { get; set; }
}
```

### Common Error Codes

```csharp
public static class ErrorCodes
{
    // Validation Errors
    public const string InvalidSymbol = "INVALID_SYMBOL";
    public const string InvalidAmount = "INVALID_AMOUNT";
    public const string InvalidPrice = "INVALID_PRICE";
    public const string InvalidStrategy = "INVALID_STRATEGY";
    
    // Trading Errors
    public const string InsufficientFunds = "INSUFFICIENT_FUNDS";
    public const string PositionLimitExceeded = "POSITION_LIMIT_EXCEEDED";
    public const string RiskLimitExceeded = "RISK_LIMIT_EXCEEDED";
    public const string TradingDisabled = "TRADING_DISABLED";
    
    // System Errors
    public const string ServiceUnavailable = "SERVICE_UNAVAILABLE";
    public const string DataUnavailable = "DATA_UNAVAILABLE";
    public const string AnalysisFailed = "ANALYSIS_FAILED";
    public const string PersistenceFailed = "PERSISTENCE_FAILED";
    
    // AI Errors
    public const string AIAnalysisFailed = "AI_ANALYSIS_FAILED";
    public const string InsufficientData = "INSUFFICIENT_DATA";
    public const string ModelUnavailable = "MODEL_UNAVAILABLE";
    public const string ConfidenceTooLow = "CONFIDENCE_TOO_LOW";
}
```

## Configuration & Settings

### User Configuration Model

```csharp
public class UserConfiguration
{
    // Budget & Limits
    public decimal TotalBudget { get; set; }
    public decimal MaxPositionSize { get; set; } // Percentage of total budget
    public decimal DailyLossLimit { get; set; }
    public decimal MaxTotalPositions { get; set; }
    
    // Risk Profile
    public string RiskLevel { get; set; } = string.Empty; // CONSERVATIVE, MODERATE, AGGRESSIVE
    public decimal MaxDrawdown { get; set; }
    public decimal MinConfidence { get; set; }
    
    // Trading Preferences
    public List<string> EnabledSymbols { get; set; } = [];
    public List<string> EnabledStrategies { get; set; } = [];
    public bool EnableAutoTrading { get; set; }
    public bool EnableRiskManagement { get; set; }
    
    // AI Configuration
    public decimal MinAIConfidence { get; set; }
    public string AnalysisFrequency { get; set; } = string.Empty; // REAL_TIME, MINUTE_5, MINUTE_15
    public bool EnableSentimentAnalysis { get; set; }
    public bool EnableNewsAnalysis { get; set; }
}
```

This API specification provides a comprehensive foundation for implementing the Rockefeller AI Trading System with clear interfaces, data models, and error handling patterns.
