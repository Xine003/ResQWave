const express = require("express");
const router = express.Router();
const {
    createTerminal,
    getOnlineTerminals,
    getOfflineTerminals,
    getTerminals,
    getTerminal,
    updateTerminal,
    archivedTerminal,
    getArchivedTerminals
} = require("../controllers/terminalController");

// CRUD + Archived
router.post("/", createTerminal);
router.get("/", getTerminals);
router.get("/archived", getArchivedTerminals);
router.get("/:id", getTerminal);
router.get("/online", getOnlineTerminals);
router.get("/offline", getOfflineTerminals);
router.put("/:id", updateTerminal);
router.delete("/:id", archivedTerminal);

module.exports = router;