const express = require("express");
const Cart = require("../models/Cart");
const Food = require("../models/Food");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 Get User Cart
router.get("/", verifyToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate("items.foodId");

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [], totalAmount: 0 });
      await cart.save();
    }

    res.json({
      message: "Cart retrieved successfully",
      cart
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ 
      message: "Server error while fetching cart",
      error: error.message 
    });
  }
});

// 🔹 Add Item to Cart
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { foodId, quantity = 1 } = req.body;

    if (!foodId) {
      return res.status(400).json({ 
        message: "Food ID is required" 
      });
    }

    // Check if food exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [], totalAmount: 0 });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.foodId.toString() === foodId
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ foodId, quantity });
    }

    await cart.save();
    await cart.populate("items.foodId");

    console.log("✅ Item added to cart:", { userId: req.user.id, foodId, quantity });

    res.json({
      message: "Item added to cart successfully",
      cart
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ 
      message: "Server error while adding to cart",
      error: error.message 
    });
  }
});

// 🔹 Update Item Quantity
router.put("/update", verifyToken, async (req, res) => {
  try {
    const { foodId, quantity } = req.body;

    if (!foodId || quantity === undefined) {
      return res.status(400).json({ 
        message: "Food ID and quantity are required" 
      });
    }

    if (quantity < 1) {
      return res.status(400).json({ 
        message: "Quantity must be at least 1" 
      });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      item => item.foodId.toString() === foodId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate("items.foodId");

    console.log("✅ Cart item updated:", { userId: req.user.id, foodId, quantity });

    res.json({
      message: "Item quantity updated successfully",
      cart
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ 
      message: "Server error while updating cart",
      error: error.message 
    });
  }
});

// 🔹 Remove Item from Cart
router.delete("/remove/:foodId", verifyToken, async (req, res) => {
  try {
    const { foodId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item.foodId.toString() !== foodId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await cart.save();
    await cart.populate("items.foodId");

    console.log("✅ Item removed from cart:", { userId: req.user.id, foodId });

    res.json({
      message: "Item removed from cart successfully",
      cart
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ 
      message: "Server error while removing from cart",
      error: error.message 
    });
  }
});

// 🔹 Clear Cart
router.delete("/clear", verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    console.log("✅ Cart cleared:", { userId: req.user.id });

    res.json({
      message: "Cart cleared successfully",
      cart
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ 
      message: "Server error while clearing cart",
      error: error.message 
    });
  }
});

module.exports = router;
