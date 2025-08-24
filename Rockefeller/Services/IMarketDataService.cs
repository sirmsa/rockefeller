using Rockefeller.Models;

namespace Rockefeller.Services;

public interface IMarketDataService
{
    // Real-time Data
    Task<MarketData> GetMarketDataAsync(string symbol);
    Task<OrderBook> GetOrderBookAsync(string symbol, int depth = 20);
    Task<List<PriceHistory>> GetPriceHistoryAsync(string symbol, string timeframe, int count = 100);
    
    // Market Analysis
    Task<MarketDepth> GetMarketDepthAsync(string symbol);
    Task<VolumeAnalysis> GetVolumeAnalysisAsync(string symbol);
    Task<LiquidityAnalysis> GetLiquidityAnalysisAsync(string symbol);
    
    // Price Feeds
    Task<decimal> GetCurrentPriceAsync(string symbol);
    Task<decimal> GetBidPriceAsync(string symbol);
    Task<decimal> GetAskPriceAsync(string symbol);
    Task<decimal> GetLastPriceAsync(string symbol);
    
    // Market Statistics
    Task<MarketStatistics> GetMarketStatisticsAsync(string symbol);
    Task<VolatilityMetrics> GetVolatilityMetricsAsync(string symbol);
    Task<CorrelationMatrix> GetCorrelationMatrixAsync(List<string> symbols);
    
    // Real-time Updates
    Task<IObservable<MarketDataUpdate>> SubscribeToMarketDataAsync(string symbol);
    Task<IObservable<PriceUpdate>> SubscribeToPriceUpdatesAsync(string symbol);
    Task<IObservable<VolumeUpdate>> SubscribeToVolumeUpdatesAsync(string symbol);
}

// Models are now defined in Rockefeller.Models namespace
