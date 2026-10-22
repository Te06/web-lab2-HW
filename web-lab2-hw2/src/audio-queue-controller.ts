import type { AudioTask } from './types';

export class AudioTaskQueue {
  private queue: AudioTask[] = [];
  private isProcessing = false;
  private activeController: AbortController | null = null;
  private audioCtx: AudioContext; // Động cơ xử lý âm thanh của trình duyệt

  constructor() {
    // Khởi tạo Web Audio API Context
    this.audioCtx = new AudioContext();
  }

  async enqueue(trackUrl: string): Promise<AudioBuffer> {
    const controller = new AbortController();
    
    return new Promise((resolve, reject) => {
      // Đẩy task vào cuối hàng đợi
      this.queue.push({ trackUrl, controller, resolve, reject });
      // Kích hoạt tiến trình xử lý
      this.processNext();
    });
  }

  // Hàm xử lý cốt lõi (Chạy ngầm)
  private async processNext() {
    // 1. Nếu đang có bài khác chạy, hoặc hàng đợi rỗng -> Dừng lại
    if (this.isProcessing || this.queue.length === 0) return;

    // 2. Đánh dấu bắt đầu xử lý
    this.isProcessing = true;

    // 3. Lấy bài hát đầu tiên ra khỏi hàng đợi (FIFO)
    const task = this.queue.shift();
    if (!task) {
      this.isProcessing = false;
      return;
    }

    // Gán controller hiện tại để có thể hủy nếu cần
    this.activeController = task.controller;

    try {
      // 4. Tải file nhạc (Gắn signal để có thể Abort giữa chừng)
      const response = await fetch(task.trackUrl, { signal: task.controller.signal });
      if (!response.ok) throw new Error('Lỗi mạng hoặc không tìm thấy file');

      // 5. Chuyển dữ liệu tải về thành dạng nhị phân thô (ArrayBuffer)
      const arrayBuffer = await response.arrayBuffer();

      // 6. Giải mã ArrayBuffer thành dữ liệu âm thanh (AudioBuffer)
      const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);

      // 7. Trả kết quả thành công cho bên gọi hàm enqueue
      task.resolve(audioBuffer);
    } catch (error) {
      // 8. Bắt lỗi (bao gồm cả lỗi do bị Abort)
      task.reject(error);
    } finally {
      // 9. BẤT KỂ THÀNH CÔNG HAY THẤT BẠI, phải dọn dẹp và chạy bài tiếp theo
      this.activeController = null;
      this.isProcessing = false;
      this.processNext(); // Đệ quy gọi bài tiếp theo trong hàng đợi
    }
  }

  // Hàm bổ sung tính năng Hủy tải (Memory Safety)
  public cancelActiveDownload() {
    if (this.activeController) {
      this.activeController.abort(); // Kích hoạt phanh khẩn cấp
      console.log("Đã hủy tiến trình tải hiện tại!");
    }
  }
}