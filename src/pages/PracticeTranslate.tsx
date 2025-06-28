import { useEffect, useState } from "react";
import { AudioFile, fetchQuestionsByLesson, Question } from "../services/api";
import { useParams } from "react-router-dom";
import Template from "../components/questions/Template";
import { useMarkStudiedByLessonId } from "../hooks/useMarkStudiedByLessonId";
import { fetchAudioFiles } from "../services/AudioService";

const PracticeTranslate = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const lessonIdNumber = Number(lessonId);
  useMarkStudiedByLessonId(lessonIdNumber);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lessonIdNumber) return;
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const questionsData = await fetchQuestionsByLesson(lessonIdNumber, "example");
        setQuestions(questionsData),
        fetchAudioFiles().then(setAudioFiles)
      } catch (error) {
        console.error("Error loading questions:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [lessonIdNumber]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-cyan_border border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (questions.length === 0) return <p className="h-[60vh] flex justify-center text-cyan_text text-2xl">Không có câu hỏi nào.</p>;

  return (
    <Template
      questions={questions}
      lessonId={lessonIdNumber}
      practice_mode="translate"
      audioFiles={audioFiles}
    />
  );
};

export default PracticeTranslate;
