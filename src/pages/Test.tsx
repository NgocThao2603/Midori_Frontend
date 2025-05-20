import { useParams, useNavigate } from "react-router-dom";
import { Button, Tabs, Tab } from "@mui/material";
import quoteIcon from "../assets/quote-icon.png";
import { useLessonStatuses } from "../contexts/LessonStatusContext";
import doneTicker from "../assets/doneTicker.png"; 
import point from "../assets/point.png";
import { getTests, TestInfo } from "../services/api";
import { useEffect, useState } from "react";

const Test: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { isDoneStatus } = useLessonStatuses();
  const done = lessonId ? isDoneStatus(Number(lessonId), "test") : false;

  const [testList, setTestList] = useState<TestInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedTest = testList[selectedIndex];

  useEffect(() => {
    if (lessonId) {
      getTests(Number(lessonId)).then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTestList(data);
          setSelectedIndex(0);
        } else {
          setTestList([]);
          setSelectedIndex(0);
        }
      });
    }
  }, [lessonId]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center">
      <div className="relative w-full max-w-4xl">
        {lessonId && done && (
          <img src={doneTicker} alt=" " className="w-24 h-24 absolute top-8 right-2 z-10" />
        )}
      </div>

      {/* Tabs */}
      {testList.length > 1 && (
        <div className="w-full">
          <Tabs
            value={selectedIndex}
            onChange={(_, newIndex) => setSelectedIndex(newIndex)}
            variant="scrollable"
            scrollButtons="auto"
            className="border-b"
            slotProps={{ indicator: { style: { display: "none" } } }}
          >
            {testList.map((test, index) => (
              <Tab
                key={test.id}
                label={`Bài test ${index + 1}`}
                sx={{
                  fontWeight: "bold",
                  fontSize: 16,
                  color: "gray",
                  backgroundColor: "transparent",
                  borderRadius: "15px 15px 0 0",
                  transition: "background 0.3s, color 0.3s",
                  border: "none",
                  outline: "none",
                  "&.Mui-selected": {
                    backgroundColor: "#1B5E20",
                    color: "white",
                    border: "none",
                  },
                  "&:focus": {
                    outline: "none",
                    border: "none",
                  },
                  "&:active": {
                    outline: "none",
                    border: "none",
                  },
                }}
              />
            ))}
          </Tabs>
        </div>
      )}

      {/* Card nội dung bài test */}
      <div className="relative border border-cyan_border rounded-xl p-4 bg-cyan_pastel text-cyan_text w-full mt-6">
        <img src={quoteIcon} alt="" className="absolute top-4 left-4 w-4 h-4"/>
        <img src={quoteIcon} alt="" className="absolute bottom-4 right-2 w-4 h-4 rotate-180" />
        <div className="py-6 px-8">
          <p className="font-semibold text-2xl text-center">
            {selectedTest ? selectedTest.title : "Đang tải..."}
          </p>
          <div className="flex justify-between mt-6 mx-4">
            <p className="text-lg">Điểm tối đa: <span className="text-xl text-secondary font-bold">{selectedTest?.total_score ?? "100"}</span></p>
            <p className="text-lg">Điểm qua bài: <span className="text-xl text-red_text font-bold">{selectedTest?.pass_score ?? "75"}</span></p>
            <p className="text-lg">Thời gian: <span className="text-xl text-cyan_text font-bold">{selectedTest?.duration_minutes ?? "30"} phút</span></p>
          </div>
          <p className="mt-6 font-semibold text-xl flex items-center justify-center">
            Hoàn thành bài test để có {selectedTest?.total_score} <img src={point} alt=" " className="w-8 h-8"/>!
          </p>
        </div> 
      </div>

      <Button
        variant="contained"
        onClick={() => navigate(`/practice-test/${lessonId}`)}
        className="!bg-cyan_border hover:!bg-secondary !text-white !font-bold !text-xl !px-6 !py-4 !mt-6 !rounded-lg !focus:outline-none"
        sx={{
          "&:focus": { outline: "none", boxShadow: "none" },
        }}
      >
        {done ? "LÀM LẠI" : "BẮT ĐẦU BÀI TEST"}
      </Button>
    </div>
  );
};

export default Test;
