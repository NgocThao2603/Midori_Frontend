import { Dialog, DialogContent, Button } from "@mui/material";
import mascot_happy from "../../assets/mascot_happy.png";
import mascot_sad from "../../assets/mascot_sad.png";
import point from "../../assets/point.png";

type ResultTestPopupProps = {
  open: boolean;
  onClose: () => void;
  viewDetail: () => void;
  score: number;
  status: "pass" | "fail";
  answer_count: number;
  correct_count: number;
  wrong_count: number;
  total_questions: number;
  duration: string;
};

export default function ResultTestPopup({
  open,
  onClose,
  viewDetail,
  score,
  status,
  answer_count,
  correct_count,
  wrong_count,
  total_questions,
  duration
}: ResultTestPopupProps) {
  const percentage = total_questions > 0 ? Math.round((correct_count / total_questions) * 100) : 0;
   return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent className="text-center p-8">
        <img 
          src={status === "pass" ? mascot_happy : mascot_sad} 
          alt="Mascot" 
          className="w-32 h-32 mx-auto mb-4"
        />
        <h2 className={`text-2xl font-bold mb-4 ${status === "pass" ? 'text-secondary' : 'text-red_text'}`}>
          {status === "pass" ? 'Chúc mừng bạn đã hoàn thành bài test!' : 'Rất tiếc!'}
        </h2>

        <div className="space-y-4 text-lg">
          <div className="flex justify-between items-center px-[20%] gap-2">
            <p>Đã làm: {answer_count}/{total_questions} câu</p>
            <p>Thời gian: {duration}</p>
          </div>

          <div className="flex justify-between px-[20%] gap-2 font-semibold">
            <p className="text-secondary">Đúng: {correct_count}</p>
            <p className="text-red_text">Sai: {wrong_count}</p>
            <p className="text-cyan_text">Tỷ lệ đúng: {percentage}%</p>
          </div>
          <p>Điểm số: {score}</p>
        </div>

        {status === "pass" && (
          <div className="flex items-center justify-center mt-6">
            <p className="text-3xl text-secondary font-bold">
              +{score}
            </p>
            <img src={point} alt="" className="w-10 h-10"/>
          </div>
        )}

        <div className="flex justify-center gap-8">
          <Button
            variant="contained"
            onClick={onClose}
            className="!bg-black hover:!bg-secondary !text-white !font-bold !mt-8"
          >
            Đóng
          </Button>
          <Button
            variant="contained"
            onClick={(viewDetail)}
            className="!bg-cyan_border hover:!bg-secondary !text-white !font-bold !mt-8"
          >
            Xem chi tiết
          </Button>
        </div>    
      </DialogContent>
    </Dialog>
  );
}
