# AI Failure Mode Audit - HW3 Flash Sale Engine

Báo cáo này ghi lại các lỗi (flaws) phổ biến của AI khi sinh code liên quan đến React, Timer và State Machine, đồng thời giải trình cách chúng tôi đã phát hiện và khắc phục.

## 1. Vulnerability: Zero-Drift Timer (Sai lệch thời gian)
- **AI Prompt:** "Viết đồng hồ đếm ngược 3 phút trong React."
- **AI Generated Code (Dự kiến):** AI thường sử dụng `setInterval(() => setTime(t => t - 1000), 1000)`.
- **Risk:** Hàm `setInterval` không chính xác. Nếu tab bị ẩn (background) hoặc main thread bị block, thời gian sẽ bị trôi (drift) dẫn đến sai lệch thực tế (VD: hết 3 phút thực tế nhưng đồng hồ mới báo 2 phút 50s).
- **Detection Method:** So sánh thời gian thực của hệ thống (`Date.now()`) với thời gian hiển thị trên giao diện khi để tab chạy ngầm.
- **Engineering Refactor:** Thay thế bằng `requestAnimationFrame` kết hợp tính delta từ `Date.now()`. 

## 2. Vulnerability: Memory Leak (Rò rỉ bộ nhớ do Event Listener/Animation)
- **AI Prompt:** "Thêm hiệu ứng hoặc vòng lặp quét trạng thái liên tục."
- **AI Generated Code (Dự kiến):** Khởi tạo `requestAnimationFrame` hoặc `setInterval` trong `useEffect` nhưng không return hàm cleanup.
- **Risk:** Khi component unmount (chuyển trang), vòng lặp vẫn tiếp tục chạy ngầm, gọi `setState` trên một component đã bị huỷ, gây crash app hoặc ăn RAM.
- **Detection Method:** Sử dụng React StrictMode hoặc mở tab Performance/Memory trong DevTools để kiểm tra rác.
- **Engineering Refactor:** Luôn return hàm `cancelAnimationFrame(rafId)` hoặc `clearInterval` trong `useEffect`.

## 3. Vulnerability: State Thrashing (Giật lag do re-render liên tục)
- **AI Prompt:** "Cập nhật thời gian đếm ngược mỗi mili-giây lên UI."
- **AI Generated Code (Dự kiến):** Gọi `setState` bên trong vòng lặp `requestAnimationFrame` 60 lần/giây.
- **Risk:** Gây hao tốn tài nguyên CPU khủng khiếp, làm ứng dụng bị giật lag (drop frame).
- **Detection Method:** Dùng React DevTools Profiler để xem tần suất re-render.
- **Engineering Refactor:** Chỉ gọi `setState` khi giá trị thực sự thay đổi (VD: chỉ update khi số giây thay đổi, hoặc dùng `useRef` cho các biến không cần render ra UI).