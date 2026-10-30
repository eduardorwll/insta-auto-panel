---
node: server-routes
title: "HTTP REST API Routes (Bun.serve Endpoints)"
covers:
  - src/server/index.ts:1-134
  - src/server/index.ts:10-15 # function applySecurityHeaders
  - src/server/index.ts:17-129 # const server
  - src/server/routes/ai.ts:1-268
  - src/server/routes/ai.ts:15-267 # function handleAIRoutes
  - src/server/routes/companies.ts:1-90
  - src/server/routes/companies.ts:6-6 # const companyUpdateSchema
  - src/server/routes/companies.ts:8-89 # function handleCompaniesRoutes
  - src/server/routes/design.ts:1-218
  - src/server/routes/design.ts:21-21 # const RENDERS_DIR
  - src/server/routes/design.ts:23-217 # function handleDesignRoutes
  - src/server/routes/export.ts:1-92
  - src/server/routes/export.ts:8-91 # function handleExportRoutes
  - src/server/routes/photos.ts:1-131
  - src/server/routes/photos.ts:7-130 # function handlePhotosRoutes
  - src/server/routes/schedules.ts:1-268
  - src/server/routes/schedules.ts:13-21 # const postUpdateSchema
  - src/server/routes/schedules.ts:23-267 # function handleSchedulesRoutes
  - src/server/routes/settings.ts:1-467
  - src/server/routes/settings.ts:12-21 # interface CookieEntry
  - src/server/routes/settings.ts:27-132 # function parseInstagramCookiesInput
  - src/server/routes/settings.ts:137-170 # function ensureCompanySettingsRow
  - src/server/routes/settings.ts:172-466 # function handleSettingsRoutes
---

# HTTP REST API Routes (Bun.serve Endpoints)

Handles HTTP REST endpoints for multi-tenant companies, photo bank uploads, weekly schedules & dynamic 3-10 slides, agnostic AI generation, Canva CSV export, and AutoSocial filesystem queue.

## Covered Files & Symbols

### `src/server/index.ts` (lines 1-134)
- `applySecurityHeaders` (function) → `src/server/index.ts:10-15`
- `server` (const) → `src/server/index.ts:17-129`

### `src/server/routes/ai.ts` (lines 1-268)
- `handleAIRoutes` (function) → `src/server/routes/ai.ts:15-267`

### `src/server/routes/companies.ts` (lines 1-90)
- `companyUpdateSchema` (const) → `src/server/routes/companies.ts:6-6`
- `handleCompaniesRoutes` (function) → `src/server/routes/companies.ts:8-89`

### `src/server/routes/design.ts` (lines 1-218)
- `RENDERS_DIR` (const) → `src/server/routes/design.ts:21-21`
- `handleDesignRoutes` (function) → `src/server/routes/design.ts:23-217`

### `src/server/routes/export.ts` (lines 1-92)
- `handleExportRoutes` (function) → `src/server/routes/export.ts:8-91`

### `src/server/routes/photos.ts` (lines 1-131)
- `handlePhotosRoutes` (function) → `src/server/routes/photos.ts:7-130`

### `src/server/routes/schedules.ts` (lines 1-268)
- `postUpdateSchema` (const) → `src/server/routes/schedules.ts:13-21`
- `handleSchedulesRoutes` (function) → `src/server/routes/schedules.ts:23-267`

### `src/server/routes/settings.ts` (lines 1-467)
- `CookieEntry` (interface) → `src/server/routes/settings.ts:12-21`
- `parseInstagramCookiesInput` (function) → `src/server/routes/settings.ts:27-132`
- `ensureCompanySettingsRow` (function) → `src/server/routes/settings.ts:137-170`
- `handleSettingsRoutes` (function) → `src/server/routes/settings.ts:172-466`
