const { AppDataSource } = require("../config/dataSource");
const alertRepo = AppDataSource.getRepository("Alert");
const postRescueRepo = AppDataSource.getRepository("PostRescueForm");
const rescueFormRepo = AppDataSource.getRepository("RescueForm");
const dispatcherRepo = AppDataSource.getRepository("Dispatcher");
const communityGroupRepo = AppDataSource.getRepository("CommunityGroup");
const {
  getCache,
  setCache,
  deleteCache
} = require("../config/cache");

// CREATE POST RESCUE FORM
const createPostRescueForm = async (req, res) => {
    try {
        const {alertID} = req.params;
        const { noOfPersonnelDeployed, resourcesUsed, actionTaken} = req.body;

        // Check if the Alert Exist
        const alert = await alertRepo.findOne({where: {id: alertID} });
        if (!alert) return res.status(404).json({message: "Alert Not Found"});

        // Only Allowed if the Alert is "Dispatched"
        if (alert.status !== "Dispatched") {
            return res.status(400).json({message: "Please Dispatched a Rescue Team First"});
        }

        const rescueForm = await rescueFormRepo.findOne({ where: {emergencyID: alertID} });
        if (!rescueForm) {
            return res.status(400).json({message: "Rescue Form Not Found"});
        }
            
        // Prevent Duplication
        const existing = await postRescueRepo.findOne({where: {alertID} });
        if (existing) return res.status(400).json({message: "Post Rescue Form Already Exists"});

        // Create the Post Rescue Form
        const newForm = postRescueRepo.create({
            alertID,
            noOfPersonnelDeployed,
            resourcesUsed,
            actionTaken,
            completedAt: new Date()
        });

        await postRescueRepo.save(newForm);

        // Update Rescue Form Status -> Completed (marks the rescue as finished)
        rescueForm.status = "Completed";
        await rescueFormRepo.save(rescueForm);

        // Cache invalidation - clear all relevant caches immediately for real-time updates
        await deleteCache("completedReports");
        await deleteCache("pendingReports");
        await deleteCache("rescueForms:all");
        await deleteCache(`rescueForm:${rescueForm.id}`);
        await deleteCache(`alert:${alertID}`);
        await deleteCache("aggregatedReports:all");
        await deleteCache("aggregatedPRF:all");
        await deleteCache(`rescueAggregatesBasic:all`);
        await deleteCache(`rescueAggregatesBasic:${alertID}`);
        await deleteCache(`aggregatedReports:${alertID}`);
        await deleteCache(`aggregatedPRF:${alertID}`);

        return res.status(201).json({message: "Post Rescue Form Created", newForm});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Server Error"});
    }
};

// GET Completed Reports
const getCompletedReports = async (req, res) => {
  try {
    const cacheKey = "completedReports";
    const bypassCache = req.query.refresh === 'true';
    
    // Check cache only if not bypassing
    if (!bypassCache) {
      const cached = await getCache(cacheKey);
      if (cached) {
        res.set('Cache-Control', 'public, max-age=300');
        return res.json(cached);
      }
    }

    const reports = await alertRepo
      .createQueryBuilder("alert")
      .leftJoin("alert.terminal", "terminal")
      .leftJoin("Neighborhood", "n", "n.terminalID = terminal.id")
      .leftJoin("FocalPerson", "fp", "fp.id = n.focalPersonID")
      .leftJoin("RescueForm", "rescueForm", "rescueForm.emergencyID = alert.id")
      .leftJoin("Dispatcher", "dispatcher", "dispatcher.id = rescueForm.dispatcherID")
      .leftJoin("PostRescueForm", "prf", "prf.alertID = alert.id")
      .where("rescueForm.status = :status", { status: "Completed" })
      .select([
        "alert.id AS alertId",
        "terminal.name AS terminalName",
        "rescueForm.originalAlertType AS alertType", // Use original alert type from rescue form
        "dispatcher.name AS dispatcherName",
        "rescueForm.status AS rescueStatus",
        "prf.completedAt AS completedAt",
        "fp.address AS address",
      ])
      .orderBy("prf.completedAt", "DESC")
      .getRawMany();

    // Update cache with fresh data (balanced TTL for responsiveness)
    await setCache(cacheKey, reports, 60);
    res.set('Cache-Control', 'public, max-age=60');
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getPendingReports = async (req, res) => {
  try {
    const cacheKey = "pendingReports";
    const bypassCache = req.query.refresh === 'true';
    
    // Check cache only if not bypassing
    if (!bypassCache) {
      const cached = await getCache(cacheKey);
      if (cached) {
        res.set('Cache-Control', 'public, max-age=300');
        return res.json(cached);
      }
    }

    const pending = await alertRepo
      .createQueryBuilder("alert")
      .leftJoin("alert.terminal", "terminal")
      .leftJoin("Neighborhood", "n", "n.terminalID = terminal.id")
      .leftJoin("FocalPerson", "fp", "fp.id = n.focalPersonID")
      .leftJoin("RescueForm", "rescueForm", "rescueForm.emergencyID = alert.id")
      .leftJoin("Dispatcher", "dispatcher", "dispatcher.id = rescueForm.dispatcherID")
      .leftJoin("PostRescueForm", "prf", "prf.alertID = alert.id")
      .where("rescueForm.id IS NOT NULL")
      .andWhere("rescueForm.status = :status", { status: "Dispatched" })
      .andWhere("prf.id IS NULL")
      .select([
        "alert.id AS alertId",
        "terminal.name AS terminalName",
        "rescueForm.originalAlertType AS alertType", // Use original alert type from rescue form
        "dispatcher.name AS dispatcherName",
        "rescueForm.status AS rescueStatus",
        "alert.dateTimeSent AS createdAt",
        "fp.address AS address",
      ])
      .orderBy("alert.dateTimeSent", "DESC")
      .getRawMany();

    // Update cache with fresh data (balanced TTL for responsiveness)
    await setCache(cacheKey, pending, 1); // 1 minute cache like terminals
    res.set('Cache-Control', 'public, max-age=1');
    res.json(pending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Aggregated
// All of the Data in Document
const getAggregatedRescueReports = async (req, res) => {
  try {
    const { alertID } = req.query || {};
    const cacheKey = alertID ? `aggregatedReports:${alertID}` : `aggregatedReports:all`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    let qb = alertRepo
      .createQueryBuilder("alert")
      .leftJoin("alert.terminal", "terminal")
      .leftJoin("Neighborhood", "n", "n.terminalID = terminal.id")
      .leftJoin("FocalPerson", "fp", "fp.id = n.focalPersonID")
      .leftJoin("RescueForm", "rf", "rf.emergencyID = alert.id")
      .leftJoin("PostRescueForm", "prf", "prf.alertID = alert.id");

    if (alertID) {
      qb = qb.where("alert.id = :alertID", { alertID })
             .andWhere("rf.status = :rfStatus", { rfStatus: "Dispatched" });
    } else {
      // Only include those with a RescueForm that is Dispatched
      qb = qb.where("rf.status = :rfStatus", { rfStatus: "Dispatched" });
    }

    const rows = await qb
      .select([
        "n.id AS neighborhoodId",
        "fp.firstName AS fpFirstName",
        "fp.lastName AS fpLastName",
        "fp.address AS fpAddress",
        "fp.contactNumber AS fpContactNumber",
        "alert.id AS alertId",
        "rf.emergencyID AS emergencyId",
        "rf.waterLevel AS waterLevel",
        "rf.urgencyOfEvacuation AS urgencyOfEvacuation",
        "rf.hazardPresent AS hazardPresent",
        "rf.accessibility AS accessibility",
        "rf.resourceNeeds AS resourceNeeds",
        "rf.otherInformation AS otherInformation",
        "rf.originalAlertType AS alertType", // Use original alert type from rescue form
        "prf.createdAt AS prfCreatedAt",
        "prf.completedAt AS prfCompletedAt",
        "prf.noOfPersonnelDeployed AS noOfPersonnel",
        "prf.resourcesUsed AS resourcesUsed",
        "prf.actionTaken AS actionsTaken",
      ])
      .orderBy("alert.dateTimeSent", "DESC")
      .getRawMany();

    const data = rows.map(r => {
      const timeOfRescue = r.prfCreatedAt || null;
      const completedAt = r.prfCompletedAt || null;
      const rescueCompleted = !!completedAt;

      let rescueCompletionTime = null;
      if (timeOfRescue && completedAt) {
        const start = new Date(timeOfRescue).getTime();
        const end = new Date(completedAt).getTime();
        const diffMs = Math.max(0, end - start);
        // Format as HH:MM:SS
        const totalSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const hh = String(hours).padStart(2, "0");
        const mm = String(minutes).padStart(2, "0");
        const ss = String(seconds).padStart(2, "0");
        rescueCompletionTime = `${hh}:${mm}:${ss}`;
      }

      return {
        neighborhoodId: r.neighborhoodId || null,
        focalPersonName: [r.fpFirstName, r.fpLastName].filter(Boolean).join(" ") || null,
        focalPersonAddress: r.fpAddress || null,
        focalPersonContactNumber: r.fpContactNumber || null,

        emergencyId: r.emergencyId || r.alertId || null,
        waterLevel: r.waterLevel || null,
        urgencyOfEvacuation: r.urgencyOfEvacuation || null,
        hazardPresent: r.hazardPresent || null,
        accessibility: r.accessibility || null,
        resourceNeeds: r.resourceNeeds || null,
        otherInformation: r.otherInformation || null,
        timeOfRescue, // PostRescueForm.createdAt
        alertType: r.alertType || null,

        rescueCompleted,
        rescueCompletionTime, // human (e.g., "1h 12m")
        noOfPersonnel: r.noOfPersonnel || null,
        resourcesUsed: r.resourcesUsed || null,
        actionsTaken: r.actionsTaken || null,
      };
    });

    await setCache(cacheKey, data, 300);
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Post Rescue Form
// Complete Table 
const getAggregatedPostRescueForm = async (req, res) => {
    try {
        const { alertID } = req.query || {};
        const cacheKey = alertID ? `aggregatedPRF:${alertID}` : `aggregatedPRF:all`;
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);

        let qb = postRescueRepo
            .createQueryBuilder("prf")
            .leftJoin("prf.alerts", "alert")
            .leftJoin("rescueforms", "rf", "rf.emergencyID = alert.id")
            .leftJoin("focalpersons", "fp", "fp.id = rf.focalPersonID")
            .leftJoin("dispatchers", "dispatcher", "dispatcher.id = rf.dispatcherID");

        if (alertID) {
            qb = qb.where("prf.alertID = :alertID", { alertID });
        }

        const rows = await qb
            .select([
                "rf.emergencyID AS emergencyId",
                "alert.terminalID AS terminalId",
                "fp.firstName AS focalFirstName",
                "fp.lastName AS focalLastName",
                "alert.dateTimeSent AS dateTimeOccurred",
                "rf.originalAlertType AS alertType", // Use original alert type from rescue form
                "fp.address AS houseAddress",
                "dispatcher.name AS dispatchedName",
                "prf.completedAt AS completionDate",
            ])
            .orderBy("prf.completedAt", "DESC")
            .getRawMany();

        await setCache(cacheKey, rows, 300);
        return res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Clear Cache Endpoint
const clearReportsCache = async (req, res) => {
    try {
        await deleteCache("completedReports");
        await deleteCache("pendingReports");
        await deleteCache("rescueForms:all");
        
        // Clear all aggregated cache keys that might exist
        const keys = [
            "aggregatedReports:all",
            "aggregatedPRF:all"
        ];
        
        for (const key of keys) {
            await deleteCache(key);
        }
        
        res.json({ message: "Reports cache cleared successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Fix Data: Update RescueForm status to "Completed" for alerts with PostRescueForm records
const fixRescueFormStatus = async (req, res) => {
    try {
        console.log('[FixData] Starting rescue form status fix...');
        
        // Get all PostRescueForm records
        const postRescueForms = await postRescueRepo.find({
            select: ["alertID"]
        });
        
        if (postRescueForms.length === 0) {
            return res.json({ message: "No PostRescueForm records found", fixed: 0 });
        }
        
        const alertIds = postRescueForms.map(prf => prf.alertID);
        console.log('[FixData] Found PostRescueForm records for alerts:', alertIds);
        
        // Find RescueForm records for these alerts that don't have status "Completed"
        const rescueFormsToUpdate = await rescueFormRepo
            .createQueryBuilder("rescueForm")
            .where("rescueForm.emergencyID IN (:...alertIds)", { alertIds })
            .andWhere("rescueForm.status != :status", { status: "Completed" })
            .getMany();
            
        console.log('[FixData] Found rescue forms to update:', rescueFormsToUpdate.map(rf => ({ id: rf.id, emergencyID: rf.emergencyID, currentStatus: rf.status })));
        
        // Update the status to "Completed"
        let updatedCount = 0;
        for (const rescueForm of rescueFormsToUpdate) {
            rescueForm.status = "Completed";
            await rescueFormRepo.save(rescueForm);
            updatedCount++;
            console.log(`[FixData] Updated RescueForm ${rescueForm.id} status to "Completed"`);
        }
        
        // Clear cache after fixing data
        await deleteCache("completedReports");
        await deleteCache("pendingReports");
        
        res.json({ 
            message: `Fixed ${updatedCount} rescue form statuses`,
            fixed: updatedCount,
            alertIds: alertIds
        });
    } catch (err) {
        console.error('[FixData] Error:', err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Migration Helper: Update existing rescue forms with original alert types
const migrateOriginalAlertTypes = async (req, res) => {
    try {
        const rescueForms = await rescueFormRepo
            .createQueryBuilder("rf")
            .leftJoin("Alert", "alert", "alert.id = rf.emergencyID")
            .where("rf.originalAlertType IS NULL")
            .andWhere("alert.alertType IS NOT NULL")
            .select([
                "rf.id AS rescueFormId",
                "rf.emergencyID AS alertId", 
                "alert.alertType AS currentAlertType"
            ])
            .getRawMany();

        let updatedCount = 0;
        for (const form of rescueForms) {
            await rescueFormRepo.update(
                { id: form.rescueFormId },
                { originalAlertType: form.currentAlertType }
            );
            updatedCount++;
        }

        res.json({ 
            message: `Migration completed: ${updatedCount} rescue forms updated with original alert types`,
            updatedCount 
        });
    } catch (err) {
        console.error('Migration error:', err);
        res.status(500).json({ message: "Migration Error" });
    }
};

module.exports = {
  createPostRescueForm,
  getCompletedReports,
  getPendingReports,
  getAggregatedPostRescueForm,
  getAggregatedRescueReports,
  clearReportsCache,
  migrateOriginalAlertTypes,
  fixRescueFormStatus,
};

