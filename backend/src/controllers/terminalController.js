const { AppDataSource } = require("../config/dataSource");
const terminalRepo = AppDataSource.getRepository("Terminal");
const communityGroupRepo = AppDataSource.getRepository("CommunityGroup");

// CREATE Terminal
const createTerminal = async (req, res) => {
    try {

        // Generate Specific UID
        const lastTerminal = await terminalRepo
            .createQueryBuilder("terminal")
            .orderBy("terminal.id", "DESC")
            .getOne();

        let newNumber = 1;
        if (lastTerminal) {
            const lastNumber = parseInt(lastTerminal.id.replace("RESQWAVE", ""), 10);
            newNumber = lastNumber + 1; 
        }

        const newID = "RESQWAVE" + String(newNumber).padStart(3, "0");

        const terminal = terminalRepo.create ({
            id: newID,
            status: "Offline",
        });

        await terminalRepo.save(terminal);

        res.status(201).json({message: "Terminal Created", terminal});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - CREATE Terminal"});
    }
};

// READ All Terminal
const getTerminals = async(req, res) => {
    try {
        const terminals = await terminalRepo.find();
        res.json(terminals);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - READ All Terminals"});
    }
}

// READ All (Active Only)
const getOnlineTerminals = async(req, res) => {
    try {
        const terminals = await terminalRepo.find({where: {status: "Online"} });
        res.json(terminals);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - READ Active Terminals"});
    }
};

// READ All (Offline Only)
const getOfflineTerminals = async(req, res) => {
    try {
        const terminals = await terminalRepo.find({where: {status: "Offline"} });
        res.json(terminals);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - READ Offline Terminals"});
    }
};

// READ One Terminal
const getTerminal = async (req, res) => {
    try {
        const terminal = await terminalRepo.findOne({ where: {id} });
        if (!terminal) {
            return res.status(404).json({message: "Terminal Not Found"});
        }
        res.json(terminal)
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - READ Terminal"});
    }
};

// UPDATE Terminal
const updateTerminal = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const terminal = await terminalRepo.findOne({ where: {id} });
        if (!terminal) {
            return res.status(404).json({message: "Terminal Not Found"});
        }

        if (status) terminal.status = status;

        await terminalRepo.save(terminal);

        res.json({message: "Terminal Updated", terminal});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - UPDATE Terminal"});
    }
}

// ARCHIVED Terminal
const archivedTerminal = async (req, res) => {
    try {
        const { id } =req.params;
        const terminal = await terminalRepo.findOne({where: {id} });
        if (!terminal) {
            return res.status(404).json({message: "Terminal Not Found"});
        }

        // Terminal Archived
        terminal.archived = true;
        await terminalRepo.save(terminal);

        // Find Linked Community Group
        const communityGroup = await communityGroupRepo.findOne({where: {terminalID: id} });
        if (communityGroup) {
            communityGroup.terminalID = null; // Detach Terminal
            await communityGroupRepo.save(communityGroup);
        }

        res.json({message: "Terminal Archived"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - ARCHIVED Terminal"});
    }
};

// READ Archived Terminal
const getArchivedTerminals = async (req, res) => {
    try {
        const terminals = await terminalRepo.find({ where: { archived: true} });
        res.json(terminals);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - GET ARCHIVED Terminal"});
    }
};

module.exports = {
    createTerminal,
    getOnlineTerminals,
    getOfflineTerminals,
    getTerminals,
    getTerminal,
    updateTerminal,
    archivedTerminal,
    getArchivedTerminals
};

