require('dotenv').config();
const net = require('node:net');

const host = process.env.MC_SERVER_HOST;
const port = Number(process.env.MC_SERVER_PORT || 25565);
const timeoutMs = Number(process.env.HEALTHCHECK_TIMEOUT_MS || 10000);

if (!host) {
  console.error('MC_SERVER_HOST is required');
  process.exit(1);
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('MC_SERVER_PORT must be an integer between 1 and 65535');
  process.exit(1);
}

if (!Number.isInteger(timeoutMs) || timeoutMs < 1000) {
  console.error('HEALTHCHECK_TIMEOUT_MS must be an integer of at least 1000');
  process.exit(1);
}

const socket = net.createConnection({ host, port });
const timeout = setTimeout(() => {
  console.error(`Minecraft server health check timed out: ${host}:${port}`);
  socket.destroy();
  process.exit(1);
}, timeoutMs);

socket.once('connect', () => {
  clearTimeout(timeout);
  console.log(`Minecraft server is reachable at ${host}:${port}`);
  socket.end();
});

socket.once('error', error => {
  clearTimeout(timeout);
  console.error(`Minecraft server is unreachable at ${host}:${port}: ${error.message}`);
  process.exit(1);
});
