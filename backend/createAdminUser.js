/**
 * Admin User Creation Script
 * 
 * This script creates an admin user with properly hashed password.
 * Run with: node backend/createAdminUser.js
 * 
 * Default credentials:
 * - Email: admin@foodieweb.com
 * - Password: admin123
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdminUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const User = require('./models/User');
    
    const adminEmail = 'admin@foodieweb.com';
    const adminPassword = 'admin123';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔑 Role:', existingAdmin.role);
      
      // Ask if user wants to update password
      console.log('\n💡 To reset the admin password, delete the user in MongoDB Compass first.');
    } else {
      // Create new admin user - this will trigger the pre-save middleware to hash the password
      const adminUser = new User({
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      
      await adminUser.save();
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', adminUser.email);
      console.log('👤 Name:', adminUser.name);
      console.log('🔑 Role:', adminUser.role);
      console.log('🔒 Password is hashed:', adminUser.password.startsWith('$2b$'));
    }
    
    // Verify password hashing
    console.log('\n🔍 Verifying password hash...');
    const user = await User.findOne({ email: adminEmail });
    if (user) {
      const isHashed = user.password.startsWith('$2b$');
      console.log('🔒 Password properly hashed:', isHashed);
      
      if (isHashed) {
        console.log('✅ You can now login with:');
        console.log('   Email: admin@foodieweb.com');
        console.log('   Password: admin123');
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔄 Disconnected from MongoDB');
  }
}

createAdminUser();