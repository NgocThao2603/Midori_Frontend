import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { Button } from "@mui/material";
import quoteIcon from "../assets/quote-icon.png";
import { useLessonStatuses } from "../contexts/LessonStatusContext";
import doneTicker from "../assets/doneTicker.png"; 
import { Slide } from "../components/Slide";
import ex_listen from "../assets/ex_listen.png";
import ex_listen_fill from "../assets/ex_listen_fill.png";
import { useLessonLevelMap } from "../contexts/LessonLevelContext";
import { useEffect } from "react";
import { fetchChapters } from "../services/api";

const Listen: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { isDoneStatus } = useLessonStatuses();
  const done = lessonId ? isDoneStatus(Number(lessonId), "listen") : false;
  const images = [ex_listen, ex_listen_fill];

  const { level } = useOutletContext<{ level: string }>();
  const { lessonLevelMap, isReady } = useLessonLevelMap();

  useEffect(() => {
    if (!lessonId || !isReady) return;
    const lessonLevel = lessonLevelMap.get(Number(lessonId));
    if (lessonLevel !== level) {
      fetchChapters(level).then((chapters) => {
        const firstLessonId = chapters?.[0]?.lessons?.[0]?.id;
        if (firstLessonId) {
          navigate(`/listen/${firstLessonId}`, { replace: true });
        }
      });
    }
  }, [level, lessonId, isReady, lessonLevelMap, navigate]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center space-y-8">
      <div className="relative w-full max-w-4xl">
        {lessonId && done && (
          <img src={doneTicker} alt=" " className="w-24 h-24 absolute top-8 right-2 z-10" />
        )}
      </div>
      <div className="relative border border-cyan_border rounded-xl p-4 bg-cyan_pastel text-cyan_text w-[100%] mt-12">
        <img src={quoteIcon} alt="" className="absolute top-4 left-4 w-4 h-4"/>
        <img src={quoteIcon} alt="" className="absolute bottom-4 right-4 w-4 h-4 rotate-180" />
        <div className="py-6 px-8">
          <p className="font-semibold text-xl">
            Cùng Midori luyện nghe
          </p>
          <ul className="flex w-3/4 mx-auto list-disc list-inside mt-4 items-center justify-between">
            <li>Nghe và chọn đáp án đúng</li>
            <li>Nghe và sắp xếp câu</li>
            <li>Nghe và viết lại</li>
          </ul>
          <div className="w-3/4 h-76 mt-6 items-center mx-auto">
            <Slide images={images} variant="plain"/>
          </div>
          <p className="mt-4 font-semibold text-xl text-center">Thử thách luyện nghe và nắm bắt keyword!</p>
        </div> 
      </div>

      <Button
        variant="contained"
        onClick={() => navigate(`/practice-listen/${lessonId}`)}
        className="!bg-cyan_border hover:!bg-secondary !text-white !font-bold !text-xl !px-6 !py-4 !mt-6 !rounded-lg !focus:outline-none"
        sx={{
          "&:focus": { outline: "none", boxShadow: "none" },
        }}
      >
        {done ? "LUYỆN NGHE LẠI" : "BẮT ĐẦU LUYỆN NGHE"}
      </Button>
    </div>
  );
};

export default Listen;
