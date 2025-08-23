using Rockefeller.Models;

namespace Rockefeller.Services;

public class MockMarketDataService : IMarketDataService
{
    private readonly Random _random = new Random();
    private readonly Dictionary<string, MarketData> _mockMarketData;
    private readonly List<string> _subscribedSymbols;

    public MockMarketDataService()
    {
        _mockMarketData = GenerateMockMarketData();
        _subscribedSymbols = ["BTC/USDT", "ETH/USDT", "XRP/USDT", "SOL/USDT", "ADA/USDT"];
    }

    public async Task<MarketData> GetMarketDataAsync(string symbol)
    {
        await Task.Delay(50);
        if (_mockMarketData.TryGetValue(symbol, out var data))
        {
            // Update price with small random variation to simulate real-time data
            data.Price += data.Price * (_random.Next(-50, 51) / 10000.0m);
            data.Timestamp = DateTime.UtcNow;
            return data;
        }
        
        return new MarketData { Symbol = symbol, Price = 0, Timestamp = DateTime.UtcNow };
    }

    public async Task<List<MarketData>> GetMarketDataForSymbolsAsync(List<string> symbols)
    {
        await Task.Delay(100);
        var result = new List<MarketData>();
        
        foreach (var symbol in symbols)
        {
            var data = await GetMarketDataAsync(symbol);
            result.Add(data);
        }
        
        return result;
    }

    public async Task<Dictionary<string, MarketData>> GetAllMarketDataAsync()
    {
        await Task.Delay(150);
        var result = new Dictionary<string, MarketData>();
        
        foreach (var symbol in _subscribedSymbols)
        {
            var data = await GetMarketDataAsync(symbol);
            result[symbol] = data;
        }
        
        return result;
    }

    public async Task<List<MarketData>> GetHistoricalDataAsync(string symbol, DateTime startDate, DateTime endDate, string interval = "1h")
    {
        await Task.Delay(200);
        var data = new List<MarketData>();
        var currentDate = startDate;
        var basePrice = _mockMarketData.GetValueOrDefault(symbol, new MarketData()).Price;
        
        while (currentDate <= endDate)
        {
            var variation = (decimal)(_random.NextDouble() - 0.5) * 0.1m; // ±5% variation
            var price = basePrice * (1 + variation);
            
            data.Add(new MarketData
            {
                Symbol = symbol,
                Price = price,
                Volume24h = _random.Next(1000000, 10000000),
                Change24h = price - basePrice,
                ChangePercent24h = variation * 100,
                High24h = price * (1 + (decimal)(_random.NextDouble() * 0.05)),
                Low24h = price * (1 - (decimal)(_random.NextDouble() * 0.05)),
                Timestamp = currentDate,
                TechnicalIndicators = GenerateTechnicalIndicators()
            });
            
            currentDate = interval switch
            {
                "1m" => currentDate.AddMinutes(1),
                "5m" => currentDate.AddMinutes(5),
                "15m" => currentDate.AddMinutes(15),
                "1h" => currentDate.AddHours(1),
                "4h" => currentDate.AddHours(4),
                "1d" => currentDate.AddDays(1),
                _ => currentDate.AddHours(1)
            };
        }
        
        return data;
    }

    public async Task<List<decimal>> GetPriceHistoryAsync(string symbol, DateTime startDate, DateTime endDate, string interval = "1h")
    {
        await Task.Delay(150);
        var historicalData = await GetHistoricalDataAsync(symbol, startDate, endDate, interval);
        return historicalData.Select(d => d.Price).ToList();
    }

    public async Task<Dictionary<string, object>> GetRSIAsync(string symbol, int period = 14)
    {
        await Task.Delay(50);
        var rsiValue = _random.Next(20, 81);
        return new Dictionary<string, object>
        {
            ["value"] = rsiValue,
            ["period"] = period,
            ["overbought"] = 70,
            ["oversold"] = 30,
            ["status"] = rsiValue > 70 ? "OVERBOUGHT" : rsiValue < 30 ? "OVERSOLD" : "NEUTRAL"
        };
    }

    public async Task<Dictionary<string, object>> GetMACDAsync(string symbol)
    {
        await Task.Delay(50);
        var macd = _random.Next(-50, 51);
        var signal = _random.Next(-30, 31);
        var histogram = macd - signal;
        
        return new Dictionary<string, object>
        {
            ["macd"] = macd,
            ["signal"] = signal,
            ["histogram"] = histogram,
            ["crossover"] = histogram > 0 ? "BULLISH" : "BEARISH"
        };
    }

    public async Task<Dictionary<string, object>> GetBollingerBandsAsync(string symbol, int period = 20)
    {
        await Task.Delay(50);
        var currentPrice = (await GetMarketDataAsync(symbol)).Price;
        var upper = currentPrice * 1.05m;
        var middle = currentPrice;
        var lower = currentPrice * 0.95m;
        
        return new Dictionary<string, object>
        {
            ["upper"] = upper,
            ["middle"] = middle,
            ["lower"] = lower,
            ["width"] = (upper - lower) / middle,
            ["position"] = currentPrice > upper ? "ABOVE" : currentPrice < lower ? "BELOW" : "INSIDE"
        };
    }

    public async Task<Dictionary<string, object>> GetMovingAveragesAsync(string symbol, List<int> periods)
    {
        await Task.Delay(50);
        var currentPrice = (await GetMarketDataAsync(symbol)).Price;
        var result = new Dictionary<string, object>();
        
        foreach (var period in periods)
        {
            var variation = (decimal)(_random.NextDouble() - 0.5) * 0.02m; // ±1% variation
            result[$"SMA{period}"] = currentPrice * (1 + variation);
        }
        
        return result;
    }

    public async Task<decimal> Get24hVolumeAsync(string symbol)
    {
        await Task.Delay(50);
        return _mockMarketData.GetValueOrDefault(symbol, new MarketData()).Volume24h;
    }

    public async Task<decimal> Get24hChangeAsync(string symbol)
    {
        await Task.Delay(50);
        return _mockMarketData.GetValueOrDefault(symbol, new MarketData()).Change24h;
    }

    public async Task<decimal> Get24hHighAsync(string symbol)
    {
        await Task.Delay(50);
        return _mockMarketData.GetValueOrDefault(symbol, new MarketData()).High24h;
    }

    public async Task<decimal> Get24hLowAsync(string symbol)
    {
        await Task.Delay(50);
        return _mockMarketData.GetValueOrDefault(symbol, new MarketData()).Low24h;
    }

    public async Task<Dictionary<string, object>> GetOrderBookAsync(string symbol, int depth = 20)
    {
        await Task.Delay(100);
        var currentPrice = (await GetMarketDataAsync(symbol)).Price;
        var bids = new List<object>();
        var asks = new List<object>();
        
        // Generate mock order book
        for (int i = 0; i < depth; i++)
        {
            var bidPrice = currentPrice * (1 - (i + 1) * 0.001m);
            var askPrice = currentPrice * (1 + (i + 1) * 0.001m);
            
            bids.Add(new { price = bidPrice, quantity = _random.Next(100, 10000) / 1000.0m });
            asks.Add(new { price = askPrice, quantity = _random.Next(100, 10000) / 1000.0m });
        }
        
        return new Dictionary<string, object>
        {
            ["symbol"] = symbol,
            ["timestamp"] = DateTime.UtcNow,
            ["bids"] = bids,
            ["asks"] = asks,
            ["spread"] = 0.001m // Mock spread value
        };
    }

    public async Task<List<object>> GetRecentTradesAsync(string symbol, int limit = 100)
    {
        await Task.Delay(100);
        var trades = new List<object>();
        var currentPrice = (await GetMarketDataAsync(symbol)).Price;
        
        for (int i = 0; i < limit; i++)
        {
            var price = currentPrice * (1 + (decimal)(_random.NextDouble() - 0.5) * 0.01m);
            var quantity = _random.Next(100, 10000) / 1000.0m;
            var side = _random.Next(0, 2) == 0 ? "BUY" : "SELL";
            
            trades.Add(new
            {
                price = price,
                quantity = quantity,
                side = side,
                timestamp = DateTime.UtcNow.AddMinutes(-_random.Next(0, 60))
            });
        }
        
        return trades.OrderByDescending(t => t.GetType().GetProperty("timestamp")?.GetValue(t)).ToList();
    }

    public async Task<bool> IsMarketOpenAsync(string symbol)
    {
        await Task.Delay(50);
        // Crypto markets are always open
        return true;
    }

    public async Task<DateTime> GetMarketOpenTimeAsync(string symbol)
    {
        await Task.Delay(50);
        // Crypto markets never close
        return DateTime.MinValue;
    }

    public async Task<DateTime> GetMarketCloseTimeAsync(string symbol)
    {
        await Task.Delay(50);
        // Crypto markets never close
        return DateTime.MaxValue;
    }

    public async Task<bool> SubscribeToSymbolAsync(string symbol)
    {
        await Task.Delay(50);
        if (!_subscribedSymbols.Contains(symbol))
        {
            _subscribedSymbols.Add(symbol);
        }
        return true;
    }

    public async Task<bool> UnsubscribeFromSymbolAsync(string symbol)
    {
        await Task.Delay(50);
        return _subscribedSymbols.Remove(symbol);
    }

    public async Task<List<string>> GetSubscribedSymbolsAsync()
    {
        await Task.Delay(50);
        return _subscribedSymbols.ToList();
    }

    private Dictionary<string, MarketData> GenerateMockMarketData()
    {
        return new Dictionary<string, MarketData>
        {
            ["BTC/USDT"] = new MarketData
            {
                Symbol = "BTC/USDT",
                Price = 44520.75m,
                Volume24h = 2847500000m,
                Change24h = 1270.25m,
                ChangePercent24h = 2.94m,
                High24h = 44800.00m,
                Low24h = 43250.50m,
                Timestamp = DateTime.UtcNow,
                TechnicalIndicators = GenerateTechnicalIndicators()
            },
            ["ETH/USDT"] = new MarketData
            {
                Symbol = "ETH/USDT",
                Price = 2580.25m,
                Volume24h = 1850000000m,
                Change24h = -70.50m,
                ChangePercent24h = -2.66m,
                High24h = 2680.00m,
                Low24h = 2580.25m,
                Timestamp = DateTime.UtcNow,
                TechnicalIndicators = GenerateTechnicalIndicators()
            },
            ["XRP/USDT"] = new MarketData
            {
                Symbol = "XRP/USDT",
                Price = 3.1567m,
                Volume24h = 1250000000m,
                Change24h = 0.1334m,
                ChangePercent24h = 4.41m,
                High24h = 3.2000m,
                Low24h = 3.0233m,
                Timestamp = DateTime.UtcNow,
                TechnicalIndicators = GenerateTechnicalIndicators()
            },
            ["SOL/USDT"] = new MarketData
            {
                Symbol = "SOL/USDT",
                Price = 102.30m,
                Volume24h = 850000000m,
                Change24h = 3.80m,
                ChangePercent24h = 3.86m,
                High24h = 105.00m,
                Low24h = 98.50m,
                Timestamp = DateTime.UtcNow,
                TechnicalIndicators = GenerateTechnicalIndicators()
            },
            ["ADA/USDT"] = new MarketData
            {
                Symbol = "ADA/USDT",
                Price = 0.4850m,
                Volume24h = 650000000m,
                Change24h = 0.0150m,
                ChangePercent24h = 3.19m,
                High24h = 0.4900m,
                Low24h = 0.4700m,
                Timestamp = DateTime.UtcNow,
                TechnicalIndicators = GenerateTechnicalIndicators()
            }
        };
    }

    private Dictionary<string, object> GenerateTechnicalIndicators()
    {
        return new Dictionary<string, object>
        {
            ["RSI"] = _random.Next(20, 81),
            ["MACD"] = _random.Next(-50, 51),
            ["BollingerBands"] = new { Upper = 1.05, Middle = 1.0, Lower = 0.95 },
            ["MovingAverages"] = new { SMA20 = 1.02, SMA50 = 0.98, SMA200 = 0.95 },
            ["Volume"] = _random.Next(1000000, 10000000),
            ["Volatility"] = _random.Next(10, 30) / 100.0
        };
    }
}
