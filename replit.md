# Wara-Monitor PNG

IoT salinity monitoring dashboard for coastal PNG communities to detect saltwater intrusion in wells.
Built for the YECAP Climate Impact Micro Grant.

## Project Structure
- `client/`: React + Vite frontend
- `server/`: Express backend (with Passport authentication)
- `shared/`: Shared TypeScript schemas (Zod + Drizzle)

## Authentication
- Sign-in is required to view the dashboard, map, or modify any data.
- Default admin credentials (seeded automatically on first boot):
  - **Username:** `admin`
  - **Password:** `wara2026`
- Passwords are hashed with `scrypt` and stored in the `users` table.
- Sessions are managed via `express-session` with `memorystore` and signed by `SESSION_SECRET`.
- Read endpoints (`GET /api/wells`, `/api/wells/:id`, `/api/wells/:id/readings`, CSV export) are public so visitors can view monitoring data.
- Write endpoints (`POST /api/wells`, `POST /api/readings`) require authentication.

## Status thresholds
- Safe: salinity < 1 ppt
- Warning: 1–3 ppt
- Danger: > 3 ppt
- Status is auto-computed when a new reading is inserted.

## Features
- Dashboard with live auto-refresh (every 30s) + manual refresh button.
- **Interactive PNG provinces map** (`/map`) — all 22 official provinces rendered as a clickable SVG. Provinces are coloured by the worst alert level among their wells (red=danger, amber=warning, green=safe, grey=no wells). Clicking a province with wells filters the dashboard via `?province=<name>`.
- Dashboard supports a `?province=<name>` query param to drill into a single province. A clearable filter chip is shown when active.
- Per-well salinity trend chart with safe/danger reference lines.
- CSV export of all readings per well (`/api/wells/:id/readings/export`).
- Dark/light theme toggle (persisted in localStorage).
- Footer with YECAP attribution and threshold reference.

## Data
- Wells have an optional `province` field constrained to one of the 22 PNG provinces (see `shared/provinces.ts`).
- The province GeoJSON (`client/src/data/png-provinces.json`, ~619 KB) was sourced from the geoBoundaries ADM1 dataset and simplified to 4-decimal precision; province names cleaned up for display.
- The map uses a lightweight equirectangular projection (no extra dependencies) bounded to PNG's lon/lat box.

## Local Setup
1. Install dependencies: `npm install`
2. Set `DATABASE_URL` and `SESSION_SECRET` environment variables
3. Push schema: `npm run db:push`
4. Run development server: `npm run dev`

## Technologies
- React, Tailwind CSS, Shadcn UI, Recharts
- Node.js, Express, Passport (local strategy)
- PostgreSQL, Drizzle ORM
- Wouter (routing), TanStack Query (data fetching)

## Notes
- Twilio SMS notifications were proposed but dismissed by the user. If they
  ever want SMS alerts, ask for Twilio credentials (Account SID, Auth Token,
  phone number) to store as Replit secrets, or wire up the Twilio integration.
