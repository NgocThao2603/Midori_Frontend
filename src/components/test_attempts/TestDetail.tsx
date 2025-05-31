import { Carousel } from "antd";
import { CarouselRef } from "antd/es/carousel";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import ArrowBackIosOutlined from "@mui/icons-material/ArrowBackIosNewOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { AudioFile, getTestAnswersByTestAttempt, Question } from "../../services/api";
import { fetchAudioFiles } from "../../services/AudioService";
import { getMeaningForQuestion } from "../../services/questionService";
import { LessonMeaning } from "../../services/api";
import Choice from "../questions/Choice";
import Match from "../questions/Match";
import Sort from "../questions/Sort";
import FillBlank from "../questions/FillBlank";
import { useQuestionChecker } from "../../hooks/useQuestionChecker";
import { useMarkStudiedByLessonId } from "../../hooks/useMarkStudiedByLessonId";

type TestTemplateProps = {
  questions: Question[];
  lessonId: number;
  attemptId: number;
  lessonMeanings?: LessonMeaning[];
};

export default function TestTemplate({
  questions, 
  lessonId,
  attemptId,
  lessonMeanings,
}: TestTemplateProps) {
  const TOTAL_QUESTIONS = questions.length;
  const navigate = useNavigate();
  const carouselRef = useRef<CarouselRef | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const location = useLocation();
  const [questionModes, setQuestionModes] = useState<{[key: number]: "translate" | "listen"}>({});
  const [savedQuestions, setSavedQuestions] = useState<number[]>([]);

  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);

  const globalAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState<{ [key: number]: any }>({});
  const [isLoadingSavedAnswers, setIsLoadingSavedAnswers] = useState(true);
  const [showResult, setShowResult] = useState(true);
  useMarkStudiedByLessonId(lessonId);

  const {
    userAnswers,
    results,
    isChecked,
    setAnswer,
    checkAnswer,
    setInitialAnswers,
  } = useQuestionChecker(questions, "practice");

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
    return `/test/${lessonId}`;
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

  useEffect(() => {
    if (!isLoadingSavedAnswers) {
      questions.forEach(question => {
        if (userAnswers[question.id]) {
          checkAnswer(question.id);
        }
      });
    }
  }, [isLoadingSavedAnswers, questions]);

  return (
    <div className="relative w-full h-screen">
      {/* Progress bar mimic */}
      <div className="fixed flex gap-[1vw] top-10 left-1/2 -translate-x-1/2 items-center w-[75vw] mx-auto">
        {Array.from({ length: TOTAL_QUESTIONS }).map((_, index) => {
          const questionId = questions[index]?.id;

          let colorClass = "bg-gray-300";

          if (index === currentSlide) {
              colorClass = "bg-cyan_border";
            } else if (isChecked(questionId)) {
              if (results[questionId] === "correct") {
                colorClass = "bg-secondary";
              } else if (results[questionId] === "incorrect") {
                colorClass = "bg-red_text";
              } else {
                colorClass = "bg-gray-300";
              }
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
        className="top-20 w-[75vw] mx-auto"
      >
        {questions.map((question) => (
          <div key={question.id} className="p-4">
            {question.question_type === "choice" && (
              <Choice
                questionTitle={question.question}
                choices={question.choices}
                selectedId={userAnswers[question.id] as number}
                isChecked={true}
                checkResult={userAnswers[question.id] ? results[question.id] : "incorrect"}
                onSelect={() => {}}
                audioFiles={audioFiles}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
                doMode="practice"
              />
            )}

            {question.question_type === "matching" && (
              <Match
                questionTitle={question.question}
                choices={question.choices}
                savedAnswer={savedAnswers[question.id] as number[]}
                selectedIds={userAnswers[question.id] as number[]}
                isChecked={true}
                checkResult={userAnswers[question.id] ? results[question.id] : "incorrect"}
                onSelect={() => {}}
                audioFiles={audioFiles}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
                doMode="practice"
              />
            )}

            {question.question_type === "sorting" && (
              <Sort
                questionTitle={question.question}
                tokens={question.example_tokens || []}
                selectedIds={userAnswers[question.id] as number[]}
                savedAnswer={savedAnswers[question.id] as number[]}
                isChecked={true}
                checkResult={userAnswers[question.id] ? results[question.id] : "incorrect"}
                onSelect={() => {}}
                audioFiles={audioFiles}
                mode={questionModes[question.id]}
                onPlay={handleAudio}
                isPlaying={isPlaying}
                currentQuestionId={currentSlide}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
                doMode="practice"
              />
            )}
            {question.question_type === "fill_blank" && (
              <FillBlank
                questionTitle={question.question}
                savedAnswer={savedAnswers[question.id] as string}
                isChecked={true}
                checkResult={userAnswers[question.id] ? results[question.id] : "incorrect"}
                onSelect={() => {}}
                correct_answers={question.correct_answers}
                audioFiles={audioFiles}
                mode={questionModes[question.id]}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
                doMode="practice"
              />
            )}
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
    </div>
  );
}
