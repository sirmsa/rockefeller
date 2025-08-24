using Rockefeller.Models;

namespace Rockefeller.Services;

public interface IAnalyticsService
{
    // Analytics Data
    Task<AnalyticsData> GetAnalyticsDataAsync();
    
    // Performance Metrics
    Task<PerformanceMetrics> GetPerformanceMetricsAsync(DateTime startDate, DateTime endDate);
    Task<PerformanceMetrics> GetPerformanceMetricsAsync(string symbol, DateTime startDate, DateTime endDate);
    
    // Trade Analytics
    Task<List<Trade>> GetTradesBySymbolAsync(string symbol, DateTime startDate, DateTime endDate);
    Task<List<Trade>> GetTradesByStrategyAsync(string strategy, DateTime startDate, DateTime endDate);
    
    // Portfolio Analytics
    Task<PortfolioAnalytics> GetPortfolioAnalyticsAsync(DateTime startDate, DateTime endDate);
    
    // Risk Analytics
    Task<RiskAnalytics> GetRiskAnalyticsAsync(DateTime startDate, DateTime endDate);
    
    // Correlation Analytics
    Task<CorrelationAnalytics> GetCorrelationAnalyticsAsync(List<string> symbols, DateTime startDate, DateTime endDate);
    
    // AI Performance Analytics
    Task<AIPerformanceMetrics> GetAIPerformanceMetricsAsync(DateTime startDate, DateTime endDate);
    
    // AI Decision Analysis
    Task<List<AIDecisionAnalysis>> GetAIDecisionAnalysisAsync(string symbol, DateTime startDate, DateTime endDate);
    
    // AI Success Rate
    Task<AISuccessRate> GetAISuccessRateAsync(DateTime startDate, DateTime endDate);
}
