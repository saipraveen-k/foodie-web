const express = require("express");
const router = express.Router();

// Import models
const Group = require("../models/Group");
const Food = require("../models/Food");

// Import middleware
const { verifyToken } = require("../middleware/authMiddleware");
const {
  verifyGroupAccess,
  verifyGroupLeader,
  validateGroupCode,
  preventDuplicateJoin
} = require("../middleware/groupMiddleware");

// Helper function to emit Socket.io events
const emitToGroup = (req, event, data) => {
  const io = req.app.get("io");
  if (io) {
    io.to(`group:${data.groupCode}`).emit(event, data);
  }
};

/**
 * @route   POST /api/groups/create
 * @desc    Create a new group order
 * @access  Private (Authenticated users only)
 * @body    { restaurantId, restaurantName }
 */
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { restaurantId, restaurantName } = req.body;
    const userId = req.user.id;

    // Validation
    if (!restaurantId || !restaurantName) {
      return res.status(400).json({
        message: "Restaurant ID and name are required"
      });
    }

    // Check if user already has an open group as leader
    const existingOpenGroup = await Group.findOne({
      leader: userId,
      status: "open"
    });

    if (existingOpenGroup) {
      return res.status(400).json({
        message: "You already have an open group. Close it before creating a new one.",
        existingGroup: {
          id: existingOpenGroup._id,
          code: existingOpenGroup.groupCode
        }
      });
    }

    // Generate unique group code
    const groupCode = await Group.generateGroupCode();

    // Create the group with the leader as the first member
    const group = new Group({
      groupCode,
      leader: userId,
      members: [userId],
      restaurantId,
      restaurantName
    });

    await group.save();

    // Populate leader info
    await group.populate("leader", "name email");

    res.status(201).json({
      message: "Group created successfully",
      group: {
        id: group._id,
        code: group.groupCode,
        leader: group.leader,
        members: group.members,
        restaurantId: group.restaurantId,
        restaurantName: group.restaurantName,
        status: group.status,
        items: group.items,
        createdAt: group.createdAt
      }
    });

  } catch (error) {
    console.error("Create group error:", error.message);
    res.status(500).json({
      message: "Error creating group"
    });
  }
});

/**
 * @route   POST /api/groups/join
 * @desc    Join an existing group using group code
 * @access  Private (Authenticated users only)
 * @body    { groupCode }
 */
router.post("/join", verifyToken, validateGroupCode, preventDuplicateJoin, async (req, res) => {
  try {
    const group = req.group;
    const userId = req.user.id;
    const groupCode = group.groupCode;

    // Add user to group members
    group.addMember(userId);
    await group.save();

    // Populate updated data
    await group.populate("members", "name email");

    res.status(200).json({
      message: "Successfully joined the group",
      group: {
        id: group._id,
        code: group.groupCode,
        leader: group.leader,
        members: group.members,
        restaurantId: group.restaurantId,
        restaurantName: group.restaurantName,
        status: group.status,
        items: group.items,
        joinedAt: new Date()
      }
    });

    // Emit Socket.io event to group members
    emitToGroup(req, "user-joined", {
      groupCode,
      userId,
      userName: req.user.name,
      memberCount: group.members.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Join group error:", error.message);
    res.status(500).json({
      message: "Error joining group"
    });
  }
});

/**
 * @route   GET /api/groups/:groupCode
 * @desc    Get group details (requires membership)
 * @access  Private (Group members only)
 */
router.get("/:groupCode", verifyToken, verifyGroupAccess, async (req, res) => {
  try {
    const group = req.group;

    // Populate members and items details
    await group
      .populate("leader", "name email")
      .populate("members", "name email")
      .populate("items.foodId", "name price image category");

    res.status(200).json({
      message: "Group details retrieved successfully",
      group: {
        id: group._id,
        code: group.groupCode,
        leader: group.leader,
        members: group.members,
        restaurantId: group.restaurantId,
        restaurantName: group.restaurantName,
        status: group.status,
        items: group.items,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        closedAt: group.closedAt
      },
      isLeader: req.isGroupLeader
    });

  } catch (error) {
    console.error("Get group error:", error.message);
    res.status(500).json({
      message: "Error retrieving group details"
    });
  }
});

/**
 * @route   POST /api/groups/:groupCode/items
 * @desc    Add an item to the group order
 * @access  Private (Group members only)
 * @body    { foodId, quantity, customizations }
 */
router.post("/:groupCode/items", verifyToken, verifyGroupAccess, async (req, res) => {
  try {
    const group = req.group;
    const userId = req.user.id;
    const groupCode = group.groupCode;
    const { foodId, quantity = 1, customizations = "" } = req.body;

    // Check if group is open
    if (group.status !== "open") {
      return res.status(403).json({
        message: "Cannot add items to a closed group"
      });
    }

    // Validate food item exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({
        message: "Food item not found"
      });
    }

    // Check if this food item already exists in the group
    const existingItem = group.items.find(
      item => item.foodId.toString() === foodId.toString()
    );

    if (existingItem) {
      // Update quantity if same item added by same user
      if (existingItem.addedBy.toString() === userId.toString()) {
        existingItem.quantity += quantity;
      } else {
        // Different user adding same item - create new entry
        group.items.push({
          foodId,
          name: food.name,
          price: food.price,
          quantity,
          addedBy: userId,
          addedByName: req.user.name || "Anonymous",
          customizations
        });
      }
    } else {
      // Add new item
      group.items.push({
        foodId,
        name: food.name,
        price: food.price,
        quantity,
        addedBy: userId,
        addedByName: req.user.name || "Anonymous",
        customizations
      });
    }

    await group.save();
    await group.populate("items.foodId", "name price image category");
    await group.populate("members", "name email");

    res.status(200).json({
      message: "Item added to group order",
      group: {
        id: group._id,
        code: group.groupCode,
        items: group.items,
        members: group.members,
        totalItems: group.items.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    });

    // Emit Socket.io event to group members
    emitToGroup(req, "item-added", {
      groupCode,
      userId,
      userName: req.user.name,
      item: {
        foodId,
        name: food.name,
        price: food.price,
        quantity,
        addedByName: req.user.name || "Anonymous"
      },
      totalItems: group.items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Add item error:", error.message);
    res.status(500).json({
      message: "Error adding item to group order"
    });
  }
});

/**
 * @route   DELETE /api/groups/:groupCode/items/:itemId
 * @desc    Remove an item from the group order
 * @access  Private (Group members only, item owner or leader)
 */
router.delete("/:groupCode/items/:itemId", verifyToken, verifyGroupAccess, async (req, res) => {
  try {
    const group = req.group;
    const userId = req.user.id;
    const groupCode = group.groupCode;
    const { itemId } = req.params;

    // Find the item
    const itemIndex = group.items.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    const item = group.items[itemIndex];

    // Check if user can delete this item (owner or leader)
    if (!req.isGroupLeader && item.addedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You can only delete your own items"
      });
    }

    // Remove the item
    group.items.splice(itemIndex, 1);
    await group.save();

    res.status(200).json({
      message: "Item removed from group order"
    });

    // Emit Socket.io event to group members
    emitToGroup(req, "item-removed", {
      groupCode,
      itemId,
      userId,
      totalItems: group.items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Delete item error:", error.message);
    res.status(500).json({
      message: "Error removing item from group order"
    });
  }
});

/**
 * @route   POST /api/groups/:groupCode/close
 * @desc    Close the group order (leader only)
 * @access  Private (Group leader only)
 */
router.post("/:groupCode/close", verifyToken, verifyGroupAccess, verifyGroupLeader, async (req, res) => {
  try {
    const group = req.group;
    const groupCode = group.groupCode;

    if (group.status !== "open") {
      return res.status(400).json({
        message: "Group is already closed"
      });
    }

    group.closeGroup();
    await group.save();

    await group.populate("members", "name email");
    await group.populate("items.foodId", "name price");

    res.status(200).json({
      message: "Group order closed successfully",
      group: {
        id: group._id,
        code: group.groupCode,
        status: group.status,
        closedAt: group.closedAt,
        items: group.items,
        members: group.members,
        totalItems: group.items.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    });

    // Emit Socket.io event to group members
    emitToGroup(req, "group-closed", {
      groupCode,
      closedAt: group.closedAt,
      totalItems: group.items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Close group error:", error.message);
    res.status(500).json({
      message: "Error closing group order"
    });
  }
});

/**
 * @route   POST /api/groups/:groupCode/leave
 * @desc    Leave a group
 * @access  Private (Group members only)
 */
router.post("/:groupCode/leave", verifyToken, verifyGroupAccess, async (req, res) => {
  try {
    const group = req.group;
    const userId = req.user.id;
    const groupCode = group.groupCode;

    // Leader cannot leave without transferring leadership or closing
    if (req.isGroupLeader) {
      return res.status(400).json({
        message: "As the leader, you must close the group instead of leaving"
      });
    }

    // Remove user from members
    group.removeMember(userId);
    await group.save();

    res.status(200).json({
      message: "Successfully left the group"
    });

    // Emit Socket.io event to group members
    emitToGroup(req, "user-left", {
      groupCode,
      userId,
      userName: req.user.name,
      memberCount: group.members.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Leave group error:", error.message);
    res.status(500).json({
      message: "Error leaving group"
    });
  }
});

/**
 * @route   GET /api/groups/my-groups
 * @desc    Get all groups the user is a member of
 * @access  Private (Authenticated users only)
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await Group.find({
      members: userId,
      status: "open"
    })
      .populate("leader", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Groups retrieved successfully",
      groups: groups.map(group => ({
        id: group._id,
        code: group.groupCode,
        leader: group.leader,
        memberCount: group.members.length,
        restaurantName: group.restaurantName,
        item_count: group.items.length,
        isLeader: group.isLeader(userId),
        createdAt: group.createdAt
      }))
    });

  } catch (error) {
    console.error("Get user groups error:", error.message);
    res.status(500).json({
      message: "Error retrieving groups"
    });
  }
});

/**
 * @route   DELETE /api/groups/:groupCode
 * @desc    Delete a group (leader only, closes and removes the group)
 * @access  Private (Group leader only)
 */
router.delete("/:groupCode", verifyToken, verifyGroupAccess, verifyGroupLeader, async (req, res) => {
  try {
    const group = req.group;
    const groupCode = group.groupCode;

    // Update status before deletion
    group.status = "cancelled";
    await group.save();

    // Delete the group
    await Group.findByIdAndDelete(group._id);

    res.status(200).json({
      message: "Group deleted successfully"
    });

    // Emit Socket.io event to group members (before deletion)
    const io = req.app.get("io");
    if (io) {
      io.to(`group:${groupCode}`).emit("group-deleted", {
        groupCode,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Delete group error:", error.message);
    res.status(500).json({
      message: "Error deleting group"
    });
  }
});

module.exports = router;