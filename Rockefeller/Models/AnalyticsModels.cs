namespace Rockefeller.Models;

public class AnalyticsData
{
    public decimal TotalReturn { get; set; }
    public decimal WinRate { get; set; }
    public int TotalTrades { get; set; }
    public string AverageHoldTime { get; set; } = string.Empty;
    public decimal SharpeRatio { get; set; }
    public decimal MaxDrawdown { get; set; }
    public decimal Volatility { get; set; }
    public List<Trade> RecentTrades { get; set; } = new();
    public List<StrategyPerformance> StrategyPerformance { get; set; } = new();
    public PerformanceHistory PerformanceHistory { get; set; } = new();
}

public class Trade
{
    public string Id { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // BUY, SELL
    public string Side { get; set; } = string.Empty; // LONG, SHORT
    public decimal Size { get; set; }
    public decimal EntryPrice { get; set; }
    public decimal? ExitPrice { get; set; }
    public decimal PnL { get; set; }
    public decimal ROI { get; set; }
    public DateTime EntryTime { get; set; }
    public DateTime? ExitTime { get; set; }
    public string Status { get; set; } = string.Empty; // OPEN, CLOSED, CANCELLED
    public List<AIInsight> AIInsights { get; set; } = new();
    public string Strategy { get; set; } = string.Empty;
    public decimal StopLoss { get; set; }
    public decimal TakeProfit { get; set; }
    public decimal Commission { get; set; }
    public string OrderId { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty; // For backward compatibility
}

public class StrategyPerformance
{
    public string Name { get; set; } = string.Empty;
    public decimal Return { get; set; }
    public int TradeCount { get; set; }
}

public class PerformanceHistory
{
    public List<PerformancePoint> Points { get; set; } = new();
}

public class PerformancePoint
{
    public DateTime Date { get; set; }
    public decimal Value { get; set; }
}

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
    public List<Trade> Trades { get; set; } = new();
    public List<AIInsight> Insights { get; set; } = new();
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
    public List<Position> Positions { get; set; } = new();
    public List<Asset> Assets { get; set; } = new();
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
    public List<string> Symbols { get; set; } = new();
    public Dictionary<string, object> Parameters { get; set; } = new();
    public decimal RiskPerTrade { get; set; }
    public decimal MaxPositionSize { get; set; }
    public bool IsAutomated { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModified { get; set; }
}

public class MarketData
{
    public string Symbol { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal Volume24h { get; set; }
    public decimal Change24h { get; set; }
    public decimal ChangePercent24h { get; set; }
    public decimal High24h { get; set; }
    public decimal Low24h { get; set; }
    public DateTime Timestamp { get; set; }
    public Dictionary<string, object> TechnicalIndicators { get; set; } = new();
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
