using Rockefeller.Models;

namespace Rockefeller.Services;

public interface IAIService
{
    // News Sentiment Analysis
    Task<List<AIInsight>> AnalyzeNewsSentimentAsync(string symbol, DateTime? since = null);
    Task<double> GetNewsSentimentScoreAsync(string symbol);
    
    // Social Media Analysis
    Task<List<AIInsight>> AnalyzeSocialMediaAsync(string symbol, string platform, DateTime? since = null);
    Task<double> GetSocialMediaSentimentAsync(string symbol, string platform);
    Task<List<string>> GetTrendingTopicsAsync(string platform);
    
    // Technical Analysis
    Task<Dictionary<string, object>> GetTechnicalIndicatorsAsync(string symbol);
    Task<double> GetTechnicalScoreAsync(string symbol);
    Task<List<string>> GetTechnicalSignalsAsync(string symbol);
    
    // Market Sentiment
    Task<double> GetMarketSentimentAsync(string symbol);
    Task<Dictionary<string, double>> GetMarketSentimentBySourceAsync(string symbol);
    
    // AI Signal Generation
    Task<List<AIInsight>> GenerateTradingSignalsAsync(string symbol);
    Task<double> GetSignalConfidenceAsync(string symbol, string signalType);
    Task<string> GetSignalReasoningAsync(string symbol, string signalType);
    
    // AI Model Management
    Task<bool> UpdateAIModelAsync(string modelType);
    Task<Dictionary<string, object>> GetAIModelMetricsAsync();
    Task<bool> RetrainModelAsync(string modelType);
    
    // Historical Analysis
    Task<List<AIInsight>> GetHistoricalInsightsAsync(string symbol, DateTime startDate, DateTime endDate);
    Task<double> GetInsightAccuracyAsync(string symbol, DateTime startDate, DateTime endDate);
}
