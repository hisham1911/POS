# Requirements Document: Desktop Bridge App

## Introduction

The Desktop Bridge App is a .NET WPF application that acts as a middleware bridge between the KasserPro backend API and local hardware devices (thermal printers, barcode scanners, cash drawers). It enables seamless integration of physical POS hardware with the web-based KasserPro system through bidirectional SignalR communication.

## Glossary

- **Desktop_Bridge_App**: The .NET WPF application running on Windows that manages local hardware devices
- **Backend_API**: The ASP.NET Core backend server hosting the SignalR hub
- **Frontend_Web**: The React web application used by cashiers
- **Device_Hub**: The SignalR hub endpoint on the backend for device communication
- **ESC_POS**: Standard command set for thermal receipt printers
- **Device_ID**: Unique identifier assigned to each Desktop Bridge App instance
- **API_Key**: Authentication token used by Desktop Bridge App to connect to Backend API
- **Command_Queue**: Local storage for commands that failed to execute due to connection loss
- **Thermal_Printer**: Receipt printer using thermal printing technology
- **Barcode_Scanner**: USB HID device for scanning product barcodes
- **Cash_Drawer**: Physical drawer for storing cash, connected via printer or USB

## Requirements

### Requirement 1: SignalR Connection Management

**User Story:** As a system administrator, I want the Desktop Bridge App to maintain a reliable connection with the backend, so that hardware commands are executed without interruption.

#### Acceptance Criteria

1. WHEN the Desktop_Bridge_App starts, THE System SHALL establish a SignalR connection to the Device_Hub using the configured Backend URL and API_Key
2. WHEN the SignalR connection is lost, THE System SHALL attempt to reconnect automatically every 5 seconds for up to 10 attempts
3. WHEN the connection is successfully re-established, THE System SHALL process all queued commands from the Command_Queue in order
4. WHEN the connection state changes, THE System SHALL update the UI status indicator (Connected/Disconnected/Reconnecting)
5. IF the API_Key is invalid or expired, THEN THE System SHALL display an authentication error and prevent connection attempts until credentials are updated

### Requirement 2: Device Registration and Authentication

**User Story:** As a system administrator, I want each Desktop Bridge App instance to be registered and authenticated, so that only authorized devices can access the system.

#### Acceptance Criteria

1. WHEN the Desktop_Bridge_App first connects, THE System SHALL register itself with the Backend_API using a unique Device_ID and API_Key
2. THE Backend_API SHALL validate the API_Key and associate the Device_ID with a specific TenantId and BranchId
3. WHEN registration is successful, THE System SHALL store the Device_ID locally for future connections
4. WHEN a device attempts to connect from a different branch, THE Backend_API SHALL reject the connection with error code `DEVICE_UNAUTHORIZED_BRANCH`
5. THE System SHALL transmit all SignalR messages over encrypted WSS protocol

### Requirement 3: Thermal Printer Management

**User Story:** As a cashier, I want to print receipts on thermal printers, so that customers receive printed proof of purchase.

#### Acceptance Criteria

1. WHEN the Desktop_Bridge_App starts, THE System SHALL detect all available thermal printers (USB, Network, Bluetooth)
2. WHEN a print command is received from the Device_Hub, THE System SHALL format the receipt data using ESC_POS commands and send it to the configured default Thermal_Printer
3. WHEN printing is successful, THE System SHALL send a success confirmation to the Device_Hub with timestamp
4. IF the Thermal_Printer is offline or out of paper, THEN THE System SHALL add the print job to the Command_Queue and notify the Device_Hub with error code `PRINTER_UNAVAILABLE`
5. THE System SHALL support printing receipts, shift reports, and barcode labels with appropriate formatting for each type

### Requirement 4: Receipt Printing Format

**User Story:** As a cashier, I want receipts to be formatted correctly with all required information, so that they are readable and compliant.

#### Acceptance Criteria

1. WHEN printing a sales receipt, THE System SHALL include: branch name, receipt number, date/time, items with prices, subtotal, tax amount (14%), total amount, payment method, and cashier name
2. WHEN printing a shift report, THE System SHALL include: shift number, cashier name, opening time, closing time, total sales, payment method breakdown, and cash drawer balance
3. THE System SHALL format Arabic text correctly using right-to-left alignment
4. THE System SHALL use appropriate font sizes: header (double width/height), items (normal), totals (bold)
5. THE System SHALL include a barcode or QR code at the bottom of receipts containing the receipt number

### Requirement 5: Barcode Scanner Integration

**User Story:** As a cashier, I want to scan product barcodes quickly, so that I can add items to orders efficiently.

#### Acceptance Criteria

1. WHEN the Desktop_Bridge_App starts, THE System SHALL detect and initialize all connected USB HID Barcode_Scanners
2. WHEN a barcode is scanned, THE System SHALL immediately send the barcode data to the Device_Hub via SignalR
3. THE System SHALL support EAN-13, Code128, and QR code formats
4. WHEN the Device_Hub receives barcode data, THE Backend_API SHALL lookup the product and send product details to the Frontend_Web
5. IF no Barcode_Scanner is detected, THEN THE System SHALL display a warning but continue operating for manual entry

### Requirement 6: Cash Drawer Control

**User Story:** As a cashier, I want the cash drawer to open automatically for cash payments, so that I can provide change to customers.

#### Acceptance Criteria

1. WHEN a cash payment is completed in the Frontend_Web, THE Backend_API SHALL send an open drawer command to the Device_Hub
2. WHEN the open drawer command is received, THE System SHALL send the ESC_POS drawer kick command to the Cash_Drawer
3. WHERE the user has Admin role, THE System SHALL allow manual drawer opening via the system tray menu
4. THE System SHALL support cash drawers connected via printer port or direct USB connection
5. WHEN the drawer is opened, THE System SHALL log the event with timestamp, user, and reason (sale/manual)

### Requirement 7: Command Queue and Offline Operation

**User Story:** As a system administrator, I want commands to be queued when offline, so that no operations are lost during connection issues.

#### Acceptance Criteria

1. WHEN the SignalR connection is lost, THE System SHALL store all incoming commands in the Command_Queue with timestamp
2. THE Command_Queue SHALL persist to disk in JSON format in the AppData folder
3. WHEN the connection is restored, THE System SHALL process queued commands in FIFO order
4. THE System SHALL retry failed commands up to 3 times before marking them as permanently failed
5. WHEN a command is permanently failed, THE System SHALL notify the Device_Hub with error details and remove it from the queue

### Requirement 8: Application Settings Management

**User Story:** As a system administrator, I want to configure connection and device settings, so that the app works with our specific hardware setup.

#### Acceptance Criteria

1. THE System SHALL provide a settings UI accessible from the system tray menu
2. THE System SHALL store settings in a JSON file located at `%AppData%\KasserPro\settings.json`
3. WHEN settings are modified, THE System SHALL validate the Backend URL format and API_Key length before saving
4. THE System SHALL allow configuration of: Backend URL, API_Key, default Thermal_Printer, Barcode_Scanner port, and Cash_Drawer type
5. WHEN the Backend URL is changed, THE System SHALL disconnect and reconnect using the new URL

### Requirement 9: System Tray Integration

**User Story:** As a cashier, I want the app to run in the system tray, so that it doesn't clutter my workspace but remains accessible.

#### Acceptance Criteria

1. WHEN the Desktop_Bridge_App starts, THE System SHALL minimize to the system tray instead of showing a main window
2. THE System SHALL display a tray icon that changes color based on connection status (green=connected, red=disconnected, yellow=reconnecting)
3. WHEN the user right-clicks the tray icon, THE System SHALL show a context menu with options: Settings, Test Printer, Open Drawer, View Logs, Exit
4. WHEN important events occur (connection lost, printer error), THE System SHALL display Windows toast notifications
5. WHEN the user selects Exit, THE System SHALL gracefully disconnect from the Device_Hub and close all device connections

### Requirement 10: Error Handling and Logging

**User Story:** As a system administrator, I want detailed error logs, so that I can troubleshoot hardware and connection issues.

#### Acceptance Criteria

1. THE System SHALL log all events to a file located at `%AppData%\KasserPro\logs\bridge-app.log`
2. THE System SHALL log: connection events, command execution, device status changes, and errors with timestamps
3. WHEN an error occurs, THE System SHALL include: error code, error message, stack trace, and device context
4. THE System SHALL rotate log files daily and keep logs for 30 days
5. THE System SHALL provide a "View Logs" option in the system tray menu that opens the log file in the default text editor

### Requirement 11: Multi-Device Support

**User Story:** As a branch manager, I want to connect multiple printers and scanners, so that multiple cashier stations can operate simultaneously.

#### Acceptance Criteria

1. THE System SHALL support connecting to multiple Thermal_Printers simultaneously
2. WHEN a print command is received, THE Device_Hub SHALL specify which printer to use by Device_ID or printer name
3. THE System SHALL allow assigning a default printer for each command type (receipts, reports, labels)
4. WHEN multiple Barcode_Scanners are connected, THE System SHALL accept input from any scanner and include the scanner ID in the barcode event
5. THE System SHALL display a list of all connected devices in the settings UI with their status (online/offline)

### Requirement 12: Print Job Management

**User Story:** As a cashier, I want to see the status of print jobs, so that I know if receipts were printed successfully.

#### Acceptance Criteria

1. THE System SHALL maintain a print job history with status (pending, printing, completed, failed)
2. WHEN a print job fails, THE System SHALL display the error reason in the job history
3. THE System SHALL allow reprinting failed jobs from the system tray menu
4. THE System SHALL automatically retry failed print jobs when the printer comes back online
5. THE System SHALL clear completed print jobs older than 24 hours from the history

