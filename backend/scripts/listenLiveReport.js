const { io } = require("socket.io-client");

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkRTUDAwMSIsIm5hbWUiOiJPcmlnaW5hbCBSZXNRV2F2ZSIsInJvbGUiOiJkaXNwYXRjaGVyIiwic2Vzc2lvbklEIjoiMDhmZTIzOWEtNTFmZC00NTJiLTgyZDYtNTljMjgzOGYwNjE3IiwiaWF0IjoxNzU4NzAzMTQ1LCJleHAiOjE3NTg3MDY3NDV9.vr_cVTDoV6r5afH6HHFTooqBVlnvT9hGig-gRX189vc";

const socket = io("http://localhost:5000", { auth: { token: TOKEN } });

socket.on("connect", () => console.log("Dashboard connected:", socket.id));
socket.on("connect_error", (e) => console.error("connect_error:", e.message));

// Listen to the event the server emits
socket.on("liveReport:new", (data) => {
  console.log("Live Report:", data);
});

// Optional: listen to legacy/event variations while debugging
socket.on("alert:new", (data) => console.log("Live Report (legacy):", data));