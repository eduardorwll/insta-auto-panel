import { useState, useEffect, useCallback } from "react";
import type { Post } from "../types/schedule";
import type { PhotoAsset } from "../types/photo";
import type { Company } from "../types/company";
import { getMondayLocal } from "@/shared/calendar-dates";
import { useWeek } from "@/client/context/WeekContext";
import { isPublishedStatus } from "@/shared/state-machines/post-lifecycle.machine";

/** Segunda-feira local (YYYY-MM-DD). Delegado a calendar-dates (sem desvio UTC). */
export function getMonday(d = new Date()): string {
  return getMondayLocal(d);
}

export function useWeekSchedule(activeCompany: Company | null) {
  const { weekStartDate, setWeekStartDate, prevWeek, nextWeek, currentWeek } = useWeek();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activeSlideNumber, setActiveSlideNumber] = useState(1);
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar cronograma da semana
  const fetchSchedule = useCallback(async () => {
    if (!activeCompany) return;
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/schedules?companyId=${activeCompany.id}&weekStartDate=${weekStartDate}`
      );
      const json = await res.json();
      if (json.success && json.data) {
        setPosts(json.data.posts);
      }
    } catch (err: unknown) {
      console.error("Erro ao carregar cronograma:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeCompany?.id, weekStartDate]);

  // Carregar fotos da empresa para associação
  const fetchPhotos = useCallback(async () => {
    if (!activeCompany) return;
    try {
      const res = await fetch(`/api/photos?companyId=${activeCompany.id}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPhotos(json.data);
      }
    } catch (err: unknown) {
      console.error("Erro ao carregar fotos:", err);
    }
  }, [activeCompany?.id]);

  useEffect(() => {
    fetchSchedule();
    fetchPhotos();
  }, [fetchSchedule, fetchPhotos]);

  const activePost = posts[selectedDayIndex];

  // Ajustar slide ativo se o número de lâminas diminuir
  useEffect(() => {
    if (activePost && activeSlideNumber > activePost.slideCount) {
      setActiveSlideNumber(activePost.slideCount);
    }
  }, [activePost?.slideCount]);

  // Contadores e métricas do pipeline semanal
  const totalCount = posts.length;
  const readyCount = posts.filter(
    (p) => p.status === "ready_design" || p.status === "ai_generated"
  ).length;
  const queuedCount = posts.filter((p) => p.status === "queued" || isPublishedStatus(p.status)).length;
  const draftCount = posts.filter((p) => !p.status || p.status === "draft").length;

  const activeSlide = activePost?.slides.find((s) => s.slideNumber === activeSlideNumber);
  const assignedPhoto = photos.find(
    (p) => p.id === (activeSlide?.assignedPhotoId || activePost?.selectedPhotoIds?.[0])
  );
  const photoUrl = assignedPhoto ? `/uploads/${assignedPhoto.filename}` : undefined;

  return {
    weekStartDate,
    setWeekStartDate,
    posts,
    selectedDayIndex,
    setSelectedDayIndex,
    activeSlideNumber,
    setActiveSlideNumber,
    photos,
    isLoading,
    activePost,
    activeSlide,
    photoUrl,
    metrics: {
      totalCount,
      readyCount,
      queuedCount,
      draftCount,
    },
    navigation: {
      prevWeek,
      nextWeek,
      currentWeek,
    },
    fetchSchedule,
  };
}
