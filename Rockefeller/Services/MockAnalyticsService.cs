using Rockefeller.Models;

namespace Rockefeller.Services;

public class MockAnalyticsService : IAnalyticsService
{
    public async Task<AnalyticsData> GetAnalyticsDataAsync()
    {
        // Simulate async operation
        await Task.Delay(100);
        
        return new AnalyticsData
        {
            TotalReturn = 0.156m, // 15.6%
            WinRate = 0.68m, // 68%
            TotalTrades = 247,
            AverageHoldTime = "2.3 days",
            SharpeRatio = 1.85m,
            MaxDrawdown = -0.08m, // -8%
            Volatility = 0.12m, // 12%
            RecentTrades = await GetRecentTradesAsync(),
            StrategyPerformance = await GetStrategyPerformanceAsync(),
            PerformanceHistory = await GetPerformanceHistoryAsync(DateTime.Now.AddDays(-30), DateTime.Now)
        };
    }

    public async Task<List<Trade>> GetRecentTradesAsync(int count = 10)
    {
        await Task.Delay(50);
        
        var trades = new List<Trade>
        {
            new Trade { Symbol = "BTC/USDT", Type = "Long", EntryPrice = 43250.50m, ExitPrice = 44520.75m, PnL = 1270.25m, Duration = "1.2 days" },
            new Trade { Symbol = "ETH/USDT", Type = "Short", EntryPrice = 2650.75m, ExitPrice = 2580.25m, PnL = 70.50m, Duration = "0.8 days" },
            new Trade { Symbol = "XRP/USDT", Type = "Long", EntryPrice = 3.0233m, ExitPrice = 3.1567m, PnL = 0.1334m, Duration = "2.1 days" },
            new Trade { Symbol = "ADA/USDT", Type = "Long", EntryPrice = 0.4850m, ExitPrice = 0.5120m, PnL = 0.0270m, Duration = "1.5 days" },
            new Trade { Symbol = "SOL/USDT", Type = "Short", EntryPrice = 98.50m, ExitPrice = 95.20m, PnL = 3.30m, Duration = "0.5 days" },
            new Trade { Symbol = "DOT/USDT", Type = "Long", EntryPrice = 7.85m, ExitPrice = 8.12m, PnL = 0.27m, Duration = "3.2 days" },
            new Trade { Symbol = "LINK/USDT", Type = "Short", EntryPrice = 15.80m, ExitPrice = 15.45m, PnL = 0.35m, Duration = "1.8 days" },
            new Trade { Symbol = "MATIC/USDT", Type = "Long", EntryPrice = 0.92m, ExitPrice = 0.98m, PnL = 0.06m, Duration = "2.5 days" },
            new Trade { Symbol = "AVAX/USDT", Type = "Long", EntryPrice = 28.50m, ExitPrice = 29.75m, PnL = 1.25m, Duration = "1.1 days" },
            new Trade { Symbol = "UNI/USDT", Type = "Short", EntryPrice = 6.85m, ExitPrice = 6.72m, PnL = 0.13m, Duration = "0.9 days" }
        };
        
        return trades.Take(count).ToList();
    }

    public async Task<List<StrategyPerformance>> GetStrategyPerformanceAsync()
    {
        await Task.Delay(50);
        
        return new List<StrategyPerformance>
        {
            new StrategyPerformance { Name = "Momentum Breakout", Return = 0.23m, TradeCount = 45 },
            new StrategyPerformance { Name = "Mean Reversion", Return = 0.18m, TradeCount = 38 },
            new StrategyPerformance { Name = "Trend Following", Return = 0.31m, TradeCount = 67 },
            new StrategyPerformance { Name = "Arbitrage", Return = 0.12m, TradeCount = 23 },
            new StrategyPerformance { Name = "Volatility", Return = 0.28m, TradeCount = 52 }
        };
    }

    public async Task<PerformanceHistory> GetPerformanceHistoryAsync(DateTime startDate, DateTime endDate)
    {
        await Task.Delay(50);
        
        var history = new List<PerformancePoint>();
        var currentValue = 10000m; // Starting with $10,000
        var random = new Random(42); // Fixed seed for consistent demo data
        
        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            // Simulate daily returns with some volatility
            var dailyReturn = (decimal)(random.NextDouble() * 0.04 - 0.02); // -2% to +2%
            currentValue *= (1 + dailyReturn);
            
            history.Add(new PerformancePoint
            {
                Date = date,
                Value = currentValue
            });
        }
        
        return new PerformanceHistory { Points = history };
    }
}
