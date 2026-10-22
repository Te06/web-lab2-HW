import { useEffect, useRef } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

export function Visualizer({ analyser }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mảng chứa dữ liệu tần số (bằng 1/2 fftSize)
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationFrameId: number;

    const draw = () => {
      // 1. Gọi lại hàm draw ở frame tiếp theo (tạo vòng lặp 60fps)
      animationFrameId = requestAnimationFrame(draw);

      // 2. Lấy dữ liệu tần số hiện tại
      analyser.getByteFrequencyData(dataArray);

      // 3. Xoá canvas trước khi vẽ mới
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 4. Vẽ các cột sóng âm
      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height; // Chuẩn hoá chiều cao

        // Màu sắc cột thay đổi theo âm lượng
        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        
        // Vẽ từ dưới lên
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    // Bắt đầu vẽ
    draw();

    // Dọn dẹp khi component unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyser]);

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={200} 
      style={{ border: '1px solid #333', background: '#111', borderRadius: '8px' }} 
    />
  );
}