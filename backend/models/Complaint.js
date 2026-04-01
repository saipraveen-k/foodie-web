const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"]
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: [true, "Order ID is required"]
  },
  message: {
    type: String,
    required: [true, "Complaint message is required"],
    trim: true,
    minlength: [10, "Message must be at least 10 characters"],
    maxlength: [1000, "Message cannot exceed 1000 characters"]
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved"],
    default: "Open"
  },
  adminResponse: {
    type: String,
    trim: true,
    maxlength: [1000, "Response cannot exceed 1000 characters"]
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better performance
complaintSchema.index({ userId: 1, status: 1 });
complaintSchema.index({ orderId: 1 });
complaintSchema.index({ status: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);
