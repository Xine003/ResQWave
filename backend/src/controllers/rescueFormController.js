const { AppDataSource } = require("../config/dataSource");
const rescueFormRepo = AppDataSource.getRepository("RescueForm");
const alertRepo = AppDataSource.getRepository("Alert");
const {
  getCache, 
  setCache,
  deleteCache
} = require("../config/cache");

// CREATE Rescue Form
const createRescueForm = async (req, res) => {
    try {
        const { alertID } = req.params;

        // Check if the Alert exists
        const alert = await alertRepo.findOne({ where: { id: alertID } });
        if (!alert) {
            return res.status(404).json({ message: "Alert Not Found" });
        }

        // Prevent Duplicate Form
        const existing = await rescueFormRepo.findOne({ where: { emergencyID: alertID } });
        if (existing) {
            return res.status(400).json({ message: "Rescue Form Already Exists" });
        }

        // Generate Custom ID
        const lastForm = await rescueFormRepo
            .createQueryBuilder("rescueform")
            .orderBy("rescueform.id", "DESC")
            .getOne();

        const newNumber = lastForm ? parseInt(lastForm.id.replace("RF", ""), 10) + 1 : 1;
        const newID = "RF" + String(newNumber).padStart(3, "0");

        const {
            focalUnreachable,
            waterLevel,
            urgencyOfEvacuation,
            hazardPresent,
            accessibility,
            resourceNeeds,
            otherInformation
        } = req.body;

        //  Validation: if focal is reachable, all fields are required
        if (focalUnreachable === false) {
            if (
                !waterLevel ||
                !urgencyOfEvacuation ||
                !hazardPresent ||
                !accessibility ||
                !resourceNeeds
            ) {
                return res.status(400).json({
                    message: "All rescue details are required when focal is reachable."
                });
            }
        }

        // Get Logged-In Dispatcher
        const dispatcherID = req.user?.id;
        if (!dispatcherID) {
          return res.status(401).json({message: "Unauthorized: Dispatcher Not Found"});
        }

        const newForm = rescueFormRepo.create({
            id: newID,
            emergencyID: alert.id,
            dispatcherID,
            focalUnreachable,
            waterLevel: waterLevel || null,
            urgencyOfEvacuation: urgencyOfEvacuation || null,
            hazardPresent: hazardPresent || null,
            accessibility: accessibility || null,
            resourceNeeds: resourceNeeds || null,
            otherInformation: otherInformation || null
        });

        await rescueFormRepo.save(newForm);

        // Invalidate Cache
        const cacheKey = `rescueForm:${alertID}`;
        const existingCache = await getCache(cacheKey);
        if (existingCache) {
          await deleteCache(cacheKey);
          console.log(`[Cache] Invalidated: ${cacheKey}`);
        }

        res.status(201).json(newForm);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};


// READ RESCUE FORM
const getRescueForm = async (req, res) => {
  try {
    const { formID } = req.params;
    const cacheKey = `rescueForm:${formID}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const form = await rescueFormRepo
      .createQueryBuilder("form")
      .leftJoinAndSelect("form.alert", "alert")
      .leftJoinAndSelect("alert.terminal", "terminal")
      .where("form.id = :id", { id: formID })
      .getOne();

    if (!form) {
      return res.status(404).json({ message: "Rescue Form Not Found" });
    }

    const responseData = {
      terminalName: form.alert?.terminal?.name || null,
      focalUnreachable: form.focalUnreachable,
      waterLevel: form.waterLevel,
      urgencyOfEvacuation: form.urgencyOfEvacuation,
      hazardPresent: form.hazardPresent,
      accessibility: form.accessibility,
      resourceNeeds: form.resourceNeeds,
      otherInformation: form.otherInformation,
    };

    await setCache(cacheKey, responseData, 300);
    res.json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Read ALL Rescue Forms
const getRescueForms = async(req, res) => {
  try {
    const cacheKey = "rescueForms:all";
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const forms = await rescueFormRepo
      .createQueryBuilder("form")
      .leftJoinAndSelect("form.alert", "alert")
      .leftJoinAndSelect("alert.terminal", "terminal")
      .orderBy("form.id", "DESC")
      .getMany();

    const data = forms.map((form) => ({
      formID: form.id,
      alertID: form.emergencyID,
      terminalName: form.alert?.terminal?.name || null,
      focalUnreachable: form.focalUnreachable,
      waterLevel: form.waterLevel,
      urgencyOfEvacuation: form.urgencyOfEvacuation,
      hazardPresent: form.hazardPresent,
      accessibility: form.accessibility,
      resourceNeeds: form.resourceNeeds,
      otherInformation: form.otherInformation,
    }));

    await setCache(cacheKey, data, 300);
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({message: "Server Error"});
  }
};


module.exports = {
    createRescueForm,
    getRescueForm,
    getRescueForms
};