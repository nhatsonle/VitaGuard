// Future JavaScript for interactivity can go here. 
const heartRateDisplay = document.getElementById('heartRateDisplay');
const stepsDisplay = document.getElementById('stepsDisplay');
const caloriesDisplay = document.getElementById('caloriesDisplay');
const distanceDisplay = document.getElementById('distanceDisplay');
const currentTimeDisplay = document.getElementById('currentTime');
const highHeartRateAlertMessageDiv = document.getElementById('highHeartRateAlertMessage');
const actionButtonsOverlay = document.getElementById('actionButtonsOverlay');
const getInsightBtn = document.getElementById('getInsightBtn');
const closeOverlayBtn = document.getElementById('closeOverlayBtn');
const openOverlayBtn = document.getElementById('openOverlayBtn');
const llmInsightContainer = document.getElementById('llmInsightContainer');
const llmInsightText = document.getElementById('llmInsightText');
const llmLoading = document.getElementById('llmLoading');
const bloodPressureDisplay = document.getElementById('bloodPressureDisplay');
const bodyTemperatureDisplay = document.getElementById('BodyTemperatureDisplay');

const apiKey = 'AIzaSyAeWAMEBjOCwAkKaPlfkV4-4SnxLh05wYQ';

let currentHeartRate = 130; // Nhịp tim ban đầu (theo ảnh)
let currentSteps = 552; // Bước chân ban đầu (theo ảnh)
let currentCalories = 1200; // Calories ban đầu (theo ảnh)
let currentDistance = 10; // Km ban đầu (theo ảnh)
let currentBloodPressure = 100; // Huyết áp ban đầu (theo ảnh)
let currentBodyTemperature = 36.5; // Nhiệt độ cơ thể ban đầu (theo ảnh)
let sensorInterval;
let isWarningTriggered = false;
let alertTimeout = null; // New variable to track the alert timeout

// Hàm cập nhật thời gian hiện tại
function updateCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  currentTimeDisplay.textContent = `${hours}:${minutes}`;
}

// Hàm giả lập dữ liệu cảm biến bình thường
function startSensorSimulation() {
  if (sensorInterval) clearInterval(sensorInterval); // Xóa interval cũ nếu có
  sensorInterval = setInterval(() => {
      if (!isWarningTriggered) {
          currentHeartRate = Math.floor(Math.random() * (130 - 60 + 1)) + 60; // Nhịp tim 60-130
          currentSteps = Math.floor(Math.random() * (1000 - 300 + 1)) + 300; // Bước chân 300-1000
          currentCalories = Math.floor(Math.random() * (1500 - 500 + 1)) + 500; // Calories 500-1500
          currentDistance = (Math.random() * (15 - 3) + 3).toFixed(1); // Km 3.0-15.0
          currentBloodPressure = Math.floor(Math.random() * (180-50 + 1)) + 50; // Huyết áp 50-180
          currentBodyTemperature = ((Math.random() * (40 - 36.0 + 1)) + 36.0).toFixed(1); // Nhiệt độ 36.0-40.0
          updateSensorDataUI();
          
      }
      

      // High heart rate alert logic - checks currentHeartRate every interval
      if (currentHeartRate >= 130) {
          console.log("High heart rate detected:", currentHeartRate); // Debug log
          if (highHeartRateAlertMessageDiv) {
              highHeartRateAlertMessageDiv.style.display = 'block';
              highHeartRateAlertMessageDiv.style.visibility = 'visible';
              highHeartRateAlertMessageDiv.style.opacity = '1';
              highHeartRateAlertMessageDiv.textContent = `⚠️ ALERT: High Heart Rate: ${currentHeartRate} bpm!`;
              // Make the heart rate display red to indicate danger
              if (heartRateDisplay) {
                  heartRateDisplay.style.color = '#ff0000';
              }
              
              // Clear any existing timeout
              if (alertTimeout) {
                  clearTimeout(alertTimeout);
              }
              
              // Set a new timeout to hide the alert after 5 seconds
              alertTimeout = setTimeout(() => {
                  highHeartRateAlertMessageDiv.style.display = 'none';
                  // Keep the heart rate display red if still high
              }, 5000);
          }
      } else {
          if (highHeartRateAlertMessageDiv) {
              highHeartRateAlertMessageDiv.style.display = 'none';
              // Reset heart rate display color
              if (heartRateDisplay) {
                  heartRateDisplay.style.color = '#ff8c00'; // Original orange color
              }
          }
      }

  }, 2000); // Cập nhật mỗi 5 giây
}

// Hàm mở overlay chứa các nút hành động
function openActionOverlay() {
  actionButtonsOverlay.style.opacity = '1';
  actionButtonsOverlay.style.pointerEvents = 'auto';
  openOverlayBtn.classList.add('hidden'); // Ẩn nút '+' khi overlay mở
}

// Hàm đóng overlay chứa các nút hành động
function closeActionOverlay() {
  actionButtonsOverlay.style.opacity = '0';
  actionButtonsOverlay.style.pointerEvents = 'none';
  openOverlayBtn.classList.remove('hidden'); // Hiện nút '+' khi overlay đóng
}

// Thêm biến để tham chiếu đến backdrop
const insightBackdrop = document.createElement('div');
insightBackdrop.id = 'insightBackdrop';
insightBackdrop.className = 'fixed top-0 left-0 right-0 bottom-0 w-full h-full hidden';
document.body.appendChild(insightBackdrop);

// Sửa hàm getHealthInsightFromLLM để hiển thị backdrop
async function getHealthInsightFromLLM() {
  // Hiện backdrop và container
  insightBackdrop.classList.remove('hidden');
  llmInsightContainer.classList.remove('hidden');
  llmInsightText.textContent = '';
  llmLoading.classList.remove('hidden'); // Hiển thị loading spinner

  let prompt = 'Nhịp tim của tôi là ' + currentHeartRate + ' bpm. Huyết áp của tôi là ' + currentBloodPressure + ' mmHg. Nhiệt độ cơ thể của tôi là ' + currentBodyTemperature + ' °C. Bước chân của tôi là ' + currentSteps + '. Hãy cho tôi một lời khuyên sức khỏe ngắn gọn, tích cực và dễ hiểu (tối đa 50 từ) cho một người đeo vòng tay thông minh.';

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

// Hàm mới để đóng insight container
function closeInsightContainer() {
  llmInsightContainer.classList.add('hidden');
  insightBackdrop.classList.add('hidden');
}

// Thêm event listener cho backdrop để đóng container khi click
insightBackdrop.addEventListener('click', closeInsightContainer)



// Hàm cập nhật dữ liệu cảm biến và UI
function updateSensorDataUI() {
  heartRateDisplay.textContent = currentHeartRate + ' bpm'; // Chỉ hiển thị số nhịp tim
  stepsDisplay.textContent = currentSteps;
  caloriesDisplay.textContent = currentCalories;
  distanceDisplay.textContent = currentDistance;
  bloodPressureDisplay.textContent = currentBloodPressure + ' mmHg';
  bodyTemperatureDisplay.textContent = currentBodyTemperature + ' °C';
  
}


getInsightBtn.addEventListener('click', () => getHealthInsightFromLLM());
openOverlayBtn.addEventListener('click', openActionOverlay);
closeOverlayBtn.addEventListener('click', closeActionOverlay);

// Khởi động giả lập và cập nhật thời gian khi tải trang
document.addEventListener('DOMContentLoaded', () => {
  // Check initial heart rate immediately
  if (currentHeartRate >= 130) {
    highHeartRateAlertMessageDiv.style.display = 'block';
    highHeartRateAlertMessageDiv.textContent = `⚠️ ALERT: High Heart Rate: ${currentHeartRate} bpm!`;
    if (heartRateDisplay) {
        heartRateDisplay.style.color = '#ff0000';
    }

    
    
    // Set a timeout to hide the initial alert after 5 seconds
    alertTimeout = setTimeout(() => {
      highHeartRateAlertMessageDiv.style.display = 'none';
      // Keep heart rate display red if still high
    }, 5000);
  }

  if (currentBloodPressure >= 140) {
    bloodPressureAlertMessageDiv.style.display = 'block';
    bloodPressureAlertMessageDiv.textContent = `⚠️ ALERT: High Blood Pressure: ${currentBloodPressure} mmHg!`;
    if (bloodPressureDisplay) {
        bloodPressureDisplay.style.color = '#ff0000';
    }

    alertTimeout = setTimeout(() => {
      bloodPressureAlertMessageDiv.style.display = 'none';
      // Keep blood pressure display red if still high
    }, 5000);
  }

  if (currentBodyTemperature >= 37.5) {
    bodyTemperatureAlertMessageDiv.style.display = 'block';
    bodyTemperatureAlertMessageDiv.textContent = `⚠️ ALERT: High Body Temperature: ${currentBodyTemperature} °C!`;
    if (bodyTemperatureDisplay) {
        bodyTemperatureDisplay.style.color = '#ff0000';
    }

    alertTimeout = setTimeout(() => {
      bodyTemperatureAlertMessageDiv.style.display = 'none';
      // Keep body temperature display red if still high
    }, 5000); 
  }
  
  setInterval(updateCurrentTime, 60000); // Cập nhật thời gian mỗi phút
  updateCurrentTime(); // Update time immediately
  startSensorSimulation();
  updateSensorDataUI();
  // Thêm backdrop vào DOM nếu chưa có
  if (!document.getElementById('insightBackdrop')) {
    document.body.appendChild(insightBackdrop);
  }
});
