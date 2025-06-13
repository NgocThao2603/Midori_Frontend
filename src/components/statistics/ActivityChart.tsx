import { LineChart, lineElementClasses } from "@mui/x-charts/LineChart";
import { useActivityChartData } from "../../hooks/useActivityChartData";
import point from "../../assets/point.png";
import { useEffect, useState } from "react";
import { FormControl, MenuItem, Select } from "@mui/material";

const chartOptions = [
  { label: "Tuần này", key: "currentWeek" },
  { label: "Tuần trước", key: "lastWeek" },
  { label: "Tháng này", key: "currentMonth" },
  { label: "Tháng trước", key: "lastMonth" },
] as const;

export default function ActivityChart({
  level,
  onTotalChange,
}: {
  level: string;
  onTotalChange?: (total: number) => void;
}) {
  const [selected, setSelected] = useState<"currentWeek" | "lastWeek" | "currentMonth" | "lastMonth">("currentWeek");
  const { dataByRange, totals } = useActivityChartData(level);
  const data = dataByRange[selected];
  const total = totals[selected];

  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(total);
    }
  }, [total, onTotalChange]);

  const xAxisData = data.map((d) => d.date);
  const yAxisData = data.map((d) => d.point);

  return (
    <div className="relative w-full">
      <div className="mb-4 flex justify-end">
        <FormControl
          sx={{
            minWidth: 120,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#139139",
                borderRadius: "8px",
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: "#139139",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#139139",
                borderWidth: "1px",
              },
              "& .MuiSelect-select": {
                padding: "8px 18px",
                height: "2em",
                minHeight: "1.2em",
                display: "flex",
                alignItems: "center"
              },
            },
            "& .MuiInputLabel-outlined": {
              color: "#008000",
              fontWeight: "bold",
              "&.Mui-focused": {
                color: "#008000",
              },
            },
          }}
        >
          <Select
            className="focus:outline-none"
            value={selected}
            onChange={(e) => setSelected(e.target.value as any)}
            MenuProps={{
              PaperProps: {
                sx: {
                  "& .MuiMenuItem-root": {
                    "&:hover, &:focus": {
                      backgroundColor: "#E8F5E9",
                    },
                  },
                },
              },
            }}
            sx={{
              color: "#008000",
              fontWeight: "bold",
              "& .MuiSelect-icon": {
                color: "#008000"
              },
              "& .hover":{
                backgroundColor: "#E8F5E9"
              }
            }}
          >
            {chartOptions.map((option) => (
              <MenuItem key={option.key} value={option.key}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="absolute left-14 z-10 flex items-center gap-2">
        <img src={point} alt=" " className="w-8 h-8" />
      </div>
      <LineChart
        xAxis={[{
          scaleType: "point",
          data: xAxisData,
          label: "Ngày",
          tickLabelStyle: { fill: "#555", fontSize: 14 },
          labelStyle: { fill: "#008000", fontSize: 14, fontWeight: 600 },
        }]}
        yAxis={[{
          tickLabelStyle: { fill: "#555", fontSize: 14 },
          labelStyle: { fill: "#008000", fontSize: 16, fontWeight: 600 },
        }]}
        series={[{
          data: yAxisData,
          label: "Điểm thưởng",
          color: "#B7EB8F",
          curve: "monotoneX",
          area: true,
        }]}
        width={850}
        height={400}
        sx={{
          [`.${lineElementClasses.root}`]: {
            strokeWidth: 3,
          },
        }}
      />
    </div>
  );
}
