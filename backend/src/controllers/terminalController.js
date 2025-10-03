const { AppDataSource } = require("../config/dataSource");
const terminalRepo = AppDataSource.getRepository("Terminal");
const communityGroupRepo = AppDataSource.getRepository("CommunityGroup");
const {
    getCache,
    setCache,
    deleteCache
} = require("../config/cache");

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

        // Invalidate
        await deleteCache("terminals:all");
        await deleteCache(`terminal:${id}`);
        await deleteCache("onlineTerminals");
        await deleteCache("offlineTerminals");
        await deleteCache("terminals:archived");

        res.status(201).json({message: "Terminal Created", terminal});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - CREATE Terminal"});
    }
};

// READ All Terminal
const getTerminals = async(req, res) => {
    try {
        const cacheKey = "terminals:all";
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);

        const terminals = await terminalRepo.find();

        await setCache(cacheKey, terminals, 60);
        res.json(terminals);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - READ All Terminals"});
    }
}

// READ All (Active Only)
const getOnlineTerminals = async(req, res) => {
    try {
        const cacheKey = "onlineTerminals";
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);

        const terminals = await terminalRepo.find({where: {status: "Online"} });
        
        await setCache(cacheKey, terminals, 300);
        res.json(terminals);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - READ Active Terminals"});
    }
};

// READ All (Offline Only)
const getOfflineTerminals = async(req, res) => {
    try {
        const cacheKey = "offlineTerminals";
        const cached = await getCache(cached);
        if (cached) return res.json(cached);

        const terminals = await terminalRepo.find({where: {status: "Offline"} });

        await setCache(cacheKey, terminals, 300);
        res.json(terminals);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - READ Offline Terminals"});
    }
};

// READ One Terminal
const getTerminal = async (req, res) => {
    try {
        const {id} = req.params;
        const cacheKey = `terminal:${id}`;
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);

        const terminal = await terminalRepo.findOne({ where: {id} });
        if (!terminal) {
            return res.status(404).json({message: "Terminal Not Found"});
        }

        await setCache(cacheKey, terminal, 300);
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

        // Invalidate
        await deleteCache("terminals:all")
        await deleteCache(`terminal:${id}`);
        await deleteCache("onlineTerminals");
        await deleteCache("offlineTerminals");
        await deleteCache("terminals:archived");

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

        // Invalidate
        await deleteCache("terminals:all");
        await deleteCache(`terminal:${id}`);
        await deleteCache("onlineTerminals");
        await deleteCache("offlineTerminals");
        await deleteCache("terminals:archived");

        res.json({message: "Terminal Archived"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - ARCHIVED Terminal"});
    }
};

// READ Archived Terminal
const getArchivedTerminals = async (req, res) => {
    try {
        const cacheKey = "terminals:archived";
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);

        const terminals = await terminalRepo.find({ where: { archived: true} });
        
        await setCache(cacheKey, terminals, 300);
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

