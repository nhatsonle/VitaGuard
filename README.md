Dự án Giám sát Sức khỏe Thông minh (Smart Health Monitoring)
1. Giới thiệu
Dự án "Giám sát Sức khỏe Thông minh" là một hệ thống demo mô phỏng chức năng của một vòng đeo tay thông minh và ứng dụng di động đi kèm. Hệ thống này được thiết kế để phát hiện các biến động sức khỏe bất thường (ví dụ: nhịp tim tăng cao, vận động bất thường) và tự động gửi cảnh báo khẩn cấp đến ứng dụng điện thoại của người thân theo thời gian thực. Ngoài ra, ứng dụng di động còn cho phép xem lại lịch sử các cảnh báo và hiển thị dữ liệu sức khỏe tổng quan giả lập.

Mục tiêu của dự án là minh họa luồng dữ liệu từ thiết bị đeo tay đến server và đến ứng dụng di động, đồng thời trình bày cách tích hợp API mô hình ngôn ngữ lớn (LLM) để cung cấp các lời khuyên sức khỏe thông minh và gợi ý hoạt động.

2. Tính năng chính
Giả lập vòng đeo tay thông minh:

Giả lập thu thập dữ liệu nhịp tim và vận động.

Giả lập kích hoạt cảnh báo đột quỵ khi phát hiện nhịp tim và/hoặc vận động bất thường.

Gửi dữ liệu cảnh báo đến server thông qua REST API.

Tích hợp LLM để cung cấp lời khuyên sức khỏe tổng quát hoặc lời khuyên khẩn cấp.

Tích hợp LLM để đưa ra gợi ý hoạt động thể chất dựa trên dữ liệu bước chân/quãng đường.

Server Backend (Flask):

Nhận dữ liệu và cảnh báo từ vòng đeo tay qua REST API.

Lưu trữ các bản ghi cảnh báo vào cơ sở dữ liệu SQLite.

Sử dụng WebSocket để đẩy (push) cảnh báo real-time đến ứng dụng điện thoại khi có sự kiện.

Cung cấp REST API để ứng dụng điện thoại truy vấn lịch sử cảnh báo.

Cung cấp REST API để đặt lại trạng thái cảnh báo hiện tại.

Ứng dụng di động (giả lập trên web):

Hiển thị cảnh báo sức khỏe khẩn cấp real-time từ server thông qua WebSocket.

Hiển thị dữ liệu sức khỏe tổng quan (mồ hôi, da) được giả lập trực tiếp trên ứng dụng.

Xem lịch sử chi tiết của tất cả các cảnh báo đã được lưu trữ trên server.

Chức năng đặt lại cảnh báo hiện tại.

3. Kiến trúc hệ thống
Dự án này tuân theo kiến trúc Client-Server với các thành phần chính:

Vòng đeo tay thông minh (Frontend 1 - smart_bracelet_mockup.html): Đại diện cho thiết bị thu thập dữ liệu và gửi thông tin. Giao tiếp với Backend thông qua HTTP POST.

Server Backend (Flask - server.py): Lõi của hệ thống, xử lý logic, lưu trữ dữ liệu cảnh báo và điều phối thông tin giữa các thành phần.

Ứng dụng di động (Frontend 2 - mobile_app_mockup.html): Giao diện người dùng cho người thân, nhận cảnh báo real-time qua WebSocket và truy vấn lịch sử cảnh báo qua REST API.

Cơ sở dữ liệu (SQLite - health_monitor.db): Lưu trữ các bản ghi cảnh báo.

API LLM (Gemini API): Được gọi trực tiếp từ giao diện vòng đeo tay để cung cấp lời khuyên sức khỏe và gợi ý hoạt động.

+-------------------+       HTTP POST       +-------------------+       WebSocket       +---------------------+
| Vòng đeo tay      |---------------------->| Flask Backend     |<--------------------->| Ứng dụng di động    |
| (smart_bracelet.html) |                 | (server.py)       | (Real-time Alerts)  | (mobile_app.html)   |
| - Giả lập cảm biến |                     | - Nhận data/alerts|                     | - Nhận alerts REAL-TIME |
| - Gửi cảnh báo    |                     | - Lưu Alerts DB   |                     | - Hiển thị data giả lập |
| - Gọi LLM Insight |                     | - Push alerts WS  |       HTTP GET      | - Xem Alert History |
+-------------------+                     | - Serve API       |<---------------------+ - Reset Alert       |
          |                               | - Reset Alert API | (Alert History)     |                     |
          |       HTTP POST (LLM)         +-------------------+                     +---------------------+
          +----------------------------------->|                 |
                                             | SQLite Database   |
                                             | (health_monitor.db)|
                                             +-------------------+

4. Cách cài đặt và chạy
4.1. Yêu cầu
Python 3.8+

pip (Trình quản lý gói của Python)

Trình duyệt web hiện đại (Chrome, Firefox, Edge, Safari)

4.2. Cài đặt và chạy Backend Server (Flask)
Tải xuống dự án: Tải xuống hoặc clone repository chứa các tệp server.py, smart_bracelet_mockup.html, mobile_app_mockup.html.

Mở Terminal/Command Prompt: Điều hướng đến thư mục gốc của dự án.

Cài đặt các thư viện Python cần thiết:

pip install Flask Flask-Cors Flask-SocketIO eventlet

Chạy server:

python server.py

Server sẽ khởi chạy trên http://localhost:5000/. Lần đầu chạy, nó sẽ tạo một tệp cơ sở dữ liệu health_monitor.db trong cùng thư mục.
Để kiểm tra server đã chạy, bạn có thể truy cập http://localhost:5000/ trên trình duyệt.

4.3. Chạy Giao diện người dùng (Frontend - Web Mockups)
Vì đây là các tệp HTML thuần, bạn có thể mở chúng trực tiếp trong trình duyệt:

Mở tệp smart_bracelet_mockup.html trong một tab/cửa sổ trình duyệt.

Mở tệp mobile_app_mockup.html trong một tab/cửa sổ trình duyệt khác.

Lưu ý: Nếu bạn gặp lỗi CORS (Cross-Origin Resource Sharing) khi chạy các tệp HTML cục bộ, hãy đảm bảo Flask-CORS và cors_allowed_origins trong SocketIO đã được cấu hình đúng như trong mã nguồn.

5. Cách sử dụng
Sau khi server Flask đang chạy và cả hai tệp HTML đã được mở trong trình duyệt:

5.1. Kịch bản 1: Cảnh báo Đột quỵ Real-time
Trên giao diện Vòng đeo tay (smart_bracelet_mockup.html):

Bạn sẽ thấy dữ liệu nhịp tim và các chỉ số khác được giả lập và thay đổi định kỳ.

Nhấn nút + ở góc dưới bên phải để mở overlay hành động.

Nhấn nút Kích hoạt Cảnh báo Đột quỵ.

Vòng đeo tay sẽ giả lập dữ liệu bất thường (nhịp tim cao, vận động bất thường) và gửi cảnh báo đến server.

Bạn sẽ thấy thông báo "!!! Đang gửi CẢNH BÁO KHẨN CẤP !!!" trên vòng tay.

Trên giao diện Ứng dụng di động (mobile_app_mockup.html):

Ngay lập tức, ứng dụng sẽ nhận được cảnh báo qua WebSocket và hiển thị thông báo khẩn cấp !!! CẢNH BÁO ĐỘT QUỴ KHẨN CẤP !!! với chi tiết dữ liệu.

Kéo xuống phần Lịch sử Cảnh báo, bạn sẽ thấy cảnh báo vừa rồi đã được thêm vào danh sách và có thể được đánh dấu là (Đang hoạt động).

5.2. Kịch bản 2: Xem lịch sử cảnh báo
Trên giao diện Ứng dụng di động (mobile_app_mockup.html):

Kéo xuống phần Lịch sử Cảnh báo.

Mỗi khi có cảnh báo mới được kích hoạt từ vòng tay hoặc bạn nhấn nút Đặt lại Cảnh báo Hiện tại, danh sách lịch sử này sẽ được cập nhật.

Bạn có thể nhấn nút Tải lại Lịch sử Cảnh báo để cập nhật thủ công từ server.

5.3. Kịch bản 3: Gợi ý hoạt động & Lời khuyên sức khỏe từ AI (trên Vòng tay)
Trên giao diện Vòng đeo tay (smart_bracelet_mockup.html):

Nhấn nút + ở góc dưới bên phải để mở overlay hành động.

Nhấn nút ✨ Nhận lời khuyên sức khỏe để nhận lời khuyên chung về sức khỏe dựa trên nhịp tim hiện tại.

Nhấn nút ✨ Gợi ý hoạt động để nhận gợi ý bài tập dựa trên số bước và quãng đường đã đi.

Lời khuyên/gợi ý sẽ hiển thị ở cuối màn hình vòng tay. Bạn có thể nhấn vào khu vực hiển thị lời khuyên để ẩn nó đi.

(Nếu bạn kích hoạt cảnh báo đột quỵ, lời khuyên khẩn cấp từ AI sẽ tự động hiển thị).

5.4. Kịch bản 4: Dữ liệu sức khỏe giả lập trên App
Trên giao diện Ứng dụng di động (mobile_app_mockup.html):

Kéo xuống phần Phân tích Dữ liệu Mồ hôi & Da (Giả lập).

Nhấn nút Giả lập Dữ liệu Mới & Cập nhật Thống kê nhiều lần.

Bạn sẽ thấy các giá trị độ ẩm da, độ mặn mồ hôi thay đổi, biểu đồ xu hướng được cập nhật, và đánh giá nguy cơ bệnh tiềm ẩn cũng thay đổi theo dữ liệu giả định.

5.5. Đặt lại cảnh báo hiện tại
Trên giao diện Ứng dụng di động (mobile_app_mockup.html):

Nhấn nút Đặt lại Cảnh báo Hiện tại.

Trạng thái cảnh báo hiện tại trên ứng dụng sẽ trở lại bình thường.

Cảnh báo trong lịch sử cũng sẽ được cập nhật trạng thái (Đang hoạt động) thành không hoạt động.

6. Công nghệ sử dụng
Backend:

Python 3

Flask (Web framework)

Flask-CORS (Xử lý Cross-Origin Resource Sharing)

Flask-SocketIO (WebSocket integration)

Eventlet (WebSocket server, được khuyến nghị bởi Flask-SocketIO)

SQLite3 (Cơ sở dữ liệu nhẹ)

Frontend (Web Mockups):

HTML5

CSS3 (Tailwind CSS cho styling nhanh chóng)

JavaScript (ES6+)

Socket.IO client library (Để kết nối WebSocket)

Gemini API (Để gọi LLM)

7. Cải tiến tiềm năng
Tích hợp cảm biến thực tế: Thay thế dữ liệu giả lập trên vòng tay bằng dữ liệu từ cảm biến thực tế (ví dụ: thông qua một ứng dụng Android/Wear OS thật hoặc thiết bị IoT).

Xác thực người dùng: Thêm hệ thống đăng nhập/đăng ký để quản lý người dùng và dữ liệu của họ.

Backend nâng cao: Di chuyển dữ liệu từ SQLite sang một cơ sở dữ liệu mạnh mẽ hơn như PostgreSQL, MongoDB cho môi trường sản phẩm.

Real-time cho dữ liệu sức khỏe khác: Sử dụng WebSocket để đẩy cả dữ liệu nhịp tim, bước chân... real-time từ vòng tay lên app điện thoại (hiện tại chỉ cảnh báo là real-time).

Push Notifications thực tế: Sử dụng Firebase Cloud Messaging (FCM) hoặc các dịch vụ push notification khác cho ứng dụng điện thoại gốc (Android/iOS) thay vì chỉ hiển thị trên trình duyệt.

Biểu đồ nâng cao: Sử dụng các thư viện biểu đồ JavaScript chuyên nghiệp (ví dụ: Chart.js, D3.js) để hiển thị dữ liệu sức khỏe chi tiết hơn.

Phân tích LLM nâng cao: Cung cấp nhiều loại lời khuyên, phân tích chuyên sâu hơn từ LLM, hoặc thậm chí khả năng trò chuyện với AI.

Mở rộng tính năng: Thêm các tính năng như thiết lập ngưỡng cảnh báo, quản lý nhóm người thân, theo dõi vị trí GPS, v.v.

8. Tác giả
Lê Nhật Sơn - K67 Hedspi HUST
