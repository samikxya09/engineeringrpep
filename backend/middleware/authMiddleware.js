const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_here";

/**
 * Middleware to verify JWT token and protect private routes
 */
function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers["authorization"] || req.headers["Authorization"];
        const token = authHeader && authHeader.startsWith("Bearer ") 
            ? authHeader.split(" ")[1] 
            : null;

        if (!token) {
            return res.status(401).json({
                message: "Access token required. Please log in.",
            });
        }

        jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
            if (err) {
                return res.status(403).json({
                    message: "Invalid or expired access token. Please log in again.",
                });
            }

            // Attach decoded payload (id, email, faculty) to req.user
            req.user = decodedUser;
            next();
        });
    } catch (error) {
        console.error("Error in authMiddleware:", error);
        return res.status(500).json({
            message: "Internal server error during authentication",
        });
    }
}

module.exports = {
    authenticateToken,
};
