namespace Rockefeller.Components.Pages.Rockfeller
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

    public class RiskProfileConfig
    {
        public decimal PositionSize { get; set; }
        public decimal StopLoss { get; set; }
        public decimal TakeProfit { get; set; }
        public int MaxPositions { get; set; }
        public decimal MinAIConfidence { get; set; }
        public decimal VolatilityThreshold { get; set; }
        public int MaxTotalPositions { get; set; }
        public bool EnableAutoTrading { get; set; }
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

        // New properties for AI-driven trading
        public bool AllowAISymbolSelection { get; set; } = true;
        public int MaxConcurrentSymbols { get; set; } = 3;
        public decimal MaxDailyLoss { get; set; } = 5.0m; // Percentage
        public decimal MaxDailyGain { get; set; } = 15.0m; // Percentage
        public TimeSpan TradingStartTime { get; set; } = TimeSpan.FromHours(9); // 9 AM
        public TimeSpan TradingEndTime { get; set; } = TimeSpan.FromHours(17); // 5 PM
        public bool EnableWeekendTrading { get; set; } = false;
    }

    public class SymbolSettings
    {
        public string Symbol { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public SymbolStatus Status { get; set; } = SymbolStatus.Inactive;
        public decimal PositionSize { get; set; } = 5.0m;
        public decimal StopLoss { get; set; } = 2.0m;
        public decimal TakeProfit { get; set; } = 6.0m;
        public int MaxPositions { get; set; } = 3;
        public decimal MaxTradeAmount { get; set; } = 0.0m;
        public decimal MaxTradePercentage { get; set; } = 0.0m;
        public decimal CustomStopLoss { get; set; } = 0.0m;
        public decimal CustomTakeProfit { get; set; } = 0.0m;
        public int MaxPositionsOverride { get; set; } = 0;

        // New properties for AI-driven trading
        public decimal MinAIConfidence { get; set; } = 70.0m;
        public decimal MaxDailyLoss { get; set; } = 3.0m; // Percentage
        public decimal MaxDailyGain { get; set; } = 10.0m; // Percentage
        public bool AllowLongPositions { get; set; } = true;
        public bool AllowShortPositions { get; set; } = true;
        public TimeSpan MinHoldTime { get; set; } = TimeSpan.FromMinutes(30);
        public TimeSpan MaxHoldTime { get; set; } = TimeSpan.FromHours(24);
        public decimal VolatilityThreshold { get; set; } = 5.0m; // Percentage
        public bool RequireTrendConfirmation { get; set; } = true;
        public bool RequireVolumeConfirmation { get; set; } = true;

        // AI Analysis Results
        public AITradingDecision LastAIDecision { get; set; } = AITradingDecision.NoSignal;
        public int AIConfidence { get; set; } = 0;
        public DateTime LastAnalysisTime { get; set; } = DateTime.MinValue;
        public string LastAnalysisReason { get; set; } = string.Empty;
        public decimal LastSignalStrength { get; set; } = 0.0m;
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

    public class RockefellerPosition
    {
        public string Symbol { get; set; } = string.Empty;
        public string Side { get; set; } = string.Empty;
        public decimal Size { get; set; }
        public decimal UnrealizedROI { get; set; }

        // Enhanced position data
        public DateTime OpenTime { get; set; } = DateTime.Now;
        public decimal OpenPrice { get; set; } = 0.0m;
        public decimal CurrentPrice { get; set; } = 0.0m;
        public decimal StopLoss { get; set; } = 0.0m;
        public decimal TakeProfit { get; set; } = 0.0m;
        public string OpenedBy { get; set; } = "AI"; // "AI" or "Manual"
        public int AIConfidence { get; set; } = 0;
        public string AISignalReason { get; set; } = string.Empty;
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
        public AITradingDecision NextRecommendedAction { get; set; } = AITradingDecision.NoSignal;
        public string NextRecommendedSymbol { get; set; } = string.Empty;
        public int NextRecommendedConfidence { get; set; } = 0;
    }
}