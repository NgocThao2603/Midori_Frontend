import React, { createContext, useContext, useState } from "react";

interface LessonEntryContextType {
  fromLessonSection: boolean;
  setFromLessonSection: (val: boolean) => void;
}

const LessonEntryContext = createContext<LessonEntryContextType | undefined>(undefined);

export const LessonEntryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fromLessonSection, setFromLessonSection] = useState(false);

  return (
    <LessonEntryContext.Provider value={{ fromLessonSection, setFromLessonSection }}>
      {children}
    </LessonEntryContext.Provider>
  );
};

export const useLessonEntry = () => {
  const ctx = useContext(LessonEntryContext);
  if (!ctx) throw new Error("useLessonEntry must be used within LessonEntryProvider");
  return ctx;
};
