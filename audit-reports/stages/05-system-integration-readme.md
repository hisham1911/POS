# Stage 5 — System Integration & Data Flow (Code-Proven)

## Scope
- Files reviewed: `client/src/api/*`, `src/KasserPro.API/*`, `src/KasserPro.BridgeApp/*`.

## Key Facts (from code)
- Frontend → Backend: REST API (RTK Query) with `Authorization: Bearer <token>` set by `baseApi.prepareHeaders`; base URL from `VITE_API_URL` (`client/.env`). Evidence: `client/src/api/baseApi.ts`.
- Backend → Bridge: SignalR hub `/hubs/devices` used to broadcast `PrintReceipt` commands and receive `PrintCompleted` events. Evidence: `OrdersController.Complete` sending `PrintReceipt` and `DeviceHub` receiving `PrintCompleted` (`src/KasserPro.API/Controllers/OrdersController.cs`, `src/KasserPro.API/Hubs/DeviceHub.cs`).
- Bridge → Printer: `PrinterService` chooses PrintDocument for PDF-style printers or ESC/POS for thermal printers and sends raw bytes to Windows print spooler when required. Evidence: `src/KasserPro.BridgeApp/Services/PrinterService.cs`.
- Web SignalR client: **not found** in `client/` (no code), so frontend currently does not subscribe to hub events in this codebase.

## Status
- **Integration mapping: COMPLETE** (end-to-end print flow mapped; missing web-side SignalR client noted).

## Primary files referenced
- `client/src/api/baseApi.ts`
- `src/KasserPro.API/Controllers/OrdersController.cs`
- `src/KasserPro.API/Hubs/DeviceHub.cs`
- `src/KasserPro.BridgeApp/Services/SignalRClientService.cs`
- `src/KasserPro.BridgeApp/Services/PrinterService.cs`

---

_Last updated: Audit run on workspace (code)."