import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";
import localeData from "dayjs/plugin/localeData";
import isoWeek from "dayjs/plugin/isoWeek"; 
import React, { useEffect, useState } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import Tooltip from "@mui/material/Tooltip";
import { useUserActivities } from "../contexts/UserActivityContext";
import tick from "../assets/tick.png";
dayjs.extend(localeData);
dayjs.extend(isoWeek);
dayjs.locale("vi");

interface CalendarProps {
  level: string;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}

const Calendar: React.FC<CalendarProps> = ({ level, isExpanded, setIsExpanded }) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const today = dayjs();
  const { hasStudied, isLoading } = useUserActivities();
  const isCurrentMonth = currentMonth.isSame(today, "month");

  useEffect(() => {
    if (!isCurrentMonth) {
      setIsExpanded(true);
    }
  }, [currentMonth, today]);

  const handlePrevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = (currentMonth.startOf("month").isoWeekday() - 1) % 7;
  
  const getFormattedMonthYear = () => {
    const year = currentMonth.year();
    const month = currentMonth.locale("vi").format("MMMM");
    return `${year} - ${month.charAt(0).toUpperCase() + month.slice(1)}`;
  };

  const days: (Dayjs | null)[] = Array(firstDayOfMonth).fill(null);
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(currentMonth.date(i));
  }

  // Tính toán tuần hiện tại (chứa today)
  const currentWeekStart = today.startOf("isoWeek");
  const currentWeek = Array.from({ length: 7 }, (_, i) => currentWeekStart.add(i, "day"));

  const renderDayCell = (day: Dayjs | null, index: number) => {
    if (!day) return <div key={index} />;

    const dateStr = day.format("YYYY-MM-DD");
    const studied = hasStudied(level, dateStr);
    const isToday = day.isSame(today, "day");

    return (
      <div
        key={index}
        className={`w-8 h-8 flex items-center justify-center rounded-full
          ${isToday ? "bg-green_bg border-2 border-green_border text-white font-bold" : ""}
        `}
      >
        {isToday ? day.date() : studied ? <img src={tick} className="w-6 h-6" /> : day.date()}
      </div>
    );
  };

  return (
    <div className="p-4 bg-green_pastel rounded-xl border w-80">
      {/* Thanh điều hướng */}
      <div className="flex items-center justify-between mb-4">
        <LeftOutlined onClick={handlePrevMonth} className="cursor-pointer" />
        <h2 className="text-lg font-bold text-secondary">
          {getFormattedMonthYear()}
        </h2>
        <RightOutlined onClick={handleNextMonth} className="cursor-pointer" />
      </div>

      {/* Header các ngày trong tuần */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
          <div key={day} className="text-center font-bold text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Lưới lịch: hiển thị tuần hoặc tháng */}
      <div className="grid grid-cols-7 gap-2">
        {!isLoading && (
          isExpanded
            ? days.map((day, index) => renderDayCell(day, index))
            : currentWeek.map((day, index) => renderDayCell(day, index))
        )}
      </div>
      {isCurrentMonth && (
        <Tooltip
          title={isExpanded ? "Thu gọn" : "Mở rộng"}
          placement="top"
          arrow
          slotProps={{
            tooltip: {
              sx: {
                backgroundColor: "#4caf50",
                color: "#fff",
                fontSize: "0.75rem",
                fontWeight: "bold",
                borderRadius: "8px",
                padding: "6px 12px",
              },
            },
          }}
        >
          <div
            className="cursor-pointer text-center font-bold text-secondary"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 
              <KeyboardDoubleArrowUpIcon className="hover:scale-125 transition-transform"/> 
              : <KeyboardDoubleArrowDownIcon className="hover:scale-125 transition-transform"/>}
          </div>
        </Tooltip>
      )}
    </div>
  );
};

export default Calendar;
