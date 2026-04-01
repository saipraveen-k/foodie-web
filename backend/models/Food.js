const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Food name is required"],
    trim: true,
    minlength: [2, "Food name must be at least 2 characters"]
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: ["Breakfast", "Lunch", "Dinner", "Snacks"],
    trim: true
  },
  type: {
    type: String,
    required: [true, "Type is required"],
    enum: ["Veg", "Non-Veg"],
    trim: true
  },
  calories: {
    type: Number,
    required: [true, "Calories are required"],
    min: [0, "Calories cannot be negative"]
  },
  protein: {
    type: Number,
    required: [true, "Protein is required"],
    min: [0, "Protein cannot be negative"]
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  image: {
    type: String,
    default: "",
    trim: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better search performance
foodSchema.index({ name: 1, category: 1, type: 1 });

module.exports = mongoose.model("Food", foodSchema);