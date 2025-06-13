import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AnswerResult from "../shared/AnswerResult";
import { AudioFile } from "../../services/api";

type MatchProps = {
  questionId?: number;
  questionTitle: string;
  choices: { id: number; choice: string; is_correct?: boolean }[];
  onSelect: (answer: number[]) => void;
  savedAnswer?: number[];
  selectedIds: number[];
  checkResult?: "correct" | "incorrect" | null;
  isChecked?: boolean;
  audioFiles: AudioFile[];
  meaning?: string;
  doMode: "practice" | "test";
};

export default function Match({
  questionId,
  questionTitle,
  choices,
  savedAnswer,
  onSelect,
  selectedIds,
  checkResult,
  isChecked,
  audioFiles,
  meaning,
  doMode
}: MatchProps) {
  const numBlanks = (questionTitle.match(/___/g) || []).length;
  const [localSelected, setLocalSelected] = useState<number[]>(
    savedAnswer || selectedIds || []
  );

  useEffect(() => {
    onSelect(localSelected);
  }, [localSelected]);

  const questionAudio = audioFiles.find(
    (file) => file.audio_type === "phrase"
  );

    // Effect to handle savedAnswer changes
  useEffect(() => {
    if (savedAnswer?.length) {
      setLocalSelected(savedAnswer);
      onSelect(savedAnswer);
    }
  }, [savedAnswer]);

  // Effect to sync localSelected with parent
  useEffect(() => {
    if (selectedIds?.length && !localSelected.length) {
      setLocalSelected(selectedIds);
    }
  }, [selectedIds]);

  // Sync changes to parent
  useEffect(() => {
    if (localSelected.length) {
      onSelect(localSelected);
    }
  }, [localSelected]);

  const getChoiceById = (id: number) => choices.find((c) => c.id === id);

  const getStyleForChoice = (choiceId: number) => {
    const choice = getChoiceById(choiceId);
    if (!choice) return "";
    
    const correctIds = choices.filter(c => c.is_correct).map(c => c.id);
    const isCorrectChoice = correctIds.includes(choiceId);
    const isSelected = localSelected.includes(choiceId);

    let buttonStyle = "text-xl bg-white border-gray-300 text-cyan_text hover:border-cyan_border hover:bg-cyan_pastel focus:outline-none";
    
    if (isSelected && !isChecked) {
      buttonStyle = "bg-cyan_pastel border-cyan_border text-cyan_text";
    }

    if (isChecked) {
      if (isCorrectChoice) {
        buttonStyle = "bg-green_pastel border-secondary text-secondary";
      }

      if (isSelected) {
        const selectedIndex = localSelected.indexOf(choiceId);
        const correctIdAtPosition = correctIds[selectedIndex];

        if (choiceId !== correctIdAtPosition) {
          buttonStyle = "bg-red_pastel border-red_text text-red_text";
        }
      }
    }
    
    return buttonStyle;
  };  

  const handleClickChoice = (id: number) => {
    if (isChecked) return;
    
    if (localSelected.includes(id)) {
      // If already selected, remove it
      const newSelected = localSelected.filter(selectedId => selectedId !== id);
      setLocalSelected(newSelected);
    } else if (localSelected.length < numBlanks) {
      // Add to selection if we haven't filled all blanks
      setLocalSelected([...localSelected, id]);
    }
  };

  const handleRemove = (index: number) => {
    if (isChecked) return;
    const newSelected = [...localSelected];
    newSelected.splice(index, 1);
    setLocalSelected(newSelected);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination || isChecked) return;
    
    const { source, destination, draggableId } = result;
    let sourceId: number;
    
    if (draggableId.startsWith("choice-")) {
      sourceId = parseInt(draggableId.split("-")[1]);
    } else if (draggableId.startsWith("blank-")) {
      const parts = draggableId.split("-");
      sourceId = parseInt(parts[1]);
    } else {
      return;
    }

    // Case 1: Dragging from choices to blanks
    if (source.droppableId.startsWith("choices") && destination.droppableId.startsWith("blank-")) {
      const blankIndex = parseInt(destination.droppableId.split("-")[1]);
      const newSelected = [...localSelected];
      if (blankIndex < newSelected.length) {
        newSelected[blankIndex] = sourceId;
      } 
      else if (newSelected.length < numBlanks) {
        newSelected.push(sourceId);
      }
      
      setLocalSelected(newSelected);
    }
    
    // Case 2: Dragging from one blank to another blank
    else if (source.droppableId.startsWith("blank-") && destination.droppableId.startsWith("blank-")) {
      const sourceBlankIndex = parseInt(source.droppableId.split("-")[1]);
      const destBlankIndex = parseInt(destination.droppableId.split("-")[1]);
      
      // Swap the values
      const newSelected = [...localSelected];
      const temp = newSelected[sourceBlankIndex];
      newSelected[sourceBlankIndex] = newSelected[destBlankIndex];
      newSelected[destBlankIndex] = temp;
      
      setLocalSelected(newSelected);
    }
    
    // Case 3: Dragging from blank to choices (remove from selection)
    else if (source.droppableId.startsWith("blank-") && destination.droppableId.startsWith("choices")) {
      const blankIndex = parseInt(source.droppableId.split("-")[1]);
      
      // Remove the value from the selected array
      const newSelected = [...localSelected];
      newSelected.splice(blankIndex, 1);
      
      setLocalSelected(newSelected);
    }
    
    // Case 4: Reordering choices doesn't affect selection
    else if (source.droppableId.startsWith("choices") && destination.droppableId.startsWith("choices")) {
      // No action needed, just visual reordering in the choices area
      return;
    }
  };

  const renderBlanks = () => {
    const parts = questionTitle.split("___");
    return parts.map((part, index) => {
      const result = [];
      
      // Add the text part
      result.push(
        <span key={`text-${index}`} className="inline-block">
          {part}
        </span>
      );
      
      // Add the blank if it's not the last text part
      if (index < parts.length - 1) {
        const choiceId = localSelected[index];
        const choice = choiceId !== undefined ? getChoiceById(choiceId) : null;
        
        result.push(
          <Droppable 
            key={`blank-droppable-${index}`} 
            droppableId={`blank-${index}`} 
            direction="horizontal"
            isDropDisabled={isChecked}
          >
            {(provided, snapshot) => (
              <span
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`inline-block min-w-[60px] mx-1 ${
                  snapshot.isDraggingOver ? "bg-cyan-100 rounded" : ""
                }`}
              >
                {choice ? (
                  <Draggable
                    key={`blank-${choiceId}-${index}`}
                    draggableId={`blank-${choiceId}-${index}`}
                    index={0}
                    isDragDisabled={isChecked}
                  >
                    {(provided, snapshot) => (
                      <span
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`
                          inline-block min-w-[60px] px-3 py-2 border rounded font-bold text-xl
                          cursor-pointer transition-all duration-100
                          ${snapshot.isDragging ? "opacity-70 scale-105 shadow-lg" : ""}
                          ${getStyleForChoice(choiceId)}
                          ${isChecked ? "pointer-events-none" : ""}
                        `}
                        onClick={() => handleRemove(index)}
                      >
                        {choice.choice}
                      </span>
                    )}
                  </Draggable>
                ) : (
                  <span className="inline-block min-w-[60px] px-3 py-2 border border-gray-300 rounded font-bold text-xl text-gray-400">
                    ________
                  </span>
                )}
                {provided.placeholder}
              </span>
            )}
          </Droppable>
        );
      }
      
      return result;
    }).flat();
  };

  const renderCorrectAnswerText = () => {
    const parts = questionTitle.split("___");
    const corrects = choices.filter((c) => c.is_correct);
    const result: string[] = [];

    for (let i = 0; i < parts.length; i++) {
      result.push(parts[i]);
      if (i < corrects.length) {
        result.push(corrects[i].choice);
      }
    }

    return result.join("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-center mt-6">
      <h3 className="text-xl font-bold text-gray-700 mb-6">Điền vào chỗ trống</h3>

      <DragDropContext onDragEnd={onDragEnd}>
        <p className="text-4xl font-bold text-cyan_text mb-10 break-words flex flex-wrap justify-center items-center">
          {renderBlanks()}
        </p>

        <Droppable droppableId="choices" direction="horizontal">
          {(provided, snapshot) => (
            <div
              className={`flex flex-wrap justify-center gap-3 p-2 transition-all rounded-lg ${
                snapshot.isDraggingOver ? "bg-cyan_pastel" : ""
              }`}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {choices.map((choice, index) => {
                const isUsed = localSelected.includes(choice.id);
                if (isUsed) return null;

                return (
                  <Draggable
                    key={`choice-${choice.id}`}
                    draggableId={`choice-${choice.id}`}
                    index={index}
                    isDragDisabled={isChecked}
                  >
                    {(provided, snapshot) => (
                      <button
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => handleClickChoice(choice.id)}
                        disabled={doMode === "practice" && isChecked}
                        className={`
                          px-4 py-2 border rounded-md text-lg font-medium 
                          transition-all duration-100
                          ${snapshot.isDragging ? "opacity-70 scale-105 shadow-md" : ""}
                          ${getStyleForChoice(choice.id)}
                          ${doMode === "practice" && isChecked ? "pointer-events-none" : ""}
                        `}
                      >
                        {choice.choice}
                      </button>
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
          correctText={isChecked ? renderCorrectAnswerText() : ""}
          resultAudioUrl={questionAudio?.audio_url}
          meaning={meaning}
        />
      )}
    </div>
  );
}
