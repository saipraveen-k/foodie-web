const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixPasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');
    
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    
    for (const user of users) {
      if (!user.password.startsWith('$2b$')) {
        console.log('Fixing password for:', user.email);
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        console.log('Password fixed for:', user.email);
      }
    }
    
    console.log('Password fixing complete!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

fixPasswords();
