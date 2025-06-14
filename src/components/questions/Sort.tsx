import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import AnswerResult from "../shared/AnswerResult";
import { AudioFile, ExampleToken } from "../../services/api";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { useAudio } from "../../contexts/AudioContext";

type SortProps = {
  questionId?: number;
  questionTitle: string;
  tokens: ExampleToken[];
  onSelect: (answer: number[]) => void;
  savedAnswer?: number[];
  selectedIds: number[];
  checkResult?: "correct" | "incorrect" | null;
  isChecked?: boolean;
  audioFiles: AudioFile[];
  mode: "translate" | "listen";
  currentQuestionId: number;
  meaning?: string;
  doMode: "practice" | "test";
};

export default function Sort({
  questionId,
  questionTitle,
  tokens = [],
  selectedIds = [],
  savedAnswer,
  onSelect,
  checkResult,
  isChecked,
  audioFiles,
  mode,
  currentQuestionId,
  meaning,
  doMode
}: SortProps) {
  const [selected, setSelected] = useState<ExampleToken[]>([]);
  const [available, setAvailable] = useState<ExampleToken[]>([]);
  const { playAudio, isPlaying } = useAudio();

  const questionAudio = audioFiles.find(
    (file) => 
      file.audio_type === "example" && 
      file.example_id === tokens[0]?.example_id
  );

  useEffect(() => {
    if (savedAnswer?.length && selected.length === 0) {
      // Find tokens based on saved answer order
      const selectedTokens = savedAnswer.map(id => 
        tokens.find(t => t.id === id)
      ).filter((t): t is ExampleToken => t !== undefined);
      
      setSelected(selectedTokens);
      
      // Update available tokens
      const selectedIds = new Set(savedAnswer);
      const availableTokens = shuffledTokens.filter(t => !selectedIds.has(t.id));
      setAvailable(availableTokens);

      // Notify parent
      onSelect(savedAnswer);
    }
  }, [savedAnswer, tokens]);

  // useEffect(() => {
  //   if (mode === "listen" && questionAudio?.audio_url) {
  //     const timeoutId = setTimeout(() => {
  //       playAudio(questionAudio.audio_url);
  //     }, 300);

  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [currentQuestionId, mode, questionAudio?.audio_url, playAudio]);

  // Click để phát lại
  const handlePlayAudio = () => {
    if (questionAudio?.audio_url) {
      playAudio(questionAudio.audio_url);
    }
  };
  const shuffleArray = (array: ExampleToken[]) => {
    return array
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  }; 

  const [shuffledTokens] = useState(() => {
    return shuffleArray([...tokens]);
  }); 

  useEffect(() => {
    if (!tokens) return;
    const selectedTokens = tokens.filter((t) => selectedIds.includes(t.id));
    const availableTokens = shuffledTokens.filter((t) => !selectedIds.includes(t.id));
    setSelected(selectedTokens);
    setAvailable(availableTokens);
  }, [tokens]);

  // useEffect(() => {
  //   // Đánh dấu component đã mount
  //   isMountedRef.current = true;
    
  //   // Cleanup function để xử lý unmount
  //   return () => {
  //     isMountedRef.current = false;
  //     // Dừng và xóa audio khi component unmount
  //     if (currentAudioRef.current) {
  //       currentAudioRef.current.pause();
  //       currentAudioRef.current.currentTime = 0;
  //       currentAudioRef.current = null;
  //     }
  //   };
  // }, []);

  // // Xử lý phát audio cho mode listen
  // useEffect(() => {
  //   if (mode === "listen" && questionAudio?.audio_url) {
  //     // Sử dụng timeout để tránh nhiều audio cùng phát khi thay đổi slide
  //     const audioTimeout = setTimeout(() => {
  //       if (isMountedRef.current) {
  //         playAudio(questionAudio.audio_url);
  //       }
  //     }, 300);

  //     // Cleanup function
  //     return () => {
  //       clearTimeout(audioTimeout);
  //     };
  //   }
  // }, [questionAudio?.audio_url, mode]);

  useEffect(() => {
    onSelect(selected.map((t) => t.id));
  }, [selected]);

  const renderCorrectOrder = (): string => {
    const corrects = tokens
      .filter((t) => typeof t.token_index === "number")
      .sort((a, b) => (a.token_index! - b.token_index!));
    return corrects.map((t) => t.jp_token).join(" ");
  };

  const getStyle = (id: number, index: number, isSelectedArea: boolean): string => {
    const correctIds = tokens
      .filter((t) => typeof t.token_index === "number")
      .sort((a, b) => (a.token_index! - b.token_index!))
      .map((t) => t.id);

    let style = "bg-white border-gray-300 text-cyan_text hover:border-cyan_border hover:bg-cyan_pastel focus:outline-none";
    if (isSelectedArea && !isChecked) {
      style = "bg-cyan_pastel border-cyan_border text-cyan_text";
    }
    if (isChecked) {
      if (correctIds[index] === id) {
        style = "bg-green_pastel border-secondary text-secondary";
      } else {
        style = "bg-red_pastel border-red_text text-red_text";
      }
    }

    return style;
  };

  const isTokenSelected = (tokenId: number): boolean => {
    return selected.some(t => t.id === tokenId);
  };

  const handleClick = (token: ExampleToken) => {
    if (isChecked) return;

    const tokenAudio = audioFiles.find(
      (file) =>
        file.audio_type === "example_token" &&
        file.example_token_id === token.id
    );
    if (tokenAudio) {
      playAudio(tokenAudio.audio_url);
    }

    if (selected.find((t) => t.id === token.id)) {
      // Bỏ chọn → quay lại available
      setSelected((prev) => prev.filter((t) => t.id !== token.id));
      setAvailable((prev) => [...prev, token]);
    } else {
      // Chọn → thêm vào selected
      setAvailable((prev) => prev.filter((t) => t.id !== token.id));
      setSelected((prev) => [...prev, token]);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || isChecked) return;

    const sourceId = result.source.droppableId;
    const destId = result.destination.droppableId;

    const sourceList = sourceId === "available" ? available : selected;
    const destList = destId === "available" ? available : selected;

    const draggedItem = sourceList[result.source.index];

    if (sourceId === destId) {
      // reorder trong cùng một list
      const newList = Array.from(sourceList);
      newList.splice(result.source.index, 1);
      newList.splice(result.destination.index, 0, draggedItem);

      if (sourceId === "available") setAvailable(newList);
      else setSelected(newList);
    } else {
      // move giữa 2 vùng
      const newSource = Array.from(sourceList);
      const newDest = Array.from(destList);
      newSource.splice(result.source.index, 1);
      newDest.splice(result.destination.index, 0, draggedItem);

      if (sourceId === "available") {
        setAvailable(newSource);
        setSelected(newDest);
      } else {
        setAvailable(newDest);
        setSelected(newSource);
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-center mt-6">
      {mode === "translate" && (
        <div>
          <h3 className="text-xl font-bold text-gray-700 mb-6">Sắp xếp câu đúng</h3>
          <p className="text-2xl font-bold text-cyan_text mb-10">{questionTitle}</p>
        </div>
      )}

      {mode === "listen" && (
        <div>
          <h3 className="text-xl font-bold text-gray-700 mb-6">Nghe và sắp xếp câu đúng</h3>
          {questionAudio && (
            <div
              onClick={handlePlayAudio}
              className="ml-0 w-24 h-24 mx-auto cursor-pointer text-cyan_text hover:scale-110 transition-transform duration-200"
            >
              <VolumeUpIcon style={{ width: "100%", height: "100%" }} />
            </div>
          )}
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Selected Line (blank) */}
        <Droppable droppableId="selected" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-wrap justify-center gap-3 p-4 min-h-[64px] border-b border-gray-300 mb-4"
            >
              {selected.map((token, index) => (
                <Draggable
                  key={`sel-${token.id}`}
                  draggableId={`sel-${token.id}`}
                  index={index}
                  isDragDisabled={isChecked}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => handleClick(token)}
                      className={`
                        px-4 py-2 rounded border font-semibold text-2xl
                        cursor-pointer transition-all duration-100
                        ${snapshot.isDragging ? "opacity-70 scale-105 shadow-lg" : ""}
                        ${getStyle(token.id, index, true)}
                        ${isChecked ? "pointer-events-none" : ""}
                      `}
                    >
                      {token.jp_token}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Token pool - Phương pháp tối ưu */}
        <Droppable droppableId="available" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-wrap justify-center gap-3 p-4 min-h-[64px]"
            >
              {shuffledTokens.map((token) => {
                const isInSelected = isTokenSelected(token.id);
                const availableIndex = available.findIndex((t) => t.id === token.id);
              
                if (isInSelected) {
                  // Tạo placeholder vô hình cho token đã được chọn
                  return (
                    <div
                      key={`placeholder-${token.id}`}
                      className="px-4 py-2 rounded bg-cyan_text text-transparent font-semibold text-xl opacity-50"
                    >
                      {token.jp_token}
                    </div>
                  );
                }
              
                return (
                  <Draggable
                    key={`avail-${token.id}`}
                    draggableId={`avail-${token.id}`}
                    index={availableIndex}
                    isDragDisabled={doMode === "practice" && isChecked}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => handleClick(token)}
                        className={`
                          px-4 py-2 rounded border font-semibold text-xl
                          cursor-pointer transition-all duration-100
                          ${snapshot.isDragging ? "opacity-70 scale-105 shadow-lg" : ""}
                          ${getStyle(token.id, availableIndex, false)}
                          ${doMode === "practice" && isChecked ? "pointer-events-none" : ""}
                          ${isInSelected ? "bg-gray-500 text-white" : ""}
                        `}
                      >
                        {token.jp_token}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {doMode === "practice" && (
        <AnswerResult
          result={checkResult ?? null}
          correctText={isChecked ? renderCorrectOrder() : ""}
          resultAudioUrl={questionAudio?.audio_url}
          meaning={meaning}
        />
      )}
    </div>
  );
}
