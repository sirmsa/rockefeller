using Rockefeller.Models;

namespace Rockefeller.Services;

public interface IAnalyticsService
{
    Task<AnalyticsData> GetAnalyticsDataAsync();
    Task<List<Trade>> GetRecentTradesAsync(int count = 10);
    Task<List<StrategyPerformance>> GetStrategyPerformanceAsync();
    Task<PerformanceHistory> GetPerformanceHistoryAsync(DateTime startDate, DateTime endDate);
}
