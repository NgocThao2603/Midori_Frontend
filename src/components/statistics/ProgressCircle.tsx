import React, { useEffect, useState } from "react";
import { useLessonStatuses } from "../../contexts/LessonStatusContext";
import { fetchChapters } from "../../services/api";

interface ProgressCircleProps {
  level: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ level }) => {
  const { lessonStatuses, isLessonComplete } = useLessonStatuses();
  const [percent, setPercent] = useState(0);
  const [doneLessons, setDoneLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);

  useEffect(() => {
    const calculateProgress = async () => {
      try {
        const chapters = await fetchChapters(level);
        const lessonIds = chapters.flatMap(ch => ch.lessons.map(l => l.id));

        const total = lessonIds.length;

        // Số lesson hoàn thành (đủ 4 mode)
        const done = lessonIds.filter(id => isLessonComplete(id)).length;

        // Tính tổng số mode đã hoàn thành
        let doneModes = 0;
        lessonIds.forEach(id => {
          const status = lessonStatuses[id];
          if (status) {
            doneModes += status.filter(Boolean).length;
          }
        });

        const totalModes = total * 4;
        const progress = totalModes > 0 ? Math.round((doneModes / totalModes) * 100) : 0;

        setDoneLessons(done);
        setTotalLessons(total);
        setPercent(progress);
      } catch (error) {
        console.error("Lỗi khi tính tiến độ:", error);
      }
    };

    calculateProgress();
  }, [level, isLessonComplete, lessonStatuses]);

  const radius = 75;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center p-4 bg-cyan_pastel rounded-2xl w-full">
      <svg className="w-48 h-48" viewBox="0 0 200 200">
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="100"
          cy="100"
          transform="rotate(-90 100 100)"
        />
        <circle
          className="text-cyan_border transition-all duration-500"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="100"
          cy="100"
          transform="rotate(-90 100 100)"
        />
        <text
          x="100"
          y="100"
          dominantBaseline="middle"
          textAnchor="middle"
          className="text-3xl font-bold fill-current text-cyan_border"
        >
          {percent}%
        </text>
      </svg>
      <div className="mt-2 text-gray-600">
        Đã hoàn thành <strong>{doneLessons}/{totalLessons}</strong> bài
      </div>
    </div>
  );
};

export default ProgressCircle;
