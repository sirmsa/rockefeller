using Rockefeller.Models;

namespace Rockefeller.Services;

public interface IRockefellerAIService
{
    // Core AI Analysis
    Task<AIStrategyAnalysis> AnalyzeStrategyOnTheFlyAsync(string symbol, string strategyType, Dictionary<string, object> parameters);
    Task<AIStrategyAnalysis> AnalyzeCurrentMarketConditionsAsync(string symbol);
    Task<AIStrategyAnalysis> GenerateOptimalStrategyAsync(string symbol, decimal riskTolerance, decimal investmentAmount);
    
    // Technical Analysis Tools
    Task<TechnicalAnalysisResult> PerformTechnicalAnalysisAsync(string symbol, List<string> indicators);
    Task<Dictionary<string, object>> GetRSIAnalysisAsync(string symbol, int period = 14);
    Task<Dictionary<string, object>> GetMACDAnalysisAsync(string symbol);
    Task<Dictionary<string, object>> GetBollingerBandsAnalysisAsync(string symbol, int period = 20);
    Task<Dictionary<string, object>> GetMovingAveragesAnalysisAsync(string symbol, List<int> periods);
    Task<Dictionary<string, object>> GetVolumeAnalysisAsync(string symbol, int period = 20);
    Task<Dictionary<string, object>> GetSupportResistanceAnalysisAsync(string symbol);
    Task<Dictionary<string, object>> GetTrendAnalysisAsync(string symbol, int period = 50);
    
    // Pattern Recognition
    Task<List<ChartPattern>> IdentifyChartPatternsAsync(string symbol);
    Task<Dictionary<string, double>> GetPatternConfidenceAsync(string symbol);
    Task<List<string>> GetCandlestickPatternsAsync(string symbol);
    
    // Market Sentiment Analysis
    Task<MarketSentimentAnalysis> AnalyzeMarketSentimentAsync(string symbol);
    Task<Dictionary<string, double>> GetSentimentBySourceAsync(string symbol);
    Task<double> GetOverallSentimentScoreAsync(string symbol);
    
    // AI Signal Generation
    Task<List<AITradingSignal>> GenerateTradingSignalsAsync(string symbol, string timeframe = "1h");
    Task<AITradingSignal?> GetOptimalEntrySignalAsync(string symbol, string strategy);
    Task<AITradingSignal?> GetOptimalExitSignalAsync(string symbol, string strategy);
    Task<double> GetSignalConfidenceAsync(string symbol, string signalType);
    
    // Strategy Optimization
    Task<StrategyOptimizationResult> OptimizeStrategyParametersAsync(string strategyName, string symbol, DateTime startDate, DateTime endDate);
    Task<Dictionary<string, object>> GetOptimalParametersAsync(string strategyName, string symbol);
    Task<bool> ValidateStrategyParametersAsync(string strategyName, Dictionary<string, object> parameters);
    
    // Risk Assessment
    Task<RiskAssessment> AssessTradeRiskAsync(string symbol, string strategy, decimal positionSize);
    Task<decimal> CalculatePositionRiskAsync(string symbol, decimal size, decimal price);
    Task<RiskAssessment> AssessPortfolioRiskAsync(List<Position> positions);
    
    // Performance Prediction
    Task<PerformancePrediction> PredictStrategyPerformanceAsync(string strategyName, string symbol, int daysAhead);
    Task<decimal> PredictPriceMovementAsync(string symbol, int hoursAhead);
    Task<Dictionary<string, double>> GetPredictionConfidenceAsync(string symbol, string metric);
    
    // Market Regime Detection
    Task<MarketRegime> DetectMarketRegimeAsync(string symbol);
    Task<bool> IsTrendingMarketAsync(string symbol);
    Task<bool> IsRangingMarketAsync(string symbol);
    Task<bool> IsVolatileMarketAsync(string symbol);
    
    // Strategy Recommendations
    Task<List<StrategyRecommendation>> GetStrategyRecommendationsAsync(string symbol, string marketCondition);
    Task<StrategyRecommendation> GetBestStrategyForConditionsAsync(string symbol, MarketConditions conditions);
    Task<bool> ShouldPauseStrategyAsync(string strategyName, string symbol);
    
    // Real-time Analysis
    Task<RealTimeAnalysis> GetRealTimeAnalysisAsync(string symbol);
    Task<bool> UpdateAnalysisInRealTimeAsync(string symbol);
    Task<List<string>> GetActiveAnalysisSymbolsAsync();
}

public class AIStrategyAnalysis
{
    public string Symbol { get; set; } = string.Empty;
    public string StrategyType { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty; // BUY, SELL, HOLD, WAIT
    public double Confidence { get; set; } // 0.0 to 1.0
    public string Reasoning { get; set; } = string.Empty;
    public Dictionary<string, object> TechnicalIndicators { get; set; } = new();
    public MarketSentimentAnalysis Sentiment { get; set; } = new();
    public List<AITradingSignal> Signals { get; set; } = new();
    public RiskAssessment Risk { get; set; } = new();
    public PerformancePrediction Prediction { get; set; } = new();
    public MarketRegime MarketRegime { get; set; } = new();
    public DateTime AnalysisTime { get; set; }
    public TimeSpan AnalysisDuration { get; set; }
}

public class TechnicalAnalysisResult
{
    public string Symbol { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public Dictionary<string, object> Indicators { get; set; } = new();
    public List<ChartPattern> Patterns { get; set; } = new();
    public string OverallTrend { get; set; } = string.Empty; // BULLISH, BEARISH, NEUTRAL
    public double TrendStrength { get; set; } // 0.0 to 1.0
    public List<string> KeyLevels { get; set; } = new();
    public Dictionary<string, double> SignalStrength { get; set; } = new();
}

public class ChartPattern
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // BULLISH, BEARISH, NEUTRAL
    public double Confidence { get; set; } // 0.0 to 1.0
    public string Description { get; set; } = string.Empty;
    public DateTime DetectedAt { get; set; }
    public Dictionary<string, object> Parameters { get; set; } = new();
}

public class MarketSentimentAnalysis
{
    public string Symbol { get; set; } = string.Empty;
    public double OverallScore { get; set; } // -1.0 to 1.0
    public string Sentiment { get; set; } = string.Empty; // BULLISH, BEARISH, NEUTRAL
    public Dictionary<string, double> SourceScores { get; set; } = new();
    public List<string> KeyFactors { get; set; } = new();
    public DateTime LastUpdated { get; set; }
}

public class AITradingSignal
{
    public string Id { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // BUY, SELL, HOLD
    public string SignalType { get; set; } = string.Empty; // ENTRY, EXIT, MODIFY
    public double Confidence { get; set; } // 0.0 to 1.0
    public string Reasoning { get; set; } = string.Empty;
    public decimal TargetPrice { get; set; }
    public decimal StopLoss { get; set; }
    public decimal TakeProfit { get; set; }
    public string Timeframe { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public List<string> SupportingFactors { get; set; } = new();
}

public class StrategyOptimizationResult
{
    public string StrategyName { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public Dictionary<string, object> OptimalParameters { get; set; } = new();
    public decimal ExpectedReturn { get; set; }
    public decimal ExpectedRisk { get; set; }
    public double SharpeRatio { get; set; }
    public double OptimizationConfidence { get; set; }
    public List<Dictionary<string, object>> ParameterHistory { get; set; } = new();
    public DateTime OptimizedAt { get; set; }
}

public class RiskAssessment
{
    public string Symbol { get; set; } = string.Empty;
    public decimal OverallRisk { get; set; } // 0.0 to 1.0
    public string RiskLevel { get; set; } = string.Empty; // LOW, MEDIUM, HIGH, CRITICAL
    public decimal PositionRisk { get; set; }
    public decimal MarketRisk { get; set; }
    public decimal LiquidityRisk { get; set; }
    public decimal VolatilityRisk { get; set; }
    public List<string> RiskFactors { get; set; } = new();
    public List<string> RiskMitigation { get; set; } = new();
    public DateTime AssessedAt { get; set; }
}

public class PerformancePrediction
{
    public string Symbol { get; set; } = string.Empty;
    public string Metric { get; set; } = string.Empty;
    public decimal PredictedValue { get; set; }
    public decimal Confidence { get; set; } // 0.0 to 1.0
    public decimal LowerBound { get; set; }
    public decimal UpperBound { get; set; }
    public string Timeframe { get; set; } = string.Empty;
    public DateTime PredictedFor { get; set; }
    public DateTime PredictedAt { get; set; }
}

public class MarketRegime
{
    public string Symbol { get; set; } = string.Empty;
    public string RegimeType { get; set; } = string.Empty; // TRENDING, RANGING, VOLATILE, STABLE
    public string TrendDirection { get; set; } = string.Empty; // UP, DOWN, SIDEWAYS
    public double RegimeStrength { get; set; } // 0.0 to 1.0
    public double Volatility { get; set; }
    public List<string> Characteristics { get; set; } = new();
    public DateTime DetectedAt { get; set; }
    public TimeSpan ExpectedDuration { get; set; }
}

public class StrategyRecommendation
{
    public string StrategyName { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty; // USE, AVOID, MODIFY
    public double Suitability { get; set; } // 0.0 to 1.0
    public string Reasoning { get; set; } = string.Empty;
    public Dictionary<string, object> SuggestedParameters { get; set; } = new();
    public List<string> Advantages { get; set; } = new();
    public List<string> Disadvantages { get; set; } = new();
    public DateTime RecommendedAt { get; set; }
}

public class MarketConditions
{
    public string Trend { get; set; } = string.Empty; // BULLISH, BEARISH, NEUTRAL
    public string Volatility { get; set; } = string.Empty; // LOW, MEDIUM, HIGH
    public string Liquidity { get; set; } = string.Empty; // LOW, MEDIUM, HIGH
    public string MarketRegime { get; set; } = string.Empty; // TRENDING, RANGING, VOLATILE
    public double Sentiment { get; set; } // -1.0 to 1.0
    public DateTime AssessedAt { get; set; }
}

public class RealTimeAnalysis
{
    public string Symbol { get; set; } = string.Empty;
    public AIStrategyAnalysis CurrentAnalysis { get; set; } = new();
    public List<AITradingSignal> ActiveSignals { get; set; } = new();
    public MarketConditions CurrentConditions { get; set; } = new();
    public RiskAssessment CurrentRisk { get; set; } = new();
    public DateTime LastUpdate { get; set; }
    public TimeSpan UpdateFrequency { get; set; }
    public bool IsActive { get; set; }
}
