const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  groupCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [6, "Group code must be at least 6 characters"],
    maxlength: [8, "Group code must be at most 8 characters"]
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  restaurantId: {
    type: String,
    required: true
  },
  restaurantName: {
    type: String,
    required: true
  },
  items: [{
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    addedByName: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    customizations: {
      type: String,
      default: ""
    }
  }],
  status: {
    type: String,
    enum: ["open", "closed", "completed", "cancelled"],
    default: "open"
  },
  closedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Static method to generate unique group code
groupSchema.statics.generateGroupCode = async function() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  let exists = true;
  
  while (exists) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const existing = await this.findOne({ groupCode: code });
    exists = !!existing;
  }
  
  return code;
};

// Check if user is a member of the group
groupSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.toString() === userId.toString()
  );
};

// Check if user is the leader
groupSchema.methods.isLeader = function(userId) {
  return this.leader.toString() === userId.toString();
};

// Add member to group
groupSchema.methods.addMember = function(userId) {
  if (!this.isMember(userId)) {
    this.members.push(userId);
    return true;
  }
  return false;
};

// Remove member from group
groupSchema.methods.removeMember = function(userId) {
  const index = this.members.findIndex(m => m.toString() === userId.toString());
  if (index !== -1) {
    this.members.splice(index, 1);
    return true;
  }
  return false;
};

// Close the group
groupSchema.methods.closeGroup = function() {
  this.status = "closed";
  this.closedAt = new Date();
};

module.exports = mongoose.model("Group", groupSchema);