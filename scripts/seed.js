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

// Project Schema
const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  startDate: Date,
  endDate: Date,
  status: String,
  healthScore: Number,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: Boolean,
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

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

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    console.log('🗑️  Cleared existing data');

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
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log('✅ Created demo users');

    // Find specific users for project assignment
    const admin = createdUsers.find(u => u.role === 'admin');
    const johnEmployee = createdUsers.find(u => u.email === 'john@projectpulse.com');
    const janeEmployee = createdUsers.find(u => u.email === 'jane@projectpulse.com');
    const client1 = createdUsers.find(u => u.email === 'client@company.com');
    const client2 = createdUsers.find(u => u.email === 'contact@techcorp.com');

    // Create sample projects
    const sampleProjects = [
      {
        name: 'E-Commerce Platform Redesign',
        description: 'Complete overhaul of the existing e-commerce platform with modern UI/UX and improved performance',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2025-03-31'),
        status: 'On Track',
        healthScore: 85,
        client: client1._id,
        employees: [johnEmployee._id, janeEmployee._id],
        isActive: true,
      },
      {
        name: 'Mobile App Development',
        description: 'Native mobile application for iOS and Android with real-time synchronization',
        startDate: new Date('2024-11-15'),
        endDate: new Date('2025-02-28'),
        status: 'At Risk',
        healthScore: 65,
        client: client2._id,
        employees: [johnEmployee._id],
        isActive: true,
      },
      {
        name: 'Data Analytics Dashboard',
        description: 'Business intelligence dashboard with advanced analytics and reporting features',
        startDate: new Date('2024-10-01'),
        endDate: new Date('2025-01-31'),
        status: 'On Track',
        healthScore: 92,
        client: client1._id,
        employees: [janeEmployee._id],
        isActive: true,
      },
    ];

    await Project.insertMany(sampleProjects);
    console.log(' Created sample projects');

    process.exit(0);
  } catch (error) {
    console.error(' Seed error:', error);
    process.exit(1);
  }
}

seed();