const mongoose = require("mongoose");
require("dotenv").config();

// Sample data for testing MongoDB Compass
const sampleData = {
  users: [
    {
      name: "Admin User",
      email: "admin@foodieweb.com",
      password: "admin123",
      role: "admin"
    },
    {
      name: "John Doe",
      email: "john@example.com",
      password: "user123",
      role: "user"
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      password: "user123",
      role: "user"
    }
  ],
  
  foods: [
    {
      name: "Pancakes",
      category: "Breakfast",
      type: "Veg",
      calories: 220,
      protein: 6,
      price: 8.99,
      image: "https://example.com/pancakes.jpg"
    },
    {
      name: "French Toast",
      category: "Breakfast",
      type: "Veg",
      calories: 280,
      protein: 8,
      price: 7.99,
      image: "https://example.com/french-toast.jpg"
    },
    {
      name: "Chicken Sandwich",
      category: "Lunch",
      type: "Non-Veg",
      calories: 350,
      protein: 25,
      price: 12.99,
      image: "https://example.com/chicken-sandwich.jpg"
    },
    {
      name: "Caesar Salad",
      category: "Lunch",
      type: "Veg",
      calories: 180,
      protein: 4,
      price: 9.99,
      image: "https://example.com/caesar-salad.jpg"
    },
    {
      name: "Grilled Salmon",
      category: "Dinner",
      type: "Non-Veg",
      calories: 420,
      protein: 35,
      price: 24.99,
      image: "https://example.com/grilled-salmon.jpg"
    },
    {
      name: "Pasta Carbonara",
      category: "Dinner",
      type: "Non-Veg",
      calories: 380,
      protein: 18,
      price: 16.99,
      image: "https://example.com/pasta-carbonara.jpg"
    },
    {
      name: "French Fries",
      category: "Snacks",
      type: "Veg",
      calories: 320,
      protein: 3,
      price: 4.99,
      image: "https://example.com/french-fries.jpg"
    },
    {
      name: "Chicken Wings",
      category: "Snacks",
      type: "Non-Veg",
      calories: 290,
      protein: 20,
      price: 8.99,
      image: "https://example.com/chicken-wings.jpg"
    }
  ]
};

async function seedDatabase() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing collections...");
    await mongoose.connection.db.dropCollection('users').catch(() => {});
    await mongoose.connection.db.dropCollection('foods').catch(() => {});
    await mongoose.connection.db.dropCollection('carts').catch(() => {});
    await mongoose.connection.db.dropCollection('orders').catch(() => {});
    await mongoose.connection.db.dropCollection('complaints').catch(() => {});

    // Import models
    const User = require("./models/User");
    const Food = require("./models/Food");
    const Cart = require("./models/Cart");
    const Order = require("./models/Order");
    const Complaint = require("./models/Complaint");

    // Insert sample users - Using create() instead of insertMany() to trigger pre-save middleware for password hashing
    console.log("👥 Creating sample users...");
    const createdUsers = await User.create(sampleData.users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Insert sample foods
    console.log("🍔 Creating sample foods...");
    const createdFoods = await Food.insertMany(sampleData.foods);
    console.log(`✅ Created ${createdFoods.length} foods`);

    // Create sample carts for users
    console.log("🛒 Creating sample carts...");
    for (const user of createdUsers) {
      if (user.role === 'user') {
        const cart = new Cart({
          userId: user._id,
          items: [
            { foodId: createdFoods[0]._id, quantity: 2 },
            { foodId: createdFoods[3]._id, quantity: 1 }
          ]
        });
        await cart.save();
      }
    }
    console.log("✅ Created sample carts");

    // Create sample orders
    console.log("📦 Creating sample orders...");
    const regularUsers = createdUsers.filter(u => u.role === 'user');
    for (let i = 0; i < regularUsers.length; i++) {
      const order = new Order({
        userId: regularUsers[i]._id,
        items: [
          { foodId: createdFoods[1]._id, quantity: 1, price: createdFoods[1].price },
          { foodId: createdFoods[4]._id, quantity: 2, price: createdFoods[4].price }
        ],
        totalAmount: createdFoods[1].price + (createdFoods[4].price * 2),
        address: `123 Sample Street, City ${i + 1}, State 12345`,
        status: ["Pending", "Preparing", "Delivered"][i % 3]
      });
      await order.save();
    }
    console.log("✅ Created sample orders");

    // Create sample complaints
    console.log("📝 Creating sample complaints...");
    const orders = await Order.find().populate('userId');
    for (let i = 0; i < Math.min(2, orders.length); i++) {
      const complaint = new Complaint({
        userId: orders[i].userId,
        orderId: orders[i]._id,
        message: `Sample complaint ${i + 1}: The food was not as expected. Please look into this matter.`,
        status: ["Open", "In Progress", "Resolved"][i % 3],
        adminResponse: i === 2 ? "We apologize for the inconvenience. We'll improve our service." : ""
      });
      await complaint.save();
    }
    console.log("✅ Created sample complaints");

    // Display collection statistics
    console.log("\n📊 Database Statistics:");
    const collections = ['users', 'foods', 'carts', 'orders', 'complaints'];
    for (const collectionName of collections) {
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      console.log(`   ${collectionName}: ${count} documents`);
    }

    console.log("\n🎉 Sample data seeded successfully!");
    console.log("🔍 You can now open MongoDB Compass to see the collections.");
    console.log("📍 Connection string: mongodb://localhost:27017/foodieweb");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔄 Disconnected from MongoDB");
  }
}

// Run the seed function
seedDatabase();
