const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve your website files (adjust this path if needed)
app.use(express.static('.')); // This serves files from current directory

// Store current weight
let currentWeight = 0;
const maxCapacity = 150;

// API: Receive weight from ESP32
app.post('/api/weight', (req, res) => {
  const { weight } = req.body;
  currentWeight = parseFloat(weight) || 0;
  
  console.log(`📊 Received from ESP32: ${currentWeight.toFixed(2)}g`);
  
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 ================================');
  console.log(`   ESP32 Backend Server Started`);
  console.log('   ================================');
  console.log(`   📡 Backend API: http://localhost:${PORT}`);
  console.log(`   📡 Network: http://10.32.10.226:${PORT}`);
  console.log(`   📡 ESP32 POST: http://10.32.10.226:${PORT}/api/weight`);
  console.log('   ================================');
  console.log(`   🌐 Website running at: http://localhost:5173`);
  console.log('   ================================\n');
  console.log('   Waiting for ESP32 data...\n');
});
