using Rockefeller.Models;

namespace Rockefeller.Services;

public interface ITradingService
{
    // Portfolio Management
    Task<Portfolio> GetPortfolioAsync();
    Task<List<Position>> GetOpenPositionsAsync();
    Task<List<Asset>> GetAssetsAsync();
    
    // Trade Management
    Task<List<Trade>> GetTradesAsync(DateTime? startDate = null, DateTime? endDate = null);
    Task<Trade> GetTradeByIdAsync(string tradeId);
    Task<Trade> ExecuteTradeAsync(Trade trade);
    Task<bool> ClosePositionAsync(string symbol, string side);
    Task<bool> UpdateStopLossAsync(string symbol, string side, decimal stopLoss);
    Task<bool> UpdateTakeProfitAsync(string symbol, string side, decimal takeProfit);
    
    // Order Management
    Task<string> PlaceOrderAsync(string symbol, string side, decimal size, decimal price, string orderType);
    Task<bool> CancelOrderAsync(string orderId);
    Task<List<object>> GetOpenOrdersAsync();
    
    // Risk Management
    Task<RiskMetrics> GetRiskMetricsAsync();
    Task<bool> CheckRiskLimitsAsync();
    Task<bool> TriggerCircuitBreakerAsync();
    
    // Strategy Management
    Task<List<TradingStrategy>> GetStrategiesAsync();
    Task<TradingStrategy> GetStrategyByIdAsync(string strategyId);
    Task<TradingStrategy> CreateStrategyAsync(TradingStrategy strategy);
    Task<bool> UpdateStrategyAsync(TradingStrategy strategy);
    Task<bool> DeleteStrategyAsync(string strategyId);
    Task<bool> ActivateStrategyAsync(string strategyId);
    Task<bool> PauseStrategyAsync(string strategyId);
}
