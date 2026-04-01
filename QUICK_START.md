# 🚀 Quick Start Guide - FoodieWeb Full Stack

## 🌐 Frontend Setup

### 1. **Navigate to Client Directory**
```bash
cd client
```

### 2. **Install Frontend Dependencies**
```bash
npm install
```

### 3. **Start Frontend Development Server**
```bash
npm run dev
```

**🎉 Frontend is now running on `http://localhost:5173`**

---

## ⚡ Backend Setup (5 Minutes)

### 1. **Open Terminal & Navigate**
```bash
cd backend
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Start MongoDB**
```bash
# Windows
net start MongoDB

# Or if MongoDB is not a service
mongod
```

### 4. **Seed Database (One Time)**
```bash
node seedDatabase.js
```

### 5. **Start Backend Server**
```bash
npm start
```

**🎉 Backend is now running on `http://localhost:5000`**

---

## ✅ **Current Status - Full Stack Running!**

### 🌐 **Frontend**: `http://localhost:5173` ✅
- React app running and ready
- Connected to backend API

### 🖥 **Backend Server**: `http://localhost:5000` ✅
- MongoDB Connected: `foodieweb` database
- All collections created and populated
- API endpoints ready

### 🗄️ **MongoDB Compass**: `mongodb://localhost:27017/foodieweb` ✅
- Database populated with sample data
- All collections visible

---

## �� Test Login Credentials

### Admin Account:
- **Email**: `admin@foodieweb.com`
- **Password**: `admin123`

### Test Users:
- **Email**: `john@example.com` → **Password**: `user123`
- **Email**: `jane@example.com` → **Password**: `user123`

**✅ All passwords properly hashed and working!**

---

## 📱 Test API Endpoints

### Health Check:
```bash
curl http://localhost:5000
```

### Login (Get Token):
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@foodieweb.com","password":"admin123"}'
```

### Get Foods (No Auth Required):
```bash
curl http://localhost:5000/api/food
```

### Get Protected Data (Requires Token):
```bash
# Replace YOUR_TOKEN with actual JWT from login
curl -X GET http://localhost:5000/api/protected \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔍 MongoDB Compass Setup

### Connection Details:
- **Connection String**: `mongodb://localhost:27017/foodieweb`
- **Database**: `foodieweb`
- **Collections**: users, foods, carts, orders, complaints

### What You'll See:
- **Users**: 3 accounts (1 admin, 2 users)
- **Foods**: 8 menu items
- **Carts**: 2 shopping carts
- **Orders**: 2 sample orders
- **Complaints**: 2 sample complaints

---

## 🛠️ Development Mode

For auto-restart on code changes:
```bash
npm run dev
```

---

## 🐛 Common Issues & Quick Fixes

### ❌ "MongoDB Connection Failed"
**Fix**: Make sure MongoDB is running
```bash
# Check if MongoDB is running
net start MongoDB

# If not running, start it
mongod
```

### ❌ "Port 5000 already in use"
**Fix**: Kill process or use different port
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm start
```

### ❌ "Module not found"
**Fix**: Install dependencies
```bash
npm install
```

### ❌ "Invalid token"
**Fix**: Login again to get fresh token

---

## 📱 Frontend Integration

Your existing frontend will work perfectly! Just ensure:

1. **Backend URL**: `http://localhost:5000`
2. **API Endpoints**: All match expected formats
3. **Authentication**: Use JWT tokens from `/api/auth/login`

---

## 🔄 Reset Database

If you want to start fresh:
```bash
node seedDatabase.js
```

This will clear all data and re-populate with sample data.

---

## 📞 Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `cd client && npm run dev` | Start frontend development server |
| `cd backend && npm start` | Start backend production server |
| `cd backend && npm run dev` | Start backend development server |
| `cd backend && node seedDatabase.js` | Reset & seed database |
| `net start MongoDB` | Start MongoDB service |
| `curl http://localhost:5000` | Test backend health |
| `curl http://localhost:5173` | Test frontend health |

---

## 🎯 Next Steps

1. ✅ Frontend is running on port 5173
2. ✅ Backend is running on port 5000
3. ✅ Database is populated and connected
4. ✅ MongoDB Compass shows all collections
5. ✅ Login credentials working
6. ✅ Full stack communication established
7. ✅ Test all features

**🚀 Your FoodieWeb full stack is fully operational!**

---

## 📚 Full Documentation

For detailed API documentation, see `README.md` in backend folder.
