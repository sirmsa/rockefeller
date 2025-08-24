using Rockefeller.Models;

namespace Rockefeller.Services;

public interface INotificationService
{
    // User Notifications
    Task<bool> SendNotificationAsync(string userId, string title, string message, string type = "INFO");
    Task<bool> SendTradeNotificationAsync(string userId, Trade trade, string notificationType);
    Task<bool> SendRiskAlertAsync(string userId, string alertType, string message, string severity);
    Task<bool> SendPerformanceUpdateAsync(string userId, string metricName, decimal value, string? symbol = null);
    
    // UI Notification Method
    Task ShowNotification(string message, string type = "INFO");
    
    // System Alerts
    Task<bool> SendSystemAlertAsync(string alertType, string message, string severity);
    Task<bool> SendCircuitBreakerAlertAsync(string reason, string severity);
    Task<bool> SendDailyLossLimitAlertAsync(decimal currentLoss, decimal limit);
    Task<bool> SendPortfolioRiskAlertAsync(decimal riskLevel, string riskType);
    
    // AI Signal Notifications
    Task<bool> SendAISignalNotificationAsync(string userId, AIInsight signal, string action);
    Task<bool> SendSignalConfidenceAlertAsync(string symbol, string signalType, double confidence);
    Task<bool> SendModelPerformanceAlertAsync(string modelType, decimal accuracy, decimal threshold);
    
    // Market Alerts
    Task<bool> SendMarketAlertAsync(string symbol, string alertType, string message);
    Task<bool> SendPriceAlertAsync(string symbol, decimal currentPrice, decimal targetPrice, string direction);
    Task<bool> SendVolatilityAlertAsync(string symbol, decimal volatility, decimal threshold);
    
    // Strategy Notifications
    Task<bool> SendStrategyNotificationAsync(string userId, string strategyName, string action, string status);
    Task<bool> SendStrategyPerformanceAlertAsync(string strategyName, decimal performance, decimal threshold);
    Task<bool> SendStrategyRiskAlertAsync(string strategyName, string riskType, string message);
    
    // Notification Management
    Task<List<Notification>> GetUserNotificationsAsync(string userId, DateTime? since = null);
    Task<List<Notification>> GetSystemNotificationsAsync(DateTime? since = null);
    Task<bool> MarkNotificationAsReadAsync(string notificationId);
    Task<bool> MarkAllNotificationsAsReadAsync(string userId);
    Task<bool> DeleteNotificationAsync(string notificationId);
    Task<bool> DeleteOldNotificationsAsync(DateTime cutoffDate);
    
    // Notification Preferences
    Task<NotificationPreferences> GetUserNotificationPreferencesAsync(string userId);
    Task<bool> UpdateNotificationPreferencesAsync(string userId, NotificationPreferences preferences);
    Task<bool> SetNotificationChannelAsync(string userId, string channel, bool enabled);
    
    // Notification Channels
    Task<bool> SendEmailNotificationAsync(string email, string subject, string body);
    Task<bool> SendSMSNotificationAsync(string phoneNumber, string message);
    Task<bool> SendPushNotificationAsync(string userId, string title, string body);
    Task<bool> SendInAppNotificationAsync(string userId, string title, string message);
    
    // Notification Templates
    Task<bool> CreateNotificationTemplateAsync(string templateName, string subject, string body);
    Task<NotificationTemplate?> GetNotificationTemplateAsync(string templateName);
    Task<bool> UpdateNotificationTemplateAsync(string templateName, string subject, string body);
    Task<bool> DeleteNotificationTemplateAsync(string templateName);
}

public class Notification
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // INFO, WARNING, ERROR, SUCCESS
    public string Severity { get; set; } = string.Empty; // LOW, MEDIUM, HIGH, CRITICAL
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public bool IsRead { get; set; }
    public string? Category { get; set; } // TRADE, RISK, AI, MARKET, STRATEGY, SYSTEM
    public Dictionary<string, object> Metadata { get; set; } = new();
    public List<string> Channels { get; set; } = []; // EMAIL, SMS, PUSH, IN_APP
}

public class NotificationPreferences
{
    public string UserId { get; set; } = string.Empty;
    public bool EmailEnabled { get; set; } = true;
    public bool SMSEnabled { get; set; } = false;
    public bool PushEnabled { get; set; } = true;
    public bool InAppEnabled { get; set; } = true;
    
    // Category Preferences
    public bool TradeNotifications { get; set; } = true;
    public bool RiskAlerts { get; set; } = true;
    public bool AISignals { get; set; } = true;
    public bool MarketAlerts { get; set; } = true;
    public bool StrategyNotifications { get; set; } = true;
    public bool SystemAlerts { get; set; } = true;
    
    // Frequency Preferences
    public string TradeNotificationFrequency { get; set; } = "IMMEDIATE"; // IMMEDIATE, HOURLY, DAILY
    public string RiskAlertFrequency { get; set; } = "IMMEDIATE";
    public string AISignalFrequency { get; set; } = "IMMEDIATE";
    public string MarketAlertFrequency { get; set; } = "HOURLY";
    public string StrategyNotificationFrequency { get; set; } = "DAILY";
    
    // Quiet Hours
    public TimeSpan QuietHoursStart { get; set; } = new TimeSpan(22, 0, 0); // 10:00 PM
    public TimeSpan QuietHoursEnd { get; set; } = new TimeSpan(6, 0, 0); // 6:00 AM
    public bool RespectQuietHours { get; set; } = true;
    public bool EmergencyAlertsInQuietHours { get; set; } = true;
}

public class NotificationTemplate
{
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public Dictionary<string, string> Variables { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime LastModified { get; set; }
}
