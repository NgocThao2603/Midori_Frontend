import { Dialog, DialogContent } from "@mui/material";
import mascot_happy from "../../assets/mascot_happy.png";
import mascot_sad from "../../assets/mascot_sad.png";
import point from "../../assets/point.png";

type ResultPopupProps = {
  open: boolean;
  onClose: () => void;
  isPassed: boolean;
  correctCount: number;
  MAX_WRONG_ANSWERS: number;
  totalQuestions: number;
  earnedPoints: number;
};

export default function ResultPopup({ 
  open, 
  onClose, 
  isPassed, 
  correctCount, 
  MAX_WRONG_ANSWERS,
  totalQuestions,
  earnedPoints 
}: ResultPopupProps) {
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent className="text-center p-8 mb-4">
        <img 
          src={isPassed ? mascot_happy : mascot_sad} 
          alt="Mascot" 
          className="w-32 h-32 mx-auto mb-4"
        />
        <h2 className={`text-2xl font-bold mb-4 ${isPassed ? 'text-secondary' : 'text-red_text'}`}>
          {isPassed ? 'Chúc mừng bạn đã hoàn thành bài học!' : 'Rất tiếc!'}
        </h2>
        {!isPassed ? (
          <p className="text-lg mb-2">
            Bạn cần trả lời đúng {totalQuestions - MAX_WRONG_ANSWERS} câu. Hãy cố gắng hơn nhé!
          </p>
        ) : (
          <p className="text-lg mb-2">
            Bạn đã trả lời đúng {correctCount}/{totalQuestions} câu ({percentage}%).
          </p>
        )}
        {isPassed && (
          <div className="flex items-center justify-center mt-4">
            <p className="text-3xl text-secondary font-bold">
              +{earnedPoints}
            </p>
            <img src={point} alt="" className="w-10 h-10"/>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
