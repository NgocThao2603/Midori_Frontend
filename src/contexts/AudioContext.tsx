// import React, { createContext, useContext, useRef, useState, useCallback, ReactNode } from "react";

// interface AudioContextType {
//   currentAudio: HTMLAudioElement | null;
//   isPlaying: boolean;
//   playAudio: (url: string, options?: { volume?: number; onEnded?: () => void }) => Promise<void>;
//   stopAudio: () => void;
//   pauseAudio: () => void;
//   resumeAudio: () => void;
// }

// const AudioContext = createContext<AudioContextType | undefined>(undefined);

// interface AudioProviderProps {
//   children: ReactNode;
// }

// export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const stopAudio = useCallback(() => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
//       setIsPlaying(false);
//     }
//   }, []);

//   const pauseAudio = useCallback(() => {
//     if (audioRef.current && !audioRef.current.paused) {
//       audioRef.current.pause();
//       setIsPlaying(false);
//     }
//   }, []);

//   const resumeAudio = useCallback(() => {
//     if (audioRef.current && audioRef.current.paused) {
//       audioRef.current.play().catch(console.warn);
//       setIsPlaying(true);
//     }
//   }, []);

//   const playAudio = useCallback(async (url: string, options?: { volume?: number; onEnded?: () => void }) => {
//     try {
//       // Dừng audio hiện tại nếu có
//       stopAudio();

//       // Tạo audio mới
//       const audio = new Audio(url);
//       audioRef.current = audio;
      
//       // Cấu hình audio
//       audio.volume = options?.volume ?? 1;
      
//       // Event listeners
//       audio.onended = () => {
//         setIsPlaying(false);
//         options?.onEnded?.();
//       };

//       audio.onerror = () => {
//         console.warn("Audio play error for URL:", url);
//         setIsPlaying(false);
//       };

//       audio.onloadstart = () => setIsPlaying(true);

//       // Phát audio
//       await audio.play();
//     } catch (error) {
//       console.warn("Audio play error:", error);
//       setIsPlaying(false);
//     }
//   }, [stopAudio]);

//   const value: AudioContextType = {
//     currentAudio: audioRef.current,
//     isPlaying,
//     playAudio,
//     stopAudio,
//     pauseAudio,
//     resumeAudio,
//   };

//   return (
//     <AudioContext.Provider value={value}>
//       {children}
//     </AudioContext.Provider>
//   );
// };

// export const useAudio = (): AudioContextType => {
//   const context = useContext(AudioContext);
//   if (!context) {
//     throw new Error("useAudio must be used within an AudioProvider");
//   }
//   return context;
// };

import React, { createContext, useContext, useRef, useState, useCallback, ReactNode } from "react";

interface AudioContextType {
  currentAudio: HTMLAudioElement | null;
  isPlaying: boolean;
  playAudio: (url: string, options?: { volume?: number; onEnded?: () => void }) => Promise<void>;
  stopAudio: () => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const pauseAudio = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resumeAudio = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(console.warn);
      setIsPlaying(true);
    }
  }, []);

  const playAudio = useCallback(async (url: string, options?: { volume?: number; onEnded?: () => void }) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = ""; // Giải phóng nguồn audio
      }

      // Tạo audio mới
      const audio = new Audio(url);
      audioRef.current = audio;
      
      // Cấu hình audio
      audio.volume = options?.volume ?? 1;
      
      // Event listeners
      audio.onended = () => {
        setIsPlaying(false);
        options?.onEnded?.();
      };

      audio.onerror = () => {
        console.warn("Audio play error for URL:", url);
        setIsPlaying(false);
      };

      audio.onloadstart = () => setIsPlaying(true);

      // Phát audio
      await audio.play();
    } catch (error) {
      console.warn("Audio play error:", error);
      setIsPlaying(false);
    }
  }, [stopAudio]);

  const value: AudioContextType = {
    currentAudio: audioRef.current,
    isPlaying,
    playAudio,
    stopAudio,
    pauseAudio,
    resumeAudio,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
