import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import quoteIcon from "../assets/quote-icon.png";

const Translate: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center space-y-8">
      <div className="relative border border-cyan_border rounded-xl p-4 bg-cyan_pastel text-cyan_text w-[100%] mt-12">
        <img src={quoteIcon} alt="" className="absolute top-4 left-4 w-4 h-4"/>
        <img src={quoteIcon} alt="" className="absolute bottom-4 right-4 w-4 h-4 rotate-180" />
        <div className="py-6 px-8">
          <p className="font-semibold text-xl">
            Cùng Midori luyện tập với các câu hỏi đa dạng
          </p>
          <ul className="list-disc list-inside ml-2 mt-4 space-y-2">
            <li>Thi nối từ</li>
            <li>Đoán nghĩa đúng</li>
            <li>Cách đọc sao ta?</li>
          </ul>
          <p className="mt-4 font-semibold text-xl">Thử thách trí nhớ của bạn!</p>
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
        BẮT ĐẦU LUYỆN TẬP
      </Button>
    </div>
  );
};

export default Translate;