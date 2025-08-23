using Microsoft.Extensions.Logging;
using MudBlazor.Services;
using Rockefeller.Services;

namespace Rockefeller;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts => { fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular"); });

        builder.Services.AddMauiBlazorWebView();
        
        // Add MudBlazor services
        builder.Services.AddMudServices();
        
        // Add Rockefeller services
        builder.Services.AddScoped<IAnalyticsService, MockAnalyticsService>();
        builder.Services.AddScoped<ITradingService, MockTradingService>();
        builder.Services.AddScoped<IAIService, MockAIService>();
        builder.Services.AddScoped<IMarketDataService, MockMarketDataService>();
        
        // Rockefeller AI Monolith Service
        builder.Services.AddScoped<IRockefellerAIService, RockefellerAIService>();

#if DEBUG
        builder.Services.AddBlazorWebViewDeveloperTools();
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}