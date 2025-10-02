const { AppDataSource } = require("../config/dataSource");
const {
  getCache,
  setCache,
  deleteCache
} = require("../config/cache");
const bcrypt = require("bcrypt");
const communityRepo = AppDataSource.getRepository("CommunityGroup");
const terminalRepo = AppDataSource.getRepository("Terminal");
const focalPersonRepo = AppDataSource.getRepository("FocalPerson");

// CREATE Community Group (sanitize coordinates/boundary)
const createCommunityGroup = async (req, res) => {
  const qr = AppDataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();
  try {
    // Accept JSON or multipart/form-data
    const b = req.body || {};
    const {
      terminalID,
      communityGroupName,
      noOfIndividuals,
      noOfFamilies,
      noOfPWD,
      noOfPregnantWomen,
      noOfSeniors,
      noOfKids,
      otherInformation,
      address,
      // Focal fields
      name, // focal person name
      email,
      contactNumber,
      alternativeFP,
      alternativeFPEmail,
      alternativeFPContactNumber,
      password,
    } = b;

    // Parse coordinates/boundary (may arrive as JSON string when multipart)
    const parseMaybeJson = (v, fallback) => {
      if (v == null || v === "") return fallback;
      if (Array.isArray(v) || typeof v === "object") return v;
      try { return JSON.parse(v); } catch { return fallback; }
    };
    const coordinates = parseMaybeJson(b.coordinates, []);
    const boundary = parseMaybeJson(b.boundary, {});

    if (!terminalID) return res.status(400).json({ message: "terminalID is required" });
    if (!communityGroupName) return res.status(400).json({ message: "communityGroupName is required" });
    if (!name) return res.status(400).json({ message: "Focal Person name is required" });

    // Lock terminal row to avoid races
    const terminal = await qr.manager
      .createQueryBuilder("Terminal", "t")
      .setLock("pessimistic_write")
      .where("t.id = :id", { id: terminalID })
      .getOne();

    if (!terminal) return res.status(404).json({ message: "Terminal Not Found" });
    if (terminal.availability === "occupied") {
      return res.status(400).json({ message: "Terminal Already Occupied" });
    }

    // Generate CommunityGroup ID
    const lastCG = await qr.manager
      .getRepository("CommunityGroup")
      .createQueryBuilder("cg")
      .select(["cg.id"])
      .orderBy("cg.id", "DESC")
      .getOne();
    let num = 1;
    if (lastCG) num = parseInt(String(lastCG.id).replace("COMGROUP", ""), 10) + 1;
    const newCGId = "COMGROUP" + String(num).padStart(3, "0");

    // Create CommunityGroup
    const cg = qr.manager.getRepository("CommunityGroup").create({
      id: newCGId,
      terminalID,
      communityGroupName,
      noOfIndividuals: noOfIndividuals ?? 0,
      noOfFamilies: noOfFamilies ?? 0,
      noOfPWD: noOfPWD ?? 0,
      noOfPregnantWomen: noOfPregnantWomen ?? 0,
      noOfSeniors: noOfSeniors ?? 0,
      noOfKids: noOfKids ?? 0,
      otherInformation: otherInformation ?? null,
      address: address ?? null,
      coordinates: Array.isArray(coordinates) ? coordinates : [],
      boundary: boundary && typeof boundary === "object" ? boundary : {},
    });
    await qr.manager.getRepository("CommunityGroup").save(cg);

    // Generate FocalPerson ID
    const lastFP = await qr.manager
      .getRepository("FocalPerson")
      .createQueryBuilder("fp")
      .select(["fp.id"])
      .orderBy("fp.id", "DESC")
      .getOne();
    let fnum = 1;
    if (lastFP) fnum = parseInt(String(lastFP.id).replace("FOCALP", ""), 10) + 1;
    const newFPId = "FOCALP" + String(fnum).padStart(3, "0");

    // Optional photo files (multer memoryStorage)
    const files = req.files || {};
    const main = files.photo?.[0];
    const alt = files.alternativeFPImage?.[0];

    const plainPassword = password || newFPId;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create FocalPerson
    const fp = qr.manager.getRepository("FocalPerson").create({
      id: newFPId,
      communityGroupID: newCGId,
      name,
      email: email ?? null,
      contactNumber: contactNumber ?? null,
      address: address ?? null, // reuse same address if that’s your UI
      alternativeFP: alternativeFP ?? null,
      alternativeFPEmail: alternativeFPEmail ?? null,
      alternativeFPContactNumber: alternativeFPContactNumber ?? null,
      createdBy: req.user?.id ?? null,
      password: hashedPassword,
      ...(main?.buffer ? { photo: main.buffer } : {}),
      ...(alt?.buffer ? { alternativeFPImage: alt.buffer } : {}),
    });
    await qr.manager.getRepository("FocalPerson").save(fp);

    // Mark terminal occupied
    await qr.manager.getRepository("Terminal").update({ id: terminalID }, { availability: "occupied" });

    await qr.commitTransaction();

    const response = {
      message: "Community Group and Focal Person Created",
      communityGroup: {
        id: cg.id,
        communityGroupName: cg.communityGroupName,
        terminalID: cg.terminalID,
        address: cg.address,
        createdAt: cg.createdAt,
      },
      focalPerson: {
        id: fp.id,
        name: fp.name,
        email: fp.email,
        contactNumber: fp.contactNumber,
        alternativeFP: fp.alternativeFP,
        alternativeFPEmail: fp.alternativeFPEmail,
        alternativeFPContactNumber: fp.alternativeFPContactNumber,
        // photos are stored but not included in JSON
      },
    };
    if (!password) response.temporaryPassword = plainPassword;

    await deleteCache("communityGroups:active");
    await deleteCache("communityGroups:archived");

    return res.status(201).json(response);
  } catch (err) {
    await qr.rollbackTransaction();
    console.error("Create CG+FP error:", err);
    return res.status(500).json({ message: "Server Error - CREATE CG+FP", error: err.message });
  } finally {
    await qr.release();
  }
};

// VIEW Own Community Group (for logged-in focal person)
// Map View + Cache
const viewMapOwnCommunityGroup = async (req, res) => {
  try {
    const focalPersonID = req.user?.id || req.params.focalPersonID || req.query.focalPersonID;
    if (!focalPersonID) return res.status(400).json({ message: "Missing Focal Person ID" });

    const cacheKey = `viewMap:fp:${focalPersonID}`;
    const cached = await getCache(cacheKey); 
    if (cached) return res.json(cached);

    const focal = await focalPersonRepo.findOne({ where: { id: focalPersonID } });
    if (!focal) return res.status(404).json({ message: "Focal Person Not Found" });

    const group = await communityRepo.findOne({
      where: { id: focal.communityGroupID, archived: false },
    });
    if (!group) return res.status(404).json({ message: "Community Group Not Found" });

    const payload = { // FIX: payload was not defined before
      communityGroupName: group.communityGroupName,
      terminalID: group.terminalID,
      focalPerson: {
        name: focal.name,
        alternativeFP: focal.alternativeFP ?? null,
      },
      address: group.address ?? null,
      coordinates: Array.isArray(group.coordinates) ? group.coordinates : null,
      createdDate: group.createdAt ?? null,
    };

    await setCache(cacheKey, payload, 120);
    return res.json(payload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error -- VIEW OWN CG" });
  }
};

// View Own Community Group
// For More Information
const viewAboutYourCommunityGroup = async (req, res) => {
  try {
    const focalPersonID = req.user?.id || req.params.focalPersonID || req.query.focalPersonID;
    if (!focalPersonID) return res.status(400).json({ message: "Missing Focal Person ID" });

    const focal = await focalPersonRepo.findOne({ where: { id: focalPersonID } });
    if (!focal) return res.status(404).json({ message: "Focal Person Not Found" });

    const group = await communityRepo.findOne({
      where: { id: focal.communityGroupID, archived: false },
    });
    if (!group) return res.status(404).json({ message: "Community Group Not Found" });

    return res.json({
      communityGroupName: group.communityGroupName,
      communityID : group.id,
      terminalID: group.terminalID,
      individuals: group.noOfIndividuals,
      families: group.noOfFamilies,
      kids: group.noOfKids,
      seniors: group.noOfSeniors,
      pwd: group.noOfPWD,
      pregnantWomen: group.noOfPregnantWomen,
      otherInformation: group.otherInformation,
      focalPerson: {
        name: focal.name,
        number: focal.contactNumber,
        email: focal.email,
        photo: focal.photo,
        alternativeFP: focal.alternativeFP,
        alternativeFPEmail: focal.alternativeFPEmail,
        alternativeFPNumber: focal.alternativeFPContactNumber,
        alternativeFPImage: focal.alternativeFPImage
      },
      address: group.address ?? null,
      coordinates: Array.isArray(group.coordinates) ? group.coordinates : null,
      createdDate: group.createdAt ?? null,
      updatedDate: group.updatedAt ?? null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error -- VIEW OWN CG" });
  }
};

// VIEW Other Community Groups (focal person sees limited fields only)
// Map View
const viewOtherCommunityGroups = async (req, res) => {
  try {
    const focalPersonID = req.user?.id || req.params.focalPersonID || req.query.focalPersonID;
    let ownGroupId = null;
    if (focalPersonID) {
      const focal = await focalPersonRepo.findOne({ where: { id: focalPersonID } });
      ownGroupId = focal?.communityGroupID || null;
    }

    // Select limited fields (avoid simple-json columns)
    const qb = communityRepo
      .createQueryBuilder("cg")
      .select(["cg.id", "cg.communityGroupName", "cg.address", "cg.createdAt"])
      .where("cg.archived = :arch", { arch: false });

    if (ownGroupId) qb.andWhere("cg.id <> :own", { own: ownGroupId });

    const rows = await qb.getRawMany();

    return res.json(
      rows.map((r) => ({
        communityGroupName: r.cg_communityGroupName,
        address: r.cg_address ?? null,
        createdDate: r.cg_createdAt ?? null,
      }))
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error -- VIEW OTHER CGs" });
  }
};

// READ All Community Group + Cache
const getCommunityGroups = async (req, res) => {
  try {
    const cacheKey = "communityGroups:active";
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    // Select only the fields we need to avoid parsing simple-json columns
    const groups = await communityRepo
      .createQueryBuilder("cg")
      .select(["cg.id", "cg.communityGroupName", "cg.address", "cg.createdAt", "cg.terminalID"])
      .where("cg.archived = :arch", { arch: false })
      .orderBy("cg.createdAt", "DESC")
      .getRawMany();

    const terminalIds = Array.from(new Set(groups.map(g => g.cg_terminalID).filter(Boolean)));
    const groupIds = groups.map(g => g.cg_id);

    // Fetch terminal availability in one go
    const terminals = terminalIds.length
      ? await terminalRepo
          .createQueryBuilder("t")
          .select(["t.id", "t.availability"])
          .where("t.id IN (:...ids)", { ids: terminalIds })
          .getRawMany()
      : [];
    const byTerminal = {};
    terminals.forEach(t => (byTerminal[t.t_id] = t.t_availability));

    // Fetch focal person (active) for each group
    const focalRows = groupIds.length
      ? await focalPersonRepo
          .createQueryBuilder("fp")
          .select(["fp.communityGroupID", "fp.name", "fp.contactNumber"])
          .where("fp.communityGroupID IN (:...gids)", { gids: groupIds })
          .andWhere("fp.archived = :arch", { arch: false })
          .getRawMany()
      : [];
    const byGroup = {};
    focalRows.forEach(r => {
      if (!byGroup[r.fp_communityGroupID]) byGroup[r.fp_communityGroupID] = r;
    });

    const result = groups.map(g => ({
      communityGroupID: g.cg_id,
      communityGroupName: g.cg_communityGroupName,
      terminalStatus: byTerminal[g.cg_terminalID] || (g.cg_terminalID ? "unknown" : "unlinked"),
      focalPerson: byGroup[g.cg_id]?.fp_name || null,
      focalPersonContactNumber: byGroup[g.cg_id]?.fp_contactNumber || null,
      address: g.cg_address || null,
      createdDate: g.cg_createdAt || null,
    }));

    await setCache(cacheKey, result, 60); // 60s TTL
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error -- ACTIVE CG TABLE" });
  }
};

// Fix: READ One Community Group (admin/dispatcher full details) + Cache
const getCommunityGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `communityGroup:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const communityGroup = await communityRepo.findOne({ where: { id } });
    if (!communityGroup) return res.status(404).json({ message: "Community Group Not Found" });
    
    await setCache(cacheKey, communityGroup, 300);
    res.json(communityGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error -- READ One CG" });
  }
};

// UPDATE Community Grouo Boundary
const updateCommunityBoundary = async (req, res) => {
  try {
    const { id } = req.params;
    let { boundary } = req.body; // may be object, string, null, undefined

    // Treat undefined / null / empty string as "empty boundary"
    if (boundary === undefined || boundary === null || boundary === "") {
      boundary = {};
    } else if (typeof boundary === "string") {
      // Try to parse string
      try {
        boundary = boundary.trim();
        boundary = boundary.length ? JSON.parse(boundary) : {};
      } catch {
        return res.status(400).json({ message: "boundary string is not valid JSON" });
      }
    }

    // Must end up an object (allow empty {})
    if (typeof boundary !== "object" || Array.isArray(boundary)) {
      return res.status(400).json({ message: "boundary must be a JSON object (or empty)" });
    }

    const group = await communityRepo.findOne({ where: { id } });
    if (!group) return res.status(404).json({ message: "Community Group Not Found" });
    if (group.archived) return res.status(400).json({ message: "Cannot update boundary of archived group" });

    group.boundary = boundary;
    await communityRepo.save(group);

    await deleteCache(`communityGroup:${id}`);
    await deleteCache("communityGroups:active");
    await deleteCache("communityGroups:archived");

    return res.json({
      message: "Community Group Boundary Updated",
      communityGroupID: id,
      boundary, // echo back (empty object if cleared)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error - UPDATE CG Boundary" });
  }
};

// Fix: UPDATE Community Group (include address, use repo.save)
const updateCommunityGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      communityGroupName, noOfIndividuals, noOfFamilies, noOfPWD,
      noOfPregnantWomen, noOfSeniors, noOfKids, otherInformation, address
    } = req.body || {};

    const communityGroup = await communityRepo.findOne({ where: { id } });
    if (!communityGroup) return res.status(404).json({ message: "Community Group Not Found" });

    if (communityGroupName != null) communityGroup.communityGroupName = communityGroupName;
    if (noOfIndividuals != null) communityGroup.noOfIndividuals = noOfIndividuals;
    if (noOfFamilies != null) communityGroup.noOfFamilies = noOfFamilies;
    if (noOfPWD != null) communityGroup.noOfPWD = noOfPWD;
    if (noOfPregnantWomen != null) communityGroup.noOfPregnantWomen = noOfPregnantWomen;
    if (noOfSeniors != null) communityGroup.noOfSeniors = noOfSeniors;
    if (noOfKids != null) communityGroup.noOfKids = noOfKids;
    if (otherInformation != null) communityGroup.otherInformation = otherInformation;
    if (address != null) communityGroup.address = address;

    await communityRepo.save(communityGroup);

    await deleteCache(`communityGroup:${id}`);
    await deleteCache("communityGroups:active");
    await deleteCache("communityGroups:archived");

    res.json({ message: "Community Group Updated", communityGroup });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error - UPDATE CG" });
  }
};

// ARCHIVED Community Group (no JSON parsing)
const archivedCommunityGroup = async (req, res) => {
  try {
    const { id } = req.params;

    // Read only needed columns to avoid parsing simple-json
    const cg = await communityRepo
      .createQueryBuilder("cg")
      .select(["cg.id", "cg.terminalID", "cg.archived"])
      .where("cg.id = :id", { id })
      .getRawOne();

    if (!cg) return res.status(404).json({ message: "Community Group Not Found" });
    if (cg.cg_archived) return res.json({ message: "Community Group Already Archived" });

    // 1) Sanitize row so CHECK constraints pass
    // Works for both TEXT+CHECK(JSON_VALID) and native JSON columns
    await AppDataSource.query(
      `
      UPDATE communitygroups
      SET
        boundary = CASE
          WHEN boundary IS NULL OR boundary = '' THEN JSON_OBJECT()
          WHEN JSON_VALID(boundary) = 1 AND JSON_TYPE(boundary) <> 'OBJECT' THEN JSON_OBJECT()
          ELSE boundary
        END,
        coordinates = CASE
          WHEN coordinates IS NULL OR coordinates = '' THEN JSON_ARRAY()
          WHEN JSON_VALID(coordinates) = 1 AND JSON_TYPE(coordinates) <> 'ARRAY' THEN JSON_ARRAY()
          ELSE coordinates
        END
      WHERE id = ?;
      `,
      [id]
    );

    // 2) Archive group
    await communityRepo.update({ id }, { archived: true });

    // 3) Archive focal persons
    await focalPersonRepo
      .createQueryBuilder()
      .update()
      .set({ archived: true })
      .where("communityGroupID = :id", { id })
      .execute();

    // 4) Free/unlink terminal
    const terminalId = cg.cg_terminalID;
    if (terminalId) {
      await terminalRepo.update({ id: terminalId }, { availability: "available" });
      await communityRepo.update({ id }, { terminalID: null });
    }

    await deleteCache(`communityGroup:${id}`);
    await deleteCache("communityGroups:active");
    await deleteCache("communityGroups:archived");

    return res.json({ message: "Community Group Archived, Focal Person Archived, Terminal Available" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error - ARCHIVED CG", error: err.message });
  }
};

// GET ARCHIVED CommunityGroup + Cache
const getArchivedCommunityGroup = async(req, res) => {
  try {
    const cacheKey = "communityGroups:archived";
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const groups = await communityRepo
      .createQueryBuilder("cg")
      .select(["cg.id", "cg.communityGroupName", "cg.address", "cg.createdAt", "cg.terminalID"])
      .where("cg.archived = :arch", { arch: true })
      .orderBy("cg.createdAt", "DESC")
      .getRawMany();

    const terminalIds = Array.from(new Set(groups.map(g => g.cg_terminalID).filter(Boolean)));
    const groupIds = groups.map(g => g.cg_id);

    const terminals = terminalIds.length
      ? await terminalRepo
          .createQueryBuilder("t")
          .select(["t.id", "t.availability"])
          .where("t.id IN (:...ids)", { ids: terminalIds })
          .getRawMany()
      : [];
    const byTerminal = {};
    terminals.forEach(t => (byTerminal[t.t_id] = t.t_availability));

    // Include focal person even if archived (no filter)
    const focalRows = groupIds.length
      ? await focalPersonRepo
          .createQueryBuilder("fp")
          .select(["fp.communityGroupID", "fp.name", "fp.contactNumber"])
          .where("fp.communityGroupID IN (:...gids)", { gids: groupIds })
          .getRawMany()
      : [];
    const byGroup = {};
    focalRows.forEach(r => {
      if (!byGroup[r.fp_communityGroupID]) byGroup[r.fp_communityGroupID] = r;
    });

    const result = groups.map(g => ({
      communityGroupID: g.cg_id,
      communityGroupName: g.cg_communityGroupName,
      terminalStatus: byTerminal[g.cg_terminalID] || (g.cg_terminalID ? "unknown" : "unlinked"),
      focalPerson: byGroup[g.cg_id]?.fp_name || null,
      focalPersonContactNumber: byGroup[g.cg_id]?.fp_contactNumber || null,
      address: g.cg_address || null,
      createdDate: g.cg_createdAt || null,
    }));

    await setCache(cacheKey, result, 120);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error -- ARCHIVED CG TABLE" });
  }
};

module.exports = {
    createCommunityGroup,
    getCommunityGroups,
    getCommunityGroup,
    viewAboutYourCommunityGroup,
    updateCommunityBoundary,
    updateCommunityGroup,
    archivedCommunityGroup,
    getArchivedCommunityGroup,
    viewMapOwnCommunityGroup,
    viewOtherCommunityGroups,
};