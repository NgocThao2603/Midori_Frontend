import React, { useEffect, useState } from "react";
import { Tabs, Tab } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Shuffle } from "@mui/icons-material";
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import VocabCard from "../components/learn-phrase/VocabCard";
import PhraseCard from "../components/learn-phrase/PhraseCard";

interface Vocabulary {
  id: number;
  kanji: string;
  hanviet: string;
  kana: string;
  word_type: string;
  meaning: string[];
}

const vocabList: Vocabulary[] = [
  { id: 1, kanji: "男性", hanviet: "Nam tính", kana: "だんせい", word_type: "Danh từ", meaning: ["nam giới", "đàn ông", "giới tính nam"] },
  { id: 2, kanji: "女性", hanviet: "Nữ tính", kana: "じょせい", word_type: "Danh từ", meaning: ["nữ giới", "phụ nữ", "giới tính nữ"] },
  { id: 3, kanji: "高齢", hanviet: "Cao linh", kana: "こうれい", word_type: "Danh từ", meaning: ["cao tuổi", "lớn tuổi"] },
  { id: 4, kanji: "友人", hanviet: "Hữu nhân", kana: "ゆうじん", word_type: "Danh từ", meaning: ["bạn bè", "bạn thân"] },
  { id: 5, kanji: "仲", hanviet: "Trọng", kana: "なか", word_type: "Danh từ", meaning: ["quan hệ", "mối quan hệ"] },
  { id: 6, kanji: "出身", hanviet: "Xuất thân", kana: "しゅっしん", word_type: "Danh từ", meaning: ["quê quán", "xuất thân"] },
  { id: 7, kanji: "成長", hanviet: "Thành trưởng", kana: "せいちょう", word_type: "Danh từ", meaning: ["sự trưởng thành", "tăng trưởng"] },
  { id: 8, kanji: "成功", hanviet: "Thành công", kana: "せいこう", word_type: "Danh từ", meaning: ["thành công"] },
  { id: 9, kanji: "失敗", hanviet: "Thất bại", kana: "しっぱい", word_type: "Danh từ", meaning: ["thất bại", "không thành công"] },
  { id: 10, kanji: "準備", hanviet: "Chuẩn bị", kana: "じゅんび", word_type: "Danh từ", meaning: ["chuẩn bị", "sẵn sàng"] },
];

interface PhraseCardProps {
  id: number;
  vocab_id: number;
  phrase: string;
  main_word: string;
  kana?: string;
  prefix?: string;
  suffix?: string;
  meaning: string;
}

const phrases: PhraseCardProps[] = [
  {
    id: 1,
    vocab_id: 1,
    main_word: "男性",
    phrase: "男性的",
    kana: "だんせいてき",
    prefix: "",
    suffix: "的",
    meaning: "Có tính đàn ông, nam tính.",
  },
  {
    id: 2,
    vocab_id: 1,
    main_word: "男性",
    phrase: "男性用",
    kana: "だんせいよう",
    prefix: "",
    suffix: "用",
    meaning: "Dành cho nam giới.",
  },
  {
    id: 3,
    vocab_id: 2,
    main_word: "女性",
    phrase: "女性向け",
    kana: "じょせいむけ",
    prefix: "",
    suffix: "向け",
    meaning: "Phù hợp với phụ nữ.",
  },
];

const LearnPhrase: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
    setFlipped({});
    setTabIndex(newIndex);
    setCurrentIndex(0); 
  };

  const flashcards = vocabList.flatMap((vocab) => {
    const relatedPhrases = phrases
      .filter((phrase) => phrase.vocab_id === vocab.id)
      .map((phrase) => ({
        type: "phrase",
        data: phrase,
      }));

    return [{ type: "vocab", data: vocab }, ...relatedPhrases];
  });

  const [shuffledFlashcards, setShuffledFlashcards] = useState(flashcards);
  
  const shuffleFlashcards = () => {
    // Chỉ trộn danh sách từ vựng
    const shuffledVocabList = [...vocabList].sort(() => Math.random() - 0.5);
  
    // Xây dựng lại danh sách flashcards với từ vựng đã trộn
    const shuffledFlashcards = shuffledVocabList.flatMap((vocab) => {
      const relatedPhrases = phrases
        .filter((phrase) => phrase.vocab_id === vocab.id)
        .map((phrase) => ({
          type: "phrase",
          data: phrase,
        }));
  
      return [{ type: "vocab", data: vocab }, ...relatedPhrases];
    });
  
    setShuffledFlashcards(shuffledFlashcards);
    setCurrentIndex(0);
    setFlipped({});
  };  

  const resetFlashcards = () => {
    setShuffledFlashcards(flashcards); // Quay về danh sách gốc
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
                    (shuffledFlashcards[currentIndex].data as PhraseCardProps).vocab_id === vocab.id;

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

            {shuffledFlashcards[currentIndex].type === "vocab" ? (
              <VocabCard
                flipped={flipped[`vocab_${shuffledFlashcards[currentIndex].data.id}`]}
                onFlip={() => handleFlip("vocab", shuffledFlashcards[currentIndex].data.id)}
                {...(shuffledFlashcards[currentIndex].data as Vocabulary)} // Ép kiểu chính xác cho VocabCard
              />
            ) : (
              <PhraseCard
                flipped={flipped[`phrase_${shuffledFlashcards[currentIndex].data.id}`]}
                onFlip={() => handleFlip("phrase", shuffledFlashcards[currentIndex].data.id)}
                {...(shuffledFlashcards[currentIndex].data as PhraseCardProps)} // Ép kiểu chính xác cho PhraseCard
              />
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
