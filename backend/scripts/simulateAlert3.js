const { io } = require("socket.io-client");

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkRTUDAwMSIsIm5hbWUiOiJPcmlnaW5hbCBSZXNRV2F2ZSIsInJvbGUiOiJkaXNwYXRjaGVyIiwic2Vzc2lvbklEIjoiYTkzNTA4OTItMmFjYy00ZjM1LTg5YWItYTgwZWVjMTVlYzMxIiwiaWF0IjoxNzU4Njk4NDA3LCJleHAiOjE3NTg3MDIwMDd9.Pe8QEyxX0-x2R5yXG9kVaTEjd00-ju-71NLSo67wwlo";
const TERMINAL_ID = "RESQWAVE004"; // must exist

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