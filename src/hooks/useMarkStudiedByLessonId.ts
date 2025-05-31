import { useEffect, useRef } from "react";
import { useLessonLevelMap } from "../contexts/LessonLevelContext";
import { useUserActivities } from "../contexts/UserActivityContext";
import { markStudied } from "../services/api";
import { getLocalDateString } from "../services/timeService";

export const useMarkStudiedByLessonId = (autoMarkLessonId?: number) => {
  const { lessonLevelMap, isReady } = useLessonLevelMap();
  const { isLoading, hasStudied, refreshActivities } = useUserActivities();
  
  // Track xem đã thử mark chưa cho từng level trong ngày
  const markAttemptRef = useRef<Set<string>>(new Set());

  // Auto mark effect
  useEffect(() => {
    if (!autoMarkLessonId) return;

    const attemptAutoMark = async () => {
      if (!isReady || isLoading) return;

      const currentLevel = lessonLevelMap.get(autoMarkLessonId);
      if (!currentLevel) return;

      const today = getLocalDateString();
      const attemptKey = `${currentLevel}_${today}`;

      // Chỉ thử mark 1 lần cho mỗi level trong ngày
      if (markAttemptRef.current.has(attemptKey)) {
        return;
      }

      markAttemptRef.current.add(attemptKey);
      
      try {
        const result = await markStudiedInternal(autoMarkLessonId);
        console.log("Auto mark result:", result);
      } catch (error) {
        console.error("Auto mark failed:", error);
      }
    };

    attemptAutoMark();
  }, [autoMarkLessonId, isReady, isLoading, lessonLevelMap]);

  // Internal mark function (shared logic)
  const markStudiedInternal = async (lessonId: number) => {
    if (!isReady || isLoading) {
      console.log("Contexts chưa sẵn sàng, bỏ qua");
      return { success: false, reason: "contexts_not_ready" };
    }

    const level = lessonLevelMap.get(lessonId);
    if (!level) {
      console.log("Không tìm thấy level cho lessonId:", lessonId);
      return { success: false, reason: "level_not_found" };
    }

    const today = getLocalDateString();
    const isAlreadyStudied = hasStudied(level, today);

    if (isAlreadyStudied) {
      console.log("Đã học rồi, không cần mark lại");
      return { success: false, reason: "already_studied" };
    }

    try {
      await markStudied(level);
      await refreshActivities(level);
      return { success: true };
    } catch (error) {
      console.error("Lỗi khi mark studied:", error);
      return { success: false, reason: "api_error", error };
    }
  };

  return {
    // Manual mark function
    markStudied: markStudiedInternal,
    isReady: isReady && !isLoading,
    // Utility để check xem đã attempt chưa
    hasAttempted: (lessonId: number) => {
      const level = lessonLevelMap.get(lessonId);
      if (!level) return false;
      const today = getLocalDateString();
      return markAttemptRef.current.has(`${level}_${today}`);
    }
  };
};
