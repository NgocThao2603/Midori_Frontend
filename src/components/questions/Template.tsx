// import { Carousel } from "antd";
// import { CarouselRef } from "antd/es/carousel";
// import { useEffect, useRef, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
// import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
// import { Button } from "@mui/material";
// import { AudioFile, Question } from "../../services/api";
// import { fetchAudioFiles } from "../../services/AudioService";
// import Choice from "./Choice";
// import Match from "./Match";
// import Sort from "./Sort";
// import FillBlank from "./FillBlank";
// import { useQuestionChecker } from "../../hooks/useQuestionChecker";

// type TemplateProps = {
//   questions: Question[];
//   lessonId: number;
// };

// export default function Template({ questions, lessonId }: TemplateProps) {
//   const TOTAL_QUESTIONS = questions.length;
//   const navigate = useNavigate();
//   const carouselRef = useRef<CarouselRef | null>(null);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const location = useLocation();
//   const mode = location.pathname.includes("translate") ? "translate" : "listen";

//   const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);

//   const globalAudioRef = useRef<HTMLAudioElement>(null);

//   const {
//     userAnswers,
//     results,
//     isChecked,
//     setAnswer,
//     checkAnswer,
//   } = useQuestionChecker(questions);

//   const goToNext = () => {
//     if (currentSlide < TOTAL_QUESTIONS - 1 && carouselRef.current) {
//       carouselRef.current.next();
//     }
//   };

//   const getBackRoute = () => {
//     if (location.pathname.includes("practice-phrase")) return `/learn-phrase/${lessonId}`;
//     if (location.pathname.includes("practice-translate")) return `/translate/${lessonId}`;
//     if (location.pathname.includes("practice-listen")) return `/listen/${lessonId}`;
//     return `/learn-phrase/${lessonId}`;
//   };

//   useEffect(() => {
//     fetchAudioFiles().then(setAudioFiles);
//   }, []);

//   return (
//     <div className="relative w-full h-screen">
//       {/* Progress bar mimic */}
//       <div className="fixed flex gap-2 top-10 left-1/2 -translate-x-1/2 items-center w-[75vw] mx-auto">
//         {Array.from({ length: TOTAL_QUESTIONS }).map((_, index) => {
//           const questionId = questions[index]?.id;
//           const result = results[questionId];
//           const isAnswered = userAnswers[questionId] !== undefined;

//           let colorClass = "bg-gray-300";

//           if (isChecked(questionId)) {
//             if (result === "correct") {
//               colorClass = "bg-secondary";
//             } else if (result === "incorrect" && isAnswered) {
//               colorClass = "bg-red_text";
//             } else if (index === currentSlide) {
//               colorClass = "bg-secondary";
//             }
//           } else {
//             if (index <= currentSlide) {
//               colorClass = "bg-secondary";
//             } else {
//               colorClass = "bg-gray-300";
//             }
//           }  
//           return (
//             <div
//               key={index}
//               style={{ flex: 1 }}
//               className={`h-1.5 rounded-full transition-all duration-300 ${colorClass}`}
//             />
//           );
//        })}

//         <CloseOutlinedIcon
//           style={{ fontSize: 40 }}
//           className="ml-4 cursor-pointer"
//           onClick={() => navigate(getBackRoute(), { replace: true })}
//         />
//       </div>

//       {/* Carousel */}
//       <Carousel
//         ref={carouselRef}
//         dots={false}
//         beforeChange={(_, next) => setCurrentSlide(next)}
//         draggable={false}
//         className="top-20 w-[75vw] mx-auto"
//       >
//         {questions.map((question) => (
//           <div key={question.id} className="p-4">
//             {question.question_type === "choice" && (
//               <Choice
//                 questionTitle={question.question}
//                 choices={question.choices}
//                 selectedId={userAnswers[question.id] as number}
//                 isChecked={isChecked(question.id)}
//                 checkResult={results[question.id]}
//                 onSelect={(id) => setAnswer(question.id, id)}
//                 audioFiles={audioFiles}
//               />
//             )}

//             {question.question_type === "matching" && (
//               <Match
//                 questionTitle={question.question}
//                 choices={question.choices}
//                 selectedIds={userAnswers[question.id] as number[]}
//                 isChecked={isChecked(question.id)}
//                 checkResult={results[question.id]}
//                 onSelect={(id) => setAnswer(question.id, id)}
//                 audioFiles={audioFiles}
//               />
//             )}

//             {question.question_type === "sorting" && (
//               <Sort
//                 questionTitle={question.question}
//                 tokens={question.example_tokens || []}
//                 selectedIds={userAnswers[question.id] as number[]}
//                 isChecked={isChecked(question.id)}
//                 checkResult={results[question.id]}
//                 onSelect={(id) => setAnswer(question.id, id)}
//                 audioFiles={audioFiles}
//                 mode={mode}
//                 audioRef={globalAudioRef}
//               />
//             )}
//             {question.question_type === "fill_blank" && (
//               <FillBlank
//                 questionTitle={question.question}
//                 isChecked={isChecked(question.id)}
//                 checkResult={results[question.id]}
//                 onSelect={(answer) => setAnswer(question.id, answer)}
//                 correct_answers={question.correct_answers}
//                 audioFiles={audioFiles}
//                 mode={mode}
//               />
//             )}

//             {/* Hiện nút kiểm tra nếu chưa kiểm tra */}
//             {!isChecked(question.id) && (
//               <div className="mt-10 text-center">
//                 <Button
//                   variant="contained"
//                   onClick={() => checkAnswer(question.id)}
//                   className="!bg-cyan_border hover:!bg-secondary !text-white !font-bold !text-xl !px-6 !py-4 !mt-6 !rounded-lg !focus:outline-none"
//                   sx={{
//                     "&:focus": { outline: "none", boxShadow: "none" },
//                   }}
//                 >
//                   Kiểm tra
//                 </Button>
//               </div>
//             )}
//           </div>
//         ))}
//       </Carousel>

//       {/* Nút chuyển câu */}
//       <div className="mt-4 left-auto">
//         <button
//           onClick={goToNext}
//           disabled={currentSlide === TOTAL_QUESTIONS - 1 || !isChecked(questions[currentSlide]?.id)}
//           className="fixed top-1/2 right-10 -translate-y-1/2 border-none bg-white text-secondary focus:outline-none disabled:text-gray-300"
//         >
//           <ArrowForwardIosOutlinedIcon style={{ fontSize: 72 }} />
//         </button>
//       </div>
//     </div>
//   );
// }

import { Carousel } from "antd";
import { CarouselRef } from "antd/es/carousel";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { Button } from "@mui/material";
import { AudioFile, Question, updateLessonStatus, updateUserPoint } from "../../services/api";
import { fetchAudioFiles } from "../../services/AudioService";
import { getMeaningForQuestion } from "../../services/questionService";
import { LessonMeaning } from "../../services/api";
import Choice from "./Choice";
import Match from "./Match";
import Sort from "./Sort";
import FillBlank from "./FillBlank";
import { useQuestionChecker } from "../../hooks/useQuestionChecker";
import count from "../../assets/count.jpg";
import ResultPopup from "../shared/ResultPopup";

type TemplateProps = {
  questions: Question[];
  lessonId: number;
  lessonMeanings?: LessonMeaning[];
  practice_mode: "phrase" | "translate" | "listen" | "test";
};

export default function Template({ questions, lessonId, lessonMeanings, practice_mode }: TemplateProps) {
  const TOTAL_QUESTIONS = questions.length;
  const MAX_WRONG_ANSWERS = Math.floor(TOTAL_QUESTIONS * 0.25);
  const navigate = useNavigate();
  const carouselRef = useRef<CarouselRef | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const location = useLocation();
  const mode = location.pathname.includes("translate") ? "translate" : "listen";

  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);

  const globalAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Destructure isChecked from useQuestionChecker
  const {
    userAnswers,
    results,
    isChecked,
    setAnswer,
    checkAnswer,
  } = useQuestionChecker(questions);

  const handleAudio = async (url: string) => {
    try {
      // Dừng audio hiện tại nếu có
      if (globalAudioRef.current) {
        globalAudioRef.current.pause();
        globalAudioRef.current.currentTime = 0;
      }

      const audio = new Audio(url);
      globalAudioRef.current = audio;
      audio.volume = 1;
      
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      
      await audio.play();
    } catch (err) {
      console.warn("Audio play error:", err);
      setIsPlaying(false);
    }
  };

  // Dừng audio khi:
  // 1. Chuyển slide
  useEffect(() => {
    if (globalAudioRef.current) {
      globalAudioRef.current.pause();
      globalAudioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [currentSlide]);

  // 2. Kiểm tra đáp án
  useEffect(() => {
    const currentQuestion = questions[currentSlide];
    if (isChecked(currentQuestion?.id) && globalAudioRef.current) {
      globalAudioRef.current.pause();
      globalAudioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isChecked, currentSlide, questions]);

  // 3. Unmount component
  useEffect(() => {
    return () => {
      if (globalAudioRef.current) {
        globalAudioRef.current.pause();
        globalAudioRef.current = null;
      }
    };
  }, []);

  const goToNext = () => {
    if (currentSlide < TOTAL_QUESTIONS - 1 && carouselRef.current) {
      carouselRef.current.next();
    }
  };

  const getBackRoute = () => {
    if (location.pathname.includes("practice-phrase")) return `/learn-phrase/${lessonId}`;
    if (location.pathname.includes("practice-translate")) return `/translate/${lessonId}`;
    if (location.pathname.includes("practice-listen")) return `/listen/${lessonId}`;
    return `/learn-phrase/${lessonId}`;
  };

  useEffect(() => {
    fetchAudioFiles().then(setAudioFiles);
  }, []);

  // Dừng audio khi kiểm tra đáp án
  useEffect(() => {
    const currentQuestion = questions[currentSlide];
    if (isChecked(currentQuestion?.id) && globalAudioRef.current) {
      globalAudioRef.current.pause();
      globalAudioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isChecked, currentSlide]);

  const [showResult, setShowResult] = useState(false);
  const [isAllAnswered, setIsAllAnswered] = useState(false);
  
  // State để track số câu sai
  const [wrongCount, setWrongCount] = useState(0);
  const [remainingChances, setRemainingChances] = useState(MAX_WRONG_ANSWERS);

  // Check khi nào trả lời hết câu hỏi
  useEffect(() => {
    const allAnswered = questions.every(q => isChecked(q.id));
    if (allAnswered && !isAllAnswered) {
      setIsAllAnswered(true);
      handleShowResults();
    }
  }, [results, questions]);

  // Cập nhật số câu sai mỗi khi kiểm tra đáp án
  useEffect(() => {
    const wrongAnswers = Object.values(results).filter(r => r === "incorrect").length;
    setWrongCount(wrongAnswers);
    setRemainingChances(MAX_WRONG_ANSWERS - wrongAnswers);

    if (wrongAnswers > MAX_WRONG_ANSWERS) {
      setShowResult(true);
    }
  }, [results]);

  const handleShowResults = async () => {
    const correctCount = Object.values(results).filter(r => r === "correct").length;
    const totalQuestions = questions.length;
    const percentage = (correctCount / totalQuestions) * 100;
    const isPassed = correctCount / totalQuestions >= 0.75;
    
    try {
      // Chỉ update point và status nếu pass
      if (isPassed) {
        await updateUserPoint({ 
          point: correctCount,
          type: "add"
        });
        if (practice_mode) {
          await updateLessonStatus(lessonId, practice_mode);
        }
      }

      setShowResult(true);
    } catch (error) {
      console.error("Error updating results:", error);
      setShowResult(true);
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Progress bar mimic */}
      <div className="fixed flex gap-2 top-10 left-1/2 -translate-x-1/2 items-center w-[75vw] mx-auto">
        <div className="flex items-center mr-4">
          {/* Hiển thị số cơ hội còn lại */}
          <p className="text-2xl font-bold text-secondary">
            {remainingChances < 0 ? 0 : remainingChances}
          </p>
          <img src={count} alt=" " className="w-14 h-18" />
        </div>
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
          onClick={() => navigate(getBackRoute(), { replace: true })}
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
                audioFiles={audioFiles}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
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
                audioFiles={audioFiles}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
              />
            )}

            {question.question_type === "sorting" && (
              <Sort
                questionTitle={question.question}
                tokens={question.example_tokens || []}
                selectedIds={userAnswers[question.id] as number[]}
                isChecked={isChecked(question.id)}
                checkResult={results[question.id]}
                onSelect={(id) => setAnswer(question.id, id)}
                audioFiles={audioFiles}
                mode={mode}
                onPlay={handleAudio}
                isPlaying={isPlaying}
                currentQuestionId={currentSlide}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
              />
            )}
            {question.question_type === "fill_blank" && (
              <FillBlank
                questionTitle={question.question}
                isChecked={isChecked(question.id)}
                checkResult={results[question.id]}
                onSelect={(answer) => setAnswer(question.id, answer)}
                correct_answers={question.correct_answers}
                audioFiles={audioFiles}
                mode={mode}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
              />
            )}

            {/* Hiện nút kiểm tra nếu chưa kiểm tra */}
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

      <ResultPopup
        open={showResult}
        onClose={() => {
          setShowResult(false);
          navigate(getBackRoute(), { replace: true });
        }}
        isPassed={Object.values(results).filter(r => r === "correct").length / questions.length >= 0.75}
        correctCount={Object.values(results).filter(r => r === "correct").length}
        MAX_WRONG_ANSWERS={MAX_WRONG_ANSWERS}
        totalQuestions={questions.length}
        earnedPoints={Object.values(results).filter(r => r === "correct").length}
      />
    </div>
  );
}
