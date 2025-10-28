const { AppDataSource } = require("../config/dataSource");
const rescueFormRepo = AppDataSource.getRepository("RescueForm");
const alertRepo = AppDataSource.getRepository("Alert");
const neighborhoodRepo = AppDataSource.getRepository("Neighborhood");
const terminalRepo = AppDataSource.getRepository("Terminal");
const {
  getCache, 
  setCache,
  deleteCache
} = require("../config/cache");

// CREATE Rescue Form
const createRescueForm = async (req, res) => {
    try {
        const { alertID } = req.params;
        
        console.log('[RescueForm] Creating rescue form for alert:', alertID);
        console.log('[RescueForm] Request body:', JSON.stringify(req.body, null, 2));

        // Check if the Alert exists
        const alert = await alertRepo.findOne({ where: { id: alertID } });
        if (!alert) {
            console.log('[RescueForm] Alert not found:', alertID);
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

        // Get focalPersonID from neighborhood relationship
        const neighborhood = await neighborhoodRepo.findOne({
            where: { terminalID: alert.terminalID }
        });

        const focalPersonID = neighborhood?.focalPersonID || null;

        const {
            focalUnreachable,
            waterLevel,
            waterLevelDetails,
            urgencyOfEvacuation,
            urgencyDetails,
            hazardPresent,
            hazardDetails,
            accessibility,
            accessibilityDetails,
            resourceNeeds,
            resourceDetails,
            otherInformation,
            status = 'Waitlisted' // Default status
        } = req.body;

        //  Validation: if focal is reachable, all main fields are required
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

        // Get Logged-In Dispatcher (or Admin)
        const dispatcherID = req.user?.id;
        const userRole = req.user?.role?.toLowerCase();
        
        console.log('[RescueForm] Dispatcher ID from req.user:', dispatcherID);
        console.log('[RescueForm] User role:', userRole);
        
        if (!dispatcherID) {
          return res.status(401).json({message: "Unauthorized: User Not Found"});
        }
        
        // If user is admin, check if dispatcher with this ID exists
        // If not, we'll allow admin to bypass the constraint by setting dispatcherID to null
        let finalDispatcherID = dispatcherID;
        if (userRole === 'admin') {
            // For admins, we'll try to find a dispatcher with the same ID
            // If not found, set to null (we'll need to remove the NOT NULL constraint)
            console.log('[RescueForm] Admin user detected, allowing rescue form creation');
            // For now, we'll keep the admin ID - you may want to assign a default dispatcher
        }

        // Combine main selection with details
        const waterLevelCombined = waterLevelDetails 
            ? `${waterLevel} - ${waterLevelDetails}` 
            : waterLevel;
        
        const urgencyCombined = urgencyDetails 
            ? `${urgencyOfEvacuation} - ${urgencyDetails}` 
            : urgencyOfEvacuation;
        
        const hazardCombined = hazardDetails 
            ? `${hazardPresent} - ${hazardDetails}` 
            : hazardPresent;
        
        const accessibilityCombined = accessibilityDetails 
            ? `${accessibility} - ${accessibilityDetails}` 
            : accessibility;
        
        const resourcesCombined = resourceDetails 
            ? `${resourceNeeds} - ${resourceDetails}` 
            : resourceNeeds;

        const newForm = rescueFormRepo.create({
            id: newID,
            emergencyID: alert.id,
            dispatcherID: finalDispatcherID,
            focalPersonID,
            focalUnreachable,
            waterLevel: waterLevelCombined || null,
            urgencyOfEvacuation: urgencyCombined || null,
            hazardPresent: hazardCombined || null,
            accessibility: accessibilityCombined || null,
            resourceNeeds: resourcesCombined || null,
            otherInformation: otherInformation || null,
            status: status // 'Waitlisted' or 'Dispatched'
        });

        console.log('[RescueForm] About to save form:', JSON.stringify(newForm, null, 2));
        await rescueFormRepo.save(newForm);
        console.log('[RescueForm] Form saved successfully:', newForm.id);

        // Update alert and terminal when dispatched
        if (status === 'Dispatched') {
            alert.status = 'Dispatched';
            alert.alertType = null; // Clear alert type since rescue is complete
            await alertRepo.save(alert);
            console.log('[RescueForm] Alert updated: status=Dispatched, alertType=null');

            // Keep terminal online (rescue is done)
            const terminal = await terminalRepo.findOne({ where: { id: alert.terminalID } });
            if (terminal) {
                terminal.status = 'Online';
                await terminalRepo.save(terminal);
                console.log('[RescueForm] Terminal kept online:', terminal.id);
            }
        }

        // Invalidate Cache
        const cacheKey = `rescueForm:${alertID}`;
        const existingCache = await getCache(cacheKey);
        if (existingCache) {
          await deleteCache(cacheKey);
          console.log(`[Cache] Invalidated: ${cacheKey}`);
        }

        res.status(201).json(newForm);
    } catch (err) {
        console.error('[RescueForm Controller] Error creating rescue form:', err);
        res.status(500).json({ 
            message: "Server Error",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
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

// UPDATE Rescue Form Status (for dispatching waitlisted forms)
const updateRescueFormStatus = async (req, res) => {
    try {
        const { alertID } = req.params;
        const { status } = req.body;

        console.log('[RescueForm] Updating status for alert:', alertID, 'to:', status);

        // Find existing form
        const form = await rescueFormRepo.findOne({ where: { emergencyID: alertID } });
        if (!form) {
            return res.status(404).json({ message: "Rescue Form Not Found" });
        }

        // Update status
        form.status = status;
        await rescueFormRepo.save(form);

        // Update alert and terminal when dispatched
        if (status === 'Dispatched') {
            const alert = await alertRepo.findOne({ where: { id: alertID } });
            if (alert) {
                alert.status = 'Dispatched';
                alert.alertType = null; // Clear alert type since rescue is complete
                await alertRepo.save(alert);
                console.log('[RescueForm] Alert updated: status=Dispatched, alertType=null');

                // Keep terminal online (rescue is done)
                const terminal = await terminalRepo.findOne({ where: { id: alert.terminalID } });
                if (terminal) {
                    terminal.status = 'Online';
                    await terminalRepo.save(terminal);
                    console.log('[RescueForm] Terminal kept online:', terminal.id);
                }
            }
        }

        // Invalidate Cache
        const cacheKey = `rescueForm:${alertID}`;
        await deleteCache(cacheKey);

        console.log('[RescueForm] Status updated successfully');
        res.json(form);
    } catch (err) {
        console.error('[RescueForm Controller] Error updating status:', err);
        res.status(500).json({ 
            message: "Server Error",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};


module.exports = {
    createRescueForm,
    getRescueForm,
    getRescueForms,
    updateRescueFormStatus
};