---
node: server-routes
title: "HTTP REST API Routes (Bun.serve Endpoints)"
covers:
  - src/server/index.ts:1-166
  - src/server/index.ts:12-18 # function applySecurityHeaders
  - src/server/index.ts:20-153 # function handleRequest
  - src/server/index.ts:155-161 # const server
  - src/server/routes/ai.ts:1-305
  - src/server/routes/ai.ts:16-304 # function handleAIRoutes
  - src/server/routes/auth.ts:1-123
  - src/server/routes/auth.ts:14-17 # const loginSchema
  - src/server/routes/auth.ts:19-25 # function getClientIp
  - src/server/routes/auth.ts:27-122 # function handleAuthRoutes
  - src/server/routes/companies.ts:1-90
  - src/server/routes/companies.ts:6-6 # const companyUpdateSchema
  - src/server/routes/companies.ts:8-89 # function handleCompaniesRoutes
  - src/server/routes/design.ts:1-252
  - src/server/routes/design.ts:22-22 # const RENDERS_DIR
  - src/server/routes/design.ts:24-251 # function handleDesignRoutes
  - src/server/routes/export.ts:1-92
  - src/server/routes/export.ts:8-91 # function handleExportRoutes
  - src/server/routes/photos.ts:1-160
  - src/server/routes/photos.ts:7-159 # function handlePhotosRoutes
  - src/server/routes/schedules.ts:1-167
  - src/server/routes/schedules.ts:12-22 # const postCreateSchema
  - src/server/routes/schedules.ts:24-33 # const postUpdateSchema
  - src/server/routes/schedules.ts:35-166 # function handleSchedulesRoutes
  - src/server/routes/settings.ts:1-365
  - src/server/routes/settings.ts:16-49 # function ensureCompanySettingsRow
  - src/server/routes/settings.ts:51-51 # const SAFE_COMPANY_ID_REGEX
  - src/server/routes/settings.ts:53-55 # function isValidCompanyId
  - src/server/routes/settings.ts:57-82 # function sanitizeCompanySettings
  - src/server/routes/settings.ts:84-364 # function handleSettingsRoutes
---

# HTTP REST API Routes (Bun.serve Endpoints)

Handles HTTP REST endpoints for multi-tenant companies, photo bank uploads, weekly schedules & dynamic 3-10 slides, agnostic AI generation, Canva CSV export, and AutoSocial filesystem queue.

## Covered Files & Symbols

### `src/server/index.ts` (lines 1-166)
- `applySecurityHeaders` (function) → `src/server/index.ts:12-18`
- `handleRequest` (function) → `src/server/index.ts:20-153`
- `server` (const) → `src/server/index.ts:155-161`

### `src/server/routes/ai.ts` (lines 1-305)
- `handleAIRoutes` (function) → `src/server/routes/ai.ts:16-304`

### `src/server/routes/auth.ts` (lines 1-123)
- `loginSchema` (const) → `src/server/routes/auth.ts:14-17`
- `getClientIp` (function) → `src/server/routes/auth.ts:19-25`
- `handleAuthRoutes` (function) → `src/server/routes/auth.ts:27-122`

### `src/server/routes/companies.ts` (lines 1-90)
- `companyUpdateSchema` (const) → `src/server/routes/companies.ts:6-6`
- `handleCompaniesRoutes` (function) → `src/server/routes/companies.ts:8-89`

### `src/server/routes/design.ts` (lines 1-252)
- `RENDERS_DIR` (const) → `src/server/routes/design.ts:22-22`
- `handleDesignRoutes` (function) → `src/server/routes/design.ts:24-251`

### `src/server/routes/export.ts` (lines 1-92)
- `handleExportRoutes` (function) → `src/server/routes/export.ts:8-91`

### `src/server/routes/photos.ts` (lines 1-160)
- `handlePhotosRoutes` (function) → `src/server/routes/photos.ts:7-159`

### `src/server/routes/schedules.ts` (lines 1-167)
- `postCreateSchema` (const) → `src/server/routes/schedules.ts:12-22`
- `postUpdateSchema` (const) → `src/server/routes/schedules.ts:24-33`
- `handleSchedulesRoutes` (function) → `src/server/routes/schedules.ts:35-166`

### `src/server/routes/settings.ts` (lines 1-365)
- `ensureCompanySettingsRow` (function) → `src/server/routes/settings.ts:16-49`
- `SAFE_COMPANY_ID_REGEX` (const) → `src/server/routes/settings.ts:51-51`
- `isValidCompanyId` (function) → `src/server/routes/settings.ts:53-55`
- `sanitizeCompanySettings` (function) → `src/server/routes/settings.ts:57-82`
- `handleSettingsRoutes` (function) → `src/server/routes/settings.ts:84-364`
