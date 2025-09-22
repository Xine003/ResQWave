const express = require("express");
const router = express.Router();
const {
    createCommunityGroup,
    getCommunityGroups,
    getCommunityGroup,
    updateCommunityBoundary,
    updateCommunityGroup,
    archivedCommunityGroup,
    getArchivedCommunityGroup
} = require("../controllers/communityController");

// CRUD + Archived
router.post("/", createCommunityGroup);
router.get("/", getCommunityGroups);
router.get("/:id", getCommunityGroup);
router.get("/archived", getArchivedCommunityGroup);
router.put("/:id/boundary", updateCommunityBoundary);
router.put("/:id", updateCommunityGroup);
router.delete("/:id", archivedCommunityGroup);


module.exports = router;