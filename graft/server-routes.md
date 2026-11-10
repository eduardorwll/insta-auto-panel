---
node: server-routes
title: "HTTP REST API Routes (Bun.serve Endpoints)"
covers:
  - src/server/index.ts:1-166
  - src/server/index.ts:12-18 # function applySecurityHeaders
  - src/server/index.ts:20-153 # function handleRequest
  - src/server/index.ts:155-161 # const server
  - src/server/routes/ai.ts:1-515
  - src/server/routes/ai.ts:28-514 # function handleAIRoutes
  - src/server/routes/auth.ts:1-123
  - src/server/routes/auth.ts:14-17 # const loginSchema
  - src/server/routes/auth.ts:19-25 # function getClientIp
  - src/server/routes/auth.ts:27-122 # function handleAuthRoutes
  - src/server/routes/companies.ts:1-141
  - src/server/routes/companies.ts:10-10 # const companyUpdateSchema
  - src/server/routes/companies.ts:12-140 # function handleCompaniesRoutes
  - src/server/routes/design.ts:1-448
  - src/server/routes/design.ts:30-30 # const RENDERS_DIR
  - src/server/routes/design.ts:32-447 # function handleDesignRoutes
  - src/server/routes/export.ts:1-63
  - src/server/routes/export.ts:7-62 # function handleExportRoutes
  - src/server/routes/photos.ts:1-160
  - src/server/routes/photos.ts:7-159 # function handlePhotosRoutes
  - src/server/routes/schedules.ts:1-167
  - src/server/routes/schedules.ts:12-22 # const postCreateSchema
  - src/server/routes/schedules.ts:24-33 # const postUpdateSchema
  - src/server/routes/schedules.ts:35-166 # function handleSchedulesRoutes
  - src/server/routes/settings.ts:1-433
  - src/server/routes/settings.ts:21-54 # function ensureCompanySettingsRow
  - src/server/routes/settings.ts:56-56 # const SAFE_COMPANY_ID_REGEX
  - src/server/routes/settings.ts:58-60 # function isValidCompanyId
  - src/server/routes/settings.ts:62-87 # function sanitizeCompanySettings
  - src/server/routes/settings.ts:89-432 # function handleSettingsRoutes
---

# HTTP REST API Routes (Bun.serve Endpoints)

Handles HTTP REST endpoints for multi-tenant companies, photo bank uploads, weekly schedules & dynamic 3-10 slides, agnostic AI generation, Canva CSV export, and AutoSocial filesystem queue.

## Covered Files & Symbols

### `src/server/index.ts` (lines 1-166)
- `applySecurityHeaders` (function) → `src/server/index.ts:12-18`
- `handleRequest` (function) → `src/server/index.ts:20-153`
- `server` (const) → `src/server/index.ts:155-161`

### `src/server/routes/ai.ts` (lines 1-515)
- `handleAIRoutes` (function) → `src/server/routes/ai.ts:28-514`

### `src/server/routes/auth.ts` (lines 1-123)
- `loginSchema` (const) → `src/server/routes/auth.ts:14-17`
- `getClientIp` (function) → `src/server/routes/auth.ts:19-25`
- `handleAuthRoutes` (function) → `src/server/routes/auth.ts:27-122`

### `src/server/routes/companies.ts` (lines 1-141)
- `companyUpdateSchema` (const) → `src/server/routes/companies.ts:10-10`
- `handleCompaniesRoutes` (function) → `src/server/routes/companies.ts:12-140`

### `src/server/routes/design.ts` (lines 1-448)
- `RENDERS_DIR` (const) → `src/server/routes/design.ts:30-30`
- `handleDesignRoutes` (function) → `src/server/routes/design.ts:32-447`

### `src/server/routes/export.ts` (lines 1-63)
- `handleExportRoutes` (function) → `src/server/routes/export.ts:7-62`

### `src/server/routes/photos.ts` (lines 1-160)
- `handlePhotosRoutes` (function) → `src/server/routes/photos.ts:7-159`

### `src/server/routes/schedules.ts` (lines 1-167)
- `postCreateSchema` (const) → `src/server/routes/schedules.ts:12-22`
- `postUpdateSchema` (const) → `src/server/routes/schedules.ts:24-33`
- `handleSchedulesRoutes` (function) → `src/server/routes/schedules.ts:35-166`

### `src/server/routes/settings.ts` (lines 1-433)
- `ensureCompanySettingsRow` (function) → `src/server/routes/settings.ts:21-54`
- `SAFE_COMPANY_ID_REGEX` (const) → `src/server/routes/settings.ts:56-56`
- `isValidCompanyId` (function) → `src/server/routes/settings.ts:58-60`
- `sanitizeCompanySettings` (function) → `src/server/routes/settings.ts:62-87`
- `handleSettingsRoutes` (function) → `src/server/routes/settings.ts:89-432`
