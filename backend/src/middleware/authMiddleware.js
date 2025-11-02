const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../config/dataSource");
const verificationRepo = AppDataSource.getRepository("LoginVerification");

const authMiddleware = async (req, res, next) => {
    // Get the token from the authorization header: "Bearer <token>"
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No Token Provided" });
    }

    try {
        // Verify Token
        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);

        // Allow admins to bypass session verification
        if (decoded.role === "admin") {
            req.user = decoded;
            return next();
        }

        // Check if the session is Enough
        if (!decoded.sessionID) {
            return res.status(403).json({ message: "Invalid Session" });
        }

        const session = await verificationRepo.findOne({
            where: { sessionID: decoded.sessionID },
        });

        if (!session || new Date() > session.expiry) {
            return res.status(401).json({ message: "Session expired or logged out" });
        }

        // Attach user info to request (contains id, name, role)
        req.user = decoded;
        // Optional: normalize for focal users so code can read either field
        if (req.user?.role && req.user.role.toLowerCase() === "focalperson") {
            req.user.focalPersonID = req.user.id; // alias
        }
        next();
    } catch {
        return res.status(403).json({ message: "Invalid or Expired Token" });
    }
};


const requireRole = (roles) => (req, res, next) => {
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!req.user || !req.user.role || !allowed.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
};


module.exports = {
    authMiddleware,
    requireRole
};