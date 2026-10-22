export class AudioEngine {
  private ctx: AudioContext;
  public analyser: AnalyserNode;

  constructor() {
    this.ctx = new AudioContext();
    this.analyser = this.ctx.createAnalyser();
    // Slide yêu cầu FFT 256 hoặc 512
    this.analyser.fftSize = 256; 
    
    // Kết nối Analyser vào loa (để nghe được nhạc)
    this.analyser.connect(this.ctx.destination);
  }

  public play(buffer: AudioBuffer) {
    // Mỗi lần phát, tạo một SourceNode mới để cho phép đè tiếng (Polyphonic)
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.analyser);
    source.start(0);

    // MEMORY SAFETY: Dọn dẹp khi phát xong
    source.onended = () => {
      source.disconnect();
      console.log("🧹 Đã dọn dẹp AudioBufferSourceNode thành công!");
    };
  }
}