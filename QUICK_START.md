# 🚀 Quick Start Guide - FoodieWeb Backend

## ⚡ Quick Setup (5 Minutes)

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

## 🔐 Test Login Credentials

### Admin Account:
- **Email**: `admin@foodieweb.com`
- **Password**: `admin123`

### Test Users:
- **Email**: `john@example.com` → **Password**: `user123`
- **Email**: `jane@example.com` → **Password**: `user123`

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
**Fix**: Kill the process or use different port
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
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
| `npm start` | Start production server |
| `npm run dev` | Start development server |
| `node seedDatabase.js` | Reset & seed database |
| `net start MongoDB` | Start MongoDB service |
| `curl http://localhost:5000` | Test server health |

---

## 🎯 Next Steps

1. ✅ Backend is running
2. ✅ Database is populated
3. ✅ MongoDB Compass shows data
4. ✅ Frontend can connect
5. ✅ Test all features

**🚀 Your FoodieWeb backend is ready for production!**

---

## 📚 Full Documentation

For detailed API documentation, see `README.md` in the backend folder.
