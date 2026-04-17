import jwt from "jsonwebtoken";

export const verifyCompanyToken = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided. Authorization denied." });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
            return res.status(401).json({ message: "No token provided. Authorization denied." });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

        // Add company ID to request
        req.companyId = decoded.companyId;
        req.email = decoded.email;

        next();
    } catch (error) {
        console.error("Token verification error:", error);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired. Please login again." });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token. Authorization denied." });
        }

        return res.status(500).json({ message: "Server error during authentication" });
    }
};

export default { verifyCompanyToken };
