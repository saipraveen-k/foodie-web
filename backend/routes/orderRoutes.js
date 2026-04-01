const express = require("express");
const Order = require("../models/Order");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔥 Place Order
router.post("/place", verifyToken, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    const order = new Order({
      user: req.user.id,
      items,
      totalAmount,
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully ✅",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// 🔥 Get My Orders
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.food");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;