# Stage 2 — Backend Audit (Code-Proven)

## Scope
- Files reviewed: `src/KasserPro.API/*`, `src/KasserPro.Application/*`, `src/KasserPro.Infrastructure/*`, `src/KasserPro.Domain/*`.

## Key Facts (from code)
- Architecture: Layered / Clean Architecture (Presentation: `KasserPro.API`, Application: `KasserPro.Application`, Infrastructure: `KasserPro.Infrastructure`, Domain: `KasserPro.Domain`).
  - Evidence: `KasserPro.sln` and `src/README.md`.
- Authentication: JWT configured in `Program.cs` using values from `appsettings.json`; tokens created in `AuthService.GenerateToken`.
  - Evidence: `src/KasserPro.API/Program.cs`, `src/KasserPro.Application/Services/Implementations/AuthService.cs`.
- Request lifecycle: Controller → Application service → UnitOfWork/Repositories → `AppDbContext` (EF Core). Transactions used (`BeginTransactionAsync`) for critical operations (orders, purchase invoices).
  - Evidence: `src/KasserPro.Application/Services/Implementations/OrderService.cs`, `PurchaseInvoiceService.cs`, `src/KasserPro.Infrastructure/Repositories/UnitOfWork.cs`.
- Middlewares: Global `ExceptionMiddleware` and `IdempotencyMiddleware` are active in pipeline (see `Program.cs` and middleware files).
- SignalR DeviceHub mapped at `/hubs/devices` and used for device prints (`src/KasserPro.API/Hubs/DeviceHub.cs`).

## Status
- **Backend audit: COMPLETE** (controllers, services, DB interaction, auth, error handling and idempotency verified from code).

## Primary files referenced
- `src/KasserPro.API/Program.cs`
- `src/KasserPro.API/Hubs/DeviceHub.cs`
- `src/KasserPro.API/Middleware/ExceptionMiddleware.cs`
- `src/KasserPro.API/Middleware/IdempotencyMiddleware.cs`
- `src/KasserPro.Application/Services/Implementations/OrderService.cs`
- `src/KasserPro.Infrastructure/Data/AppDbContext.cs`

---

_Last updated: Audit run on workspace (code)."