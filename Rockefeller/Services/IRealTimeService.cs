using Rockefeller.Models;

namespace Rockefeller.Services;

public interface IRealTimeService
{
    // Connection Management
    Task<bool> ConnectAsync();
    Task<bool> DisconnectAsync();
    Task<bool> IsConnectedAsync();
    
    // Market Data Streaming
    Task<bool> SubscribeToMarketDataAsync(string symbol);
    Task<bool> UnsubscribeFromMarketDataAsync(string symbol);
    Task<bool> SubscribeToAllMarketDataAsync();
    
    // Trade Updates
    Task<bool> SubscribeToTradeUpdatesAsync();
    Task<bool> SubscribeToPortfolioUpdatesAsync();
    Task<bool> SubscribeToPositionUpdatesAsync();
    
    // AI Signal Streaming
    Task<bool> SubscribeToAISignalsAsync();
    Task<bool> SubscribeToInsightUpdatesAsync(string? symbol = null);
    
    // Risk Management Alerts
    Task<bool> SubscribeToRiskAlertsAsync();
    Task<bool> SubscribeToCircuitBreakerAlertsAsync();
    
    // Order Execution Updates
    Task<bool> SubscribeToOrderUpdatesAsync();
    Task<bool> SubscribeToExecutionReportsAsync();
    
    // Performance Metrics Streaming
    Task<bool> SubscribeToPerformanceUpdatesAsync();
    Task<bool> SubscribeToROIUpdatesAsync();
    
    // Event Handlers
    event EventHandler<MarketDataUpdateEventArgs> MarketDataUpdated;
    event EventHandler<TradeUpdateEventArgs> TradeUpdated;
    event EventHandler<PortfolioUpdateEventArgs> PortfolioUpdated;
    event EventHandler<PositionUpdateEventArgs> PositionUpdated;
    event EventHandler<AISignalEventArgs> AISignalReceived;
    event EventHandler<RiskAlertEventArgs> RiskAlertReceived;
    event EventHandler<OrderUpdateEventArgs> OrderUpdated;
    event EventHandler<PerformanceUpdateEventArgs> PerformanceUpdated;
    event EventHandler<ConnectionStateEventArgs> ConnectionStateChanged;
}

public class MarketDataUpdateEventArgs : EventArgs
{
    public MarketData MarketData { get; set; } = new();
    public DateTime Timestamp { get; set; }
}

public class TradeUpdateEventArgs : EventArgs
{
    public Trade Trade { get; set; } = new();
    public string UpdateType { get; set; } = string.Empty; // CREATED, UPDATED, CLOSED
    public DateTime Timestamp { get; set; }
}

public class PortfolioUpdateEventArgs : EventArgs
{
    public Portfolio Portfolio { get; set; } = new();
    public DateTime Timestamp { get; set; }
}

public class PositionUpdateEventArgs : EventArgs
{
    public Position Position { get; set; } = new();
    public string UpdateType { get; set; } = string.Empty; // OPENED, UPDATED, CLOSED
    public DateTime Timestamp { get; set; }
}

public class AISignalEventArgs : EventArgs
{
    public AIInsight Signal { get; set; } = new();
    public string SignalType { get; set; } = string.Empty; // BUY, SELL, HOLD
    public DateTime Timestamp { get; set; }
}

public class RiskAlertEventArgs : EventArgs
{
    public string AlertType { get; set; } = string.Empty; // DAILY_LOSS_LIMIT, MAX_DRAWDOWN, CIRCUIT_BREAKER
    public string Message { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty; // LOW, MEDIUM, HIGH, CRITICAL
    public DateTime Timestamp { get; set; }
}

public class OrderUpdateEventArgs : EventArgs
{
    public string OrderId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // PENDING, FILLED, CANCELLED, REJECTED
    public decimal FilledQuantity { get; set; }
    public decimal AveragePrice { get; set; }
    public DateTime Timestamp { get; set; }
}

public class PerformanceUpdateEventArgs : EventArgs
{
    public string MetricName { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string? Symbol { get; set; }
    public DateTime Timestamp { get; set; }
}

public class ConnectionStateEventArgs : EventArgs
{
    public bool IsConnected { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime Timestamp { get; set; }
}
