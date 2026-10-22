import { useState } from 'react';
import { AudioTaskQueue } from './audio-queue-controller';
import { AudioEngine } from './audio-engine';
import { Visualizer } from './components/Visualizer';
import { BeatRecorder } from './components/BeatRecorder';

const queue = new AudioTaskQueue();
const engine = new AudioEngine();

interface TrackInfo {
  id: string;
  name: string;
  url: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  buffer?: AudioBuffer; 
}

function App() {
  const [tracks, setTracks] = useState<TrackInfo[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newTracks: TrackInfo[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file); 
      newTracks.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: url,
        status: 'pending',
      });
    }

    setTracks((prev) => [...prev, ...newTracks]);
    
    newTracks.forEach(async (track) => {
      setTracks((prev) => prev.map(t => t.id === track.id ? { ...t, status: 'loading' } : t));
      
      try {
        const buffer = await queue.enqueue(track.url);
        setTracks((prev) => prev.map(t => t.id === track.id ? { ...t, status: 'success', buffer } : t));
      } catch (err) {
        setTracks((prev) => prev.map(t => t.id === track.id ? { ...t, status: 'error' } : t));
      }
    });
  };

  const handleCancel = () => {
    queue.cancelActiveDownload();
  };

  return (
    // Thêm color: '#111' để chữ đen hơn
    <main style={{ padding: '2rem', fontFamily: 'monospace', color: '#111' }}>
      <h1>HW2: Audio Queue Engine</h1>
      
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px dashed #ccc' }}>
            {/* Đã thêm htmlFor và id cho Label */}
            <label htmlFor="file-upload" style={{ fontWeight: 'bold' }}>Chọn file nhạc: </label>
            <input id="file-upload" type="file" multiple accept="audio/*" onChange={handleFileUpload} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <button 
  onClick={handleCancel} 
  style={{ 
    padding: '10px', 
    backgroundColor: '#ffffff', // Nền trắng
    color: '#cc0000',           // Chữ đỏ đậm
    fontWeight: 'bold', 
    border: '2px solid #cc0000' // Viền đỏ
  }}
>
  🛑 HỦY TẢI
</button>
          </div>

          <div style={{ border: '1px solid #333', padding: '1rem', backgroundColor: '#f9f9f9', maxHeight: '300px', overflowY: 'auto' }}>
            {/* Đổi h3 thành h2 */}
            <h2>Queue:</h2>
            {tracks.map((track) => (
              <div key={track.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', padding: '8px 0' }}>
                <span>{track.name}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ 
                    fontWeight: 'bold',
                    // Đổi sang màu đậm hơn (#006600 và #cc0000)
                    color: track.status === 'success' ? '#006600' : track.status === 'error' ? '#cc0000' : '#0000cc'
                  }}>
                    {track.status === 'pending' && '⏳ Chờ'}
                    {track.status === 'loading' && '⚙️ Đang tải...'}
                    {track.status === 'success' && '✅ Xong'}
                    {track.status === 'error' && '❌ Hủy/Lỗi'}
                  </span>
                  {track.status === 'success' && track.buffer && (
                    <button 
                      onClick={() => engine.play(track.buffer!)} 
                      style={{ padding: '2px 8px', cursor: 'pointer' }}
                      aria-label="Phát nhạc"
                    >
                      ▶️ Play
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Đổi h3 thành h2 */}
          <h2>Frequency Visualizer</h2>
          <Visualizer analyser={engine.analyser} />
        </div>
      </div>

      <BeatRecorder engine={engine} />

    </main>
  );
}

export default App;