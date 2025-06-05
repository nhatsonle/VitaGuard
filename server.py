# server.py
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_socketio import SocketIO, emit # Import SocketIO và emit
import sqlite3
import time
import os

app = Flask(__name__)
# Cho phép CORS từ mọi nguồn để đơn giản hóa demo.
# Trong môi trường thực tế, bạn nên chỉ định rõ các origin được phép.
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*") # Cho phép CORS cho WebSocket

DATABASE = 'health_monitor.db'
def get_db():
    """Kết nối đến cơ sở dữ liệu SQLite."""
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row # Cho phép truy cập cột bằng tên
    return db

@app.teardown_appcontext
def close_connection(exception):
    """Đóng kết nối cơ sở dữ liệu khi kết thúc request."""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    """Khởi tạo cơ sở dữ liệu và tạo bảng 'alerts' nếu chưa tồn tại."""
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        # Bảng lưu trữ cảnh báo
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alerts1 (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_type TEXT,
                heart_rate INTEGER,
                body_temperature REAL,
                blood_pressure INTEGER,
                timestamp TEXT,
                location TEXT,
                message TEXT,
                is_active INTEGER DEFAULT 1
            )
        ''')
        db.commit()
    print(f"Cơ sở dữ liệu '{DATABASE}' đã được khởi tạo hoặc đã tồn tại. Bảng 'alerts' đã sẵn sàng.")

@app.route('/')
def home():
    """Trang chủ đơn giản để kiểm tra server đang chạy."""
    return "Server giám sát sức khỏe đang chạy!"

@app.route('/api/health_data_or_alert', methods=['POST'])
def receive_health_data_or_alert():
    """
    API endpoint để nhận dữ liệu sức khỏe hoặc cảnh báo từ vòng đeo tay.
    Chỉ lưu trữ vào DB nếu là cảnh báo (is_warning_triggered = True).
    """
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "Dữ liệu JSON không hợp lệ"}), 400

    heart_rate = data.get("heart_rate")
    is_warning_triggered = data.get("is_warning_triggered", False)
    steps = data.get("steps")
    calories = data.get("calories")
    distance = data.get("distance")
    blood_pressure = data.get("blood_pressure")
    body_temperature = data.get("body_temperature")

    current_time = time.strftime("%H:%M:%S %d/%m/%Y")
    
    
    # heart_rate: currentHeartRate,
    #     is_warning_triggered: isWarning,
    #     steps: currentSteps, // Gửi cả các dữ liệu này dù server không lưu tất cả
    #     calories: currentCalories,
    #     distance: currentDistance,
    #     blood_pressure: currentBloodPressure,
    #     body_temperature: currentBodyTemperature

    print(f"Nhận dữ liệu từ vòng tay: Nhịp tim={heart_rate}, Cảnh báo kích hoạt={is_warning_triggered}")

    if is_warning_triggered:
        db = get_db()
        cursor = db.cursor()
        # Nếu có cảnh báo, lưu vào bảng alerts
        alert_message = "CẢNH BÁO NHỊP TIM CAO BẤT THƯỜNG!"
        alert_location = "123 Đường ABC, Quận XYZ" # Vị trí giả định
        try:
            cursor.execute(
                "INSERT INTO alerts1 (alert_type, heart_rate, blood_pressure, body_temperature, timestamp, location, message, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                ("heart_rate_warning", heart_rate, blood_pressure, body_temperature, current_time, alert_location, alert_message, 1)
            )
            db.commit()
            print(">>> CẢNH BÁO NHỊP TIM CAO BẤT THƯỜNG ĐÃ ĐƯỢC KÍCH HOẠT VÀ LƯU TRỮ VÀO DB <<<")
            
        # Gửi cảnh báo real-time qua WebSocket cho tất cả các client
            socketio.emit('new_alert', {
                "is_alert_active": True,
                "heart_rate": heart_rate,
                "blood_pressure": blood_pressure,
                "body_temperature": body_temperature,
                "timestamp": current_time,
                "location": alert_location,
                "message": alert_message
            })
            print(">>> Đã emit sự kiện 'new_alert' qua WebSocket <<<")
        except sqlite3.Error as e:
            db.rollback()
            print(f"Lỗi khi lưu cảnh báo vào DB: {e}")
            return jsonify({"status": "error", "message": f"Lỗi khi lưu cảnh báo: {e}"}), 500
    else:
        print("Dữ liệu sức khỏe bình thường (không phải cảnh báo) đã được nhận và bỏ qua lưu trữ DB.")

    return jsonify({"status": "success", "message": "Dữ liệu đã được nhận và xử lý"}), 200



@app.route('/api/reset_alert', methods=['POST'])
def reset_alert():
    """
    API endpoint để reset trạng thái cảnh báo (đánh dấu cảnh báo mới nhất đang hoạt động là không hoạt động).
    Khi reset, sẽ emit một WebSocket event để thông báo cho các client.
    """
    db = get_db()
    cursor = db.cursor()
    try:
        # Tìm cảnh báo đang hoạt động mới nhất và đánh dấu nó là không hoạt động
        cursor.execute("UPDATE alerts1 SET is_active = 0 WHERE id = (SELECT id FROM alerts1 WHERE is_active = 1 ORDER BY id DESC LIMIT 1)")
        db.commit()
        print("Trạng thái cảnh báo gần nhất đã được RESET trong DB.")
        
        # Gửi thông báo reset qua WebSocket cho tất cả các client
        socketio.emit('alert_reset', {
            "is_alert_active": False,
            "message": "Không có cảnh báo khẩn cấp."
        })
        print(">>> Đã emit sự kiện 'alert_reset' qua WebSocket <<<")

        return jsonify({"status": "success", "message": "Cảnh báo gần nhất đã được reset"}), 200
    except sqlite3.Error as e:
        db.rollback()
        print(f"Lỗi khi reset cảnh báo: {e}")
        return jsonify({"status": "error", "message": f"Lỗi khi reset cảnh báo: {e}"}), 500

@app.route('/api/alert_history', methods=['GET'])
def get_alert_history():
    """
    API endpoint để ứng dụng điện thoại xem lịch sử tất cả các cảnh báo.
    """
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM alerts1 ORDER BY id DESC")
    alerts = cursor.fetchall()
    
    # Chuyển đổi danh sách sqlite3.Row thành danh sách dictionaries
    alert_list = []
    for alert in alerts:
        alert_dict = dict(alert)
        alert_dict['is_active'] = bool(alert_dict['is_active'])
        alert_list.append(alert_dict)
    
    print(f"Đã gửi {len(alert_list)} cảnh báo trong lịch sử.")
    return jsonify(alert_list), 200

# Sự kiện khi một client kết nối WebSocket
@socketio.on('connect')
def test_connect():
    print('Client đã kết nối WebSocket!')
    # Khi client kết nối, đẩy trạng thái cảnh báo hiện tại cho client đó
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM alerts1 WHERE is_active = 1 ORDER BY id DESC LIMIT 1")
    alert = cursor.fetchone()
    
    if alert:
        alert_dict = dict(alert)
        alert_dict['is_active'] = bool(alert_dict['is_active'])
        emit('new_alert', {
            "is_alert_active": alert_dict['is_active'],
            "heart_rate": alert_dict['heart_rate'],
            "blood_pressure": alert_dict['blood_pressure'],
            "body_temperature": alert_dict['body_temperature'],
            "timestamp": alert_dict['timestamp'],
            "location": alert_dict['location'],
            "message": alert_dict['message']
        })
    else:
        emit('alert_reset', {
            "is_alert_active": False,
            "message": "Không có cảnh báo khẩn cấp."
        })

@socketio.on('disconnect')
def test_disconnect():
    print('Client đã ngắt kết nối WebSocket!')


if __name__ == '__main__':
    # Khởi tạo DB khi server bắt đầu
    init_db()
    # Chạy server SocketIO thay vì app.run()
    # Mặc định SocketIO chạy trên cổng 5002
    socketio.run(app, host='0.0.0.0', port=5002, debug=True)