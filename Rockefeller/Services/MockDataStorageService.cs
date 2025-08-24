using Rockefeller.Models;

namespace Rockefeller.Services;

public class MockDataStorageService : IDataStorageService
{
    private readonly Dictionary<string, string> _configurations = new();
    private readonly List<Trade> _trades = new();
    private readonly List<AIInsight> _insights = new();
    private readonly List<TradingSession> _sessions = new();
    private readonly List<Portfolio> _portfolios = new();
    private readonly List<Position> _positions = new();
    private readonly List<RiskMetrics> _riskMetrics = new();
    private readonly List<AuditLogEntry> _auditLogs = new();
    private readonly List<PerformanceMetric> _performanceMetrics = new();

    public Task<bool> InitializeDatabaseAsync()
    {
        return Task.FromResult(true);
    }

    public Task<bool> BackupDatabaseAsync(string backupPath)
    {
        return Task.FromResult(true);
    }

    public Task<bool> SaveTradeAsync(Trade trade)
    {
        if (string.IsNullOrEmpty(trade.Id))
            trade.Id = Guid.NewGuid().ToString();
        _trades.Add(trade);
        return Task.FromResult(true);
    }

    public Task<Trade?> GetTradeByIdAsync(string tradeId)
    {
        var trade = _trades.FirstOrDefault(t => t.Id == tradeId);
        return Task.FromResult(trade);
    }

    public Task<List<Trade>> GetTradesAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var trades = _trades.AsEnumerable();
        if (startDate.HasValue)
            trades = trades.Where(t => t.EntryTime >= startDate.Value);
        if (endDate.HasValue)
            trades = trades.Where(t => t.EntryTime <= endDate.Value);
        return Task.FromResult(trades.ToList());
    }

    public Task<List<Trade>> GetTradesBySymbolAsync(string symbol)
    {
        var trades = _trades.Where(t => t.Symbol == symbol).ToList();
        return Task.FromResult(trades);
    }

    public Task<List<Trade>> GetTradesByStrategyAsync(string strategy)
    {
        var trades = _trades.Where(t => t.Strategy == strategy).ToList();
        return Task.FromResult(trades);
    }

    public Task<bool> UpdateTradeAsync(Trade trade)
    {
        var existingTrade = _trades.FirstOrDefault(t => t.Id == trade.Id);
        if (existingTrade != null)
        {
            var index = _trades.IndexOf(existingTrade);
            _trades[index] = trade;
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    public Task<bool> DeleteTradeAsync(string tradeId)
    {
        var trade = _trades.FirstOrDefault(t => t.Id == tradeId);
        if (trade != null)
        {
            _trades.Remove(trade);
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    public Task<bool> SaveAIInsightAsync(AIInsight insight)
    {
        if (string.IsNullOrEmpty(insight.Id))
            insight.Id = Guid.NewGuid().ToString();
        _insights.Add(insight);
        return Task.FromResult(true);
    }

    public Task<List<AIInsight>> GetAIInsightsAsync(string symbol, DateTime? since = null)
    {
        var insights = _insights.Where(i => i.Source == symbol).AsEnumerable();
        if (since.HasValue)
            insights = insights.Where(i => i.Timestamp >= since.Value);
        return Task.FromResult(insights.ToList());
    }

    public Task<List<AIInsight>> GetAIInsightsByTypeAsync(string type, DateTime? since = null)
    {
        var insights = _insights.Where(i => i.Type == type).AsEnumerable();
        if (since.HasValue)
            insights = insights.Where(i => i.Timestamp >= since.Value);
        return Task.FromResult(insights.ToList());
    }

    public Task<bool> DeleteOldInsightsAsync(DateTime cutoffDate)
    {
        var oldInsights = _insights.Where(i => i.Timestamp < cutoffDate).ToList();
        foreach (var insight in oldInsights)
        {
            _insights.Remove(insight);
        }
        return Task.FromResult(true);
    }

    public Task<bool> SaveTradingSessionAsync(TradingSession session)
    {
        if (string.IsNullOrEmpty(session.Id))
            session.Id = Guid.NewGuid().ToString();
        _sessions.Add(session);
        return Task.FromResult(true);
    }

    public Task<TradingSession?> GetTradingSessionAsync(DateTime date)
    {
        var session = _sessions.FirstOrDefault(s => s.Date.Date == date.Date);
        return Task.FromResult(session);
    }

    public Task<List<TradingSession>> GetTradingSessionsAsync(DateTime startDate, DateTime endDate)
    {
        var sessions = _sessions.Where(s => s.Date >= startDate && s.Date <= endDate).ToList();
        return Task.FromResult(sessions);
    }

    public Task<bool> UpdateTradingSessionAsync(TradingSession session)
    {
        var existingSession = _sessions.FirstOrDefault(s => s.Id == session.Id);
        if (existingSession != null)
        {
            var index = _sessions.IndexOf(existingSession);
            _sessions[index] = session;
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    public Task<bool> SavePortfolioSnapshotAsync(Portfolio portfolio)
    {
        if (string.IsNullOrEmpty(portfolio.Id))
            portfolio.Id = Guid.NewGuid().ToString();
        _portfolios.Add(portfolio);
        return Task.FromResult(true);
    }

    public Task<Portfolio?> GetLatestPortfolioAsync()
    {
        var portfolio = _portfolios.OrderByDescending(p => p.LastUpdated).FirstOrDefault();
        return Task.FromResult(portfolio);
    }

    public Task<List<Portfolio>> GetPortfolioHistoryAsync(DateTime startDate, DateTime endDate)
    {
        var portfolios = _portfolios.Where(p => p.LastUpdated >= startDate && p.LastUpdated <= endDate).ToList();
        return Task.FromResult(portfolios);
    }

    public Task<bool> SavePositionAsync(Position position)
    {
        var existingPosition = _positions.FirstOrDefault(p => p.Symbol == position.Symbol && p.Side == position.Side);
        if (existingPosition != null)
        {
            var index = _positions.IndexOf(existingPosition);
            _positions[index] = position;
        }
        else
        {
            _positions.Add(position);
        }
        return Task.FromResult(true);
    }

    public Task<List<Position>> GetPositionsAsync(string? symbol = null)
    {
        var positions = symbol != null ? _positions.Where(p => p.Symbol == symbol).ToList() : _positions.ToList();
        return Task.FromResult(positions);
    }

    public Task<bool> SaveRiskMetricsAsync(RiskMetrics metrics)
    {
        if (string.IsNullOrEmpty(metrics.Id))
            metrics.Id = Guid.NewGuid().ToString();
        _riskMetrics.Add(metrics);
        return Task.FromResult(true);
    }

    public Task<RiskMetrics?> GetLatestRiskMetricsAsync()
    {
        var metrics = _riskMetrics.OrderByDescending(m => m.Date).FirstOrDefault();
        return Task.FromResult(metrics);
    }

    public Task<List<RiskMetrics>> GetRiskMetricsHistoryAsync(DateTime startDate, DateTime endDate)
    {
        var metrics = _riskMetrics.Where(m => m.Date >= startDate && m.Date <= endDate).ToList();
        return Task.FromResult(metrics);
    }

    public Task<bool> LogAuditEventAsync(string eventType, string description, string? userId = null, Dictionary<string, object>? metadata = null)
    {
        var entry = new AuditLogEntry
        {
            Id = Guid.NewGuid().ToString(),
            Timestamp = DateTime.Now,
            EventType = eventType,
            Description = description,
            UserId = userId,
            Metadata = metadata ?? new Dictionary<string, object>()
        };
        _auditLogs.Add(entry);
        return Task.FromResult(true);
    }

    public Task<List<AuditLogEntry>> GetAuditLogAsync(DateTime? startDate = null, DateTime? endDate = null, string? eventType = null)
    {
        var logs = _auditLogs.AsEnumerable();
        if (startDate.HasValue)
            logs = logs.Where(l => l.Timestamp >= startDate.Value);
        if (endDate.HasValue)
            logs = logs.Where(l => l.Timestamp <= endDate.Value);
        if (!string.IsNullOrEmpty(eventType))
            logs = logs.Where(l => l.EventType == eventType);
        return Task.FromResult(logs.ToList());
    }

    public Task<bool> CleanupOldAuditLogsAsync(DateTime cutoffDate)
    {
        var oldLogs = _auditLogs.Where(l => l.Timestamp < cutoffDate).ToList();
        foreach (var log in oldLogs)
        {
            _auditLogs.Remove(log);
        }
        return Task.FromResult(true);
    }

    public Task<bool> SavePerformanceMetricAsync(string metricName, decimal value, DateTime timestamp, string? symbol = null)
    {
        var metric = new PerformanceMetric
        {
            Id = Guid.NewGuid().ToString(),
            MetricName = metricName,
            Value = value,
            Timestamp = timestamp,
            Symbol = symbol
        };
        _performanceMetrics.Add(metric);
        return Task.FromResult(true);
    }

    public Task<List<PerformanceMetric>> GetPerformanceMetricsAsync(string metricName, DateTime startDate, DateTime endDate, string? symbol = null)
    {
        var metrics = _performanceMetrics.Where(m => 
            m.MetricName == metricName && 
            m.Timestamp >= startDate && 
            m.Timestamp <= endDate &&
            (symbol == null || m.Symbol == symbol)).ToList();
        return Task.FromResult(metrics);
    }

    public Task<decimal> GetLatestPerformanceMetricAsync(string metricName, string? symbol = null)
    {
        var metric = _performanceMetrics
            .Where(m => m.MetricName == metricName && (symbol == null || m.Symbol == symbol))
            .OrderByDescending(m => m.Timestamp)
            .FirstOrDefault();
        return Task.FromResult(metric?.Value ?? 0m);
    }

    public Task<bool> SaveConfigurationAsync(string key, string value)
    {
        _configurations[key] = value;
        return Task.FromResult(true);
    }

    public Task<string?> GetConfigurationAsync(string key)
    {
        _configurations.TryGetValue(key, out var value);
        return Task.FromResult(value);
    }

    public Task<Dictionary<string, string>> GetAllConfigurationAsync()
    {
        return Task.FromResult(new Dictionary<string, string>(_configurations));
    }

    public Task<bool> DeleteConfigurationAsync(string key)
    {
        return Task.FromResult(_configurations.Remove(key));
    }
}
