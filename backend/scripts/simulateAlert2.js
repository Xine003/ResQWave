const { io } = require("socket.io-client");

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkRTUDAwMSIsIm5hbWUiOiJPcmlnaW5hbCBSZXNRV2F2ZSIsInJvbGUiOiJkaXNwYXRjaGVyIiwic2Vzc2lvbklEIjoiOTUxOTc4ZTctNTUxMi00Mjg4LWEwNDctYmIyMjQxMjRiNTdiIiwiaWF0IjoxNzU4ODA3MDE4LCJleHAiOjE3NTg4MTA2MTh9.CmeDU458mzacxbcYlFn_ymE6Pj15h92Kbo_bihCERaw";
const TERMINAL_ID = "RESQWAVE003"; // must exist

const socket = io("http://localhost:5000", { auth: { token: TOKEN } });

socket.on("connect", () => {
  console.log("Simulator connected:", socket.id);
  socket.emit("terminal:join", { terminalId: TERMINAL_ID });

socket.emit(
  "alert:trigger",
  {
    terminalId: TERMINAL_ID,
    alertType: "User-Initiated",
    sentThrough: "Sensor",
    status: "Unassigned"
  },
  (ack) => console.log("ack:", ack)
  );
});

socket.on("connect_error", (e) => console.error("connect_error:", e.message));