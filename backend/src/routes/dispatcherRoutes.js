const express = require("express");
const router = express.Router();
const { 
    createDispatcher, 
    getDispatchers, 
    getDispatcher, 
    updateDispatcher, 
    archiveDispatcher ,
    archiveDispatchers,
} = require("../controllers/dispatcherController");

// CRUD + Archived
router.post("/", createDispatcher);
router.get ("/", getDispatchers);
router.get ("/archived", archiveDispatchers);
router.get ("/:id", getDispatcher);
router.put ("/:id", updateDispatcher);
router.delete ("/:id", archiveDispatcher);


module.exports = router;