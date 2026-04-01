const express = require("express");
const Food = require("../models/Food");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 Add Food (Admin Only)
router.post("/add", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const food = new Food(req.body);
    await food.save();
    res.status(201).json({ message: "Food added successfully", food });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// 🔹 Bulk Add Foods (Temporary)
router.post("/bulk-add", async (req, res) => {
  try {
    const foods = await Food.insertMany(req.body);
    res.status(201).json({ message: "Foods added successfully", foods });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// 🔹 Get All Foods
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// 🔹 Delete Food (Admin Only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Food deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;