---
node: server-services
title: "Domain Services & AI Provider Adapters"
covers:
  - src/server/services/ai/claude.ts:1-105
  - src/server/services/ai/claude.ts:8-13 # interface AnthropicMessagesResponse
  - src/server/services/ai/claude.ts:18-104 # class ClaudeProvider
  - src/server/services/ai/factory.ts:1-76
  - src/server/services/ai/factory.ts:10-75 # class AIProviderFactory
  - src/server/services/ai/gemini.ts:1-85
  - src/server/services/ai/gemini.ts:8-84 # class GeminiProvider
  - src/server/services/ai/mlstudio.ts:1-99
  - src/server/services/ai/mlstudio.ts:12-98 # class MLStudioProvider
  - src/server/services/ai/openai.ts:1-102
  - src/server/services/ai/openai.ts:8-101 # class OpenAIProvider
  - src/server/services/ai/provider.ts:1-131
  - src/server/services/ai/provider.ts:4-12 # interface CompanyProfile
  - src/server/services/ai/provider.ts:14-22 # interface AISettings
  - src/server/services/ai/provider.ts:24-29 # const carouselSlideSchema
  - src/server/services/ai/provider.ts:31-34 # const carouselResponseSchema
  - src/server/services/ai/provider.ts:36-36 # type CarouselSlidesResponse
  - src/server/services/ai/provider.ts:38-43 # interface GeneratePostParams
  - src/server/services/ai/provider.ts:45-49 # interface AIProvider
  - src/server/services/design/image-provider.ts:1-317
  - src/server/services/design/image-provider.ts:3-8 # interface ImageProviderConfig
  - src/server/services/design/image-provider.ts:10-17 # interface GenerateBackgroundParams
  - src/server/services/design/image-provider.ts:19-25 # interface GenerateBackgroundResult
  - src/server/services/design/image-provider.ts:27-30 # interface ImageProvider
  - src/server/services/design/image-provider.ts:36-84 # function buildEditorialBackdropDataUri
  - src/server/services/design/image-provider.ts:86-120 # class PollinationsImageProvider
  - src/server/services/design/image-provider.ts:122-194 # class FalFluxImageProvider
  - src/server/services/design/image-provider.ts:196-219 # class OpenRouterImageProvider
  - src/server/services/design/image-provider.ts:221-244 # class GeminiImagenProvider
  - src/server/services/design/image-provider.ts:246-269 # class OpenAIImageProvider
  - src/server/services/design/image-provider.ts:271-295 # class ComfyUILocalProvider
  - src/server/services/design/image-provider.ts:297-316 # class ImageProviderFactory
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
  - src/server/services/export/autosocial.ts:1-164
  - src/server/services/export/autosocial.ts:13-13 # const BASE_QUEUE_DIR
  - src/server/services/export/autosocial.ts:14-14 # const UPLOADS_DIR
  - src/server/services/export/autosocial.ts:15-15 # const RENDERS_DIR
  - src/server/services/export/autosocial.ts:17-22 # interface QueueStatusResult
  - src/server/services/export/autosocial.ts:24-31 # function getCompanyQueueDirs
  - src/server/services/export/autosocial.ts:33-39 # function ensureQueueDirs
  - src/server/services/export/autosocial.ts:41-117 # function enqueuePostForAutoSocial
  - src/server/services/export/autosocial.ts:119-139 # function enqueueScheduleForAutoSocial
  - src/server/services/export/autosocial.ts:141-163 # function getAutoSocialQueueStatus
  - src/server/services/export/canva.ts:1-122
  - src/server/services/export/canva.ts:11-18 # function escapeCsvCell
  - src/server/services/export/canva.ts:20-121 # function generateCanvaCsv
---

# Domain Services & AI Provider Adapters

Implements the Agnostic AI Adapter Pattern (ML Studio API, Gemini, OpenAI, Claude, Groq, Ollama), Zod runtime validation, RFC 4180 UTF-8 BOM Canva CSV generator, and AutoSocial filesystem sidecar queue.

## Covered Files & Symbols

### `src/server/services/ai/claude.ts` (lines 1-105)
- `AnthropicMessagesResponse` (interface) → `src/server/services/ai/claude.ts:8-13`
- `ClaudeProvider` (class) → `src/server/services/ai/claude.ts:18-104`

### `src/server/services/ai/factory.ts` (lines 1-76)
- `AIProviderFactory` (class) → `src/server/services/ai/factory.ts:10-75`

### `src/server/services/ai/gemini.ts` (lines 1-85)
- `GeminiProvider` (class) → `src/server/services/ai/gemini.ts:8-84`

### `src/server/services/ai/mlstudio.ts` (lines 1-99)
- `MLStudioProvider` (class) → `src/server/services/ai/mlstudio.ts:12-98`

### `src/server/services/ai/openai.ts` (lines 1-102)
- `OpenAIProvider` (class) → `src/server/services/ai/openai.ts:8-101`

### `src/server/services/ai/provider.ts` (lines 1-131)
- `CompanyProfile` (interface) → `src/server/services/ai/provider.ts:4-12`
- `AISettings` (interface) → `src/server/services/ai/provider.ts:14-22`
- `carouselSlideSchema` (const) → `src/server/services/ai/provider.ts:24-29`
- `carouselResponseSchema` (const) → `src/server/services/ai/provider.ts:31-34`
- `CarouselSlidesResponse` (type) → `src/server/services/ai/provider.ts:36-36`
- `GeneratePostParams` (interface) → `src/server/services/ai/provider.ts:38-43`
- `AIProvider` (interface) → `src/server/services/ai/provider.ts:45-49`

### `src/server/services/design/image-provider.ts` (lines 1-317)
- `ImageProviderConfig` (interface) → `src/server/services/design/image-provider.ts:3-8`
- `GenerateBackgroundParams` (interface) → `src/server/services/design/image-provider.ts:10-17`
- `GenerateBackgroundResult` (interface) → `src/server/services/design/image-provider.ts:19-25`
- `ImageProvider` (interface) → `src/server/services/design/image-provider.ts:27-30`
- `buildEditorialBackdropDataUri` (function) → `src/server/services/design/image-provider.ts:36-84`
- `PollinationsImageProvider` (class) → `src/server/services/design/image-provider.ts:86-120`
- `FalFluxImageProvider` (class) → `src/server/services/design/image-provider.ts:122-194`
- `OpenRouterImageProvider` (class) → `src/server/services/design/image-provider.ts:196-219`
- `GeminiImagenProvider` (class) → `src/server/services/design/image-provider.ts:221-244`
- `OpenAIImageProvider` (class) → `src/server/services/design/image-provider.ts:246-269`
- `ComfyUILocalProvider` (class) → `src/server/services/design/image-provider.ts:271-295`
- `ImageProviderFactory` (class) → `src/server/services/design/image-provider.ts:297-316`

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

### `src/server/services/export/autosocial.ts` (lines 1-164)
- `BASE_QUEUE_DIR` (const) → `src/server/services/export/autosocial.ts:13-13`
- `UPLOADS_DIR` (const) → `src/server/services/export/autosocial.ts:14-14`
- `RENDERS_DIR` (const) → `src/server/services/export/autosocial.ts:15-15`
- `QueueStatusResult` (interface) → `src/server/services/export/autosocial.ts:17-22`
- `getCompanyQueueDirs` (function) → `src/server/services/export/autosocial.ts:24-31`
- `ensureQueueDirs` (function) → `src/server/services/export/autosocial.ts:33-39`
- `enqueuePostForAutoSocial` (function) → `src/server/services/export/autosocial.ts:41-117`
- `enqueueScheduleForAutoSocial` (function) → `src/server/services/export/autosocial.ts:119-139`
- `getAutoSocialQueueStatus` (function) → `src/server/services/export/autosocial.ts:141-163`

### `src/server/services/export/canva.ts` (lines 1-122)
- `escapeCsvCell` (function) → `src/server/services/export/canva.ts:11-18`
- `generateCanvaCsv` (function) → `src/server/services/export/canva.ts:20-121`
