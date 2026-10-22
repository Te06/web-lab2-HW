import { useState, useEffect, useRef } from 'react';
import { AudioEngine } from '../audio-engine';

interface BeatEvent {
  key: string;
  time: number; // Timestamp tính bằng ms
}

export function BeatRecorder({ engine }: { engine: AudioEngine }) {
  const [events, setEvents] = useState<BeatEvent[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const startTimeRef = useRef<number>(0);

  // Hàm phát tiếng trống (giả lập bằng tần số)
  const playDrumSound = () => {
    // Tạo một tiếng "bụp" bằng Oscillator (bộ tạo dao động)
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Tần số giảm dần tạo tiếng trống
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Chỉ ghi nhận các phím chữ cái
      if (e.key.length === 1 && e.key !== ' ') {
        playDrumSound(); // Đánh trống ngay lập tức
        
        if (isRecording) {
          // Tính thời gian từ lúc bắt đầu record đến lúc bấm phím
          const now = performance.now();
          const relativeTime = now - startTimeRef.current;
          
          setEvents((prev) => [...prev, { key: e.key.toUpperCase(), time: relativeTime }]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording]);

  const startRecording = () => {
    setEvents([]);
    setIsRecording(true);
    startTimeRef.current = performance.now();
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const playRecorded = () => {
    if (events.length === 0) return;
    setIsPlaying(true);

    events.forEach((event) => {
      // Dùng setTimeout để phát lại đúng thời điểm đã ghi
      setTimeout(() => {
        playDrumSound();
      }, event.time);
    });

    // Kết thúc sau khi phát xong event cuối cùng
    const lastEventTime = events[events.length - 1].time;
    setTimeout(() => setIsPlaying(false), lastEventTime + 500);
  };

  return (
    <div style={{ border: '2px solid #333', padding: '1rem', marginTop: '2rem', backgroundColor: '#eef' }}>
      <h3>FIFO Beat Recorder</h3>
      <p>Bấm các phím chữ cái (A, S, D, F...) để đánh trống.</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
        {!isRecording ? (
          <button onClick={startRecording} disabled={isPlaying} style={{ padding: '10px', backgroundColor: 'red', color: 'white' }}>
            🔴 Bắt đầu Ghi (Record)
          </button>
        ) : (
          <button onClick={stopRecording} style={{ padding: '10px', backgroundColor: 'gray', color: 'white' }}>
            ⏹ Dừng Ghi
          </button>
        )}
        
        <button onClick={playRecorded} disabled={events.length === 0 || isPlaying || isRecording} style={{ padding: '10px' }}>
          ▶️ Phát lại (Preserve order)
        </button>
      </div>

      <div style={{ maxHeight: '150px', overflowY: 'auto', background: 'white', padding: '10px' }}>
        <strong>Lịch sử đánh trống ({events.length} nốt):</strong>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {events.map((ev, index) => (
            <li key={index} style={{ borderBottom: '1px solid #ccc', padding: '4px 0' }}>
              Phím <strong style={{ color: 'blue' }}>{ev.key}</strong> - tại giây thứ <strong>{(ev.time / 1000).toFixed(2)}s</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}