const bcrypt = require("bcrypt");
const { AppDataSource } = require("../config/dataSource");
const dispatcherRepo = AppDataSource.getRepository("Dispatcher");

// CREATE Dispatcher
const createDispatcher = async(req, res) => {
    try {
        const {name, email, contactNumber, password, adminID } = req.body;

        // Check if the email exists
        const existingEmail = await dispatcherRepo.findOne({ where: {email} });
        if (existingEmail) {
            return res.status(400).json({ message: "Email Already Used" });
        }

        // Check if the contact number exist
        const existingNumber = await dispatcherRepo.findOne({ where: {contactNumber } });
        if (existingNumber) {
            return res.status(400).jsono({ message: "Contact Number already used"});
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

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        const dispatcher = dispatcherRepo.create({
            id: newID,
            name,
            contactNumber,
            email,
            password: hashedPassword,
            createdBy: adminID,
        });

        await dispatcherRepo.save(dispatcher);

        res.status(201).json({message: "Dispatcher Created", dispatcher });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - CREATE Dispatcher"});
    }
};

// READ Dispatchers (Exclude Archived)
const getDispatchers = async (req, res) => {
    try {
        const dispatchers = await dispatcherRepo.find({where: {archived: false} });
        res.json(dispatchers);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - READ Dispatcher"});
    }
};

// READ One Dispatcher
const getDispatcher = async (req, res) => {
    try {
       const { id } = req.params;
       const dispatcher = await dispatcherRepo.findOne({where: {id} });
       if (!dispatcher) {
        return res.status(404).json({message: "Dispatcher Does Not Exist"});
       }
       res.json(dispatcher);
    } catch (err) {
        console.error(err)
        res.status(500).json({message: "Server Error - ONE Dispatcher"});
    }
};

// UPDATE Dispatcher
const updateDispatcher = async (req, res) => {
    try {
        const { id } = req.params;
        const {name, email, contactNumber, password} = req.body;

        const dispatcher = await dispatcherRepo.findOne({where: {id} });
        if (!dispatcher) {
            return res.status(404).json({message: "Dispatcher Not Found"});
        }

        if (name) dispatcher.name = name;
        if (email) dispatcher.email = email;
        if (contactNumber) dispatcher.contactNumber = contactNumber;
        if (password) dispatcher.password = await bcrypt.hash(password, 10);

        await dispatcherRepo.save(dispatcher);

        res.json({message: "Dispatcher Updated", dispatcher});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - UPDATE Dispatcher"});
    }
};

// ARCHIVE Dispatcher
const archiveDispatcher = async (req, res) => {
    try {
        const { id } = req.params;
        const dispatcher = await dispatcherRepo.findOne({ where: {id} });
        if (!dispatcher) {
            return res.status(404).json({message: "Dispatcher Not Found"});
        }

        dispatcher.archived = true
        await dispatcherRepo.save(dispatcher);

        res.json({message: "Dispatcher Archived"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - ARCHIVED Dispatcher"});
    }
};

// READ ARCHIVE Dispatcher
const archiveDispatchers = async (req, res) => {
    try {
        const archivedDispatchers = await dispatcherRepo.find({where: {archived: true} });
        res.json(archivedDispatchers);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error - ARCHIVED Dispatchers"});
    }
};

module.exports = {
    createDispatcher,
    getDispatchers,
    getDispatcher,
    updateDispatcher,
    archiveDispatcher,
    archiveDispatchers
};