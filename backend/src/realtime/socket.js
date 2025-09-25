const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const { AppDataSource } = require("../config/dataSource");
const alertRepo = AppDataSource.getRepository("Alert");
const terminalRepo = AppDataSource.getRepository("Terminal");
const communityGroupRepo = AppDataSource.getRepository("CommunityGroup");

let io;

function setupSocket(server, options = {}) {
  io = new Server(server, {
    cors: { origin: options.origin || "http://localhost:5173", credentials: true },
  });

  // JWT auth for sockets
  io.use((socket, next) => {
    try {
      const header = socket.handshake.headers?.authorization || "";
      const raw = socket.handshake.auth?.token || header;
      const token = raw?.startsWith("Bearer ") ? raw.slice(7) : raw;
      if (!token) return next(new Error("UNAUTHORIZED"));
      socket.data.user = jwt.verify(token, process.env.JWT_SECRET || "ResQWave-SecretKey");
      return next();
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Socket auth failed:", e.message);
      }
      return next(new Error("FORBIDDEN"));
    }
  });

  // Helper: ALRT001-style IDs
  const generateAlertId = async () => {
    const latest = await alertRepo
      .createQueryBuilder("a")
      .orderBy("a.id", "DESC")
      .limit(1)
      .getOne();
    const n = parseInt((latest?.id || "ALRT000").replace("ALRT", ""), 10) + 1;
    return `ALRT${String(n).padStart(3, "0")}`;
  };

  io.on("connection", (socket) => {
    const user = socket.data.user;
    console.log("[socket] connected", socket.id, { role: user?.role, id: user?.id });

    // ✅ Every admin/dispatcher joins the alerts room
    if (user?.role === "admin" || user?.role === "dispatcher") {
      socket.join("alerts:all");
      console.log("[socket] joined room alerts:all");
    }

    socket.on("terminal:join", ({ terminalId }) => {
      if (terminalId) {
        socket.join(`terminal:${terminalId}`);
        console.log("[socket] joined room", `terminal:${terminalId}`);
      }
    });

    const handleTrigger = async (payload, ack) => {
      try {
        console.log("[socket] alert trigger payload:", payload);
        const { terminalId, alertType, status = alertType } = payload || {};
        if (!terminalId || !alertType) throw new Error("terminalId and alertType are required");

        const terminal = await terminalRepo.findOne({ where: { id: terminalId } });
        if (!terminal) throw new Error(`Terminal ${terminalId} not found`);

        const id = await generateAlertId();
        const entity = alertRepo.create({
          id,
          terminalID: terminalId,
          alertType,
          status, // "Critical" | "User-Initiated"
        });
        const saved = await alertRepo.save(entity);

        // Minimal, safe enrichment
        const group = await communityGroupRepo
          .createQueryBuilder("cg")
          .select(["cg.id", "cg.communityGroupName", "cg.terminalID", "cg.address"])
          .where("cg.terminalID = :terminalId", { terminalId })
          .getOne();

        const livePayload = {
          alertId: saved.id,
          terminalId,
          communityGroupName: group?.communityGroupName || null,
          alertType,
          status,
          lastSignalTime: saved.dateTimeSent || saved.createdAt || new Date(),
          address: group?.address || null,
        };

        const mapPayload = {
          communityGroupName: group?.communityGroupName || null,
          alertType,
          timeSent: saved.dateTimeSent || saved.createdAt || new Date(),
          address: group?.address || null,
          status,
        };

        console.log("[socket] broadcasting liveReport:new", livePayload);

        // Emit to dashboards
        io.to("alerts:all").emit("liveReport:new", livePayload);
        io.to("alerts:all").emit("mapReport:new", mapPayload);

        // Emit to terminal-specific room
        io.to(`terminal:${terminalId}`).emit("liveReport:new", livePayload);

        ack?.({ ok: true, alertId: saved.id });
      } catch (err) {
        console.error("[socket] alert error:", err.message);
        ack?.({ ok: false, error: err.message });
      }
    };

    socket.on("alert:trigger", handleTrigger);
    socket.on("alert:simulate", handleTrigger); // alias for testing
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized. Call setupSocket(server) first.");
  }
  return io;
}

module.exports = { setupSocket, getIO };
