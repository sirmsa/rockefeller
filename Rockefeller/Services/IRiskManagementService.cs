using Rockefeller.Models;

namespace Rockefeller.Services;

public interface IRiskManagementService
{
    // Circuit Breaker Management
    Task<bool> CheckCircuitBreakerStatusAsync();
    Task<bool> TriggerCircuitBreakerAsync(string reason, string severity = "HIGH");
    Task<bool> ResetCircuitBreakerAsync();
    Task<CircuitBreakerStatus> GetCircuitBreakerStatusAsync();
    
    // Daily Loss Limits
    Task<bool> CheckDailyLossLimitAsync();
    Task<decimal> GetCurrentDailyLossAsync();
    Task<decimal> GetDailyLossLimitAsync();
    Task<bool> SetDailyLossLimitAsync(decimal limit);
    Task<bool> UpdateDailyLossAsync(decimal loss);
    
    // Position Size Controls
    Task<bool> ValidatePositionSizeAsync(string symbol, decimal size, decimal price);
    Task<decimal> GetMaxPositionSizeAsync(string symbol);
    Task<bool> SetMaxPositionSizeAsync(string symbol, decimal maxSize);
    Task<decimal> CalculatePositionRiskAsync(string symbol, decimal size, decimal price);
    
    // Portfolio Risk Limits
    Task<bool> CheckPortfolioRiskAsync();
    Task<decimal> GetPortfolioRiskLevelAsync();
    Task<bool> SetMaxPortfolioRiskAsync(decimal maxRisk);
    Task<decimal> CalculatePortfolioVaRAsync(decimal confidenceLevel);
    
    // Stop Loss & Take Profit
    Task<bool> ValidateStopLossAsync(string symbol, decimal entryPrice, decimal stopLoss);
    Task<bool> ValidateTakeProfitAsync(string symbol, decimal entryPrice, decimal takeProfit);
    Task<bool> SetDynamicStopLossAsync(string symbol, decimal percentage);
    Task<bool> SetTrailingStopAsync(string symbol, decimal percentage);
    
    // Leverage Controls
    Task<bool> ValidateLeverageAsync(string symbol, decimal leverage);
    Task<decimal> GetMaxLeverageAsync(string symbol);
    Task<bool> SetMaxLeverageAsync(string symbol, decimal maxLeverage);
    
    // Correlation Risk
    Task<decimal> CalculateCorrelationRiskAsync(List<string> symbols);
    Task<bool> CheckCorrelationLimitAsync(List<string> symbols, decimal maxCorrelation);
    Task<List<string>> GetHighCorrelationPairsAsync(string symbol);
    
    // Volatility Risk
    Task<decimal> CalculateVolatilityRiskAsync(string symbol);
    Task<bool> CheckVolatilityLimitAsync(string symbol, decimal maxVolatility);
    Task<bool> PauseTradingOnHighVolatilityAsync(string symbol);
    
    // Liquidity Risk
    Task<bool> CheckLiquidityRiskAsync(string symbol, decimal size);
    Task<decimal> GetLiquidityScoreAsync(string symbol);
    Task<bool> SetMinLiquidityThresholdAsync(string symbol, decimal threshold);
    
    // Market Hours Risk
    Task<bool> CheckMarketHoursRiskAsync(string symbol);
    Task<bool> SetMarketHoursRestrictionsAsync(string symbol, TimeSpan startTime, TimeSpan endTime);
    Task<bool> IsMarketHoursRestrictedAsync(string symbol);
    
    // Risk Scoring
    Task<RiskScore> CalculateOverallRiskScoreAsync();
    Task<RiskScore> CalculateSymbolRiskScoreAsync(string symbol);
    Task<RiskScore> CalculateStrategyRiskScoreAsync(string strategyName);
    
    // Risk Alerts
    Task<bool> SendRiskAlertAsync(string alertType, string message, string severity);
    Task<List<RiskAlert>> GetRiskAlertsAsync(DateTime? since = null);
    Task<bool> AcknowledgeRiskAlertAsync(string alertId);
    
    // Risk Reporting
    Task<RiskReport> GenerateRiskReportAsync(DateTime startDate, DateTime endDate);
    Task<RiskReport> GenerateCurrentRiskReportAsync();
    Task<List<RiskEvent>> GetRiskEventsAsync(DateTime startDate, DateTime endDate);
}

public class CircuitBreakerStatus
{
    public bool IsTriggered { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty; // LOW, MEDIUM, HIGH, CRITICAL
    public DateTime TriggeredAt { get; set; }
    public DateTime? LastResetAt { get; set; }
    public int TriggerCount { get; set; }
    public List<string> Conditions { get; set; } = [];
    public bool CanReset { get; set; }
    public TimeSpan CooldownPeriod { get; set; }
}

public class RiskScore
{
    public decimal OverallScore { get; set; } // 0-100, lower is better
    public string RiskLevel { get; set; } = string.Empty; // LOW, MEDIUM, HIGH, CRITICAL
    public Dictionary<string, decimal> ComponentScores { get; set; } = new();
    public List<string> RiskFactors { get; set; } = [];
    public List<string> Recommendations { get; set; } = [];
    public DateTime CalculatedAt { get; set; }
}

public class RiskAlert
{
    public string Id { get; set; } = string.Empty;
    public string AlertType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public string? AcknowledgedBy { get; set; }
    public bool IsActive { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}

public class RiskReport
{
    public DateTime GeneratedAt { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    // Risk Metrics
    public decimal OverallRiskScore { get; set; }
    public string OverallRiskLevel { get; set; } = string.Empty;
    public decimal PortfolioRisk { get; set; }
    public decimal MaxDrawdown { get; set; }
    public decimal VaR { get; set; }
    public decimal ExpectedShortfall { get; set; }
    
    // Risk Events
    public int CircuitBreakerTriggers { get; set; }
    public int DailyLossLimitBreaches { get; set; }
    public int PositionSizeViolations { get; set; }
    public int VolatilityAlerts { get; set; }
    
    // Recommendations
    public List<string> RiskReductionActions { get; set; } = [];
    public List<string> ImmediateActions { get; set; } = [];
    public List<string> LongTermActions { get; set; } = [];
}

public class RiskEvent
{
    public string Id { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; }
    public string? Symbol { get; set; }
    public string? Strategy { get; set; }
    public Dictionary<string, object> Impact { get; set; } = new();
    public bool WasResolved { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
