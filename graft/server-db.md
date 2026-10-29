---
node: server-db
title: "Database Layer (SQLite WAL + Drizzle Schema & Migrations)"
covers:
  - src/server/db/client.ts:1-76
  - src/server/db/client.ts:8-11 # interface DatabaseConnection
  - src/server/db/client.ts:20-44 # function createDatabaseConnection
  - src/server/db/client.ts:49-54 # function createTestDb
  - src/server/db/client.ts:58-63 # function getDatabase
  - src/server/db/client.ts:65-69 # const db
  - src/server/db/client.ts:71-75 # const sqlite
  - src/server/db/migrate.ts:1-22
  - src/server/db/migrate.ts:5-8 # function runMigrations
  - src/server/db/schema.ts:1-274
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
  - src/server/db/schema.ts:60-75 # const companies
  - src/server/db/schema.ts:80-92 # const photo_assets
  - src/server/db/schema.ts:97-104 # const weekly_schedules
  - src/server/db/schema.ts:109-125 # const posts
  - src/server/db/schema.ts:130-142 # const post_slides
  - src/server/db/schema.ts:148-157 # const ai_provider_settings
  - src/server/db/schema.ts:162-166 # const companiesRelations
  - src/server/db/schema.ts:168-173 # const photoAssetsRelations
  - src/server/db/schema.ts:175-181 # const weeklySchedulesRelations
  - src/server/db/schema.ts:183-193 # const postsRelations
  - src/server/db/schema.ts:195-204 # const postSlidesRelations
  - src/server/db/schema.ts:209-223 # const companyInsertSchema
  - src/server/db/schema.ts:225-234 # const photoAssetInsertSchema
  - src/server/db/schema.ts:236-240 # const weeklyScheduleInsertSchema
  - src/server/db/schema.ts:242-253 # const postInsertSchema
  - src/server/db/schema.ts:255-263 # const postSlideInsertSchema
  - src/server/db/schema.ts:265-273 # const aiProviderSettingsInsertSchema
  - src/server/db/seed.ts:1-59
  - src/server/db/seed.ts:5-45 # function runSeed
---

# Database Layer (SQLite WAL + Drizzle Schema & Migrations)

Manages ACID persistence in SQLite with WAL mode, schema definitions (companies, photo_assets, weekly_schedules, scheduled_posts, post_slides, ai_provider_settings), migrations, and initial seeding.

## Covered Files & Symbols

### `src/server/db/client.ts` (lines 1-76)
- `DatabaseConnection` (interface) → `src/server/db/client.ts:8-11`
- `createDatabaseConnection` (function) → `src/server/db/client.ts:20-44`
- `createTestDb` (function) → `src/server/db/client.ts:49-54`
- `getDatabase` (function) → `src/server/db/client.ts:58-63`
- `db` (const) → `src/server/db/client.ts:65-69`
- `sqlite` (const) → `src/server/db/client.ts:71-75`

### `src/server/db/migrate.ts` (lines 1-22)
- `runMigrations` (function) → `src/server/db/migrate.ts:5-8`

### `src/server/db/schema.ts` (lines 1-274)
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
- `companies` (const) → `src/server/db/schema.ts:60-75`
- `photo_assets` (const) → `src/server/db/schema.ts:80-92`
- `weekly_schedules` (const) → `src/server/db/schema.ts:97-104`
- `posts` (const) → `src/server/db/schema.ts:109-125`
- `post_slides` (const) → `src/server/db/schema.ts:130-142`
- `ai_provider_settings` (const) → `src/server/db/schema.ts:148-157`
- `companiesRelations` (const) → `src/server/db/schema.ts:162-166`
- `photoAssetsRelations` (const) → `src/server/db/schema.ts:168-173`
- `weeklySchedulesRelations` (const) → `src/server/db/schema.ts:175-181`
- `postsRelations` (const) → `src/server/db/schema.ts:183-193`
- `postSlidesRelations` (const) → `src/server/db/schema.ts:195-204`
- `companyInsertSchema` (const) → `src/server/db/schema.ts:209-223`
- `photoAssetInsertSchema` (const) → `src/server/db/schema.ts:225-234`
- `weeklyScheduleInsertSchema` (const) → `src/server/db/schema.ts:236-240`
- `postInsertSchema` (const) → `src/server/db/schema.ts:242-253`
- `postSlideInsertSchema` (const) → `src/server/db/schema.ts:255-263`
- `aiProviderSettingsInsertSchema` (const) → `src/server/db/schema.ts:265-273`

### `src/server/db/seed.ts` (lines 1-59)
- `runSeed` (function) → `src/server/db/seed.ts:5-45`
