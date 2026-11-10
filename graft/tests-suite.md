---
node: tests-suite
title: "Automated Test Suite (Bun Unit/Integration + Playwright E2E)"
covers:
  - tests/e2e/ai-generation.spec.ts:1-191
  - tests/e2e/companies.spec.ts:1-100
  - tests/e2e/design-studio.spec.ts:1-94
  - tests/e2e/export-autosocial.spec.ts:1-69
  - tests/e2e/planner-photos.spec.ts:1-92
  - tests/e2e/seo-match.spec.ts:1-44
  - tests/e2e/settings-hub.spec.ts:1-104
  - tests/e2e/sidebar-navigation.spec.ts:1-97
  - tests/server/ai-adapters.test.ts:1-193
  - tests/server/ai-routes.test.ts:1-124
  - tests/server/ai-seo-persistence.test.ts:1-129
  - tests/server/ai-seo-persistence.test.ts:9-9 # const companyId
  - tests/server/ai-seo-persistence.test.ts:10-10 # const schedId
  - tests/server/ai-seo-persistence.test.ts:11-11 # const postA
  - tests/server/ai-seo-persistence.test.ts:12-12 # const postB
  - tests/server/ai-seo-persistence.test.ts:90-100 # class ExposedProvider
  - tests/server/ai-settings.test.ts:1-102
  - tests/server/ai-tenant-photos-time.test.ts:1-163
  - tests/server/auth-api.test.ts:1-117
  - tests/server/autosocial-queue.test.ts:1-170
  - tests/server/companies-api.test.ts:1-125
  - tests/server/companies-photos.test.ts:1-150
  - tests/server/db-client.test.ts:1-46
  - tests/server/design-routes.test.ts:1-133
  - tests/server/health.test.ts:1-22
  - tests/server/image-providers-real.test.ts:1-121
  - tests/server/image-providers-real.test.ts:9-9 # const realFetch
  - tests/server/image-providers-real.test.ts:10-10 # const PNG_B64
  - tests/server/image-providers-real.test.ts:12-12 # type Call
  - tests/server/image-providers-real.test.ts:13-21 # function mockFetch
  - tests/server/image-providers-real.test.ts:22-23 # const json
  - tests/server/image-providers-real.test.ts:29-29 # const base
  - tests/server/image-providers.test.ts:1-126
  - tests/server/instagram-cookies.test.ts:1-56
  - tests/server/migrations-seed.test.ts:1-43
  - tests/server/multi-tenant-atomic-isolation.test.ts:1-304
  - tests/server/openrouter-quotas-inspector.test.ts:1-192
  - tests/server/photos-api.test.ts:1-142
  - tests/server/post-formats.test.ts:1-56
  - tests/server/schedules-add-posts.test.ts:1-131
  - tests/server/schedules-api.test.ts:1-129
  - tests/server/schedules-posts-slides.test.ts:1-224
  - tests/server/schedules-scheduled-time.test.ts:1-146
  - tests/server/security-hardening.test.ts:1-104
  - tests/server/seo-quality.test.ts:1-73
  - tests/server/settings-api.test.ts:1-207
  - tests/server/zero-leakage.test.ts:1-54
---

# Automated Test Suite (Bun Unit/Integration + Playwright E2E)

Covers ACID database invariants, REST endpoints, AI adapters, Canva CSV export, AutoSocial queue, and headless Chromium E2E flows with zero-console-error assertions.

## Covered Files & Symbols

### `tests/e2e/ai-generation.spec.ts` (lines 1-191)

### `tests/e2e/companies.spec.ts` (lines 1-100)

### `tests/e2e/design-studio.spec.ts` (lines 1-94)

### `tests/e2e/export-autosocial.spec.ts` (lines 1-69)

### `tests/e2e/planner-photos.spec.ts` (lines 1-92)

### `tests/e2e/seo-match.spec.ts` (lines 1-44)

### `tests/e2e/settings-hub.spec.ts` (lines 1-104)

### `tests/e2e/sidebar-navigation.spec.ts` (lines 1-97)

### `tests/server/ai-adapters.test.ts` (lines 1-193)

### `tests/server/ai-routes.test.ts` (lines 1-124)

### `tests/server/ai-seo-persistence.test.ts` (lines 1-129)
- `companyId` (const) → `tests/server/ai-seo-persistence.test.ts:9-9`
- `schedId` (const) → `tests/server/ai-seo-persistence.test.ts:10-10`
- `postA` (const) → `tests/server/ai-seo-persistence.test.ts:11-11`
- `postB` (const) → `tests/server/ai-seo-persistence.test.ts:12-12`
- `ExposedProvider` (class) → `tests/server/ai-seo-persistence.test.ts:90-100`

### `tests/server/ai-settings.test.ts` (lines 1-102)

### `tests/server/ai-tenant-photos-time.test.ts` (lines 1-163)

### `tests/server/auth-api.test.ts` (lines 1-117)

### `tests/server/autosocial-queue.test.ts` (lines 1-170)

### `tests/server/companies-api.test.ts` (lines 1-125)

### `tests/server/companies-photos.test.ts` (lines 1-150)

### `tests/server/db-client.test.ts` (lines 1-46)

### `tests/server/design-routes.test.ts` (lines 1-133)

### `tests/server/health.test.ts` (lines 1-22)

### `tests/server/image-providers-real.test.ts` (lines 1-121)
- `realFetch` (const) → `tests/server/image-providers-real.test.ts:9-9`
- `PNG_B64` (const) → `tests/server/image-providers-real.test.ts:10-10`
- `Call` (type) → `tests/server/image-providers-real.test.ts:12-12`
- `mockFetch` (function) → `tests/server/image-providers-real.test.ts:13-21`
- `json` (const) → `tests/server/image-providers-real.test.ts:22-23`
- `base` (const) → `tests/server/image-providers-real.test.ts:29-29`

### `tests/server/image-providers.test.ts` (lines 1-126)

### `tests/server/instagram-cookies.test.ts` (lines 1-56)

### `tests/server/migrations-seed.test.ts` (lines 1-43)

### `tests/server/multi-tenant-atomic-isolation.test.ts` (lines 1-304)

### `tests/server/openrouter-quotas-inspector.test.ts` (lines 1-192)

### `tests/server/photos-api.test.ts` (lines 1-142)

### `tests/server/post-formats.test.ts` (lines 1-56)

### `tests/server/schedules-add-posts.test.ts` (lines 1-131)

### `tests/server/schedules-api.test.ts` (lines 1-129)

### `tests/server/schedules-posts-slides.test.ts` (lines 1-224)

### `tests/server/schedules-scheduled-time.test.ts` (lines 1-146)

### `tests/server/security-hardening.test.ts` (lines 1-104)

### `tests/server/seo-quality.test.ts` (lines 1-73)

### `tests/server/settings-api.test.ts` (lines 1-207)

### `tests/server/zero-leakage.test.ts` (lines 1-54)
