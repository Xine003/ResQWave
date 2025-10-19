const { AppDataSource } = require("../config/dataSource");
const bcrypt = require("bcrypt");
const focalPersonRepo = AppDataSource.getRepository("FocalPerson");
const {
    getCache,
    setCache,
    deleteCache
} = require("../config/cache");
const registrationRepo = AppDataSource.getRepository("FocalPersonRegistration");
const neighborhoodRepo = AppDataSource.getRepository("Neighborhood");
const focalRepo = AppDataSource.getRepository("FocalPerson");
const terminalRepo = AppDataSource.getRepository("Terminal");

// Helper to strip sensitive fields before caching
function sanitizeFP(fp) {
    if (!fp) return fp;
    const {password, photo, alternativeFPImage, ...rest} = fp;
    return rest;
}

// CREATE FocalPerson 
const createFocalPerson = async (req, res) => {
    try {
        const { communityGroupID, name, email, contactNumber, address, alternativeFP, alternativeFPEmail , alternativeFPContactNumber, password } = req.body;

        if (!communityGroupID) {
            return res.status(400).json({ message: "communityGroupID is required" });
        }

        // Generate Specific UID
        const lastFocalPerson = await focalPersonRepo
            .createQueryBuilder("focalPerson")
            .orderBy("focalPerson.id", "DESC")
            .getOne();

        let newNumber = 1;
        if (lastFocalPerson) {
            const lastNumber = parseInt(lastFocalPerson.id.replace("FOCALP", ""), 10);
            newNumber = lastNumber + 1; 
        }

        const newID = "FOCALP" + String(newNumber).padStart(3, "0");

        // Default password is Focal Person ID when not provided
        const plainPassword = password || newID;
        // Hashed Password
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Optional files (present only if request is multipart/form-data)
        const files = req.files || {};
        const main = files.photo?.[0];
        const alt = files.alternativeFPImage?.[0];

        const focalPerson = focalPersonRepo.create({
            id: newID,
            communityGroupID,
            name,
            email,
            contactNumber,
            address,
            alternativeFP,
            alternativeFPEmail,
            alternativeFPContactNumber,
            createdBy: req.user && req.user.id ? req.user.id : null,
            password: hashedPassword,
            // Optional Blobs
            ...(main?.buffer ? {photo: main.buffer} : {}),
            ...(alt?.buffer ? {alternativeFPImage: alt.buffer}: {})
        });

        await focalPersonRepo.save(focalPerson);

        // Invalidate 
        await deleteCache("focalPersons:all");

        const responseBody = { message: "Focal Person Created", focalPerson };
        if (!password) {
            responseBody.temporaryPassword = plainPassword;
        }

        res.status(201).json(responseBody);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - CREATE FP"});
    }
};

const approveFocalRegistration = async (req, res) => {
    try {
        const registrationID = String(req.params.id || "").trim();
        const { terminalID } = req.body || {};

        if (!registrationID) {
            return res.status(400).json({ message: "RegistrationID is Required" });
        }
        if (!terminalID) {
            return res.status(400).json({ message: "TerminalID is Required" });
        }

        // Load Registration (entity, not the repo)
        const registration = await registrationRepo.findOne({ where: { id: registrationID } });
        if (!registration) {
            return res.status(404).json({ message: "Registration not found" });
        }
        if ((registration.status || "").toLowerCase() !== "pending") {
            return res.status(400).json({ message: "Registration is not pending" });
        }

        // Validate Terminal
        const terminal = await terminalRepo.findOne({ where: { id: terminalID } });
        if (!terminal) return res.status(404).json({ message: "Terminal not found" });
        if (terminal.availability === "occupied") {
            return res.status(400).json({ message: "Terminal already occupied" });
        }

        // Generate Focal Person ID (FP001…)
        const lastFocal = await focalRepo
            .createQueryBuilder("fp")
            .orderBy("fp.id", "DESC")
            .getOne();

        let newFPNumber = 1;
        if (lastFocal?.id) {
            const lastNum = parseInt(String(lastFocal.id).replace("FP", ""), 10);
            if (!Number.isNaN(lastNum)) newFPNumber = lastNum + 1;
        }
        const newFocalPersonID = "FP" + String(newFPNumber).padStart(3, "0");

        // Create Focal Person from registration
        const focalEntity = focalRepo.create({
            id: newFocalPersonID,
            // keep first/last names separate
            firstName: registration.firstName,
            lastName: registration.lastName,

            email: registration.email || null,
            contactNumber: registration.phoneNumber || null,
            password: registration.password, // already hashed at registration time

            // store location stringified
            address: registration.location || null,

            // alternative focal person fields
            altFirstName: registration.altFirstName || null,
            altLastName: registration.altLastName || null,
            altContactNumber: registration.altPhoneNumber || null,

            // photos
            ...(registration.photo ? { photo: registration.photo } : {}),
            ...(registration.altPhoto ? { alternativeFPImage: registration.altPhoto } : {}),

            archived: false,
        });
        const savedFocal = await focalRepo.save(focalEntity);

        // Generate Neighborhood ID (N001…)
        const lastNeighborhood = await neighborhoodRepo
            .createQueryBuilder("n")
            .orderBy("n.id", "DESC")
            .getOne();

        let newNbrNumber = 1;
        if (lastNeighborhood?.id) {
            const lastNum = parseInt(String(lastNeighborhood.id).replace("N", ""), 10);
            if (!Number.isNaN(lastNum)) newNbrNumber = lastNum + 1;
        }
        const newNeighborhoodID = "N" + String(newNbrNumber).padStart(3, "0");

        // Hazards JSON (support both hazardsJson and hazards string)
        let hazardsString = null;
        if (registration.hazardsJson) {
            hazardsString = registration.hazardsJson;
        } else if (registration.hazards) {
            // if it was stored as CSV or array string earlier
            try { hazardsString = JSON.stringify(JSON.parse(registration.hazards)); }
            catch { hazardsString = JSON.stringify(String(registration.hazards).split(",").map(s => s.trim()).filter(Boolean)); }
        }

        // Create Neighborhood linked to the focalPersonID (not registrationID)
        const neighborhoodEntity = neighborhoodRepo.create({
            id: newNeighborhoodID,
            focalPersonID: savedFocal.id,
            terminalID,

            noOfHouseholds: registration.noOfHouseholds ?? null,
            noOfResidents: registration.noOfResidents ?? null,
            floodSubsideHours: registration.floodSubsideHours ?? null,
            hazards: hazardsString,
            otherInformation: registration.otherInformation ?? null,

            archived: false,
        });
        const savedNeighborhood = await neighborhoodRepo.save(neighborhoodEntity);

        // Mark Terminal occupied
        await terminalRepo.update({ id: terminalID }, { availability: "occupied" });

        // Delete Registration after successful transfer
        await registrationRepo.delete({ id: registration.id });

        return res.json({
            message: "Registration approved",
            focalPersonID: savedFocal.id,        // FP001
            neighborhoodID: savedNeighborhood.id, // N001
            terminalID,
            deletedRegistrationID: registrationID,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error - APPROVE REGISTRATION" });
    }
}

// READ All Focal Person
const getFocalPersons = async (req, res) => {
    try {
        const cacheKey = "focalPersons:all";
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);

        const focalPersons = await focalPersonRepo.find();
        const sanitized = focalPersons.map(sanitizeFP);
        await setCache(cacheKey, sanitized, 120);
        res.json(sanitized);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - READ All FP"});
    }
};

// READ One Focal Person
const getFocalPerson = async (req, res) => {
    try {
        const {id} = req.params;
        const cacheKey = `focalPerson:${id}`;
        const cached = await getCache(cacheKey);
        if (cached) return res.json(cached);

        const focalPerson = await focalPersonRepo.findOne({where: {id} });
        if (!focalPerson) {
            return res.status(404).json({message: "Focal Person Not Found"});
        }

        const sanitized = sanitizeFP(focalPerson);
        await setCache(cacheKey, sanitized, 100);
        res.json(sanitized);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - READ One FP"});
    }
};

const updateFocalPhotos = async (req, res) => {
    try {
        const {id} = req.params;
        const fp = await focalPersonRepo.findOne({where: {id} });
        if (!fp) return res.status(404).json({message: "Focal Person Not Found"});

        const files = req.files || {};
        const main = files.photo?.[0];
        const alt = files.alternativeFPImage?.[0];

        console.log("Files:", req.files);
        console.log("Body:", req.body);

        if (!main && !alt) {
            return res.status(400).json({message: "No Files Uploaded"});
        }

        // Save Buffers into BLOB 
        if (main?.buffer) fp.photo = main.buffer;
        if (alt?.buffer) fp.alternativeFPImage = alt.buffer

        await focalPersonRepo.save(fp);
        
        // Invalidate 
        await deleteCache(`focalPerson:${id}`);
        await deleteCache("focalPersons:all");
        await deleteCache(`focalPhoto:${id}`);
        await deleteCache(`focalAltPhoto:${id}`);

        // Do not include raw blobs in JSON response
        return res.json({message: "Focal Person Photos Updated", id: fp.id});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Server Error"})
    }
};


// Stream Main Photo (Blob) to Client
const getFocalPhoto = async (req, res) => {
    try {
        const {id} = req.params;
        const cacheKey = `focalPhoto:${id}`;
        const cached = await getCache(cacheKey);
        if (cached) {
            res.setHeader("Content-Type", "application/octet-stream");
            return res.send(Buffer.from(cached, "base64"));
        }

        const fp = await focalPersonRepo.findOne({where: {id} });
        if (!fp || !fp.photo) return res.status(404).send("Photo Not Found");

        // Without a mime column, fallback to a generic type
        await setCache(cacheKey, Buffer.from(fp.photo).toString("base64"), 86400);
        res.setHeader("Content-Type", "application/octect-stream");
        return res.send(fp.photo);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Server Error");
    }
};


// Stream Alt Photo
const getAlternativeFocalPhoto = async (req, res) => {
    try {
        const {id} = req.params;
        const cacheKey = `focalAltPhoto:${id}`;
        const cached = await getCache(cacheKey);
        if (cached) {
            res.setHeader("Content-Type", "application/octet-stream");
            return res.send(Buffer.from(cached, "base64"));
        }
        const fp = await focalPersonRepo.findOne({where: {id} });
        if (!fp || !fp.alternativeFPImage) return res.status(404).send("Alternative Photo Not Found");

        await setCache(cacheKey, Buffer.from(fp.alternativeFPImage).toString("base64"), 86400);
        res.setHeader("Content-Type", "application/octet-stream");
        return res.send(fp.alternativeFPImage);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Server Error");
    }
};

// UPDATE Focal Person
const updateFocalPerson = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contactNumber, alternativeFP, alternativeFPContactNumber} = req.body;

        const focalPerson = await focalPersonRepo.findOne({ where: {id} });
        if (!focalPerson) {
            return res.status(404).json({message: "Focal Person Not Found"});
        }

        if (name) focalPerson.name = name;
        if (contactNumber) focalPerson.contactNumber = contactNumber;
        if (alternativeFP) focalPerson.alternativeFP = alternativeFP;
        if (alternativeFPContactNumber) focalPerson.alternativeFPContactNumber = alternativeFPContactNumber;

        await focalPersonRepo.save(focalPerson);

        // Invalidate
        await deleteCache(`focalPerson:${id}`);
        await deleteCache("focalPersons:all");

        res.json({message: "Focal Person Updated", focalPerson});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - UPDATE FP"});
    }
};

// UPDATE Password
const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword, confirmPassword} = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.json(400).json({message: "Current Password, New Password and Confirm Password cannot be empty."})
        }

        if (newPassword !== confirmPassword) {
            return res.json(400).json({message: "New Password and Confirm Password are not matched"})
        }

        // Password Policy
        const policy = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
        if (!policy.test(newPassword)) {
            return res.status(400).json({message: "Password must atleast have 1 Capital, 1 Number and 1 Special Character"});
        }

        const focalPerson = await focalPersonRepo.findOne({where: {id} });
        if (!focalPerson) {
            return res.status(404).json({message: "Focal Person Not Found"});
        }

        const ok = await bcrypt.compare(currentPassword, focalPerson.password);
        if (!ok) {
            return res.status(400).json({message: "Current Password is incorrect."});
        }

        const same = await bcrypt.compare(newPassword, focalPerson.password);
        if (same) return res.status(400).json({message: "New Password must be different from current password"});

        focalPerson.password = await bcrypt.hash(newPassword, 10);
        await focalPersonRepo.save(focalPerson);

        // Invalidate
        await deleteCache(`focalPerson:${id}`);
        await deleteCache("focalPersons:all");

        return res.json({message: "Password Updated"});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Server Error"});
    }
};



module.exports = {
    createFocalPerson,
    getFocalPersons,
    getFocalPerson,
    updateFocalPerson,
    updateFocalPhotos,
    getFocalPhoto,
    getAlternativeFocalPhoto,
    changePassword,
    approveFocalRegistration,
};
