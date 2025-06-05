Dự án Giám sát Sức khỏe Thông minh
1. Tổng quan
Dự án này là một hệ thống demo mô phỏng vòng đeo tay thông minh và ứng dụng di động, chuyên về phát hiện và cảnh báo sức khỏe real-time. Nó giúp minh họa cách dữ liệu cảm biến được chuyển đến server, lưu trữ, và đẩy cảnh báo tức thời đến ứng dụng di động của người thân. Dự án cũng tích hợp AI (LLM) để cung cấp lời khuyên sức khỏe và gợi ý hoạt động.
2. Tính năng nổi bật
Vòng đeo tay giả lập:
Giả lập thu thập dữ liệu nhịp tim, vận động, bước chân, calories, quãng đường.
Kích hoạt cảnh báo đột quỵ dựa trên dữ liệu bất thường.
Sử dụng AI (Gemini API) để đưa ra lời khuyên sức khỏe và gợi ý hoạt động.
Server Backend (Flask):
Nhận dữ liệu/cảnh báo từ vòng tay (REST API).
Lưu trữ cảnh báo vào SQLite.
Đẩy cảnh báo real-time tới app điện thoại (WebSocket).
Cung cấp lịch sử cảnh báo (REST API).
Ứng dụng di động giả lập (Web):
Hiển thị cảnh báo real-time từ server.
Hiển thị dữ liệu sức khỏe giả lập riêng.
Xem lịch sử cảnh báo đã lưu.
3. Kiến trúc
Sử dụng kiến trúc Client-Server:
Frontend: Wearables (Vòng tay), App (App điện thoại)
Backend: server.py (Flask)
Database: health_monitor.db (SQLite)
AI: Gemini API



4. Cách cài đặt & chạy
Backend:
Cài đặt Python 3, pip.
pip install Flask Flask-Cors Flask-SocketIO eventlet
Chạy: python server.py
Frontend:
Mở Wearables/index.html trong trình duyệt.
Mở App/index.html trong một tab/cửa sổ khác.
5. Hướng dẫn sử dụng
Kích hoạt cảnh báo: Trên giao diện vòng tay, nhấn + -> Kích hoạt Cảnh báo Đột quỵ. App điện thoại sẽ nhận ngay lập tức và hiển thị trong lịch sử.
Lời khuyên AI: Trên vòng tay, nhấn + -> ✨ Nhận lời khuyên sức khỏe hoặc ✨ Gợi ý hoạt động. Nhấn ra ngoài để ẩn.
Dữ liệu App: Trên app điện thoại, nhấn Giả lập Dữ liệu Mới để xem các chỉ số da/mồ hôi thay đổi.
Đặt lại cảnh báo: Trên app điện thoại, nhấn Đặt lại Cảnh báo Hiện tại.
6. Công nghệ
Python, Flask, Flask-SocketIO, SQLite, HTML5, CSS3 (Tailwind CSS), JavaScript, Socket.IO Client, Gemini API.
7. Tác giả
Lê Nhật Sơn - K67 Hedspi HUST
