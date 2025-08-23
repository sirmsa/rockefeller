using Rockefeller.Models;

namespace Rockefeller.Services;

public class MockAIService : IAIService
{
    private readonly Random _random = new Random();
    private readonly Dictionary<string, List<AIInsight>> _mockInsights;

    public MockAIService()
    {
        _mockInsights = GenerateMockInsights();
    }

    public async Task<List<AIInsight>> AnalyzeNewsSentimentAsync(string symbol, DateTime? since = null)
    {
        await Task.Delay(150);
        var insights = _mockInsights.GetValueOrDefault(symbol, new List<AIInsight>())
            .Where(i => i.Type == "NEWS")
            .ToList();

        if (since.HasValue)
            insights = insights.Where(i => i.Timestamp >= since.Value).ToList();

        return insights;
    }

    public async Task<double> GetNewsSentimentScoreAsync(string symbol)
    {
        await Task.Delay(100);
        var newsInsights = await AnalyzeNewsSentimentAsync(symbol);
        if (!newsInsights.Any()) return 0.0;
        
        return newsInsights.Average(i => i.SentimentScore);
    }

    public async Task<List<AIInsight>> AnalyzeSocialMediaAsync(string symbol, string platform, DateTime? since = null)
    {
        await Task.Delay(120);
        var insights = _mockInsights.GetValueOrDefault(symbol, new List<AIInsight>())
            .Where(i => i.Type == "SOCIAL" && i.Source == platform)
            .ToList();

        if (since.HasValue)
            insights = insights.Where(i => i.Timestamp >= since.Value).ToList();

        return insights;
    }

    public async Task<double> GetSocialMediaSentimentAsync(string symbol, string platform)
    {
        await Task.Delay(100);
        var socialInsights = await AnalyzeSocialMediaAsync(symbol, platform);
        if (!socialInsights.Any()) return 0.0;
        
        return socialInsights.Average(i => i.SentimentScore);
    }

    public async Task<List<string>> GetTrendingTopicsAsync(string platform)
    {
        await Task.Delay(100);
        return platform switch
        {
            "Twitter" => ["#Bitcoin", "#Ethereum", "#Crypto", "#DeFi", "#NFTs"],
            "Reddit" => ["r/CryptoCurrency", "r/Bitcoin", "r/Ethereum", "r/DeFi"],
            _ => ["#Crypto", "#Trading", "#Blockchain"]
        };
    }

    public async Task<Dictionary<string, object>> GetTechnicalIndicatorsAsync(string symbol)
    {
        await Task.Delay(100);
        return new Dictionary<string, object>
        {
            ["RSI"] = _random.Next(20, 80),
            ["MACD"] = _random.Next(-50, 50),
            ["BollingerBands"] = new { Upper = 1.05, Middle = 1.0, Lower = 0.95 },
            ["MovingAverages"] = new { SMA20 = 1.02, SMA50 = 0.98, SMA200 = 0.95 },
            ["Volume"] = _random.Next(1000000, 10000000),
            ["Volatility"] = _random.Next(10, 30) / 100.0
        };
    }

    public async Task<double> GetTechnicalScoreAsync(string symbol)
    {
        await Task.Delay(100);
        var indicators = await GetTechnicalIndicatorsAsync(symbol);
        
        // Mock technical score calculation
        var rsi = Convert.ToDouble(indicators["RSI"]);
        var macd = Convert.ToDouble(indicators["MACD"]);
        var volatility = Convert.ToDouble(indicators["Volatility"]);
        
        var score = (rsi - 50) / 50.0 * 0.4 + 
                   Math.Sign(macd) * 0.3 + 
                   (1.0 - volatility) * 0.3;
        
        return Math.Max(-1.0, Math.Min(1.0, score));
    }

    public async Task<List<string>> GetTechnicalSignalsAsync(string symbol)
    {
        await Task.Delay(100);
        var technicalScore = await GetTechnicalScoreAsync(symbol);
        var signals = new List<string>();
        
        if (technicalScore > 0.7)
            signals.Add("STRONG_BUY");
        else if (technicalScore > 0.3)
            signals.Add("BUY");
        else if (technicalScore < -0.7)
            signals.Add("STRONG_SELL");
        else if (technicalScore < -0.3)
            signals.Add("SELL");
        else
            signals.Add("NEUTRAL");
            
        return signals;
    }

    public async Task<double> GetMarketSentimentAsync(string symbol)
    {
        await Task.Delay(100);
        var newsSentiment = await GetNewsSentimentScoreAsync(symbol);
        var technicalScore = await GetTechnicalScoreAsync(symbol);
        var socialSentiment = await GetSocialMediaSentimentAsync(symbol, "Twitter");
        
        // Weighted average of different sentiment sources
        return (newsSentiment * 0.4 + technicalScore * 0.3 + socialSentiment * 0.3);
    }

    public async Task<Dictionary<string, double>> GetMarketSentimentBySourceAsync(string symbol)
    {
        await Task.Delay(100);
        return new Dictionary<string, double>
        {
            ["News"] = await GetNewsSentimentScoreAsync(symbol),
            ["Technical"] = await GetTechnicalScoreAsync(symbol),
            ["Social"] = await GetSocialMediaSentimentAsync(symbol, "Twitter"),
            ["Reddit"] = await GetSocialMediaSentimentAsync(symbol, "Reddit"),
            ["Overall"] = await GetMarketSentimentAsync(symbol)
        };
    }

    public async Task<List<AIInsight>> GenerateTradingSignalsAsync(string symbol)
    {
        await Task.Delay(200);
        var marketSentiment = await GetMarketSentimentAsync(symbol);
        var technicalSignals = await GetTechnicalSignalsAsync(symbol);
        var newsInsights = await AnalyzeNewsSentimentAsync(symbol);
        var socialInsights = await AnalyzeSocialMediaAsync(symbol, "Twitter");
        
        var signals = new List<AIInsight>();
        
        // Generate signal based on market sentiment
        if (marketSentiment > 0.6)
        {
            signals.Add(new AIInsight
            {
                Id = Guid.NewGuid().ToString(),
                Type = "SIGNAL",
                Source = "AI_ENGINE",
                Content = "Strong bullish sentiment detected across all sources",
                SentimentScore = marketSentiment,
                Confidence = 0.85,
                Timestamp = DateTime.UtcNow,
                Impact = "HIGH"
            });
        }
        else if (marketSentiment < -0.6)
        {
            signals.Add(new AIInsight
            {
                Id = Guid.NewGuid().ToString(),
                Type = "SIGNAL",
                Source = "AI_ENGINE",
                Content = "Strong bearish sentiment detected across all sources",
                SentimentScore = marketSentiment,
                Confidence = 0.82,
                Timestamp = DateTime.UtcNow,
                Impact = "HIGH"
            });
        }
        
        // Add technical analysis insights
        if (technicalSignals.Contains("STRONG_BUY") || technicalSignals.Contains("STRONG_SELL"))
        {
            signals.Add(new AIInsight
            {
                Id = Guid.NewGuid().ToString(),
                Type = "TECHNICAL",
                Source = "AI_ENGINE",
                Content = $"Technical analysis indicates {technicalSignals.First()} signal",
                SentimentScore = technicalSignals.Contains("STRONG_BUY") ? 0.8 : -0.8,
                Confidence = 0.78,
                Timestamp = DateTime.UtcNow,
                Impact = "MEDIUM"
            });
        }
        
        return signals;
    }

    public async Task<double> GetSignalConfidenceAsync(string symbol, string signalType)
    {
        await Task.Delay(100);
        var signals = await GenerateTradingSignalsAsync(symbol);
        var relevantSignal = signals.FirstOrDefault(s => s.Content.Contains(signalType));
        
        return relevantSignal?.Confidence ?? 0.0;
    }

    public async Task<string> GetSignalReasoningAsync(string symbol, string signalType)
    {
        await Task.Delay(100);
        var marketSentiment = await GetMarketSentimentAsync(symbol);
        var technicalScore = await GetTechnicalScoreAsync(symbol);
        
        return $"Signal based on market sentiment ({marketSentiment:F2}) and technical analysis ({technicalScore:F2})";
    }

    public async Task<bool> UpdateAIModelAsync(string modelType)
    {
        await Task.Delay(500);
        return true;
    }

    public async Task<Dictionary<string, object>> GetAIModelMetricsAsync()
    {
        await Task.Delay(100);
        return new Dictionary<string, object>
        {
            ["NewsSentimentAccuracy"] = 0.87,
            ["SocialMediaAccuracy"] = 0.79,
            ["TechnicalAnalysisAccuracy"] = 0.82,
            ["OverallAccuracy"] = 0.83,
            ["LastTrainingDate"] = DateTime.UtcNow.AddDays(-7),
            ["ModelVersion"] = "v2.1.0"
        };
    }

    public async Task<bool> RetrainModelAsync(string modelType)
    {
        await Task.Delay(1000);
        return true;
    }

    public async Task<List<AIInsight>> GetHistoricalInsightsAsync(string symbol, DateTime startDate, DateTime endDate)
    {
        await Task.Delay(150);
        var insights = _mockInsights.GetValueOrDefault(symbol, new List<AIInsight>())
            .Where(i => i.Timestamp >= startDate && i.Timestamp <= endDate)
            .ToList();
        
        return insights;
    }

    public async Task<double> GetInsightAccuracyAsync(string symbol, DateTime startDate, DateTime endDate)
    {
        await Task.Delay(100);
        var historicalInsights = await GetHistoricalInsightsAsync(symbol, startDate, endDate);
        
        if (!historicalInsights.Any()) return 0.0;
        
        // Mock accuracy calculation based on sentiment consistency
        var positiveInsights = historicalInsights.Count(i => i.SentimentScore > 0.3);
        var negativeInsights = historicalInsights.Count(i => i.SentimentScore < -0.3);
        var totalInsights = historicalInsights.Count;
        
        if (totalInsights == 0) return 0.0;
        
        var consistency = Math.Max(positiveInsights, negativeInsights) / (double)totalInsights;
        return 0.7 + (consistency * 0.3); // Base accuracy + consistency bonus
    }

    private Dictionary<string, List<AIInsight>> GenerateMockInsights()
    {
        var insights = new Dictionary<string, List<AIInsight>>();
        var symbols = new List<string> { "BTC/USDT", "ETH/USDT", "XRP/USDT", "SOL/USDT", "ADA/USDT" };
        
        foreach (var symbol in symbols)
        {
            var symbolInsights = new List<AIInsight>();
            
            // News insights
            for (int i = 0; i < 5; i++)
            {
                symbolInsights.Add(new AIInsight
                {
                    Id = Guid.NewGuid().ToString(),
                    Type = "NEWS",
                    Source = "NewsAPI",
                    Content = GetRandomNewsContent(symbol),
                    SentimentScore = _random.Next(-100, 101) / 100.0,
                    Confidence = _random.Next(60, 96) / 100.0,
                    Timestamp = DateTime.UtcNow.AddHours(-_random.Next(1, 25)),
                    Impact = _random.Next(0, 3) switch { 0 => "LOW", 1 => "MEDIUM", _ => "HIGH" }
                });
            }
            
            // Social media insights
            for (int i = 0; i < 8; i++)
            {
                symbolInsights.Add(new AIInsight
                {
                    Id = Guid.NewGuid().ToString(),
                    Type = "SOCIAL",
                    Source = _random.Next(0, 2) == 0 ? "Twitter" : "Reddit",
                    Content = GetRandomSocialContent(symbol),
                    SentimentScore = _random.Next(-100, 101) / 100.0,
                    Confidence = _random.Next(50, 91) / 100.0,
                    Timestamp = DateTime.UtcNow.AddHours(-_random.Next(1, 13)),
                    Impact = _random.Next(0, 3) switch { 0 => "LOW", 1 => "MEDIUM", _ => "HIGH" }
                });
            }
            
            // Technical insights
            for (int i = 0; i < 3; i++)
            {
                symbolInsights.Add(new AIInsight
                {
                    Id = Guid.NewGuid().ToString(),
                    Type = "TECHNICAL",
                    Source = "TechnicalAnalysis",
                    Content = GetRandomTechnicalContent(symbol),
                    SentimentScore = _random.Next(-100, 101) / 100.0,
                    Confidence = _random.Next(70, 96) / 100.0,
                    Timestamp = DateTime.UtcNow.AddHours(-_random.Next(1, 7)),
                    Impact = "MEDIUM"
                });
            }
            
            insights[symbol] = symbolInsights;
        }
        
        return insights;
    }

    private string GetRandomNewsContent(string symbol)
    {
        var newsTemplates = new[]
        {
            $"Institutional adoption of {symbol} continues to grow",
            $"Regulatory clarity boosts {symbol} market confidence",
            $"New partnership announcement for {symbol} ecosystem",
            $"Market volatility affects {symbol} trading volume",
            $"Technical breakthrough in {symbol} blockchain technology"
        };
        
        return newsTemplates[_random.Next(newsTemplates.Length)];
    }

    private string GetRandomSocialContent(string symbol)
    {
        var socialTemplates = new[]
        {
            $"Bullish sentiment for {symbol} on social media",
            $"Community discussions about {symbol} future potential",
            $"Mixed opinions on {symbol} current market position",
            $"FOMO driving {symbol} price action",
            $"Technical analysis discussions for {symbol}"
        };
        
        return socialTemplates[_random.Next(socialTemplates.Length)];
    }

    private string GetRandomTechnicalContent(string symbol)
    {
        var technicalTemplates = new[]
        {
            $"RSI indicates oversold conditions for {symbol}",
            $"MACD shows bullish crossover for {symbol}",
            $"Bollinger Bands suggest breakout potential for {symbol}",
            $"Moving averages align favorably for {symbol}",
            $"Volume analysis confirms trend for {symbol}"
        };
        
        return technicalTemplates[_random.Next(technicalTemplates.Length)];
    }
}
