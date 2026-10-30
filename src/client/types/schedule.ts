import type { DayOfWeek, PostStatus } from "@/server/db/schema";
export type { DayOfWeek, PostStatus };
import type { PhotoAsset } from "./photo";

export interface PostSlide {
  id: string;
  postId: string;
  slideNumber: number;
  title?: string | null;
  bodyText?: string | null;
  ctaText?: string | null;
  assignedPhotoId?: string | null;
  assignedPhoto?: PhotoAsset | null;
}

export interface Post {
  id: string;
  scheduleId: string;
  companyId: string;
  dayOfWeek: DayOfWeek;
  theme: string;
  category: string;
  slideCount: number; // 3 a 10 lâminas
  status: PostStatus;
  caption?: string | null;
  altText?: string | null;
  keywordCluster?: string | null; // JSON array serializado
  scheduledTime?: string | null;
  selectedPhotoIds?: string[];
  createdAt?: string | number | null;
  slides: PostSlide[];
}

export interface WeeklySchedule {
  id: string;
  companyId: string;
  weekStartDate: string;
  createdAt?: string | number | null;
}
