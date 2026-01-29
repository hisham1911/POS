# Implementation Plan: Desktop Bridge App (MVP)

## Overview

This plan implements a minimal viable product (MVP) of the Desktop Bridge App that connects to the KasserPro backend via SignalR and prints receipts on thermal printers. The implementation focuses on core functionality: connection management, receiving print commands, and executing print jobs.

## Tasks

- [ ] 1. Setup project structure and dependencies
  - Create .NET 8 WPF project named `KasserPro.BridgeApp`
  - Add NuGet packages: Microsoft.AspNetCore.SignalR.Client, ESCPOS.NET, Serilog, System.Text.Json
  - Setup dependency injection container
  - Configure Serilog for file logging to `%AppData%\KasserPro\logs\bridge-app.log`
  - _Requirements: 10.1_

- [ ] 2. Implement Settings Manager
  - [ ] 2.1 Create AppSettings model with DeviceId, BackendUrl, ApiKey, DefaultPrinterName
    - _Requirements: 8.2, 8.4_
  
  - [ ] 2.2 Implement SettingsManager class
    - Create settings file at `%AppData%\KasserPro\settings.json`
    - Implement GetSettingsAsync() to load from file or create defaults
    - Implement SaveSettingsAsync() to persist to JSON
    - Generate unique DeviceId on first run
    - _Requirements: 8.2, 8.4_
  
  - [ ]* 2.3 Write unit tests for SettingsManager
    - Test default settings creation
    - Test settings persistence and loading
    - Test JSON serialization/deserialization
    - _Requirements: 8.2_

- [ ] 3. Implement Printer Service
  - [ ] 3.1 Create ReceiptDto and related DTOs
    - Create ReceiptDto with all required fields (ReceiptNumber, BranchName, Date, Items, NetTotal, TaxAmount, TotalAmount, PaymentMethod, CashierName)
    - Create ReceiptItemDto (Name, Quantity, UnitPrice, TotalPrice)
    - _Requirements: 4.1_
  
  - [ ] 3.2 Implement PrinterService class
    - Implement GetAvailablePrintersAsync() using PrinterSettings.InstalledPrinters
    - Implement GenerateReceiptEscPos() to create ESC/POS byte sequence
    - Format header with branch name (double size, centered)
    - Format items section (left aligned, quantity x price = total)
    - Format totals section (subtotal, tax 14%, bold total)
    - Add barcode at bottom using Code128
    - Implement SendToPrinterAsync() to send raw bytes to Windows printer
    - _Requirements: 3.2, 4.1_
  
  - [ ]* 3.3 Write unit tests for ESC/POS generation
    - Test receipt header formatting
    - Test items section formatting
    - Test totals calculation and formatting
    - Test barcode inclusion
    - _Requirements: 4.1_

- [ ] 4. Implement SignalR Client Service
  - [ ] 4.1 Create DTOs for SignalR communication
    - Create PrintCommandDto (CommandId, Receipt)
    - Create PrintCompletedEventDto (CommandId, Success, ErrorMessage, CompletedAt)
    - _Requirements: 3.2, 3.3_
  
  - [ ] 4.2 Implement SignalRClientService class
    - Build HubConnection with backend URL from settings
    - Add X-API-Key and X-Device-Id headers
    - Configure WithAutomaticReconnect()
    - Register handler for "PrintReceipt" message
    - Implement OnPrintCommandReceived event
    - Implement OnConnectionStateChanged event
    - Implement SendPrintCompletedAsync() to notify backend
    - _Requirements: 1.1, 1.2, 3.2, 3.3_
  
  - [ ]* 4.3 Write unit tests for SignalR client
    - Test connection establishment
    - Test message handler registration
    - Test print completion notification
    - _Requirements: 1.1, 3.3_

- [ ] 5. Wire components together in main application
  - [ ] 5.1 Create main App class with dependency injection
    - Register ISettingsManager, IPrinterService, ISignalRClientService
    - Initialize services on startup
    - Connect SignalR client on startup
    - _Requirements: 1.1_
  
  - [ ] 5.2 Wire print command flow
    - Subscribe to SignalRClient.OnPrintCommandReceived event
    - Call PrinterService.PrintReceiptAsync() when command received
    - Call SignalRClient.SendPrintCompletedAsync() after print attempt
    - Log success/failure with command ID
    - _Requirements: 3.2, 3.3_

- [ ] 6. Implement System Tray UI
  - [ ] 6.1 Create SystemTrayManager class
    - Create NotifyIcon with application icon
    - Set initial text to "KasserPro Bridge - Disconnected"
    - Create context menu with: Settings, Test Print, Exit
    - Subscribe to SignalRClient.OnConnectionStateChanged
    - Update tray icon text on connection state changes
    - Show balloon notifications for connection events
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ] 6.2 Create Settings Window (WPF)
    - Create simple form with fields: Backend URL, API Key, Default Printer
    - Add dropdown to select from available printers
    - Add Save and Cancel buttons
    - Validate URL format before saving
    - Show success/error message after save
    - _Requirements: 8.1, 8.3, 8.4_

- [ ] 7. Implement Backend SignalR Hub
  - [ ] 7.1 Create DeviceHub class in backend
    - Add OnConnectedAsync() to validate X-API-Key header
    - Add OnDisconnectedAsync() to log device disconnection
    - Add PrintCompleted() method to receive completion events from desktop app
    - Track connected devices in static dictionary
    - _Requirements: 2.1, 2.2_
  
  - [ ] 7.2 Create DeviceCommandService in backend
    - Implement SendPrintCommandAsync() to send print commands to all connected devices
    - Use IHubContext<DeviceHub> to invoke "PrintReceipt" on clients
    - Log command sending
    - _Requirements: 3.2_
  
  - [ ] 7.3 Add device hub endpoint to backend startup
    - Map SignalR hub to `/hubs/devices`
    - Configure CORS to allow desktop app connections
    - _Requirements: 1.1_

- [ ] 8. Integration and testing
  - [ ] 8.1 Test end-to-end print flow
    - Start desktop app and verify connection to backend
    - Trigger print command from backend
    - Verify receipt prints on thermal printer
    - Verify print completion notification sent back
    - _Requirements: 3.2, 3.3_
  
  - [ ] 8.2 Test error scenarios
    - Test with invalid API key (should fail to connect)
    - Test with printer not configured (should log error)
    - Test with printer offline (should log error and notify backend)
    - _Requirements: 1.5, 3.4_
  
  - [ ] 8.3 Test reconnection behavior
    - Disconnect network and verify "Disconnected" notification
    - Reconnect network and verify automatic reconnection
    - Verify tray icon updates correctly
    - _Requirements: 1.2, 1.4_

- [ ] 9. Final checkpoint
  - Ensure all tests pass
  - Verify app runs on clean Windows machine
  - Test with actual thermal printer
  - Document any known issues or limitations

## Notes

- Tasks marked with `*` are optional unit tests and can be skipped for faster MVP
- Focus on getting the core print flow working first (tasks 1-5)
- System tray UI (task 6) can be simplified if needed
- Backend integration (task 7) should be done in parallel with desktop app development
- Manual testing with real hardware (task 8) is critical for MVP validation

