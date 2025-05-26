export const formatDuration = (start: string, end: string | null, limitInMinutes?: number): string => {
  if (!end) return "00:00";
  
  const durationMs = new Date(end).getTime() - new Date(start).getTime();
  const durationSec = Math.floor(durationMs / 1000);

  const limitSec = (limitInMinutes ?? 0) * 60;
  const finalDurationSec = limitSec > 0 && durationSec > limitSec ? limitSec : durationSec;

  const minutes = Math.floor(finalDurationSec / 60);
  const seconds = finalDurationSec % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
