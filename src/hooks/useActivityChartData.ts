import { useUserActivities } from "../contexts/UserActivityContext";
import {
  eachDayOfInterval,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
} from "date-fns";

type ActivityChartPoint = {
  date: string;
  point: number;
};

type ActivityChartData = {
  data: ActivityChartPoint[];
  total: number;
};

export const useActivityChartData = (level: string) => {
  const { getActivity } = useUserActivities();

  const now = new Date();

  const getDataForRange = (start: Date, end: Date): ActivityChartData => {
    const days = eachDayOfInterval({ start, end });
    const data = days.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const activity = getActivity(level, dateStr);
      return {
        date: format(date, "dd-MM"),
        point: activity?.point_earned ?? 0,
      };
    });
    const total = data.reduce((sum, d) => sum + d.point, 0);
    return { data, total };
  };

  const currentWeek = getDataForRange(startOfWeek(now), endOfWeek(now));
  const lastWeek = getDataForRange(startOfWeek(subWeeks(now, 1)), endOfWeek(subWeeks(now, 1)));
  const currentMonth = getDataForRange(startOfMonth(now), endOfMonth(now));
  const lastMonth = getDataForRange(startOfMonth(subMonths(now, 1)), endOfMonth(subMonths(now, 1)));

  return {
    dataByRange: {
      currentWeek: currentWeek.data,
      lastWeek: lastWeek.data,
      currentMonth: currentMonth.data,
      lastMonth: lastMonth.data,
    },
    totals: {
      currentWeek: currentWeek.total,
      lastWeek: lastWeek.total,
      currentMonth: currentMonth.total,
      lastMonth: lastMonth.total,
    }
  };
};
