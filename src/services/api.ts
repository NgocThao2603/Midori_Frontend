import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Thay thế bằng URL thực tế của backend
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export interface Chapter {
  id: number;
  title: string;
  level: string;
  lessons: {
    id: number;
    title: string;
  }[];
}

export interface Vocabulary {
  id: number;
  kanji: string;
  hanviet: string;
  kana: string;
  word_type: string;
  meaning: string[];
  phrases: Phrase[];
}

export interface Phrase {
  id: number;
  vocab_id: number;
  phrase: string;
  main_word: string;
  kana?: string;
  prefix?: string;
  suffix?: string;
  meaning: string;
}

export interface Flashcard {
  type: "vocab" | "phrase";
  data: Vocabulary | Phrase;
}

export interface QuestionBase {
  id: number;
  lesson_id: number;
  vocabulary_id: number | null;
  phrase_id: number | null;
  example_id: number | null;
  question: string;
  question_type: "choice" | "matching" | "sorting" | "fill_blank";
  correct_answers: string[] | null;
  hidden_part: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionChoice {
  id: number;
  question_id: number;
  choice: string;
  is_correct: boolean;
}

export interface QuestionChoiceType extends QuestionBase {
  question_type: "choice" | "matching";
  choices: QuestionChoice[];
}

export interface QuestionSortingType extends QuestionBase {
  question_type: "sorting";
  tokens: string[];
}

export interface QuestionFillBlankType extends QuestionBase {
  question_type: "fill_blank";
  blanks: string[];
}

export type Question =
  | QuestionChoiceType
  | QuestionSortingType
  | QuestionFillBlankType;

// Đăng nhập user
export const loginUser = async (credentials: { email: string; password: string }) => {
  try {
    const response = await api.post("/login", {
      user: {
        email: credentials.email,
        password: credentials.password,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Đăng ký user
export const registerUser = async (data: { username: string; email: string; password: string; password_confirmation: string; dob: string; phone: string }) => {
  try {
    const response = await api.post("/register", { user: data });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Đăng xuất user
export const logoutUser = async () => {
  await api.delete("/logout");
  localStorage.removeItem("token");
};

// Check email username exist
export const checkExist = async (data: { username?: string; email?: string }) => {
  try {
    // Chỉ gửi những tham số có giá trị
    const response = await api.post("/check_existing", {
      username: data.username || "",
      email: data.email || ""
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy chapters lessons
export const fetchChapters = async (level: string) => {
  try {
    const response = await api.get<Chapter[]>("/chapters", {
      params: { level }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLessonStatuses = async () => {
  const res = await api.get("/lesson_statuses", {
    headers: {
      "Accept": "application/json",
      "Cache-Control": "no-cache",
    },
  });
  return res.data as {
    lesson_id: number;
    phrase: boolean;
    translate: boolean;
    listen: boolean;
    test: boolean;
  }[];
};

// Hàm fetch từ vựng theo lessonId
export const fetchVocabulariesByLesson = async (lessonId: string | undefined): Promise<{ vocabList: Vocabulary[], flashcards: Flashcard[] }> => {
  try {
    const response = await axios.get<Vocabulary[]>(`http://localhost:3000/api/vocabularies/lesson/${lessonId}`);
    
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.warn("No valid data received");
      return { vocabList: [], flashcards: [] };
    }

    // Chuẩn hóa dữ liệu để đảm bảo mỗi phrase có `vocab_id`
    const vocabList = response.data.map((vocab) => ({
      ...vocab,
      phrases: vocab.phrases?.map((phrase) => ({ ...phrase, vocab_id: vocab.id })) || [],
    }));

    // Tạo danh sách flashcards (gồm cả từ vựng và cụm từ)
    const flashcards = vocabList.flatMap((vocab) => [
      { type: "vocab" as const, data: vocab },
      ...vocab.phrases.map((phrase) => ({ type: "phrase" as const, data: phrase })),
    ]);

    return { vocabList, flashcards };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { vocabList: [], flashcards: [] };
  }
};

// Fetch câu hỏi theo lesson
export const fetchPhraseQuestionsByLesson = async (lessonId: number): Promise<Question[]> => {
  try {
    const response = await api.get(`/questions`, {
      params: {
        lesson_id: lessonId
      }
    });
    return response.data as Question[];
  } catch (error) {
    console.error("Error fetching phrase questions:", error);
    return [];
  }
};
