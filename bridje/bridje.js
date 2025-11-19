// bridge.js
const WebSocket = require('ws');
const dgram = require('dgram');

const UDP_HOST = '127.0.0.1';
const UDP_PORT = 8888;
const WS_PORT = 8080;

const udpClient = dgram.createSocket('udp4');
const wss = new WebSocket.Server({ host: '0.0.0.0',port: WS_PORT });

console.log(`✅ WebSocket server running on ws://172.21.144.1:${WS_PORT}`);
console.log(`🔄 Forwarding messages to UDP server ${UDP_HOST}:${UDP_PORT}`);

wss.on('connection', (ws) => {
  console.log('🟢 WebSocket client connected');

  ws.on('message', (message) => {
    console.log(`➡️ WS → UDP: ${message}`);
    udpClient.send(message, UDP_PORT, UDP_HOST);
  });

  ws.on('close', () => console.log('🔴 WebSocket client disconnected'));
});

udpClient.on('message', (msg) => {
  console.log(`⬅️ UDP → WS: ${msg}`);
  const data = msg.toString();
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
});
