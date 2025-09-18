const { AppDataSource } = require("../config/dataSource");
const bcrypt = require("bcrypt");
const focalPersonRepo = AppDataSource.getRepository("FocalPerson");

// CREATE FocalPerson 
const createFocalPerson = async (req, res) => {
    try {
        const { communityGroupID, name, contactNumber, address, alternativeFP, alternativeFPContactNumber, password } = req.body;

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

        const focalPerson = focalPersonRepo.create({
            id: newID,
            communityGroupID,
            name,
            contactNumber,
            address,
            alternativeFP,
            alternativeFPContactNumber,
            createdBy: req.user && req.user.id ? req.user.id : null,
            password: hashedPassword,
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
        const focalPerson = await focalPersonRepo.find({where: {id} });
        if (!focalPerson) {
            return res.status(404).json({message: "Focal Person Not Found"});
        }
        res.json(focalPerson);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - READ One FP"});
    }
};

// UPDATE Focal Person
const updateFocalPerson = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contactNumber, alternativeFP, alternativeFPContactNumber} = req.body;

        const focalPerson = await focalPerson.findOne({ where: {id} });
        if (!focalPerson) {
            return res.status(404).json({message: "Focal Person Not Found"});
        }

        if (name) focalPerson.name = name;
        if (contactNumber) focalPerson.contactNumber = contactNumber;
        if (alternativeFP) focalPerson.alternativeFP = alternativeFP;
        if (alternativeFPContactNumber) focalPerson.alternativeFPContactNumber = alternativeFPContactNumber;

        await focalPerson.save(focalPerson);

        res.json({message: "Focal Person Updated", focalPerson});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - UPDATE FP"});
    }
};



module.exports = {
    createFocalPerson,
    getFocalPersons,
    getFocalPerson,
    updateFocalPerson
}
