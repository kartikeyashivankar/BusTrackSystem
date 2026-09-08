# Production Deployment Guide: BusTrackSystem

This guide documents the complete end-to-end production deployment process for the BusTrackSystem full-stack IoT passenger crowd monitoring and bus tracking network.

---

## 1. Cloud Architecture Overview

```
[ ESP32 IR Telemetry ] (USB / WiFi HTTP / Simulation)
         │
         ▼
[ Railway Node.js Backend ] (Express API + WebSockets on port 5000)
    │               ▲
    │               │  WSS / REST (with JWT)
    ▼               │
[ MongoDB Atlas ]   └─────── [ Vercel React 18 SPA Frontend ]
(Database Cluster)            (Vite + Tailwind CSS + Recharts)
```

- **Frontend**: Hosted on **Vercel** (Global Edge CDN, automatic HTTPS, SPA client-side routing).
- **Backend**: Hosted on **Railway** or **Render** (Node.js 20 LTS, persistent WebSockets, REST API).
- **Database**: Hosted on **MongoDB Atlas** (M0/M10 managed replica set with automated backups).
- **Hardware Interface**: Native USB Serial (`COM3` / `/dev/ttyUSB0`) when run locally on transit depot servers, with automated failover to cloud simulation mode and REST telemetry injection.

---

## 2. Step 1: MongoDB Atlas Database Provisioning

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster (Shared Tier M0 is free and fully sufficient for the 10-bus fleet).
3. Under **Security -> Database Access**:
   - Create a database user (e.g. `bustrack_admin`) with password authentication and `readWriteAnyDatabase` privileges.
4. Under **Security -> Network Access**:
   - Add IP access entry `0.0.0.0/0` (Allow access from anywhere, required for dynamic cloud host IPs on Railway/Render).
5. Under **Deployment -> Database -> Connect**:
   - Select **Drivers -> Node.js** (version 5.5 or later).
   - Copy the SRV connection URI:
     ```
     mongodb+srv://bustrack_admin:<password>@cluster0.xxxxx.mongodb.net/bustrack?retryWrites=true&w=majority
     ```

---

## 3. Step 2: Backend Deployment on Render

1. Sign up or log in to [Render](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub account and select the `BusTrackSystem` repository.
4. Configure the Web Service settings:
   - **Name**: `bustrack-backend` (or your choice)
   - **Region**: Select the region closest to you (e.g., Oregon, Frankfurt, Singapore)
   - **Branch**: `main` (or your active branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, click **Add Environment Variable** for each:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production mode |
   | `PORT` | `5000` | Render exposes this port via its HTTPS router |
   | `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/bustrack?retryWrites=true&w=majority` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `bustrack_secure_jwt_token_2026_prod` | Strong secret for token signing |
   | `CLIENT_URL` | `https://<your-app-name>.vercel.app` | Your Vercel frontend URL (you can update this after Vercel deploys) |
   | `SERIAL_PORT` | `COM3` | In cloud environments, graceful simulation mode is auto-activated |
   | `BAUD_RATE` | `115200` | Hardware baud rate |
6. Click **Create Web Service**.
7. Once deployed, copy your Render service URL from the top of the dashboard:
   - Format: `https://bustrack-backend.onrender.com`
   - WebSocket URL is the same hostname with `wss://`: `wss://bustrack-backend.onrender.com`
8. **Seed Database (Initial Fleet & Users)**:
   - In your Render dashboard, click the **Shell** tab (or run locally pointed to Atlas):
     ```bash
     npm run seed
     ```

*(Alternative: You can also deploy via Railway using `railway.json` if preferred).*

---

## 4. Step 3: Frontend Deployment on Vercel

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project** and import the `BusTrackSystem` repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit and select `frontend` (or leave default since root `vercel.json` is configured).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   | Variable | Value | Example |
   |---|---|---|
   | `VITE_API_URL` | Your Render HTTPS backend domain | `https://bustrack-backend.onrender.com` |
   | `VITE_WS_URL` | Your Render WSS backend domain | `wss://bustrack-backend.onrender.com` |
5. Click **Deploy**.
6. Once deployed, note your public domain (e.g. `https://bustrack-system.vercel.app`).
7. Return to your **Render Dashboard** -> **Environment** and make sure `CLIENT_URL` includes your exact Vercel URL (e.g. `https://bustrack-system.vercel.app`). Render will automatically redeploy with the updated CORS policy.


---

## 5. Step 4: ESP32 Hardware Integration in Cloud Environments

When the backend runs in a remote cloud container (Railway / Render / AWS):
1. **Automated Simulation Mode**:
   - The backend automatically detects that physical `COM3` is not present, enters simulation mode, and maintains continuous system operation without crashes.
2. **Local Hardware Bridge (Optional)**:
   - If an ESP32 is connected via USB to a local depot PC or Raspberry Pi, run the bridge script to forward serial sensor events directly to the cloud backend API:
     ```bash
     node scripts/serial_bridge.js --target=https://bustrack-backend-production.up.railway.app --port=COM3
     ```
3. **HTTP Simulation / Telemetry Injection**:
   - Hardware telemetry events can also be posted directly from ESP32 WiFi firmware or REST triggers:
     ```bash
     curl -X POST https://bustrack-backend-production.up.railway.app/api/hardware/simulate \
       -H "Content-Type: application/json" \
       -d '{"busNumber": "MH-40-AA-1111", "event": "ENTRY"}'
     ```

---

## 6. Step 5: Post-Deployment Verification Checklist

Verify the following after deployment:
- [ ] **Health Check**: `https://<railway-domain>/api/health` returns HTTP 200 with `status: "ok"`.
- [ ] **Database Connection**: `GET https://<railway-domain>/api/buses` returns all 10 buses.
- [ ] **Admin Authentication**: Login at `https://<vercel-domain>/` with `admin@bustrack.com` / `admin123`.
- [ ] **Conductor Terminal**: Login with `conductor@bustrack.com` / `conductor123`, verify assigned bus `MH-40-AA-1111`, test stop advancement and loop completion.
- [ ] **Public Passenger View**: Visit `https://<vercel-domain>/track` or `https://<vercel-domain>/track/MH-40-AA-1111`, verify 5-second live telemetry refresh and seat availability banner.
- [ ] **Real-Time WebSockets**: Verify the green `LIVE` connection dot in the navbar.
- [ ] **Analytics Engine**: Visit `https://<vercel-domain>/analytics` and confirm that all 3 Recharts graphs (Hourly Demand, Daily Volume, Fleet Occupancy) render without errors.
