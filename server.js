const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3000;
const ALERT_FILE = path.join(__dirname, 'alerts.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Ensure alerts.json exists
if (!fs.existsSync(ALERT_FILE)) {
  fs.writeFileSync(ALERT_FILE, '[]', 'utf-8');
}

// GET /alerts - read alerts from file and send as JSON
app.get('/alerts', (req, res) => {
  try {
    const data = fs.readFileSync(ALERT_FILE, 'utf-8');
    const alerts = JSON.parse(data);
    res.json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read alerts' });
  }
});

// POST /alerts - add a new alert to file
app.post('/alerts', (req, res) => {
  try {
    const newAlert = req.body;
    const data = fs.readFileSync(ALERT_FILE, 'utf-8');
    const alerts = JSON.parse(data);

    alerts.push(newAlert);
    fs.writeFileSync(ALERT_FILE, JSON.stringify(alerts, null, 2), 'utf-8');

    res.status(201).json({ message: 'Alert added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add alert' });
  }
});

// PUT /alerts - overwrite alerts list
app.put('/alerts', (req, res) => {
  try {
    const newAlerts = req.body;
    fs.writeFileSync(ALERT_FILE, JSON.stringify(newAlerts, null, 2), 'utf-8');
    res.json({ message: 'Alerts updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update alerts' });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

// Notify all clients when a new alert is posted
io.on('connection', (socket) => {
  console.log('A client connected');
});
