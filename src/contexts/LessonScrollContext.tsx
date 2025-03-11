import { createContext, useContext, useRef, RefObject, ReactNode } from "react";

interface LessonScrollContextType {
  lessonRefs: RefObject<{ [key: string]: HTMLDivElement | null }>;
  scrollToLesson: (lesson: string) => void;
}

const LessonScrollContext = createContext<LessonScrollContextType | null>(null);

interface LessonScrollProviderProps {
  children: ReactNode;
}

export const LessonScrollProvider: React.FC<LessonScrollProviderProps> = ({ children }) => {
  const lessonRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToLesson = (lesson: string) => {
    if (lessonRefs.current[lesson]) {
      lessonRefs.current[lesson]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <LessonScrollContext.Provider value={{ lessonRefs, scrollToLesson }}>
      {children}
    </LessonScrollContext.Provider>
  );
};

// Hook để sử dụng Context
export const useLessonScroll = () => {
  const context = useContext(LessonScrollContext);
  if (!context) {
    throw new Error("useLessonScroll must be used within a LessonScrollProvider");
  }
  return context;
};
