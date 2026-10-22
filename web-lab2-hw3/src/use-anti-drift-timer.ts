import { useState, useEffect } from 'react';

export function useAntiDriftTimer(targetTime: number) {
  // Lưu thời gian còn lại (tính bằng ms)
  const [remaining, setRemaining] = useState<number>(Math.max(0, targetTime - Date.now()));

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setRemaining(0);
        return; // Dừng timer
      }

      setRemaining(diff);
      // Dùng requestAnimationFrame để đồng bộ với nhịp làm tươi màn hình (60fps)
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    // Cleanup (Memory safety)
    return () => cancelAnimationFrame(rafId);
  }, [targetTime]);

  // Trả về chuỗi định dạng: MM:SS
  const seconds = Math.floor(remaining / 1000);
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  
  return { remaining, formatted: `${m}:${s}` };
}