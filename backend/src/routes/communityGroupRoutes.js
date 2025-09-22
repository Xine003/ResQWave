const express = require("express");
const router = express.Router();
const {
    createCommunityGroup,
    getCommunityGroups,
    getCommunityGroup,
    updateCommunityBoundary,
    updateCommunityGroup,
    archivedCommunityGroup,
    getArchivedCommunityGroup,
    viewOwnCommunityGroup,
    viewOtherCommunityGroups,
} = require("../controllers/communityController");
const { requireRole } = require("../middleware/authMiddleware");


// CRUD + Archived 
router.post("/", createCommunityGroup);
router.get("/archived", getArchivedCommunityGroup);

// For Focal Person
router.get("/own", requireRole("focalPerson"), viewOwnCommunityGroup);
router.get("/others", requireRole("focalPerson"), viewOtherCommunityGroups);
router.get("/", getCommunityGroups);
router.get("/:id", getCommunityGroup);
router.put("/:id/boundary", updateCommunityBoundary);
router.put("/:id", updateCommunityGroup);
router.delete("/:id", archivedCommunityGroup);


module.exports = router;