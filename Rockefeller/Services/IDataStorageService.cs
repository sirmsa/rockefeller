using Rockefeller.Models;

namespace Rockefeller.Services;

public interface IDataStorageService
{
    // Database Management
    Task<bool> InitializeDatabaseAsync();
    Task<bool> BackupDatabaseAsync(string backupPath);
    
    // Trade Records
    Task<bool> SaveTradeAsync(Trade trade);
    Task<Trade?> GetTradeByIdAsync(string tradeId);
    Task<List<Trade>> GetTradesAsync(DateTime? startDate = null, DateTime? endDate = null);
    Task<List<Trade>> GetTradesBySymbolAsync(string symbol);
    Task<List<Trade>> GetTradesByStrategyAsync(string strategy);
    Task<bool> UpdateTradeAsync(Trade trade);
    Task<bool> DeleteTradeAsync(string tradeId);
    
    // AI Insights
    Task<bool> SaveAIInsightAsync(AIInsight insight);
    Task<List<AIInsight>> GetAIInsightsAsync(string symbol, DateTime? since = null);
    Task<List<AIInsight>> GetAIInsightsByTypeAsync(string type, DateTime? since = null);
    Task<bool> DeleteOldInsightsAsync(DateTime cutoffDate);
    
    // Trading Sessions
    Task<bool> SaveTradingSessionAsync(TradingSession session);
    Task<TradingSession?> GetTradingSessionAsync(DateTime date);
    Task<List<TradingSession>> GetTradingSessionsAsync(DateTime startDate, DateTime endDate);
    Task<bool> UpdateTradingSessionAsync(TradingSession session);
    
    // Portfolio & Positions
    Task<bool> SavePortfolioSnapshotAsync(Portfolio portfolio);
    Task<Portfolio?> GetLatestPortfolioAsync();
    Task<List<Portfolio>> GetPortfolioHistoryAsync(DateTime startDate, DateTime endDate);
    Task<bool> SavePositionAsync(Position position);
    Task<List<Position>> GetPositionsAsync(string? symbol = null);
    
    // Risk Management
    Task<bool> SaveRiskMetricsAsync(RiskMetrics metrics);
    Task<RiskMetrics?> GetLatestRiskMetricsAsync();
    Task<List<RiskMetrics>> GetRiskMetricsHistoryAsync(DateTime startDate, DateTime endDate);
    
    // Audit Logging
    Task<bool> LogAuditEventAsync(string eventType, string description, string? userId = null, Dictionary<string, object>? metadata = null);
    Task<List<AuditLogEntry>> GetAuditLogAsync(DateTime? startDate = null, DateTime? endDate = null, string? eventType = null);
    Task<bool> CleanupOldAuditLogsAsync(DateTime cutoffDate);
    
    // Performance Metrics
    Task<bool> SavePerformanceMetricAsync(string metricName, decimal value, DateTime timestamp, string? symbol = null);
    Task<List<PerformanceMetric>> GetPerformanceMetricsAsync(string metricName, DateTime startDate, DateTime endDate, string? symbol = null);
    Task<decimal> GetLatestPerformanceMetricAsync(string metricName, string? symbol = null);
    
    // Configuration & Settings
    Task<bool> SaveConfigurationAsync(string key, string value);
    Task<string?> GetConfigurationAsync(string key);
    Task<Dictionary<string, string>> GetAllConfigurationAsync();
    Task<bool> DeleteConfigurationAsync(string key);
}

public class AuditLogEntry
{
    public string Id { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}


