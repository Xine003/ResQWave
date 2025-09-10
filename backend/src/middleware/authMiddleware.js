const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    // Get the token from the authorization header: "Bearer <token>"
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) {
        return res.status(401).json({ message: "Access Denied. No Token Provided"});
    }

    try {
        // Verify Token
        const secret = process.env.JWT_SECRET || "ResQWave-SecretKey";
        const decoded = jwt.verify(token, secret);

        // Attach user info to request
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or Expired Token"});
    }
};

module.exports = authMiddleware;