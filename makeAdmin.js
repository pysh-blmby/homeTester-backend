import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const makeAdmin = async (phone) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const user = await User.findOne({ phone });
    if (!user) {
      console.log(`User with phone ${phone} not found! Please login to the app once with this number first.`);
      process.exit(1);
    }

    user.role = 'super_admin';
    await user.save();
    
    console.log(`✅ Success! User ${phone} is now a super_admin!`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const phoneToPromote = process.argv[2];
if (!phoneToPromote) {
  console.log('Please provide a phone number: node makeAdmin.js 9876543210');
  process.exit(1);
}

makeAdmin(phoneToPromote);
