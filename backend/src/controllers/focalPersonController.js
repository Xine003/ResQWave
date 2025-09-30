const { AppDataSource } = require("../config/dataSource");
const bcrypt = require("bcrypt");
const focalPersonRepo = AppDataSource.getRepository("FocalPerson");

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

        const responseBody = { message: "Focal Person Created", focalPerson };
        if (!password) {
            responseBody.temporaryPassword = plainPassword;
        }

        res.status(201).json(responseBody);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - CREATE FP"});
    }
}

// READ All Focal Person
const getFocalPersons = async (req, res) => {
    try {
        const focalPersons = await focalPersonRepo.find();
        res.json(focalPersons);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - READ All FP"});
    }
};

// READ One Focal Person
const getFocalPerson = async (req, res) => {
    try {
        const {id} = req.params;
        const focalPerson = await focalPersonRepo.findOne({where: {id} });
        if (!focalPerson) {
            return res.status(404).json({message: "Focal Person Not Found"});
        }
        res.json(focalPerson);
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
        const fp = await focalPersonRepo.findOne({where: {id} });
        if (!fp || !fp.photo) return res.status(404).send("Photo Not Found");

        // Without a mime column, fallback to a generic type
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
        const fp = await focalPersonRepo.findOne({where: {id} });
        if (!fp || !fp.alternativeFPImage) return res.status(404).send("Alternative Photo Not Found");

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
};
