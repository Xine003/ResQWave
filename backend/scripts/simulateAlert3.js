const { io } = require("socket.io-client");

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkRTUDAwMSIsIm5hbWUiOiJPcmlnaW5hbCBSZXNRV2F2ZSIsInJvbGUiOiJkaXNwYXRjaGVyIiwiaWF0IjoxNzU4NDY0Njg3LCJleHAiOjE3NTg0NjgyODd9.dhqM8AVYk4etWFDtcgcSzBab58Y3WElQZT4SN7_q7eM";
const TERMINAL_ID = "RESQWAVE005"; // must exist

const socket = io("http://localhost:5000", { auth: { token: TOKEN } });

socket.on("connect", () => {
  console.log("Simulator connected:", socket.id);
  socket.emit("terminal:join", { terminalId: TERMINAL_ID });

socket.emit(
  "alert:trigger",
  {
    terminalId: TERMINAL_ID,
    alertType: "Critical",
    sentThrough: "Sensor",
    status: "Dispatched"
  },
  (ack) => console.log("ack:", ack)
  );
});

socket.on("connect_error", (e) => console.error("connect_error:", e.message));