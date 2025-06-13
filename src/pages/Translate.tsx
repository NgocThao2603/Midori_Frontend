import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import quoteIcon from "../assets/quote-icon.png";
import { useLessonStatuses } from "../contexts/LessonStatusContext";
import doneTicker from "../assets/doneTicker.png"; 
import { Slide } from "../components/Slide";
import ex_translate from "../assets/ex_translate.png";
import ex_blank from "../assets/ex_blank.png";

const Translate: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { isDoneStatus } = useLessonStatuses();
  const done = lessonId ? isDoneStatus(Number(lessonId), "translate") : false;
  const images = [ex_translate, ex_blank];
  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center space-y-8">
      <div className="relative w-full max-w-4xl">
        {lessonId && done && (
          <img src={doneTicker} alt=" " className="w-24 h-24 absolute top-8 right-2 z-10" />
        )}
      </div>
      <div className="relative border border-cyan_border rounded-xl p-4 bg-cyan_pastel text-cyan_text w-[100%] mt-12">
        <img src={quoteIcon} alt="" className="absolute top-4 left-4 w-4 h-4"/>
        <img src={quoteIcon} alt="" className="absolute bottom-4 right-2 w-4 h-4 rotate-180" />
        <div className="py-6 px-8">
          <p className="font-semibold text-xl">
            Cùng Midori luyện dịch câu
          </p>
          <ul className="flex w-3/4 mx-auto list-disc list-inside mt-4 items-center justify-between">
            <li>Sắp xếp câu</li>
            <li>Viết câu cho đúng nghĩa</li>
          </ul>
          <div className="w-3/4 h-76 mt-6 items-center mx-auto">
            <Slide images={images} variant="plain"/>
          </div>
          <p className="mt-4 font-semibold text-xl text-center">Thử thách luyện dịch và ghép câu!</p>
        </div> 
      </div>

      <Button
        variant="contained"
        onClick={() => navigate(`/practice-translate/${lessonId}`)}
        className="!bg-cyan_border hover:!bg-secondary !text-white !font-bold !text-xl !px-6 !py-4 !mt-6 !rounded-lg !focus:outline-none"
        sx={{
          "&:focus": { outline: "none", boxShadow: "none" },
        }}
      >
        {done ? "LUYỆN DỊCH LẠI" : "BẮT ĐẦU LUYỆN DỊCH"}
      </Button>
    </div>
  );
};

export default Translate;
