# Stage 4 — Database Schema & Entity Map (Code-Proven)

## Scope

- Files reviewed: `src/KasserPro.Infrastructure/Data/AppDbContext.cs` and `src/KasserPro.Domain/Entities/*`.

## Key Facts (from code)

- DbContext applies **soft-delete** filters for many entities (e.g., Tenant, Branch, Product, Order, etc.). Evidence: `AppDbContext.cs` HasQueryFilter calls.
- Entities of interest and relationships (code references):
  - `Order` → `OrderItem`, `Payment`, `Shift` (`src/KasserPro.Domain/Entities/Order.cs`)
  - `Product` → stock fields, `StockMovement` relations (`Product.cs`)
  - `PurchaseInvoice` and `PurchaseInvoiceItem`, `PurchaseInvoicePayment` (`PurchaseInvoice*.cs`)
  - `CashRegisterTransaction` used to track cash register balances (`CashRegisterTransaction.cs`) and reconciliations (`CashRegisterService.cs`).
- Indexes: `User.Email` unique, `Branch` composite `{TenantId, Code}` unique, `Product` indexes on `Barcode` & `Sku`, `Customer` indexed by `{TenantId, Phone}`. Evidence: `AppDbContext.cs` & entity files.
- Concurrency: `Shift.RowVersion` configured as concurrency token (special handling for SQLite) — evidence: `Shift.cs` and `AppDbContext.cs`.

## Status

- **Database schema mapping: COMPLETE** (entities, relationships, indexes and concurrency tokens identified from code).

## Primary files referenced

- `src/KasserPro.Infrastructure/Data/AppDbContext.cs`
- `src/KasserPro.Domain/Entities/Order.cs`, `OrderItem.cs`, `Product.cs`, `Shift.cs`, `CashRegisterTransaction.cs`, `PurchaseInvoice*.cs`

---

\_Last updated: Audit run on workspace (code)."
