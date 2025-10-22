const { AppDataSource } = require("../config/dataSource");
const terminalRepo = AppDataSource.getRepository("Terminal");
const communityGroupRepo = AppDataSource.getRepository("CommunityGroup");
const neighborhoodRepo = AppDataSource.getRepository("Neighborhood");
const {
    getCache,
    setCache,
    deleteCache
} = require("../config/cache");

// CREATE Terminal
const createTerminal = async (req, res) => {
    try {
        const { name } = req.body;

        // Validate Terminal Name
        if (!name) {
            return res.status(400).json({message: "Terminal name is required"});
        }

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
            name,
            status: "Offline",
        });

        await terminalRepo.save(terminal);

        // Invalidate
        await deleteCache("terminals:all");
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
const getTerminals = async (req, res) => {
    try {
        const cacheKey = "terminals:active";
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);

        // Fetch only active terminals
        const terminals = await terminalRepo.find({
            where: { archived: false },
        });

        await setCache(cacheKey, terminals, 60);
        res.json(terminals);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error - READ Active Terminals" });
    }
};


// READ All (Active Only)
const getOnlineTerminals = async (req, res) => {
    try {
        const cacheKey = "onlineTerminals";
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);

        // Fetch only the selected columns
        const terminals = await terminalRepo.find({
            where: { status: "Online" },
            select: ["id", "createdAt", "status", "availability", "name"],
        });

        await setCache(cacheKey, terminals, 300);
        res.json(terminals);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error - READ Active Terminals" });
    }
};


// READ All (Offline Only)
const getOfflineTerminals = async(req, res) => {
    try {
        const cacheKey = "offlineTerminals";
        const cached = await getCache(cached);
        if (cached) return res.json(cached);

        const terminals = await terminalRepo.find({
            where: { status: "Offline" },
            select: ["id", "createdAt", "status", "availability", "name"],
        });

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
        const { status, name } = req.body;

        const terminal = await terminalRepo.findOne({ where: {id} });
        if (!terminal) {
            return res.status(404).json({message: "Terminal Not Found"});
        }

        if (status) terminal.status = status;
        if (name) terminal.name = name;

        await terminalRepo.save(terminal);

        // Invalidate
        await deleteCache("terminals:all")
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
        const { id } = req.params;

        // Find the terminal
        const terminal = await terminalRepo.findOne({ where: { id } });
        if (!terminal) {
            return res.status(404).json({ message: "Terminal Not Found" });
        }

        // Archive the terminal
        terminal.archived = true;
        terminal.availability = "Available"; // Make it available again
        await terminalRepo.save(terminal);

        // Find linked neighborhood
        const neighborhood = await neighborhoodRepo.findOne({ where: { terminalID: id } });
        if (neighborhood) {
            neighborhood.terminalID = null; // Detach terminal
            await neighborhoodRepo.save(neighborhood);
        }

        // Invalidate cache
        await deleteCache("terminals:all");
        await deleteCache("onlineTerminals");
        await deleteCache("offlineTerminals");
        await deleteCache("terminals:archived");

        res.json({ message: "Terminal Archived and Now Available" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error - ARCHIVE Terminal" });
    }
};

// Unarchived Terminal
const unarchiveTerminal = async (req, res) => {
    try {
        const {id} = req.params;

        const terminal = await terminalRepo.findOne({where: {id} });
        if (!terminal) {
            return res.status(404).json({message: "Terminal Not Found"});
        }
        if (!terminal.archived) {
            return res.status(400).json({message: "Terminal is not archived"});
        }

        // Unarchive and make available
        // Not automatically attach to any neighborhood
        terminal.archived = false,
        terminal.availability = "Available";
        terminal.status = terminal.status;

        await terminalRepo.save(terminal);

        //Cache
        await deleteCache("terminals:all");
        await deleteCache("onlineTerminals");
        await deleteCache("offlineTerminals");
        await deleteCache("terminals:archived");

        return res.json({message: "Terminal Unarchived and Available"});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Server Error"});
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
    unarchiveTerminal,
    getArchivedTerminals
};

