const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve your website files (adjust this path if needed)
app.use(express.static('.')); // This serves files from current directory

// Store current weight and ESP32 IPs
let currentWeight = 0;
const maxCapacity = 150;
let loadcellESP32_IP = null; // ESP32 #1 (Loadcell) - auto-detected
let servoESP32_IP = null;    // ESP32 #2 (Servo) - you'll set this manually

// ========================================
// IMPORTANT: Set your Servo ESP32 IP here after you upload the code!
// ========================================
// After uploading servo code, check Serial Monitor for IP address
// Then set it here (without http://):
const servoESP32_IP = "172.20.0.139"; // Your ESP32 servo IP

// API: Receive weight from ESP32 #1 (Loadcell)
app.post('/api/weight', (req, res) => {
  const { weight } = req.body;
  currentWeight = parseFloat(weight) || 0;
  
  // Auto-detect Loadcell ESP32 IP
  if (!loadcellESP32_IP) {
    loadcellESP32_IP = req.ip.replace('::ffff:', '');
    console.log(`📍 Loadcell ESP32 detected at: ${loadcellESP32_IP}`);
  }
  
  console.log(`📊 Weight: ${currentWeight.toFixed(2)}g at ${new Date().toLocaleTimeString()}`);
  
  res.json({ 
    status: 'success', 
    weight: currentWeight,
    max: maxCapacity,
    percentage: (currentWeight / maxCapacity * 100).toFixed(1)
  });
});

// API: Get current weight (for your website)
app.get('/api/weight', (req, res) => {
  res.json({ 
    weight: currentWeight,
    max: maxCapacity,
    percentage: (currentWeight / maxCapacity * 100).toFixed(1),
    timestamp: new Date().toISOString()
  });
});

// API: Feed Now - Send command to ESP32 #2 (Servo)
app.post('/api/feed', async (req, res) => {
  if (!servoESP32_IP) {
    console.log('❌ Servo ESP32 IP not configured!');
    return res.status(503).json({ 
      status: 'error', 
      message: 'Servo ESP32 IP not configured in server.cjs' 
    });
  }

  try {
    console.log(`🍽️ Sending FEED command to Servo ESP32 (${servoESP32_IP})...`);
    
    const response = await axios.post(`http://${servoESP32_IP}/feed`, {}, {
      timeout: 5000
    });
    
    console.log(`✓ Feed command successful!`, response.data);
    
    res.json({ 
      status: 'success', 
      message: 'Feeding started!',
      esp32Response: response.data
    });
    
  } catch (error) {
    console.error('❌ Failed to send feed command:', error.message);
    
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to communicate with Servo ESP32',
      error: error.message
    });
  }
});

// API: Get system status
app.get('/api/status', async (req, res) => {
  let servoStatus = { connected: false };
  
  if (servoESP32_IP) {
    try {
      const response = await axios.get(`http://${servoESP32_IP}/status`, {
        timeout: 3000
      });
      servoStatus = { connected: true, ...response.data };
    } catch (error) {
      servoStatus = { connected: false, error: error.message };
    }
  }

  res.json({ 
    loadcell: {
      connected: !!loadcellESP32_IP,
      ip: loadcellESP32_IP,
      currentWeight: currentWeight
    },
    servo: {
      connected: servoStatus.connected,
      ip: servoESP32_IP,
      ...servoStatus
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 ================================');
  console.log(`   Pawsitive Feed Server Started`);
  console.log('   ================================');
  console.log(`   📡 Backend API: http://localhost:${PORT}`);
  console.log(`   📡 Network: http://10.32.10.226:${PORT}`);
  console.log(`   📡 ESP32 POST: http://10.32.10.226:${PORT}/api/weight`);
  console.log('   ================================');
  console.log(`   📊 Loadcell ESP32: ${loadcellESP32_IP || 'Waiting...'}`);
  console.log(`   🍽️  Servo ESP32: ${servoESP32_IP || 'NOT CONFIGURED!'}`);
  console.log('   ================================');
  console.log(`   🌐 Website running at: http://localhost:5173`);
  console.log('   ================================\n');
  
  if (!servoESP32_IP) {
    console.log('⚠️  ACTION REQUIRED:');
    console.log('   1. Upload servo code to ESP32 #2');
    console.log('   2. Check Serial Monitor for IP address');
    console.log('   3. Set servoESP32_IP in server.cjs (line ~26)\n');
  }
  
  console.log('   Waiting for ESP32 data...\n');
});
