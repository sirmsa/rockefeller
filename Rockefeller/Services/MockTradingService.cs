using Rockefeller.Models;

namespace Rockefeller.Services;

public class MockTradingService : ITradingService
{
    private readonly List<RockefellerPosition> _mockPositions;
    private readonly PortfolioSummary _mockPortfolioSummary;
    private readonly Random _random = new Random();
    private bool _isTradingActive = false;
    private bool _isTradingPaused = false;

    public MockTradingService()
    {
        // Initialize mock data
        _mockPositions = GenerateMockPositions();
        _mockPortfolioSummary = GenerateMockPortfolioSummary();
    }

    #region Position Management

    public async Task<bool> OpenPositionAsync(string symbol, string side, decimal size, decimal price, string strategy)
    {
        await Task.Delay(200); // Simulate execution time
        
        var position = new RockefellerPosition
        {
            Id = Guid.NewGuid().ToString(),
            Symbol = symbol,
            Side = side,
            Size = size,
            EntryPrice = price,
            EntryTime = DateTime.UtcNow,
            CurrentPrice = price,
            Status = "OPEN",
            Strategy = strategy,
            EntryConfidence = (decimal)(_random.NextDouble() * 0.4 + 0.6), // 60-100% confidence
            EntryReason = $"AI analysis indicated {side.ToLower()} opportunity with {strategy} strategy"
        };

        _mockPositions.Add(position);
        return true;
    }

    public async Task<bool> ClosePositionAsync(string positionId, decimal price, string reason)
    {
        await Task.Delay(150);
        
        var position = _mockPositions.FirstOrDefault(p => p.Id == positionId);
        if (position != null)
        {
            position.Status = "CLOSED";
            position.CurrentPrice = price;
            return true;
        }
        return false;
    }

    public async Task<bool> UpdatePositionAsync(string positionId, decimal stopLoss, decimal takeProfit)
    {
        await Task.Delay(100);
        
        var position = _mockPositions.FirstOrDefault(p => p.Id == positionId);
        if (position != null)
        {
            position.StopLoss = stopLoss;
            position.TakeProfit = takeProfit;
            return true;
        }
        return false;
    }

    public async Task<bool> ModifyPositionAsync(string positionId, decimal newSize, decimal newPrice)
    {
        await Task.Delay(150);
        
        var position = _mockPositions.FirstOrDefault(p => p.Id == positionId);
        if (position != null)
        {
            position.Size = newSize;
            position.EntryPrice = newPrice;
            return true;
        }
        return false;
    }

    #endregion

    #region Position Queries

    public async Task<List<RockefellerPosition>> GetActivePositionsAsync()
    {
        await Task.Delay(100);
        return _mockPositions.Where(p => p.Status == "OPEN").ToList();
    }

    public async Task<RockefellerPosition?> GetPositionAsync(string positionId)
    {
        await Task.Delay(100);
        return _mockPositions.FirstOrDefault(p => p.Id == positionId);
    }

    public async Task<List<RockefellerPosition>> GetPositionsBySymbolAsync(string symbol)
    {
        await Task.Delay(100);
        return _mockPositions.Where(p => p.Symbol == symbol).ToList();
    }

    public async Task<List<RockefellerPosition>> GetPositionsByStrategyAsync(string strategy)
    {
        await Task.Delay(100);
        return _mockPositions.Where(p => p.Strategy == strategy).ToList();
    }

    #endregion

    #region Risk Management

    public async Task<bool> ValidatePositionAsync(string symbol, decimal size, decimal price)
    {
        await Task.Delay(100);
        
        // Mock validation logic
        if (size <= 0 || price <= 0)
            return false;
            
        if (size > 1000000) // Max position size $1M
            return false;
            
        return true;
    }

    public async Task<RiskAssessment> AssessPositionRiskAsync(string positionId)
    {
        await Task.Delay(150);
        
        var position = _mockPositions.FirstOrDefault(p => p.Id == positionId);
        if (position == null)
            return new RiskAssessment();

        var volatility = (decimal)(_random.NextDouble() * 0.1); // 0-10% volatility
        var riskScore = volatility * 0.7m + (1 - position.EntryConfidence) * 0.3m;

        return new RiskAssessment
        {
            Symbol = position.Symbol,
            Timestamp = DateTime.UtcNow,
            RiskScore = Math.Min(1.0m, riskScore),
            VolatilityRisk = volatility,
            LiquidityRisk = (decimal)(_random.NextDouble() * 0.3),
            MarketRisk = (decimal)(_random.NextDouble() * 0.4),
            RecommendedPositionSize = position.Size * (1 - riskScore),
            MaximumPositionSize = position.Size * 2,
            RiskAdjustedSize = position.Size * (1 - riskScore * 0.5m),
            RecommendedStopLoss = position.EntryPrice * (1 - volatility),
            RecommendedTakeProfit = position.EntryPrice * (1 + volatility * 2),
            MaximumDrawdown = position.Size * volatility,
            RiskLevel = riskScore < 0.3m ? "LOW" : riskScore < 0.6m ? "MEDIUM" : "HIGH",
            RiskTrend = _random.Next(2) == 0 ? "IMPROVING" : "DETERIORATING"
        };
    }

    public async Task<bool> CheckRiskLimitsAsync(string symbol, decimal size)
    {
        await Task.Delay(100);
        
        // Mock risk limit checks
        var totalExposure = _mockPositions
            .Where(p => p.Status == "OPEN")
            .Sum(p => p.Size * p.CurrentPrice);
            
        var maxExposure = 1000000m; // $1M max exposure
        
        return totalExposure + (size * 50000m) <= maxExposure; // Assume $50k price for new position
    }

    #endregion

    #region Trading Control

    public async Task<bool> StartTradingAsync()
    {
        await Task.Delay(200);
        _isTradingActive = true;
        _isTradingPaused = false;
        return true;
    }

    public async Task<bool> StopTradingAsync()
    {
        await Task.Delay(200);
        _isTradingActive = false;
        _isTradingPaused = false;
        return true;
    }

    public async Task<bool> PauseTradingAsync()
    {
        await Task.Delay(200);
        _isTradingPaused = true;
        return true;
    }

    public async Task<TradingStatus> GetTradingStatusAsync()
    {
        await Task.Delay(50);
        
        string status = _isTradingActive 
            ? (_isTradingPaused ? "PAUSED" : "ACTIVE")
            : "STOPPED";
            
        return new TradingStatus
        {
            IsActive = _isTradingActive,
            IsPaused = _isTradingPaused,
            LastUpdate = DateTime.UtcNow,
            Status = status,
            Message = $"Trading is {status.ToLower()}"
        };
    }

    #endregion

    #region Portfolio Management

    public async Task<PortfolioSummary> GetPortfolioSummaryAsync()
    {
        await Task.Delay(100);
        
        // Update portfolio with current position values
        var activePositions = _mockPositions.Where(p => p.Status == "OPEN").ToList();
        var totalValue = 100000m; // Base portfolio value
        var unrealizedPnL = 0m;
        
        foreach (var position in activePositions)
        {
            // Simulate price changes
            var priceChange = (decimal)(_random.NextDouble() - 0.5) * 0.1m; // ±5% change
            position.CurrentPrice = position.EntryPrice * (1 + priceChange);
            
            if (position.Side == "LONG")
            {
                unrealizedPnL += (position.CurrentPrice - position.EntryPrice) * position.Size;
            }
            else
            {
                unrealizedPnL += (position.EntryPrice - position.CurrentPrice) * position.Size;
            }
        }
        
        _mockPortfolioSummary.TotalValue = totalValue + unrealizedPnL;
        _mockPortfolioSummary.UnrealizedPnL = unrealizedPnL;
        _mockPortfolioSummary.TotalPositions = activePositions.Count;
        _mockPortfolioSummary.LongPositions = activePositions.Count(p => p.Side == "LONG");
        _mockPortfolioSummary.ShortPositions = activePositions.Count(p => p.Side == "SHORT");
        
        return _mockPortfolioSummary;
    }

    public async Task<decimal> GetTotalPortfolioValueAsync()
    {
        var summary = await GetPortfolioSummaryAsync();
        return summary.TotalValue;
    }

    public async Task<decimal> GetUnrealizedPnLAsync()
    {
        var summary = await GetPortfolioSummaryAsync();
        return summary.UnrealizedPnL;
    }

    public async Task<decimal> GetRealizedPnLAsync()
    {
        await Task.Delay(100);
        return _mockPortfolioSummary.RealizedPnL;
    }

    #endregion

    #region Mock Data Generation

    private List<RockefellerPosition> GenerateMockPositions()
    {
        var positions = new List<RockefellerPosition>();
        var symbols = new[] { "BTCUSDT", "ETHUSDT", "ADAUSDT", "DOTUSDT" };
        var sides = new[] { "LONG", "SHORT" };
        var strategies = new[] { "Momentum", "Mean Reversion", "Breakout", "Trend Following" };

        for (int i = 0; i < 3; i++)
        {
            var symbol = symbols[_random.Next(symbols.Length)];
            var side = sides[_random.Next(sides.Length)];
            var strategy = strategies[_random.Next(strategies.Length)];
            var size = _random.Next(100, 1000) / 1000m;
            var entryPrice = _random.Next(10000, 100000) / 100m;
            var currentPrice = entryPrice * (1 + (decimal)(_random.NextDouble() - 0.5) * 0.1m);

            positions.Add(new RockefellerPosition
            {
                Id = Guid.NewGuid().ToString(),
                Symbol = symbol,
                Side = side,
                Size = size,
                EntryPrice = entryPrice,
                EntryTime = DateTime.UtcNow.AddDays(-_random.Next(1, 7)),
                CurrentPrice = currentPrice,
                Status = "OPEN",
                Strategy = strategy,
                EntryConfidence = (decimal)(_random.NextDouble() * 0.4 + 0.6),
                EntryReason = $"AI analysis indicated {side.ToLower()} opportunity with {strategy} strategy",
                StopLoss = entryPrice * (1 - 0.02m),
                TakeProfit = entryPrice * (1 + 0.06m)
            });
        }

        return positions;
    }

    private PortfolioSummary GenerateMockPortfolioSummary()
    {
        return new PortfolioSummary
        {
            TotalValue = 100000m,
            CashBalance = 50000m,
            InvestedAmount = 50000m,
            UnrealizedPnL = 2500m,
            RealizedPnL = 1500m,
            TotalPnL = 4000m,
            TotalRisk = 0.15m,
            MaxDrawdown = 0.08m,
            SharpeRatio = 1.2m,
            Volatility = 0.12m,
            TotalPositions = 3,
            LongPositions = 2,
            ShortPositions = 1,
            ProfitablePositions = 2,
            LosingPositions = 1,
            WinRate = 0.67m,
            AverageWin = 0.08m,
            AverageLoss = 0.04m,
            ProfitFactor = 1.8m
        };
    }

    #endregion
}
