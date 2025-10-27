🗺️ Visualization Map - Documentation
🚀 Overview

The Visualization Map in ResQWave displays all occupied terminals in real time. Each terminal is represented by a colored pin based on its current status or alert type.

🎨 Pin Colors
Color	Hex	Meaning
🔴 Red	#ef4444	Critical – Triggered by sensors
🟡 Yellow	#eab308	User-Initiated Alert
🟢 Green	#22c55e	Online – No alert
⚪ Gray	#6b7280	Offline – No alert

⚠️ Note: Alert type overrides terminal status.
If alertType is NULL, the system displays the Online/Offline state.

🔁 Data Flow
Database → API (10s cache) → mapAlerts.ts → useMapAlerts (30s poll)
→ useSignals → index.tsx → SignalPopover

🧩 Backend Integration
📡 API Endpoints
Endpoint	Description
GET /api/alerts/map/unassigned	Fetches all unassigned alerts
GET /api/alerts/map/waitlisted	Fetches all waitlisted alerts

⏱️ Caching:

Backend: 10 seconds
Frontend Polling: Every 30 seconds

🧾 Response Example
{
  "alertId": "uuid",
  "alertType": "Critical" | "User-Initiated" | null,
  "terminalId": "RSQW-001",
  "terminalStatus": "Online" | "Offline",
  "focalFirstName": "John",
  "focalLastName": "Doe",
  "focalAddress": "{\"address\":\"Street, City\",\"coordinates\":\"121.03,14.75\"}",
  "focalContactNumber": "+63 912 345 6789"
}

🗃️ Database Schema
terminals (
  id,
  name,
  status
)

alerts (
  terminalID,
  alertType,
  dateTimeSent
)

neighborhood (
  terminalID,
  focalPersonID
)

focalpersons (
  id,
  firstName,
  lastName,
  address,
  contactNumber
)

🧱 Frontend Structure
Visualization/
├── api/
│   └── mapAlerts.ts          # API calls & data parsing
├── hooks/
│   ├── useMapAlerts.ts       # Polling every 30s
│   └── useSignals.ts         # Signal state management
├── components/
│   ├── SignalPopover.tsx     # Alert popup display
│   ├── LiveReportSidebar.tsx # Live alert list sidebar
│   └── MapControls.tsx       # Map zoom/layer controls
└── index.tsx                 # Main visualization map