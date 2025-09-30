const fs = require("fs");
const path = require("path");
const createReport = require("docx-templates").default;
const PizZip = require("pizzip");

const { AppDataSource } = require("../config/dataSource");
const alertRepo = AppDataSource.getRepository("Alert");
const rescueFormRepo = AppDataSource.getRepository("RescueForm");
const postRescueRepo = AppDataSource.getRepository("PostRescueForm");
const communityRepo = AppDataSource.getRepository("CommunityGroup");
const focalRepo = AppDataSource.getRepository("FocalPerson");

const generateRescueReport = async (req, res) => {
  try {
    const { alertID } = req.params;
    if (!alertID) return res.status(400).json({message: "AlertID Required"});

    // Load alert WITH terminal relation (adjust relation name if different)
    const alert = await alertRepo.findOne({
      where: { id: alertID },
      relations: ["terminal"]   
    });
    if (!alert) return res.status(404).json({ message: "Alert Not Found" });

    const rescueForm = await rescueFormRepo.findOne({where: {emergencyID: alertID} });
    if (!rescueForm) return res.status(400).json({message: "Rescue Form Missing"});
    if (rescueForm.status !== "Completed") {
        return res.status(400).json({message: "Rescue Form Status Should be Completed"});
    }

    const postRescue = await postRescueRepo.findOne({where: {alertID} });
    if (!postRescue) return res.status(400).json({message: "Post Rescue Form Missing"});

    // Terminal ID candidate (relation id OR column)
    const terminalIdCandidate =
      (alert.terminal && alert.terminal.id) ||
      alert.terminalID || // raw column
      null;

    // Derive CommunityGroup via TerminalID
    let communityGroup = null;
    if (terminalIdCandidate) {
      communityGroup = await communityRepo
        .createQueryBuilder("cg")
        .where("cg.terminalID = :tid", { tid: terminalIdCandidate })
        .getOne();
    }

    if (!communityGroup) {
      return res.status(400).json({ message: "Community Group Missing"});
    }

    // Pick Focal Person
    let focalPerson = await focalRepo.findOne({
        where: { communityGroupID: communityGroup.id, archived: false},
    });

    if (!focalPerson) {
        focalPerson = await focalRepo.findOne({
            where: {communityGroupID: communityGroup.id}
        });
    }

    // MAP DB Fields to Template
    const data = {
        community_group_id: communityGroup.id,
        community_group_name: communityGroup.communityGroupName,
        focal_person_name: focalPerson?.name || "",
        community_group_address: communityGroup.address || "",
        focal_person_number: focalPerson?.contactNumber || "",
        alert_id: alert.id,
        water_level: rescueForm.waterLevel || "",
        urgency_of_evacuation: rescueForm.urgencyOfEvacuation || "",
        hazard_present: rescueForm.hazardPresent || "",
        accessibility: rescueForm.accessibility || "",
        resource_needs: rescueForm.resourceNeeds || "",
        other_information: rescueForm.otherInformation || "",
        time_of_rescue: postRescue.createdAt ? new Date(postRescue.createdAt).toLocaleString() : "",
        alert_type: alert.alertType || "",
    };

    const templatePath = path.resolve(__dirname, "../template/Rescue_Operation_Report.docx");
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ message: "Template not found", path: templatePath });
    }

    const template = fs.readFileSync(templatePath);
    const zipDbg = new PizZip(template);
    const docXml = zipDbg.file("word/document.xml")?.asText() || "";

    // Auto-detect delimiter style (single {var} vs {{var}})
    const usesDouble = /{{[^{}]+}}/.test(docXml);

    const buffer = await createReport({
      template,
      data,
      ...(usesDouble ? { cmdDelimiter: ["{{","}}"] } : {}),
      nullGetter: () => ""
    });

    // ----- Filename Convention -----
    const seq = (communityGroup.id.match(/(\d+)/)?.[1] || "001").padStart(3, "0");
    const safeName = (communityGroup.communityGroupName || "CommunityGroup")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .substring(0, 40) || "CommunityGroup";
    const fileName = `${safeName}_${seq}.docx`;
    // --------------------------------

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", buffer.length);
    return res.end(Buffer.from(buffer));
  } catch (err) {
    console.error("Report error:", err);
    return res.status(500).json({ message: "Generate Error", error: err.message });
  }
};

module.exports = { generateRescueReport };
