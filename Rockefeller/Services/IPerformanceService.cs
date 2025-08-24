using Rockefeller.Models;

namespace Rockefeller.Services;

public interface IPerformanceService
{
    // Trading Performance Metrics
    Task<decimal> CalculateWinRateAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> CalculateProfitFactorAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> CalculateMaxDrawdownAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> CalculateSharpeRatioAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> CalculateSortinoRatioAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> CalculateCalmarRatioAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> CalculateVolatilityAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    
    // ROI Performance
    Task<decimal> CalculateTotalROIAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> CalculateAnnualizedROIAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> CalculateAverageTradeROIAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> CalculateBestMonthROIAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> CalculateWorstMonthROIAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    
    // AI Performance Metrics
    Task<decimal> CalculateSignalAccuracyAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> CalculateInsightRelevanceAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> CalculateDecisionQualityAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> CalculateRiskAssessmentAccuracyAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    
    // Risk Metrics
    Task<decimal> CalculateValueAtRiskAsync(DateTime startDate, DateTime endDate, decimal confidenceLevel, string? symbol = null);
    Task<decimal> CalculateExpectedShortfallAsync(DateTime startDate, DateTime endDate, decimal confidenceLevel, string? symbol = null);
    Task<decimal> CalculateCurrentDrawdownAsync(string? symbol = null);
    Task<decimal> CalculateDailyLossAsync(DateTime date, string? symbol = null);
    
    // Consistency Metrics
    Task<decimal> CalculateDailyPnLConsistencyAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> CalculateMonthlyPnLConsistencyAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> CalculateWinStreakAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> CalculateLossStreakAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    
    // Strategy Performance
    Task<Dictionary<string, StrategyPerformanceMetrics>> GetStrategyPerformanceAsync(DateTime startDate, DateTime endDate);
    Task<StrategyPerformanceMetrics> GetStrategyPerformanceAsync(string strategyName, DateTime startDate, DateTime endDate);
    
    // Performance Reports
    Task<PerformanceReport> GeneratePerformanceReportAsync(DateTime startDate, DateTime endDate, string? symbol = null);
    Task<PerformanceReport> GenerateDailyReportAsync(DateTime date);
    Task<PerformanceReport> GenerateWeeklyReportAsync(DateTime weekStart);
    Task<PerformanceReport> GenerateMonthlyReportAsync(DateTime monthStart);
    
    // Historical Performance
    Task<List<PerformancePoint>> GetPerformanceHistoryAsync(string metricName, DateTime startDate, DateTime endDate, string interval = "1d", string? symbol = null);
    Task<List<PerformancePoint>> GetROIHistoryAsync(DateTime startDate, DateTime endDate, string interval = "1d", string? symbol = null);
    Task<List<PerformancePoint>> GetDrawdownHistoryAsync(DateTime startDate, DateTime endDate, string interval = "1d", string? symbol = null);
    
    // Benchmarking
    Task<decimal> CompareToBenchmarkAsync(string benchmark, DateTime startDate, DateTime endDate, string? symbol = null);
    Task<Dictionary<string, decimal>> GetBenchmarkComparisonAsync(DateTime startDate, DateTime endDate, string? symbol = null);
}

public class StrategyPerformanceMetrics
{
    public string StrategyName { get; set; } = string.Empty;
    public int TotalTrades { get; set; }
    public int WinningTrades { get; set; }
    public int LosingTrades { get; set; }
    public decimal WinRate { get; set; }
    public decimal TotalReturn { get; set; }
    public decimal TotalROI { get; set; }
    public decimal ProfitFactor { get; set; }
    public decimal MaxDrawdown { get; set; }
    public decimal SharpeRatio { get; set; }
    public decimal AverageTradeROI { get; set; }
    public decimal BestTradeROI { get; set; }
    public decimal WorstTradeROI { get; set; }
    public decimal AverageHoldTime { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class PerformanceReport
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Symbol { get; set; }
    
    // Trading Performance
    public decimal TotalReturn { get; set; }
    public decimal TotalROI { get; set; }
    public decimal WinRate { get; set; }
    public decimal ProfitFactor { get; set; }
    public decimal MaxDrawdown { get; set; }
    public decimal SharpeRatio { get; set; }
    public decimal SortinoRatio { get; set; }
    public decimal CalmarRatio { get; set; }
    
    // Risk Metrics
    public decimal Volatility { get; set; }
    public decimal VaR { get; set; }
    public decimal ExpectedShortfall { get; set; }
    public decimal CurrentDrawdown { get; set; }
    
    // Consistency
    public decimal DailyPnLConsistency { get; set; }
    public decimal MonthlyPnLConsistency { get; set; }
    public decimal WinStreak { get; set; }
    public decimal LossStreak { get; set; }
    
    // AI Performance
    public decimal SignalAccuracy { get; set; }
    public decimal InsightRelevance { get; set; }
    public decimal DecisionQuality { get; set; }
    public decimal RiskAssessmentAccuracy { get; set; }
    
    // Summary
    public string PerformanceGrade { get; set; } = string.Empty; // A+, A, B+, B, C+, C, D, F
    public string RiskLevel { get; set; } = string.Empty; // LOW, MEDIUM, HIGH, CRITICAL
    public List<string> Recommendations { get; set; } = [];
    public DateTime GeneratedAt { get; set; }
}
