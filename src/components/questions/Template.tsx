import { Carousel } from "antd";
import { CarouselRef } from "antd/es/carousel";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { Button } from "@mui/material";
import { AudioFile, Question, updateDailyPoint, updateLessonStatus, updateUserPoint } from "../../services/api";
import { getMeaningForQuestion } from "../../services/questionService";
import { LessonMeaning } from "../../services/api";
import Choice from "./Choice";
import Match from "./Match";
import Sort from "./Sort";
import FillBlank from "./FillBlank";
import { useQuestionChecker } from "../../hooks/useQuestionChecker";
import count from "../../assets/count.jpg";
import ResultPopup from "../shared/ResultPopup";
import { useAudio } from "../../contexts/AudioContext";
import { useLessonLevelMap } from "../../contexts/LessonLevelContext";
import { useLessonEntry } from "../../contexts/LessonEntryContext";

type TemplateProps = {
  questions: Question[];
  lessonId: number;
  lessonMeanings?: LessonMeaning[];
  practice_mode: "phrase" | "translate" | "listen" | "test";
  audioFiles?: AudioFile[];
};

export default function Template({ questions, lessonId, lessonMeanings, practice_mode, audioFiles = [] }: TemplateProps) {
  const TOTAL_QUESTIONS = questions.length;
  const MAX_WRONG_ANSWERS = Math.floor(TOTAL_QUESTIONS * 0.25);
  const navigate = useNavigate();
  const carouselRef = useRef<CarouselRef | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const location = useLocation();
  const mode = location.pathname.includes("translate") ? "translate" : "listen";

  const { playAudio, stopAudio  } = useAudio();

  const { lessonLevelMap } = useLessonLevelMap();
  const currentLevel = lessonLevelMap.get(lessonId);
  const { fromLessonSection } = useLessonEntry();

  // Destructure isChecked from useQuestionChecker
  const {
    userAnswers,
    results,
    isChecked,
    setAnswer,
    checkAnswer,
  } = useQuestionChecker(questions, "practice");
  
  useEffect(() => {
    if (practice_mode === "listen" && audioFiles.length > 0 && questions[currentSlide]) {
      const currentQuestion = questions[currentSlide];
      
      // Tìm audio file phù hợp với câu hỏi hiện tại
      let audioFile: AudioFile | null = null;
      
      if (currentQuestion.example_id) {
        audioFile = audioFiles.find(
          file => file.audio_type === "example" && file.example_id === currentQuestion.example_id
        ) || null;
      }

      // Phát audio sau một khoảng delay ngắn
      if (audioFile?.audio_url) {
        const timeoutId = setTimeout(() => {
          stopAudio(); // Dừng audio cũ trước
          playAudio(audioFile.audio_url);
        }, 50); // Delay 500ms để đảm bảo UI đã render

        return () => {
          clearTimeout(timeoutId);
        };
      }
    }
  }, [currentSlide, audioFiles, practice_mode, questions, playAudio, stopAudio]);

  useEffect(() => {
    stopAudio();
  }, [currentSlide, stopAudio]);

  // Dừng audio khi kiểm tra đáp án
  useEffect(() => {
    const currentQuestion = questions[currentSlide];
    if (isChecked(currentQuestion?.id)) {
      stopAudio();
    }
  }, [isChecked, currentSlide, questions, stopAudio]);

  // Unmount component
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  const goToNext = () => {
    if (currentSlide < TOTAL_QUESTIONS - 1 && carouselRef.current) {
      carouselRef.current.next();
    }
  };

  const getBackRoute = () => {
    let path = `/learn-phrase/${lessonId}`;
    
    if (practice_mode === "translate") {
      path = `/translate/${lessonId}`;
    } else if (practice_mode === "listen") {
      path = `/listen/${lessonId}`;
    }

    return {
      pathname: path,
      // state: fromLessonSection ? { fromLessonSection: true } : undefined
    };
  };

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
        if (currentLevel) {
          await updateDailyPoint(correctCount, currentLevel);
        } else {
          console.error("Level is undefined. Cannot update daily point.");
        }
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
              colorClass = "bg-cyan_border";
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
          onClick={() => {
            const backRoute = getBackRoute();
            navigate(backRoute.pathname, { 
              replace: true,
              state: fromLessonSection ? { fromLessonSection: true } : undefined
            });
          }}
        />
      </div>

      {/* Carousel */}
      <Carousel
        ref={carouselRef}
        dots={false}
        beforeChange={(_, next) => {
          // Dừng audio trước khi chuyển slide
          stopAudio();
          setCurrentSlide(next);
        }}
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
                vocabId={question.vocabulary_id as number}
                phraseId={question.phrase_id as number}
                exampleId={question.example_id as number}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
                doMode="practice"
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
                phraseId={question.phrase_id as number}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
                doMode="practice"
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
                exampleId={question.example_id as number}
                mode={mode}
                currentQuestionId={question.id}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
                doMode="practice"
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
                exampleId={question.example_id as number}
                mode={mode}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
                doMode="practice"
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
          const backRoute = getBackRoute();
          navigate(backRoute.pathname, { 
            replace: true,
            // state: backRoute.state
          });
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
