import { useState } from 'react';
import { AudioTaskQueue } from './audio-queue-controller';

// Khởi tạo instance Queue dùng chung
const queue = new AudioTaskQueue();

interface TrackInfo {
  id: string;
  name: string;
  url: string;
  status: 'pending' | 'loading' | 'success' | 'error';
}

function App() {
  const [tracks, setTracks] = useState<TrackInfo[]>([]);

  // Hàm xử lý khi người dùng chọn file từ máy tính
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newTracks: TrackInfo[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Tạo URL tạm thời cho file trên trình duyệt (blob URL)
      const url = URL.createObjectURL(file); 
      newTracks.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: url,
        status: 'pending',
      });
    }

    setTracks((prev) => [...prev, ...newTracks]);
    
    // Tự động đẩy các file mới vào Queue
    newTracks.forEach(async (track) => {
      // Cập nhật trạng thái thành Đang tải
      setTracks((prev) => prev.map(t => t.id === track.id ? { ...t, status: 'loading' } : t));
      
      try {
        await queue.enqueue(track.url);
        // Tải thành công
        setTracks((prev) => prev.map(t => t.id === track.id ? { ...t, status: 'success' } : t));
      } catch (err) {
        // Lỗi hoặc bị Hủy
        setTracks((prev) => prev.map(t => t.id === track.id ? { ...t, status: 'error' } : t));
      }
    });
  };

  const handleCancel = () => {
    queue.cancelActiveDownload();
    console.log("Đã kích hoạt Abort!");
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Test Audio Queue (FIFO)</h1>
      
      <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px dashed #ccc' }}>
        <label style={{ fontWeight: 'bold' }}>Chọn file nhạc từ máy tính: </label>
        <input type="file" multiple accept="audio/*" onChange={handleFileUpload} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={handleCancel} style={{ padding: '10px', backgroundColor: '#ffcccc', color: 'red', fontWeight: 'bold' }}>
          🛑 HỦY TẢI FILE HIỆN TẠI (Abort)
        </button>
      </div>

      <div style={{ border: '1px solid #333', padding: '1rem', backgroundColor: '#f9f9f9' }}>
        <h3>Danh sách hàng đợi (Queue):</h3>
        {tracks.length === 0 ? <p>Chưa có file nào. Hãy chọn file ở trên.</p> : null}
        
        {tracks.map((track) => (
          <div key={track.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', padding: '8px 0' }}>
            <span>{track.name}</span>
            <span style={{ 
              fontWeight: 'bold',
              color: track.status === 'success' ? 'green' : 
                     track.status === 'error' ? 'red' : 
                     track.status === 'loading' ? 'blue' : 'gray'
            }}>
              {track.status === 'pending' && '⏳ Đang chờ...'}
              {track.status === 'loading' && '⚙️ Đang tải & decode...'}
              {track.status === 'success' && '✅ Xong'}
              {track.status === 'error' && '❌ Lỗi / Đã hủy'}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;