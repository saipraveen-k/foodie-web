const Group = require("../models/Group");

/**
 * Middleware to verify user has access to a group
 * Must be used after verifyToken middleware
 * Expects groupId or groupCode in req.params or req.body
 */
const verifyGroupAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get group identifier from params, body, or query
    const groupId = req.params.groupId || req.body.groupId || req.query.groupId;
    const groupCode = req.params.groupCode || req.body.groupCode || req.query.groupCode;
    
    if (!groupId && !groupCode) {
      return res.status(400).json({
        message: "Group ID or Group Code is required"
      });
    }
    
    // Find the group
    let group;
    if (groupId) {
      group = await Group.findById(groupId).populate("leader", "name email");
    } else {
      group = await Group.findOne({ groupCode: groupCode.toUpperCase() }).populate("leader", "name email");
    }
    
    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }
    
    // Attach group to request for later use
    req.group = group;
    
    // Check if group is open (unless it's a read operation on closed groups)
    if (group.status !== "open" && req.method !== "GET") {
      return res.status(403).json({
        message: "This group is no longer accepting orders",
        groupStatus: group.status
      });
    }
    
    // Check if user is a member of the group
    if (!group.isMember(userId)) {
      return res.status(403).json({
        message: "Access denied. You are not a member of this group.",
        requiresJoin: true
      });
    }
    
    // Attach membership info to request
    req.isGroupLeader = group.isLeader(userId);
    req.isGroupMember = true;
    
    next();
  } catch (error) {
    console.error("Group access verification error:", error.message);
    
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        message: "Invalid group ID format"
      });
    }
    
    res.status(500).json({
      message: "Error verifying group access"
    });
  }
};

/**
 * Middleware to verify user is the group leader
 * Must be used after verifyGroupAccess
 */
const verifyGroupLeader = (req, res, next) => {
  if (!req.isGroupLeader) {
    return res.status(403).json({
      message: "Access denied. Only the group leader can perform this action."
    });
  }
  next();
};

/**
 * Middleware to check if group code is valid (without requiring membership)
 * Used for join operations
 */
const validateGroupCode = async (req, res, next) => {
  try {
    const groupCode = req.body.groupCode || req.params.groupCode || req.query.groupCode;
    
    if (!groupCode) {
      return res.status(400).json({
        message: "Group code is required"
      });
    }
    
    const group = await Group.findOne({ groupCode: groupCode.toUpperCase() })
      .populate("leader", "name email")
      .populate("members", "name email");
    
    if (!group) {
      return res.status(404).json({
        message: "Invalid group code. No such group exists."
      });
    }
    
    // Attach group to request
    req.group = group;
    
    // Check if group is open
    if (group.status !== "open") {
      return res.status(403).json({
        message: "This group is no longer accepting new members",
        groupStatus: group.status
      });
    }
    
    next();
  } catch (error) {
    console.error("Group code validation error:", error.message);
    
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        message: "Invalid group code format"
      });
    }
    
    res.status(500).json({
      message: "Error validating group code"
    });
  }
};

/**
 * Middleware to prevent duplicate joins
 * Checks if user is already a member
 */
const preventDuplicateJoin = (req, res, next) => {
  const group = req.group;
  const userId = req.user.id;
  
  if (group.isMember(userId)) {
    return res.status(400).json({
      message: "You are already a member of this group",
      alreadyMember: true,
      group: {
        id: group._id,
        code: group.groupCode,
        leader: group.leader,
        memberCount: group.members.length
      }
    });
  }
  
  next();
};

module.exports = {
  verifyGroupAccess,
  verifyGroupLeader,
  validateGroupCode,
  preventDuplicateJoin
};