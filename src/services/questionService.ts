import { LessonMeaning, QuestionBase } from "./api";

export function getMeaningForQuestion(
  question: QuestionBase,
  lessonMeanings: LessonMeaning[] = []
): LessonMeaning | undefined {
  if (!question) {
    console.warn("Question is null/undefined");
    return undefined;
  }

  if (!Array.isArray(lessonMeanings)) {
    console.warn("lessonMeanings is not an array:", lessonMeanings);
    return undefined;
  }

  try {
    if (question.vocabulary_id) {
      return lessonMeanings.find(
        (m) => m.id === question.vocabulary_id && m.type === "vocab"
      );
    } else if (question.phrase_id) {
      return lessonMeanings.find(
        (m) => m.id === question.phrase_id && m.type === "phrase"
      );
    } else if (question.example_id) {
      return lessonMeanings.find(
        (m) => m.id === question.example_id && m.type === "example" 
      );
    }
  } catch (error) {
    console.error("Error in getMeaningForQuestion:", error);
  }
  return undefined;
}
