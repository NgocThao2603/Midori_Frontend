import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useLessonStatuses } from "../contexts/LessonStatusContext";
import { fetchChapters } from "../services/api";
import { Book, Pencil, Headphones, FileText } from "lucide-react";

const modes = [
  { key: "phrase", label: "Học cụm từ", icon: Book, bg_color: "bg-[#fcffe6]", bd_color: "border-[#ffe58f]" },
  { key: "translate", label: "Luyện dịch", icon: Pencil, bg_color: "bg-[#fff0f6]", bd_color: "border-[#ffadd2]" },
  { key: "listen", label: "Luyện nghe", icon: Headphones, bg_color: "bg-[#f0f5ff]", bd_color: "border-[#c7d1f4]" },
  { key: "test", label: "Làm bài test", icon: FileText, bg_color: "bg-[#f6ffed]", bd_color: "border-[#b7eb8f]" },
] as const;

type ContextType = { level: string; activeChapterId: number | null };

const Statistic: React.FC = () => {
  const { lessonStatuses } = useLessonStatuses();
  const { level } = useOutletContext<ContextType>();
  const [lessonIdsInLevel, setLessonIdsInLevel] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchLessonIds = async () => {
      try {
        const chapters = await fetchChapters(level);
        const lessonIds = chapters.flatMap(ch => ch.lessons.map(l => l.id));
        setLessonIdsInLevel(new Set(lessonIds));
      } catch (error) {
        console.error("Lỗi khi fetch lessons theo level:", error);
      }
    };
    fetchLessonIds();
  }, [level]);

  const getProgress = (modeKey: typeof modes[number]["key"]) => {
    const index = { phrase: 0, translate: 1, listen: 2, test: 3 }[modeKey];
    let done = 0;
    let total = 0;

    Object.entries(lessonStatuses).forEach(([lessonIdStr, status]) => {
      const lessonId = Number(lessonIdStr);
      if (!lessonIdsInLevel.has(lessonId)) return;
      total += 1;
      if (status[index]) done += 1;
    });

    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { done, total, percent };
  };

  const getProgressColor = (percent: number) => {
    if (percent < 25) return "bg-red_text";
    if (percent < 50) return "bg-yellow-500";
    if (percent < 75) return "bg-blue-500";
    return "bg-green-500";  
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-2 p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {modes.map(({ key, label, icon: Icon, bg_color, bd_color }) => {
        const { done, total, percent } = getProgress(key);
        const progressColor = getProgressColor(percent);
        return (
          <div
            key={key}
            className={`${bg_color} border ${bd_color} rounded-xl p-6 flex flex-col gap-2`}
          >
            <div className="flex text-lg text-cyan_text font-bold">
              <Icon className="w-8 h-8 mr-2" />
              {label}
            </div>
            <div className="text-gray-600 mt-2"><strong>{`${done}/${total}`}</strong>  bài đã hoàn thành</div>
            <div className="w-full bg-white border rounded-full h-3 mt-2">
              <div
                className={`${progressColor} h-3 rounded-full`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="text-right text-lg text-cyan_text font-semibold">{percent}%</div>
          </div>
        );
      })}
    </div>
  );
};

export default Statistic;
