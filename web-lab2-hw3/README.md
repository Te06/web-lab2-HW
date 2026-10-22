# HW3 - Flash Sale Engine

Dự án giả lập hệ thống Flash Sale chịu tải cao với các tính năng:
- **Zero-Drift Timer:** Đếm ngược chính xác bằng `requestAnimationFrame` và `Date.now()`.
- **Finite State Machine (FSM):** Quản lý trạng thái kho hàng (AVAILABLE, LOCKED, SOLD).
- **Optimistic Inventory Lock:** Giữ hàng trong 5 giây, tự động giải phóng nếu không thanh toán.

## Cài đặt và Chạy
```bash
npm install
npm run dev