# Wara-Monitor PNG — Setup Guide

Welcome! This guide will help you run the Wara-Monitor PNG dashboard on your own computer using IntelliJ IDEA (or any other code editor).

---

## 📋 Prerequisites

Before you start, make sure you have the following installed on your laptop:

1. **Node.js v18 or higher** — [Download here](https://nodejs.org/)
2. **PostgreSQL 14 or higher** — [Download here](https://www.postgresql.org/download/)
3. **IntelliJ IDEA** (Community Edition is free) — [Download here](https://www.jetbrains.com/idea/download/)

To check if Node.js is installed, open a terminal and run:
```bash
node --version
```

---

## 🚀 Step-by-Step Setup

### Step 1: Extract the archive

If you downloaded `wara-monitor-png-setup.tar.gz`:
```bash
tar -xzf wara-monitor-png-setup.tar.gz -C wara-monitor-png
cd wara-monitor-png
```

If you downloaded `wara-monitor-png-setup.tar`:
```bash
mkdir wara-monitor-png && tar -xf wara-monitor-png-setup.tar -C wara-monitor-png
cd wara-monitor-png
```

### Step 2: Open the folder in IntelliJ
- Launch IntelliJ IDEA
- Click **File → Open**
- Select the `wara-monitor-png` folder

### Step 3: Install all dependencies
Open the IntelliJ terminal (View → Tool Windows → Terminal) and run:
```bash
npm install
```
This downloads all the libraries the project needs. It may take 2–3 minutes.

### Step 4: Set up your local PostgreSQL database

1. Open your PostgreSQL admin tool (or `psql` in terminal) and create a new database:
   ```sql
   CREATE DATABASE wara_monitor;
   ```

2. Create a `.env` file in the project root (same folder as `package.json`) with this content:
   ```
   DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/wara_monitor
   SESSION_SECRET=change-this-to-a-long-random-string
   ```
   Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your PostgreSQL credentials.

### Step 5: Push the database schema
This creates the tables (users, wells, readings) in your database:
```bash
npm run db:push
```

### Step 6: Start the application
```bash
npm run dev
```

You should see:
```
[auth] Default admin user created — username: admin, password: wara2026
[express] serving on port 5000
```

### Step 7: Open in your browser
Visit **http://localhost:5000**

You'll see the login page. Sign in with:
- **Username:** `admin`
- **Password:** `wara2026`

---

## 🎉 You're Done!

You can now:
- View the dashboard with live well status
- **Click any of the 22 PNG provinces on the interactive map (`/map`) to filter the dashboard**
- Add new monitoring wells (with province selection from all 22 provinces)
- Log new salinity readings
- Export data to CSV
- Switch between light and dark themes

---

## 🔧 Troubleshooting

**"Cannot connect to database"**
- Make sure PostgreSQL is running on your computer
- Double-check your username, password and database name in the `.env` file

**"Port 5000 is already in use"**
- Stop whatever else is using port 5000, or change the port by adding `PORT=3000` to your `.env` file

**"npm: command not found"**
- Node.js is not installed or not in your PATH. Re-install Node.js from https://nodejs.org/

---

## 📁 Project Layout

```
wara-monitor-png/
├── client/          ← React frontend (the user interface)
├── server/          ← Express backend (the API + database logic)
├── shared/          ← Shared TypeScript types
├── attached_assets/ ← Static assets
├── package.json     ← Dependencies list
└── .env             ← Your local secrets (you create this)
```

---

## 💡 Useful Commands

| Command | What it does |
|---|---|
| `npm install` | Install all dependencies |
| `npm run dev` | Start the development server |
| `npm run db:push` | Update the database schema |
| `npm run check` | Check for TypeScript errors |
| `npm run build` | Build for production |
| `npm start` | Run the production build |

---

Built for the **YECAP Climate Impact Micro Grant** 🌊
