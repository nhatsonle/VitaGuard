 // Địa chỉ của server Flask
        const FLASK_SERVER_URL = 'http://localhost:5002';

        // Khởi tạo kết nối Socket.IO
        const socket = io(FLASK_SERVER_URL);

        // --- Phần Cảnh báo Sức khỏe Hiện tại ---
        const alertStatus = document.getElementById('alertStatus');
        const alertDetails = document.getElementById('alertDetails');
        const warningInfo = document.getElementById('warningInfo');
        const resetAlertBtn = document.getElementById('resetAlertBtn');
        const getHelpBtn = document.getElementById('helpButton');

        // Hàm cập nhật trạng thái cảnh báo trên UI điện thoại
        function updateAlertUI(data) {
            if (data.is_alert_active) {
                alertStatus.textContent = '!!! CẢNH BÁO ĐỘT QUỴ KHẨN CẤP !!!';
                alertStatus.classList.remove('text-gray-600');
                alertStatus.classList.add('text-2xl', 'font-bold', 'text-red-800', 'mb-2');

                warningInfo.innerHTML = `
                    Nhịp tim: <span class="font-bold">${data.heart_rate} bpm</span><br>
                    Vận động: <span class="font-bold">${data.movement_status}</span><br>
                    Thời gian: <span class="font-bold">${data.timestamp}</span><br>
                    Vị trí: <span class="font-bold">${data.location}</span><br>
                `;
                alertDetails.classList.remove('hidden');
            } else {
                alertStatus.textContent = 'Trạng thái: Bình thường';
                alertStatus.classList.remove('text-red-600', 'font-extrabold', 'text-3xl');
                alertStatus.classList.add('text-gray-600');
                alertDetails.classList.add('hidden');
                warningInfo.innerHTML = '';
            }
        }

        // Lắng nghe sự kiện 'new_alert' từ server WebSocket
        socket.on('new_alert', (data) => {
            console.log('[Socket.IO] Đã nhận cảnh báo mới:', data);
            updateAlertUI(data);
            fetchAlertHistory(); // Cập nhật lịch sử cảnh báo khi có cảnh báo mới
        });

        // Lắng nghe sự kiện 'alert_reset' từ server WebSocket
        socket.on('alert_reset', (data) => {
            console.log('[Socket.IO] Đã nhận thông báo reset cảnh báo:', data);
            updateAlertUI(data); // Đặt lại UI cảnh báo hiện tại
            fetchAlertHistory(); // Cập nhật lịch sử cảnh báo khi reset
        });

        // Hàm gửi yêu cầu reset cảnh báo hiện tại đến server (vẫn là REST API)
        async function resetAlertOnServer() {
            try {
                const response = await fetch(`${FLASK_SERVER_URL}/api/reset_alert`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const result = await response.json();
                console.log(`[Điện thoại -> Server (REST)] Phản hồi reset cảnh báo: ${result.message}`);
                // UI sẽ được cập nhật thông qua sự kiện 'alert_reset' từ WebSocket
            } catch (error) {
                console.error('[Điện thoại -> Server (REST)] Lỗi khi reset cảnh báo:', error);
            }
        }

        resetAlertBtn.addEventListener('click', resetAlertOnServer);


        // --- Phần Thống kê Dữ liệu Sức khỏe (Giả lập trên App) ---
        const skinMoistureDisplay = document.getElementById('skinMoistureDisplay');
        const sweatSalinityDisplay = document.getElementById('sweatSalinityDisplay');
        const trendChart = document.getElementById('trendChart');
        const riskAssessmentDisplay = document.getElementById('riskAssessmentDisplay');
        const simulateNewDataBtn = document.getElementById('simulateNewDataBtn');

        let healthDataHistory = [];
        const MAX_HISTORY = 5;

        function generateRandomHealthData() {
            const moisture = Math.floor(Math.random() * (95 - 50 + 1)) + 50;
            const salinity = (Math.random() * (1.2 - 0.3) + 0.3).toFixed(2);
            return { moisture, salinity };
        }

        function updateHealthDataUI() {
            if (healthDataHistory.length === 0) {
                skinMoistureDisplay.textContent = '--%';
                sweatSalinityDisplay.textContent = '--%';
                riskAssessmentDisplay.textContent = 'Đang chờ dữ liệu...';
                trendChart.innerHTML = '';
                return;
            }

            const latestData = healthDataHistory[healthDataHistory.length - 1];
            skinMoistureDisplay.textContent = `${latestData.moisture}%`;
            sweatSalinityDisplay.textContent = `${latestData.salinity}%`;

            trendChart.innerHTML = '';
            healthDataHistory.forEach(data => {
                const barHeight = (data.moisture / 100) * 80;
                const bar = document.createElement('div');
                bar.className = 'w-4 bg-blue-400 rounded-t-sm transition-all duration-500 ease-out';
                bar.style.height = `${barHeight}px`;
                trendChart.appendChild(bar);
            });

            let risk = 'Bình thường';
            let riskColor = 'text-green-800';

            const avgMoisture = healthDataHistory.reduce((sum, d) => sum + d.moisture, 0) / healthDataHistory.length;
            const avgSalinity = healthDataHistory.reduce((sum, d) => sum + parseFloat(d.salinity), 0) / healthDataHistory.length;

            if (avgMoisture < 60) {
                risk = 'Nguy cơ mất nước nhẹ';
                riskColor = 'text-yellow-800';
            }
            if (avgMoisture < 50) {
                risk = 'Nguy cơ da khô, nứt nẻ';
                riskColor = 'text-orange-800';
            }
            if (avgSalinity > 1.0) {
                risk = 'Nguy cơ rối loạn điện giải';
                riskColor = 'text-red-800';
            }

            riskAssessmentDisplay.textContent = risk;
            riskAssessmentDisplay.className = `text-lg font-bold ${riskColor}`;
        }

        function simulateNewData() {
            const newData = generateRandomHealthData();
            healthDataHistory.push(newData);
            if (healthDataHistory.length > MAX_HISTORY) {
                healthDataHistory.shift();
            }
            updateHealthDataUI();
            console.log(`[Điện thoại] Đã giả lập dữ liệu mới: Độ ẩm da ${newData.moisture}%, Độ mặn mồ hôi ${newData.salinity}%.`);
        }

        simulateNewDataBtn.addEventListener('click', simulateNewData);


        // --- Phần Lịch sử Cảnh báo (Từ Server) ---
        const alertHistoryList = document.getElementById('alertHistoryList');
        const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');

        const apiKey = 'AIzaSyAeWAMEBjOCwAkKaPlfkV4-4SnxLh05wYQ';

        // Hàm fetch lịch sử cảnh báo từ server và hiển thị (vẫn là REST API)
        async function fetchAlertHistory() {
            try {
                const response = await fetch(`${FLASK_SERVER_URL}/api/alert_history`);
                const alerts = await response.json();
                console.log('[Điện thoại <- Server (REST)] Lịch sử cảnh báo:', alerts);

                alertHistoryList.innerHTML = '';

                if (alerts.length === 0) {
                    alertHistoryList.innerHTML = '<p class="text-gray-500 text-center">Không có cảnh báo nào trong lịch sử.</p>';
                    return;
                }

                alerts.forEach(alert => {
                    const alertItem = document.createElement('div');
                    alertItem.className = `p-3 rounded-lg shadow-sm mb-2 ${alert.is_active ? 'bg-red-100 alert-item border-red-500' : 'bg-gray-50 border-gray-300'}`;
                    
                    alertItem.innerHTML = `
                        <p class="font-bold ${alert.is_active ? 'text-red-700' : 'text-gray-700'}">${alert.message} ${alert.is_active ? '(Đang hoạt động)' : ''}</p>
                        <p class="text-sm text-gray-600">Nhịp tim: ${alert.heart_rate} bpm</p>
                        <p class="text-sm text-gray-600">Vận động: ${alert.movement_status}</p>
                        <p class="text-xs text-gray-500">Thời gian: ${alert.timestamp}</p>
                        <p class="text-xs text-gray-500">Vị trí: ${alert.location}</p>
                    `;
                    alertHistoryList.appendChild(alertItem);
                });
            } catch (error) {
                console.error('[Điện thoại <- Server (REST)] Lỗi khi lấy lịch sử cảnh báo:', error);
                alertHistoryList.innerHTML = '<p class="text-red-500 text-center">Lỗi tải lịch sử cảnh báo.</p>';
            }
        }

            async function getHealthInsightFromLLM() {
            // Hiện backdrop và container
            insightBackdrop.classList.remove('hidden');
            llmInsightContainer.classList.remove('hidden');
            llmInsightText.textContent = '';
            llmLoading.classList.remove('hidden'); // Hiển thị loading spinner

            let prompt = 'Độ ẩm trên da của tôi là ' + generateRandomHealthData().moisture + '%. Độ mặn mồ hôi của tôi là ' + generateRandomHealthData().salinity + '%. Hãy cho tôi một lời khuyên sức khỏe ngắn gọn, tích cực và dễ hiểu (tối đa 50 từ) cho một người đeo vòng tay thông minh. Hãy ngắt câu trả lời của bạn thành các đoạn nhỏ, mỗi đoạn không quá 20 từ.';

            let chatHistory = [];
            chatHistory.push({role: 'user', parts: [{text: prompt}]});
            const payload = {contents: chatHistory};
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            try {
                const response = await fetch(apiUrl , {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                });

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                            
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                llmInsightText.textContent = text;
            } else {
                llmInsightText.textContent = "Không thể lấy lời khuyên từ AI. Vui lòng thử lại.";
                console.error("Unexpected LLM response structure:", result);
            }
            } catch (error) {
            llmInsightText.textContent = "Đã xảy ra lỗi khi kết nối AI. Vui lòng kiểm tra kết nối mạng.";
            console.error("Error fetching LLM insight:", error);
            } finally {
            llmLoading.classList.add('hidden'); // Ẩn loading spinner
            }
            }

     

        async function deleteAlertHistory() {
            alertHistoryList.innerHTML = '';

        }
        clearHistoryBtn.addEventListener('click', deleteAlertHistory);

        refreshHistoryBtn.addEventListener('click', fetchAlertHistory);
        getHelpBtn.addEventListener('click', getHealthInsightFromLLM);

        // Thêm biến để tham chiếu đến backdrop
        const insightBackdrop = document.createElement('div');
        insightBackdrop.id = 'insightBackdrop';
        insightBackdrop.className = 'fixed top-0 left-0 right-0 bottom-0 w-full h-full hidden';
        document.body.appendChild(insightBackdrop);

        // Khởi tạo dữ liệu ban đầu và thiết lập WebSocket khi tải trang
        document.addEventListener('DOMContentLoaded', () => {
            // Giả lập một vài dữ liệu ban đầu cho phần thống kê sức khỏe trên app
            for (let i = 0; i < MAX_HISTORY - 2; i++) {
                healthDataHistory.push(generateRandomHealthData());
            }
            updateHealthDataUI();

            // Khi kết nối WebSocket được thiết lập, server sẽ gửi trạng thái cảnh báo ban đầu
            // Không cần polling setInterval nữa
            
            // Tải lịch sử cảnh báo khi tải trang
            fetchAlertHistory();
        });