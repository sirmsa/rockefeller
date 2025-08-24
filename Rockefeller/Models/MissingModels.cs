using System.Collections.Concurrent;

namespace Rockefeller.Models;

#region Missing Enums and Types

public enum SymbolLoadingState
{
    Loading,
    AnalysisComplete,
    AnalysisFailed,
    NoData
}

public enum RiskLevel
{
    Conservative,
    Moderate,
    Aggressive
}

public enum StopTradingOption
{
    Cancel,
    ClosePositions,
    WaitForCompletion
}

public enum SymbolStatus
{
    Inactive, // Symbol is not available for AI trading
    Active, // Symbol is available for AI trading
    Paused, // Symbol is temporarily paused
    Restricted, // Symbol has restrictions (e.g., max positions reached)
    Error // Symbol has errors preventing trading
}

public enum AITradingDecision
{
    NoSignal, // AI sees no trading opportunity
    LongSignal, // AI recommends long position
    ShortSignal, // AI recommends short position
    CloseSignal, // AI recommends closing position
    HoldSignal // AI recommends holding current position
}

#endregion

#region Missing Legacy Models

public class AIInsight
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // NEWS, SOCIAL, TECHNICAL, SENTIMENT
    public string Source { get; set; } = string.Empty; // Twitter, Reddit, News API, etc.
    public string Content { get; set; } = string.Empty;
    public double SentimentScore { get; set; } // -1.0 to 1.0
    public double Confidence { get; set; } // 0.0 to 1.0
    public DateTime Timestamp { get; set; }
    public string Impact { get; set; } = string.Empty; // HIGH, MEDIUM, LOW
    public Dictionary<string, object> Metadata { get; set; } = new();
}

public class TradingSession
{
    public string Id { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal StartingBalance { get; set; }
    public decimal EndingBalance { get; set; }
    public decimal TotalPnL { get; set; }
    public decimal TotalROI { get; set; }
    public int TotalTrades { get; set; }
    public int WinningTrades { get; set; }
    public int LosingTrades { get; set; }
    public double WinRate { get; set; }
    public decimal MaxDrawdown { get; set; }
    public decimal SharpeRatio { get; set; }
    public List<Trade> Trades { get; set; } = [];
    public List<AIInsight> Insights { get; set; } = [];
    public Dictionary<string, object> Metrics { get; set; } = new();
}

public class Portfolio
{
    public string Id { get; set; } = string.Empty;
    public decimal TotalValue { get; set; }
    public decimal AvailableBalance { get; set; }
    public decimal LockedBalance { get; set; }
    public decimal TotalPnL { get; set; }
    public decimal TotalROI { get; set; }
    public decimal DailyChange { get; set; } // 24-hour portfolio change
    public List<Position> Positions { get; set; } = [];
    public List<Asset> Assets { get; set; } = [];
    public DateTime LastUpdated { get; set; }
}

public class Position
{
    public string Symbol { get; set; } = string.Empty;
    public string Side { get; set; } = string.Empty; // LONG, SHORT
    public decimal Size { get; set; }
    public decimal EntryPrice { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal MarkPrice { get; set; }
    public decimal UnrealizedPnL { get; set; }
    public decimal UnrealizedROI { get; set; }
    public decimal LiquidationPrice { get; set; }
    public decimal Margin { get; set; }
    public decimal Leverage { get; set; }
    public DateTime EntryTime { get; set; }
    public string Status { get; set; } = string.Empty; // OPEN, CLOSED, LIQUIDATED
}

public class Asset
{
    public string Symbol { get; set; } = string.Empty;
    public decimal Free { get; set; }
    public decimal Locked { get; set; }
    public decimal Total { get; set; }
    public decimal Value { get; set; }
    public decimal UnrealizedPnL { get; set; }
}

public class TradingStrategy
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // ACTIVE, PAUSED, DISABLED
    public List<string> Symbols { get; set; } = [];
    public Dictionary<string, object> Parameters { get; set; } = new();
    public decimal RiskPerTrade { get; set; }
    public decimal MaxPositionSize { get; set; }
    public bool IsAutomated { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModified { get; set; }
}

public class RiskMetrics
{
    public string Id { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal DailyLossLimit { get; set; }
    public decimal CurrentDailyLoss { get; set; }
    public decimal MaxDrawdown { get; set; }
    public decimal SharpeRatio { get; set; }
    public decimal SortinoRatio { get; set; }
    public decimal CalmarRatio { get; set; }
    public decimal Volatility { get; set; }
    public decimal VaR { get; set; } // Value at Risk
    public decimal ExpectedShortfall { get; set; }
    public bool CircuitBreakerTriggered { get; set; }
    public string RiskLevel { get; set; } = string.Empty; // LOW, MEDIUM, HIGH, CRITICAL
}

public class SymbolAnalysisCache
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime AnalysisTime { get; set; }
    public string MarketTrend { get; set; } = string.Empty;
    public int AIConfidence { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal PriceChange24h { get; set; }

    // Enhanced analysis data
    public AITradingDecision TradingSignal { get; set; } = AITradingDecision.NoSignal;
    public decimal SignalStrength { get; set; } = 0.0m;
    public string SignalReason { get; set; } = string.Empty;
    public decimal Volatility { get; set; } = 0.0m;
    public decimal Volume { get; set; } = 0.0m;
    public decimal RSI { get; set; } = 0.0m;
    public decimal MACD { get; set; } = 0.0m;
    public bool TrendConfirmed { get; set; } = false;
    public bool VolumeConfirmed { get; set; } = false;
}

public class MarketSentimentCache
{
    public string Symbol { get; set; } = string.Empty;
    public string MarketMood { get; set; } = string.Empty;
    public DateTime AnalysisTime { get; set; }

    // Enhanced sentiment data
    public decimal FearGreedIndex { get; set; } = 0.0m;
    public decimal SocialSentiment { get; set; } = 0.0m;
    public decimal NewsSentiment { get; set; } = 0.0m;
    public string MarketPhase { get; set; } = string.Empty; // Accumulation, Distribution, etc.
}

public class SymbolManagementSummary
{
    public string ProfileName { get; set; } = string.Empty;
    public int TotalSymbols { get; set; } = 0;
    public int ActiveSymbols { get; set; } = 0;
    public int PausedSymbols { get; set; } = 0;
    public int RestrictedSymbols { get; set; } = 0;
    public int ErrorSymbols { get; set; } = 0;
    public decimal TotalPortfolioValue { get; set; } = 0.0m;
    public decimal DailyPnL { get; set; } = 0.0m;
    public int TotalPositions { get; set; } = 0;
    public int WinningPositions { get; set; } = 0;
    public int LosingPositions { get; set; } = 0;
    public decimal WinRate { get; set; } = 0.0m;
    public string NextRecommendedAction { get; set; } = "NO_SIGNAL";
    public string NextRecommendedSymbol { get; set; } = string.Empty;
    public int NextRecommendedConfidence { get; set; } = 0;
}

#endregion

#region Additional Models for Services

public class PerformanceMetric
{
    public string Name { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string Unit { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    
    // Additional properties for UI compatibility
    public string Id { get; set; } = string.Empty;
    public string MetricName { get; set; } = string.Empty;
    public string? Symbol { get; set; }
}

public class PortfolioAnalytics
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<PortfolioPoint> Points { get; set; } = [];
    public decimal TotalReturn { get; set; }
    public decimal MaxDrawdown { get; set; }
    public decimal SharpeRatio { get; set; }
    public decimal Volatility { get; set; }
}

public class PortfolioPoint
{
    public DateTime Date { get; set; }
    public decimal Value { get; set; }
    public decimal Return { get; set; }
    public decimal Drawdown { get; set; }
}

public class RiskAnalytics
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<RiskPoint> Points { get; set; } = [];
    public decimal AverageRisk { get; set; }
    public decimal MaxRisk { get; set; }
    public decimal RiskVolatility { get; set; }
}

public class RiskPoint
{
    public DateTime Date { get; set; }
    public decimal RiskScore { get; set; }
    public decimal PositionRisk { get; set; }
    public decimal MarketRisk { get; set; }
}

public class CorrelationAnalytics
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public Dictionary<string, Dictionary<string, decimal>> CorrelationMatrix { get; set; } = new();
    public List<string> Symbols { get; set; } = [];
}

public class AIPerformanceMetrics
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<AIPerformancePoint> Points { get; set; } = [];
    public decimal SuccessRate { get; set; }
    public decimal AverageConfidence { get; set; }
    public decimal ProfitFactor { get; set; }
}

public class AIPerformancePoint
{
    public DateTime Date { get; set; }
    public decimal SuccessRate { get; set; }
    public decimal AverageConfidence { get; set; }
    public decimal ProfitFactor { get; set; }
    public int TotalSignals { get; set; }
}

public class AIDecisionAnalysis
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<AIAnalysisRecord> Decisions { get; set; } = [];
    public decimal SuccessRate { get; set; }
    public decimal AverageConfidence { get; set; }
    public decimal AverageReturn { get; set; }
}

#endregion

#region Market Data Service Models

public class MarketStatistics
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public decimal TotalVolume { get; set; }
    public int TotalTrades { get; set; }
    public decimal AverageTradeSize { get; set; }
    public decimal PriceChange { get; set; }
    public decimal PriceChangePercent { get; set; }
}

public class VolatilityMetrics
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public decimal HistoricalVolatility { get; set; }
    public decimal HighLowVolatility { get; set; }
    public decimal AverageTrueRange { get; set; }
    public decimal VolatilityIndex { get; set; }
}

public class CorrelationMatrix
{
    public List<string> Symbols { get; set; } = [];
    public DateTime Timestamp { get; set; }
    public Dictionary<string, Dictionary<string, decimal>> Matrix { get; set; } = new();
}

public class MarketDataUpdate
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public MarketData MarketData { get; set; } = new();
}

public class PriceUpdate
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public decimal Price { get; set; }
    public decimal Change { get; set; }
    public decimal ChangePercent { get; set; }
}

public class VolumeUpdate
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public decimal Volume { get; set; }
    public decimal VolumeChange { get; set; }
}

#endregion

#region Additional Market Data Models

public class MarketDepth
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public List<DepthLevel> Bids { get; set; } = [];
    public List<DepthLevel> Asks { get; set; } = [];
    public decimal TotalBidVolume { get; set; }
    public decimal TotalAskVolume { get; set; }
}

public class DepthLevel
{
    public decimal Price { get; set; }
    public decimal Quantity { get; set; }
    public decimal CumulativeVolume { get; set; }
}

public class VolumeAnalysis
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public decimal Volume24h { get; set; }
    public decimal VolumeChange24h { get; set; }
    public decimal AverageVolume { get; set; }
    public decimal VolumeRatio { get; set; }
}

public class LiquidityAnalysis
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public decimal BidLiquidity { get; set; }
    public decimal AskLiquidity { get; set; }
    public decimal Spread { get; set; }
    public decimal LiquidityScore { get; set; }
}

#endregion

#region Analytics Service Models

public class PerformanceMetrics
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<PerformanceMetric> Metrics { get; set; } = [];
    public decimal TotalReturn { get; set; }
    public decimal SharpeRatio { get; set; }
    public decimal MaxDrawdown { get; set; }
    public decimal Volatility { get; set; }
}

public class AISuccessRate
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal SuccessRate { get; set; }
    public int TotalDecisions { get; set; }
    public int SuccessfulDecisions { get; set; }
    public int FailedDecisions { get; set; }
    public decimal AverageConfidence { get; set; }
    public decimal ProfitFactor { get; set; }
}

#endregion

#region Mock Observable Implementation

public class MockObservable<T> : IObservable<T>
{
    public IDisposable Subscribe(IObserver<T> observer)
    {
        // Mock implementation - does nothing
        return new MockDisposable();
    }
}

public class MockDisposable : IDisposable
{
    public void Dispose()
    {
        // Mock implementation - does nothing
    }
}

#endregion
