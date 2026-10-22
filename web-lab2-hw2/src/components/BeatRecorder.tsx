import { useState, useEffect, useRef } from 'react';
import { AudioEngine } from '../audio-engine';

interface BeatEvent {
  key: string;
  time: number;
}

export function BeatRecorder({ engine }: { engine: AudioEngine }) {
  const [events, setEvents] = useState<BeatEvent[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const startTimeRef = useRef<number>(0);

  // Sửa lại để mỗi phím ra 1 âm thanh khác nhau
  const playDrumSound = (key: string) => {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    let startFreq = 150;
    let duration = 0.5;

    switch (key) {
      case 'A': startFreq = 150; duration = 0.4; break; // Kick
      case 'S': startFreq = 250; duration = 0.2; break; // Snare
      case 'D': startFreq = 800; duration = 0.05; break; // Hi-hat
      case 'F': startFreq = 400; duration = 0.3; break; // Tom
      default: startFreq = 150; duration = 0.3;
    }
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length === 1 && e.key !== ' ') {
        const upperKey = e.key.toUpperCase();
        playDrumSound(upperKey);
        
        if (isRecording) {
          const now = performance.now();
          const relativeTime = now - startTimeRef.current;
          setEvents((prev) => [...prev, { key: upperKey, time: relativeTime }]);
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
      setTimeout(() => {
        playDrumSound(event.key);
      }, event.time);
    });

    const lastEventTime = events[events.length - 1].time;
    setTimeout(() => setIsPlaying(false), lastEventTime + 500);
  };

  return (
    <div style={{ border: '2px solid #333', padding: '1rem', marginTop: '2rem', backgroundColor: '#eef' }}>
      <h2>FIFO Beat Recorder</h2>
      <p>Bấm các phím chữ cái (A, S, D, F...) để đánh trống.</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
        {!isRecording ? (
          <button onClick={startRecording} disabled={isPlaying} style={{ padding: '10px', backgroundColor: '#cc0000', color: 'white' }}>
            🔴 Bắt đầu Ghi (Record)
          </button>
        ) : (
          // Đã sửa màu gray thành #555 (xám đậm) để đủ độ tương phản
          <button onClick={stopRecording} style={{ padding: '10px', backgroundColor: '#555555', color: 'white' }}>
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
              {/* Đã sửa màu blue thành #0000cc cho đậm hơn */}
              Phím <strong style={{ color: '#0000cc' }}>{ev.key}</strong> - tại giây thứ <strong>{(ev.time / 1000).toFixed(2)}s</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}