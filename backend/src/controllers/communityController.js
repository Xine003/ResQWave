const { AppDataSource } = require("../config/dataSource");
const communityRepo = AppDataSource.getRepository("CommunityGroup");
const terminalRepo = AppDataSource.getRepository("Terminal");
const focalPersonRepo = AppDataSource.getRepository("FocalPerson");

// CREATE Community Group
const createCommunityGroup = async (req, res) => {
    try {
        // ADD THIS DEBUG LINE
        console.log("Received body:", JSON.stringify(req.body, null, 2));
        
        const { 
            terminalID, 
            communityGroupName, 
            noOfIndividuals, 
            noOfFamilies, 
            noOfPWD, 
            noOfPregnantWomen, 
            noOfKids, 
            noOfSeniors,
            otherInformation, 
            coordinates, 
            address,
            boundary
        } = req.body;

        // ADD THIS DEBUG LINE
        console.log("Extracted boundary:", boundary);

        // Rest of your code...
        const terminal = await terminalRepo.findOne({where : {id: terminalID} });
        if (!terminal) {
            return res.status(404).json({message: "Terminal Not Found"});
        }

        if (terminal.availability === "occupied"){
            return res.status(400).json({message: "Terminal Already Occupied"});
        }

        const lastCommunity = await communityRepo
            .createQueryBuilder("communityGroup")
            .select(["communityGroup.id"])
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
            coordinates,
            address,
            boundary
        });

        await communityRepo.save(communityGroup);

        terminal.availability = "occupied";
        await terminalRepo.save(terminal);

        res.status(201).json({message: "Community Group Created", communityGroup});
    } catch (err) {
        console.error("Full error:", err);
        res.status(500).json({message: "Server Error -- CREATE CG", error: err.message});
    }
};

// VIEW Own Community Group (for logged-in focal person)
const viewOwnCommunityGroup = async (req, res) => {
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

// VIEW Other Community Groups (focal person sees limited fields only)
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
        const communityGroups = await communityRepo.find();
        res.json(communityGroups);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error -- READ All CG"});
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

// ARCHIVED Community Group
const archivedCommunityGroup  = async (req, res) => {
    try {
        const {id} = req.params;
        
        // Find Community Group
        const communityGroup = await communityRepo.findOne({where: {id} });
        if (!communityGroup) {
            return res.status(404).json({message: "Community Group Not Found"});
        }

        // Mark as Archived
        communityGroup.archived = true;
        await communityRepo.save(communityGroup);

        // Archived the Focal Person Linked
        const focalPerson = await focalPersonRepo.findOne({ where: {communityGroupID: id} });
        if (focalPerson) {
            focalPerson.archived = true;
            await focalPersonRepo.save(focalPerson);
        }

        // Free The Terminal
        if (communityGroup.terminalID) {
            const terminal = await terminalRepo.findOne({ where: {id: communityGroup.terminalID} });
            if (terminal) {
                terminal.availability = "available";
                await terminalRepo.save(terminal);
            }
        
            // Unlink Terminal From Community Group
            communityGroup.terminalID = null;
            await communityRepo.save(communityGroup);
        }

        res.json({message: "Community Group Archived, Focal Person Archived, Terminal Available"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - ARCHIVED CG"});
    }
};

// GET ARCHIVED CommunityGroup
const getArchivedCommunityGroup = async(req, res) => {
    try {
        const communityGroup = await communityRepo.findOne({where: {archived: true} });
        res.json(communityGroup);
    } catch (err) {
        console.error (err);
        res.status(500).json({message: "Server Error -- GET ARCHIVED CG"});
    }
};

module.exports = {
    createCommunityGroup,
    getCommunityGroups,
    getCommunityGroup,
    updateCommunityBoundary,
    updateCommunityGroup,
    archivedCommunityGroup,
    getArchivedCommunityGroup,
    viewOwnCommunityGroup,
    viewOtherCommunityGroups,
};