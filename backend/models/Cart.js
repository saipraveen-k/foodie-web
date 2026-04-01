const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"]
  },
  items: [
    {
      foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: [true, "Food ID is required"]
      },
      quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"],
        default: 1
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
    min: [0, "Total amount cannot be negative"]
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate total amount automatically
cartSchema.pre("save", async function(next) {
  try {
    if (this.isModified("items")) {
      const Food = mongoose.model("Food");
      let total = 0;
      
      for (const item of this.items) {
        const food = await Food.findById(item.foodId);
        if (food) {
          total += food.price * item.quantity;
        }
      }
      
      this.totalAmount = total;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Index for better performance
cartSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema);
