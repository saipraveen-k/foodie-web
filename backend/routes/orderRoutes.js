const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Food = require("../models/Food");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// � Place Order
router.post("/place", verifyToken, async (req, res) => {
  try {
    const { items, address } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: "Order items are required" 
      });
    }

    if (!address || address.trim().length < 10) {
      return res.status(400).json({ 
        message: "Valid delivery address is required (minimum 10 characters)" 
      });
    }

    // Calculate total amount and validate items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.foodId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ 
          message: "Each item must have a valid foodId and quantity (minimum 1)" 
        });
      }

      const food = await Food.findById(item.foodId);
      if (!food) {
        return res.status(404).json({ 
          message: `Food with ID ${item.foodId} not found` 
        });
      }

      const itemTotal = food.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        foodId: item.foodId,
        quantity: item.quantity,
        price: food.price
      });
    }

    // Create order
    const order = new Order({
      userId: req.user.id,
      items: orderItems,
      totalAmount,
      address: address.trim()
    });

    await order.save();
    await order.populate("items.foodId");

    // Clear user cart
    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { items: [], totalAmount: 0 }
    );

    console.log("✅ New order placed:", { 
      orderId: order._id, 
      userId: req.user.id, 
      totalAmount,
      itemCount: items.length 
    });

    res.status(201).json({
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ 
      message: "Server error while placing order",
      error: error.message 
    });
  }
});

// 🔹 Get User Orders
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = { userId: req.user.id };
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate("items.foodId", "name category type price image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      message: "Orders retrieved successfully",
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        hasMore: skip + orders.length < total
      }
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ 
      message: "Server error while fetching orders",
      error: error.message 
    });
  }
});

// � Get Order by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.foodId", "name category type price image");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order or is admin
    if (order.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      message: "Order retrieved successfully",
      order
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ 
      message: "Server error while fetching order",
      error: error.message 
    });
  }
});

// 🔹 Update Order Status (Admin Only)
router.put("/:id/status", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Preparing", "Delivered"].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be: Pending, Preparing, or Delivered" 
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("items.foodId", "name category type price image");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("✅ Order status updated:", { 
      orderId: order._id, 
      newStatus: status,
      updatedBy: req.user.id 
    });

    res.json({
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ 
      message: "Server error while updating order status",
      error: error.message 
    });
  }
});

// 🔹 Get All Orders (Admin Only)
router.get("/admin/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, userId } = req.query;
    
    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (userId) {
      filter.userId = userId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate("userId", "name email")
      .populate("items.foodId", "name category type price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      message: "All orders retrieved successfully",
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        hasMore: skip + orders.length < total
      }
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ 
      message: "Server error while fetching all orders",
      error: error.message 
    });
  }
});

module.exports = router;