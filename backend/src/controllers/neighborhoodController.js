// Upload alternative focal person photo
const uploadAltFocalPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files || {};
    const altPhotoFile = files.alternativeFPImage?.[0];
    if (!altPhotoFile) return res.status(400).json({ message: "No file uploaded" });

    const neighborhood = await neighborhoodRepo.findOne({ where: { id } });
    if (!neighborhood) return res.status(404).json({ message: "Neighborhood Not Found" });
    if (!neighborhood.focalPersonID) return res.status(400).json({ message: "No focal person linked" });

    const focal = await focalPersonRepo.findOne({ where: { id: neighborhood.focalPersonID } });
    if (!focal) return res.status(404).json({ message: "Focal Person Not Found" });

    focal.alternativeFPImage = altPhotoFile.buffer;
    await focalPersonRepo.save(focal);
    return res.json({ message: "Alternative focal person photo uploaded" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error - UPLOAD Alt Focal Photo" });
  }
};

// Get alternative focal person photo (returns image blob)
const getAltFocalPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const neighborhood = await neighborhoodRepo.findOne({ where: { id } });
    if (!neighborhood) return res.status(404).json({ message: "Neighborhood Not Found" });
    if (!neighborhood.focalPersonID) return res.status(400).json({ message: "No focal person linked" });

    const focal = await focalPersonRepo.findOne({ where: { id: neighborhood.focalPersonID } });
    if (!focal || !focal.alternativeFPImage) return res.status(404).json({ message: "No alternative focal person photo found" });

    // Default to jpeg, but you may want to store mimetype in DB for production
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Disposition", "inline; filename=alt-focal-photo.jpg");
    return res.end(focal.alternativeFPImage);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error - GET Alt Focal Photo" });
  }
};
const { AppDataSource } = require("../config/dataSource");
const {
  getCache,
  setCache,
  deleteCache
} = require("../config/cache");

const neighborhoodRepo = AppDataSource.getRepository("Neighborhood");
const terminalRepo = AppDataSource.getRepository("Terminal");
const focalPersonRepo = AppDataSource.getRepository("FocalPerson");

// helpers
const parseHazards = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const j = JSON.parse(v);
      return Array.isArray(j) ? j : [];
    } catch {
      // CSV fallback
      return v.split(",").map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};
const stringifyHazards = (v) => {
  if (!v) return JSON.stringify([]);
  if (typeof v === "string") {
    try { JSON.parse(v); return v; } catch { /* fallthrough */ }
  }
  try { return JSON.stringify(v); } catch { return JSON.stringify([]); }
};

// VIEW Own Neighborhood (Map-ish view + cache)
const viewMapOwnNeighborhood = async (req, res) => {
  try {
    const focalPersonID = req.user?.id || req.params.focalPersonID || req.query.focalPersonID;
    if (!focalPersonID) return res.status(400).json({ message: "Missing Focal Person ID" });

    const cacheKey = `viewMap:nb:${focalPersonID}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const focal = await focalPersonRepo.findOne({ where: { id: focalPersonID } });
    if (!focal) return res.status(404).json({ message: "Focal Person Not Found" });

    const nb = await neighborhoodRepo.findOne({
      where: { focalPersonID, archived: false },
    });
    if (!nb) return res.status(404).json({ message: "Neighborhood Not Found" });

    const payload = {
      neighborhoodID: nb.id,
      terminalID: nb.terminalID,
      focalPerson: {
        name: [focal.firstName, focal.lastName].filter(Boolean).join(" ").trim() || focal.name || null,
        alternativeFPFirstName: focal.altFirstName || null,
        alternativeFPLastName: focal.altLastName || null,
        alternativeFPEmail: focal.altEmail || null,
        alternativeFPNumber: focal.altContactNumber || null,
        alternativeFPImage: focal.alternativeFPImage || null,
      },
      address: focal.address ?? null, // your focal has address (JSON string)
      hazards: parseHazards(nb.hazards),
      createdDate: nb.createdAt ?? null,
    };

    await setCache(cacheKey, payload, 120);
    return res.json(payload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error -- VIEW OWN Neighborhood" });
  }
};

// View Own Neighborhood (More Information)
const viewAboutYourNeighborhood = async (req, res) => {
  try {
    const focalPersonID = req.user?.id || req.params.focalPersonID || req.query.focalPersonID;
    if (!focalPersonID) return res.status(400).json({ message: "Missing Focal Person ID" });

    const focal = await focalPersonRepo.findOne({ where: { id: focalPersonID } });
    if (!focal) return res.status(404).json({ message: "Focal Person Not Found" });

    const nb = await neighborhoodRepo.findOne({
      where: { focalPersonID, archived: false },
    });
    if (!nb) return res.status(404).json({ message: "Neighborhood Not Found" });

    return res.json({
      neighborhoodID: nb.id,
      terminalID: nb.terminalID,
      noOfHouseholds: nb.noOfHouseholds !== undefined && nb.noOfHouseholds !== null ? String(nb.noOfHouseholds) : '',
      noOfResidents: nb.noOfResidents !== undefined && nb.noOfResidents !== null ? String(nb.noOfResidents) : '',
      floodwaterSubsidenceDuration: nb.floodSubsideHours !== undefined && nb.floodSubsideHours !== null ? String(nb.floodSubsideHours) : '',
      hazards: parseHazards(nb.hazards),
      otherInformation: nb.otherInformation ?? null,
      focalPerson: {
        name: [focal.firstName, focal.lastName].filter(Boolean).join(" ").trim() || focal.name || null,
        number: focal.contactNumber || null,
        email: focal.email || null,
        photo: focal.photo || null, // note: returns blob if selected; consider a separate photo endpoint if large
        alternativeFPFirstName: focal.altFirstName || null,
        alternativeFPLastName: focal.altLastName || null,
        alternativeFPEmail: focal.altEmail || null,
        alternativeFPNumber: focal.altContactNumber || null,
        alternativeFPImage: focal.alternativeFPImage || null,
      },
      address: focal.address ?? null,
      createdDate: nb.createdAt ?? null,
      updatedDate: nb.updatedAt ?? null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error -- VIEW OWN Neighborhood (More)" });
  }
};

// VIEW Other Neighborhoods (focal person sees limited fields only)
const viewOtherNeighborhoods = async (req, res) => {
  try {
    const focalPersonID = req.user?.id || req.params.focalPersonID || req.query.focalPersonID;
    let ownNeighborhoodId = null;
    if (focalPersonID) {
      const nb = await neighborhoodRepo.findOne({ where: { focalPersonID } });
      ownNeighborhoodId = nb?.id || null;
    }

    // Get all neighborhoods except own, with focal person info
    const neighborhoods = await neighborhoodRepo
      .createQueryBuilder("n")
      .select(["n.id", "n.hazards", "n.createdAt", "n.focalPersonID"])
      .where("n.archived = :arch", { arch: false })
      .andWhere(ownNeighborhoodId ? "n.id <> :own" : "1=1", { own: ownNeighborhoodId })
      .getRawMany();

    // Fetch all focal persons for these neighborhoods
    const focalPersonIds = neighborhoods.map(n => n.n_focalPersonID).filter(Boolean);
    let focalPersons = [];
    if (focalPersonIds.length) {
      focalPersons = await focalPersonRepo
        .createQueryBuilder("f")
        .select(["f.id", "f.address", "f.firstName", "f.lastName"])
        .where("f.id IN (:...ids)", { ids: focalPersonIds })
        .getRawMany();
    }
    const byFocalId = {};
    focalPersons.forEach(fp => { byFocalId[fp.f_id] = fp; });

    return res.json(
      neighborhoods.map((n) => ({
        neighborhoodID: n.n_id,
        hazards: parseHazards(n.n_hazards),
        createdDate: n.n_createdAt ?? null,
        address: byFocalId[n.n_focalPersonID]?.f_address || null,
        focalPerson: byFocalId[n.n_focalPersonID]
          ? `${byFocalId[n.n_focalPersonID].f_firstName || ''} ${byFocalId[n.n_focalPersonID].f_lastName || ''}`.trim()
          : null,
      }))
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error -- VIEW OTHER Neighborhoods" });
  }
};

// READ All Neighborhoods (Active) + Cache
const getNeighborhoods = async (req, res) => {
  try {
    const cacheKey = "neighborhoods:active";
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const neighborhoods = await neighborhoodRepo
      .createQueryBuilder("n")
      .select([
        "n.id",
        "n.terminalID",
        "n.noOfHouseholds",
        "n.noOfResidents",
        "n.floodSubsideHours",
        "n.hazards",
        "n.createdAt",
      ])
      .where("n.archived = :arch", { arch: false })
      .orderBy("n.createdAt", "DESC")
      .getRawMany();

    const terminalIds = Array.from(new Set(neighborhoods.map(x => x.n_terminalID).filter(Boolean)));

    const terminals = terminalIds.length
      ? await terminalRepo
        .createQueryBuilder("t")
        .select(["t.id", "t.availability"])
        .where("t.id IN (:...ids)", { ids: terminalIds })
        .getRawMany()
      : [];
    const byTerminal = {};
    terminals.forEach(t => (byTerminal[t.t_id] = t.t_availability));

    const result = neighborhoods.map(n => ({
      neighborhoodID: n.n_id,
      terminalStatus: byTerminal[n.n_terminalID] || (n.n_terminalID ? "unknown" : "unlinked"),
      noOfHouseholds: n.n_noOfHouseholds ?? 0,
      noOfResidents: n.n_noOfResidents ?? 0,
      floodSubsideHours: n.n_floodSubsideHours ?? 0,
      hazards: parseHazards(n.n_hazards),
      createdDate: n.n_createdAt || null,
    }));

    await setCache(cacheKey, result, 60);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error -- ACTIVE Neighborhoods TABLE" });
  }
};

// READ One Neighborhood + Cache
const getNeighborhood = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `neighborhood:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const neighborhood = await neighborhoodRepo.findOne({ where: { id } });
    if (!neighborhood) return res.status(404).json({ message: "Neighborhood Not Found" });

    // present hazards as array on read
    const safe = {
      ...neighborhood,
      hazards: parseHazards(neighborhood.hazards),
    };

    await setCache(cacheKey, safe, 300);
    return res.json(safe);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error -- READ One Neighborhood" });
  }
};

// UPDATE Neighborhood (counts, flood hours, hazards, otherInformation)
const updateNeighborhood = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      noOfHouseholds,
      noOfResidents,
      floodSubsideHours,
      hazards,
      otherInformation,
      altFocal
    } = req.body || {};

    const neighborhood = await neighborhoodRepo.findOne({ where: { id } });
    if (!neighborhood) return res.status(404).json({ message: "Neighborhood Not Found" });
    if (neighborhood.archived) return res.status(400).json({ message: "Cannot update archived neighborhood" });

    if (noOfHouseholds != null) neighborhood.noOfHouseholds = noOfHouseholds;
    if (noOfResidents != null) neighborhood.noOfResidents = noOfResidents;
    if (floodSubsideHours != null) neighborhood.floodSubsideHours = floodSubsideHours;
    if (hazards != null) neighborhood.hazards = stringifyHazards(hazards);
    if (otherInformation != null) neighborhood.otherInformation = otherInformation;


    // Update alt focal person fields if provided
    if (altFocal && neighborhood.focalPersonID) {
      const focal = await focalPersonRepo.findOne({ where: { id: neighborhood.focalPersonID } });
      if (focal) {
        // Split altFocal.name into first and last name if possible
        let altFirstName = altFocal.name || '';
        let altLastName = '';
        if (altFocal.name && altFocal.name.trim().includes(' ')) {
          const parts = altFocal.name.trim().split(' ');
          altFirstName = parts.slice(0, -1).join(' ');
          altLastName = parts.slice(-1).join(' ');
        }
        focal.altFirstName = altFirstName;
        focal.altLastName = altLastName;
        focal.altEmail = altFocal.email || null;
        focal.altContactNumber = altFocal.contact || null;
        focal.updatedAt = new Date();
        await focalPersonRepo.save(focal);
      }
    }

    // Update the updatedAt field to now
    neighborhood.updatedAt = new Date();
    await neighborhoodRepo.save(neighborhood);

    await deleteCache(`neighborhood:${id}`);
    await deleteCache("neighborhoods:active");

    return res.json({
      message: "Neighborhood Updated", neighborhood: {
        ...neighborhood,
        hazards: parseHazards(neighborhood.hazards),
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error - UPDATE Neighborhood" });
  }
};

// ARCHIVE Neighborhood
const archivedNeighborhood = async (req, res) => {
  try {
    const { id } = req.params;

    const nb = await neighborhoodRepo
      .createQueryBuilder("n")
      .select(["n.id", "n.terminalID", "n.archived", "n.focalPersonID"])
      .where("n.id = :id", { id })
      .getRawOne();

    if (!nb) return res.status(404).json({ message: "Neighborhood Not Found" });
    if (nb.n_archived) return res.json({ message: "Neighborhood Already Archived" });

    // 1) Archive neighborhood
    await neighborhoodRepo.update({ id }, { archived: true });

    // 2) Archive focal person linked to this neighborhood (optional, mirrors community behavior)
    if (nb.n_focalPersonID) {
      await focalPersonRepo.update({ id: nb.n_focalPersonID }, { archived: true });
    }

    // 3) Free/unlink terminal
    const terminalId = nb.n_terminalID;
    if (terminalId) {
      await terminalRepo.update({ id: terminalId }, { availability: "available" });
      await neighborhoodRepo.update({ id }, { terminalID: null });
    }

    await deleteCache(`neighborhood:${id}`);
    await deleteCache("neighborhoods:active");
    await deleteCache("neighborhoods:archived");

    return res.json({ message: "Neighborhood Archived, Focal Person Archived, Terminal Available" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error - ARCHIVED Neighborhood", error: err.message });
  }
};

// GET ARCHIVED Neighborhoods + Cache
const getArchivedNeighborhoods = async (req, res) => {
  try {
    const cacheKey = "neighborhoods:archived";
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const neighborhoods = await neighborhoodRepo
      .createQueryBuilder("n")
      .select(["n.id", "n.terminalID", "n.noOfHouseholds", "n.noOfResidents", "n.floodSubsideHours", "n.hazards", "n.createdAt"])
      .where("n.archived = :arch", { arch: true })
      .orderBy("n.createdAt", "DESC")
      .getRawMany();

    const terminalIds = Array.from(new Set(neighborhoods.map(x => x.n_terminalID).filter(Boolean)));

    const terminals = terminalIds.length
      ? await terminalRepo
        .createQueryBuilder("t")
        .select(["t.id", "t.availability"])
        .where("t.id IN (:...ids)", { ids: terminalIds })
        .getRawMany()
      : [];
    const byTerminal = {};
    terminals.forEach(t => (byTerminal[t.t_id] = t.t_availability));

    const result = neighborhoods.map(n => ({
      neighborhoodID: n.n_id,
      terminalStatus: byTerminal[n.n_terminalID] || (n.n_terminalID ? "unknown" : "unlinked"),
      noOfHouseholds: n.n_noOfHouseholds ?? 0,
      noOfResidents: n.n_noOfResidents ?? 0,
      floodSubsideHours: n.n_floodSubsideHours ?? 0,
      hazards: parseHazards(n.n_hazards),
      createdDate: n.n_createdAt || null,
    }));

    await setCache(cacheKey, result, 120);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error -- ARCHIVED Neighborhoods TABLE" });
  }
};

module.exports = {
  getNeighborhoods,
  getNeighborhood,
  viewMapOwnNeighborhood,
  viewAboutYourNeighborhood,
  viewOtherNeighborhoods,
  updateNeighborhood,
  archivedNeighborhood,
  getArchivedNeighborhoods,
  uploadAltFocalPhoto,
  getAltFocalPhoto,
};
