using Rockefeller.Models;

namespace Rockefeller.Services;

public class MockAnalyticsService : IAnalyticsService
{
    public async Task<AnalyticsData> GetAnalyticsDataAsync()
    {
        await Task.Delay(100);
        
        return new AnalyticsData
        {
            TotalReturn = 0.156m,
            WinRate = 0.68m,
            TotalTrades = 150,
            AverageHoldTime = "2.5 days",
            SharpeRatio = 1.85m,
            MaxDrawdown = -0.08m,
            Volatility = 0.12m,
            ProfitFactor = 1.8m,
            RecentTrades = await GetRecentTradesAsync(10),
            StrategyPerformance = new List<StrategyPerformance>
            {
                new() { Name = "Momentum", TradeCount = 45, Return = 0.18m, WinRate = 0.71m, AverageReturn = 0.04m, MaxDrawdown = -0.06m, SharpeRatio = 1.9m },
                new() { Name = "Mean Reversion", TradeCount = 38, Return = 0.12m, WinRate = 0.65m, AverageReturn = 0.03m, MaxDrawdown = -0.08m, SharpeRatio = 1.6m },
                new() { Name = "Breakout", TradeCount = 32, Return = 0.22m, WinRate = 0.69m, AverageReturn = 0.07m, MaxDrawdown = -0.10m, SharpeRatio = 2.1m }
            },
            PerformanceHistory = new PerformanceHistory
            {
                Points = new List<PerformancePoint>
                {
                    new() { Date = DateTime.UtcNow.AddDays(-30), Value = 100000m, Return = 0.0m },
                    new() { Date = DateTime.UtcNow.AddDays(-20), Value = 105000m, Return = 0.05m },
                    new() { Date = DateTime.UtcNow.AddDays(-10), Value = 108000m, Return = 0.08m },
                    new() { Date = DateTime.UtcNow, Value = 115600m, Return = 0.156m }
                }
            }
        };
    }

    public async Task<PerformanceMetrics> GetPerformanceMetricsAsync(DateTime startDate, DateTime endDate)
    {
        await Task.Delay(100);
        
        var metrics = new List<PerformanceMetric>
        {
            new() { Name = "Total Return", Value = 0.156m, Unit = "%", Timestamp = DateTime.UtcNow },
            new() { Name = "Sharpe Ratio", Value = 1.85m, Unit = "", Timestamp = DateTime.UtcNow },
            new() { Name = "Max Drawdown", Value = -0.08m, Unit = "%", Timestamp = DateTime.UtcNow },
            new() { Name = "Volatility", Value = 0.12m, Unit = "%", Timestamp = DateTime.UtcNow },
            new() { Name = "Win Rate", Value = 0.68m, Unit = "%", Timestamp = DateTime.UtcNow }
        };
        
        return new PerformanceMetrics
        {
            StartDate = startDate,
            EndDate = endDate,
            Metrics = metrics,
            TotalReturn = 0.156m,
            SharpeRatio = 1.85m,
            MaxDrawdown = -0.08m,
            Volatility = 0.12m
        };
    }

    public async Task<PerformanceMetrics> GetPerformanceMetricsAsync(string symbol, DateTime startDate, DateTime endDate)
    {
        await Task.Delay(100);
        
        var metrics = new List<PerformanceMetric>
        {
            new() { Name = "Symbol Return", Value = 0.125m, Unit = "%", Timestamp = DateTime.UtcNow },
            new() { Name = "Symbol Sharpe", Value = 1.45m, Unit = "", Timestamp = DateTime.UtcNow },
            new() { Name = "Symbol Drawdown", Value = -0.06m, Unit = "%", Timestamp = DateTime.UtcNow }
        };
        
        return new PerformanceMetrics
        {
            StartDate = startDate,
            EndDate = endDate,
            Metrics = metrics,
            TotalReturn = 0.125m,
            SharpeRatio = 1.45m,
            MaxDrawdown = -0.06m,
            Volatility = 0.10m
        };
    }

    public async Task<List<Trade>> GetTradesBySymbolAsync(string symbol, DateTime startDate, DateTime endDate)
    {
        await Task.Delay(100);
        var allTrades = await GetRecentTradesAsync(50);
        return allTrades.Where(t => t.Symbol == symbol).ToList();
    }

    public async Task<List<Trade>> GetTradesByStrategyAsync(string strategy, DateTime startDate, DateTime endDate)
    {
        await Task.Delay(100);
        var allTrades = await GetRecentTradesAsync(50);
        return allTrades.Where(t => t.Strategy == strategy).ToList();
    }

    public async Task<PortfolioAnalytics> GetPortfolioAnalyticsAsync(DateTime startDate, DateTime endDate)
    {
        await Task.Delay(150);
        
        var points = new List<PortfolioPoint>();
        var currentDate = startDate;
        var baseValue = 100000m;
        
        while (currentDate <= endDate)
        {
            var variation = (decimal)(new Random().NextDouble() - 0.5) * 0.02m; // ±1% daily variation
            baseValue *= (1 + variation);
            
            points.Add(new PortfolioPoint
            {
                Date = currentDate,
                Value = baseValue,
                Return = variation,
                Drawdown = Math.Min(0, variation)
            });
            
            currentDate = currentDate.AddDays(1);
        }
        
        return new PortfolioAnalytics
        {
            StartDate = startDate,
            EndDate = endDate,
            Points = points,
            TotalReturn = (baseValue - 100000m) / 100000m,
            MaxDrawdown = points.Min(p => p.Drawdown),
            SharpeRatio = 1.2m,
            Volatility = 0.15m
        };
    }

    public async Task<RiskAnalytics> GetRiskAnalyticsAsync(DateTime startDate, DateTime endDate)
    {
        await Task.Delay(150);
        
        var points = new List<RiskPoint>();
        var currentDate = startDate;
        
        while (currentDate <= endDate)
        {
            points.Add(new RiskPoint
            {
                Date = currentDate,
                RiskScore = (decimal)(new Random().NextDouble() * 0.3 + 0.1), // 10-40% risk
                PositionRisk = (decimal)(new Random().NextDouble() * 0.2 + 0.05), // 5-25% position risk
                MarketRisk = (decimal)(new Random().NextDouble() * 0.25 + 0.1) // 10-35% market risk
            });
            
            currentDate = currentDate.AddDays(1);
        }
        
        return new RiskAnalytics
        {
            StartDate = startDate,
            EndDate = endDate,
            Points = points,
            AverageRisk = points.Average(p => p.RiskScore),
            MaxRisk = points.Max(p => p.RiskScore),
            RiskVolatility = points.Average(p => p.RiskScore) * 0.3m
        };
    }

    public async Task<CorrelationAnalytics> GetCorrelationAnalyticsAsync(List<string> symbols, DateTime startDate, DateTime endDate)
    {
        await Task.Delay(200);
        
        var matrix = new Dictionary<string, Dictionary<string, decimal>>();
        var random = new Random();
        
        foreach (var symbol1 in symbols)
        {
            matrix[symbol1] = new Dictionary<string, decimal>();
            foreach (var symbol2 in symbols)
            {
                if (symbol1 == symbol2)
                {
                    matrix[symbol1][symbol2] = 1.0m;
                }
                else
                {
                    // Generate mock correlation between -0.8 and 0.8
                    matrix[symbol1][symbol2] = (decimal)(random.NextDouble() * 1.6 - 0.8);
                }
            }
        }
        
        return new CorrelationAnalytics
        {
            StartDate = startDate,
            EndDate = endDate,
            Symbols = symbols,
            CorrelationMatrix = matrix
        };
    }

    public async Task<AIPerformanceMetrics> GetAIPerformanceMetricsAsync(DateTime startDate, DateTime endDate)
    {
        await Task.Delay(150);
        
        var points = new List<AIPerformancePoint>();
        var currentDate = startDate;
        
        while (currentDate <= endDate)
        {
            points.Add(new AIPerformancePoint
            {
                Date = currentDate,
                SuccessRate = (decimal)(new Random().NextDouble() * 0.3 + 0.6), // 60-90% success rate
                AverageConfidence = (decimal)(new Random().NextDouble() * 0.2 + 0.7), // 70-90% confidence
                ProfitFactor = (decimal)(new Random().NextDouble() * 0.8 + 1.2), // 1.2-2.0 profit factor
                TotalSignals = new Random().Next(5, 25)
            });
            
            currentDate = currentDate.AddDays(1);
        }
        
        return new AIPerformanceMetrics
        {
            StartDate = startDate,
            EndDate = endDate,
            Points = points,
            SuccessRate = points.Average(p => p.SuccessRate),
            AverageConfidence = points.Average(p => p.AverageConfidence),
            ProfitFactor = points.Average(p => p.ProfitFactor)
        };
    }

    public async Task<List<AIDecisionAnalysis>> GetAIDecisionAnalysisAsync(string symbol, DateTime startDate, DateTime endDate)
    {
        await Task.Delay(150);
        
        var decisions = new List<AIAnalysisRecord>();
        var random = new Random();
        
        for (int i = 0; i < 10; i++)
        {
            var decision = random.Next(4) switch
            {
                0 => "BUY",
                1 => "SELL",
                2 => "HOLD",
                _ => "WAIT"
            };
            
            decisions.Add(new AIAnalysisRecord
            {
                Id = Guid.NewGuid().ToString(),
                Symbol = symbol,
                Timestamp = startDate.AddDays(i),
                Decision = decision,
                Confidence = (decimal)(random.NextDouble() * 0.4 + 0.6), // 60-100% confidence
                Reasoning = $"AI analysis based on technical indicators and market sentiment for {decision} decision"
            });
        }
        
        var successRate = decisions.Count(d => d.Decision == "BUY" || d.Decision == "SELL") / (decimal)decisions.Count;
        
        var analysis = new AIDecisionAnalysis
        {
            Symbol = symbol,
            StartDate = startDate,
            EndDate = endDate,
            Decisions = decisions,
            SuccessRate = successRate,
            AverageConfidence = decisions.Average(d => d.Confidence),
            AverageReturn = successRate * 0.05m // 5% average return for successful decisions
        };
        
        return new List<AIDecisionAnalysis> { analysis };
    }

    public async Task<AISuccessRate> GetAISuccessRateAsync(DateTime startDate, DateTime endDate)
    {
        await Task.Delay(100);
        return new AISuccessRate
        {
            StartDate = startDate,
            EndDate = endDate,
            SuccessRate = 0.72m, // 72% success rate
            TotalDecisions = 150,
            SuccessfulDecisions = 108,
            FailedDecisions = 42,
            AverageConfidence = 0.78m,
            ProfitFactor = 1.85m
        };
    }

    public async Task<List<Trade>> GetRecentTradesAsync(int count = 10)
    {
        await Task.Delay(50);

        var trades = new List<Trade>
        {
            new()
            {
                Symbol = "BTC/USDT", Type = "Long", EntryPrice = 43250.50m, ExitPrice = 44520.75m, PnL = 1270.25m,
                Duration = "1.2 days", EntryTime = DateTime.Now.AddDays(-1), ExitTime = DateTime.Now.AddHours(-6)
            },
            new()
            {
                Symbol = "ETH/USDT", Type = "Short", EntryPrice = 2650.75m, ExitPrice = 2580.25m, PnL = 70.50m,
                Duration = "0.8 days", EntryTime = DateTime.Now.AddDays(-2),
                ExitTime = DateTime.Now.AddDays(-1).AddHours(4)
            },
            new()
            {
                Symbol = "XRP/USDT", Type = "Long", EntryPrice = 3.0233m, ExitPrice = 3.1567m, PnL = 0.1334m,
                Duration = "2.1 days", EntryTime = DateTime.Now.AddDays(-3), ExitTime = DateTime.Now.AddDays(-1)
            },
            new()
            {
                Symbol = "ADA/USDT", Type = "Long", EntryPrice = 0.4850m, ExitPrice = 0.5120m, PnL = 0.0270m,
                Duration = "1.5 days", EntryTime = DateTime.Now.AddDays(-4),
                ExitTime = DateTime.Now.AddDays(-2).AddHours(12)
            },
            new()
            {
                Symbol = "SOL/USDT", Type = "Short", EntryPrice = 98.50m, ExitPrice = 95.20m, PnL = 3.30m,
                Duration = "0.5 days", EntryTime = DateTime.Now.AddDays(-5),
                ExitTime = DateTime.Now.AddDays(-4).AddHours(12)
            },
            new()
            {
                Symbol = "DOT/USDT", Type = "Long", EntryPrice = 7.85m, ExitPrice = 8.12m, PnL = 0.27m,
                Duration = "2.5 days", EntryTime = DateTime.Now.AddDays(-6),
                ExitTime = DateTime.Now.AddDays(-3).AddHours(12)
            },
            new()
            {
                Symbol = "LINK/USDT", Type = "Short", EntryPrice = 15.80m, ExitPrice = 15.45m, PnL = 0.35m,
                Duration = "1.8 days", EntryTime = DateTime.Now.AddDays(-7),
                ExitTime = DateTime.Now.AddDays(-5).AddHours(6)
            },
            new()
            {
                Symbol = "MATIC/USDT", Type = "Long", EntryPrice = 0.92m, ExitPrice = 0.98m, PnL = 0.06m,
                Duration = "2.5 days", EntryTime = DateTime.Now.AddDays(-8),
                ExitTime = DateTime.Now.AddDays(-5).AddHours(18)
            },
            new()
            {
                Symbol = "AVAX/USDT", Type = "Long", EntryPrice = 28.50m, ExitPrice = 29.75m, PnL = 1.25m,
                Duration = "1.1 days", EntryTime = DateTime.Now.AddDays(-9),
                ExitTime = DateTime.Now.AddDays(-8).AddHours(2)
            },
            new()
            {
                Symbol = "UNI/USDT", Type = "Short", EntryPrice = 6.85m, ExitPrice = 6.72m, PnL = 0.13m,
                Duration = "0.9 days", EntryTime = DateTime.Now.AddDays(-10),
                ExitTime = DateTime.Now.AddDays(-9).AddHours(2)
            }
        };

        return trades.Take(count).ToList();
    }

    public async Task<List<StrategyPerformance>> GetStrategyPerformanceAsync()
    {
        await Task.Delay(50);

        return
        [
            new StrategyPerformance { Name = "Momentum Breakout", Return = 0.23m, TradeCount = 45 },
            new StrategyPerformance { Name = "Mean Reversion", Return = 0.18m, TradeCount = 38 },
            new StrategyPerformance { Name = "Trend Following", Return = 0.31m, TradeCount = 67 },
            new StrategyPerformance { Name = "Arbitrage", Return = 0.12m, TradeCount = 23 },
            new StrategyPerformance { Name = "Volatility", Return = 0.28m, TradeCount = 52 }
        ];
    }

    public async Task<PerformanceHistory> GetPerformanceHistoryAsync(DateTime startDate, DateTime endDate)
    {
        await Task.Delay(50);

        var history = new List<PerformancePoint>();
        var currentValue = 10000m; // Starting with $10,000
        Random random = new(42); // Fixed seed for consistent demo data

        for (DateTime date = startDate; date <= endDate; date = date.AddDays(1))
        {
            // Simulate daily returns with some volatility
            var dailyReturn = (decimal)(random.NextDouble() * 0.04 - 0.02); // -2% to +2%
            currentValue *= 1 + dailyReturn;

            history.Add(new PerformancePoint
            {
                Date = date,
                Value = currentValue
            });
        }

        return new PerformanceHistory { Points = history };
    }
}