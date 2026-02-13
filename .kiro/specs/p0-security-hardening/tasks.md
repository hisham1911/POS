# Implementation Tasks: P0 Security Hardening

## Overview

This task list implements 8 critical security and data integrity fixes for KasserPro POS. Tasks are ordered by dependency and risk level, following the recommended implementation sequence from the P0 Hardening Implementation Guide.

**Recommended Order**: P0-1 → P0-6 → P0-2 → P0-7 → P0-4 → P0-5 → P0-8 → P0-3

**Total Estimated Effort**: 8-12 hours

---

## Phase 1: Foundation & Quick Wins (2-3 hours)

### Task 1: P0-1 JWT Secret Hardening

Implement JWT secret validation and configuration changes to prevent token forgery.

- [x] 1.1 Update `src/KasserPro.API/appsettings.json` - set `Jwt.Key` to empty string
- [x] 1.2 Update `src/KasserPro.API/appsettings.example.json` - fix key path from `JwtSettings.SecretKey` to `Jwt.Key` with placeholder
- [x] 1.3 Add JWT validation guard in `src/KasserPro.API/Program.cs` after `WebApplication.CreateBuilder`
  - Check if `Jwt:Key` is null/empty or length < 32
  - Throw `InvalidOperationException` with clear error message
  - Include PowerShell example for generating key
- [ ] 1.4 Manual validation: Test startup without env var (should crash)
- [ ] 1.5 Manual validation: Test startup with short key (should crash)
- [ ] 1.6 Manual validation: Test startup with valid 32+ char key (should succeed)
- [ ] 1.7 Manual validation: Test login with valid JWT key (should work)

**Definition of Done**:
- App refuses to start when `Jwt:Key` is missing or < 32 chars
- `appsettings.json` has empty `Jwt.Key`
- `appsettings.example.json` uses correct `Jwt.Key` path
- Login works when `Jwt__Key` env var is set

---

### Task 2: P0-6 Secure DeviceTestController

Add authorization to device test endpoints to prevent anonymous access.

- [x] 2.1 Add `using Microsoft.AspNetCore.Authorization;` to `src/KasserPro.API/Controllers/DeviceTestController.cs`
- [x] 2.2 Add `[Authorize(Roles = "Admin")]` attribute to `DeviceTestController` class
- [ ] 2.3 Manual validation: Test unauthenticated request (should return 401)
- [ ] 2.4 Manual validation: Test with Cashier token (should return 403)
- [ ] 2.5 Manual validation: Test with Admin token (should return 200)

**Definition of Done**:
- Unauthenticated request → 401
- Cashier request → 403
- Admin request → 200

---

### Task 3: P0-2 Disable Seed & Demo Credentials in Production

Gate demo data seeding and UI credentials behind development environment checks.

- [x] 3.1 Update `src/KasserPro.API/Program.cs` - wrap `ButcherDataSeeder.SeedAsync` in `if (app.Environment.IsDevelopment())`
  - Keep `MigrateAsync()` outside the condition (runs in all environments)
- [x] 3.2 Update `client/src/pages/auth/LoginPage.tsx` - wrap demo credentials div in `{import.meta.env.DEV && (...)}`
- [ ] 3.3 Manual validation: Set `ASPNETCORE_ENVIRONMENT=Production`, start backend (no seeding message)
- [ ] 3.4 Manual validation: Build frontend (`npm run build`), search for "Admin@123" in dist/ (0 matches)
- [ ] 3.5 Manual validation: Production mode - login page shows no credentials
- [ ] 3.6 Manual validation: Development mode - seeding runs and credentials visible

**Definition of Done**:
- `ButcherDataSeeder.SeedAsync` only executes in Development
- Production frontend build contains zero instances of `Admin@123`
- `MigrateAsync()` still runs in all environments

---

## Phase 2: Frontend Safety (1-2 hours)

### Task 4: P0-7 Disable Retry on Financial Mutations

Prevent RTK Query from auto-retrying POST/PUT/DELETE requests to avoid double-charges.

- [x] 4.1 Update `client/src/api/baseApi.ts` - add mutation detection in `baseQueryWithReauth`
  - Detect POST/PUT/DELETE methods
  - If mutation and error, call `retry.fail(error)` and return without retry
  - Show appropriate error toast for mutations
  - Allow GET queries to retry (existing behavior)
- [x] 4.2 Update `client/src/api/ordersApi.ts` - remove `Idempotency-Key` headers from all mutations
  - Remove from `createOrder`
  - Remove from `completeOrder`
  - Remove from `cancelOrder`
  - Remove from `refundOrder`
- [ ] 4.3 Manual validation: Complete order, check DevTools Network tab (only 1 POST request)
- [ ] 4.4 Manual validation: Simulate network error during payment (no retry, error toast shown)
- [ ] 4.5 Manual validation: Test GET request failure (should retry up to 3 times)

**Definition of Done**:
- POST/PUT/DELETE requests never auto-retry
- GET requests still retry up to 3 times
- Idempotency-Key headers removed from ordersApi mutations
- Error toast for mutations says "لا تكرر العملية"

---

## Phase 3: Financial Calculations (1-2 hours)

### Task 5: P0-4 Fix Double Tax Calculation

Fix tax calculation to sum per-item taxes instead of applying order-level tax rate.

- [x] 5.1 Locate `CalculateOrderTotals` method in `src/KasserPro.Application/Services/Implementations/OrderService.cs` (around line 912)
- [x] 5.2 Replace tax calculation logic:
  - If `order.DiscountAmount > 0 && order.Subtotal > 0`: calculate `discountRatio`, sum item taxes with proportional discount
  - Else: sum `item.TaxAmount` directly
- [ ] 5.3 Write unit test: Order with mixed tax rates (14% + 0%), verify correct tax amount
- [ ] 5.4 Write unit test: Order with uniform tax rate, verify backward compatibility
- [ ] 5.5 Write unit test: Order with discount, verify proportional tax distribution
- [ ] 5.6 Write property test: Tax equals sum of item taxes (Property 8)
- [ ] 5.7 Write property test: Product-specific tax rates respected (Property 9)
- [ ] 5.8 Manual validation: Create order with Item A (100 EGP, 14%) + Item B (100 EGP, 0%), verify tax = 14.00
- [ ] 5.9 Manual validation: Add 10% order discount, verify tax = 12.60

**Definition of Done**:
- `CalculateOrderTotals` uses sum of item taxes
- Mixed-rate order shows correct tax amount
- Order with discount distributes tax proportionally
- Uniform tax rate produces same result as before
- All unit and property tests pass

---

## Phase 4: Communication Isolation (1 hour)

### Task 6: P0-5 Fix SignalR Receipt Broadcast

Use branch-based SignalR groups instead of broadcasting to all devices.

- [x] 6.1 Update `src/KasserPro.API/Hubs/DeviceHub.cs` - `OnConnectedAsync` method:
  - Read `X-Branch-Id` from `httpContext.Request.Headers`
  - Create group name: `branch-{branchId}` or `branch-default`
  - Call `Groups.AddToGroupAsync(Context.ConnectionId, groupName)`
  - Update log message to include group name
- [x] 6.2 Update `src/KasserPro.API/Hubs/DeviceHub.cs` - `PrintCompleted` method:
  - Change from `Clients.All.SendAsync` to `Clients.Caller.SendAsync`
- [x] 6.3 Update `src/KasserPro.API/Controllers/OrdersController.cs` - `Complete` method (around line 152):
  - Extract `branchId` from JWT claims: `User.FindFirst("branchId")?.Value ?? "default"`
  - Change from `Clients.All.SendAsync` to `Clients.Group($"branch-{branchId}").SendAsync`
- [x] 6.4 Update `src/KasserPro.API/Controllers/DeviceTestController.cs` - `TestPrint` method (around line 71):
  - Read `X-Branch-Id` from request headers
  - Send to `Clients.Group($"branch-{branchId}")` or `Clients.Group("branch-default")`
- [ ] 6.5 Manual validation: Connect device with `X-Branch-Id: 1`, complete order, verify receipt received
- [ ] 6.6 Manual validation: Connect second device with `X-Branch-Id: 2`, complete order in branch 1, verify second device does NOT receive receipt

**Definition of Done**:
- `DeviceHub.OnConnectedAsync` assigns devices to branch groups
- `OrdersController.Complete` sends to specific group
- `DeviceTestController` sends to specific group
- `PrintCompleted` sends to caller only
- Device in branch-2 does NOT receive receipts from branch-1

---

## Phase 5: Concurrency Guards (2-3 hours)

### Task 7: P0-8 Cash Register Concurrency Guard

Ensure cash register balance read+write happens atomically within transactions.

- [x] 7.1 Add `HasActiveTransaction` property to `src/KasserPro.Application/Common/Interfaces/IUnitOfWork.cs`
  - Add XML comment explaining P0-8 purpose
- [x] 7.2 Implement `HasActiveTransaction` in `src/KasserPro.Infrastructure/Repositories/UnitOfWork.cs`
  - Return `_context.Database.CurrentTransaction != null`
- [x] 7.3 Update `RecordTransactionAsync` in `src/KasserPro.Application/Services/Implementations/CashRegisterService.cs`:
  - Check `!_unitOfWork.HasActiveTransaction` to determine if we own the transaction
  - If we own it, create transaction with `BeginTransactionAsync()`
  - Wrap existing logic in try/catch/finally
  - Commit if we own the transaction
  - Rollback on error if we own the transaction
  - Dispose transaction in finally if we own it
- [ ] 7.4 Write unit test: Verify transaction created when none exists
- [ ] 7.5 Write unit test: Verify transaction reused when already active
- [ ] 7.6 Write property test: Cash register chain integrity (Property 23)
- [ ] 7.7 Manual validation: Two cashiers complete cash sales simultaneously (100 + 200), verify balance = initial + 300
- [ ] 7.8 Manual validation: Query database, verify BalanceBefore[N+1] = BalanceAfter[N]

**Definition of Done**:
- `IUnitOfWork` has `HasActiveTransaction` property
- `UnitOfWork` implements it correctly
- `RecordTransactionAsync` creates own transaction only if none active
- Two simultaneous cash sales produce correct cumulative balance
- Transaction chain integrity maintained

---

### Task 8: P0-3 Fix Stock TOCTOU Race Condition

Add stock re-validation inside transaction before decrement to prevent negative stock.

- [x] 8.1 Update `CreateAsync` in `src/KasserPro.Application/Services/Implementations/OrderService.cs` (around line 147):
  - Replace `product.StockQuantity` with `await _inventoryService.GetAvailableQuantityAsync(product.Id, _currentUser.BranchId)`
  - Keep existing validation logic
  - Add comment: "P0-3: Soft check (UX hint). Hard check is in CompleteAsync."
- [x] 8.2 Update `CompleteAsync` in `src/KasserPro.Application/Services/Implementations/OrderService.cs` (around line 498-505):
  - After `await _unitOfWork.SaveChangesAsync();`
  - Before `BatchDecrementStockAsync()`
  - Add stock re-validation loop:
    - Get tenant, check `!AllowNegativeStock`
    - For each item with `ProductId > 0` and `TrackInventory = true`
    - Get `branchStock` from `_inventoryService.GetAvailableQuantityAsync`
    - If `branchStock < item.Quantity`, rollback and return error with `INSUFFICIENT_STOCK`
- [x] 8.3 Update `BatchDecrementStockAsync` in `src/KasserPro.Infrastructure/Services/InventoryService.cs` (around line 280):
  - After reading `balanceBefore`
  - Add warning log if `balanceBefore < quantity`
  - Don't throw (enforcement is in CompleteAsync)
- [ ] 8.4 Write unit test: Stock validation from BranchInventory in CreateAsync
- [ ] 8.5 Write unit test: Stock re-validation in CompleteAsync rejects insufficient stock
- [ ] 8.6 Write property test: Non-negative stock invariant (Property 7)
- [ ] 8.7 Write property test: Stock validation inside transaction (Property 3)
- [ ] 8.8 Write property test: Insufficient stock rejection (Property 4)
- [ ] 8.9 Manual validation: Multi-tab oversell test (stock=1, two tabs, first succeeds, second fails)
- [ ] 8.10 Manual validation: Verify database shows `BranchInventory.Quantity = 0` (not -1)

**Definition of Done**:
- `CreateAsync` reads stock from BranchInventory
- `CompleteAsync` re-validates stock inside transaction before decrement
- `BatchDecrementStockAsync` logs warning if stock would go negative
- Two simultaneous sales of last-in-stock item → only one succeeds
- `BranchInventory.Quantity` never goes below 0 when `AllowNegativeStock=false`

---

## Phase 6: Integration Testing & Validation (2-3 hours)

### Task 9: Write Property-Based Tests

Implement property-based tests for all correctness properties defined in design document.

- [ ] 9.1 Set up property testing framework (FsCheck or CsCheck for backend)
- [ ] 9.2 Write Property 1: Short JWT keys are rejected
- [ ] 9.3 Write Property 2: Migrations run in all environments
- [ ] 9.4 Write Property 3: Stock validation inside transaction (covered in Task 8.7)
- [ ] 9.5 Write Property 4: Insufficient stock rejection (covered in Task 8.8)
- [ ] 9.6 Write Property 5: Stock reads from BranchInventory
- [ ] 9.7 Write Property 6: Pre-decrement validation
- [ ] 9.8 Write Property 7: Non-negative stock invariant (covered in Task 8.6)
- [ ] 9.9 Write Property 8: Tax equals sum of item taxes (covered in Task 5.6)
- [ ] 9.10 Write Property 9: Product-specific tax rates respected (covered in Task 5.7)
- [ ] 9.11 Write Property 10: Proportional discount distribution
- [ ] 9.12 Write Property 11: Backward compatibility for uniform rates
- [ ] 9.13 Write Property 12: Tax on net amount after discount
- [ ] 9.14 Write Property 13: Branch-based group assignment
- [ ] 9.15 Write Property 14: Receipt routing to branch group
- [ ] 9.16 Write Property 15: Test print routing
- [ ] 9.17 Write Property 16: Print status to caller only
- [ ] 9.18 Write Property 17: DeviceTestController requires authentication
- [ ] 9.19 Write Property 18: DeviceTestController requires Admin role
- [ ] 9.20 Write Property 19: Mutations never auto-retry
- [ ] 9.21 Write Property 20: Queries retry on failure
- [ ] 9.22 Write Property 21: Mutation error messages warn against retry
- [ ] 9.23 Write Property 22: Cash transactions within database transaction
- [ ] 9.24 Write Property 23: Cash register chain integrity (covered in Task 7.6)

**Definition of Done**:
- All 23 properties have corresponding property-based tests
- Each test references its property number in comments
- All property tests pass with minimum 100 iterations
- Tests are integrated into CI pipeline

---

### Task 10: Final Validation & Documentation

Run comprehensive validation checklist and update documentation.

- [ ] 10.1 Run Test 1: Multi-Tab Oversell Test (from Final Validation Checklist)
- [ ] 10.2 Run Test 2: Double-Click Payment Test
- [ ] 10.3 Run Test 3: Server Restart Mid-Operation Test
- [ ] 10.4 Run Test 4: Printer Disconnect Test
- [ ] 10.5 Run Test 5: Concurrent Cash Transaction Test
- [ ] 10.6 Run Test 6: JWT Secret Test
- [ ] 10.7 Run Test 7: Production Build Security Test
- [ ] 10.8 Run Test 8: DeviceTestController Auth Test
- [ ] 10.9 Run Test 9: Tax Calculation Accuracy Test
- [ ] 10.10 Run all unit tests: `dotnet test` (all pass)
- [ ] 10.11 Run all property tests (all pass)
- [ ] 10.12 Run frontend tests: `npm test` (all pass)
- [ ] 10.13 Run E2E tests: `npm run test:e2e` (all pass)
- [ ] 10.14 Update API documentation if any endpoints changed
- [ ] 10.15 Create deployment guide with environment variable setup instructions
- [ ] 10.16 Document breaking changes (JWT key requirement, demo credentials removal)

**Definition of Done**:
- All 9 validation tests pass
- All automated tests pass (unit, property, frontend, E2E)
- Documentation updated
- Deployment guide created
- Breaking changes documented

---

## Summary

**Total Tasks**: 10 main tasks with 116 sub-tasks
**Estimated Effort**: 8-12 hours
**Critical Path**: Task 1 → Task 8 (JWT must work before stock fixes can be tested)
**Risk Areas**: Task 8 (most complex, involves transaction boundaries)

**Success Criteria**:
- All 8 P0 fixes implemented and tested
- All 23 correctness properties validated
- Zero regressions in existing functionality
- Production deployment ready with secure configuration
