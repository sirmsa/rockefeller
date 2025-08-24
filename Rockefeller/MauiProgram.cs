using Microsoft.Extensions.Logging;
using MudBlazor.Services;
using Rockefeller.Services;

namespace Rockefeller;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("Starting Rockefeller MAUI app initialization...");
            
            MauiAppBuilder builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts => { fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular"); });

            // Configure comprehensive logging for Blazor
            builder.Logging.AddDebug();
            builder.Logging.SetMinimumLevel(LogLevel.Trace);

            System.Diagnostics.Debug.WriteLine("Adding MAUI Blazor WebView...");
            builder.Services.AddMauiBlazorWebView();
            
            System.Diagnostics.Debug.WriteLine("Adding MudBlazor services...");
            builder.Services.AddMudServices();
            
            // Add Rockefeller services with error handling
            builder.Services.AddScoped<IAnalyticsService, MockAnalyticsService>();
            builder.Services.AddScoped<ITradingService, MockTradingService>();
            builder.Services.AddScoped<IAIService, MockAIService>();
            builder.Services.AddScoped<IMarketDataService, MockMarketDataService>();
            builder.Services.AddScoped<IRockefellerAIService, RockefellerAIService>();
            builder.Services.AddScoped<IDataStorageService, MockDataStorageService>();
            builder.Services.AddScoped<INotificationService, MockNotificationService>();
            builder.Services.AddScoped<IRiskManagementService, MockRiskManagementService>();
#if DEBUG
            // Add specific logging for Blazor components
            builder.Logging.AddFilter("Microsoft.AspNetCore.Components", LogLevel.Debug);
            builder.Logging.AddFilter("Microsoft.AspNetCore.Components.WebView", LogLevel.Debug);
            builder.Logging.AddFilter("Microsoft.AspNetCore.Components.Rendering", LogLevel.Debug);
            builder.Logging.AddFilter("Microsoft.AspNetCore.Components.RenderTree", LogLevel.Debug);
            builder.Logging.AddFilter("Microsoft.AspNetCore.Hosting", LogLevel.Debug);
            builder.Logging.AddFilter("Microsoft.Maui.Hosting", LogLevel.Debug);
            builder.Services.AddBlazorWebViewDeveloperTools();
            builder.Logging.AddDebug();
#endif
            MauiApp app = builder.Build();
            return app;
        }
        catch (Exception ex)
        {
            // Log startup errors
            System.Diagnostics.Debug.WriteLine($"Critical error during app startup: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
            
            // Re-throw to prevent silent failures
            throw;
        }
    }
}