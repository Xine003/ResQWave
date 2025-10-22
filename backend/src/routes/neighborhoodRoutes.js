const express = require("express");
const router = express.Router();
const {
  getNeighborhoods,
  getNeighborhood,
  viewMapOwnNeighborhood,
  viewAboutYourNeighborhood,
  viewOtherNeighborhoods,
  updateNeighborhood,
  archivedNeighborhood,
  getArchivedNeighborhoods,
} = require("../controllers/neighborhoodController");
const { requireRole } = require("../middleware/authMiddleware");


// CRUD + Archived 
router.get("/archived", getArchivedNeighborhoods);

// For Focal Person
router.get("/map/own", requireRole("focalPerson"), viewMapOwnNeighborhood);
router.get("/map/others", requireRole("focalPerson"), viewOtherNeighborhoods);
router.get("/own", requireRole("focalPerson"), viewAboutYourNeighborhood);


router.get("/", getNeighborhoods);
router.get("/:id", getNeighborhood);
router.put("/:id", updateNeighborhood);
router.delete("/:id", archivedNeighborhood);


module.exports = router;