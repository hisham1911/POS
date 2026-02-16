using System.Drawing;
using System.IO;
using System.Windows;
using System.Windows.Forms;
using KasserPro.BridgeApp.Services;
using KasserPro.BridgeApp.Views;
using Serilog;
using Application = System.Windows.Application;

namespace KasserPro.BridgeApp.ViewModels;

/// <summary>
/// Manages system tray icon and context menu
/// </summary>
public class SystemTrayManager : IDisposable
{
    private NotifyIcon? _trayIcon;
    private readonly ISignalRClientService _signalRClient;
    private readonly ISettingsManager _settingsManager;
    private readonly IPrinterService _printerService;

    public SystemTrayManager(
        ISignalRClientService signalRClient,
        ISettingsManager settingsManager,
        IPrinterService printerService)
    {
        _signalRClient = signalRClient;
        _settingsManager = settingsManager;
        _printerService = printerService;
    }

    /// <summary>
    /// Initializes system tray icon and menu
    /// </summary>
    public void Initialize()
    {
        _trayIcon = new NotifyIcon
        {
            Icon = SystemIcons.Application,
            Visible = true,
            Text = "KasserPro Bridge - Disconnected"
        };

        _trayIcon.ContextMenuStrip = CreateContextMenu();
        _trayIcon.DoubleClick += OnTrayIconDoubleClick;

        // Subscribe to connection state changes
        _signalRClient.OnConnectionStateChanged += OnConnectionStateChanged;

        // Update initial state
        UpdateConnectionStatus(_signalRClient.IsConnected);

        Log.Information("System tray initialized");
    }

    /// <summary>
    /// Creates context menu for tray icon
    /// </summary>
    private ContextMenuStrip CreateContextMenu()
    {
        var menu = new ContextMenuStrip();

        menu.Items.Add("Settings", null, OnSettingsClick);
        menu.Items.Add("Test Print", null, OnTestPrintClick);
        menu.Items.Add("View Logs", null, OnViewLogsClick);
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add("Exit", null, OnExitClick);

        return menu;
    }

    /// <summary>
    /// Handles connection state changes
    /// </summary>
    private void OnConnectionStateChanged(object? sender, ConnectionStateChangedEventArgs e)
    {
        Application.Current.Dispatcher.Invoke(() =>
        {
            UpdateConnectionStatus(e.IsConnected);
        });
    }

    /// <summary>
    /// Updates tray icon based on connection status
    /// </summary>
    private void UpdateConnectionStatus(bool isConnected)
    {
        if (_trayIcon == null) return;

        if (isConnected)
        {
            _trayIcon.Text = "KasserPro Bridge - Connected";
            _trayIcon.ShowBalloonTip(
                2000,
                "Connected",
                "Successfully connected to backend",
                ToolTipIcon.Info
            );
            Log.Information("UI updated: Connected");
        }
        else
        {
            _trayIcon.Text = "KasserPro Bridge - Disconnected";
            _trayIcon.ShowBalloonTip(
                2000,
                "Disconnected",
                "Connection to backend lost",
                ToolTipIcon.Warning
            );
            Log.Information("UI updated: Disconnected");
        }
    }

    /// <summary>
    /// Handles double-click on tray icon
    /// </summary>
    private void OnTrayIconDoubleClick(object? sender, EventArgs e)
    {
        OnSettingsClick(sender, e);
    }

    /// <summary>
    /// Opens settings window
    /// </summary>
    private void OnSettingsClick(object? sender, EventArgs e)
    {
        try
        {
            var settingsWindow = new SettingsWindow(_settingsManager, _printerService, _signalRClient);
            settingsWindow.ShowDialog();
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Failed to open settings window");
            System.Windows.MessageBox.Show(
                $"Failed to open settings: {ex.Message}",
                "Error",
                MessageBoxButton.OK,
                MessageBoxImage.Error
            );
        }
    }

    /// <summary>
    /// Prints a test receipt
    /// </summary>
    private async void OnTestPrintClick(object? sender, EventArgs e)
    {
        try
        {
            Log.Information("Test print requested");

            var testCommand = new Models.PrintCommandDto
            {
                CommandId = Guid.NewGuid().ToString(),
                Receipt = new Models.ReceiptDto
                {
                    ReceiptNumber = "TEST-001",
                    BranchName = "Test Branch",
                    Date = DateTime.Now,
                    Items = new List<Models.ReceiptItemDto>
                    {
                        new() { Name = "Test Item 1", Quantity = 2, UnitPrice = 10.00m, TotalPrice = 20.00m },
                        new() { Name = "Test Item 2", Quantity = 1, UnitPrice = 15.50m, TotalPrice = 15.50m }
                    },
                    NetTotal = 35.50m,
                    TaxAmount = 4.97m,
                    TotalAmount = 40.47m,
                    PaymentMethod = "Cash",
                    CashierName = "Test User"
                },
                Settings = new Models.ReceiptPrintSettings
                {
                    PaperSize = "80mm",
                    HeaderFontSize = 12,
                    BodyFontSize = 9,
                    TotalFontSize = 11,
                    ShowBranchName = true,
                    ShowCashier = true,
                    ShowThankYou = true,
                    ShowCustomerName = false,
                    ShowLogo = false,
                    TaxRate = 14,
                    IsTaxEnabled = true
                }
            };

            var success = await _printerService.PrintReceiptAsync(testCommand);

            if (success)
            {
                _trayIcon?.ShowBalloonTip(2000, "Test Print", "Test receipt printed successfully", ToolTipIcon.Info);
            }
            else
            {
                _trayIcon?.ShowBalloonTip(2000, "Test Print Failed", "Failed to print test receipt", ToolTipIcon.Error);
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Test print failed");
            System.Windows.MessageBox.Show(
                $"Test print failed: {ex.Message}",
                "Error",
                MessageBoxButton.OK,
                MessageBoxImage.Error
            );
        }
    }

    /// <summary>
    /// Opens log file in default text editor
    /// </summary>
    private void OnViewLogsClick(object? sender, EventArgs e)
    {
        try
        {
            var logPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "KasserPro",
                "logs",
                $"bridge-app{DateTime.Now:yyyyMMdd}.log"
            );

            if (File.Exists(logPath))
            {
                System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                {
                    FileName = logPath,
                    UseShellExecute = true
                });
            }
            else
            {
                System.Windows.MessageBox.Show(
                    "Log file not found",
                    "Information",
                    MessageBoxButton.OK,
                    MessageBoxImage.Information
                );
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Failed to open log file");
            System.Windows.MessageBox.Show(
                $"Failed to open log file: {ex.Message}",
                "Error",
                MessageBoxButton.OK,
                MessageBoxImage.Error
            );
        }
    }

    /// <summary>
    /// Exits the application
    /// </summary>
    private void OnExitClick(object? sender, EventArgs e)
    {
        Log.Information("Exit requested from tray menu");
        Application.Current.Shutdown();
    }

    /// <summary>
    /// Disposes system tray resources
    /// </summary>
    public void Dispose()
    {
        if (_trayIcon != null)
        {
            _trayIcon.Visible = false;
            _trayIcon.Dispose();
        }
    }
}
