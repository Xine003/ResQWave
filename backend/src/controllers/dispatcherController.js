const bcrypt = require("bcrypt");
const { AppDataSource } = require("../config/dataSource");
const dispatcherRepo = AppDataSource.getRepository("Dispatcher");
const {
    getCache,
    setCache,
    deleteCache
} = require("../config/cache");

// CREATE Dispatcher
const createDispatcher = async(req, res) => {
    try {
        const {name, email, contactNumber, password} = req.body;
        const photoFile = req.file || req.files?.photo?.[0];

        // Check if the email exists
        const existingEmail = await dispatcherRepo.findOne({ where: {email} });
        if (existingEmail) {
            return res.status(400).json({ message: "Email Already Used" });
        }

        // Check if the contact number exist
        const existingNumber = await dispatcherRepo.findOne({ where: {contactNumber } });
        if (existingNumber) {
            return res.status(400).json({ message: "Contact Number already used"});
        }

        // Generate Specific UID
        const lastDispatcher = await dispatcherRepo
            .createQueryBuilder("dispatcher")
            .orderBy("dispatcher.id", "DESC")
            .getOne();

        let newNumber = 1;
        if (lastDispatcher) {
            const lastNumber = parseInt(lastDispatcher.id.replace("DSP", ""), 10);
            newNumber = lastNumber + 1;
        }

        const newID = "DSP" + String(newNumber).padStart(3, "0");

        // Default password is Dispatcher ID when not provided
        const plainPassword = password || newID;
        
        // Hash Password
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const dispatcher = dispatcherRepo.create({
            id: newID,
            name,
            contactNumber,
            email,
            password: hashedPassword,
            createdBy: req.user && req.user.id ? req.user.id : null,
            ...(photoFile?.buffer ? {photo: photoFile.buffer} : {}),
        });

        await dispatcherRepo.save(dispatcher);

        // Invalidate Caches
        await deleteCache("dispatchers:active");
        await deleteCache("dispatcher:archived");

        // Return temporary password only when defaulted to ID
        const responseBody = { message: "Dispatcher Created"};
        if (!password) {
            responseBody.temporaryPassword = plainPassword;
        }

        res.status(201).json(responseBody);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - CREATE Dispatcher"});
    }
};

// READ Dispatchers (Exclude Archived)
const getDispatchers = async (req, res) => {
    try {
        const cacheKey = "dispatchers:active";
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);

        const dispatchers = await dispatcherRepo.find({
            where: { archived: false },
            select: ["id", "name", "contactNumber", "email", "createdAt"]
        });

        await setCache(cacheKey, dispatchers, 60);
        res.json(dispatchers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error - READ Dispatcher" });
    }
};


// READ One Dispatcher
const getDispatcher = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `dispatcher:${id}`;

        // Check cache
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);

        // Fetch dispatcher (all columns)
        const dispatcher = await dispatcherRepo.findOne({ where: { id } });

        if (!dispatcher) {
            return res.status(404).json({ message: "Dispatcher Does Not Exist" });
        }

        // Exclude password field
        const { password, ...safeData } = dispatcher;

        // Save to cache without password
        await setCache(cacheKey, safeData, 120);

        // Return the dispatcher (all info except password)
        res.json(safeData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error - ONE Dispatcher" });
    }
};



// UPDATE Dispatcher
const updateDispatcher = async (req, res) => {
    try {
        const { id } = req.params;
        const {name, email, contactNumber, password, removePhoto} = req.body || {};
        const photoFile = req.file || req.files?.photo?.[0];

        const dispatcher = await dispatcherRepo.findOne({ where: { id } });
        if (!dispatcher) return res.status(404).json({ message: "Dispatcher Not Found" });

        // Uniqueness checks if changing email/contact
        if (email && email !== dispatcher.email) {
            const emailInUse = await dispatcherRepo.findOne({ where: { email } });
            if (emailInUse) return res.status(409).json({ message: "Email already in use" });
            dispatcher.email = email;
        }
        if (contactNumber && contactNumber !== dispatcher.contactNumber) {
            const numberInUse = await dispatcherRepo.findOne({ where: { contactNumber } });
            if (numberInUse) return res.status(409).json({ message: "Contact number already in use" });
            dispatcher.contactNumber = contactNumber;
        }

        if (name) dispatcher.name = name;
        if (password) dispatcher.password = await bcrypt.hash(password, 10);

        // Photo update: replace if new file; otherwise keep existing
        if (photoFile?.buffer) {
          dispatcher.photo = photoFile.buffer;
        } else if (String(removePhoto).toLowerCase() === "true") {
            dispatcher.photo = null;
        }

        await dispatcherRepo.save(dispatcher);

        // Invalidate
        await deleteCache("dispatchers:active");
        await deleteCache("dispatchers:archived");
        await deleteCache(`dispatcher:${id}`);

        res.json({ message: "Dispatcher Updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error - UPDATE Dispatcher" });
    }
};

// ARCHIVE/DELETE Dispatcher
const archiveDispatcher = async (req, res) => {
    try {
        const { id } = req.params;
        const dispatcher = await dispatcherRepo.findOne({ where: {id} });
        if (!dispatcher) {
            return res.status(404).json({message: "Dispatcher Not Found"});
        }

        dispatcher.archived = true
        await dispatcherRepo.save(dispatcher);

        // Invalidate
        await deleteCache("dispatchers:active");
        await deleteCache("dispatchers:archived");
        await deleteCache(`dispatcher:${id}`);

        res.json({message: "Dispatcher Archived"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - ARCHIVED Dispatcher"});
    }
};

// READ ARCHIVE Dispatcher
const archiveDispatchers = async (req, res) => {
    try {
        const cacheKey = "dispatchers:archived";
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);

        const archivedDispatchers = await dispatcherRepo.find({
            where: { archived: true },
            select: ["id", "name", "contactNumber", "email", "updatedAt"] // using updatedAt instead of archivedAt 
        });

        await setCache(cacheKey, archivedDispatchers, 120);
        res.json(archivedDispatchers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error - ARCHIVED Dispatchers" });
    }
};

// PERMANENT DELETE Dispatcher
const deleteDispatcherPermanently = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if dispatcher exists
        const dispatcher = await dispatcherRepo.findOne({ where: { id } });
        if (!dispatcher) {
            return res.status(404).json({ message: "Dispatcher Not Found" });
        }

        // Only allow permanent deletion of archived dispatchers for safety
        if (!dispatcher.archived) {
            return res.status(400).json({ message: "Only archived dispatchers can be permanently deleted" });
        }

        // Permanently delete from database
        await dispatcherRepo.remove(dispatcher);

        // Invalidate caches
        await deleteCache("dispatchers:active");
        await deleteCache("dispatchers:archived");
        await deleteCache(`dispatcher:${id}`);

        res.json({ message: "Dispatcher Permanently Deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error - PERMANENT DELETE Dispatcher" });
    }
};


module.exports = {
    createDispatcher,
    getDispatchers,
    getDispatcher,
    updateDispatcher,
    archiveDispatcher,
    archiveDispatchers,
    deleteDispatcherPermanently
};