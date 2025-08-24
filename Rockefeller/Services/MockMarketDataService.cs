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
        if (_mockMarketData.TryGetValue(symbol, out MarketData? data))
        {
            // Update price with small random variation to simulate real-time data
            data.Last += data.Last * (_random.Next(-50, 51) / 10000.0m);
            data.Timestamp = DateTime.UtcNow;
            return data;
        }
        
        return new MarketData { Symbol = symbol, Last = 0, Timestamp = DateTime.UtcNow };
    }

    public async Task<OrderBook> GetOrderBookAsync(string symbol, int depth = 20)
    {
        await Task.Delay(100);
        var orderBook = new OrderBook
        {
            Symbol = symbol,
            Timestamp = DateTime.UtcNow,
            LastUpdateId = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        };

        // Generate mock bids and asks
        var basePrice = _mockMarketData.GetValueOrDefault(symbol, new MarketData()).Last;
        for (int i = 0; i < depth; i++)
        {
            var bidPrice = basePrice * (1 - (i + 1) * 0.001m);
            var askPrice = basePrice * (1 + (i + 1) * 0.001m);
            var quantity = _random.Next(1, 100);

            orderBook.Bids.Add(new OrderBookEntry
            {
                Price = bidPrice,
                Quantity = quantity,
                TotalValue = bidPrice * quantity,
                CumulativeVolume = orderBook.Bids.Sum(b => b.Quantity) + quantity
            });

            orderBook.Asks.Add(new OrderBookEntry
            {
                Price = askPrice,
                Quantity = quantity,
                TotalValue = askPrice * quantity,
                CumulativeVolume = orderBook.Asks.Sum(a => a.Quantity) + quantity
            });
        }

        orderBook.Spread = orderBook.Asks.First().Price - orderBook.Bids.First().Price;
        orderBook.MidPrice = (orderBook.Bids.First().Price + orderBook.Asks.First().Price) / 2;
        orderBook.BidVolume = orderBook.Bids.Sum(b => b.Quantity);
        orderBook.AskVolume = orderBook.Asks.Sum(a => a.Quantity);
        orderBook.TotalVolume = orderBook.BidVolume + orderBook.AskVolume;

        return orderBook;
    }

    public async Task<List<PriceHistory>> GetPriceHistoryAsync(string symbol, string timeframe, int count = 100)
    {
        await Task.Delay(150);
        var data = new List<PriceHistory>();
        var basePrice = _mockMarketData.GetValueOrDefault(symbol, new MarketData()).Last;
        var currentTime = DateTime.UtcNow;

        for (int i = 0; i < count; i++)
        {
            var variation = (decimal)(_random.NextDouble() - 0.5) * 0.1m; // ±5% variation
            var price = basePrice * (1 + variation);
            var timestamp = timeframe switch
            {
                "1m" => currentTime.AddMinutes(-i),
                "5m" => currentTime.AddMinutes(-i * 5),
                "15m" => currentTime.AddMinutes(-i * 15),
                "1h" => currentTime.AddHours(-i),
                "4h" => currentTime.AddHours(-i * 4),
                "1d" => currentTime.AddDays(-i),
                _ => currentTime.AddHours(-i)
            };

            data.Add(new PriceHistory
            {
                Symbol = symbol,
                Timestamp = timestamp,
                Open = price,
                High = price * (1 + (decimal)(_random.NextDouble() * 0.02)),
                Low = price * (1 - (decimal)(_random.NextDouble() * 0.02)),
                Close = price,
                Volume = _random.Next(1000000, 10000000)
            });
        }

        return data.OrderBy(p => p.Timestamp).ToList();
    }

    public async Task<MarketDepth> GetMarketDepthAsync(string symbol)
    {
        await Task.Delay(100);
        var orderBook = await GetOrderBookAsync(symbol, 10);
        
        return new MarketDepth
        {
            Symbol = symbol,
            Timestamp = DateTime.UtcNow,
            Bids = orderBook.Bids.Select(b => new DepthLevel
            {
                Price = b.Price,
                Quantity = b.Quantity,
                CumulativeVolume = b.CumulativeVolume
            }).ToList(),
            Asks = orderBook.Asks.Select(a => new DepthLevel
            {
                Price = a.Price,
                Quantity = a.Quantity,
                CumulativeVolume = a.CumulativeVolume
            }).ToList(),
            TotalBidVolume = orderBook.BidVolume,
            TotalAskVolume = orderBook.AskVolume
        };
    }

    public async Task<VolumeAnalysis> GetVolumeAnalysisAsync(string symbol)
    {
        await Task.Delay(100);
        var baseVolume = _random.Next(1000000, 10000000);
        var volumeChange = (decimal)(_random.NextDouble() - 0.5) * 0.3m; // ±15% change

        return new VolumeAnalysis
        {
            Symbol = symbol,
            Timestamp = DateTime.UtcNow,
            Volume24h = baseVolume,
            VolumeChange24h = volumeChange * baseVolume,
            AverageVolume = baseVolume * 0.9m,
            VolumeRatio = 1 + volumeChange
        };
    }

    public async Task<LiquidityAnalysis> GetLiquidityAnalysisAsync(string symbol)
    {
        await Task.Delay(100);
        var orderBook = await GetOrderBookAsync(symbol, 5);
        var spread = orderBook.Spread;
        var bidLiquidity = orderBook.Bids.Take(5).Sum(b => b.Quantity * b.Price);
        var askLiquidity = orderBook.Asks.Take(5).Sum(a => a.Quantity * a.Price);

        return new LiquidityAnalysis
        {
            Symbol = symbol,
            Timestamp = DateTime.UtcNow,
            BidLiquidity = bidLiquidity,
            AskLiquidity = askLiquidity,
            Spread = spread,
            LiquidityScore = Math.Min(1.0m, (bidLiquidity + askLiquidity) / 1000000m) // Normalize to 0-1
        };
    }

    public async Task<decimal> GetCurrentPriceAsync(string symbol)
    {
        var marketData = await GetMarketDataAsync(symbol);
        return marketData.Last;
    }

    public async Task<decimal> GetBidPriceAsync(string symbol)
    {
        var orderBook = await GetOrderBookAsync(symbol, 1);
        return orderBook.Bids.FirstOrDefault()?.Price ?? 0;
    }

    public async Task<decimal> GetAskPriceAsync(string symbol)
    {
        var orderBook = await GetOrderBookAsync(symbol, 1);
        return orderBook.Asks.FirstOrDefault()?.Price ?? 0;
    }

    public async Task<decimal> GetLastPriceAsync(string symbol)
    {
        var marketData = await GetMarketDataAsync(symbol);
        return marketData.Last;
    }

    public async Task<MarketStatistics> GetMarketStatisticsAsync(string symbol)
    {
        await Task.Delay(100);
        var marketData = await GetMarketDataAsync(symbol);
        
        return new MarketStatistics
        {
            Symbol = symbol,
            Timestamp = DateTime.UtcNow,
            TotalVolume = marketData.Volume,
            TotalTrades = (int)marketData.NumberOfTrades,
            AverageTradeSize = marketData.Volume / Math.Max(1, marketData.NumberOfTrades),
            PriceChange = marketData.PriceChange,
            PriceChangePercent = marketData.PriceChangePercent
        };
    }

    public async Task<VolatilityMetrics> GetVolatilityMetricsAsync(string symbol)
    {
        await Task.Delay(100);
        var priceHistory = await GetPriceHistoryAsync(symbol, "1h", 24);
        var prices = priceHistory.Select(p => p.Close).ToList();
        var returns = new List<decimal>();
        
        for (int i = 1; i < prices.Count; i++)
        {
            if (prices[i - 1] > 0)
            {
                returns.Add((prices[i] - prices[i - 1]) / prices[i - 1]);
            }
        }

        var volatility = returns.Count > 0 ? (decimal)Math.Sqrt((double)returns.Average(r => r * r)) : 0;
        var highLow = priceHistory.Max(p => p.High) - priceHistory.Min(p => p.Low);
        var averagePrice = priceHistory.Average(p => p.Close);
        var highLowVolatility = averagePrice > 0 ? highLow / averagePrice : 0;

        return new VolatilityMetrics
        {
            Symbol = symbol,
            Timestamp = DateTime.UtcNow,
            HistoricalVolatility = volatility,
            HighLowVolatility = highLowVolatility,
            AverageTrueRange = highLowVolatility * averagePrice,
            VolatilityIndex = volatility * 100
        };
    }

    public async Task<CorrelationMatrix> GetCorrelationMatrixAsync(List<string> symbols)
    {
        await Task.Delay(200);
        var matrix = new CorrelationMatrix
        {
            Symbols = symbols,
            Timestamp = DateTime.UtcNow,
            Matrix = new Dictionary<string, Dictionary<string, decimal>>()
        };

        foreach (var symbol1 in symbols)
        {
            matrix.Matrix[symbol1] = new Dictionary<string, decimal>();
            foreach (var symbol2 in symbols)
            {
                if (symbol1 == symbol2)
                {
                    matrix.Matrix[symbol1][symbol2] = 1.0m;
                }
                else
                {
                    // Generate mock correlation between -0.8 and 0.8
                    matrix.Matrix[symbol1][symbol2] = (decimal)(_random.NextDouble() * 1.6 - 0.8);
                }
            }
        }

        return matrix;
    }

    public Task<IObservable<MarketDataUpdate>> SubscribeToMarketDataAsync(string symbol)
    {
        // Mock observable - in real implementation this would use System.Reactive
        var mockObservable = new MockObservable<MarketDataUpdate>();
        return Task.FromResult<IObservable<MarketDataUpdate>>(mockObservable);
    }

    public Task<IObservable<PriceUpdate>> SubscribeToPriceUpdatesAsync(string symbol)
    {
        // Mock observable - in real implementation this would use System.Reactive
        var mockObservable = new MockObservable<PriceUpdate>();
        return Task.FromResult<IObservable<PriceUpdate>>(mockObservable);
    }

    public Task<IObservable<VolumeUpdate>> SubscribeToVolumeUpdatesAsync(string symbol)
    {
        // Mock observable - in real implementation this would use System.Reactive
        var mockObservable = new MockObservable<VolumeUpdate>();
        return Task.FromResult<IObservable<VolumeUpdate>>(mockObservable);
    }

    public async Task<List<MarketData>> GetMarketDataForSymbolsAsync(List<string> symbols)
    {
        await Task.Delay(100);
        var result = new List<MarketData>();
        
        foreach (var symbol in symbols)
        {
            MarketData data = await GetMarketDataAsync(symbol);
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
            MarketData data = await GetMarketDataAsync(symbol);
            result[symbol] = data;
        }
        
        return result;
    }

    public async Task<List<MarketData>> GetHistoricalDataAsync(string symbol, DateTime startDate, DateTime endDate, string interval = "1h")
    {
        await Task.Delay(200);
        var data = new List<MarketData>();
        DateTime currentDate = startDate;
        var basePrice = _mockMarketData.GetValueOrDefault(symbol, new MarketData()).Last;
        
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

    public async Task<List<object>> GetRecentTradesAsync(string symbol, int limit = 100)
    {
        await Task.Delay(100);
        var trades = new List<object>();
        var currentPrice = (await GetMarketDataAsync(symbol)).Last;
        
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
