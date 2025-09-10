const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../config/dataSource");

const adminRepo = AppDataSource.getRepository("Admin");

// Registration
const register = async (req, res) => {
    try {
        const { name, password } = req.body;

        // check if already exists
        const existingAdmin = await adminRepo.findOne({ where: { name } });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exist" });
        }

        // Get the last admin
        const lastAdmin = await adminRepo
            .createQueryBuilder("admin")
            .orderBy("admin.id", "DESC")
            .getOne();

        let newNumber = 1;
        if (lastAdmin) {
            const lastNumber = parseInt(lastAdmin.id.replace("ADM", ""), 10);
            newNumber = lastNumber + 1;
        }
        
        const newID = "ADM" + String(newNumber).padStart(3, "0");

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = adminRepo.create({
            id: newID,
            name,
            password: hashedPassword,
        });

        await adminRepo.save(newAdmin);

        // Return the new admin's id
        res.status(201).json({ message: "Admin Registered Successfully", id: newAdmin.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Login
const login = async (req, res) => {
    try {
        const {name, password} = req.body;

        // Find Admin
        const admin = await adminRepo.findOne({ where: { name } });
        if (!admin) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Compare Password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Create JWT
        const token = jwt.sign(
            { id: admin.id, name: admin.name },
            process.env.JWT_SECRET || "ResQWave-SecretKey",
            { expiresIn: "1h" }
        );


        res.json({ message: "Login Successful", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error"});
    }
};

module.exports = { register, login };
