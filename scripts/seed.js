import mongoose from 'mongoose';
import bcrypt  from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@projectpulse.com',
    password: 'admin123',
    role: 'admin',
    isActive: true,
  },
  {
    name: 'John Employee',
    email: 'john@projectpulse.com',
    password: 'employee123',
    role: 'employee',
    isActive: true,
  },
  {
    name: 'Jane Employee',
    email: 'jane@projectpulse.com',
    password: 'employee123',
    role: 'employee',
    isActive: true,
  },
  {
    name: 'Client Company',
    email: 'client@company.com',
    password: 'client123',
    role: 'client',
    isActive: true,
  },
  {
    name: 'Tech Corp',
    email: 'contact@techcorp.com',
    password: 'client123',
    role: 'client',
    isActive: true,
  },
];

async function seed() {
  try {
    console.log('🌱 Starting seed process...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Hash passwords and create users
    const usersWithHashedPasswords = await Promise.all(
      seedUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword,
        };
      })
    );

    // Insert users
    await User.insertMany(usersWithHashedPasswords);
    console.log('Created demo users');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();