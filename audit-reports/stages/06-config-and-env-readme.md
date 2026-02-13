# Stage 6 — Configuration & Environment Handling (Code-Proven)

## Scope
- Files reviewed: `src/KasserPro.API/appsettings.json`, `src/KasserPro.API/Program.cs`, `client/.env`, `src/KasserPro.BridgeApp/Services/SettingsManager.cs`.

## Key Facts (from code)
- Backend configuration: `appsettings.json` holds JWT settings and `DefaultConnection` (SQLite `kasserpro.db`); `Program.cs` reads `Jwt:Key`, `Issuer`, and `Audience` for authentication.
  - Evidence: `src/KasserPro.API/appsettings.json`, `src/KasserPro.API/Program.cs`.
- Frontend env: `client/.env` sets `VITE_API_URL=http://localhost:5243/api` which is used by RTK Query base API.
  - Evidence: `client/.env` and `client/src/api/baseApi.ts`.
- Bridge settings: persisted at `%AppData%\KasserPro\settings.json` with `DeviceId`, `BackendUrl`, `ApiKey`, and `DefaultPrinterName` defaults; settings manager creates defaults if file missing.
  - Evidence: `src/KasserPro.BridgeApp/Services/SettingsManager.cs`.

## UNVERIFIABLE items (from code alone)
- Production secret management pipeline (no secret store / CI env config found in the repository). 
- Production deployment / environment specifics (no CI/CD manifests or Kubernetes/Docker deployment files present in repo).

## Status
- **Config & env mapping: PARTIAL** (configs are in code but production secret provisioning and deployments are not present in repo — UNVERIFIABLE).

## Primary files referenced
- `src/KasserPro.API/appsettings.json`
- `src/KasserPro.API/Program.cs`
- `client/.env`
- `src/KasserPro.BridgeApp/Services/SettingsManager.cs`

---

_Last updated: Audit run on workspace (code)."