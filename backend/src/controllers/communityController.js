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

// READ One Community Group
const getCommunityGroup = async (req, res) => {
    try {
        const communityGroup = await communityRepo.findOne({ where: {id} });
        if (!communityGroup) {
            return res.status(404).json({message: "Community Group Not Found"});
        }
        res.json(communityGroup);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error -- READ One CG"});
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

// UPDATE Community Group
const updateCommunityGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { communityGroupName, noOfIndividuals, noOfFamilies, noOfPWD, noOfPregnantWomen, noOfSeniors, noOfKids, otherInformation} = req.body;

        const communityGroup = await communityRepo.findOne({where: {id} });
        if (!communityGroup) {
            return res.status(404).json({message: "Community Group Not Found"});
        }

        if (communityGroupName) communityGroup.communityGroupName = communityGroupName;
        if (noOfIndividuals) communityGroup.noOfIndividuals = noOfIndividuals;
        if (noOfFamilies) communityGroup.noOfFamilies = noOfFamilies;
        if (noOfPWD) communityGroup.noOfPWD = noOfPWD;
        if (noOfPregnantWomen) communityGroup.noOfPregnantWomen = noOfPregnantWomen;
        if (noOfSeniors) communityGroup.noOfSeniors = noOfSeniors;
        if (noOfKids) communityGroup.noOfKids = noOfKids;
        if (otherInformation) communityGroup.otherInformation = otherInformation;
        if (address) communityGroup.address = address;

        await communityGroup.save(communityGroup);

        res.json({message: "Community Group Updated", communityGroup});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - UPDATE CG"});
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
    getArchivedCommunityGroup
};