import { Carousel } from "antd";
import { CarouselRef } from "antd/es/carousel";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { Question } from "../../services/api";
import Choice from "./Choice";
import Match from "./Match";
import { useQuestionChecker } from "../../hooks/useQuestionChecker";
import { Button } from "@mui/material";

type TemplateProps = {
  questions: Question[];
  lessonId: number;
};

export default function Template({ questions, lessonId }: TemplateProps) {
  const TOTAL_QUESTIONS = questions.length;
  const navigate = useNavigate();
  const carouselRef = useRef<CarouselRef | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const {
    userAnswers,
    results,
    isChecked,
    setAnswer,
    checkAnswer,
  } = useQuestionChecker(questions);

  const goToNext = () => {
    if (currentSlide < TOTAL_QUESTIONS - 1 && carouselRef.current) {
      carouselRef.current.next();
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Progress bar mimic */}
      <div className="fixed flex gap-2 top-10 left-1/2 -translate-x-1/2 items-center w-[75vw] mx-auto">
        {Array.from({ length: TOTAL_QUESTIONS }).map((_, index) => {
          const questionId = questions[index]?.id;
          const result = results[questionId];
          const isAnswered = userAnswers[questionId] !== undefined;

          let colorClass = "bg-gray-300";

          if (isChecked(questionId)) {
            if (result === "correct") {
              colorClass = "bg-secondary";
            } else if (result === "incorrect" && isAnswered) {
              colorClass = "bg-red_text";
            } else if (index === currentSlide) {
              colorClass = "bg-secondary";
            }
          } else {
            if (index <= currentSlide) {
              colorClass = "bg-secondary";
            } else {
              colorClass = "bg-gray-300";
            }
          }  
          return (
            <div
              key={index}
              style={{ flex: 1 }}
              className={`h-1.5 rounded-full transition-all duration-300 ${colorClass}`}
            />
          );
       })}

        <CloseOutlinedIcon
          style={{ fontSize: 40 }}
          className="ml-4 cursor-pointer"
          onClick={() => navigate(`/learn-phrase/${lessonId}`, { replace: true })}
        />
      </div>

      {/* Carousel */}
      <Carousel
        ref={carouselRef}
        dots={false}
        beforeChange={(_, next) => setCurrentSlide(next)}
        draggable={false}
        className="top-20 w-[75vw] mx-auto"
      >
        {questions.map((question) => (
          <div key={question.id} className="p-4">
            {question.question_type === "choice" && (
              <Choice
                questionTitle={question.question}
                choices={question.choices}
                selectedId={userAnswers[question.id] as number}
                isChecked={isChecked(question.id)}
                checkResult={results[question.id]}
                onSelect={(id) => setAnswer(question.id, id)}
              />
            )}

            {question.question_type === "matching" && (
              <Match
                questionTitle={question.question}
                choices={question.choices}
                selectedIds={userAnswers[question.id] as number[]}
                isChecked={isChecked(question.id)}
                checkResult={results[question.id]}
                onSelect={(id) => setAnswer(question.id, id)}
              />
            )}

            {!isChecked(question.id) && (
              <div className="mt-10 text-center">
                <Button
                  variant="contained"
                  onClick={() => checkAnswer(question.id)}
                  className="!bg-cyan_border hover:!bg-secondary !text-white !font-bold !text-xl !px-6 !py-4 !mt-6 !rounded-lg !focus:outline-none"
                  sx={{
                    "&:focus": { outline: "none", boxShadow: "none" },
                  }}
                >
                  Kiểm tra
                </Button>
              </div>
            )}
          </div>
        ))}
      </Carousel>

      {/* Nút chuyển câu */}
      <div className="mt-4 left-auto">
        <button
          onClick={goToNext}
          disabled={currentSlide === TOTAL_QUESTIONS - 1 || !isChecked(questions[currentSlide]?.id)}
          className="fixed top-1/2 right-10 -translate-y-1/2 border-none bg-white text-secondary focus:outline-none disabled:text-gray-300"
        >
          <ArrowForwardIosOutlinedIcon style={{ fontSize: 72 }} />
        </button>
      </div>
    </div>
  );
}
