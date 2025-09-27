const { AppDataSource } = require("../config/dataSource");
const alertRepo = AppDataSource.getRepository("Alert");
const postRescueRepo = AppDataSource.getRepository("PostRescueForm");
const rescueFormRepo = AppDataSource.getRepository("RescueForm");
const dispatcherRepo = AppDataSource.getRepository("Dispatcher");
const communityGroupRepo = AppDataSource.getRepository("CommunityGroup");

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

        // Update Rescue Form Status -> Completed
        rescueForm.status = "Completed";
        await rescueFormRepo.save(rescueForm);

        return res.status(201).json({message: "Post Rescue Form Created"}, newForm);
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Server Error"});
    }
};

// GET Completed Reports
const getCompletedReports = async (req, res) => {
  try {
    const reports = await alertRepo
      .createQueryBuilder("alert")
      .leftJoin("alert.terminal", "terminal")
      .leftJoin("CommunityGroup", "cg", "cg.terminalID = terminal.id")
      .leftJoin("RescueForm", "rescueForm", "rescueForm.emergencyID = alert.id")
      .leftJoin("Dispatcher", "dispatcher", "dispatcher.id = rescueForm.dispatcherID")
      .leftJoin("PostRescueForm", "prf", "prf.alertID = alert.id")
      .where("rescueForm.status = :status", { status: "Completed" })
      .select([
        "alert.id AS alertId",
        "cg.communityGroupName AS communityGroupName",
        "alert.alertType AS alertType",
        "dispatcher.name AS dispatcherName",
        "rescueForm.status AS rescueStatus",
        "prf.completedAt AS completedAt",
        "cg.address AS communityAddress",
      ])
      .orderBy("prf.completedAt", "DESC")
      .getRawMany();

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET Pending Reports
const getPendingReports = async (req, res) => {
  try {
    const pending = await alertRepo
      .createQueryBuilder("alert")
      .leftJoin("alert.terminal", "terminal")
      .leftJoin("CommunityGroup", "cg", "cg.terminalID = terminal.id")
      .leftJoin("RescueForm", "rescueForm", "rescueForm.emergencyID = alert.id")
      .leftJoin("Dispatcher", "dispatcher", "dispatcher.id = rescueForm.dispatcherID")
      .leftJoin("PostRescueForm", "prf", "prf.alertID = alert.id")
      .where("rescueForm.id IS NOT NULL")
      .andWhere("rescueForm.status = :status", { status: "Pending" })
      .andWhere("prf.id IS NULL") // ensure not yet completed
      .select([
        "alert.id AS alertId",
        "cg.communityGroupName AS communityGroupName",
        "alert.alertType AS alertType",
        "dispatcher.name AS dispatcherName",
        "rescueForm.status AS rescueStatus",
        "alert.dateTimeSent AS createdAt",
        "cg.address AS communityAddress",
      ])
      .orderBy("alert.dateTimeSent", "DESC")
      .getRawMany();

    res.json(pending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};



module.exports = { 
    createPostRescueForm,
    getCompletedReports,
    getPendingReports
};

