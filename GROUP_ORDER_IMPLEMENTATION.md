# Group Order Feature - Implementation Guide

## 🐛 Bug Analysis & Fix

### The Original Bug

The original implementation had a critical security flaw where **any user could access the group order page** even without joining a group. This was because:

1. **localStorage-based state management**: The `GroupContext` stored group data in `localStorage`, which could be easily manipulated or accessed by anyone.

2. **No backend validation**: There was no backend API to validate group membership. The frontend simply checked if a group code existed in localStorage.

3. **No authentication checks**: The group order page was accessible to any authenticated user without verifying they were part of a specific group.

### The Fix

The fix implements a **secure, server-side validated group order system**:

1. **Backend validation**: Every group operation validates that the user is a member of the group via `verifyGroupAccess` middleware.

2. **Database persistence**: Groups are stored in MongoDB with proper membership tracking.

3. **403 Access Denied**: Unauthorized users receive a 403 Forbidden response when trying to access a group they're not part of.

4. **Real-time updates**: Socket.io ensures all group members see updates in real-time.

---

## 📁 Project Structure

```
foodie-web/
├── backend/
│   ├── models/
│   │   └── Group.js          # MongoDB Group schema
│   ├── middleware/
│   │   ├── authMiddleware.js # JWT authentication
│   │   └── groupMiddleware.js # Group access control
│   ├── routes/
│   │   └── groupRoutes.js    # Group API endpoints
│   └── server.js             # Express + Socket.io setup
│
└── client/
    └── src/
        ├── context/
        │   ├── AuthContext.jsx    # Authentication state
        │   └── GroupContext.jsx   # Group state + Socket.io
        ├── pages/
        │   └── GroupOrder.jsx     # Group order UI
        └── components/
            └── ProtectedRoute.jsx # Route protection
```

---

## 🔧 Backend Implementation

### 1. Group Model (`backend/models/Group.js`)

```javascript
const groupSchema = new mongoose.Schema({
  groupCode: { type: String, required: true, unique: true },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  restaurantId: { type: String, required: true },
  restaurantName: { type: String, required: true },
  items: [{
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
    name: String,
    price: Number,
    quantity: Number,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    addedByName: String
  }],
  status: { type: String, enum: ["open", "closed", "completed", "cancelled"], default: "open" }
});
```

### 2. Group Middleware (`backend/middleware/groupMiddleware.js`)

Key middleware functions:

- **`verifyGroupAccess`**: Validates user is a member of the group
- **`verifyGroupLeader`**: Validates user is the group leader
- **`validateGroupCode`**: Validates group code exists (for join)
- **`preventDuplicateJoin`**: Prevents users from joining twice

### 3. Group Routes (`backend/routes/groupRoutes.js`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/groups/create` | Create new group | Authenticated |
| POST | `/api/groups/join` | Join existing group | Authenticated |
| GET | `/api/groups/:groupCode` | Get group details | Group members only |
| POST | `/api/groups/:groupCode/items` | Add item to group | Group members only |
| DELETE | `/api/groups/:groupCode/items/:itemId` | Remove item | Item owner or leader |
| POST | `/api/groups/:groupCode/close` | Close group | Leader only |
| POST | `/api/groups/:groupCode/leave` | Leave group | Members only |
| GET | `/api/groups/` | Get user's groups | Authenticated |
| DELETE | `/api/groups/:groupCode` | Delete group | Leader only |

### 4. Socket.io Integration (`backend/server.js`)

```javascript
io.use((socket, next) => {
  // JWT authentication for Socket.io
  const token = socket.handshake.auth.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  socket.user = decoded;
  next();
});

io.on("connection", (socket) => {
  socket.on("join-group", (groupCode) => {
    socket.join(`group:${groupCode}`);
  });
  
  socket.on("leave-group", (groupCode) => {
    socket.leave(`group:${groupCode}`);
  });
});
```

---

## 🎨 Frontend Implementation

### 1. GroupContext (`client/src/context/GroupContext.jsx`)

Provides:
- Group state management
- Socket.io real-time updates
- API integration for all group operations

```javascript
const {
  group,           // Current group
  groups,          // User's groups
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
  clearGroup
} = useContext(GroupContext);
```

### 2. GroupOrder Page (`client/src/pages/GroupOrder.jsx`)

Features:
- Create/join group forms
- Group member list
- Group items table
- Real-time updates display
- Leader/member actions

---

## 🔒 Security Features

### 1. Authentication Required
All group endpoints require a valid JWT token.

### 2. Membership Validation
```javascript
// In verifyGroupAccess middleware
if (!group.isMember(userId)) {
  return res.status(403).json({
    message: "Access denied. You are not a member of this group."
  });
}
```

### 3. Leader-Only Actions
```javascript
// In verifyGroupLeader middleware
if (!req.isGroupLeader) {
  return res.status(403).json({
    message: "Access denied. Only the group leader can perform this action."
  });
}
```

### 4. Group Status Checks
Closed groups cannot accept new items or members.

### 5. Item Ownership
Users can only delete their own items (unless they're the leader).

---

## 🚀 Usage Flow

### Creating a Group

1. User clicks "Create New Group"
2. Enters restaurant name
3. Backend generates unique 6-character code (e.g., "ABC123")
4. User becomes the leader and is automatically added as first member

### Joining a Group

1. User enters group code
2. Backend validates code exists and group is open
3. Backend checks user isn't already a member
4. User is added to members array
5. All group members receive real-time notification

### Adding Items

1. Group member selects food item
2. Backend validates:
   - User is group member
   - Group is open
   - Food item exists
3. Item is added to group's items array
4. All members receive real-time update

### Closing a Group

1. Leader clicks "Close Group"
2. Backend validates user is leader
3. Group status changes to "closed"
4. No more items can be added
5. All members receive notification

---

## 📡 Real-Time Events (Socket.io)

| Event | Triggered When | Data |
|-------|----------------|------|
| `user-joined` | User joins group | userId, userName, memberCount |
| `user-left` | User leaves group | userId, userName, memberCount |
| `item-added` | Item added to group | item details, totals |
| `item-removed` | Item removed | itemId, totals |
| `group-closed` | Leader closes group | closedAt, totals |
| `group-deleted` | Leader deletes group | timestamp |

---

## 🧪 Testing the Implementation

### Test 1: Unauthorized Access (The Bug Fix)

```bash
# Try to access a group without being a member
curl -X GET http://localhost:5000/api/groups/ABC123 \
  -H "Authorization: Bearer <other_user_token>"

# Expected: 403 Forbidden
# {
#   "message": "Access denied. You are not a member of this group."
# }
```

### Test 2: Create Group

```bash
curl -X POST http://localhost:5000/api/groups/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"restaurantId": "rest123", "restaurantName": "Pizza Palace"}'

# Expected: 201 Created with group details
```

### Test 3: Join Group

```bash
curl -X POST http://localhost:5000/api/groups/join \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"groupCode": "ABC123"}'

# Expected: 200 OK with updated group details
```

### Test 4: Duplicate Join Prevention

```bash
# Same user tries to join again
curl -X POST http://localhost:5000/api/groups/join \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"groupCode": "ABC123"}'

# Expected: 400 Bad Request
# {
#   "message": "You are already a member of this group",
#   "alreadyMember": true
# }
```

---

## ✅ Checklist: Bug Fix Verification

- [x] **Backend validation**: All group endpoints validate membership
- [x] **403 for unauthorized**: Non-members receive 403 Forbidden
- [x] **No localStorage dependency**: Group data comes from backend API
- [x] **JWT authentication**: All endpoints require valid token
- [x] **Leader validation**: Leader-only actions are protected
- [x] **Duplicate join prevention**: Users can't join twice
- [x] **Invalid code handling**: Invalid codes return 404
- [x] **Closed group handling**: Closed groups reject modifications
- [x] **Real-time updates**: Socket.io broadcasts changes
- [x] **Clean error messages**: Helpful error messages for all cases

---

## 🎯 Key Takeaways

1. **Never trust the client**: Always validate on the server
2. **Use database for state**: Don't rely on localStorage for security-critical data
3. **Implement proper middleware**: Reusable validation logic
4. **Real-time updates**: Socket.io enhances user experience
5. **Clear error messages**: Help users understand what went wrong