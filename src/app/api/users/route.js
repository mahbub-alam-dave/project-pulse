import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

// GET all users (Admin only)
export async function GET() {
  try {
    const authCheck = await requireAuth(['admin']);
    
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    await connectDB();

    const users = await User.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        users: users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new user (Admin only)
export async function POST(request) {
  try {
    const authCheck = await requireAuth(['admin']);
    
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { name, email, password, role } = await request.json();

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'employee', 'client'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, employee, or client' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}