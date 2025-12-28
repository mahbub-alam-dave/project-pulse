import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import CheckIn from '../../../models/checkIn';
import Project from '../../../models/project';
import { requireAuth } from '../../../lib/auth';

// GET all check-ins
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

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const { role, userId } = authCheck.user;
    let query = {};

    // Filter based on role
    if (role === 'employee') {
      query.employee = userId;
    } else if (role === 'client') {
      // Clients can see check-ins for their projects
      const projects = await Project.find({ client: userId }).select('_id');
      query.project = { $in: projects.map(p => p._id) };
    }

    // Filter by project if specified
    if (projectId) {
      query.project = projectId;
    }

    const checkIns = await CheckIn.find(query)
      .populate('project', 'name')
      .populate('employee', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        checkIns: checkIns.map(ci => ({
          id: ci._id,
          project: {
            id: ci.project._id,
            name: ci.project.name,
          },
          employee: {
            id: ci.employee._id,
            name: ci.employee.name,
            email: ci.employee.email,
          },
          progressSummary: ci.progressSummary,
          blockers: ci.blockers,
          confidenceLevel: ci.confidenceLevel,
          completionPercentage: ci.completionPercentage,
          weekStartDate: ci.weekStartDate,
          weekEndDate: ci.weekEndDate,
          createdAt: ci.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get check-ins error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new check-in (Employee only)
export async function POST(request) {
  try {
    const authCheck = await requireAuth(['employee']);
    
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { projectId, progressSummary, blockers, confidenceLevel, completionPercentage, weekStartDate, weekEndDate } = await request.json();

    // Validate input
    if (!projectId || !progressSummary || !confidenceLevel || completionPercentage === undefined || !weekStartDate || !weekEndDate) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (confidenceLevel < 1 || confidenceLevel > 5) {
      return NextResponse.json(
        { error: 'Confidence level must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (completionPercentage < 0 || completionPercentage > 100) {
      return NextResponse.json(
        { error: 'Completion percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    await connectDB();

    const { userId } = authCheck.user;

    // Verify employee is assigned to this project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (!project.employees.includes(userId)) {
      return NextResponse.json(
        { error: 'You are not assigned to this project' },
        { status: 403 }
      );
    }

    // Check if check-in already exists for this week
    const existingCheckIn = await CheckIn.findOne({
      project: projectId,
      employee: userId,
      weekStartDate: new Date(weekStartDate),
    });

    if (existingCheckIn) {
      return NextResponse.json(
        { error: 'Check-in already submitted for this week' },
        { status: 409 }
      );
    }

    // Create check-in
    const checkIn = await CheckIn.create({
      project: projectId,
      employee: userId,
      progressSummary,
      blockers: blockers || '',
      confidenceLevel,
      completionPercentage,
      weekStartDate: new Date(weekStartDate),
      weekEndDate: new Date(weekEndDate),
    });

    // Recalculate project health score
    await project.calculateHealthScore();

    await checkIn.populate('project', 'name');
    await checkIn.populate('employee', 'name email');

    return NextResponse.json(
      {
        success: true,
        message: 'Check-in submitted successfully',
        checkIn: {
          id: checkIn._id,
          project: {
            id: checkIn.project._id,
            name: checkIn.project.name,
          },
          employee: {
            id: checkIn.employee._id,
            name: checkIn.employee.name,
          },
          progressSummary: checkIn.progressSummary,
          blockers: checkIn.blockers,
          confidenceLevel: checkIn.confidenceLevel,
          completionPercentage: checkIn.completionPercentage,
          weekStartDate: checkIn.weekStartDate,
          weekEndDate: checkIn.weekEndDate,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create check-in error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Check-in already submitted for this week' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}