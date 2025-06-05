# Dự án Giám sát Sức khỏe Thông minh
# Health Monitoring System
## Tổng quan
- Dự án này là một hệ thống demo mô phỏng vòng đeo tay thông minh và ứng dụng di động, chuyên về phát hiện và cảnh báo sức khỏe real-time. 
- Nó giúp minh họa cách dữ liệu cảm biến được chuyển đến server, lưu trữ, và đẩy cảnh báo tức thời đến ứng dụng di động của người thân. 
- Dự án cũng tích hợp AI (LLM) để cung cấp lời khuyên sức khỏe và gợi ý hoạt động.

## Tính năng nổi bật
- Vòng đeo tay giả lập:
  - Giả lập thu thập dữ liệu nhịp tim, vận động, bước chân, calories, quãng đường.
  - Kích hoạt cảnh báo đột quỵ dựa trên dữ liệu bất thường.
  - Sử dụng AI (Gemini API) để đưa ra lời khuyên sức khỏe và gợi ý hoạt động.
- ## Server Backend (Flask):
  - Nhận dữ liệu/cảnh báo từ vòng tay (REST API).
  - Lưu trữ cảnh báo vào SQLite.
  - Đẩy cảnh báo real-time tới app điện thoại (WebSocket).
  - Cung cấp lịch sử cảnh báo (REST API).
## Ứng dụng di động giả lập (Web):
  - Hiển thị cảnh báo real-time từ server.
  - Hiển thị dữ liệu sức khỏe giả lập riêng.
  - Xem lịch sử cảnh báo đã lưu.
## Kiến trúc
- Sử dụng kiến trúc Client-Server:
- Frontend: Wearables (Vòng tay), App (App điện thoại)
- Backend: server.py (Flask)
- Database: health_monitor.db (SQLite)
- AI: Gemini API

## Cách cài đặt & chạy
- ### Backend:
- Cài đặt Python 3, pip.
```bash
pip install Flask Flask-Cors Flask-SocketIO eventlet
```
- Chạy: 
```bash
python server.py
```
- ### Frontend:
   - Mở Wearables/index.html trong trình duyệt.
   - Mở App/index.html trong một tab/cửa sổ khác.

## Hướng dẫn sử dụng
- Kích hoạt cảnh báo: Trên giao diện vòng tay, cảnh báo đột quỵ sẽ được tạo tự động (random). App điện thoại sẽ nhận ngay lập tức và hiển thị trong lịch sử.
- Lời khuyên AI: Trên vòng tay, nhấn + -> ✨ Nhận lời khuyên sức khỏe hoặc ✨ Gợi ý hoạt động. Nhấn ra ngoài để ẩn.
- Dữ liệu App: 
  - Trên app điện thoại, nhấn Giả lập Dữ liệu Mới để xem các chỉ số da/mồ hôi thay đổi. 
  - Nhấn Lấy Dữ liệu Mới để cập nhật dữ liệu mới từ server. 
  - Chọn Xem Ý Kiến Chuyên Gia để nhận lời khuyên y tế từ AI. 
  - Chọn Liên Hệ Với Bệnh Viện Gần Nhất trong trường hợp khẩn cấp.
- Đặt lại cảnh báo: Trên app điện thoại, nhấn Đặt lại Cảnh báo Hiện tại.

## Công nghệ
Python, Flask, Flask-SocketIO, SQLite, HTML5, CSS3 (Tailwind CSS), JavaScript, Socket.IO Client, Gemini API.

## Tác giả
Lê Nhật Sơn - K67 Hedspi HUST
