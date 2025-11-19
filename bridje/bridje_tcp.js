// bridge-tcp.js
const WebSocket = require('ws');
const net = require('net');

const TCP_HOST = '127.0.0.1';
const TCP_PORT = 8888;
const WS_PORT = 8080;

const wss = new WebSocket.Server({ host: '0.0.0.0', port: WS_PORT });

console.log(`✅ WebSocket server running on ws://0.0.0.0:${WS_PORT}`);
console.log(`🔄 Forwarding messages to TCP server ${TCP_HOST}:${TCP_PORT}`);

wss.on('connection', (ws) => {
  console.log('🟢 WebSocket client connected');

  const tcpClient = new net.Socket();

  tcpClient.connect(TCP_PORT, TCP_HOST, () => {
    console.log('🔗 Connected to TCP server');
  });

  ws.on('message', (message) => {
    console.log(`➡️ WS → TCP: ${message}`);
    tcpClient.write(message + '\n');
  });

  tcpClient.on('data', (data) => {
    const msg = data.toString().trim();
    console.log(`⬅️ TCP → WS: ${msg}`);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  });

  tcpClient.on('close', () => {
    console.log('🔴 Disconnected from TCP server');
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  tcpClient.on('error', (err) => {
    console.error('❌ TCP Error:', err.message);
  });

  // Handle WebSocket disconnects
  ws.on('close', () => {
    console.log('🔴 WebSocket client disconnected');
    tcpClient.end();
  });
});
