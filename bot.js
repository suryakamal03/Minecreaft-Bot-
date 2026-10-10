
require('dotenv').config();
const http = require('node:http');
const mineflayer = require('mineflayer');

const host = process.env.MC_SERVER_HOST;
const port = Number(process.env.MC_SERVER_PORT || 25565);
const webPort = Number(process.env.PORT || 10000);
const username = process.env.MC_BOT_USERNAME || 'TestBot';
const auth = process.env.MC_AUTH || 'offline';
const reconnectDelayMs = Number(process.env.RECONNECT_DELAY_MS || 10000);

if (!host) {
  throw new Error('MC_SERVER_HOST is required');
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('MC_SERVER_PORT must be an integer between 1 and 65535');
}

if (!Number.isInteger(reconnectDelayMs) || reconnectDelayMs < 1000) {
  throw new Error('RECONNECT_DELAY_MS must be an integer of at least 1000');
}

if (!Number.isInteger(webPort) || webPort < 1 || webPort > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

const server = http.createServer((request, response) => {
  if (request.url === '/health' || request.url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Minecraft bot is running\n');
    return;
  }

  response.writeHead(404);
  response.end('Not found\n');
});

server.listen(webPort, '0.0.0.0', () => {
  console.log(`Health endpoint listening on port ${webPort}`);
});

let bot;
let reconnectTimer;

function connect() {
  bot = mineflayer.createBot({
    host,
    port,
    username,
    auth,
    ...(process.env.MC_VERSION ? { version: process.env.MC_VERSION } : {})
  });

  bot.on('spawn', () => {
    console.log(`Bot joined ${host}:${port}`);
  });

  bot.on('chat', (sender, message) => {
    if (sender !== bot.username) {
      console.log(`${sender}: ${message}`);
    }
  });

  bot.on('kicked', reason => {
    console.error('Kicked:', reason);
  });

  bot.on('error', err => {
    console.error('Minecraft error:', err.message);
  });

  bot.on('end', () => {
    console.log(`Disconnected. Reconnecting in ${reconnectDelayMs}ms.`);
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connect, reconnectDelayMs);
  });
}

connect();
