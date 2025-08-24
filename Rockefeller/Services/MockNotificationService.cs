using Rockefeller.Models;

namespace Rockefeller.Services;

public class MockNotificationService : INotificationService
{
    private readonly List<Notification> _notifications = new();
    private readonly Dictionary<string, NotificationPreferences> _preferences = new();
    private readonly Dictionary<string, NotificationTemplate> _templates = new();

    public Task<bool> SendNotificationAsync(string userId, string title, string message, string type = "INFO")
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            Severity = GetSeverityFromType(type),
            CreatedAt = DateTime.Now,
            IsRead = false,
            Category = "SYSTEM"
        };
        _notifications.Add(notification);
        return Task.FromResult(true);
    }

    public Task ShowNotification(string message, string type = "INFO")
    {
        // Mock implementation - in a real app this would show a UI notification
        System.Diagnostics.Debug.WriteLine($"Mock Notification [{type}]: {message}");
        return Task.CompletedTask;
    }

    public Task<bool> SendTradeNotificationAsync(string userId, Trade trade, string notificationType)
    {
        var message = $"Trade {notificationType}: {trade.Symbol} {trade.Side} at {trade.Price:C}";
        return SendNotificationAsync(userId, "Trade Update", message, "INFO");
    }

    public Task<bool> SendRiskAlertAsync(string userId, string alertType, string message, string severity)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            Title = $"Risk Alert: {alertType}",
            Message = message,
            Type = "WARNING",
            Severity = severity,
            CreatedAt = DateTime.Now,
            IsRead = false,
            Category = "RISK"
        };
        _notifications.Add(notification);
        return Task.FromResult(true);
    }

    public Task<bool> SendPerformanceUpdateAsync(string userId, string metricName, decimal value, string? symbol = null)
    {
        var message = symbol != null ? $"{metricName}: {value:F2} for {symbol}" : $"{metricName}: {value:F2}";
        return SendNotificationAsync(userId, "Performance Update", message, "INFO");
    }

    public Task<bool> SendSystemAlertAsync(string alertType, string message, string severity)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid().ToString(),
            UserId = "system",
            Title = $"System Alert: {alertType}",
            Message = message,
            Type = "WARNING",
            Severity = severity,
            CreatedAt = DateTime.Now,
            IsRead = false,
            Category = "SYSTEM"
        };
        _notifications.Add(notification);
        return Task.FromResult(true);
    }

    public Task<bool> SendCircuitBreakerAlertAsync(string reason, string severity)
    {
        return SendSystemAlertAsync("Circuit Breaker", reason, severity);
    }

    public Task<bool> SendDailyLossLimitAlertAsync(decimal currentLoss, decimal limit)
    {
        var message = $"Daily loss limit reached: {currentLoss:F2}% (limit: {limit:F2}%)";
        return SendSystemAlertAsync("Daily Loss Limit", message, "HIGH");
    }

    public Task<bool> SendPortfolioRiskAlertAsync(decimal riskLevel, string riskType)
    {
        var message = $"Portfolio risk level: {riskLevel:F2}% - {riskType}";
        return SendSystemAlertAsync("Portfolio Risk", message, "MEDIUM");
    }

    public Task<bool> SendAISignalNotificationAsync(string userId, AIInsight signal, string action)
    {
        var message = $"AI Signal: {signal.Content} - Action: {action}";
        return SendNotificationAsync(userId, "AI Signal", message, "INFO");
    }

    public Task<bool> SendSignalConfidenceAlertAsync(string symbol, string signalType, double confidence)
    {
        var message = $"Signal confidence for {symbol}: {signalType} at {confidence:F1}%";
        return SendSystemAlertAsync("Signal Confidence", message, "MEDIUM");
    }

    public Task<bool> SendModelPerformanceAlertAsync(string modelType, decimal accuracy, decimal threshold)
    {
        var message = $"Model performance: {modelType} accuracy {accuracy:F2}% (threshold: {threshold:F2}%)";
        return SendSystemAlertAsync("Model Performance", message, "MEDIUM");
    }

    public Task<bool> SendMarketAlertAsync(string symbol, string alertType, string message)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid().ToString(),
            UserId = "market",
            Title = $"Market Alert: {symbol} - {alertType}",
            Message = message,
            Type = "WARNING",
            Severity = "MEDIUM",
            CreatedAt = DateTime.Now,
            IsRead = false,
            Category = "MARKET"
        };
        _notifications.Add(notification);
        return Task.FromResult(true);
    }

    public Task<bool> SendPriceAlertAsync(string symbol, decimal currentPrice, decimal targetPrice, string direction)
    {
        var message = $"{symbol} price alert: {currentPrice:C} {direction} target {targetPrice:C}";
        return SendMarketAlertAsync(symbol, "Price Alert", message);
    }

    public Task<bool> SendVolatilityAlertAsync(string symbol, decimal volatility, decimal threshold)
    {
        var message = $"{symbol} volatility: {volatility:F2}% (threshold: {threshold:F2}%)";
        return SendMarketAlertAsync(symbol, "Volatility Alert", message);
    }

    public Task<bool> SendStrategyNotificationAsync(string userId, string strategyName, string action, string status)
    {
        var message = $"Strategy {strategyName}: {action} - Status: {status}";
        return SendNotificationAsync(userId, "Strategy Update", message, "INFO");
    }

    public Task<bool> SendStrategyPerformanceAlertAsync(string strategyName, decimal performance, decimal threshold)
    {
        var message = $"Strategy {strategyName} performance: {performance:F2}% (threshold: {threshold:F2}%)";
        return SendSystemAlertAsync("Strategy Performance", message, "MEDIUM");
    }

    public Task<bool> SendStrategyRiskAlertAsync(string strategyName, string riskType, string message)
    {
        var alertMessage = $"Strategy {strategyName} risk: {riskType} - {message}";
        return SendSystemAlertAsync("Strategy Risk", alertMessage, "HIGH");
    }

    public Task<List<Notification>> GetUserNotificationsAsync(string userId, DateTime? since = null)
    {
        var notifications = _notifications.Where(n => n.UserId == userId).AsEnumerable();
        if (since.HasValue)
            notifications = notifications.Where(n => n.CreatedAt >= since.Value);
        return Task.FromResult(notifications.OrderByDescending(n => n.CreatedAt).ToList());
    }

    public Task<List<Notification>> GetSystemNotificationsAsync(DateTime? since = null)
    {
        var notifications = _notifications.Where(n => n.UserId == "system" || n.UserId == "market").AsEnumerable();
        if (since.HasValue)
            notifications = notifications.Where(n => n.CreatedAt >= since.Value);
        return Task.FromResult(notifications.OrderByDescending(n => n.CreatedAt).ToList());
    }

    public Task<bool> MarkNotificationAsReadAsync(string notificationId)
    {
        var notification = _notifications.FirstOrDefault(n => n.Id == notificationId);
        if (notification != null)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.Now;
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    public Task<bool> MarkAllNotificationsAsReadAsync(string userId)
    {
        var userNotifications = _notifications.Where(n => n.UserId == userId && !n.IsRead);
        foreach (var notification in userNotifications)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.Now;
        }
        return Task.FromResult(true);
    }

    public Task<bool> DeleteNotificationAsync(string notificationId)
    {
        var notification = _notifications.FirstOrDefault(n => n.Id == notificationId);
        if (notification != null)
        {
            _notifications.Remove(notification);
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    public Task<bool> DeleteOldNotificationsAsync(DateTime cutoffDate)
    {
        var oldNotifications = _notifications.Where(n => n.CreatedAt < cutoffDate).ToList();
        foreach (var notification in oldNotifications)
        {
            _notifications.Remove(notification);
        }
        return Task.FromResult(true);
    }

    public Task<NotificationPreferences> GetUserNotificationPreferencesAsync(string userId)
    {
        if (!_preferences.TryGetValue(userId, out var preferences))
        {
            preferences = new NotificationPreferences
            {
                UserId = userId,
                EmailEnabled = true,
                SMSEnabled = false,
                PushEnabled = true,
                InAppEnabled = true,
                TradeNotifications = true,
                RiskAlerts = true,
                AISignals = true,
                MarketAlerts = true,
                StrategyNotifications = true,
                SystemAlerts = true,
                TradeNotificationFrequency = "IMMEDIATE",
                RiskAlertFrequency = "IMMEDIATE",
                AISignalFrequency = "IMMEDIATE",
                MarketAlertFrequency = "HOURLY",
                StrategyNotificationFrequency = "DAILY",
                QuietHoursStart = new TimeSpan(22, 0, 0),
                QuietHoursEnd = new TimeSpan(6, 0, 0),
                RespectQuietHours = true,
                EmergencyAlertsInQuietHours = true
            };
            _preferences[userId] = preferences;
        }
        return Task.FromResult(preferences);
    }

    public Task<bool> UpdateNotificationPreferencesAsync(string userId, NotificationPreferences preferences)
    {
        preferences.UserId = userId;
        _preferences[userId] = preferences;
        return Task.FromResult(true);
    }

    public Task<bool> SetNotificationChannelAsync(string userId, string channel, bool enabled)
    {
        var preferences = GetUserNotificationPreferencesAsync(userId).Result;
        switch (channel.ToUpper())
        {
            case "EMAIL":
                preferences.EmailEnabled = enabled;
                break;
            case "SMS":
                preferences.SMSEnabled = enabled;
                break;
            case "PUSH":
                preferences.PushEnabled = enabled;
                break;
            case "IN_APP":
                preferences.InAppEnabled = enabled;
                break;
        }
        return UpdateNotificationPreferencesAsync(userId, preferences);
    }

    public Task<bool> SendEmailNotificationAsync(string email, string subject, string body)
    {
        // Mock email sending
        System.Diagnostics.Debug.WriteLine($"Mock email sent to {email}: {subject}");
        return Task.FromResult(true);
    }

    public Task<bool> SendSMSNotificationAsync(string phoneNumber, string message)
    {
        // Mock SMS sending
        System.Diagnostics.Debug.WriteLine($"Mock SMS sent to {phoneNumber}: {message}");
        return Task.FromResult(true);
    }

    public Task<bool> SendPushNotificationAsync(string userId, string title, string body)
    {
        // Mock push notification
        System.Diagnostics.Debug.WriteLine($"Mock push notification sent to {userId}: {title}");
        return Task.FromResult(true);
    }

    public Task<bool> SendInAppNotificationAsync(string userId, string title, string message)
    {
        return SendNotificationAsync(userId, title, message, "INFO");
    }

    public Task<bool> CreateNotificationTemplateAsync(string templateName, string subject, string body)
    {
        var template = new NotificationTemplate
        {
            Name = templateName,
            Subject = subject,
            Body = body,
            Category = "GENERAL",
            Variables = new Dictionary<string, string>(),
            CreatedAt = DateTime.Now,
            LastModified = DateTime.Now
        };
        _templates[templateName] = template;
        return Task.FromResult(true);
    }

    public Task<NotificationTemplate?> GetNotificationTemplateAsync(string templateName)
    {
        _templates.TryGetValue(templateName, out var template);
        return Task.FromResult(template);
    }

    public Task<bool> UpdateNotificationTemplateAsync(string templateName, string subject, string body)
    {
        if (_templates.TryGetValue(templateName, out var template))
        {
            template.Subject = subject;
            template.Body = body;
            template.LastModified = DateTime.Now;
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    public Task<bool> DeleteNotificationTemplateAsync(string templateName)
    {
        return Task.FromResult(_templates.Remove(templateName));
    }

    private static string GetSeverityFromType(string type)
    {
        return type.ToUpper() switch
        {
            "ERROR" => "HIGH",
            "WARNING" => "MEDIUM",
            "SUCCESS" => "LOW",
            _ => "LOW"
        };
    }
}
