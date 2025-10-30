const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../config/dataSource");
const crypto = require("crypto");

const verificationRepo = AppDataSource.getRepository("LoginVerification");
const dispatcherRepo = AppDataSource.getRepository("Dispatcher");
const focalRepo = AppDataSource.getRepository("FocalPerson");
const adminRepo = AppDataSource.getRepository("Admin");

// Send OTP (contact = email or phone)
const sendRegistrationCode = async (req, res) => {
  try {
    const { contact } = req.body || {};
    const contactIdentifier = String(contact || "").trim();
    if (!contactIdentifier) return res.status(400).json({ message: "Contact is required" });

    const code = String(crypto.randomInt(100000, 999999));
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await verificationRepo.delete({ userID: contactIdentifier, userType: "registration" });
    await verificationRepo.save(verificationRepo.create({
      userID: contactIdentifier,
      userType: "registration",
      code,
      expiry,
    }));

    const tempToken = jwt.sign(
      { step: "2fa", id: contactIdentifier, userType: "registration" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    // TODO: send via email/SMS; for now log
    console.log(`Registration OTP for ${contactIdentifier}: ${code}`);

    return res.json({ message: "OTP Sent", tempToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Verify OTP → issues regToken that carries the original contact
const verifyRegistrationCode = async (req, res) => {
  try {
    const { tempToken, code } = req.body || {};
    if (!tempToken || !code) return res.status(400).json({ message: "TempToken and Code are required" });

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (decoded.step !== "2fa" || decoded.userType !== "registration") {
      return res.status(400).json({ message: "Invalid Flow" });
    }

    const record = await verificationRepo.findOne({
      where: { userID: decoded.id, userType: "registration", code },
    });
    if (!record) return res.status(400).json({ message: "Invalid Code" });
    if (new Date() > record.expiry) return res.status(400).json({ message: "Code Expired" });

    await verificationRepo.remove(record);

    // IMPORTANT: contact is embedded here
    const regToken = jwt.sign(
      { purpose: "focal-register", contact: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    return res.json({ message: "OTP Verified", regToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
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
            {expiresIn: "8h"}
        );

        // Remove Verification
        await verificationRepo.remove(record);

        res.json({message: "Login Successful", token});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server Error"});
    }
};

// Combined Admin + Dispatcher 2FA verification
const adminDispatcherVerify = async (req, res) => {
  try {
    const { tempToken, code } = (req.body || {});
    if (!tempToken || !code) {
      return res.status(400).json({ message: "tempToken and code are required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired temp token" });
    }
    if (decoded.step !== "2fa" || !["admin", "dispatcher"].includes(decoded.role)) {
      return res.status(400).json({ message: "Invalid token context" });
    }

    // Must match userID + userType + code saved in login step
    const record = await verificationRepo.findOne({
      where: { userID: decoded.id, userType: decoded.role, code },
    });
    if (!record) return res.status(400).json({ message: "Invalid code" });
    if (new Date(record.expiry).getTime() < Date.now()) {
      await loginVerificationRepo.delete({ userID: decoded.id, userType: decoded.role, code });
      return res.status(400).json({ message: "Code expired" });
    }

    // Create session and clean used OTP
    const sessionID = crypto.randomUUID();
    const sessionExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await verificationRepo.save({
      userID: decoded.id,
      userType: decoded.role,
      code: "OK",
      sessionID,
      expiry: sessionExpiry,
    });
    await verificationRepo.delete({ userID: decoded.id, userType: decoded.role, code });

    // Build name
    let name = "User";
    if (decoded.role === "admin") {
      const admin = await adminRepo.findOne({ where: { id: decoded.id } });
      name = admin?.name || "Admin";
    } else {
      const dispatcher = await dispatcherRepo.findOne({ where: { id: decoded.id } });
      name = dispatcher?.name || "Dispatcher";
    }

    const token = jwt.sign(
      { id: decoded.id, role: decoded.role, name, sessionID },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error - VERIFY 2FA" });
  }
};


module.exports = {
  sendRegistrationCode,
  verifyRegistrationCode,
  verifyFocalPersonLogin,
  adminDispatcherVerify,
};