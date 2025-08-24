using Rockefeller.Models;

namespace Rockefeller.Services;

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
