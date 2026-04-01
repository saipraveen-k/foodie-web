const express = require("express");
const Food = require("../models/Food");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 Get All Foods with Filtering
router.get("/", async (req, res) => {
  try {
    const { category, type, maxCalories, minProtein } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (maxCalories) {
      const calories = parseInt(maxCalories);
      if (!isNaN(calories) && calories > 0) {
        filter.calories = { $lte: calories };
      }
    }
    
    if (minProtein) {
      const protein = parseInt(minProtein);
      if (!isNaN(protein) && protein > 0) {
        filter.protein = { $gte: protein };
      }
    }

    console.log("🔍 Food filter applied:", filter);

    const foods = await Food.find(filter).sort({ name: 1 });
    
    res.json({
      message: "Foods retrieved successfully",
      count: foods.length,
      filters: Object.keys(filter).length > 0 ? filter : null,
      foods
    });
  } catch (error) {
    console.error("Get foods error:", error);
    res.status(500).json({ 
      message: "Server error while fetching foods",
      error: error.message 
    });
  }
});

// 🔹 Get Food by ID
router.get("/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    
    res.json({
      message: "Food retrieved successfully",
      food
    });
  } catch (error) {
    console.error("Get food error:", error);
    res.status(500).json({ 
      message: "Server error while fetching food",
      error: error.message 
    });
  }
});

// 🔹 Add Food (Admin Only)
router.post("/add", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, category, type, calories, protein, price, image } = req.body;

    // Validation
    if (!name || !category || !type || calories === undefined || protein === undefined || price === undefined) {
      return res.status(400).json({ 
        message: "All required fields must be provided",
        required: ["name", "category", "type", "calories", "protein", "price"]
      });
    }

    const food = new Food({
      name: name.trim(),
      category,
      type,
      calories,
      protein,
      price,
      image: image || ""
    });

    await food.save();

    console.log("✅ New food added:", { id: food._id, name: food.name, category: food.category });

    res.status(201).json({ 
      message: "Food added successfully", 
      food 
    });
  } catch (error) {
    console.error("Add food error:", error);
    res.status(500).json({ 
      message: "Server error while adding food",
      error: error.message 
    });
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

// 🔹 Bulk Add Foods (Admin Only)
router.post("/bulk-add-admin", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const foods = req.body;
    
    if (!Array.isArray(foods) || foods.length === 0) {
      return res.status(400).json({ message: "Please provide an array of foods" });
    }

    const savedFoods = await Food.insertMany(foods);

    console.log(`✅ Bulk added ${savedFoods.length} foods`);

    res.status(201).json({ 
      message: `${savedFoods.length} foods added successfully`, 
      foods: savedFoods 
    });
  } catch (error) {
    console.error("Bulk add foods error:", error);
    res.status(500).json({ 
      message: "Server error while bulk adding foods",
      error: error.message 
    });
  }
});

// 🔹 Update Food (Admin Only)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    console.log("✅ Food updated:", { id: food._id, name: food.name });

    res.json({ 
      message: "Food updated successfully", 
      food 
    });
  } catch (error) {
    console.error("Update food error:", error);
    res.status(500).json({ 
      message: "Server error while updating food",
      error: error.message 
    });
  }
});

// 🔹 Delete Food (Admin Only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    console.log("✅ Food deleted:", { id: food._id, name: food.name });

    res.json({ message: "Food deleted successfully" });
  } catch (error) {
    console.error("Delete food error:", error);
    res.status(500).json({ 
      message: "Server error while deleting food",
      error: error.message 
    });
  }
});

module.exports = router;