import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { GroupContext } from "../context/GroupContext";
import { useAuth } from "../context/AuthContext";

function GroupOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const {
    group,
    groups,
    loading,
    error,
    isLeader,
    createGroup,
    joinGroup,
    getGroupByCode,
    addItemToGroup,
    removeItemFromGroup,
    closeGroup,
    leaveGroup,
    deleteGroup,
    clearGroup,
    setError
  } = useContext(GroupContext);

  const [codeInput, setCodeInput] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Check for group code in URL or location state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const codeFromUrl = params.get("code");
    const codeFromState = location.state?.groupCode;

    if (codeFromUrl || codeFromState) {
      const code = codeFromUrl || codeFromState;
      handleJoinByCode(code);
    }
  }, [location]);

  // Handle joining a group by code
  const handleJoinByCode = async (code) => {
    if (!code) return;

    // First, try to get group details (this will fail if not a member)
    const result = await getGroupByCode(code);

    if (!result.success) {
      // If it requires join, show join form
      if (result.requiresJoin) {
        setCodeInput(code);
        setShowJoinForm(true);
      } else {
        // Show error
        setError(result.error);
      }
    }
    // If success, group is already loaded in context
  };

  // Handle create group
  const handleCreateGroup = async () => {
    if (!selectedRestaurant) {
      setError("Please select a restaurant");
      return;
    }

    const result = await createGroup(
      selectedRestaurant.id,
      selectedRestaurant.name
    );

    if (result.success) {
      setShowCreateForm(false);
      setSelectedRestaurant(null);
    }
  };

  // Handle join group
  const handleJoinGroup = async () => {
    if (!codeInput.trim()) {
      setError("Please enter a group code");
      return;
    }

    const result = await joinGroup(codeInput.trim().toUpperCase());

    if (result.success) {
      setShowJoinForm(false);
      setCodeInput("");
    } else if (result.alreadyMember) {
      // User is already a member, try to load the group
      const loadResult = await getGroupByCode(result.existingGroup.code);
      if (loadResult.success) {
        setShowJoinForm(false);
        setCodeInput("");
      }
    }
  };

  // Handle leave group
  const handleLeaveGroup = async () => {
    if (isLeader) {
      if (window.confirm("Are you sure you want to close this group? All members will be notified.")) {
        await closeGroup();
      }
    } else {
      if (window.confirm("Are you sure you want to leave this group?")) {
        await leaveGroup();
      }
    }
  };

  // Handle delete group
  const handleDeleteGroup = async () => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      await deleteGroup();
    }
  };

  // Calculate group totals
  const calculateTotals = () => {
    if (!group || !group.items) {
      return { totalItems: 0, totalPrice: 0 };
    }

    const totalItems = group.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return { totalItems, totalPrice };
  };

  const { totalItems, totalPrice } = calculateTotals();

  // Render loading state
  if (loading && !group) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-midnight">Loading group...</p>
        </div>
      </div>
    );
  }

  // Render initial state - no group
  if (!group) {
    return (
      <div className="min-h-screen bg-cream p-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-heading text-midnight mb-6 text-center">
            Group Order
          </h2>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button
                onClick={() => setError(null)}
                className="float-right font-bold"
              >
                ×
              </button>
            </div>
          )}

          {/* User's existing groups */}
          {groups && groups.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-midnight mb-4">
                Your Active Groups
              </h3>
              <div className="space-y-3">
                {groups.map((g) => (
                  <div
                    key={g.id}
                    className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      clearGroup();
                      getGroupByCode(g.code);
                    }}
                  >
                    <div>
                      <p className="font-semibold text-midnight">
                        {g.restaurantName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Code: <span className="font-mono font-bold text-gold">{g.code}</span>
                        {g.isLeader && <span className="ml-2 text-xs bg-gold text-midnight px-2 py-1 rounded">Leader</span>}
                      </p>
                      <p className="text-sm text-gray-500">
                        {g.memberCount} member{g.memberCount !== 1 ? 's' : ''} • {g.item_count} item{g.item_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button className="text-gold hover:text-midnight">
                      →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create or Join options */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            {!showJoinForm && !showCreateForm && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full bg-gold text-midnight py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                >
                  + Create New Group
                </button>

                <div className="text-center text-gray-400">OR</div>

                <button
                  onClick={() => setShowJoinForm(true)}
                  className="w-full bg-midnight text-cream py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Join Existing Group
                </button>
              </div>
            )}

            {/* Create Group Form */}
            {showCreateForm && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-midnight">
                  Create a Group Order
                </h3>
                <p className="text-gray-600 text-sm">
                  Select a restaurant to start a group order. Others can join using a unique code.
                </p>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Restaurant Name"
                    className="w-full p-3 border rounded-lg"
                    value={selectedRestaurant?.name || ""}
                    onChange={(e) => setSelectedRestaurant({
                      id: e.target.value,
                      name: e.target.value
                    })}
                  />
                  <p className="text-xs text-gray-500">
                    Enter the restaurant name or ID to create a group
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCreateGroup}
                    className="flex-1 bg-gold text-midnight py-2 rounded-lg font-semibold"
                  >
                    Create Group
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setSelectedRestaurant(null);
                    }}
                    className="px-4 py-2 border rounded-lg text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Join Group Form */}
            {showJoinForm && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-midnight">
                  Join a Group
                </h3>
                <p className="text-gray-600 text-sm">
                  Enter the 6-character group code to join an existing group order.
                </p>

                <input
                  type="text"
                  placeholder="Enter Group Code (e.g., ABC123)"
                  className="w-full p-3 border rounded-lg uppercase tracking-wider font-mono"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  maxLength={8}
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleJoinGroup}
                    className="flex-1 bg-midnight text-cream py-2 rounded-lg font-semibold"
                  >
                    Join Group
                  </button>
                  <button
                    onClick={() => {
                      setShowJoinForm(false);
                      setCodeInput("");
                      setError(null);
                    }}
                    className="px-4 py-2 border rounded-lg text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render group detail view
  return (
    <div className="min-h-screen bg-cream p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-heading text-midnight">
                {group.restaurantName}
              </h2>
              <p className="text-gray-600 mt-1">
                Group Code:{" "}
                <span className="font-mono font-bold text-gold text-lg">
                  {group.code}
                </span>
              </p>
              {group.status === "closed" && (
                <span className="inline-block mt-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                  Closed
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {group.members?.length || 1} member{group.members?.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-500">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Members Section */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-midnight mb-4">
              Members
            </h3>
            <div className="space-y-2">
              {group.leader && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-midnight">
                    {group.leader.name || "Leader"}
                  </span>
                  <span className="text-xs bg-gold text-midnight px-2 py-1 rounded">
                    Leader
                  </span>
                </div>
              )}
              {group.members && group.members
                .filter(m => m._id !== group.leader?._id)
                .map((member) => (
                  <div key={member._id} className="p-2 bg-gray-50 rounded">
                    {member.name || "Member"}
                  </div>
                ))}
              {(!group.members || group.members.length === 0) && !group.leader && (
                <p className="text-gray-500 text-sm">No members yet</p>
              )}
            </div>
          </div>

          {/* Group Status Section */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-midnight mb-4">
              Group Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${group.status === 'open' ? 'text-green-600' : 'text-red-600'}`}>
                  {group.status === 'open' ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-semibold text-midnight">{totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Price:</span>
                <span className="font-semibold text-gold">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2">
              {isLeader && group.status === 'open' && (
                <>
                  <button
                    onClick={handleLeaveGroup}
                    className="w-full bg-red-500 text-white py-2 rounded-lg"
                  >
                    Close Group
                  </button>
                  <button
                    onClick={handleDeleteGroup}
                    className="w-full border border-red-500 text-red-500 py-2 rounded-lg"
                  >
                    Delete Group
                  </button>
                </>
              )}
              {!isLeader && group.status === 'open' && (
                <button
                  onClick={handleLeaveGroup}
                  className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg"
                >
                  Leave Group
                </button>
              )}
              <button
                onClick={() => {
                  clearGroup();
                  navigate("/menu");
                }}
                className="w-full bg-midnight text-cream py-2 rounded-lg"
              >
                Browse Menu
              </button>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-white p-6 rounded-xl shadow-md mt-6">
          <h3 className="text-lg font-semibold text-midnight mb-4">
            Group Orders
          </h3>

          {group.items && group.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600">Item</th>
                    <th className="text-left py-3 px-4 text-gray-600">Added By</th>
                    <th className="text-center py-3 px-4 text-gray-600">Qty</th>
                    <th className="text-right py-3 px-4 text-gray-600">Price</th>
                    <th className="text-right py-3 px-4 text-gray-600">Subtotal</th>
                    {group.status === 'open' && <th className="text-right py-3 px-4 text-gray-600">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((item) => (
                    <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-midnight">{item.name}</td>
                      <td className="py-3 px-4 text-gray-600">{item.addedByName}</td>
                      <td className="py-3 px-4 text-center">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-gray-600">${item.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-midnight">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                      {group.status === 'open' && (
                        <td className="py-3 px-4 text-right">
                          {(isLeader || item.addedBy === user?._id) && (
                            <button
                              onClick={() => removeItemFromGroup(item._id)}
                              className="text-red-500 hover:text-red-700"
                              title="Remove item"
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No items added yet.</p>
              <p className="text-sm mt-2">
                {isLeader
                  ? "Start by adding items from the menu."
                  : "Wait for the group leader to add items, or browse the menu to add your own."
                }
              </p>
            </div>
          )}
        </div>

        {/* Share code section */}
        {group.status === 'open' && (
          <div className="bg-gold bg-opacity-20 p-6 rounded-xl mt-6">
            <h3 className="text-lg font-semibold text-midnight mb-2">
              Share with friends!
            </h3>
            <p className="text-gray-700 mb-3">
              Share this code with friends so they can join your group order:
            </p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold text-midnight bg-white px-4 py-2 rounded-lg border-2 border-gold">
                {group.code}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(group.code)}
                className="px-4 py-2 bg-midnight text-cream rounded-lg text-sm"
              >
                Copy Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupOrder;