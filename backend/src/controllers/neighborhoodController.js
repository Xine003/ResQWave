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

    const payload = {
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
        photo: focal.photo || null, 
        alternativeFPFirstName: focal.altFirstName || null,
        alternativeFPLastName: focal.altLastName || null,
        alternativeFPEmail: focal.altEmail || null,
        alternativeFPNumber: focal.altContactNumber || null,
        alternativeFPImage: focal.alternativeFPImage || null,
      },
      address: focal.address ?? null,
      createdDate: nb.createdAt ?? null,
      updatedDate: nb.updatedAt ?? null,
    }

    return res.json(payload);
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

    // Include focalPersonID for later lookup
    const neighborhoods = await neighborhoodRepo
      .createQueryBuilder("n")
      .select([
        "n.id",
        "n.terminalID",
        "n.focalPersonID",
        "n.createdAt",
      ])
      .where("n.archived = :arch", { arch: false })
      .orderBy("n.createdAt", "DESC")
      .getRawMany();

    // Terminal status lookup
    const terminalIds = Array.from(new Set(neighborhoods.map(x => x.n_terminalID).filter(Boolean)));
    const terminals = terminalIds.length
      ? await terminalRepo
          .createQueryBuilder("t")
          .select(["t.id", "t.status"])
          .where("t.id IN (:...ids)", { ids: terminalIds })
          .getRawMany()
      : [];
    const byTerminal = {};
    terminals.forEach(t => (byTerminal[t.t_id] = t.t_status));

    // Focal person lookup (name, contact, address)
    const focalIds = Array.from(new Set(neighborhoods.map(x => x.n_focalPersonID).filter(Boolean)));
    const focalRows = focalIds.length
      ? await focalPersonRepo
          .createQueryBuilder("f")
          .select(["f.id", "f.firstName", "f.lastName", "f.contactNumber", "f.address"])
          .where("f.id IN (:...ids)", { ids: focalIds })
          .getRawMany()
      : [];
    const byFocal = {};
    focalRows.forEach(f => {
      byFocal[f.f_id] = {
        name: [f.f_firstName, f.f_lastName].filter(Boolean).join(" ").trim() || null,
        contactNumber: f.f_contactNumber || null,
        address: f.f_address || null,
      };
    });

    const result = neighborhoods.map(n => {
      const focal = byFocal[n.n_focalPersonID] || {};
      return {
        neighborhoodID: n.n_id,
        terminalStatus: byTerminal[n.n_terminalID] || (n.n_terminalID ? "unknown" : "unlinked"),
        focalPerson: focal.name || null,
        contactNumber: focal.contactNumber || null,
        address: focal.address || null,
        registeredAt: n.n_createdAt || null,
      };
    });

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

    // Load focal person info (if linked)
    let focal = null;
    if (neighborhood.focalPersonID) {
      focal = await focalPersonRepo.findOne({ where: { id: neighborhood.focalPersonID } });
    }

    // present hazards as array on read and include focal person details
    const safe = {
      ...neighborhood,
      hazards: parseHazards(neighborhood.hazards),
      focalPerson: focal
        ? {
            id: focal.id,
            firstName: focal.firstName || null,
            lastName: focal.lastName || null,
            contactNumber: focal.contactNumber || null,
            email: focal.email || null,
            photo: focal.photo || null,
            altFirstName: focal.altFirstName || null,
            altLastName: focal.altLastName || null,
            altContactNumber: focal.altContactNumber || null,
            altEmail: focal.altEmail || null,
            alternativeFPImage: focal.alternativeFPImage || null,
          }
        : null,
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
      // focal person fields (optional)
      firstName,
      lastName,
      contactNumber,
      email,
      // alternative focal person fields (optional)
      altFirstName,
      altLastName,
      altContactNumber,
      altEmail,
      altFocal, // legacy support: { name, email, contact }
    } = req.body || {};

    // photos (multipart/form-data): main photo and alternative focal photo
    const photoFile = req.file || req.files?.photo?.[0];
    const altPhotoFile = req.files?.alternativeFPImage?.[0] || req.files?.altPhoto?.[0];

    const neighborhood = await neighborhoodRepo.findOne({ where: { id } });
    if (!neighborhood) return res.status(404).json({ message: "Neighborhood Not Found" });
    if (neighborhood.archived) return res.status(400).json({ message: "Cannot update archived neighborhood" });

    // Neighborhood updates
    if (noOfHouseholds != null) neighborhood.noOfHouseholds = noOfHouseholds;
    if (noOfResidents != null) neighborhood.noOfResidents = noOfResidents;
    if (floodSubsideHours != null) neighborhood.floodSubsideHours = floodSubsideHours;
    if (hazards != null) neighborhood.hazards = stringifyHazards(hazards);
    if (otherInformation != null) neighborhood.otherInformation = otherInformation;

    // Focal person updates (if linked)
    if (neighborhood.focalPersonID) {
      const focal = await focalPersonRepo.findOne({ where: { id: neighborhood.focalPersonID } });
      if (focal) {
        // Basic fields
        if (firstName != null) focal.firstName = firstName;
        if (lastName != null) focal.lastName = lastName;
        if (contactNumber != null) focal.contactNumber = contactNumber;
        if (email != null) focal.email = email;

        // Photos: replace only if provided
        if (photoFile?.buffer) focal.photo = photoFile.buffer;
        if (altPhotoFile?.buffer) focal.alternativeFPImage = altPhotoFile.buffer;

        // Alt focal fields (prefer explicit fields; fallback to legacy altFocal.name split)
        let altFN = altFirstName ?? null;
        let altLN = altLastName ?? null;
        if ((altFN == null || altLN == null) && altFocal?.name) {
          const parts = String(altFocal.name).trim().split(" ");
          if (parts.length > 1) {
            altFN = altFN ?? parts.slice(0, -1).join(" ");
            altLN = altLN ?? parts.slice(-1).join(" ");
          } else if (parts.length === 1) {
            altFN = altFN ?? parts[0];
          }
        }

        if (altFN != null) focal.altFirstName = altFN;
        if (altLN != null) focal.altLastName = altLN;
        if (altContactNumber != null) focal.altContactNumber = altContactNumber ?? altFocal?.contact ?? null;
        if (altEmail != null) focal.altEmail = altEmail ?? altFocal?.email ?? null;

        focal.updatedAt = new Date();
        await focalPersonRepo.save(focal);
      }
    }

    neighborhood.updatedAt = new Date();
    await neighborhoodRepo.save(neighborhood);

    await deleteCache(`neighborhood:${id}`);
    await deleteCache("neighborhoods:active");

    return res.json({
      message: "Neighborhood Updated",
      neighborhood: {
        ...neighborhood,
        hazards: parseHazards(neighborhood.hazards),
      },
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

// DELETE Neighborhood
const deleteNeighborhood = async(req, res) => {
  try {
    const {id} = req.params;

    const nb = await neighborhoodRepo
      .createQueryBuilder("n")
      .select(["n.id", "n.archived", "n.focalPersonID", "n.terminalID"])
      .where("n.id = :id", {id})
      .getRawOne();

    if (!nb) return res.status(404).json({message: "Neighborhood Not Found"});
    if (!nb.n_archived) {
      return res.status(400).json({message: "Neighborhood Must Be Archived"});
    }

    // Terminal is Unlinked and Available
    if (nb.n_terminalID) {
      await terminalRepo.update({id: nb.n_terminalID}, {availability: "Available"});
      await neighborhoodRepo.update({id}, {terminalID: null});
    }

    // Delete Linked Focal Person
    if (nb.n_focalPersonID) {
      await focalPersonRepo.delete({id: nb.n_focalPersonID});
    }

    await neighborhoodRepo.delete({id});

    await deleteCache(`neighborhood${id}`);
    await deleteCache(`neighborhoods:active`);
    await deleteCache("neighborhoods:archived");

    return res.json({message: "Neighborhood permanently delete"});
  } catch (err) {
    console.error(err);
    return res.status(500).son({message: "Server Error"});
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
  deleteNeighborhood
};
