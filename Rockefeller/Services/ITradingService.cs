using Rockefeller.Models;

namespace Rockefeller.Services;

public interface ITradingService
{
    // Position Management
    Task<bool> OpenPositionAsync(string symbol, string side, decimal size, decimal price, string strategy);
    Task<bool> ClosePositionAsync(string positionId, decimal price, string reason);
    Task<bool> UpdatePositionAsync(string positionId, decimal stopLoss, decimal takeProfit);
    Task<bool> ModifyPositionAsync(string positionId, decimal newSize, decimal newPrice);
    
    // Position Queries
    Task<List<RockefellerPosition>> GetActivePositionsAsync();
    Task<RockefellerPosition?> GetPositionAsync(string positionId);
    Task<List<RockefellerPosition>> GetPositionsBySymbolAsync(string symbol);
    Task<List<RockefellerPosition>> GetPositionsByStrategyAsync(string strategy);
    
    // Risk Management
    Task<bool> ValidatePositionAsync(string symbol, decimal size, decimal price);
    Task<RiskAssessment> AssessPositionRiskAsync(string positionId);
    Task<bool> CheckRiskLimitsAsync(string symbol, decimal size);
    
    // Trading Control
    Task<bool> StartTradingAsync();
    Task<bool> StopTradingAsync();
    Task<bool> PauseTradingAsync();
    Task<TradingStatus> GetTradingStatusAsync();
    
    // Portfolio Management
    Task<PortfolioSummary> GetPortfolioSummaryAsync();
    Task<decimal> GetTotalPortfolioValueAsync();
    Task<decimal> GetUnrealizedPnLAsync();
    Task<decimal> GetRealizedPnLAsync();
}

public class TradingStatus
{
    public bool IsActive { get; set; }
    public bool IsPaused { get; set; }
    public DateTime LastUpdate { get; set; }
    public string Status { get; set; } = string.Empty; // ACTIVE, PAUSED, STOPPED, ERROR
    public string Message { get; set; } = string.Empty;
}
