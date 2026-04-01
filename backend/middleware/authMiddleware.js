const jwt = require("jsonwebtoken");

// Verify Token
const verifyToken = (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Remove "Bearer "
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (error) {
    console.error("JWT verification error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Admin Check
const verifyAdmin = (req, res, next) => {

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  next();
};

// Verify User (customer or admin)
const verifyUser = (req, res, next) => {
  if (!["user", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied. User access required." });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin, verifyUser };