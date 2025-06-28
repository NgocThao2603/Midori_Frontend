import { useEffect, useState } from "react";
import { useAudio } from "../contexts/AudioContext";
import { AudioFile } from "../services/api";

interface UseQuestionAudioOptions {
  audioFiles: AudioFile[];
  questionId?: number;
  vocabularyId?: number;
  phraseId?: number;
  exampleId?: number;
  exampleTokenId?: number;
  mode?: "translate" | "listen";
  autoPlay?: boolean;
  autoPlayDelay?: number;
}

export const useQuestionAudio = ({
  audioFiles,
  questionId,
  vocabularyId,
  phraseId,
  exampleId,
  exampleTokenId,
  mode,
  autoPlay = false,
  autoPlayDelay =50
}: UseQuestionAudioOptions) => {
  const { playAudio, stopAudio, isPlaying } = useAudio();
  const [questionAudio, setQuestionAudio] = useState<AudioFile | null>(null);

  // Tìm audio file phù hợp
  useEffect(() => {
    let audio: AudioFile | null = null;

    if (exampleTokenId) {
      audio = audioFiles.find(
        file => file.audio_type === "example_token" && file.example_token_id === exampleTokenId
      ) || null;
    } else if (exampleId) {
      audio = audioFiles.find(
        file => file.audio_type === "example" && file.example_id === exampleId
      ) || null;
    } else if (phraseId) {
      audio = audioFiles.find(
        file => file.audio_type === "phrase" && file.phrase_id === phraseId
      ) || null;
    } else if (vocabularyId) {
      audio = audioFiles.find(
        file => file.audio_type === "vocab" && file.vocabulary_id === vocabularyId
      ) || null;
    } else {
      // Fallback: tìm audio đầu tiên phù hợp
      audio = audioFiles.find(
        file => file.audio_type === "example" || 
                file.audio_type === "vocab" || 
                file.audio_type === "phrase"
      ) || null;
    }

    setQuestionAudio(audio);
  }, [audioFiles, vocabularyId, phraseId, exampleId, exampleTokenId]);

  // Auto play cho mode listen
  useEffect(() => {
    if (autoPlay && mode === "listen" && questionAudio?.audio_url && questionId) {
      const timeoutId = setTimeout(() => {
        playAudio(questionAudio.audio_url);
      }, autoPlayDelay);

      return () => {
        clearTimeout(timeoutId);
        stopAudio(); // Dừng audio cũ khi hủy effect
      };
    }
  }, [questionId, mode, questionAudio, autoPlay, autoPlayDelay, playAudio]);

  const handlePlayAudio = () => {
    if (questionAudio?.audio_url && !isPlaying) {
      playAudio(questionAudio.audio_url);
    }
  };

  const handleStopAudio = () => {
    stopAudio();
  };

  return {
    questionAudio,
    isPlaying,
    playAudio: handlePlayAudio,
    stopAudio: handleStopAudio,
    hasAudio: !!questionAudio?.audio_url
  };
};
