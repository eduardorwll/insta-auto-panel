---
node: server-routes
title: "HTTP REST API Routes (Bun.serve Endpoints)"
covers:
  - src/server/index.ts:1-92
  - src/server/index.ts:8-87 # const server
  - src/server/routes/ai.ts:1-195
  - src/server/routes/ai.ts:14-194 # function handleAIRoutes
  - src/server/routes/companies.ts:1-90
  - src/server/routes/companies.ts:6-6 # const companyUpdateSchema
  - src/server/routes/companies.ts:8-89 # function handleCompaniesRoutes
  - src/server/routes/export.ts:1-92
  - src/server/routes/export.ts:8-91 # function handleExportRoutes
  - src/server/routes/photos.ts:1-120
  - src/server/routes/photos.ts:7-119 # function handlePhotosRoutes
  - src/server/routes/schedules.ts:1-265
  - src/server/routes/schedules.ts:13-20 # const postUpdateSchema
  - src/server/routes/schedules.ts:22-264 # function handleSchedulesRoutes
---

# HTTP REST API Routes (Bun.serve Endpoints)

Handles HTTP REST endpoints for multi-tenant companies, photo bank uploads, weekly schedules & dynamic 3-10 slides, agnostic AI generation, Canva CSV export, and AutoSocial filesystem queue.

## Covered Files & Symbols

### `src/server/index.ts` (lines 1-92)
- `server` (const) → `src/server/index.ts:8-87`

### `src/server/routes/ai.ts` (lines 1-195)
- `handleAIRoutes` (function) → `src/server/routes/ai.ts:14-194`

### `src/server/routes/companies.ts` (lines 1-90)
- `companyUpdateSchema` (const) → `src/server/routes/companies.ts:6-6`
- `handleCompaniesRoutes` (function) → `src/server/routes/companies.ts:8-89`

### `src/server/routes/export.ts` (lines 1-92)
- `handleExportRoutes` (function) → `src/server/routes/export.ts:8-91`

### `src/server/routes/photos.ts` (lines 1-120)
- `handlePhotosRoutes` (function) → `src/server/routes/photos.ts:7-119`

### `src/server/routes/schedules.ts` (lines 1-265)
- `postUpdateSchema` (const) → `src/server/routes/schedules.ts:13-20`
- `handleSchedulesRoutes` (function) → `src/server/routes/schedules.ts:22-264`
