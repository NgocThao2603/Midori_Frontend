import { addMinutes, parseISO } from "date-fns";
import { Carousel } from "antd";
import { CarouselRef } from "antd/es/carousel";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import ArrowBackIosOutlined from "@mui/icons-material/ArrowBackIosNewOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { Button } from "@mui/material";
import { AudioFile, getTestAnswersByTestAttempt, Question, submitTestAttempt, TestAnswer, updateOrCreateTestAnswers } from "../../services/api";
import { fetchAudioFiles } from "../../services/AudioService";
import { getMeaningForQuestion } from "../../services/questionService";
import { LessonMeaning } from "../../services/api";
import Choice from "./Choice";
import Match from "./Match";
import Sort from "./Sort";
import FillBlank from "./FillBlank";
import { useQuestionChecker } from "../../hooks/useQuestionChecker";
import timer from "../../assets/timer.png";
import ResultTestPopup from "../shared/ResultTestPopup";
import { formatDuration } from "../../services/timeService";

type TestTemplateProps = {
  questions: Question[];
  lessonId: number;
  attemptId: number;
  lessonMeanings?: LessonMeaning[];
  start_time: string;
  duration_minutes: number;
  pass_score: number;
};

export default function TestTemplate({
  questions, 
  lessonId,
  attemptId,
  lessonMeanings, 
  start_time,
  duration_minutes,
  pass_score 
}: TestTemplateProps) {
  const TOTAL_QUESTIONS = questions.length;
  const WARNING_TIME = 300;
  const navigate = useNavigate();
  const carouselRef = useRef<CarouselRef | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const location = useLocation();
  const [questionModes, setQuestionModes] = useState<{[key: number]: "translate" | "listen"}>({});
  const [savedQuestions, setSavedQuestions] = useState<number[]>([]);

  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);

  const globalAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [savedAnswers, setSavedAnswers] = useState<{ [key: number]: any }>({});
  const [waitingToSaveId, setWaitingToSaveId] = useState<number | null>(null);
  const [isLoadingSavedAnswers, setIsLoadingSavedAnswers] = useState(true);

  const [showResult, setShowResult] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    score: number;
    status: "pass" | "fail";
    answer_count: number;
    correct_count: number;
    wrong_count: number;
  } | null>(null);

  const {
    userAnswers,
    results,
    isChecked,
    setAnswer,
    checkAnswer,
    setInitialAnswers,
  } = useQuestionChecker(questions, "test");

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

  useEffect(() => {
    const modes: {[key: number]: "translate" | "listen"} = {};
    questions.forEach(question => {
      if (question.question_type === "sorting" || question.question_type === "fill_blank") {
        modes[question.id] = Math.random() < 0.5 ? "translate" : "listen";
      }
    });
    setQuestionModes(modes);
  }, [questions]);

// Sau đó dùng stableSetInitialAnswer trong useEffect
  useEffect(() => {
    const loadSavedAnswers = async () => {
      try {
        setIsLoadingSavedAnswers(true);
        const savedData = await getTestAnswersByTestAttempt(attemptId);
        console.log("Data:", savedData)
        
        const answersMap: { [key: number]: any } = {};
        const questionIds: number[] = [];
        
        savedData.forEach(item => {
          const question = questions.find(q => q.id === item.question_id);
          if (!question) return;

          // Format answer based on question type
          let formattedAnswer;
          try {
            switch (question.question_type) {
              case "choice":
                formattedAnswer = Number(item.answer_text);
                break;
              case "matching":
              case "sorting":
                formattedAnswer = typeof item.answer_text === "string"
                  ? JSON.parse(item.answer_text)
                  : item.answer_text;
                break;
              case "fill_blank":
                formattedAnswer = item.answer_text;
                break;
              default:
                formattedAnswer = item.answer_text;
            }

            answersMap[item.question_id] = formattedAnswer;
            questionIds.push(item.question_id);
            
            console.log("Formatted answer for question", item.question_id, ":", formattedAnswer);
          } catch (err) {
            console.error("Error formatting answer for question", item.question_id, err);
          }
        });
        
        // Batch update
        setInitialAnswers(answersMap);  
        setSavedAnswers(answersMap);
        setSavedQuestions(questionIds);

      } catch (error) {
        console.error("Failed to load saved answers:", error);
      } finally {
        setIsLoadingSavedAnswers(false);
      }
    };

    if (attemptId) {
      loadSavedAnswers();
    }
  }, [attemptId]);

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

  const goToBack = () => {
    if (currentSlide > 0 && carouselRef.current) {
      carouselRef.current.prev();
    }
  };

  const goToNext = () => {
    if (currentSlide < TOTAL_QUESTIONS - 1 && carouselRef.current) {
      carouselRef.current.next();
    }
  };

  const getBackRoute = () => {
    if (location.pathname.includes("practice-phrase")) return `/learn-phrase/${lessonId}`;
    if (location.pathname.includes("practice-translate")) return `/translate/${lessonId}`;
    if (location.pathname.includes("practice-listen")) return `/listen/${lessonId}`;
    if (location.pathname.includes("practice-test")) return `/test/${lessonId}`;
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
  
  const handleProgressBarClick = (index: number) => {
    if (carouselRef.current) {
      carouselRef.current.goTo(index);
    }
  };

  const handleSave = (questionId: number) => {
    if (!hasAnswer(questionId)) return;

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const answer = userAnswers[questionId];
    console.log("User answer:", answer);
    checkAnswer(questionId);
    setWaitingToSaveId(questionId); // đánh dấu sẽ lưu sau khi result có
  };

  const handleSubmit = async () => {
    try {
      const result = await submitTestAttempt(attemptId);
      const isPass = result.score >= pass_score;
      const correct = result.correct_count || 0;
      const wrong = (result.answer_count || 0) - correct;

      setSubmitResult({
        score: result.score,
        status: isPass ? "pass" : "fail",
        answer_count: result.answer_count,
        correct_count: correct,
        wrong_count: wrong
      });
      setShowResult(true);
    } catch (error) {
      console.error("Error submitting test:", error);
    }
  };

  useEffect(() => {
    const saveAnswer = async () => {
      if (waitingToSaveId === null) return;

      const result = results[waitingToSaveId];
      if (!result) return; // chưa có result thì chờ

      const questionId = waitingToSaveId;
      const answer = userAnswers[questionId];

      const isCorrect = result === "correct";

      const testAnswer: TestAnswer = {
        question_id: questionId,
        answer: answer as string | number | number[],
        is_correct: isCorrect
      };

      console.log("Saved answer:", testAnswer);

      // Update savedAnswers với đáp án mới nhất
      setSavedAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));

      // Thêm vào savedQuestions nếu chưa có
      if (!savedQuestions.includes(questionId)) {
        setSavedQuestions(prev => [...prev, questionId]);
      }

      await updateOrCreateTestAnswers(attemptId, testAnswer);
      setWaitingToSaveId(null);
    };

    saveAnswer();
  }, [results, waitingToSaveId]);

  const hasAnswerChanged = (questionId: number) => {
    // Nếu câu hỏi chưa được lưu lần nào, coi như có thay đổi
    if (!savedQuestions.includes(questionId)) return true;
    
    // Nếu đã lưu, so sánh với đáp án đã lưu
    if (!savedAnswers[questionId]) return true;
      
    const currentAnswer = userAnswers[questionId];
    const savedAnswer = savedAnswers[questionId];

    if (Array.isArray(currentAnswer) && Array.isArray(savedAnswer)) {
      return JSON.stringify(currentAnswer) !== JSON.stringify(savedAnswer);
    }
      
    return currentAnswer !== savedAnswer;
  };

  const hasAnswer = (questionId: number) => {
    const answer = userAnswers[questionId];
    
    if (!answer) return false;

    // Kiểm tra theo từng loại câu hỏi
    const question = questions.find(q => q.id === questionId);
    if (!question) return false;

    switch (question.question_type) {
      case "choice":
        return answer !== undefined;
      case "matching":
        return Array.isArray(answer) && answer.length > 0;
      case "sorting":
        return Array.isArray(answer) && answer.length > 0;
      case "fill_blank":
        return typeof answer === "string" && answer.trim() !== "";
      default:
        return false;
    }
  };

  useEffect(() => {
    const startTimeVN = parseISO(start_time);
    const endTimeVN = addMinutes(startTimeVN, duration_minutes);

    const timer = setInterval(() => {
      const now = new Date();
      
      // Tính thời gian còn lại (trong milliseconds)
      const diff = endTimeVN.getTime() - now.getTime();

      if (diff <= 0) {
        // Hết giờ
        clearInterval(timer);
        setTimeLeft(0);
        navigate(getBackRoute(), { replace: true });
        return;
      }

      // Chuyển đổi thành seconds và cập nhật state
      setTimeLeft(Math.floor(diff / 1000));
    }, 1000);

    // Tính thời gian còn lại ban đầu
    const now = new Date();
    const initialTimeLeft = Math.max(0, Math.floor((endTimeVN.getTime() - now.getTime()) / 1000));
    setTimeLeft(initialTimeLeft);

    // Cleanup khi unmount
    return () => clearInterval(timer);
  }, [start_time, duration_minutes]);

  // Hàm format thời gian hiển thị
  const formatTimeLeft = () => {
    if (isNaN(timeLeft)) return "00:00";
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getButtonText = (questionId: number) => {
    if (!hasAnswer(questionId)) {
      return "Lưu câu trả lời";
    }
    if (savedQuestions.includes(questionId) && !hasAnswerChanged(questionId)) {
      return "Đã lưu";
    }
    return "Lưu câu trả lời";
  };

  const isButtonDisabled = (questionId: number) => {
    if (!hasAnswer(questionId)) return true;
    if (savedQuestions.includes(questionId) && !hasAnswerChanged(questionId)) return true;
    return false;
  };

  return (
    <div className="relative w-full h-screen">
      {/* Progress bar mimic */}
      <div className="fixed flex gap-[1vw] top-10 left-1/2 -translate-x-1/2 items-center w-[75vw] mx-auto">
        {/* Add timer display */}
        <div className="bg-white rounded-[50%] shadow-md px-4 py-4">
          <div className="flex flex-col items-center">
            <img src={timer} alt=" " className="w-10 h-10" />
            <div className={`text-3xl font-bold ${timeLeft <= WARNING_TIME ? "text-red_text" : "text-cyan_text"}`}>
              {formatTimeLeft()}
            </div>
          </div>
        </div>
        {Array.from({ length: TOTAL_QUESTIONS }).map((_, index) => {
          const questionId = questions[index]?.id;
          const isSaved = savedQuestions.includes(questionId);

          let colorClass = "bg-gray-300";

          if (index === currentSlide) {
            colorClass = "bg-cyan_border"; 
          } else if (isSaved) {
            colorClass = "bg-secondary";
          }
          return (
            <div
              key={index}
              style={{ flex: 1 }}
              className={`h-3.5 rounded-full transition-all duration-300 cursor-pointer ${colorClass}`}
              onClick={() => handleProgressBarClick(index)}
            />
          );
        })}

        <div className="">
          <Button
            variant="contained"
            onClick={handleSubmit}
            className="!bg-secondary hover:!bg-cyan_border !text-white !font-bold !text-xl !px-6 !py-4 !rounded-lg !focus:outline-none"
            sx={{
              "&:focus": { outline: "none", boxShadow: "none" },
            }}
          >
            Nộp bài
          </Button>
        </div>

        <CloseOutlinedIcon
          style={{ fontSize: 40 }}
          className="ml-4 cursor-pointer"
          onClick={() => navigate(getBackRoute(), { replace: true })}
        />
      </div>
      
      {/* Nút chuyển câu */}
      <div className="right-auto">
        <button
          onClick={goToBack}
          disabled={currentSlide === 0}
          className="fixed top-1/2 left-10 -translate-y-1/2 border-none bg-white text-secondary focus:outline-none disabled:text-gray-300"
        >
          <ArrowBackIosOutlined style={{ fontSize: 72 }} />
        </button>
      </div>

      {/* Carousel */}
      <Carousel
        ref={carouselRef}
        dots={false}
        beforeChange={(_, next) => setCurrentSlide(next)}
        draggable={false}
        className="top-[15vh] w-[75vw] mx-auto"
      >
        {questions.map((question) => (
          <div key={question.id} className="p-4">
            {question.question_type === "choice" && (
              <Choice
                questionTitle={question.question}
                choices={question.choices}
                savedAnswer={savedAnswers[question.id] as number}
                selectedId={userAnswers[question.id] as number}
                onSelect={(id) => setAnswer(question.id, id)}
                audioFiles={audioFiles}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
                doMode="test"
              />
            )}

            {question.question_type === "matching" && (
              <Match
                questionTitle={question.question}
                choices={question.choices}
                savedAnswer={savedAnswers[question.id] as number[]}
                selectedIds={userAnswers[question.id] as number[]}
                onSelect={(id) => setAnswer(question.id, id)}
                audioFiles={audioFiles}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
                doMode="test"
              />
            )}

            {question.question_type === "sorting" && (
              <Sort
                questionTitle={question.question}
                tokens={question.example_tokens || []}
                savedAnswer={savedAnswers[question.id] as number[]}
                selectedIds={userAnswers[question.id] as number[]}
                onSelect={(id) => setAnswer(question.id, id)}
                audioFiles={audioFiles}
                mode={questionModes[question.id]}
                onPlay={handleAudio}
                isPlaying={isPlaying}
                currentQuestionId={currentSlide}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
                doMode="test"
              />
            )}
            {question.question_type === "fill_blank" && (
              <FillBlank
                questionTitle={question.question}
                savedAnswer={savedAnswers[question.id] as string}
                onSelect={(answer) => setAnswer(question.id, answer)}
                correct_answers={question.correct_answers}
                audioFiles={audioFiles}
                mode={questionModes[question.id]}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
                doMode="test"
              />
            )}

            <div className="mt-10 text-center">
              <Button
                variant="contained"
                onClick={() => handleSave(question.id)}
                disabled={isButtonDisabled(question.id)}
                className={`
                  !font-bold !text-xl !px-6 !py-4 !mt-6 !rounded-lg !focus:outline-none
                  ${isButtonDisabled(question.id)
                    ? "!bg-secondary !text-white cursor-not-allowed opacity-60" 
                    : "!bg-cyan_border hover:!bg-secondary !text-white"
                  }
                `}
                sx={{
                  "&:focus": { outline: "none", boxShadow: "none" },
                }}
              >
                {getButtonText(question.id)}
              </Button>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Nút chuyển câu */}
      <div className="left-auto">
        <button
          onClick={goToNext}
          disabled={currentSlide === TOTAL_QUESTIONS - 1}
          className="fixed top-1/2 right-10 -translate-y-1/2 border-none bg-white text-secondary focus:outline-none disabled:text-gray-300"
        >
          <ArrowForwardIosOutlinedIcon style={{ fontSize: 72 }} />
        </button>
      </div>

      {/* Result popup */}
      {submitResult && (
        <ResultTestPopup
          open={showResult}
          onClose={() => {
            setShowResult(false);
            navigate(getBackRoute(), { replace: true });
          }}
          score={submitResult.score}
          status={submitResult.status}
          answer_count={submitResult.answer_count}
          total_questions={questions.length}
          duration={formatDuration(start_time, new Date().toISOString(), duration_minutes)}
          correct_count={submitResult.correct_count}
          wrong_count={submitResult.wrong_count}
        />
      )}
    </div>
  );
}
