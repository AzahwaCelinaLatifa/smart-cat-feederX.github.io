#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>

// ========================================
// 🔧 CONFIGURATION
// ========================================
const char* ssid = "YOUR_WIFI_NAME";        // Your WiFi name
const char* password = "YOUR_WIFI_PASSWORD"; // Your WiFi password

// Servo Pin
const int SERVO_PIN = 19; // Change this if your servo is on different pin

// Objects
Servo feedServo;
WebServer server(80); // ESP32 web server on port 80

// Variables
bool isFeeding = false;
int servoPosition = 90;

// ========================================
// SETUP
// ========================================
void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("\n\n🍽️ Pawsitive Feed - Servo Controller");
  Serial.println("=====================================\n");

  // Setup Servo
  Serial.println("🔧 Initializing Servo...");
  feedServo.attach(SERVO_PIN, 500, 2400);
  feedServo.write(90); // Start at 90 degrees
  servoPosition = 90;
  Serial.println("✓ Servo Ready at 90°!");

  // Connect to WiFi
  Serial.print("\n📡 Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    Serial.print("📱 ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("🌐 Feed URL: http://");
    Serial.print(WiFi.localIP());
    Serial.println("/feed");
  } else {
    Serial.println("\n❌ WiFi Failed! Check SSID/Password");
    Serial.println("⚠️  Servo will still work via Serial commands");
  }

  // Setup Web Server Routes
  server.on("/", HTTP_GET, handleRoot);
  server.on("/feed", HTTP_POST, handleFeedRequest);
  server.on("/status", HTTP_GET, handleStatusRequest);
  server.begin();
  
  Serial.println("\n=====================================");
  Serial.println("🚀 Servo Controller Ready!");
  Serial.println("=====================================");
  Serial.println("\nCommands:");
  Serial.println("  'f' = Feed Now");
  Serial.println("  's' = Show Status");
  Serial.println("  Or use website button\n");
}

// ========================================
// MAIN LOOP
// ========================================
void loop() {
  server.handleClient(); // Handle incoming web requests

  // Manual control via Serial
  if (Serial.available() > 0) {
    char inByte = Serial.read();
    
    if (inByte == 'f' || inByte == 'F') {
      Serial.println("🍽️ Manual feed triggered via Serial!");
      feedNow();
    }
    else if (inByte == 's' || inByte == 'S') {
      showStatus();
    }
  }
}

// ========================================
// FEED NOW FUNCTION
// ========================================
void feedNow() {
  if (isFeeding) {
    Serial.println("⚠️ Already feeding! Please wait...");
    return;
  }

  isFeeding = true;
  Serial.println("\n🍽️ ================================");
  Serial.println("   FEEDING STARTED!");
  Serial.println("   ================================");
  
  // Move servo from 90° to 180°
  Serial.println("🔄 Opening dispenser (90° → 180°)...");
  feedServo.write(180);
  servoPosition = 180;
  delay(2000); // Wait 2 seconds for food to dispense
  
  // Move servo back from 180° to 90°
  Serial.println("🔄 Closing dispenser (180° → 90°)...");
  feedServo.write(90);
  servoPosition = 90;
  
  Serial.println("✓ Feeding complete!");
  Serial.println("   ================================\n");
  
  isFeeding = false;
}

// ========================================
// WEB SERVER HANDLERS
// ========================================

// Root page - Simple status page
void handleRoot() {
  String html = R"(
<!DOCTYPE html>
<html>
<head>
  <title>Servo Controller</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
    .container { background: white; padding: 40px; border-radius: 20px; max-width: 400px; margin: 0 auto; }
    h1 { color: #333; }
    .status { padding: 20px; background: #e8f5e9; border-radius: 10px; margin: 20px 0; }
    button { background: #8b5a3c; color: white; border: none; padding: 16px 32px; border-radius: 12px; 
             font-size: 18px; cursor: pointer; width: 100%; margin: 10px 0; }
    button:hover { background: #6d4830; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .success { background: #27ae60; }
    .error { background: #e74c3c; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🍽️ Feed Controller</h1>
    <div class="status">
      <h3>Status: <span id="status">Ready</span></h3>
      <p>Servo: <span id="servo">90°</span></p>
    </div>
    <button id="feedBtn" onclick="feed()">Feed Now</button>
    <button onclick="checkStatus()">Refresh Status</button>
  </div>

  <script>
    async function feed() {
      const btn = document.getElementById('feedBtn');
      const status = document.getElementById('status');
      
      btn.disabled = true;
      btn.textContent = '🔄 Feeding...';
      status.textContent = 'Feeding...';
      
      try {
        const response = await fetch('/feed', { method: 'POST' });
        const data = await response.json();
        
        btn.textContent = '✓ Fed!';
        btn.className = 'success';
        status.textContent = 'Complete!';
        
        setTimeout(() => {
          btn.textContent = 'Feed Now';
          btn.className = '';
          btn.disabled = false;
          checkStatus();
        }, 3000);
      } catch (error) {
        btn.textContent = '❌ Failed';
        btn.className = 'error';
        status.textContent = 'Error!';
        setTimeout(() => {
          btn.textContent = 'Feed Now';
          btn.className = '';
          btn.disabled = false;
        }, 3000);
      }
    }
    
    async function checkStatus() {
      try {
        const response = await fetch('/status');
        const data = await response.json();
        document.getElementById('status').textContent = data.isFeeding ? 'Feeding' : 'Ready';
        document.getElementById('servo').textContent = data.servoPosition + '°';
      } catch (error) {
        console.error('Status check failed:', error);
      }
    }
    
    setInterval(checkStatus, 2000);
  </script>
</body>
</html>
  )";
  
  server.send(200, "text/html", html);
}

// Handle feed request from website
void handleFeedRequest() {
  Serial.println("📡 Received FEED command from website!");
  
  if (isFeeding) {
    server.send(409, "application/json", "{\"status\":\"error\",\"message\":\"Already feeding\"}");
    return;
  }

  feedNow();
  
  server.send(200, "application/json", "{\"status\":\"success\",\"message\":\"Feeding completed\"}");
}

// Handle status request
void handleStatusRequest() {
  String json = "{";
  json += "\"status\":\"" + String(isFeeding ? "feeding" : "ready") + "\",";
  json += "\"isFeeding\":" + String(isFeeding ? "true" : "false") + ",";
  json += "\"servoPosition\":" + String(servoPosition);
  json += "}";
  
  server.send(200, "application/json", json);
}

// ========================================
// SHOW STATUS (Serial)
// ========================================
void showStatus() {
  Serial.println("\n📊 STATUS");
  Serial.println("=====================================");
  Serial.print("WiFi: ");
  Serial.println(WiFi.status() == WL_CONNECTED ? "Connected ✓" : "Disconnected ✗");
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  }
  Serial.print("Servo Position: ");
  Serial.print(servoPosition);
  Serial.println("°");
  Serial.print("Is Feeding: ");
  Serial.println(isFeeding ? "Yes" : "No");
  Serial.println("=====================================\n");
}
