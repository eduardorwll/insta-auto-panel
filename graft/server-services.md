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
  - src/server/services/ai/openrouter-client.ts:1-290
  - src/server/services/ai/openrouter-client.ts:3-11 # interface OpenRouterTextModelItem
  - src/server/services/ai/openrouter-client.ts:13-19 # interface OpenRouterImageModelItem
  - src/server/services/ai/openrouter-client.ts:21-26 # interface OpenRouterCatalogResult
  - src/server/services/ai/openrouter-client.ts:28-36 # interface OpenRouterKeyStatus
  - src/server/services/ai/openrouter-client.ts:38-47 # const CURATED_OPENROUTER_TEXT_MODELS
  - src/server/services/ai/openrouter-client.ts:95-102 # const CURATED_OPENROUTER_IMAGE_MODELS
  - src/server/services/ai/openrouter-client.ts:145-150 # function createOpenRouterSdkClient
  - src/server/services/ai/openrouter-client.ts:156-225 # function fetchOpenRouterCatalog
  - src/server/services/ai/openrouter-client.ts:230-289 # function fetchOpenRouterKeyStatus
  - src/server/services/ai/provider.ts:1-298
  - src/server/services/ai/provider.ts:5-16 # interface CompanyProfile
  - src/server/services/ai/provider.ts:18-26 # interface AISettings
  - src/server/services/ai/provider.ts:28-33 # interface TenantPhotoSummary
  - src/server/services/ai/provider.ts:35-41 # const carouselSlideSchema
  - src/server/services/ai/provider.ts:43-52 # const carouselResponseSchema
  - src/server/services/ai/provider.ts:54-54 # type CarouselSlidesResponse
  - src/server/services/ai/provider.ts:56-68 # interface GeneratePostParams
  - src/server/services/ai/provider.ts:75-82 # function sanitizeTenantField
  - src/server/services/ai/provider.ts:84-84 # const LOCAL_PROVIDERS
  - src/server/services/ai/provider.ts:91-126 # function assertSafeOutboundUrl
  - src/server/services/ai/provider.ts:128-133 # interface AIProvider
  - src/server/services/ai/quota-guard.ts:1-269
  - src/server/services/ai/quota-guard.ts:5-5 # type ApiOperationType
  - src/server/services/ai/quota-guard.ts:7-15 # interface ApiUsageRuleConfig
  - src/server/services/ai/quota-guard.ts:17-23 # interface ApiUsageSummary
  - src/server/services/ai/quota-guard.ts:25-25 # const rpmSlidingWindow
  - src/server/services/ai/quota-guard.ts:27-51 # function ensureQuotaTablesExist
  - src/server/services/ai/quota-guard.ts:53-81 # function getApiUsageRules
  - src/server/services/ai/quota-guard.ts:83-84 # function upsertApiUsageRules
  - src/server/services/ai/quota-guard.ts:129-171 # function getApiUsageSummary
  - src/server/services/ai/quota-guard.ts:173-193 # function recordApiUsage
  - src/server/services/ai/quota-guard.ts:195-268 # function enforceApiQuotaAndRateLimit
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
  - src/server/services/design/blueprint-extractor.ts:1-221
  - src/server/services/design/blueprint-extractor.ts:11-19 # interface ExtractBlueprintInput
  - src/server/services/design/blueprint-extractor.ts:26-156 # function extractStyleBlueprint
  - src/server/services/design/blueprint-extractor.ts:158-192 # function listCompanyPostTypes
  - src/server/services/design/blueprint-extractor.ts:194-220 # function resolvePostStyleBlueprint
  - src/server/services/design/image-provider.ts:1-395
  - src/server/services/design/image-provider.ts:3-8 # interface ImageProviderConfig
  - src/server/services/design/image-provider.ts:10-17 # interface GenerateBackgroundParams
  - src/server/services/design/image-provider.ts:19-25 # interface GenerateBackgroundResult
  - src/server/services/design/image-provider.ts:27-30 # interface ImageProvider
  - src/server/services/design/image-provider.ts:36-84 # function buildEditorialBackdropDataUri
  - src/server/services/design/image-provider.ts:86-120 # class PollinationsImageProvider
  - src/server/services/design/image-provider.ts:122-194 # class FalFluxImageProvider
  - src/server/services/design/image-provider.ts:197-197 # const IMAGE_REQUEST_TIMEOUT_MS
  - src/server/services/design/image-provider.ts:204-223 # function buildImagePrompt
  - src/server/services/design/image-provider.ts:225-244 # function svgFallback
  - src/server/services/design/image-provider.ts:247-264 # function postJson
  - src/server/services/design/image-provider.ts:267-269 # function canCallApi
  - src/server/services/design/image-provider.ts:271-294 # class OpenRouterImageProvider
  - src/server/services/design/image-provider.ts:296-324 # class GeminiImagenProvider
  - src/server/services/design/image-provider.ts:326-347 # class OpenAIImageProvider
  - src/server/services/design/image-provider.ts:349-373 # class ComfyUILocalProvider
  - src/server/services/design/image-provider.ts:375-394 # class ImageProviderFactory
  - src/server/services/design/template-engine.ts:1-395
  - src/server/services/design/template-engine.ts:5-12 # interface OpenDesignBrandKit
  - src/server/services/design/template-engine.ts:14-34 # interface OpenDesignSlideFields
  - src/server/services/design/template-engine.ts:36-43 # function escapeXml
  - src/server/services/design/template-engine.ts:49-86 # function wrapEditorialLines
  - src/server/services/design/template-engine.ts:92-285 # function renderOpenDesignSlideSvg
  - src/server/services/design/template-engine.ts:290-300 # const CRC_TABLE
  - src/server/services/design/template-engine.ts:302-310 # function crc32
  - src/server/services/design/template-engine.ts:312-320 # function makePngChunk
  - src/server/services/design/template-engine.ts:322-328 # function hexToRgb
  - src/server/services/design/template-engine.ts:335-394 # function renderSlidePngBuffer
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

### `src/server/services/ai/openrouter-client.ts` (lines 1-290)
- `OpenRouterTextModelItem` (interface) → `src/server/services/ai/openrouter-client.ts:3-11`
- `OpenRouterImageModelItem` (interface) → `src/server/services/ai/openrouter-client.ts:13-19`
- `OpenRouterCatalogResult` (interface) → `src/server/services/ai/openrouter-client.ts:21-26`
- `OpenRouterKeyStatus` (interface) → `src/server/services/ai/openrouter-client.ts:28-36`
- `CURATED_OPENROUTER_TEXT_MODELS` (const) → `src/server/services/ai/openrouter-client.ts:38-47`
- `CURATED_OPENROUTER_IMAGE_MODELS` (const) → `src/server/services/ai/openrouter-client.ts:95-102`
- `createOpenRouterSdkClient` (function) → `src/server/services/ai/openrouter-client.ts:145-150`
- `fetchOpenRouterCatalog` (function) → `src/server/services/ai/openrouter-client.ts:156-225`
- `fetchOpenRouterKeyStatus` (function) → `src/server/services/ai/openrouter-client.ts:230-289`

### `src/server/services/ai/provider.ts` (lines 1-298)
- `CompanyProfile` (interface) → `src/server/services/ai/provider.ts:5-16`
- `AISettings` (interface) → `src/server/services/ai/provider.ts:18-26`
- `TenantPhotoSummary` (interface) → `src/server/services/ai/provider.ts:28-33`
- `carouselSlideSchema` (const) → `src/server/services/ai/provider.ts:35-41`
- `carouselResponseSchema` (const) → `src/server/services/ai/provider.ts:43-52`
- `CarouselSlidesResponse` (type) → `src/server/services/ai/provider.ts:54-54`
- `GeneratePostParams` (interface) → `src/server/services/ai/provider.ts:56-68`
- `sanitizeTenantField` (function) → `src/server/services/ai/provider.ts:75-82`
- `LOCAL_PROVIDERS` (const) → `src/server/services/ai/provider.ts:84-84`
- `assertSafeOutboundUrl` (function) → `src/server/services/ai/provider.ts:91-126`
- `AIProvider` (interface) → `src/server/services/ai/provider.ts:128-133`

### `src/server/services/ai/quota-guard.ts` (lines 1-269)
- `ApiOperationType` (type) → `src/server/services/ai/quota-guard.ts:5-5`
- `ApiUsageRuleConfig` (interface) → `src/server/services/ai/quota-guard.ts:7-15`
- `ApiUsageSummary` (interface) → `src/server/services/ai/quota-guard.ts:17-23`
- `rpmSlidingWindow` (const) → `src/server/services/ai/quota-guard.ts:25-25`
- `ensureQuotaTablesExist` (function) → `src/server/services/ai/quota-guard.ts:27-51`
- `getApiUsageRules` (function) → `src/server/services/ai/quota-guard.ts:53-81`
- `upsertApiUsageRules` (function) → `src/server/services/ai/quota-guard.ts:83-84`
- `getApiUsageSummary` (function) → `src/server/services/ai/quota-guard.ts:129-171`
- `recordApiUsage` (function) → `src/server/services/ai/quota-guard.ts:173-193`
- `enforceApiQuotaAndRateLimit` (function) → `src/server/services/ai/quota-guard.ts:195-268`

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

### `src/server/services/design/blueprint-extractor.ts` (lines 1-221)
- `ExtractBlueprintInput` (interface) → `src/server/services/design/blueprint-extractor.ts:11-19`
- `extractStyleBlueprint` (function) → `src/server/services/design/blueprint-extractor.ts:26-156`
- `listCompanyPostTypes` (function) → `src/server/services/design/blueprint-extractor.ts:158-192`
- `resolvePostStyleBlueprint` (function) → `src/server/services/design/blueprint-extractor.ts:194-220`

### `src/server/services/design/image-provider.ts` (lines 1-395)
- `ImageProviderConfig` (interface) → `src/server/services/design/image-provider.ts:3-8`
- `GenerateBackgroundParams` (interface) → `src/server/services/design/image-provider.ts:10-17`
- `GenerateBackgroundResult` (interface) → `src/server/services/design/image-provider.ts:19-25`
- `ImageProvider` (interface) → `src/server/services/design/image-provider.ts:27-30`
- `buildEditorialBackdropDataUri` (function) → `src/server/services/design/image-provider.ts:36-84`
- `PollinationsImageProvider` (class) → `src/server/services/design/image-provider.ts:86-120`
- `FalFluxImageProvider` (class) → `src/server/services/design/image-provider.ts:122-194`
- `IMAGE_REQUEST_TIMEOUT_MS` (const) → `src/server/services/design/image-provider.ts:197-197`
- `buildImagePrompt` (function) → `src/server/services/design/image-provider.ts:204-223`
- `svgFallback` (function) → `src/server/services/design/image-provider.ts:225-244`
- `postJson` (function) → `src/server/services/design/image-provider.ts:247-264`
- `canCallApi` (function) → `src/server/services/design/image-provider.ts:267-269`
- `OpenRouterImageProvider` (class) → `src/server/services/design/image-provider.ts:271-294`
- `GeminiImagenProvider` (class) → `src/server/services/design/image-provider.ts:296-324`
- `OpenAIImageProvider` (class) → `src/server/services/design/image-provider.ts:326-347`
- `ComfyUILocalProvider` (class) → `src/server/services/design/image-provider.ts:349-373`
- `ImageProviderFactory` (class) → `src/server/services/design/image-provider.ts:375-394`

### `src/server/services/design/template-engine.ts` (lines 1-395)
- `OpenDesignBrandKit` (interface) → `src/server/services/design/template-engine.ts:5-12`
- `OpenDesignSlideFields` (interface) → `src/server/services/design/template-engine.ts:14-34`
- `escapeXml` (function) → `src/server/services/design/template-engine.ts:36-43`
- `wrapEditorialLines` (function) → `src/server/services/design/template-engine.ts:49-86`
- `renderOpenDesignSlideSvg` (function) → `src/server/services/design/template-engine.ts:92-285`
- `CRC_TABLE` (const) → `src/server/services/design/template-engine.ts:290-300`
- `crc32` (function) → `src/server/services/design/template-engine.ts:302-310`
- `makePngChunk` (function) → `src/server/services/design/template-engine.ts:312-320`
- `hexToRgb` (function) → `src/server/services/design/template-engine.ts:322-328`
- `renderSlidePngBuffer` (function) → `src/server/services/design/template-engine.ts:335-394`

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
