import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { Tabs, Tab, Button } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Shuffle } from "@mui/icons-material";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import VocabCard from "../components/learn-phrase/VocabCard";
import PhraseCard from "../components/learn-phrase/PhraseCard";
import { fetchVocabulariesByLesson, Vocabulary, Phrase, AudioFile, fetchChapters } from "../services/api";
import quoteIcon from "../assets/quote-icon.png";
import { useLessonStatuses } from "../contexts/LessonStatusContext";
import { useMarkStudiedByLessonId } from "../hooks/useMarkStudiedByLessonId";
import doneTicker from "../assets/doneTicker.png"; 
import { Slide } from "../components/Slide";
import ex_choice from "../assets/ex_choice.png";
import ex_match from "../assets/ex_match.png";
import { useAudio } from "../contexts/AudioContext";
import { fetchAudioFiles, getAudioByType } from "../services/AudioService";
import { useLessonLevelMap } from "../contexts/LessonLevelContext";

const LearnPhrase: React.FC = () => {
  const navigate = useNavigate();
  const { level } = useOutletContext<{ level: string }>();
  const { lessonId } = useParams();
  const lessonIdNum = lessonId ? Number(lessonId) : undefined;
  useMarkStudiedByLessonId(lessonIdNum);
  const { isDoneStatus } = useLessonStatuses();
  const done = lessonId ? isDoneStatus(Number(lessonId), "phrase") : false;

  const images = [ex_choice, ex_match]
  const [tabIndex, setTabIndex] = useState(0);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [flashcards, setFlashcards] = useState<{ type: "vocab" | "phrase"; data: Vocabulary | Phrase }[]>([]);
  const [shuffledFlashcards, setShuffledFlashcards] = useState<{ type: "vocab" | "phrase"; data: Vocabulary | Phrase }[]>([]);
  const currentCard = shuffledFlashcards[currentIndex];

  const { playAudio, stopAudio  } = useAudio();
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  
  useEffect(() => {
    fetchAudioFiles().then(setAudioFiles);
  }, []);

  const vocabAudios = getAudioByType(audioFiles, "vocab");
  const phraseAudios = getAudioByType(audioFiles, "phrase");

  const handlePlayVocabAudio = (vocabId: number) => {
    const audio = vocabAudios.find(f => f.vocabulary_id === vocabId);
    if (audio) playAudio(audio.audio_url);
  };

  // Hàm phát audio cho phrase
  const handlePlayPhraseAudio = (phraseId: number) => {
    const audio = phraseAudios.find(f => f.phrase_id === phraseId);
    if (audio) playAudio(audio.audio_url);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
    setFlipped({});
    setTabIndex(newIndex);
    setCurrentIndex(0);
  };

  const { lessonLevelMap, isReady } = useLessonLevelMap();

  useEffect(() => {
    if (!lessonId || !isReady) return;
    const lessonLevel = lessonLevelMap.get(Number(lessonId));
    if (lessonLevel !== level) {
      fetchChapters(level).then((chapters) => {
        const firstLessonId = chapters?.[0]?.lessons?.[0]?.id;
        if (firstLessonId) {
          navigate(`/learn-phrase/${firstLessonId}`, { replace: true });
        }
      });
    }
  }, [level, lessonId, isReady, lessonLevelMap, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!lessonId) return;
      
      try {
        const { vocabList, flashcards } = await fetchVocabulariesByLesson(lessonId);

        setVocabList(vocabList);
        setFlashcards(flashcards);
        setShuffledFlashcards([...flashcards]);
        setCurrentIndex(0);
        setFlipped({});
        stopAudio();
      } catch (error) {
        console.error("Lỗi khi fetch data:", error);
      }
    };

    fetchData();
  }, [lessonId, level]);

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

  useEffect(() => {
    if (!currentCard) return;
    const key = `${currentCard.type}_${currentCard.data.id}`;
    if (flipped[key]) {
      if (currentCard.type === "vocab") {
        handlePlayVocabAudio(currentCard.data.id);
      } else if (currentCard.type === "phrase") {
        handlePlayPhraseAudio(currentCard.data.id);
      }
    }
  }, [flipped]);

  useEffect(() => {
    stopAudio();
  }, [currentIndex, stopAudio]);
  
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
      const currentCard = flashcards[currentIndex];
      if (event.key === "ArrowLeft" && currentIndex > 0) {
        handlePrev();
      } else if (event.key === "ArrowRight" && currentIndex < flashcards.length - 1) {
        handleNext();
      } else if (event.key === "ArrowUp") {     
        if (currentCard.type === "vocab") {
          handleFlip("vocab", currentCard.data.id);
        } else {
          handleFlip("phrase", currentCard.data.id);
        }
      } else if (event.key === "ArrowDown") {
        // Phát audio cho card hiện tại
        if (!currentCard) return;
        if (currentCard.type === "vocab") {
          handlePlayVocabAudio(currentCard.data.id);
        } else if (currentCard.type === "phrase") {
          handlePlayPhraseAudio(currentCard.data.id);
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
                  {vocab.stt} {vocab.kanji}
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
                    playAudio={handlePlayVocabAudio}
                    {...(shuffledFlashcards[currentIndex].data as Vocabulary)}                  />
                ) : (
                  <PhraseCard
                    flipped={flipped[`phrase_${shuffledFlashcards[currentIndex].data.id}`]}
                    onFlip={() => handleFlip("phrase", shuffledFlashcards[currentIndex].data.id)}
                    playAudio={handlePlayPhraseAudio}
                    {
                      ...{
                        ...(shuffledFlashcards[currentIndex].data as Phrase),
                        phrase_type: (shuffledFlashcards[currentIndex].data as Phrase).phrase_type ?? ""
                      }
                    }
                  />
                )
              ) : null
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="w-16 h-16 border-4 border-cyan_border border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <button onClick={handleNext} disabled={currentIndex === shuffledFlashcards.length - 1} className="border border-white bg-gray-50 hover:border-transparent focus:outline-none hover:bg-gray-100 disabled:hover:bg-gray-50">
              <ArrowForwardIos fontSize="large" className={currentIndex === shuffledFlashcards.length - 1 ? "text-gray-300" : "text-secondary"} />
            </button>
          </div>
        </div>
      )}
      
      {/* Luyện tập Tab */}
      {tabIndex === 1 && (
        <div className="flex flex-col items-center space-y-8">
          <div className="relative w-full max-w-4xl">
            {lessonId && done && (
              <img src={doneTicker} alt=" " className="w-24 h-24 absolute top-8 right-2 z-10" />
            )}
          </div>
          <div className="relative border border-cyan_border rounded-xl p-4 bg-cyan_pastel text-cyan_text w-[100%] mt-12">
            <img src={quoteIcon} alt="" className="absolute top-4 left-4 w-4 h-4"/>
            <img src={quoteIcon} alt="" className="absolute bottom-4 right-4 w-4 h-4 rotate-180" />
            <div className="py-6 px-8">
              <p className="font-semibold text-xl">
                Cùng Midori luyện tập với các câu hỏi đa dạng
              </p>
              <ul className="flex w-3/4 mx-auto list-disc list-inside mt-4 items-center justify-between">
                <li>Thi nối từ</li>
                <li>Đoán nghĩa đúng</li>
                <li>Cách đọc như nào?</li>
              </ul>
              <div className="w-3/4 h-76 mt-6 items-center mx-auto">
                <Slide images={images} variant="plain"/>
              </div>
              <p className="mt-4 font-semibold text-xl text-center">Thử thách trí nhớ của bạn!</p>
            </div> 
            
          </div>
    
          <Button
            variant="contained"
            onClick={() => navigate(`/practice-phrase/${lessonId}`)}
            className="!bg-cyan_border hover:!bg-secondary !text-white !font-bold !text-xl !px-6 !py-4 !mt-6 !rounded-lg !focus:outline-none"
            sx={{
              "&:focus": { outline: "none", boxShadow: "none" },
            }}
          >
            {done ? "LUYỆN TẬP LẠI" : "BẮT ĐẦU LUYỆN TẬP"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LearnPhrase;
