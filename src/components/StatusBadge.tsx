// components/StatusBadge.tsx
import React from "react";
import clsx from "clsx";

type StatusValue = "pass" | "fail" | "in_progress" | "abandoned" | "all";

const statusClasses: Record<StatusValue, string> = {
  all: "text-gray-800 border border-gray-500",
  pass: "bg-green_pastel text-secondary border border-green_border",
  fail: "bg-red_pastel text-red_text border border-red_text",
  in_progress: "bg-cyan_pastel text-cyan_text border border-cyan_border",
  abandoned: "bg-gray-100 text-gray-500 border border-gray-500",
};

const statusLabels: Record<StatusValue, string> = {
  all: "Tất cả",
  pass: "Đạt",
  fail: "Chưa đạt",
  in_progress: "Đang làm",
  abandoned: "Chưa hoàn thành",
};

export const StatusBadge: React.FC<{ status: StatusValue }> = ({ status }) => {
  return (
    <span
      className={clsx(
        "px-3 py-1 text-sm font-semibold rounded-full inline-block",
        statusClasses[status]
      )}
    >
      {statusLabels[status]}
    </span>
  );
};
