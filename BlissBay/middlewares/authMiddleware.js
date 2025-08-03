import jwt from "jsonwebtoken";

const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    return authHeader.split(" ")[1];
};

const verifyToken = async (req, res, next) => {

     console.log('Headers:', req.headers);
      const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
            console.log('No token provided');
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded successfully:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Authentication failed. Please sign in to continue." });
        }
        console.error("Auth error:", error);
        return res.status(401).json({ message: "Authentication failed" });
    }
};

const verifyAdmin = (req, res, next) => {
    const token = extractToken(req);
    
    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Type check for role
        if (typeof decoded.role !== "string" || decoded.role !== "admin") {
            console.log(`Access attempt by non-admin user: ${decoded.id || 'unknown'}`);
            return res.status(403).json({ message: "Access denied: Admins only" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Authentication failed. " });
        }
        console.error("Auth error:", error);
        return res.status(401).json({ message: "Authentication failed" });
    }
};


export { verifyToken, verifyAdmin };