const express = require("express");
const router = express.Router();
const { 
    createDispatcher, 
    getDispatchers, 
    getDispatcher, 
    updateDispatcher, 
    archiveDispatcher ,
    unarchiveDispatcher,
    archiveDispatchers,
    deleteDispatcherPermanently
} = require("../controllers/dispatcherController");

const { uploadSinglePhoto } = require("../middleware/uploadFocalPhotos");


// CRUD + Archived
router.post("/", uploadSinglePhoto, createDispatcher);
router.get ("/", getDispatchers);
router.get ("/archived", archiveDispatchers);
router.get ("/:id", getDispatcher);
router.put ("/:id", uploadSinglePhoto, updateDispatcher);
router.delete ("/:id", archiveDispatcher);
router.patch ("/:id/restore", unarchiveDispatcher);
router.delete ("/:id/permanent", deleteDispatcherPermanently);


module.exports = router;