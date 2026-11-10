---
node: server-db
title: "Database Layer (SQLite WAL + Drizzle Schema & Migrations)"
covers:
  - src/server/db/client.ts:1-132
  - src/server/db/client.ts:8-11 # interface DatabaseConnection
  - src/server/db/client.ts:20-100 # function createDatabaseConnection
  - src/server/db/client.ts:105-110 # function createTestDb
  - src/server/db/client.ts:114-119 # function getDatabase
  - src/server/db/client.ts:121-125 # const db
  - src/server/db/client.ts:127-131 # const sqlite
  - src/server/db/migrate.ts:1-22
  - src/server/db/migrate.ts:5-8 # function runMigrations
  - src/server/db/sanitize.ts:1-78
  - src/server/db/sanitize.ts:14-64 # function sanitizeDatabase
  - src/server/db/schema.ts:1-369
  - src/server/db/schema.ts:8-8 # const PHOTO_CATEGORIES
  - src/server/db/schema.ts:9-9 # type PhotoCategory
  - src/server/db/schema.ts:10-10 # const photoCategorySchema
  - src/server/db/schema.ts:15-23 # const DAYS_OF_WEEK
  - src/server/db/schema.ts:24-24 # type DayOfWeek
  - src/server/db/schema.ts:25-25 # const dayOfWeekSchema
  - src/server/db/schema.ts:30-36 # const POST_STATUSES
  - src/server/db/schema.ts:37-37 # type PostStatus
  - src/server/db/schema.ts:38-38 # const postStatusSchema
  - src/server/db/schema.ts:43-53 # const AI_PROVIDERS
  - src/server/db/schema.ts:54-54 # type AIProviderName
  - src/server/db/schema.ts:55-55 # const aiProviderSchema
  - src/server/db/schema.ts:60-67 # const IMAGE_PROVIDERS
  - src/server/db/schema.ts:68-68 # type ImageProviderName
  - src/server/db/schema.ts:69-69 # const imageProviderSchema
  - src/server/db/schema.ts:74-79 # const DESIGN_TEMPLATES
  - src/server/db/schema.ts:80-80 # type DesignTemplateId
  - src/server/db/schema.ts:81-81 # const designTemplateSchema
  - src/server/db/schema.ts:86-104 # const companies
  - src/server/db/schema.ts:109-121 # const photo_assets
  - src/server/db/schema.ts:126-133 # const weekly_schedules
  - src/server/db/schema.ts:138-157 # const posts
  - src/server/db/schema.ts:162-177 # const post_slides
  - src/server/db/schema.ts:183-192 # const ai_provider_settings
  - src/server/db/schema.ts:197-201 # const companiesRelations
  - src/server/db/schema.ts:203-208 # const photoAssetsRelations
  - src/server/db/schema.ts:210-216 # const weeklySchedulesRelations
  - src/server/db/schema.ts:218-228 # const postsRelations
  - src/server/db/schema.ts:230-239 # const postSlidesRelations
  - src/server/db/schema.ts:244-261 # const companyInsertSchema
  - src/server/db/schema.ts:263-272 # const photoAssetInsertSchema
  - src/server/db/schema.ts:274-278 # const weeklyScheduleInsertSchema
  - src/server/db/schema.ts:280-293 # const postInsertSchema
  - src/server/db/schema.ts:295-306 # const postSlideInsertSchema
  - src/server/db/schema.ts:308-316 # const aiProviderSettingsInsertSchema
  - src/server/db/schema.ts:321-337 # const company_settings
  - src/server/db/schema.ts:342-351 # const api_usage_rules
  - src/server/db/schema.ts:356-366 # const api_usage_logs
  - src/server/db/seed.ts:1-508
  - src/server/db/seed.ts:15-21 # function getMonday
  - src/server/db/seed.ts:23-69 # const SEEDED_POSTS_DATA
  - src/server/db/seed.ts:348-401 # function runSeed
  - src/server/db/seed.ts:407-493 # function resetAndSeedFreshData
---

# Database Layer (SQLite WAL + Drizzle Schema & Migrations)

Manages ACID persistence in SQLite with WAL mode, schema definitions (companies, photo_assets, weekly_schedules, scheduled_posts, post_slides, ai_provider_settings), migrations, and initial seeding.

## Covered Files & Symbols

### `src/server/db/client.ts` (lines 1-132)
- `DatabaseConnection` (interface) → `src/server/db/client.ts:8-11`
- `createDatabaseConnection` (function) → `src/server/db/client.ts:20-100`
- `createTestDb` (function) → `src/server/db/client.ts:105-110`
- `getDatabase` (function) → `src/server/db/client.ts:114-119`
- `db` (const) → `src/server/db/client.ts:121-125`
- `sqlite` (const) → `src/server/db/client.ts:127-131`

### `src/server/db/migrate.ts` (lines 1-22)
- `runMigrations` (function) → `src/server/db/migrate.ts:5-8`

### `src/server/db/sanitize.ts` (lines 1-78)
- `sanitizeDatabase` (function) → `src/server/db/sanitize.ts:14-64`

### `src/server/db/schema.ts` (lines 1-369)
- `PHOTO_CATEGORIES` (const) → `src/server/db/schema.ts:8-8`
- `PhotoCategory` (type) → `src/server/db/schema.ts:9-9`
- `photoCategorySchema` (const) → `src/server/db/schema.ts:10-10`
- `DAYS_OF_WEEK` (const) → `src/server/db/schema.ts:15-23`
- `DayOfWeek` (type) → `src/server/db/schema.ts:24-24`
- `dayOfWeekSchema` (const) → `src/server/db/schema.ts:25-25`
- `POST_STATUSES` (const) → `src/server/db/schema.ts:30-36`
- `PostStatus` (type) → `src/server/db/schema.ts:37-37`
- `postStatusSchema` (const) → `src/server/db/schema.ts:38-38`
- `AI_PROVIDERS` (const) → `src/server/db/schema.ts:43-53`
- `AIProviderName` (type) → `src/server/db/schema.ts:54-54`
- `aiProviderSchema` (const) → `src/server/db/schema.ts:55-55`
- `IMAGE_PROVIDERS` (const) → `src/server/db/schema.ts:60-67`
- `ImageProviderName` (type) → `src/server/db/schema.ts:68-68`
- `imageProviderSchema` (const) → `src/server/db/schema.ts:69-69`
- `DESIGN_TEMPLATES` (const) → `src/server/db/schema.ts:74-79`
- `DesignTemplateId` (type) → `src/server/db/schema.ts:80-80`
- `designTemplateSchema` (const) → `src/server/db/schema.ts:81-81`
- `companies` (const) → `src/server/db/schema.ts:86-104`
- `photo_assets` (const) → `src/server/db/schema.ts:109-121`
- `weekly_schedules` (const) → `src/server/db/schema.ts:126-133`
- `posts` (const) → `src/server/db/schema.ts:138-157`
- `post_slides` (const) → `src/server/db/schema.ts:162-177`
- `ai_provider_settings` (const) → `src/server/db/schema.ts:183-192`
- `companiesRelations` (const) → `src/server/db/schema.ts:197-201`
- `photoAssetsRelations` (const) → `src/server/db/schema.ts:203-208`
- `weeklySchedulesRelations` (const) → `src/server/db/schema.ts:210-216`
- `postsRelations` (const) → `src/server/db/schema.ts:218-228`
- `postSlidesRelations` (const) → `src/server/db/schema.ts:230-239`
- `companyInsertSchema` (const) → `src/server/db/schema.ts:244-261`
- `photoAssetInsertSchema` (const) → `src/server/db/schema.ts:263-272`
- `weeklyScheduleInsertSchema` (const) → `src/server/db/schema.ts:274-278`
- `postInsertSchema` (const) → `src/server/db/schema.ts:280-293`
- `postSlideInsertSchema` (const) → `src/server/db/schema.ts:295-306`
- `aiProviderSettingsInsertSchema` (const) → `src/server/db/schema.ts:308-316`
- `company_settings` (const) → `src/server/db/schema.ts:321-337`
- `api_usage_rules` (const) → `src/server/db/schema.ts:342-351`
- `api_usage_logs` (const) → `src/server/db/schema.ts:356-366`

### `src/server/db/seed.ts` (lines 1-508)
- `getMonday` (function) → `src/server/db/seed.ts:15-21`
- `SEEDED_POSTS_DATA` (const) → `src/server/db/seed.ts:23-69`
- `runSeed` (function) → `src/server/db/seed.ts:348-401`
- `resetAndSeedFreshData` (function) → `src/server/db/seed.ts:407-493`
