---
node: server-db
title: "Database Layer (SQLite WAL + Drizzle Schema & Migrations)"
covers:
  - src/server/db/client.ts:1-105
  - src/server/db/client.ts:8-11 # interface DatabaseConnection
  - src/server/db/client.ts:20-73 # function createDatabaseConnection
  - src/server/db/client.ts:78-83 # function createTestDb
  - src/server/db/client.ts:87-92 # function getDatabase
  - src/server/db/client.ts:94-98 # const db
  - src/server/db/client.ts:100-104 # const sqlite
  - src/server/db/migrate.ts:1-22
  - src/server/db/migrate.ts:5-8 # function runMigrations
  - src/server/db/sanitize.ts:1-78
  - src/server/db/sanitize.ts:14-64 # function sanitizeDatabase
  - src/server/db/schema.ts:1-330
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
  - src/server/db/schema.ts:86-101 # const companies
  - src/server/db/schema.ts:106-118 # const photo_assets
  - src/server/db/schema.ts:123-130 # const weekly_schedules
  - src/server/db/schema.ts:135-152 # const posts
  - src/server/db/schema.ts:157-172 # const post_slides
  - src/server/db/schema.ts:178-187 # const ai_provider_settings
  - src/server/db/schema.ts:192-196 # const companiesRelations
  - src/server/db/schema.ts:198-203 # const photoAssetsRelations
  - src/server/db/schema.ts:205-211 # const weeklySchedulesRelations
  - src/server/db/schema.ts:213-223 # const postsRelations
  - src/server/db/schema.ts:225-234 # const postSlidesRelations
  - src/server/db/schema.ts:239-253 # const companyInsertSchema
  - src/server/db/schema.ts:255-264 # const photoAssetInsertSchema
  - src/server/db/schema.ts:266-270 # const weeklyScheduleInsertSchema
  - src/server/db/schema.ts:272-284 # const postInsertSchema
  - src/server/db/schema.ts:286-297 # const postSlideInsertSchema
  - src/server/db/schema.ts:299-307 # const aiProviderSettingsInsertSchema
  - src/server/db/schema.ts:312-328 # const company_settings
  - src/server/db/seed.ts:1-59
  - src/server/db/seed.ts:5-45 # function runSeed
---

# Database Layer (SQLite WAL + Drizzle Schema & Migrations)

Manages ACID persistence in SQLite with WAL mode, schema definitions (companies, photo_assets, weekly_schedules, scheduled_posts, post_slides, ai_provider_settings), migrations, and initial seeding.

## Covered Files & Symbols

### `src/server/db/client.ts` (lines 1-105)
- `DatabaseConnection` (interface) → `src/server/db/client.ts:8-11`
- `createDatabaseConnection` (function) → `src/server/db/client.ts:20-73`
- `createTestDb` (function) → `src/server/db/client.ts:78-83`
- `getDatabase` (function) → `src/server/db/client.ts:87-92`
- `db` (const) → `src/server/db/client.ts:94-98`
- `sqlite` (const) → `src/server/db/client.ts:100-104`

### `src/server/db/migrate.ts` (lines 1-22)
- `runMigrations` (function) → `src/server/db/migrate.ts:5-8`

### `src/server/db/sanitize.ts` (lines 1-78)
- `sanitizeDatabase` (function) → `src/server/db/sanitize.ts:14-64`

### `src/server/db/schema.ts` (lines 1-330)
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
- `companies` (const) → `src/server/db/schema.ts:86-101`
- `photo_assets` (const) → `src/server/db/schema.ts:106-118`
- `weekly_schedules` (const) → `src/server/db/schema.ts:123-130`
- `posts` (const) → `src/server/db/schema.ts:135-152`
- `post_slides` (const) → `src/server/db/schema.ts:157-172`
- `ai_provider_settings` (const) → `src/server/db/schema.ts:178-187`
- `companiesRelations` (const) → `src/server/db/schema.ts:192-196`
- `photoAssetsRelations` (const) → `src/server/db/schema.ts:198-203`
- `weeklySchedulesRelations` (const) → `src/server/db/schema.ts:205-211`
- `postsRelations` (const) → `src/server/db/schema.ts:213-223`
- `postSlidesRelations` (const) → `src/server/db/schema.ts:225-234`
- `companyInsertSchema` (const) → `src/server/db/schema.ts:239-253`
- `photoAssetInsertSchema` (const) → `src/server/db/schema.ts:255-264`
- `weeklyScheduleInsertSchema` (const) → `src/server/db/schema.ts:266-270`
- `postInsertSchema` (const) → `src/server/db/schema.ts:272-284`
- `postSlideInsertSchema` (const) → `src/server/db/schema.ts:286-297`
- `aiProviderSettingsInsertSchema` (const) → `src/server/db/schema.ts:299-307`
- `company_settings` (const) → `src/server/db/schema.ts:312-328`

### `src/server/db/seed.ts` (lines 1-59)
- `runSeed` (function) → `src/server/db/seed.ts:5-45`
