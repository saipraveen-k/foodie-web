const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "All fields are required",
        required: ["name", "email", "password"]
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Create new user (password will be hashed by pre-save middleware)
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(" New user registered:", { id: newUser._id, email: newUser.email, role: newUser.role });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      message: "Server error during registration",
      error: error.message 
    });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // DEBUG: Log incoming credentials (email only, never log password in production!)
    console.log("🔐 LOGIN ATTEMPT - Email:", email, "| Password length:", password ? password.length : 0);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    // Find user
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    
    // DEBUG: Log user lookup result
    if (!user) {
      console.log("❌ LOGIN FAILED - User not found for email:", normalizedEmail);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    console.log("✅ User found:", { 
      id: user._id, 
      email: user.email, 
      passwordHashStarts: user.password.substring(0, 7),
      role: user.role 
    });

    // Check password
    const isMatch = await user.comparePassword(password);
    
    // DEBUG: Log password comparison result
    console.log("🔑 Password comparison result:", isMatch ? "MATCH" : "NO MATCH");
    
    if (!isMatch) {
      console.log("❌ LOGIN FAILED - Password mismatch for user:", user.email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(" User logged in:", { id: user._id, email: user.email, role: user.role });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      message: "Server error during login",
      error: error.message 
    });
  }
});

// ================= GET USER PROFILE =================
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile retrieved successfully",
      user
    });

  } catch (error) {
    console.error("Profile error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;