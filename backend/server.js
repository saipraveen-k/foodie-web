const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

// Import middleware
const { verifyToken, verifyAdmin } = require("./middleware/authMiddleware");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    
    // Log all collections on connection
    const collections = await conn.connection.db.listCollections().toArray();
    console.log("📁 Available collections:", collections.map(c => c.name));
    
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.log("🔄 Retrying connection in 5 seconds...");
    
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "FoodieWeb Backend API is running 🚀",
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/complaints", complaintRoutes);

// Protected route example
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: "This is protected data 🔒",
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Admin only route
app.get("/api/admin", verifyToken, verifyAdmin, (req, res) => {
  res.json({
    message: "Welcome Admin 👑",
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error("🔥 Global Error Handler:", error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      message: "Validation Error",
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      message: `${field} already exists`,
      field
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: "Invalid token"
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: "Token expired"
    });
  }
  
  // Default error
  res.status(error.status || 500).json({
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
});