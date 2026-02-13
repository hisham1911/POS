# Stage 7 — Dependencies & Tests (Code-Proven)

## Scope

- Files reviewed: `client/package.json`, `src/*.csproj`, `src/KasserPro.Tests/*`, `client/e2e/*`.

## Key Facts (from code)

- Major dependencies (examples):
  - Frontend: React, TypeScript, @reduxjs/toolkit (RTK Query), react-router-dom, tailwind, playwright for E2E.
    - Evidence: `client/package.json`.
  - Backend: Microsoft.AspNetCore.Authentication.JwtBearer, EF Core packages (in Infrastructure), Serilog, Swashbuckle.
    - Evidence: `src/KasserPro.API/KasserPro.API.csproj` and other project files.
  - Bridge App: Microsoft.AspNetCore.SignalR.Client, ESCPOS_NET, Serilog.
    - Evidence: `src/KasserPro.BridgeApp/KasserPro.BridgeApp.csproj`.
- Tests present:
  - Unit tests: xUnit tests under `src/KasserPro.Tests/Unit` (e.g., `OrderFinancialTests.cs` verifies tax calculations).
  - Integration tests: `src/KasserPro.Tests/Integration/*` present.
  - Frontend E2E tests: Playwright spec `client/e2e/complete-flow.spec.ts`.

## Status

- **Dependencies & Tests: PARTIAL** (tests exist and key libraries are identified; full coverage metrics or CI execution not present in the repo).

## Primary files referenced

- `client/package.json`
- `src/KasserPro.Tests/Unit/OrderFinancialTests.cs`
- `client/e2e/complete-flow.spec.ts`

---

\_Last updated: Audit run on workspace (code)."
