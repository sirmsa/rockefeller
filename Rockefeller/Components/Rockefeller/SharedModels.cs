namespace Rockefeller.Components.Rockefeller
{
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

public class TradingProfile
{
    public string Name { get; set; } = string.Empty;
    public RiskLevel RiskLevel { get; set; } = RiskLevel.Moderate;
    public decimal InitialPortfolioValue { get; set; } = 10000.0m;
    public int MaxTotalPositions { get; set; } = 5;
    public int MinAIConfidence { get; set; } = 70;
    public bool EnableAutoTrading { get; set; } = false;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public bool IsActive { get; set; } = false;
    public Dictionary<string, SymbolSettings> SymbolSettings { get; set; } = new();
}

public class SymbolSettings
{
    public string Symbol { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public decimal PositionSize { get; set; } = 5.0m;
    public decimal StopLoss { get; set; } = 2.0m;
    public decimal TakeProfit { get; set; } = 6.0m;
    public int MaxPositions { get; set; } = 3;
    public decimal MaxTradeAmount { get; set; } = 0.0m;
    public decimal MaxTradePercentage { get; set; } = 0.0m;
    public decimal CustomStopLoss { get; set; } = 0.0m;
    public decimal CustomTakeProfit { get; set; } = 0.0m;
    public int MaxPositionsOverride { get; set; } = 0;
}

public class SymbolAnalysisCache
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime AnalysisTime { get; set; }
    public string MarketTrend { get; set; } = string.Empty;
    public int AIConfidence { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal PriceChange24h { get; set; }
}

public class MarketSentimentCache
{
    public string Symbol { get; set; } = string.Empty;
    public string MarketMood { get; set; } = string.Empty;
    public DateTime AnalysisTime { get; set; }
}

public class Position
{
    public string Symbol { get; set; } = string.Empty;
    public string Side { get; set; } = string.Empty;
    public decimal Size { get; set; }
    public decimal UnrealizedROI { get; set; }
}
}
