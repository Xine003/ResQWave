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
    viewMapOwnCommunityGroup,
    viewOtherCommunityGroups,
    viewAboutYourCommunityGroup,
} = require("../controllers/communityController");
const { requireRole } = require("../middleware/authMiddleware");


// CRUD + Archived 
router.post("/", createCommunityGroup);
router.get("/archived", getArchivedCommunityGroup);

// For Focal Person
router.get("/map/own", requireRole("focalPerson"), viewMapOwnCommunityGroup);
router.get("/map/others", requireRole("focalPerson"), viewOtherCommunityGroups);
router.get("/own", requireRole("focalPerson"), viewAboutYourCommunityGroup);


router.get("/", getCommunityGroups);
router.get("/:id", getCommunityGroup);
router.put("/:id/boundary", updateCommunityBoundary);
router.put("/:id", updateCommunityGroup);
router.delete("/:id", archivedCommunityGroup);


module.exports = router;