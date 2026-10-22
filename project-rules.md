# Lab 2 - Project Rules & Engineering Standards

## 1. Workflow làm việc (Bắt buộc)
- **Quy trình:** Code -> Kiểm thử (Terminal/DevTools) -> Commit -> Push -> Kiểm tra trên GitHub -> Vẽ WBS -> Chụp Screenshot.
- Tuyệt đối không commit gộp nhiều tính năng vào 1 commit.
- Không sử dụng `git reset --hard` hoặc force push làm mất lịch sử.
- Mọi commit phải tuân theo chuẩn Conventional Commits (VD: `feat:`, `fix:`, `chore:`, `docs:`).

## 2. Quy tắc Code (Coding Rules)
- **Semantic HTML:** Tuyệt đối không dùng "div-soup". Bắt buộc dùng các thẻ ngữ nghĩa như `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<main>`, `<button>`.
- **Accessibility (A11y):** Mọi nút bấm chỉ chứa icon phải có `aria-label`. Màu sắc phải đạt chuẩn tương phản WCAG AA (4.5:1).
- **TypeScript:** Không dùng `any` bừa bãi. Bắt buộc định nghĩa Interface/Type cho Props và State.
- **Memory Safety:** Các event listener (`addEventListener`), vòng lặp animation (`requestAnimationFrame`), hoặc `setInterval` bắt buộc phải có hàm `cleanup` trong `useEffect`.
- **State Management:** Không mutate state trực tiếp. Sử dụng `useRef` cho các giá trị không cần render ra UI (tránh state thrashing).