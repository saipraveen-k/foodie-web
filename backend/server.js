const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const { verifyToken, verifyAdmin } = require("./middleware/authMiddleware");
const app = express();
const foodRoutes = require("./routes/foodRoutes");
const orderRoutes = require("./routes/orderRoutes");
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully ✅"))
  .catch((err) => console.log("MongoDB Connection Error ❌", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Backend & Database Connected 🚀");
});

// ✅ Protected Route (must be BEFORE app.listen)
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: "This is protected data 🔒",
    user: req.user
  });
});

const PORT = process.env.PORT || 5000;
// Admin Only Route
app.get("/api/admin", verifyToken, verifyAdmin, (req, res) => {
  res.json({
    message: "Welcome Admin 👑",
    user: req.user
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});