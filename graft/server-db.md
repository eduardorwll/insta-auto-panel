---
node: server-db
title: "Database Layer (SQLite WAL + Drizzle Schema & Migrations)"
covers:
  - src/server/db/client.ts:1-146
  - src/server/db/client.ts:8-11 # interface DatabaseConnection
  - src/server/db/client.ts:20-114 # function createDatabaseConnection
  - src/server/db/client.ts:119-124 # function createTestDb
  - src/server/db/client.ts:128-133 # function getDatabase
  - src/server/db/client.ts:135-139 # const db
  - src/server/db/client.ts:141-145 # const sqlite
  - src/server/db/migrate.ts:1-22
  - src/server/db/migrate.ts:5-8 # function runMigrations
  - src/server/db/sanitize.ts:1-78
  - src/server/db/sanitize.ts:14-64 # function sanitizeDatabase
  - src/server/db/schema.ts:1-422
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
  - src/server/db/schema.ts:138-158 # const posts
  - src/server/db/schema.ts:163-178 # const post_slides
  - src/server/db/schema.ts:184-193 # const ai_provider_settings
  - src/server/db/schema.ts:198-202 # const companiesRelations
  - src/server/db/schema.ts:204-209 # const photoAssetsRelations
  - src/server/db/schema.ts:211-217 # const weeklySchedulesRelations
  - src/server/db/schema.ts:219-229 # const postsRelations
  - src/server/db/schema.ts:231-240 # const postSlidesRelations
  - src/server/db/schema.ts:245-262 # const companyInsertSchema
  - src/server/db/schema.ts:264-273 # const photoAssetInsertSchema
  - src/server/db/schema.ts:275-279 # const weeklyScheduleInsertSchema
  - src/server/db/schema.ts:281-295 # const postInsertSchema
  - src/server/db/schema.ts:297-308 # const postSlideInsertSchema
  - src/server/db/schema.ts:310-318 # const aiProviderSettingsInsertSchema
  - src/server/db/schema.ts:323-339 # const company_settings
  - src/server/db/schema.ts:344-353 # const api_usage_rules
  - src/server/db/schema.ts:358-368 # const api_usage_logs
  - src/server/db/schema.ts:373-398 # const styleBlueprintSchema
  - src/server/db/schema.ts:400-400 # type StyleBlueprint
  - src/server/db/schema.ts:405-418 # const company_post_types
  - src/server/db/seed.ts:1-508
  - src/server/db/seed.ts:15-21 # function getMonday
  - src/server/db/seed.ts:23-69 # const SEEDED_POSTS_DATA
  - src/server/db/seed.ts:348-401 # function runSeed
  - src/server/db/seed.ts:407-493 # function resetAndSeedFreshData
---

# Database Layer (SQLite WAL + Drizzle Schema & Migrations)

Manages ACID persistence in SQLite with WAL mode, schema definitions (companies, photo_assets, weekly_schedules, scheduled_posts, post_slides, ai_provider_settings), migrations, and initial seeding.

## Covered Files & Symbols

### `src/server/db/client.ts` (lines 1-146)
- `DatabaseConnection` (interface) → `src/server/db/client.ts:8-11`
- `createDatabaseConnection` (function) → `src/server/db/client.ts:20-114`
- `createTestDb` (function) → `src/server/db/client.ts:119-124`
- `getDatabase` (function) → `src/server/db/client.ts:128-133`
- `db` (const) → `src/server/db/client.ts:135-139`
- `sqlite` (const) → `src/server/db/client.ts:141-145`

### `src/server/db/migrate.ts` (lines 1-22)
- `runMigrations` (function) → `src/server/db/migrate.ts:5-8`

### `src/server/db/sanitize.ts` (lines 1-78)
- `sanitizeDatabase` (function) → `src/server/db/sanitize.ts:14-64`

### `src/server/db/schema.ts` (lines 1-422)
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
- `posts` (const) → `src/server/db/schema.ts:138-158`
- `post_slides` (const) → `src/server/db/schema.ts:163-178`
- `ai_provider_settings` (const) → `src/server/db/schema.ts:184-193`
- `companiesRelations` (const) → `src/server/db/schema.ts:198-202`
- `photoAssetsRelations` (const) → `src/server/db/schema.ts:204-209`
- `weeklySchedulesRelations` (const) → `src/server/db/schema.ts:211-217`
- `postsRelations` (const) → `src/server/db/schema.ts:219-229`
- `postSlidesRelations` (const) → `src/server/db/schema.ts:231-240`
- `companyInsertSchema` (const) → `src/server/db/schema.ts:245-262`
- `photoAssetInsertSchema` (const) → `src/server/db/schema.ts:264-273`
- `weeklyScheduleInsertSchema` (const) → `src/server/db/schema.ts:275-279`
- `postInsertSchema` (const) → `src/server/db/schema.ts:281-295`
- `postSlideInsertSchema` (const) → `src/server/db/schema.ts:297-308`
- `aiProviderSettingsInsertSchema` (const) → `src/server/db/schema.ts:310-318`
- `company_settings` (const) → `src/server/db/schema.ts:323-339`
- `api_usage_rules` (const) → `src/server/db/schema.ts:344-353`
- `api_usage_logs` (const) → `src/server/db/schema.ts:358-368`
- `styleBlueprintSchema` (const) → `src/server/db/schema.ts:373-398`
- `StyleBlueprint` (type) → `src/server/db/schema.ts:400-400`
- `company_post_types` (const) → `src/server/db/schema.ts:405-418`

### `src/server/db/seed.ts` (lines 1-508)
- `getMonday` (function) → `src/server/db/seed.ts:15-21`
- `SEEDED_POSTS_DATA` (const) → `src/server/db/seed.ts:23-69`
- `runSeed` (function) → `src/server/db/seed.ts:348-401`
- `resetAndSeedFreshData` (function) → `src/server/db/seed.ts:407-493`
