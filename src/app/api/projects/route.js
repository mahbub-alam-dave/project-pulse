import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Project from '../../../models/project';
import User from '../../../models/user';
import { requireAuth } from '../../../lib/auth';


// GET all projects
export async function GET(request) {
  try {
    const authCheck = await requireAuth();
    
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    await connectDB();

    const { role, userId } = authCheck.user;
    let query = {};

    // Filter projects based on role
    if (role === 'employee') {
      query.employees = userId;
    } else if (role === 'client') {
      query.client = userId;
    }
    // Admin sees all projects

    const projects = await Project.find(query)
      .populate('client', 'name email')
      .populate('employees', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        projects: projects.map(project => ({
          id: project._id,
          name: project.name,
          description: project.description,
          startDate: project.startDate,
          endDate: project.endDate,
          status: project.status,
          healthScore: project.healthScore,
          client: {
            id: project.client._id,
            name: project.client.name,
            email: project.client.email,
          },
          employees: project.employees.map(emp => ({
            id: emp._id,
            name: emp.name,
            email: emp.email,
          })),
          isActive: project.isActive,
          createdAt: project.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new project (Admin only)
export async function POST(request) {
  try {
    const authCheck = await requireAuth(['admin']);
    
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { name, description, startDate, endDate, clientId, employeeIds } = await request.json();

    // Validate input
    if (!name || !description || !startDate || !endDate || !clientId) {
      return NextResponse.json(
        { error: 'Name, description, dates, and client are required' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify client exists and has client role
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return NextResponse.json(
        { error: 'Invalid client' },
        { status: 400 }
      );
    }

    // Verify employees exist and have employee role
    if (employeeIds && employeeIds.length > 0) {
      const employees = await User.find({
        _id: { $in: employeeIds },
        role: 'employee',
      });

      if (employees.length !== employeeIds.length) {
        return NextResponse.json(
          { error: 'Some employees are invalid' },
          { status: 400 }
        );
      }
    }

    // Create project
    const project = await Project.create({
      name,
      description,
      startDate: start,
      endDate: end,
      client: clientId,
      employees: employeeIds || [],
    });

    await project.populate('client', 'name email');
    await project.populate('employees', 'name email');

    return NextResponse.json(
      {
        success: true,
        message: 'Project created successfully',
        project: {
          id: project._id,
          name: project.name,
          description: project.description,
          startDate: project.startDate,
          endDate: project.endDate,
          status: project.status,
          healthScore: project.healthScore,
          client: {
            id: project.client._id,
            name: project.client.name,
            email: project.client.email,
          },
          employees: project.employees.map(emp => ({
            id: emp._id,
            name: emp.name,
            email: emp.email,
          })),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}