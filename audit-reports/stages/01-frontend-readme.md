# Stage 1 — Frontend Audit (Code-Proven)

## Scope
- Files reviewed: `client/src/main.tsx`, `client/src/App.tsx`, `client/src/store/*`, `client/src/api/*`, `client/src/pages/pos/*`, `client/src/components/*`.

## Key Facts (from code)
- State management: Redux Toolkit + RTK Query; store is persisted for `auth` and `branch` via `redux-persist`.
  - Evidence: `client/src/store/index.ts` (RTK store & persist config).
- Routing: `react-router-dom` with `ProtectedRoute`, `AdminRoute` and route table in `client/src/App.tsx`.
- API: RTK Query base API (`client/src/api/baseApi.ts`) with `fetchBaseQuery`, `prepareHeaders` (adds `Authorization: Bearer <token>` and `X-Branch-Id`), global retry and error handling for 401/403/500 and specific backend `errorCode` handling.
- Auth: JWT token is stored in Redux `auth` slice (see `client/src/store/slices/authSlice.ts`); no refresh-token flow found.
- Payment flow: `PaymentModal` → `useOrders` → `ordersApi.createOrder` and `ordersApi.completeOrder` (idempotency header used on these mutations).
- Noteworthy: No SignalR client code was found in `client/` (no web subscription to hub broadcasts in repo).

## Status
- **Frontend audit: COMPLETE** (key routes, state, API patterns, and payment flow mapped).

## Primary files referenced
- `client/src/main.tsx`
- `client/src/App.tsx`
- `client/src/store/index.ts`
- `client/src/api/baseApi.ts`
- `client/src/api/ordersApi.ts`
- `client/src/components/pos/PaymentModal.tsx`

---

_Last updated: Audit run on workspace (code) — references are file paths in repository._