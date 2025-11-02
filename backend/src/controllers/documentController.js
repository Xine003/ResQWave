const fs = require("fs");
const path = require("path");
const createReport = require("docx-templates").default;
const PizZip = require("pizzip");

const {
  getCache,
  setCache,
} = require("../config/cache");
const { AppDataSource } = require("../config/dataSource");
const alertRepo = AppDataSource.getRepository("Alert");
const rescueFormRepo = AppDataSource.getRepository("RescueForm");
const postRescueRepo = AppDataSource.getRepository("PostRescueForm");
const neighborhoodRepo = AppDataSource.getRepository("Neighborhood");
const focalRepo = AppDataSource.getRepository("FocalPerson");
// removed unused deleteCache and communityRepo variables

const generateRescueReport = async (req, res) => {
  try {
    const { alertID } = req.params;
    if (!alertID) return res.status(400).json({ message: "AlertID Required" });

    const cacheKey = `report:alert:${alertID}`;

    // Allow forced regeneration with ?refresh
    if (req.query.refresh !== "1") {
      const cached = await getCache(cacheKey);
      if (cached) {
        const buf = Buffer.from(cached.buffer, "base64");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename="${cached.fileName}"`);
        res.setHeader("X-Report-Cache", "HIT");
        return res.end(buf);
      }
    }

    // Load alert WITH terminal relation
    const alert = await alertRepo.findOne({
      where: { id: alertID },
      relations: ["terminal"]
    });
    if (!alert) return res.status(404).json({ message: "Alert Not Found" });

    const rescueForm = await rescueFormRepo.findOne({ where: { emergencyID: alertID } });
    if (!rescueForm) return res.status(400).json({ message: "Rescue Form Missing" });
    if (rescueForm.status !== "Completed") {
      return res.status(400).json({ message: "Rescue Form Status Should be Completed" });
    }

    const postRescue = await postRescueRepo.findOne({ where: { alertID } });
    if (!postRescue) return res.status(400).json({ message: "Post Rescue Form Missing" });

    // Terminal/Neighborhood linkage
    const terminalIdCandidate = (alert.terminal && alert.terminal.id) || alert.terminalID || null;

    // Derive Neighborhood via TerminalID
    let neighborhood = null;
    if (terminalIdCandidate) {
      neighborhood = await neighborhoodRepo
        .createQueryBuilder("n")
        .where("n.terminalID = :tid", { tid: terminalIdCandidate })
        .getOne();
    }
    if (!neighborhood) {
      return res.status(400).json({ message: "Neighborhood Missing" });
    }

    // Pick Focal Person via Neighborhood.focalPersonID
    let focalPerson = null;
    if (neighborhood.focalPersonID) {
      focalPerson = await focalRepo.findOne({
        where: { id: neighborhood.focalPersonID, archived: false }
      }) || await focalRepo.findOne({ where: { id: neighborhood.focalPersonID } });
    }

    const terminalName = alert.terminal?.name || "";

    const focalName = focalPerson
      ? ([focalPerson.firstName, focalPerson.lastName].filter(Boolean).join(" ").trim() ||
        focalPerson.name || "")
      : "";

    const data = {
      neighborhood_id: neighborhood.id,
      terminal_name: terminalName,
      focal_person_name: focalName,
      focal_person_address: focalPerson?.address || "",
      focal_person_number: focalPerson?.contactNumber || "",
      alert_id: alert.id,
      water_level: rescueForm.waterLevel || "",
      urgency_of_evacuation: rescueForm.urgencyOfEvacuation || "",
      hazard_present: rescueForm.hazardPresent || "",
      accessibility: rescueForm.accessibility || "",
      resource_needs: rescueForm.resourceNeeds || "",
      other_information: rescueForm.otherInformation || "",
      time_of_rescue: (postRescue.completedAt || postRescue.createdAt)
        ? new Date(postRescue.completedAt || postRescue.createdAt).toLocaleString()
        : "",
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
      ...(usesDouble ? { cmdDelimiter: ["{{", "}}"] } : {}),
      nullGetter: () => ""
    });

    // ----- Filename Convention -----
    const seq = (String(neighborhood.id).match(/(\d+)/)?.[1] || "001").padStart(3, "0");
    const safeName = (terminalName || "Terminal")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .substring(0, 40) || "Terminal";
    const fileName = `${safeName}_${seq}.docx`;
    // --------------------------------

    // Store in Cache (1 Hour TTL)
    await setCache(cacheKey, {
      fileName,
      buffer: Buffer.from(buffer).toString("base64")
    }, 3600);

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
