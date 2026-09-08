# BusTrackSystem
> Real-time passenger monitoring and bus tracking for smarter public transport

BusTrackSystem monitors bus occupancy in real-time to solve bus overcrowding, prevent safety hazards, and streamline public transit management across a 10-bus fleet.

---

## System Architecture

```
BusTrackSystem/
├── frontend/          # React (Vite) + Tailwind CSS + Lucide React + Recharts
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── utils/
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── backend/           # Node.js + Express + Mongoose + WebSocket + SerialPort
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── config/
│   ├── serialHandler.js
│   ├── websocket.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React (SVG icons only — zero emojis), Recharts, Axios, React Router DOM
- **Backend**: Node.js, Express.js, MongoDB with Mongoose, WebSockets (`ws`), `serialport` for ESP32 IR hardware telemetry, JWT Authentication, `bcryptjs`
- **Design System**: Dark control room aesthetic (`#0a0f1e` dark navy, `#111827` card background, `#00f5a0` safe green, `#fbbf24` warning amber, `#ff4d6d` danger red), Inter & JetBrains Mono typography

---

## Phase Status Tracker

- [x] **Phase 1 — Project Setup**: Full directory structure created, dependencies installed, environment variables configured, Git initialized, Vite and Tailwind configured.
- [x] **Phase 2 — Database and Models**: MongoDB connection, Mongoose schemas, and database seed.
- [x] **Phase 3 — Authentication**: JWT login/logout, route protection, role redirection.
- [x] **Phase 4 — Main Dashboard All Buses**: 10-bus live monitoring dashboard & WebSockets.
- [x] **Phase 5 — Individual Bus Detail Page**: Live circular gauge, route sequence, and telemetry feed.
- [x] **Phase 6 — Hardware Integration**: ESP32 serial communication & live count parsing.
- [x] **Phase 7 — Conductor Panel**: Full-screen mobile terminal with one-handed stop advancement & loop reset.
- [x] **Phase 8 — Admin Route Editor**: Stop management, reordering, route type toggle, capacity.
- [x] **Phase 9 — Trip History**: Loop completion history and ridership audit log.
- [x] **Phase 10 — Public Passenger View**: Unauthenticated bus crowding status checker.
- [x] **Phase 11 — Analytics**: Fleet utilization charts and busiest hours insights.
- [x] **Phase 12 — UI Polish**: Control room styling, loading states, error boundaries.
- [x] **Phase 13 — Testing**: End-to-end integration and hardware failover verification.
- [x] **Phase 14 — Deployment**: Vercel & Railway hosting setup.

---

## Getting Started

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
