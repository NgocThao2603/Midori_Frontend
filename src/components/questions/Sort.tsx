import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import AnswerResult from "../shared/AnswerResult";
import { AudioFile, ExampleToken } from "../../services/api";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { useAudio } from "../../contexts/AudioContext";

type SortProps = {
  questionTitle: string;
  tokens: ExampleToken[];
  onSelect: (answer: number[]) => void;
  savedAnswer?: number[];
  selectedIds: number[];
  checkResult?: "correct" | "incorrect" | null;
  isChecked?: boolean;
  audioFiles: AudioFile[];
  exampleId?: number;
  mode: "translate" | "listen";
  currentQuestionId: number;
  meaning?: string;
  doMode: "practice" | "test";
  disableResultAudio?: boolean;
};

export default function Sort({
  questionTitle,
  tokens = [],
  selectedIds = [],
  savedAnswer,
  onSelect,
  checkResult,
  isChecked,
  audioFiles,
  exampleId,
  mode,
  currentQuestionId,
  meaning,
  doMode,
  disableResultAudio
}: SortProps) {
  const { playAudio, stopAudio } = useAudio();
  const [selected, setSelected] = useState<ExampleToken[]>([]);
  const [shuffledTokens, setShuffledTokens] = useState<ExampleToken[]>([]);

  const questionAudio = audioFiles.find(
    (file) => file.audio_type === "example" && file.example_id === exampleId
  );

  const shuffleArray = (array: ExampleToken[]) => {
    return [...array]
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  };

  const available = shuffledTokens.filter((t) => !selected.find((s) => s.id === t.id));

  // Shuffle once when question changes
  useEffect(() => {
    setShuffledTokens(shuffleArray(tokens));
    setSelected([]);
  }, [currentQuestionId]);

  // Select from savedAnswer
  useEffect(() => {
    if (savedAnswer?.length && selected.length === 0) {
      const selectedTokens = savedAnswer
        .map((id) => tokens.find((t) => t.id === id))
        .filter((t): t is ExampleToken => t !== undefined);
      setSelected(selectedTokens);
      onSelect(savedAnswer);
    }
  }, [savedAnswer, tokens]);

  useEffect(() => {
    onSelect(selected.map((t) => t.id));
  }, [selected]);

  const handlePlayAudio = () => {
    stopAudio();
    if (questionAudio?.audio_url) {
      playAudio(questionAudio.audio_url);
    }
  };

  const renderCorrectOrder = (): string => {
    const corrects = tokens
      .filter((t) => typeof t.token_index === "number")
      .sort((a, b) => (a.token_index! - b.token_index!));
    return corrects.map((t) => t.jp_token).join(" ");
  };

  const getStyle = (id: number, index: number, isSelectedArea: boolean): string => {
    const correctIds = tokens
      .filter((t) => typeof t.token_index === "number")
      .sort((a, b) => a.token_index! - b.token_index!)
      .map((t) => t.id);

    let style =
      "bg-white border-gray-300 text-cyan_text hover:border-cyan_border hover:bg-cyan_pastel focus:outline-none";
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

  const handleClick = (token: ExampleToken) => {
    if (isChecked) return;

    const tokenAudio = audioFiles.find(
      (file) => file.audio_type === "example_token" && file.example_token_id === token.id
    );
    if (mode != "listen" && tokenAudio) playAudio(tokenAudio.audio_url);

    const isInSelected = selected.some((t) => t.id === token.id);
    if (isInSelected) {
      setSelected((prev) => prev.filter((t) => t.id !== token.id));
    } else {
      setSelected((prev) => [...prev, token]);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || isChecked) return;

    const from = result.source;
    const to = result.destination;

    const sourceList = from.droppableId === "selected" ? [...selected] : [...available];
    const dragged = sourceList[from.index];

    if (!dragged) return;

    // Same zone: reorder
    if (from.droppableId === to.droppableId) {
      const reordered = [...sourceList];
      reordered.splice(from.index, 1);
      reordered.splice(to.index, 0, dragged);

      if (from.droppableId === "selected") {
        setSelected(reordered);
      }
    } else {
      // Cross move
      if (from.droppableId === "available" && to.droppableId === "selected") {
        const newSelected = [...selected];
        newSelected.splice(to.index, 0, dragged);
        setSelected(newSelected);
      } else if (from.droppableId === "selected" && to.droppableId === "available") {
        const newSelected = [...selected];
        newSelected.splice(from.index, 1);
        setSelected(newSelected);
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

        <Droppable droppableId="available" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-wrap justify-center gap-3 p-4 min-h-[64px]"
            >
              {shuffledTokens.map((token) => {
                const isInSelected = selected.some((t) => t.id === token.id);
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
                    index={available.findIndex((t) => t.id === token.id)}
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
                          ${getStyle(token.id, 0, false)}
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
          disableResultAudio={disableResultAudio}
        />
      )}
    </div>
  );
}
