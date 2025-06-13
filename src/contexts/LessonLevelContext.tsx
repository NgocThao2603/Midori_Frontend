import { createContext, useContext, useEffect, useState } from "react";
import { fetchChapters } from "../services/api";

type LessonLevelContextType = {
  lessonLevelMap: Map<number, string>;
  isReady: boolean;
};

const defaultValue: LessonLevelContextType = {
  lessonLevelMap: new Map(),
  isReady: false,
};

export const LessonLevelContext = createContext<LessonLevelContextType>(defaultValue);
export const useLessonLevelMap = () => useContext(LessonLevelContext);

const LEVELS = ["N3", "N2", "N1"];

export const LessonLevelProvider = ({ children }: { children: React.ReactNode }) => {
  const [lessonLevelMap, setLessonLevelMap] = useState<Map<number, string>>(new Map());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchAllLevels = async () => {
      const map = new Map<number, string>();

      for (const level of LEVELS) {
        try {
          const chapters = await fetchChapters(level);
          chapters.forEach(chapter => {
            chapter.lessons.forEach(lesson => {
              map.set(lesson.id, level);
            });
          });
        } catch (error) {
          console.error(`Error loading chapters for level ${level}`, error);
        }
      }

      setLessonLevelMap(map);
      setIsReady(true);
    };

    fetchAllLevels();
  }, []);

  return (
    <LessonLevelContext.Provider  value={{ lessonLevelMap, isReady }}>
      {children}
    </LessonLevelContext.Provider>
  );
};
