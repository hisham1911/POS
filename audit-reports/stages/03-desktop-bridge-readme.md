# Stage 3 — Desktop Bridge App (Code-Proven)

## Scope

- Files reviewed: `src/KasserPro.BridgeApp/*` (App.xaml.cs, Services, PrinterService, SignalR client, SettingsManager).

## Key Facts (from code)

- Technology: WPF .NET (net8.0-windows). Evidence: `src/KasserPro.BridgeApp/KasserPro.BridgeApp.csproj` and `App.xaml.cs`.
- Communication: SignalR client connects to `https://<backend>/hubs/devices` with headers `X-API-Key` and `X-Device-Id` and automatic reconnect configured.
  - Evidence: `src/KasserPro.BridgeApp/Services/SignalRClientService.cs`.
- Printing: `PrinterService` supports both PrintDocument (GDI) for PDF and ESC/POS raw bytes for thermal printers; auto-detection via `IsPdfPrinter`.
  - Evidence: `src/KasserPro.BridgeApp/Services/PrinterService.cs`.
- Settings & logs: Settings saved at `%AppData%\KasserPro\settings.json` and logs to `%AppData%\KasserPro\logs\bridge-app.log` (see `SettingsManager` and `App.xaml.cs`).

## Status

- **Desktop Bridge App audit: COMPLETE** (SignalR wiring and printing logic present and traceable).

## Primary files referenced

- `src/KasserPro.BridgeApp/App.xaml.cs`
- `src/KasserPro.BridgeApp/Services/SignalRClientService.cs`
- `src/KasserPro.BridgeApp/Services/PrinterService.cs`
- `src/KasserPro.BridgeApp/Services/SettingsManager.cs`

---

\_Last updated: Audit run on workspace (code)."
