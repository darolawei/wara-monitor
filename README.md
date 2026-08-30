# Wara Monitor

Wara Monitor is a full-stack water salinity monitoring dashboard for Papua New Guinea communities. It tracks wells, salinity readings, province-level locations, status alerts, and CSV exports.

## Features

- Dashboard for monitoring well status
- Interactive Papua New Guinea province map
- Well detail pages with salinity trend charts
- Manual salinity reading entry
- CSV export for well readings
- ESP32/Wokwi sensor reading ingestion
- Staff login with session authentication
- PostgreSQL-backed data storage

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Express
- PostgreSQL
- Drizzle ORM

## Requirements

- Node.js 20.x
- PostgreSQL 14 or newer
- npm

## Environment

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/wara_monitor
SESSION_SECRET=change-this-to-a-long-random-string
PORT=5000
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=change-this-before-going-live
SENSOR_API_KEY=change-this-sensor-secret
```

Do not commit `.env`. Use `.env.example` as the safe template.

## Local Development

Install dependencies:

```bash
npm install
```

Push the database schema:

```bash
npm run db:push
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5000
```

Default local login:

```text
Username: admin
Password: value from DEFAULT_ADMIN_PASSWORD
```

If `DEFAULT_ADMIN_PASSWORD` is not set locally, the app falls back to `wara2026`.

## Build

Type-check the project:

```bash
npm run check
```

Build for production:

```bash
npm run build
```

Start the production build:

```bash
npm start
```

## Deployment

This app needs a Node.js server and PostgreSQL database, so GitHub Pages is not enough.

The repository includes `render.yaml` for Render Blueprint deployment. See [DEPLOY.md](./DEPLOY.md) for the live deployment steps.

## ESP32 Demo

The app includes a secure endpoint for ESP32 sensor prototypes:

```text
POST /api/sensor/readings
```

Use [SENSOR_SETUP.md](./SENSOR_SETUP.md) to connect a virtual ESP32 in Wokwi or a real ESP32 sensor later.

## Repository

GitHub:

```text
https://github.com/darolawei/wara-monitor
```
