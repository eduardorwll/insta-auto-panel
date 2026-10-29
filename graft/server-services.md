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
  - src/server/services/export/autosocial.ts:1-145
  - src/server/services/export/autosocial.ts:13-13 # const BASE_QUEUE_DIR
  - src/server/services/export/autosocial.ts:14-14 # const UPLOADS_DIR
  - src/server/services/export/autosocial.ts:16-21 # interface QueueStatusResult
  - src/server/services/export/autosocial.ts:23-30 # function getCompanyQueueDirs
  - src/server/services/export/autosocial.ts:32-38 # function ensureQueueDirs
  - src/server/services/export/autosocial.ts:40-98 # function enqueuePostForAutoSocial
  - src/server/services/export/autosocial.ts:100-120 # function enqueueScheduleForAutoSocial
  - src/server/services/export/autosocial.ts:122-144 # function getAutoSocialQueueStatus
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

### `src/server/services/export/autosocial.ts` (lines 1-145)
- `BASE_QUEUE_DIR` (const) → `src/server/services/export/autosocial.ts:13-13`
- `UPLOADS_DIR` (const) → `src/server/services/export/autosocial.ts:14-14`
- `QueueStatusResult` (interface) → `src/server/services/export/autosocial.ts:16-21`
- `getCompanyQueueDirs` (function) → `src/server/services/export/autosocial.ts:23-30`
- `ensureQueueDirs` (function) → `src/server/services/export/autosocial.ts:32-38`
- `enqueuePostForAutoSocial` (function) → `src/server/services/export/autosocial.ts:40-98`
- `enqueueScheduleForAutoSocial` (function) → `src/server/services/export/autosocial.ts:100-120`
- `getAutoSocialQueueStatus` (function) → `src/server/services/export/autosocial.ts:122-144`

### `src/server/services/export/canva.ts` (lines 1-122)
- `escapeCsvCell` (function) → `src/server/services/export/canva.ts:11-18`
- `generateCanvaCsv` (function) → `src/server/services/export/canva.ts:20-121`
