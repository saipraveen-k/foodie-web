const express = require("express");
const Complaint = require("../models/Complaint");
const Order = require("../models/Order");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 Submit Complaint
router.post("/submit", verifyToken, async (req, res) => {
  try {
    const { orderId, message } = req.body;

    // Validation
    if (!orderId || !message) {
      return res.status(400).json({ 
        message: "Order ID and message are required" 
      });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({ 
        message: "Message must be at least 10 characters long" 
      });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({ 
        message: "Message cannot exceed 1000 characters" 
      });
    }

    // Check if order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ 
        message: "Access denied. You can only submit complaints for your own orders." 
      });
    }

    // Check if complaint already exists for this order
    const existingComplaint = await Complaint.findOne({ 
      orderId, 
      userId: req.user.id 
    });
    
    if (existingComplaint && existingComplaint.status !== "Resolved") {
      return res.status(400).json({ 
        message: "A complaint is already open for this order" 
      });
    }

    const complaint = new Complaint({
      userId: req.user.id,
      orderId,
      message: message.trim()
    });

    await complaint.save();
    await complaint.populate([
      { path: "userId", select: "name email" },
      { path: "orderId", select: "totalAmount createdAt status" }
    ]);

    console.log("✅ New complaint submitted:", { 
      complaintId: complaint._id, 
      userId: req.user.id, 
      orderId 
    });

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint
    });
  } catch (error) {
    console.error("Submit complaint error:", error);
    res.status(500).json({ 
      message: "Server error while submitting complaint",
      error: error.message 
    });
  }
});

// 🔹 Get User Complaints
router.get("/my-complaints", verifyToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = { userId: req.user.id };
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const complaints = await Complaint.find(filter)
      .populate("orderId", "totalAmount createdAt status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    res.json({
      message: "Complaints retrieved successfully",
      complaints,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalComplaints: total,
        hasMore: skip + complaints.length < total
      }
    });
  } catch (error) {
    console.error("Get complaints error:", error);
    res.status(500).json({ 
      message: "Server error while fetching complaints",
      error: error.message 
    });
  }
});

// 🔹 Get Complaint by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("userId", "name email")
      .populate("orderId", "totalAmount createdAt status");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Check if user owns this complaint or is admin
    if (complaint.userId._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      message: "Complaint retrieved successfully",
      complaint
    });
  } catch (error) {
    console.error("Get complaint error:", error);
    res.status(500).json({ 
      message: "Server error while fetching complaint",
      error: error.message 
    });
  }
});

// 🔹 Update Complaint Status (Admin Only)
router.put("/:id/status", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    if (!["Open", "In Progress", "Resolved"].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be: Open, In Progress, or Resolved" 
      });
    }

    const updateData = { status };
    if (adminResponse && adminResponse.trim().length > 0) {
      if (adminResponse.trim().length > 1000) {
        return res.status(400).json({ 
          message: "Admin response cannot exceed 1000 characters" 
        });
      }
      updateData.adminResponse = adminResponse.trim();
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: "userId", select: "name email" },
      { path: "orderId", select: "totalAmount createdAt status" }
    ]);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    console.log("✅ Complaint status updated:", { 
      complaintId: complaint._id, 
      newStatus: status,
      updatedBy: req.user.id 
    });

    res.json({
      message: "Complaint status updated successfully",
      complaint
    });
  } catch (error) {
    console.error("Update complaint status error:", error);
    res.status(500).json({ 
      message: "Server error while updating complaint status",
      error: error.message 
    });
  }
});

// 🔹 Get All Complaints (Admin Only)
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

    const complaints = await Complaint.find(filter)
      .populate("userId", "name email")
      .populate("orderId", "totalAmount createdAt status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    res.json({
      message: "All complaints retrieved successfully",
      complaints,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalComplaints: total,
        hasMore: skip + complaints.length < total
      }
    });
  } catch (error) {
    console.error("Get all complaints error:", error);
    res.status(500).json({ 
      message: "Server error while fetching all complaints",
      error: error.message 
    });
  }
});

module.exports = router;
