namespace Rockefeller.Models;

public class TradingProfile
{
    public string Name { get; set; } = string.Empty;
    public decimal MaxBudget { get; set; } // Total available budget for trading
    public Dictionary<string, SymbolSettings> SymbolSettings { get; set; } = new();
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastModified { get; set; } = DateTime.UtcNow;
}

public class SymbolSettings
{
    public string Symbol { get; set; } = string.Empty;
    public decimal BudgetAllocation { get; set; } // Percentage of total budget allocated to this symbol
    public bool IsActive { get; set; } = true;
}

public class NotificationMessage
{
    public string Id { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;
}

public enum NotificationType
{
    Info,
    Success,
    Warning,
    Error
}