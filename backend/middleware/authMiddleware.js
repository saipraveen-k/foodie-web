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

    const decoded = jwt.verify(token, "secretkey");

    req.user = decoded;

    next();

  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Admin Check
const verifyAdmin = (req, res, next) => {

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  next();
};

module.exports = { verifyToken, verifyAdmin };