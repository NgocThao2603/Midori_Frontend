import api from "./api";
import type { AudioFile } from "./api";

export const fetchAudioFiles = async (): Promise<AudioFile[]> => {
  try {
    const response = await api.get<AudioFile[]>("/audio_files");
    return response.data;
  } catch (error) {
    console.error("Error fetching audio files", error);
    return [];
  }
};

export const getAudioByType = (
  audioFiles: AudioFile[],
  type: "vocab" | "phrase" | "example" | "example_token"
): AudioFile[] => {
  return audioFiles.filter(file => file.audio_type === type);
};
