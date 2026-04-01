# FoodieWeb Backend Setup & Run Instructions

## 🚀 Complete Backend Setup Guide

### 📋 Prerequisites
- Node.js (v14 or higher)
- MongoDB (installed locally)
- MongoDB Compass (for database visualization)
- Code editor (VS Code recommended)

---

## 🛠️ Step-by-Step Setup

### 1. **Install Dependencies**
```bash
cd backend
npm install
```

### 2. **Environment Configuration**
Your `.env` file is already configured:
```env
MONGO_URI=mongodb://localhost:27017/foodieweb
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
```

### 3. **Start MongoDB**
```bash
# For Windows (if using MongoDB as service)
net start MongoDB

# Or start MongoDB manually
mongod
```

### 4. **Seed Sample Data (Optional but Recommended)**
```bash
node seedDatabase.js
```
This will create:
- 3 users (1 admin, 2 regular users)
- 8 food items across all categories
- Sample carts, orders, and complaints

### 5. **Start the Backend Server**
```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

---

## 📊 MongoDB Compass Setup

### Connection Details:
- **Connection String**: `mongodb://localhost:27017/foodieweb`
- **Database Name**: `foodieweb`
- **Collections Created**:
  - `users` - User accounts with roles
  - `foods` - Menu items with categories
  - `carts` - Shopping carts
  - `orders` - Customer orders
  - `complaints` - Customer complaints

### What You'll See in MongoDB Compass:
1. **Users Collection**: Admin and regular user accounts
2. **Foods Collection**: Menu items with nutritional info
3. **Carts Collection**: User shopping carts with items
4. **Orders Collection**: Order history with status tracking
5. **Complaints Collection**: Customer support tickets
6. **Groups Collection**: Group orders with members and shared items

---

## 🔐 Default Login Credentials

### Admin Account:
- **Email**: `admin@foodieweb.com`
- **Password**: `admin123`

### Test User Accounts:
- **Email**: `john@example.com`
- **Password**: `user123`

- **Email**: `jane@example.com`
- **Password**: `user123`

---

## 🌐 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get user profile

### Food Menu (`/api/food`)
- `GET /` - Get all foods (with filtering)
- `GET /:id` - Get specific food
- `POST /add` - Add food (admin only)
- `PUT /:id` - Update food (admin only)
- `DELETE /:id` - Delete food (admin only)

**Filtering Options:**
- `?category=Breakfast` - Filter by category
- `?type=Veg` - Filter by food type
- `?maxCalories=300` - Max calories filter
- `?minProtein=10` - Min protein filter

### Cart (`/api/cart`)
- `GET /` - Get user cart
- `POST /add` - Add item to cart
- `PUT /update` - Update item quantity
- `DELETE /remove/:foodId` - Remove item
- `DELETE /clear` - Clear cart

### Orders (`/api/orders`)
- `POST /place` - Place new order
- `GET /my-orders` - Get user orders
- `GET /:id` - Get specific order
- `PUT /:id/status` - Update order status (admin only)
- `GET /admin/all` - Get all orders (admin only)

### Complaints (`/api/complaints`)
- `POST /submit` - Submit complaint
- `GET /my-complaints` - Get user complaints
- `GET /:id` - Get specific complaint
- `PUT /:id/status` - Update complaint status (admin only)
- `GET /admin/all` - Get all complaints (admin only)

### Group Orders (`/api/groups`)
- `POST /create` - Create new group order
- `POST /join` - Join existing group with code
- `GET /` - Get user's groups
- `GET /:groupCode` - Get group details (members only)
- `POST /:groupCode/items` - Add item to group order
- `DELETE /:groupCode/items/:itemId` - Remove item from group
- `POST /:groupCode/close` - Close group (leader only)
- `POST /:groupCode/leave` - Leave group
- `DELETE /:groupCode` - Delete group (leader only)

**Security:** Only group members can access group data. Non-members receive 403 Forbidden.

---

## 🔧 Testing the Backend

### 1. **Health Check**
```bash
curl http://localhost:5000
```

### 2. **Register Admin**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@foodieweb.com","password":"admin123","role":"admin"}'
```

### 3. **Login & Get Token**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@foodieweb.com","password":"admin123"}'
```

### 4. **Test Protected Route**
```bash
curl -X GET http://localhost:5000/api/protected \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🐛 Common Issues & Solutions

### MongoDB Connection Issues:
1. **MongoDB not running**: Start MongoDB service
2. **Wrong connection string**: Check `.env` file
3. **Port conflicts**: Ensure MongoDB runs on 27017

### JWT Token Issues:
1. **Token expired**: Login again to get new token
2. **Invalid token**: Check token format (Bearer token)

### CORS Issues:
1. **Frontend can't connect**: Check CORS settings in `server.js`
2. **Different ports**: Ensure frontend runs on 3000

---

## 📝 Development Notes

### Database Schema:
- **Users**: name, email, password (hashed), role
- **Foods**: name, category, type, calories, protein, price, image
- **Carts**: userId, items (foodId, quantity), totalAmount
- **Orders**: userId, items, totalAmount, address, status
- **Complaints**: userId, orderId, message, status, adminResponse
- **Groups**: groupCode, leader, members[], restaurantName, items[], status, createdAt

### Security Features:
- Password hashing with bcrypt
- JWT authentication
- Role-based access control
- Input validation
- Error handling

### Performance Features:
- Database indexing
- Pagination support
- Efficient queries
- Proper error responses

---

## 🚀 Production Deployment

### Environment Variables:
```env
NODE_ENV=production
MONGO_URI=mongodb://your-production-db
JWT_SECRET=your-super-secure-secret
PORT=5000
CLIENT_URL=https://your-frontend-domain.com
```

### Security Checklist:
- [ ] Change JWT_SECRET to secure value
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure firewall
- [ ] Set up monitoring
- [ ] Enable database backups

---

## 📞 Support

If you encounter any issues:
1. Check MongoDB is running
2. Verify all dependencies are installed
3. Check environment variables
4. Review console logs for errors
5. Test with sample data using seed script

---

**🎉 Your FoodieWeb backend is now ready!**

The backend will work perfectly with your existing frontend without any modifications needed. All API endpoints match the expected formats and the database structure is optimized for MongoDB Compass visualization.
