import React, { createContext, useContext, useEffect, useState } from "react";
import { getLessonStatuses } from "../services/api";

type LessonStatus = [boolean, boolean, boolean, boolean];
type LessonStatuses = Record<number, LessonStatus>;

const modeToIndex: Record<string, number> = {
  "phrase": 0,
  "translate": 1,
  "listen": 2,
  "test": 3,
};

interface LessonStatusContextType {
  lessonStatuses: LessonStatuses;
  refreshLessonStatuses: () => Promise<void>;
  isDoneStatus: (lessonId: number, mode: keyof typeof modeToIndex) => boolean;
  isLessonComplete: (lessonId: number) => boolean;
}

const LessonStatusContext = createContext<LessonStatusContextType | undefined>(undefined);

export const LessonStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lessonStatuses, setLessonStatuses] = useState<LessonStatuses>({});

  const fetchStatuses = async () => {
    try {
      const statusData = await getLessonStatuses();
      const statusMap: LessonStatuses = {};

      Object.entries(statusData).forEach(([lessonId, item]) => {
        statusMap[Number(lessonId)] = [
          item.phrase,
          item.translate,
          item.listen,
          item.test,
        ];
      });

      setLessonStatuses(statusMap);
    } catch (error) {
      console.error("Lỗi khi tải lesson statuses:", error);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const isDoneStatus = (lessonId: number, mode: keyof typeof modeToIndex) => {
    const index = modeToIndex[mode];
    const status = lessonStatuses[lessonId];
    return status ? status[index] === true : false;
  };

  const isLessonComplete = (lessonId: number) => {
    const status = lessonStatuses[lessonId];
    return status ? status.every(Boolean) : false;
  };

  return (
    <LessonStatusContext.Provider
      value={{
        lessonStatuses,
        refreshLessonStatuses: fetchStatuses,
        isDoneStatus,
        isLessonComplete,
      }}
    >
      {children}
    </LessonStatusContext.Provider>
  );
};

export const useLessonStatuses = () => {
  const context = useContext(LessonStatusContext);
  if (!context) throw new Error("useLessonStatuses must be used within LessonStatusProvider");
  return context;
};
