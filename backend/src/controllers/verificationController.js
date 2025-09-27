const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../config/dataSource");

const verificationRepo = AppDataSource.getRepository("LoginVerification");
const dispatcherRepo = AppDataSource.getRepository("Dispatcher");
const focalRepo = AppDataSource.getRepository("FocalPerson");

const verifyDispatcherLogin = async (req, res) => {
    try {
        const {tempToken, code} = req.body;

        // decode tempToken to get userId
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        if (decoded.step !== "2fa") {
            return res.status(400).json({ message: "Invalid flow" });
        }

        const record = await verificationRepo.findOne({where: {
            userID: decoded.id, 
            userType:"dispatcher", 
            code}
        });

        if(!record) {
            return res.status(400).json({message: "Invalid Code"});
        }

        if (new Date() > record.expiry) {
            return res.status(400).json({message: "Code Expired"});
        }

        // If Valid
        const dispatcher = await dispatcherRepo.findOne({where: {id: decoded.id} });
        
        // Create Session
        const sessionID = crypto.randomUUID();
        const expiry = new Date(Date.now() + 60 * 60 * 1000);

        const sessionEntry = verificationRepo.create({
            userID: dispatcher.id,
            userType: "dispatcher",
            code: null,
            sessionID, 
            expiry
        });

        await verificationRepo.save(sessionEntry);

        // Issue a Token
        const token = jwt.sign(
            {
                id: dispatcher.id, 
                name: dispatcher.name, 
                role:"dispatcher",
                sessionID
            }, 
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        );

        // Remove Verification
        await verificationRepo.remove(record);

        res.json({message: "Login Successful", token});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error"});
    }
};

const verifyFocalPersonLogin = async (req, res) => {
    try {
        const {tempToken, code} = req.body;

        // decode tempToken to get userId
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        if (decoded.step !== "2fa") {
            return res.status(400).json({ message: "Invalid flow" });
        }

        const record = await verificationRepo.findOne({
            where: {userID: decoded.id, userType:"focalPerson", code},
        });

        if(!record) {
            return res.status(400).json({message: "Invalid Code"});
        }

        if (new Date() > record.expiry) {
            return res.status(400).json({message: "Code Expired"});
        }

        // If Valid
        const focalPerson = await focalRepo.findOne({where: {id: decoded.id} });

        // Create Session
        const sessionID = crypto.randomUUID();
        const expiry = new Date(Date.now() + 60 * 60 * 1000);

        const sessionEntry = verificationRepo.create({
            userID: focalPerson.id,
            userType: "focalPerson",
            code: null,
            sessionID,
            expiry
        });

        await verificationRepo.save(sessionEntry);

        // Issue a token
        const token = jwt.sign(
            {id: focalPerson.id, name: focalPerson.name, role:"focalPerson", sessionID}, 
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        );

        // Remove Verification
        await verificationRepo.remove(record);

        res.json({message: "Login Successful", token});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error"});
    }
};

module.exports = {
    verifyDispatcherLogin,
    verifyFocalPersonLogin
};