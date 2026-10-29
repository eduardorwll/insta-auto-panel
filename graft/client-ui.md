---
node: client-ui
title: "React 19 + Tailwind v4 + shadcn/ui Frontend Portal"
covers:
  - src/client/App.tsx:1-301
  - src/client/App.tsx:30-292 # function DashboardContent
  - src/client/components/AISettingsModal.tsx:1-468
  - src/client/components/AISettingsModal.tsx:26-29 # interface AISettingsModalProps
  - src/client/components/AISettingsModal.tsx:31-36 # const PROVIDER_OPTIONS
  - src/client/components/AISettingsModal.tsx:77-467 # function AISettingsModal
  - src/client/components/CompanyModal.tsx:1-348
  - src/client/components/CompanyModal.tsx:16-20 # interface CompanyModalProps
  - src/client/components/CompanyModal.tsx:22-36 # const defaultForm
  - src/client/components/CompanyModal.tsx:38-347 # function CompanyModal
  - src/client/components/CompanySwitcher.tsx:1-134
  - src/client/components/CompanySwitcher.tsx:16-133 # function CompanySwitcher
  - src/client/components/DesignStudioModal.tsx:1-657
  - src/client/components/DesignStudioModal.tsx:19-23 # type StudioTemplateId
  - src/client/components/DesignStudioModal.tsx:25-31 # type StudioImageProvider
  - src/client/components/DesignStudioModal.tsx:33-39 # interface StudioSlideItem
  - src/client/components/DesignStudioModal.tsx:41-49 # interface DesignStudioModalProps
  - src/client/components/DesignStudioModal.tsx:51-55 # const TEMPLATE_OPTIONS
  - src/client/components/DesignStudioModal.tsx:78-82 # const IMAGE_PROVIDER_OPTIONS
  - src/client/components/DesignStudioModal.tsx:115-149 # function wrapCanvasLines
  - src/client/components/DesignStudioModal.tsx:151-656 # function DesignStudioModal
  - src/client/components/PhotoBank.tsx:1-295
  - src/client/components/PhotoBank.tsx:11-11 # const CATEGORIES
  - src/client/components/PhotoBank.tsx:13-294 # function PhotoBank
  - src/client/components/PublicationQueue.tsx:1-456
  - src/client/components/PublicationQueue.tsx:20-28 # const DAY_LABELS
  - src/client/components/PublicationQueue.tsx:30-30 # const DEFAULT_STATUS
  - src/client/components/PublicationQueue.tsx:32-38 # const STATUS_CONFIG
  - src/client/components/PublicationQueue.tsx:40-46 # function getMonday
  - src/client/components/PublicationQueue.tsx:48-455 # function PublicationQueue
  - src/client/components/SettingsHub.tsx:1-843
  - src/client/components/SettingsHub.tsx:25-27 # interface SettingsHubProps
  - src/client/components/SettingsHub.tsx:29-45 # interface CompanySettingsData
  - src/client/components/SettingsHub.tsx:47-52 # const LLM_PROVIDER_OPTIONS
  - src/client/components/SettingsHub.tsx:93-97 # const IMAGE_PROVIDER_OPTIONS
  - src/client/components/SettingsHub.tsx:120-121 # const TEMPLATE_OPTIONS
  - src/client/components/SettingsHub.tsx:127-842 # function SettingsHub
  - src/client/components/SlidePreview.tsx:1-156
  - src/client/components/SlidePreview.tsx:6-18 # interface SlidePreviewProps
  - src/client/components/SlidePreview.tsx:20-155 # function SlidePreview
  - src/client/components/WeekPlanner.tsx:1-826
  - src/client/components/WeekPlanner.tsx:29-36 # const EDITORIAL_CATEGORIES
  - src/client/components/WeekPlanner.tsx:38-46 # const DAY_LABELS
  - src/client/components/WeekPlanner.tsx:49-55 # function getMonday
  - src/client/components/WeekPlanner.tsx:57-825 # function WeekPlanner
  - src/client/components/ui/badge.tsx:1-33
  - src/client/components/ui/badge.tsx:5-21 # const badgeVariants
  - src/client/components/ui/badge.tsx:24-26 # interface BadgeProps
  - src/client/components/ui/badge.tsx:28-30 # function Badge
  - src/client/components/ui/button.tsx:1-53
  - src/client/components/ui/button.tsx:6-29 # const buttonVariants
  - src/client/components/ui/button.tsx:32-36 # interface ButtonProps
  - src/client/components/ui/button.tsx:38-48 # const Button
  - src/client/components/ui/card.tsx:1-51
  - src/client/components/ui/card.tsx:4-5 # const Card
  - src/client/components/ui/card.tsx:15-16 # const CardHeader
  - src/client/components/ui/card.tsx:22-23 # const CardTitle
  - src/client/components/ui/card.tsx:29-30 # const CardDescription
  - src/client/components/ui/card.tsx:36-37 # const CardContent
  - src/client/components/ui/card.tsx:43-44 # const CardFooter
  - src/client/components/ui/dialog.tsx:1-96
  - src/client/components/ui/dialog.tsx:6-6 # const Dialog
  - src/client/components/ui/dialog.tsx:7-7 # const DialogTrigger
  - src/client/components/ui/dialog.tsx:8-8 # const DialogPortal
  - src/client/components/ui/dialog.tsx:9-9 # const DialogClose
  - src/client/components/ui/dialog.tsx:11-14 # const DialogOverlay
  - src/client/components/ui/dialog.tsx:26-29 # const DialogContent
  - src/client/components/ui/dialog.tsx:50-50 # const DialogHeader
  - src/client/components/ui/dialog.tsx:55-55 # const DialogFooter
  - src/client/components/ui/dialog.tsx:60-63 # const DialogTitle
  - src/client/components/ui/dialog.tsx:72-75 # const DialogDescription
  - src/client/components/ui/dropdown-menu.tsx:1-172
  - src/client/components/ui/dropdown-menu.tsx:6-6 # const DropdownMenu
  - src/client/components/ui/dropdown-menu.tsx:7-7 # const DropdownMenuTrigger
  - src/client/components/ui/dropdown-menu.tsx:8-8 # const DropdownMenuGroup
  - src/client/components/ui/dropdown-menu.tsx:9-9 # const DropdownMenuPortal
  - src/client/components/ui/dropdown-menu.tsx:10-10 # const DropdownMenuSub
  - src/client/components/ui/dropdown-menu.tsx:11-11 # const DropdownMenuRadioGroup
  - src/client/components/ui/dropdown-menu.tsx:13-17 # const DropdownMenuSubTrigger
  - src/client/components/ui/dropdown-menu.tsx:34-37 # const DropdownMenuSubContent
  - src/client/components/ui/dropdown-menu.tsx:49-52 # const DropdownMenuContent
  - src/client/components/ui/dropdown-menu.tsx:67-71 # const DropdownMenuItem
  - src/client/components/ui/dropdown-menu.tsx:85-88 # const DropdownMenuCheckboxItem
  - src/client/components/ui/dropdown-menu.tsx:108-111 # const DropdownMenuRadioItem
  - src/client/components/ui/dropdown-menu.tsx:130-134 # const DropdownMenuLabel
  - src/client/components/ui/dropdown-menu.tsx:144-147 # const DropdownMenuSeparator
  - src/client/components/ui/input.tsx:1-24
  - src/client/components/ui/input.tsx:4-4 # interface InputProps
  - src/client/components/ui/input.tsx:6-19 # const Input
  - src/client/components/ui/label.tsx:1-24
  - src/client/components/ui/label.tsx:6-8 # const labelVariants
  - src/client/components/ui/label.tsx:10-14 # const Label
  - src/client/components/ui/tabs.tsx:1-53
  - src/client/components/ui/tabs.tsx:5-5 # const Tabs
  - src/client/components/ui/tabs.tsx:7-10 # const TabsList
  - src/client/components/ui/tabs.tsx:22-25 # const TabsTrigger
  - src/client/components/ui/tabs.tsx:37-40 # const TabsContent
  - src/client/context/CompanyContext.tsx:1-141
  - src/client/context/CompanyContext.tsx:4-13 # interface CompanyContextType
  - src/client/context/CompanyContext.tsx:15-15 # const CompanyContext
  - src/client/context/CompanyContext.tsx:17-132 # function CompanyProvider
  - src/client/context/CompanyContext.tsx:134-140 # function useCompany
  - src/client/lib/utils.ts:1-7
  - src/client/lib/utils.ts:4-6 # function cn
  - src/client/main.tsx:1-14
  - src/client/main.tsx:6-6 # const rootElement
  - src/client/types/ai.ts:1-27
  - src/client/types/ai.ts:1-9 # type AIProvider
  - src/client/types/ai.ts:11-19 # interface AISettingsFormData
  - src/client/types/ai.ts:21-26 # interface ConnectionTestResult
  - src/client/types/company.ts:1-19
  - src/client/types/company.ts:1-16 # interface Company
  - src/client/types/company.ts:18-18 # type CompanyFormData
  - src/client/types/photo.ts:1-14
  - src/client/types/photo.ts:1-1 # type PhotoCategory
  - src/client/types/photo.ts:3-13 # interface PhotoAsset
  - src/client/types/publication.ts:1-7
  - src/client/types/publication.ts:1-6 # interface AutoSocialQueueStatus
  - src/client/types/schedule.ts:1-36
  - src/client/types/schedule.ts:4-13 # interface PostSlide
  - src/client/types/schedule.ts:15-28 # interface Post
  - src/client/types/schedule.ts:30-35 # interface WeeklySchedule
  - src/client/vite-env.d.ts:1-2
---

# React 19 + Tailwind v4 + shadcn/ui Frontend Portal

Provides the multi-company dashboard, CompanyContext state, Brand Kit modal, PhotoBank manager, WeekPlanner & SlideEditorDrawer (3-10 slides), AISettingsModal, and PublicationQueue.

## Covered Files & Symbols

### `src/client/App.tsx` (lines 1-301)
- `DashboardContent` (function) → `src/client/App.tsx:30-292`

### `src/client/components/AISettingsModal.tsx` (lines 1-468)
- `AISettingsModalProps` (interface) → `src/client/components/AISettingsModal.tsx:26-29`
- `PROVIDER_OPTIONS` (const) → `src/client/components/AISettingsModal.tsx:31-36`
- `AISettingsModal` (function) → `src/client/components/AISettingsModal.tsx:77-467`

### `src/client/components/CompanyModal.tsx` (lines 1-348)
- `CompanyModalProps` (interface) → `src/client/components/CompanyModal.tsx:16-20`
- `defaultForm` (const) → `src/client/components/CompanyModal.tsx:22-36`
- `CompanyModal` (function) → `src/client/components/CompanyModal.tsx:38-347`

### `src/client/components/CompanySwitcher.tsx` (lines 1-134)
- `CompanySwitcher` (function) → `src/client/components/CompanySwitcher.tsx:16-133`

### `src/client/components/DesignStudioModal.tsx` (lines 1-657)
- `StudioTemplateId` (type) → `src/client/components/DesignStudioModal.tsx:19-23`
- `StudioImageProvider` (type) → `src/client/components/DesignStudioModal.tsx:25-31`
- `StudioSlideItem` (interface) → `src/client/components/DesignStudioModal.tsx:33-39`
- `DesignStudioModalProps` (interface) → `src/client/components/DesignStudioModal.tsx:41-49`
- `TEMPLATE_OPTIONS` (const) → `src/client/components/DesignStudioModal.tsx:51-55`
- `IMAGE_PROVIDER_OPTIONS` (const) → `src/client/components/DesignStudioModal.tsx:78-82`
- `wrapCanvasLines` (function) → `src/client/components/DesignStudioModal.tsx:115-149`
- `DesignStudioModal` (function) → `src/client/components/DesignStudioModal.tsx:151-656`

### `src/client/components/PhotoBank.tsx` (lines 1-295)
- `CATEGORIES` (const) → `src/client/components/PhotoBank.tsx:11-11`
- `PhotoBank` (function) → `src/client/components/PhotoBank.tsx:13-294`

### `src/client/components/PublicationQueue.tsx` (lines 1-456)
- `DAY_LABELS` (const) → `src/client/components/PublicationQueue.tsx:20-28`
- `DEFAULT_STATUS` (const) → `src/client/components/PublicationQueue.tsx:30-30`
- `STATUS_CONFIG` (const) → `src/client/components/PublicationQueue.tsx:32-38`
- `getMonday` (function) → `src/client/components/PublicationQueue.tsx:40-46`
- `PublicationQueue` (function) → `src/client/components/PublicationQueue.tsx:48-455`

### `src/client/components/SettingsHub.tsx` (lines 1-843)
- `SettingsHubProps` (interface) → `src/client/components/SettingsHub.tsx:25-27`
- `CompanySettingsData` (interface) → `src/client/components/SettingsHub.tsx:29-45`
- `LLM_PROVIDER_OPTIONS` (const) → `src/client/components/SettingsHub.tsx:47-52`
- `IMAGE_PROVIDER_OPTIONS` (const) → `src/client/components/SettingsHub.tsx:93-97`
- `TEMPLATE_OPTIONS` (const) → `src/client/components/SettingsHub.tsx:120-121`
- `SettingsHub` (function) → `src/client/components/SettingsHub.tsx:127-842`

### `src/client/components/SlidePreview.tsx` (lines 1-156)
- `SlidePreviewProps` (interface) → `src/client/components/SlidePreview.tsx:6-18`
- `SlidePreview` (function) → `src/client/components/SlidePreview.tsx:20-155`

### `src/client/components/WeekPlanner.tsx` (lines 1-826)
- `EDITORIAL_CATEGORIES` (const) → `src/client/components/WeekPlanner.tsx:29-36`
- `DAY_LABELS` (const) → `src/client/components/WeekPlanner.tsx:38-46`
- `getMonday` (function) → `src/client/components/WeekPlanner.tsx:49-55`
- `WeekPlanner` (function) → `src/client/components/WeekPlanner.tsx:57-825`

### `src/client/components/ui/badge.tsx` (lines 1-33)
- `badgeVariants` (const) → `src/client/components/ui/badge.tsx:5-21`
- `BadgeProps` (interface) → `src/client/components/ui/badge.tsx:24-26`
- `Badge` (function) → `src/client/components/ui/badge.tsx:28-30`

### `src/client/components/ui/button.tsx` (lines 1-53)
- `buttonVariants` (const) → `src/client/components/ui/button.tsx:6-29`
- `ButtonProps` (interface) → `src/client/components/ui/button.tsx:32-36`
- `Button` (const) → `src/client/components/ui/button.tsx:38-48`

### `src/client/components/ui/card.tsx` (lines 1-51)
- `Card` (const) → `src/client/components/ui/card.tsx:4-5`
- `CardHeader` (const) → `src/client/components/ui/card.tsx:15-16`
- `CardTitle` (const) → `src/client/components/ui/card.tsx:22-23`
- `CardDescription` (const) → `src/client/components/ui/card.tsx:29-30`
- `CardContent` (const) → `src/client/components/ui/card.tsx:36-37`
- `CardFooter` (const) → `src/client/components/ui/card.tsx:43-44`

### `src/client/components/ui/dialog.tsx` (lines 1-96)
- `Dialog` (const) → `src/client/components/ui/dialog.tsx:6-6`
- `DialogTrigger` (const) → `src/client/components/ui/dialog.tsx:7-7`
- `DialogPortal` (const) → `src/client/components/ui/dialog.tsx:8-8`
- `DialogClose` (const) → `src/client/components/ui/dialog.tsx:9-9`
- `DialogOverlay` (const) → `src/client/components/ui/dialog.tsx:11-14`
- `DialogContent` (const) → `src/client/components/ui/dialog.tsx:26-29`
- `DialogHeader` (const) → `src/client/components/ui/dialog.tsx:50-50`
- `DialogFooter` (const) → `src/client/components/ui/dialog.tsx:55-55`
- `DialogTitle` (const) → `src/client/components/ui/dialog.tsx:60-63`
- `DialogDescription` (const) → `src/client/components/ui/dialog.tsx:72-75`

### `src/client/components/ui/dropdown-menu.tsx` (lines 1-172)
- `DropdownMenu` (const) → `src/client/components/ui/dropdown-menu.tsx:6-6`
- `DropdownMenuTrigger` (const) → `src/client/components/ui/dropdown-menu.tsx:7-7`
- `DropdownMenuGroup` (const) → `src/client/components/ui/dropdown-menu.tsx:8-8`
- `DropdownMenuPortal` (const) → `src/client/components/ui/dropdown-menu.tsx:9-9`
- `DropdownMenuSub` (const) → `src/client/components/ui/dropdown-menu.tsx:10-10`
- `DropdownMenuRadioGroup` (const) → `src/client/components/ui/dropdown-menu.tsx:11-11`
- `DropdownMenuSubTrigger` (const) → `src/client/components/ui/dropdown-menu.tsx:13-17`
- `DropdownMenuSubContent` (const) → `src/client/components/ui/dropdown-menu.tsx:34-37`
- `DropdownMenuContent` (const) → `src/client/components/ui/dropdown-menu.tsx:49-52`
- `DropdownMenuItem` (const) → `src/client/components/ui/dropdown-menu.tsx:67-71`
- `DropdownMenuCheckboxItem` (const) → `src/client/components/ui/dropdown-menu.tsx:85-88`
- `DropdownMenuRadioItem` (const) → `src/client/components/ui/dropdown-menu.tsx:108-111`
- `DropdownMenuLabel` (const) → `src/client/components/ui/dropdown-menu.tsx:130-134`
- `DropdownMenuSeparator` (const) → `src/client/components/ui/dropdown-menu.tsx:144-147`

### `src/client/components/ui/input.tsx` (lines 1-24)
- `InputProps` (interface) → `src/client/components/ui/input.tsx:4-4`
- `Input` (const) → `src/client/components/ui/input.tsx:6-19`

### `src/client/components/ui/label.tsx` (lines 1-24)
- `labelVariants` (const) → `src/client/components/ui/label.tsx:6-8`
- `Label` (const) → `src/client/components/ui/label.tsx:10-14`

### `src/client/components/ui/tabs.tsx` (lines 1-53)
- `Tabs` (const) → `src/client/components/ui/tabs.tsx:5-5`
- `TabsList` (const) → `src/client/components/ui/tabs.tsx:7-10`
- `TabsTrigger` (const) → `src/client/components/ui/tabs.tsx:22-25`
- `TabsContent` (const) → `src/client/components/ui/tabs.tsx:37-40`

### `src/client/context/CompanyContext.tsx` (lines 1-141)
- `CompanyContextType` (interface) → `src/client/context/CompanyContext.tsx:4-13`
- `CompanyContext` (const) → `src/client/context/CompanyContext.tsx:15-15`
- `CompanyProvider` (function) → `src/client/context/CompanyContext.tsx:17-132`
- `useCompany` (function) → `src/client/context/CompanyContext.tsx:134-140`

### `src/client/lib/utils.ts` (lines 1-7)
- `cn` (function) → `src/client/lib/utils.ts:4-6`

### `src/client/main.tsx` (lines 1-14)
- `rootElement` (const) → `src/client/main.tsx:6-6`

### `src/client/types/ai.ts` (lines 1-27)
- `AIProvider` (type) → `src/client/types/ai.ts:1-9`
- `AISettingsFormData` (interface) → `src/client/types/ai.ts:11-19`
- `ConnectionTestResult` (interface) → `src/client/types/ai.ts:21-26`

### `src/client/types/company.ts` (lines 1-19)
- `Company` (interface) → `src/client/types/company.ts:1-16`
- `CompanyFormData` (type) → `src/client/types/company.ts:18-18`

### `src/client/types/photo.ts` (lines 1-14)
- `PhotoCategory` (type) → `src/client/types/photo.ts:1-1`
- `PhotoAsset` (interface) → `src/client/types/photo.ts:3-13`

### `src/client/types/publication.ts` (lines 1-7)
- `AutoSocialQueueStatus` (interface) → `src/client/types/publication.ts:1-6`

### `src/client/types/schedule.ts` (lines 1-36)
- `PostSlide` (interface) → `src/client/types/schedule.ts:4-13`
- `Post` (interface) → `src/client/types/schedule.ts:15-28`
- `WeeklySchedule` (interface) → `src/client/types/schedule.ts:30-35`

### `src/client/vite-env.d.ts` (lines 1-2)
