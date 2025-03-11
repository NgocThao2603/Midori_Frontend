import React, { useState } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/en";

const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const today = dayjs();

  // Giả lập các ngày có học
  const studyDays = [2, 5, 8, 12, 15, 18, 22, 25, 28];

  const handlePrevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  // Lấy danh sách các ngày trong tháng
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.startOf("month").day();

  // Tạo mảng các ngày để hiển thị
  const days: (Dayjs | null)[] = Array(firstDayOfMonth).fill(null);
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(currentMonth.date(i));
  }

  return (
    <div className="p-4 bg-green_pastel rounded-xl border w-80 min-h-[35vh]">
      {/* Thanh điều hướng */}
      <div className="flex items-center justify-between mb-4">
        <LeftOutlined onClick={handlePrevMonth} className="cursor-pointer" />
        <h2 className="text-lg font-bold text-secondary">
          {currentMonth.format("YYYY MMMM")}
        </h2>
        <RightOutlined onClick={handleNextMonth} className="cursor-pointer" />
      </div>

      {/* Hiển thị lưới lịch */}
      <div className="grid grid-cols-7 gap-2">
        {/* Header các ngày trong tuần */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-bold text-gray-600">
            {day}
          </div>
        ))}

        {/* Các ngày trong tháng */}
        {days.map((day, index) => (
          <div
            key={index}
            className={`w-8 h-8 flex items-center justify-center rounded-full ${
              day?.isSame(today, "day") ? "bg-green_bg border-2 border-green_border text-white font-bold" : ""
            } ${day && studyDays.includes(day.date()) ? "bg-white border border-green_border" : ""}`}
          >
            {day ? (
              studyDays.includes(day.date()) ? (
                <DoneOutlineIcon className="text-secondary" />
              ) : (
                day.date()
              )
            ) : (
              ""
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
