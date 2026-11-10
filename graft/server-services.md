---
node: server-services
title: "Domain Services & AI Provider Adapters"
covers:
  - src/server/services/ai/claude.ts:1-102
  - src/server/services/ai/claude.ts:8-13 # interface AnthropicMessagesResponse
  - src/server/services/ai/claude.ts:18-101 # class ClaudeProvider
  - src/server/services/ai/factory.ts:1-76
  - src/server/services/ai/factory.ts:10-75 # class AIProviderFactory
  - src/server/services/ai/gemini.ts:1-86
  - src/server/services/ai/gemini.ts:7-85 # class GeminiProvider
  - src/server/services/ai/mlstudio.ts:1-97
  - src/server/services/ai/mlstudio.ts:12-96 # class MLStudioProvider
  - src/server/services/ai/openai.ts:1-98
  - src/server/services/ai/openai.ts:8-97 # class OpenAIProvider
  - src/server/services/ai/provider.ts:1-275
  - src/server/services/ai/provider.ts:5-16 # interface CompanyProfile
  - src/server/services/ai/provider.ts:18-26 # interface AISettings
  - src/server/services/ai/provider.ts:28-33 # interface TenantPhotoSummary
  - src/server/services/ai/provider.ts:35-41 # const carouselSlideSchema
  - src/server/services/ai/provider.ts:43-52 # const carouselResponseSchema
  - src/server/services/ai/provider.ts:54-54 # type CarouselSlidesResponse
  - src/server/services/ai/provider.ts:56-64 # interface GeneratePostParams
  - src/server/services/ai/provider.ts:71-78 # function sanitizeTenantField
  - src/server/services/ai/provider.ts:80-80 # const LOCAL_PROVIDERS
  - src/server/services/ai/provider.ts:87-122 # function assertSafeOutboundUrl
  - src/server/services/ai/provider.ts:124-128 # interface AIProvider
  - src/server/services/auth/session.ts:1-139
  - src/server/services/auth/session.ts:3-3 # const SESSION_COOKIE_NAME
  - src/server/services/auth/session.ts:4-5 # const SESSION_TTL_SECONDS
  - src/server/services/auth/session.ts:5-5 # const MAX_LOGIN_ATTEMPTS
  - src/server/services/auth/session.ts:6-11 # const LOGIN_WINDOW_MS
  - src/server/services/auth/session.ts:8-11 # interface RateLimitEntry
  - src/server/services/auth/session.ts:13-13 # const loginAttemptsByIp
  - src/server/services/auth/session.ts:15-15 # const ADMIN_USERNAME
  - src/server/services/auth/session.ts:16-16 # const RAW_ADMIN_PASSWORD
  - src/server/services/auth/session.ts:17-23 # const ADMIN_PASSWORD_HASH
  - src/server/services/auth/session.ts:25-29 # const SESSION_SECRET
  - src/server/services/auth/session.ts:31-33 # function resetLoginRateLimiter
  - src/server/services/auth/session.ts:35-51 # function checkLoginRateLimit
  - src/server/services/auth/session.ts:53-61 # function recordLoginFailure
  - src/server/services/auth/session.ts:63-65 # function clearLoginFailures
  - src/server/services/auth/session.ts:67-74 # function verifyAdminCredentials
  - src/server/services/auth/session.ts:76-81 # function createSessionToken
  - src/server/services/auth/session.ts:83-111 # function verifySessionToken
  - src/server/services/auth/session.ts:113-123 # function extractSessionFromRequest
  - src/server/services/auth/session.ts:125-128 # function buildSessionCookieHeader
  - src/server/services/auth/session.ts:130-132 # function buildLogoutCookieHeader
  - src/server/services/auth/session.ts:134-138 # function isAuthEnforced
  - src/server/services/design/image-provider.ts:1-391
  - src/server/services/design/image-provider.ts:3-8 # interface ImageProviderConfig
  - src/server/services/design/image-provider.ts:10-17 # interface GenerateBackgroundParams
  - src/server/services/design/image-provider.ts:19-25 # interface GenerateBackgroundResult
  - src/server/services/design/image-provider.ts:27-30 # interface ImageProvider
  - src/server/services/design/image-provider.ts:36-84 # function buildEditorialBackdropDataUri
  - src/server/services/design/image-provider.ts:86-120 # class PollinationsImageProvider
  - src/server/services/design/image-provider.ts:122-194 # class FalFluxImageProvider
  - src/server/services/design/image-provider.ts:197-197 # const IMAGE_REQUEST_TIMEOUT_MS
  - src/server/services/design/image-provider.ts:204-219 # function buildImagePrompt
  - src/server/services/design/image-provider.ts:221-240 # function svgFallback
  - src/server/services/design/image-provider.ts:243-260 # function postJson
  - src/server/services/design/image-provider.ts:263-265 # function canCallApi
  - src/server/services/design/image-provider.ts:267-290 # class OpenRouterImageProvider
  - src/server/services/design/image-provider.ts:292-320 # class GeminiImagenProvider
  - src/server/services/design/image-provider.ts:322-343 # class OpenAIImageProvider
  - src/server/services/design/image-provider.ts:345-369 # class ComfyUILocalProvider
  - src/server/services/design/image-provider.ts:371-390 # class ImageProviderFactory
  - src/server/services/design/template-engine.ts:1-322
  - src/server/services/design/template-engine.ts:4-11 # interface OpenDesignBrandKit
  - src/server/services/design/template-engine.ts:13-23 # interface OpenDesignSlideFields
  - src/server/services/design/template-engine.ts:25-32 # function escapeXml
  - src/server/services/design/template-engine.ts:38-75 # function wrapEditorialLines
  - src/server/services/design/template-engine.ts:81-216 # function renderOpenDesignSlideSvg
  - src/server/services/design/template-engine.ts:221-231 # const CRC_TABLE
  - src/server/services/design/template-engine.ts:233-241 # function crc32
  - src/server/services/design/template-engine.ts:243-251 # function makePngChunk
  - src/server/services/design/template-engine.ts:253-259 # function hexToRgb
  - src/server/services/design/template-engine.ts:266-321 # function renderSlidePngBuffer
  - src/server/services/export/autosocial.ts:1-168
  - src/server/services/export/autosocial.ts:13-13 # const BASE_QUEUE_DIR
  - src/server/services/export/autosocial.ts:14-14 # const UPLOADS_DIR
  - src/server/services/export/autosocial.ts:15-15 # const RENDERS_DIR
  - src/server/services/export/autosocial.ts:17-22 # interface QueueStatusResult
  - src/server/services/export/autosocial.ts:24-31 # function getCompanyQueueDirs
  - src/server/services/export/autosocial.ts:33-39 # function ensureQueueDirs
  - src/server/services/export/autosocial.ts:41-121 # function enqueuePostForAutoSocial
  - src/server/services/export/autosocial.ts:123-143 # function enqueueScheduleForAutoSocial
  - src/server/services/export/autosocial.ts:145-167 # function getAutoSocialQueueStatus
  - src/server/services/export/canva.ts:1-122
  - src/server/services/export/canva.ts:11-18 # function escapeCsvCell
  - src/server/services/export/canva.ts:20-121 # function generateCanvaCsv
  - src/server/services/instagram/cookies.ts:1-128
  - src/server/services/instagram/cookies.ts:1-10 # interface CookieEntry
  - src/server/services/instagram/cookies.ts:12-17 # interface ParseInstagramCookiesInputParams
  - src/server/services/instagram/cookies.ts:19-24 # interface ParseInstagramCookiesResult
  - src/server/services/instagram/cookies.ts:30-127 # function parseInstagramCookiesInput
  - src/server/services/schedules/schedule-service.ts:1-338
  - src/server/services/schedules/schedule-service.ts:5-13 # const DAYS_OF_WEEK
  - src/server/services/schedules/schedule-service.ts:15-23 # const DAY_ORDER
  - src/server/services/schedules/schedule-service.ts:25-28 # interface PostWithSlides
  - src/server/services/schedules/schedule-service.ts:30-33 # interface WeeklyScheduleResult
  - src/server/services/schedules/schedule-service.ts:35-44 # interface CreatePostParams
  - src/server/services/schedules/schedule-service.ts:46-55 # interface UpdatePostParams
  - src/server/services/schedules/schedule-service.ts:57-63 # interface UpdateSlideItem
  - src/server/services/schedules/schedule-service.ts:68-174 # function getOrCreateWeeklySchedule
  - src/server/services/schedules/schedule-service.ts:179-244 # function updatePostWithSlides
  - src/server/services/schedules/schedule-service.ts:249-255 # function getPostSlides
  - src/server/services/schedules/schedule-service.ts:260-279 # function updatePostSlidesContent
  - src/server/services/schedules/schedule-service.ts:284-325 # function createSchedulePost
  - src/server/services/schedules/schedule-service.ts:330-337 # function deleteSchedulePost
---

# Domain Services & AI Provider Adapters

Implements the Agnostic AI Adapter Pattern (ML Studio API, Gemini, OpenAI, Claude, Groq, Ollama), Zod runtime validation, RFC 4180 UTF-8 BOM Canva CSV generator, and AutoSocial filesystem sidecar queue.

## Covered Files & Symbols

### `src/server/services/ai/claude.ts` (lines 1-102)
- `AnthropicMessagesResponse` (interface) → `src/server/services/ai/claude.ts:8-13`
- `ClaudeProvider` (class) → `src/server/services/ai/claude.ts:18-101`

### `src/server/services/ai/factory.ts` (lines 1-76)
- `AIProviderFactory` (class) → `src/server/services/ai/factory.ts:10-75`

### `src/server/services/ai/gemini.ts` (lines 1-86)
- `GeminiProvider` (class) → `src/server/services/ai/gemini.ts:7-85`

### `src/server/services/ai/mlstudio.ts` (lines 1-97)
- `MLStudioProvider` (class) → `src/server/services/ai/mlstudio.ts:12-96`

### `src/server/services/ai/openai.ts` (lines 1-98)
- `OpenAIProvider` (class) → `src/server/services/ai/openai.ts:8-97`

### `src/server/services/ai/provider.ts` (lines 1-275)
- `CompanyProfile` (interface) → `src/server/services/ai/provider.ts:5-16`
- `AISettings` (interface) → `src/server/services/ai/provider.ts:18-26`
- `TenantPhotoSummary` (interface) → `src/server/services/ai/provider.ts:28-33`
- `carouselSlideSchema` (const) → `src/server/services/ai/provider.ts:35-41`
- `carouselResponseSchema` (const) → `src/server/services/ai/provider.ts:43-52`
- `CarouselSlidesResponse` (type) → `src/server/services/ai/provider.ts:54-54`
- `GeneratePostParams` (interface) → `src/server/services/ai/provider.ts:56-64`
- `sanitizeTenantField` (function) → `src/server/services/ai/provider.ts:71-78`
- `LOCAL_PROVIDERS` (const) → `src/server/services/ai/provider.ts:80-80`
- `assertSafeOutboundUrl` (function) → `src/server/services/ai/provider.ts:87-122`
- `AIProvider` (interface) → `src/server/services/ai/provider.ts:124-128`

### `src/server/services/auth/session.ts` (lines 1-139)
- `SESSION_COOKIE_NAME` (const) → `src/server/services/auth/session.ts:3-3`
- `SESSION_TTL_SECONDS` (const) → `src/server/services/auth/session.ts:4-5`
- `MAX_LOGIN_ATTEMPTS` (const) → `src/server/services/auth/session.ts:5-5`
- `LOGIN_WINDOW_MS` (const) → `src/server/services/auth/session.ts:6-11`
- `RateLimitEntry` (interface) → `src/server/services/auth/session.ts:8-11`
- `loginAttemptsByIp` (const) → `src/server/services/auth/session.ts:13-13`
- `ADMIN_USERNAME` (const) → `src/server/services/auth/session.ts:15-15`
- `RAW_ADMIN_PASSWORD` (const) → `src/server/services/auth/session.ts:16-16`
- `ADMIN_PASSWORD_HASH` (const) → `src/server/services/auth/session.ts:17-23`
- `SESSION_SECRET` (const) → `src/server/services/auth/session.ts:25-29`
- `resetLoginRateLimiter` (function) → `src/server/services/auth/session.ts:31-33`
- `checkLoginRateLimit` (function) → `src/server/services/auth/session.ts:35-51`
- `recordLoginFailure` (function) → `src/server/services/auth/session.ts:53-61`
- `clearLoginFailures` (function) → `src/server/services/auth/session.ts:63-65`
- `verifyAdminCredentials` (function) → `src/server/services/auth/session.ts:67-74`
- `createSessionToken` (function) → `src/server/services/auth/session.ts:76-81`
- `verifySessionToken` (function) → `src/server/services/auth/session.ts:83-111`
- `extractSessionFromRequest` (function) → `src/server/services/auth/session.ts:113-123`
- `buildSessionCookieHeader` (function) → `src/server/services/auth/session.ts:125-128`
- `buildLogoutCookieHeader` (function) → `src/server/services/auth/session.ts:130-132`
- `isAuthEnforced` (function) → `src/server/services/auth/session.ts:134-138`

### `src/server/services/design/image-provider.ts` (lines 1-391)
- `ImageProviderConfig` (interface) → `src/server/services/design/image-provider.ts:3-8`
- `GenerateBackgroundParams` (interface) → `src/server/services/design/image-provider.ts:10-17`
- `GenerateBackgroundResult` (interface) → `src/server/services/design/image-provider.ts:19-25`
- `ImageProvider` (interface) → `src/server/services/design/image-provider.ts:27-30`
- `buildEditorialBackdropDataUri` (function) → `src/server/services/design/image-provider.ts:36-84`
- `PollinationsImageProvider` (class) → `src/server/services/design/image-provider.ts:86-120`
- `FalFluxImageProvider` (class) → `src/server/services/design/image-provider.ts:122-194`
- `IMAGE_REQUEST_TIMEOUT_MS` (const) → `src/server/services/design/image-provider.ts:197-197`
- `buildImagePrompt` (function) → `src/server/services/design/image-provider.ts:204-219`
- `svgFallback` (function) → `src/server/services/design/image-provider.ts:221-240`
- `postJson` (function) → `src/server/services/design/image-provider.ts:243-260`
- `canCallApi` (function) → `src/server/services/design/image-provider.ts:263-265`
- `OpenRouterImageProvider` (class) → `src/server/services/design/image-provider.ts:267-290`
- `GeminiImagenProvider` (class) → `src/server/services/design/image-provider.ts:292-320`
- `OpenAIImageProvider` (class) → `src/server/services/design/image-provider.ts:322-343`
- `ComfyUILocalProvider` (class) → `src/server/services/design/image-provider.ts:345-369`
- `ImageProviderFactory` (class) → `src/server/services/design/image-provider.ts:371-390`

### `src/server/services/design/template-engine.ts` (lines 1-322)
- `OpenDesignBrandKit` (interface) → `src/server/services/design/template-engine.ts:4-11`
- `OpenDesignSlideFields` (interface) → `src/server/services/design/template-engine.ts:13-23`
- `escapeXml` (function) → `src/server/services/design/template-engine.ts:25-32`
- `wrapEditorialLines` (function) → `src/server/services/design/template-engine.ts:38-75`
- `renderOpenDesignSlideSvg` (function) → `src/server/services/design/template-engine.ts:81-216`
- `CRC_TABLE` (const) → `src/server/services/design/template-engine.ts:221-231`
- `crc32` (function) → `src/server/services/design/template-engine.ts:233-241`
- `makePngChunk` (function) → `src/server/services/design/template-engine.ts:243-251`
- `hexToRgb` (function) → `src/server/services/design/template-engine.ts:253-259`
- `renderSlidePngBuffer` (function) → `src/server/services/design/template-engine.ts:266-321`

### `src/server/services/export/autosocial.ts` (lines 1-168)
- `BASE_QUEUE_DIR` (const) → `src/server/services/export/autosocial.ts:13-13`
- `UPLOADS_DIR` (const) → `src/server/services/export/autosocial.ts:14-14`
- `RENDERS_DIR` (const) → `src/server/services/export/autosocial.ts:15-15`
- `QueueStatusResult` (interface) → `src/server/services/export/autosocial.ts:17-22`
- `getCompanyQueueDirs` (function) → `src/server/services/export/autosocial.ts:24-31`
- `ensureQueueDirs` (function) → `src/server/services/export/autosocial.ts:33-39`
- `enqueuePostForAutoSocial` (function) → `src/server/services/export/autosocial.ts:41-121`
- `enqueueScheduleForAutoSocial` (function) → `src/server/services/export/autosocial.ts:123-143`
- `getAutoSocialQueueStatus` (function) → `src/server/services/export/autosocial.ts:145-167`

### `src/server/services/export/canva.ts` (lines 1-122)
- `escapeCsvCell` (function) → `src/server/services/export/canva.ts:11-18`
- `generateCanvaCsv` (function) → `src/server/services/export/canva.ts:20-121`

### `src/server/services/instagram/cookies.ts` (lines 1-128)
- `CookieEntry` (interface) → `src/server/services/instagram/cookies.ts:1-10`
- `ParseInstagramCookiesInputParams` (interface) → `src/server/services/instagram/cookies.ts:12-17`
- `ParseInstagramCookiesResult` (interface) → `src/server/services/instagram/cookies.ts:19-24`
- `parseInstagramCookiesInput` (function) → `src/server/services/instagram/cookies.ts:30-127`

### `src/server/services/schedules/schedule-service.ts` (lines 1-338)
- `DAYS_OF_WEEK` (const) → `src/server/services/schedules/schedule-service.ts:5-13`
- `DAY_ORDER` (const) → `src/server/services/schedules/schedule-service.ts:15-23`
- `PostWithSlides` (interface) → `src/server/services/schedules/schedule-service.ts:25-28`
- `WeeklyScheduleResult` (interface) → `src/server/services/schedules/schedule-service.ts:30-33`
- `CreatePostParams` (interface) → `src/server/services/schedules/schedule-service.ts:35-44`
- `UpdatePostParams` (interface) → `src/server/services/schedules/schedule-service.ts:46-55`
- `UpdateSlideItem` (interface) → `src/server/services/schedules/schedule-service.ts:57-63`
- `getOrCreateWeeklySchedule` (function) → `src/server/services/schedules/schedule-service.ts:68-174`
- `updatePostWithSlides` (function) → `src/server/services/schedules/schedule-service.ts:179-244`
- `getPostSlides` (function) → `src/server/services/schedules/schedule-service.ts:249-255`
- `updatePostSlidesContent` (function) → `src/server/services/schedules/schedule-service.ts:260-279`
- `createSchedulePost` (function) → `src/server/services/schedules/schedule-service.ts:284-325`
- `deleteSchedulePost` (function) → `src/server/services/schedules/schedule-service.ts:330-337`
