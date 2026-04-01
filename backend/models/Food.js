const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  veg: {
    type: Boolean,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  image: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Food", foodSchema);