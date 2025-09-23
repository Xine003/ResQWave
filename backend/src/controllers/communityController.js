const { AppDataSource } = require("../config/dataSource");
const communityRepo = AppDataSource.getRepository("CommunityGroup");
const terminalRepo = AppDataSource.getRepository("Terminal");
const focalPersonRepo = AppDataSource.getRepository("FocalPerson");

// CREATE Community Group (sanitize coordinates/boundary)
const createCommunityGroup = async (req, res) => {
  try {
    console.log("Received body:", JSON.stringify(req.body, null, 2));
    const {
      terminalID, communityGroupName, noOfIndividuals, noOfFamilies, noOfPWD,
      noOfPregnantWomen, noOfKids, noOfSeniors, otherInformation,
      coordinates, address, boundary
    } = req.body || {};

    if (!terminalID) return res.status(400).json({ message: "Terminal Not Found" }); // or required check
    if (!communityGroupName) return res.status(400).json({ message: "communityGroupName is required" });

    const terminal = await terminalRepo.findOne({ where: { id: terminalID } });
    if (!terminal) return res.status(404).json({ message: "Terminal Not Found" });
    if (terminal.availability === "occupied") {
      return res.status(400).json({ message: "Terminal Already Occupied" });
    }

    const lastCommunity = await communityRepo
      .createQueryBuilder("communityGroup")
      .select(["communityGroup.id"]) // only id to avoid simple-json parse
      .orderBy("communityGroup.id", "DESC")
      .getOne();

    let newNumber = 1;
    if (lastCommunity) {
      const lastNumber = parseInt(lastCommunity.id.replace("COMGROUP", ""), 10);
      newNumber = lastNumber + 1;
    }
    const newID = "COMGROUP" + String(newNumber).padStart(3, "0");

    const communityGroup = communityRepo.create({
      id: newID,
      terminalID,
      communityGroupName,
      noOfIndividuals,
      noOfFamilies,
      noOfPWD,
      noOfPregnantWomen,
      noOfSeniors,
      noOfKids,
      otherInformation,
      coordinates: Array.isArray(coordinates) ? coordinates : [],  // safe default
      address,
      boundary: boundary && typeof boundary === "object" ? boundary : {}, // safe default
    });

    await communityRepo.save(communityGroup);

    terminal.availability = "occupied";
    await terminalRepo.save(terminal);

    res.status(201).json({ message: "Community Group Created", communityGroup });
  } catch (err) {
    console.error("Full error:", err);
    res.status(500).json({ message: "Server Error -- CREATE CG", error: err.message });
  }
};

// VIEW Own Community Group (for logged-in focal person)
// Map View
const viewMapOwnCommunityGroup = async (req, res) => {
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
      terminalID: group.terminalID,
      focalPerson: {
        name: focal.name,
        alternativeFP: focal.alternativeFP ?? null,
      },
      address: group.address ?? null,
      coordinates: Array.isArray(group.coordinates) ? group.coordinates : null,
      createdDate: group.createdAt ?? null,
    });
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

// READ All Community Group
const getCommunityGroups = async (req, res) => {
  try {
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

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error -- ACTIVE CG TABLE" });
  }
};

// Fix: READ One Community Group (admin/dispatcher full details)
const getCommunityGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const communityGroup = await communityRepo.findOne({ where: { id } });
    if (!communityGroup) return res.status(404).json({ message: "Community Group Not Found" });
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
        const { boundary } = req.body;

        if (boundary == null || typeof boundary !== "object") {
            return res.status(400).json({ message: "boundary must be a JSON object" });
        }

        const communityGroup = await communityRepo.findOne({where: {id} });
        if (!communityGroup) {
            return res.status(404).json({message: "Community Group Not Found"});
        }

        communityGroup.boundary = boundary;

        await communityRepo.save(communityGroup);

        res.json({message: "Community Group Updated", boundary});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - UPDATE CG Boundary"});
    }
}

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

    return res.json({ message: "Community Group Archived, Focal Person Archived, Terminal Available" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error - ARCHIVED CG", error: err.message });
  }
};

// GET ARCHIVED CommunityGroup
const getArchivedCommunityGroup = async(req, res) => {
  try {
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