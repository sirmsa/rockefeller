using Rockefeller.Models;

namespace Rockefeller.Services;

public interface IMarketDataService
{
    // Real-time Market Data
    Task<MarketData> GetMarketDataAsync(string symbol);
    Task<List<MarketData>> GetMarketDataForSymbolsAsync(List<string> symbols);
    Task<Dictionary<string, MarketData>> GetAllMarketDataAsync();
    
    // Historical Data
    Task<List<MarketData>> GetHistoricalDataAsync(string symbol, DateTime startDate, DateTime endDate, string interval = "1h");
    Task<List<decimal>> GetPriceHistoryAsync(string symbol, DateTime startDate, DateTime endDate, string interval = "1h");
    
    // Technical Indicators
    Task<Dictionary<string, object>> GetRSIAsync(string symbol, int period = 14);
    Task<Dictionary<string, object>> GetMACDAsync(string symbol);
    Task<Dictionary<string, object>> GetBollingerBandsAsync(string symbol, int period = 20);
    Task<Dictionary<string, object>> GetMovingAveragesAsync(string symbol, List<int> periods);
    
    // Market Statistics
    Task<decimal> Get24hVolumeAsync(string symbol);
    Task<decimal> Get24hChangeAsync(string symbol);
    Task<decimal> Get24hHighAsync(string symbol);
    Task<decimal> Get24hLowAsync(string symbol);
    
    // Order Book
    Task<Dictionary<string, object>> GetOrderBookAsync(string symbol, int depth = 20);
    Task<List<object>> GetRecentTradesAsync(string symbol, int limit = 100);
    
    // Market Status
    Task<bool> IsMarketOpenAsync(string symbol);
    Task<DateTime> GetMarketOpenTimeAsync(string symbol);
    Task<DateTime> GetMarketCloseTimeAsync(string symbol);
    
    // Subscription Management
    Task<bool> SubscribeToSymbolAsync(string symbol);
    Task<bool> UnsubscribeFromSymbolAsync(string symbol);
    Task<List<string>> GetSubscribedSymbolsAsync();
}
