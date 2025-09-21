const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../config/dataSource");

const verificationRepo = AppDataSource.getRepository("LoginVerification");
const dispatcherRepo = AppDataSource.getRepository("Dispatcher");
const focalRepo = AppDataSource.getRepository("FocalPerson");

const verifyDispatcherLogin = async (req, res) => {
    try {
        const {id, code} = req.body;

        const record = await verificationRepo.findOne({where: {
            userID: id, 
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
        const dispatcher = await dispatcherRepo.findOne({where: {id} });
        
        const token = jwt.sign(
            {id: dispatcher.id, name: dispatcher.name, role:"dispatcher"}, 
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
        const {id, code} = req.body;

        const record = await verificationRepo.findOne({
            where: {userID: id, userType:"focalPerson", code},
        });

        if(!record) {
            return res.status(400).json({message: "Invalid Code"});
        }

        if (new Date() > record.expiry) {
            return res.status(400).json({message: "Code Expired"});
        }

        // If Valid
        const focalPerson = await focalRepo.findOne({where: {id} });

        const token = jwt.sign(
            {id: focalPerson.id, name: focalPerson.name, role:"focalPerson"}, 
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