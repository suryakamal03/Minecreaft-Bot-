# Minecraft bot

## Local configuration

Copy `.env.example` to `.env` and set `MC_SERVER_HOST` to the Minecraft
server hostname or IP (the server ID supplied by the host). Render variables
must be entered in the Render dashboard or loaded from `render.yaml`; do not
commit `.env`.

The bot reconnects automatically after a disconnect. The Render cron service
runs `npm run healthcheck` every five minutes and reports whether the
Minecraft server port is reachable.

## Render deployment

Create a Blueprint from `render.yaml`, then set `MC_SERVER_HOST`,
`MC_BOT_USERNAME`, and (if needed) `MC_VERSION` in the Render dashboard.
The worker runs `npm start`; the cron service runs the connectivity check.
