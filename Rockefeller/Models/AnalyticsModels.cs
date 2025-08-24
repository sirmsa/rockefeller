using System.Collections.Concurrent;

namespace Rockefeller.Models;

#region Core AI Analysis Models

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

public class MarketRegime
{
    public string Type { get; set; } = string.Empty; // TRENDING, RANGING, VOLATILE
    public decimal Confidence { get; set; } // 0.0 to 1.0
    public decimal Volatility { get; set; }
    public decimal TrendStrength { get; set; }
    public DateTime DetectedAt { get; set; }
}

public class PerformancePrediction
{
    public string Symbol { get; set; } = string.Empty;
    public string StrategyType { get; set; } = string.Empty;
    public decimal PredictedReturn { get; set; }
    public decimal Confidence { get; set; }
    public int TimeHorizon { get; set; } // Days
    public DateTime PredictedAt { get; set; }
}

public class AITradingSignal
{
    public string Symbol { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // BUY, SELL, HOLD
    public decimal Confidence { get; set; }
    public string Reasoning { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    
    // Additional properties for UI compatibility
    public string SignalType { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class TradingSignal
{
    public string Symbol { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Confidence { get; set; }
    public string Reasoning { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    
    // Additional properties for UI compatibility
    public string SignalType { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class RealTimeAnalysis
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime LastUpdate { get; set; }
    public TechnicalAnalysisResult? CurrentTechnicalAnalysis { get; set; }
    public MarketSentimentAnalysis? CurrentSentiment { get; set; }
    public RiskAssessment? CurrentRiskAssessment { get; set; }
    public MarketRegime? CurrentMarketRegime { get; set; }
}

#endregion

#region Market Data Models

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
    
    // Additional properties for UI compatibility
    public decimal Price { get; set; } // Alias for Last
    public decimal Change24h { get; set; } // Alias for PriceChange
    public decimal ChangePercent24h { get; set; } // Alias for PriceChangePercent
    public Dictionary<string, object> TechnicalIndicators { get; set; } = new();
}

public class PriceHistory
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public decimal Open { get; set; }
    public decimal High { get; set; }
    public decimal Low { get; set; }
    public decimal Close { get; set; }
    public decimal Volume { get; set; }
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

public class NewsItem
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public DateTime PublishedAt { get; set; }
    public decimal SentimentScore { get; set; }
    public string Impact { get; set; } = string.Empty; // HIGH, MEDIUM, LOW
}

#endregion

#region Trading Models

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

#endregion

#region Analytics Models

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
    
    // Additional properties for UI compatibility
    public decimal ProfitFactor { get; set; }
    
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
    
    // Additional properties for UI compatibility
    public string Side { get; set; } = string.Empty; // BUY, SELL
    public decimal Price { get; set; } // Current or exit price
    public decimal ROI { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal StopLoss { get; set; }
    public decimal TakeProfit { get; set; }
    public decimal Commission { get; set; }
    public string OrderId { get; set; } = string.Empty;
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

public class PerformanceHistory
{
    public List<PerformancePoint> Points { get; set; } = [];
}

public class PerformancePoint
{
    public DateTime Date { get; set; }
    public decimal Value { get; set; }
    public decimal Return { get; set; }
}

#endregion

#region Data Persistence Models

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

#endregion

#region Legacy Models (for backward compatibility)

public class ChartSeries
{
    public string Name { get; set; } = string.Empty;
    public double[] Data { get; set; } = [];
}

#endregion
