import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Tabs, Tab } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Shuffle } from "@mui/icons-material";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import VocabCard from "../components/learn-phrase/VocabCard";
import PhraseCard from "../components/learn-phrase/PhraseCard";

interface Vocabulary {
  id: number;
  kanji: string;
  hanviet: string;
  kana: string;
  word_type: string;
  meaning: string[];
  phrases: Phrase[];
}

interface Phrase {
  id: number;
  vocab_id: number;
  phrase: string;
  main_word: string;
  kana?: string;
  prefix?: string;
  suffix?: string;
  meaning: string;
}

const LearnPhrase: React.FC = () => {
  const { lessonId } = useParams();
  const [tabIndex, setTabIndex] = useState(0);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [flashcards, setFlashcards] = useState<{ type: "vocab" | "phrase"; data: Vocabulary | Phrase }[]>([]);
  const [shuffledFlashcards, setShuffledFlashcards] = useState<{ type: "vocab" | "phrase"; data: Vocabulary | Phrase }[]>([]);

  const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
    setFlipped({});
    setTabIndex(newIndex);
    setCurrentIndex(0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<Vocabulary[]>(`http://localhost:3000/api/vocabularies/lesson/${lessonId}`);
        console.log("Fetched response:", response);
  
        if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
          console.warn("No valid data received");
          return;
        }
  
        // Đảm bảo mỗi phrase có vocab_id ngay khi lấy dữ liệu
        const newVocabList = response.data.map((vocab) => ({
          ...vocab,
          phrases: vocab.phrases?.map((phrase) => ({ ...phrase, vocab_id: vocab.id })) || [],
        }));
  
        const newFlashcards = newVocabList.flatMap((vocab) => [
          { type: "vocab" as const, data: vocab },
          ...vocab.phrases.map((phrase) => ({ type: "phrase" as const, data: phrase })),
        ]);
  
        setVocabList(newVocabList);
        setFlashcards(newFlashcards);
        setShuffledFlashcards([...newFlashcards]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, [lessonId]);  

  const shuffleFlashcards = () => {
    if (!vocabList || vocabList.length === 0) {
      console.warn("VocabList rỗng!");
      return;
    }
  
    const shuffledVocabList = [...vocabList].sort(() => Math.random() - 0.5);
  
    const shuffledFlashcards = shuffledVocabList.flatMap((vocab) => {
      const relatedPhrases = vocab.phrases.map((phrase) => ({
        type: "phrase" as const,
        data: phrase,
      }));
  
      return [{ type: "vocab" as const, data: vocab }, ...relatedPhrases];
    });
  
    setShuffledFlashcards(shuffledFlashcards);
    setCurrentIndex(0);
    setFlipped({});
  };  

  const resetFlashcards = () => {
    setShuffledFlashcards(flashcards);
    setCurrentIndex(0);
    setFlipped({});
  };

  const handleFlip = (type: "vocab" | "phrase", id: number) => {
    setFlipped((prev) => {
      const key = `${type}_${id}`;
      return { ...prev, [key]: !prev[key] };
    });
  };  
  
  const handleNext = () => {
    setFlipped({});
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };
  
  const handlePrev = () => {
    setFlipped({});
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };  

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && currentIndex > 0) {
        handlePrev();
      } else if (event.key === "ArrowRight" && currentIndex < flashcards.length - 1) {
        handleNext();
      } else if (event.key === "ArrowUp") {
        const currentCard = flashcards[currentIndex];
        if (currentCard.type === "vocab") {
          handleFlip("vocab", currentCard.data.id);
        } else {
          handleFlip("phrase", currentCard.data.id);
        }
      }
    };
  
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, flashcards]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        className="border-b"
        slotProps={{ indicator: { style: { display: "none" } } }}>
        {["Flashcard", "Luyện tập"].map((label) => (
          <Tab
            key={label}
            label={label}
            sx={{
              fontWeight: "bold",
              fontSize: 16,
              color: "gray",
              backgroundColor: "transparent",
              borderRadius: "15px 15px 0 0",
              transition: "background 0.3s, color 0.3s",
              border: "none",
              outline: "none",
              "&.Mui-selected": {
                backgroundColor: "#1B5E20",
                color: "white",
                border: "none",
              },
              "&:focus": {
                outline: "none",
                border: "none",
              },
              "&:active": {
                outline: "none",
                border: "none",
              },
            }}
          />
        ))}
      </Tabs>
   
      {/* Flashcard Tab */}
      {tabIndex === 0 && (
        <div className="flex flex-col items-center">
          {/* Vocabulary List */}
          <div className="flex flex-wrap gap-6 my-8">
            {vocabList.map((vocab) => {
              // Tìm vị trí của từ vựng trong flashcards
              const vocabIndex = shuffledFlashcards.findIndex(
                (item) => item.type === "vocab" && item.data.id === vocab.id
              );              

              // Kiểm tra nếu flashcard hiện tại là từ vựng này hoặc phrase liên quan đến nó
              const isActive =
                shuffledFlashcards[currentIndex].type === "vocab"
                  ? shuffledFlashcards[currentIndex].data.id === vocab.id
                  : shuffledFlashcards[currentIndex].type === "phrase" &&
                    (shuffledFlashcards[currentIndex].data as Phrase).vocab_id === vocab.id;

              return (
                <button
                  key={vocab.id}
                  onClick={() => setCurrentIndex(vocabIndex)}
                  className={`px-6 py-2 border border-cyan_border rounded-2xl text-cyan_text bg-cyan_pastel text-lg font-semibold opacity-100 hover:border-transparent focus:outline-none 
                    ${isActive ? "bg-green_pastel text-secondary border border-green_border font-bold" : ""}`}
                >
                  {vocab.id} {vocab.kanji}
                </button>
              );
            })}
          </div>

          {/* Hiển thị flashcard hiện tại */}
          <div className="flex gap-4 ml-auto">
            <button
              onClick={shuffleFlashcards}
              className="flex gap-2 items-center text-secondary font-semibold border border-white bg-gray-50 hover:border-transparent focus:outline-none hover:bg-gray-100 disabled:hover:bg-gray-50"
            >
              <Shuffle fontSize="medium"/>
              Ngẫu nhiên
            </button>

            <button
              onClick={resetFlashcards}
              className="flex gap-2 items-center text-red-500 font-semibold border border-white bg-gray-50 hover:border-transparent focus:outline-none hover:bg-gray-100 disabled:hover:bg-gray-50"
            >
              <RotateLeftIcon fontSize="medium"/>
              Mặc định
            </button>
          </div>

          <div className="relative flex items-center gap-6 mt-4">
            <button onClick={handlePrev} disabled={currentIndex === 0} className="border border-white bg-gray-50 hover:border-transparent focus:outline-none hover:bg-gray-100 disabled:hover:bg-gray-50">
              <ArrowBackIos fontSize="large" className={currentIndex === 0 ? "text-gray-300" : "text-secondary"} />
            </button>

            {shuffledFlashcards.length > 0 && currentIndex >= 0 && currentIndex < shuffledFlashcards.length ? (
              shuffledFlashcards[currentIndex] ? (
                shuffledFlashcards[currentIndex].type === "vocab" ? (
                  <VocabCard
                    meanings={[]} flipped={flipped[`vocab_${shuffledFlashcards[currentIndex].data.id}`]}
                    onFlip={() => handleFlip("vocab", shuffledFlashcards[currentIndex].data.id)}
                    {...(shuffledFlashcards[currentIndex].data as Vocabulary)}                  />
                ) : (
                  <PhraseCard
                    flipped={flipped[`phrase_${shuffledFlashcards[currentIndex].data.id}`]}
                    onFlip={() => handleFlip("phrase", shuffledFlashcards[currentIndex].data.id)}
                    {...(shuffledFlashcards[currentIndex].data as Phrase)}
                  />
                )
              ) : null
            ) : (
              <p>Loading...</p>
            )}
            <button onClick={handleNext} disabled={currentIndex === shuffledFlashcards.length - 1} className="border border-white bg-gray-50 hover:border-transparent focus:outline-none hover:bg-gray-100 disabled:hover:bg-gray-50">
              <ArrowForwardIos fontSize="large" className={currentIndex === shuffledFlashcards.length - 1 ? "text-gray-300" : "text-secondary"} />
            </button>
          </div>
        </div>
      )}
      
      {/* Luyện tập Tab */}
      {tabIndex === 1 && (
        <div className="text-center text-gray-500 mt-4">Chức năng đang phát triển...</div>
      )}
    </div>
  );
};

export default LearnPhrase;
