using Rockefeller.Models;

namespace Rockefeller.Services;

public class MockTradingService : ITradingService
{
    private readonly List<Trade> _mockTrades;
    private readonly List<Position> _mockPositions;
    private readonly List<TradingStrategy> _mockStrategies;
    private readonly Portfolio _mockPortfolio;
    private readonly RiskMetrics _mockRiskMetrics;

    public MockTradingService()
    {
        // Initialize mock data
        _mockTrades = GenerateMockTrades();
        _mockPositions = GenerateMockPositions();
        _mockStrategies = GenerateMockStrategies();
        _mockPortfolio = GenerateMockPortfolio();
        _mockRiskMetrics = GenerateMockRiskMetrics();
    }

    public async Task<Portfolio> GetPortfolioAsync()
    {
        await Task.Delay(100); // Simulate network delay
        return _mockPortfolio;
    }

    public async Task<List<Position>> GetOpenPositionsAsync()
    {
        await Task.Delay(100);
        return _mockPositions.Where(p => p.Status == "OPEN").ToList();
    }

    public async Task<List<Asset>> GetAssetsAsync()
    {
        await Task.Delay(100);
        return _mockPortfolio.Assets;
    }

    public async Task<List<Trade>> GetTradesAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        await Task.Delay(100);
        var trades = _mockTrades;
        
        if (startDate.HasValue)
            trades = trades.Where(t => t.EntryTime >= startDate.Value).ToList();
        
        if (endDate.HasValue)
            trades = trades.Where(t => t.EntryTime <= endDate.Value).ToList();
        
        return trades;
    }

    public async Task<Trade> GetTradeByIdAsync(string tradeId)
    {
        await Task.Delay(100);
        return _mockTrades.FirstOrDefault(t => t.Id == tradeId) ?? new Trade();
    }

    public async Task<Trade> ExecuteTradeAsync(Trade trade)
    {
        await Task.Delay(200); // Simulate execution time
        trade.Id = Guid.NewGuid().ToString();
        trade.EntryTime = DateTime.UtcNow;
        trade.Status = "OPEN";
        _mockTrades.Add(trade);
        return trade;
    }

    public async Task<bool> ClosePositionAsync(string symbol, string side)
    {
        await Task.Delay(150);
        var position = _mockPositions.FirstOrDefault(p => p.Symbol == symbol && p.Side == side);
        if (position != null)
        {
            position.Status = "CLOSED";
            return true;
        }
        return false;
    }

    public async Task<bool> UpdateStopLossAsync(string symbol, string side, decimal stopLoss)
    {
        await Task.Delay(100);
        var position = _mockPositions.FirstOrDefault(p => p.Symbol == symbol && p.Side == side);
        if (position != null)
        {
            // In a real implementation, this would update the order
            return true;
        }
        return false;
    }

    public async Task<bool> UpdateTakeProfitAsync(string symbol, string side, decimal takeProfit)
    {
        await Task.Delay(100);
        var position = _mockPositions.FirstOrDefault(p => p.Symbol == symbol && p.Side == side);
        if (position != null)
        {
            // In a real implementation, this would update the order
            return true;
        }
        return false;
    }

    public async Task<string> PlaceOrderAsync(string symbol, string side, decimal size, decimal price, string orderType)
    {
        await Task.Delay(200);
        return Guid.NewGuid().ToString();
    }

    public async Task<bool> CancelOrderAsync(string orderId)
    {
        await Task.Delay(100);
        return true;
    }

    public async Task<List<object>> GetOpenOrdersAsync()
    {
        await Task.Delay(100);
        return new List<object>();
    }

    public async Task<RiskMetrics> GetRiskMetricsAsync()
    {
        await Task.Delay(100);
        return _mockRiskMetrics;
    }

    public async Task<bool> CheckRiskLimitsAsync()
    {
        await Task.Delay(100);
        return _mockRiskMetrics.CurrentDailyLoss < _mockRiskMetrics.DailyLossLimit;
    }

    public async Task<bool> TriggerCircuitBreakerAsync()
    {
        await Task.Delay(100);
        _mockRiskMetrics.CircuitBreakerTriggered = true;
        return true;
    }

    public async Task<List<TradingStrategy>> GetStrategiesAsync()
    {
        await Task.Delay(100);
        return _mockStrategies;
    }

    public async Task<TradingStrategy> GetStrategyByIdAsync(string strategyId)
    {
        await Task.Delay(100);
        return _mockStrategies.FirstOrDefault(s => s.Id == strategyId) ?? new TradingStrategy();
    }

    public async Task<TradingStrategy> CreateStrategyAsync(TradingStrategy strategy)
    {
        await Task.Delay(200);
        strategy.Id = Guid.NewGuid().ToString();
        strategy.CreatedAt = DateTime.UtcNow;
        strategy.LastModified = DateTime.UtcNow;
        _mockStrategies.Add(strategy);
        return strategy;
    }

    public async Task<bool> UpdateStrategyAsync(TradingStrategy strategy)
    {
        await Task.Delay(150);
        var existing = _mockStrategies.FirstOrDefault(s => s.Id == strategy.Id);
        if (existing != null)
        {
            existing.LastModified = DateTime.UtcNow;
            return true;
        }
        return false;
    }

    public async Task<bool> DeleteStrategyAsync(string strategyId)
    {
        await Task.Delay(100);
        var strategy = _mockStrategies.FirstOrDefault(s => s.Id == strategyId);
        if (strategy != null)
        {
            _mockStrategies.Remove(strategy);
            return true;
        }
        return false;
    }

    public async Task<bool> ActivateStrategyAsync(string strategyId)
    {
        await Task.Delay(100);
        var strategy = _mockStrategies.FirstOrDefault(s => s.Id == strategyId);
        if (strategy != null)
        {
            strategy.Status = "ACTIVE";
            return true;
        }
        return false;
    }

    public async Task<bool> PauseStrategyAsync(string strategyId)
    {
        await Task.Delay(100);
        var strategy = _mockStrategies.FirstOrDefault(s => s.Id == strategyId);
        if (strategy != null)
        {
            strategy.Status = "PAUSED";
            return true;
        }
        return false;
    }

    private List<Trade> GenerateMockTrades()
    {
        return new List<Trade>
        {
            new Trade
            {
                Id = "1",
                Symbol = "BTC/USDT",
                Type = "BUY",
                Side = "LONG",
                Size = 0.5m,
                EntryPrice = 43250.50m,
                ExitPrice = 44520.75m,
                PnL = 635.13m,
                ROI = 2.94m,
                EntryTime = DateTime.UtcNow.AddDays(-1),
                ExitTime = DateTime.UtcNow.AddHours(-2),
                Status = "CLOSED",
                Strategy = "Momentum Breakout",
                StopLoss = 42800m,
                TakeProfit = 45000m,
                Commission = 2.16m,
                OrderId = "ord_001"
            },
            new Trade
            {
                Id = "2",
                Symbol = "ETH/USDT",
                Type = "SELL",
                Side = "SHORT",
                Size = 2.0m,
                EntryPrice = 2650.75m,
                ExitPrice = 2580.25m,
                PnL = 140.00m,
                ROI = 2.66m,
                EntryTime = DateTime.UtcNow.AddDays(-2),
                ExitTime = DateTime.UtcNow.AddHours(-4),
                Status = "CLOSED",
                Strategy = "Mean Reversion",
                StopLoss = 2680m,
                TakeProfit = 2600m,
                Commission = 1.05m,
                OrderId = "ord_002"
            }
        };
    }

    private List<Position> GenerateMockPositions()
    {
        return new List<Position>
        {
            new Position
            {
                Symbol = "XRP/USDT",
                Side = "LONG",
                Size = 1000m,
                EntryPrice = 3.0233m,
                CurrentPrice = 3.1567m,
                MarkPrice = 3.1567m,
                UnrealizedPnL = 133.40m,
                UnrealizedROI = 4.41m,
                LiquidationPrice = 2.5m,
                Margin = 150m,
                Leverage = 20m,
                EntryTime = DateTime.UtcNow.AddHours(-6),
                Status = "OPEN"
            },
            new Position
            {
                Symbol = "SOL/USDT",
                Side = "LONG",
                Size = 15.0m,
                EntryPrice = 98.50m,
                CurrentPrice = 102.30m,
                MarkPrice = 102.30m,
                UnrealizedPnL = 57.00m,
                UnrealizedROI = 3.86m,
                LiquidationPrice = 85m,
                Margin = 200m,
                Leverage = 15m,
                EntryTime = DateTime.UtcNow.AddHours(-8),
                Status = "OPEN"
            }
        };
    }

    private List<TradingStrategy> GenerateMockStrategies()
    {
        return new List<TradingStrategy>
        {
            new TradingStrategy
            {
                Id = "1",
                Name = "Momentum Breakout",
                Description = "Identifies and trades momentum breakouts with volume confirmation",
                Status = "ACTIVE",
                Symbols = new List<string> { "BTC/USDT", "ETH/USDT", "SOL/USDT" },
                RiskPerTrade = 2.0m,
                MaxPositionSize = 10.0m,
                IsAutomated = true,
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                LastModified = DateTime.UtcNow.AddDays(-5)
            },
            new TradingStrategy
            {
                Id = "2",
                Name = "Mean Reversion",
                Description = "Trades oversold/overbought conditions with RSI confirmation",
                Status = "ACTIVE",
                Symbols = new List<string> { "XRP/USDT", "ADA/USDT", "DOT/USDT" },
                RiskPerTrade = 1.5m,
                MaxPositionSize = 8.0m,
                IsAutomated = true,
                CreatedAt = DateTime.UtcNow.AddDays(-25),
                LastModified = DateTime.UtcNow.AddDays(-3)
            },
            new TradingStrategy
            {
                Id = "3",
                Name = "Trend Following",
                Description = "Follows established trends with moving average confirmation",
                Status = "PAUSED",
                Symbols = new List<string> { "LINK/USDT", "MATIC/USDT" },
                RiskPerTrade = 2.5m,
                MaxPositionSize = 12.0m,
                IsAutomated = false,
                CreatedAt = DateTime.UtcNow.AddDays(-20),
                LastModified = DateTime.UtcNow.AddDays(-1)
            }
        };
    }

    private Portfolio GenerateMockPortfolio()
    {
        return new Portfolio
        {
            Id = "1",
            TotalValue = 125430.50m,
            AvailableBalance = 35998.40m,
            LockedBalance = 89432.10m,
            TotalPnL = 1247.65m,
            TotalROI = 24.7m,
            LastUpdated = DateTime.UtcNow,
            Assets = new List<Asset>
            {
                new Asset { Symbol = "USDT", Free = 35998.40m, Locked = 0m, Total = 35998.40m, Value = 35998.40m, UnrealizedPnL = 0m },
                new Asset { Symbol = "BTC", Free = 0m, Locked = 0.5m, Total = 0.5m, Value = 22260.38m, UnrealizedPnL = 635.13m },
                new Asset { Symbol = "ETH", Free = 0m, Locked = 2.0m, Total = 2.0m, Value = 5160.50m, UnrealizedPnL = 140.00m },
                new Asset { Symbol = "XRP", Free = 0m, Locked = 1000m, Total = 1000m, Value = 3156.70m, UnrealizedPnL = 133.40m },
                new Asset { Symbol = "SOL", Free = 0m, Locked = 15.0m, Total = 15.0m, Value = 1534.50m, UnrealizedPnL = 57.00m }
            }
        };
    }

    private RiskMetrics GenerateMockRiskMetrics()
    {
        return new RiskMetrics
        {
            Id = "1",
            Date = DateTime.UtcNow.Date,
            DailyLossLimit = 1000m,
            CurrentDailyLoss = 0m,
            MaxDrawdown = 8.5m,
            SharpeRatio = 1.42m,
            SortinoRatio = 1.85m,
            CalmarRatio = 2.34m,
            Volatility = 12.3m,
            VaR = 5.2m,
            ExpectedShortfall = 7.8m,
            CircuitBreakerTriggered = false,
            RiskLevel = "LOW"
        };
    }
}
