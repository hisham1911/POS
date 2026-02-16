using System.IO;
using System.Text;
using System.Windows;
using Microsoft.Extensions.DependencyInjection;
using KasserPro.BridgeApp.Services;
using KasserPro.BridgeApp.ViewModels;
using Serilog;

namespace KasserPro.BridgeApp;

/// <summary>
/// Main application class with dependency injection
/// </summary>
public partial class App : Application
{
    private ServiceProvider? _serviceProvider;
    private SystemTrayManager? _trayManager;

    protected override async void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        // Register encoding provider for Arabic support
        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

        // Configure Serilog
        ConfigureLogging();

        Log.Information("KasserPro Bridge App starting...");

        // Setup dependency injection
        var services = new ServiceCollection();
        ConfigureServices(services);
        _serviceProvider = services.BuildServiceProvider();

        // Initialize services
        await InitializeServicesAsync();

        // Setup system tray
        _trayManager = _serviceProvider.GetRequiredService<SystemTrayManager>();
        _trayManager.Initialize();

        Log.Information("KasserPro Bridge App started successfully");
    }

    protected override async void OnExit(ExitEventArgs e)
    {
        Log.Information("KasserPro Bridge App shutting down...");

        // Disconnect SignalR
        var signalRClient = _serviceProvider?.GetService<ISignalRClientService>();
        if (signalRClient != null)
        {
            await signalRClient.DisconnectAsync();
        }

        // Cleanup
        _trayManager?.Dispose();
        _serviceProvider?.Dispose();

        Log.Information("KasserPro Bridge App shut down complete");
        Log.CloseAndFlush();

        base.OnExit(e);
    }

    private void ConfigureLogging()
    {
        var logPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "KasserPro",
            "logs",
            "bridge-app.log"
        );

        Directory.CreateDirectory(Path.GetDirectoryName(logPath)!);

        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .WriteTo.File(
                logPath,
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 30,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
            )
            .CreateLogger();
    }

    private void ConfigureServices(ServiceCollection services)
    {
        // Register services
        services.AddSingleton<ISettingsManager, SettingsManager>();
        services.AddSingleton<IPrinterService, PrinterService>();
        services.AddSingleton<ISignalRClientService, SignalRClientService>();
        services.AddSingleton<SystemTrayManager>();
    }

    private async Task InitializeServicesAsync()
    {
        try
        {
            // Initialize printer service
            var printerService = _serviceProvider!.GetRequiredService<IPrinterService>();
            await printerService.InitializeAsync();

            // Connect SignalR client
            var signalRClient = _serviceProvider.GetRequiredService<ISignalRClientService>();

            // Wire up print command handler
            signalRClient.OnPrintCommandReceived += async (sender, args) =>
            {
                Log.Information("Processing print command {CommandId}", args.Command.CommandId);

                var success = await printerService.PrintReceiptAsync(args.Command);

                await signalRClient.SendPrintCompletedAsync(
                    args.Command.CommandId,
                    success,
                    success ? null : "Print failed - check printer status"
                );
            };

            // Attempt to connect
            var connected = await signalRClient.ConnectAsync();
            if (!connected)
            {
                Log.Warning("Failed to connect to backend on startup - will retry automatically");
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Failed to initialize services");
            MessageBox.Show(
                $"Failed to initialize application: {ex.Message}\n\nCheck logs for details.",
                "Initialization Error",
                MessageBoxButton.OK,
                MessageBoxImage.Error
            );
        }
    }
}

