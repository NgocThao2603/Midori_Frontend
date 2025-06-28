import { Carousel } from "antd";
import { CarouselRef } from "antd/es/carousel";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import ArrowBackIosOutlined from "@mui/icons-material/ArrowBackIosNewOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { AudioFile, getTestAnswersByTestAttempt, Question } from "../../services/api";
import { getMeaningForQuestion } from "../../services/questionService";
import { LessonMeaning } from "../../services/api";
import Choice from "../questions/Choice";
import Match from "../questions/Match";
import Sort from "../questions/Sort";
import FillBlank from "../questions/FillBlank";
import { useQuestionChecker } from "../../hooks/useQuestionChecker";
import { useMarkStudiedByLessonId } from "../../hooks/useMarkStudiedByLessonId";
import { useAudio } from "../../contexts/AudioContext";
import { useLessonEntry } from "../../contexts/LessonEntryContext";

type TestTemplateProps = {
  questions: Question[];
  lessonId: number;
  attemptId: number;
  lessonMeanings?: LessonMeaning[];
  audioFiles?: AudioFile[];
};

export default function TestTemplate({
  questions, 
  lessonId,
  attemptId,
  lessonMeanings,
  audioFiles = []
}: TestTemplateProps) {
  const TOTAL_QUESTIONS = questions.length;
  const navigate = useNavigate();
  const carouselRef = useRef<CarouselRef | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [questionModes, setQuestionModes] = useState<{[key: number]: "translate" | "listen"}>({});
  const [savedQuestions, setSavedQuestions] = useState<number[]>([]);
  const { fromLessonSection } = useLessonEntry();

  const { playAudio, stopAudio } = useAudio();

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

  useEffect(() => {
    const currentQuestion = questions[currentSlide];
    if (!currentQuestion) return;
    
    // Auto-play audio for listen mode sorting and fill_blank questions
    if (audioFiles.length > 0) {    
      let audioFile: AudioFile | null = null;

      if (currentQuestion.vocabulary_id) {
        audioFile = audioFiles.find(
          file => file.audio_type === "vocab" && file.vocabulary_id === currentQuestion.vocabulary_id
        ) || null;
      } else if (currentQuestion.phrase_id) {
        audioFile = audioFiles.find(
          file => file.audio_type === "phrase" && file.phrase_id === currentQuestion.phrase_id
        ) || null;
      } else if (currentQuestion.example_id) {
        audioFile = audioFiles.find(
          file => file.audio_type === "example" && file.example_id === currentQuestion.example_id
        ) || null;
      }

      if (audioFile?.audio_url) {
        const timeoutId = setTimeout(() => {
          stopAudio();
          playAudio(audioFile.audio_url);
        }, 50);

        return () => {
          clearTimeout(timeoutId);
        };
      }
    }
  }, [currentSlide, audioFiles, questionModes, questions, playAudio, stopAudio]);

  // Stop audio when changing slides
  useEffect(() => {
    stopAudio();
  }, [currentSlide, stopAudio]);

  // Stop audio when checking answers
  useEffect(() => {
    const currentQuestion = questions[currentSlide];
    if (isChecked(currentQuestion?.id)) {
      stopAudio();
    }
  }, [isChecked, currentSlide, questions, stopAudio]);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

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
        <div className="grid [grid-template-columns:repeat(20,minmax(0,1fr))] gap-x-2 gap-y-4 w-full">
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
        </div>

        <CloseOutlinedIcon
          style={{ fontSize: 40 }}
          className="ml-4 cursor-pointer"
          onClick={() => navigate(getBackRoute(), { replace: true, state: fromLessonSection ? { fromLessonSection: true } : undefined })}
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
        beforeChange={(_, next) => {
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
                isChecked={true}
                checkResult={userAnswers[question.id] ? results[question.id] : "incorrect"}
                onSelect={() => {}}
                audioFiles={audioFiles}
                vocabId={question.vocabulary_id as number}
                phraseId={question.phrase_id as number}
                exampleId={question.example_id as number}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
                doMode="practice"
                disableResultAudio={true}
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
                phraseId={question.phrase_id as number}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
                doMode="practice"
                disableResultAudio={true}
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
                exampleId={question.example_id as number}
                currentQuestionId={currentSlide}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
                doMode="practice"
                disableResultAudio={true}
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
                exampleId={question.example_id as number}
                mode={questionModes[question.id]}
                meaning={getMeaningForQuestion(question, lessonMeanings)?.meaning}
                doMode="practice"
                disableResultAudio={true}
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
