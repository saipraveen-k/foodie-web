import { createContext, useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { api, API_BASE_URL } from "../utils/axiosSetup";
import { useAuth } from "./AuthContext";

export const GroupContext = createContext();

export function GroupProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [group, setGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const socketRef = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem("token");
      if (token) {
        socketRef.current = io(API_BASE_URL.replace("/api", ""), {
          auth: { token },
          transports: ["websocket", "polling"]
        });

        socketRef.current.on("connect", () => {
          console.log("🔌 Socket.io connected");
        });

        socketRef.current.on("disconnect", () => {
          console.log("🔌 Socket.io disconnected");
        });

        // Listen for group updates
        socketRef.current.on("group-updated", (data) => {
          console.log("📢 Group updated:", data);
          if (group && group.code === data.groupCode) {
            getGroupByCode(data.groupCode);
          }
        });

        // Listen for user joined
        socketRef.current.on("user-joined", (data) => {
          console.log("👤 User joined group:", data);
          if (group && group.code === data.groupCode) {
            getGroupByCode(data.groupCode);
          }
        });

        // Listen for item added
        socketRef.current.on("item-added", (data) => {
          console.log("🍔 Item added to group:", data);
          if (group && group.code === data.groupCode) {
            getGroupByCode(data.groupCode);
          }
        });

        // Listen for group closed
        socketRef.current.on("group-closed", (data) => {
          console.log("🔒 Group closed:", data);
          if (group && group.code === data.groupCode) {
            getGroupByCode(data.groupCode);
          }
        });
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  // Fetch user's groups on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserGroups();
    }
  }, [isAuthenticated, user]);

  // Fetch all open groups the user is a member of
  const fetchUserGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get("/groups");
      setGroups(response.data.groups || []);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // Create a new group
  const createGroup = async (restaurantId, restaurantName) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/groups/create", {
        restaurantId,
        restaurantName
      });

      const newGroup = response.data.group;
      setGroup(newGroup);
      setIsLeader(true);

      // Refresh user's groups list
      await fetchUserGroups();

      return { success: true, group: newGroup };
    } catch (err) {
      console.error("Create group error:", err);
      const errorMessage = err.response?.data?.message || "Failed to create group";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Join an existing group
  const joinGroup = async (groupCode) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/groups/join", { groupCode });
      const joinedGroup = response.data.group;

      setGroup(joinedGroup);
      setIsLeader(false);

      // Join Socket.io room
      if (socketRef.current) {
        socketRef.current.emit("join-group", groupCode.toUpperCase());
      }

      // Refresh user's groups list
      await fetchUserGroups();

      return { success: true, group: joinedGroup };
    } catch (err) {
      console.error("Join group error:", err);
      const errorMessage = err.response?.data?.message || "Failed to join group";
      const alreadyMember = err.response?.data?.alreadyMember || false;
      const existingGroup = err.response?.data?.group || null;

      setError(errorMessage);

      if (alreadyMember && existingGroup) {
        return {
          success: false,
          error: errorMessage,
          alreadyMember: true,
          existingGroup
        };
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get group details by code
  const getGroupByCode = useCallback(async (groupCode) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/groups/${groupCode}`);
      const groupData = response.data;

      setGroup(groupData.group);
      setIsLeader(groupData.isLeader || false);

      // Join Socket.io room
      if (socketRef.current) {
        socketRef.current.emit("join-group", groupCode.toUpperCase());
      }

      return { success: true, group: groupData.group, isLeader: groupData.isLeader };
    } catch (err) {
      console.error("Get group error:", err);
      const status = err.response?.status;
      let errorMessage = "Failed to load group";

      if (status === 404) {
        errorMessage = "Group not found";
      } else if (status === 403) {
        errorMessage = "You are not a member of this group";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      setGroup(null);

      return {
        success: false,
        error: errorMessage,
        requiresJoin: err.response?.data?.requiresJoin || false,
        status
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Add item to group
  const addItemToGroup = async (foodId, quantity = 1, customizations = "") => {
    if (!group) {
      return { success: false, error: "No active group" };
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.post(`/groups/${group.code}/items`, {
        foodId,
        quantity,
        customizations
      });

      setGroup(response.data.group);

      return { success: true, group: response.data.group };
    } catch (err) {
      console.error("Add item error:", err);
      const errorMessage = err.response?.data?.message || "Failed to add item";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from group
  const removeItemFromGroup = async (itemId) => {
    if (!group) {
      return { success: false, error: "No active group" };
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.delete(`/groups/${group.code}/items/${itemId}`);

      // Refresh group data
      await getGroupByCode(group.code);

      return { success: true };
    } catch (err) {
      console.error("Remove item error:", err);
      const errorMessage = err.response?.data?.message || "Failed to remove item";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Close the group
  const closeGroup = async () => {
    if (!group) {
      return { success: false, error: "No active group" };
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.post(`/groups/${group.code}/close`);

      setGroup(response.data.group);

      // Refresh user's groups list
      await fetchUserGroups();

      return { success: true, group: response.data.group };
    } catch (err) {
      console.error("Close group error:", err);
      const errorMessage = err.response?.data?.message || "Failed to close group";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Leave the group
  const leaveGroup = async () => {
    if (!group) {
      return { success: false, error: "No active group" };
    }

    try {
      setLoading(true);
      setError(null);

      await api.post(`/groups/${group.code}/leave`);

      setGroup(null);
      setIsLeader(false);

      // Refresh user's groups list
      await fetchUserGroups();

      return { success: true };
    } catch (err) {
      console.error("Leave group error:", err);
      const errorMessage = err.response?.data?.message || "Failed to leave group";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete the group (leader only)
  const deleteGroup = async () => {
    if (!group) {
      return { success: false, error: "No active group" };
    }

    try {
      setLoading(true);
      setError(null);

      await api.delete(`/groups/${group.code}`);

      setGroup(null);
      setIsLeader(false);

      // Refresh user's groups list
      await fetchUserGroups();

      return { success: true };
    } catch (err) {
      console.error("Delete group error:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete group";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Clear current group state (without API call)
  const clearGroup = () => {
    if (group && socketRef.current) {
      socketRef.current.emit("leave-group", group.code);
    }
    setGroup(null);
    setIsLeader(false);
    setError(null);
  };

  // Select a group to view
  const selectGroup = async (groupId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/groups/${groupId}`);
      const groupData = response.data;

      setGroup(groupData.group);
      setIsLeader(groupData.isLeader || false);

      return { success: true };
    } catch (err) {
      console.error("Select group error:", err);
      const errorMessage = err.response?.data?.message || "Failed to load group";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    // State
    group,
    groups,
    loading,
    error,
    isLeader,

    // Actions
    createGroup,
    joinGroup,
    getGroupByCode,
    addItemToGroup,
    removeItemFromGroup,
    closeGroup,
    leaveGroup,
    deleteGroup,
    clearGroup,
    selectGroup,
    fetchUserGroups,
    setError
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}