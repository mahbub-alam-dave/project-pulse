import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import ClientFeedback from '../../../models/clientFeedback';
import Project from '../../../models/project';
import { requireAuth } from '../../../lib/auth';

// GET all feedback
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
    if (role === 'client') {
      query.client = userId;
    } else if (role === 'employee') {
      // Employees can see feedback for their projects
      const projects = await Project.find({ employees: userId }).select('_id');
      query.project = { $in: projects.map(p => p._id) };
    }

    // Filter by project if specified
    if (projectId) {
      query.project = projectId;
    }

    const feedback = await ClientFeedback.find(query)
      .populate('project', 'name')
      .populate('client', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        feedback: feedback.map(fb => ({
          id: fb._id,
          project: {
            id: fb.project._id,
            name: fb.project.name,
          },
          client: {
            id: fb.client._id,
            name: fb.client.name,
            email: fb.client.email,
          },
          satisfactionRating: fb.satisfactionRating,
          communicationRating: fb.communicationRating,
          comments: fb.comments,
          issueFlagged: fb.issueFlagged,
          weekStartDate: fb.weekStartDate,
          weekEndDate: fb.weekEndDate,
          createdAt: fb.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get feedback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new feedback (Client only)
export async function POST(request) {
  try {
    const authCheck = await requireAuth(['client']);
    
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { projectId, satisfactionRating, communicationRating, comments, issueFlagged, weekStartDate, weekEndDate } = await request.json();

    // Validate input
    if (!projectId || !satisfactionRating || !communicationRating || !weekStartDate || !weekEndDate) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (satisfactionRating < 1 || satisfactionRating > 5) {
      return NextResponse.json(
        { error: 'Satisfaction rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (communicationRating < 1 || communicationRating > 5) {
      return NextResponse.json(
        { error: 'Communication rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    await connectDB();

    const { userId } = authCheck.user;

    // Verify client is assigned to this project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.client.toString() !== userId) {
      return NextResponse.json(
        { error: 'You are not assigned to this project' },
        { status: 403 }
      );
    }

    // Check if feedback already exists for this week
    const existingFeedback = await ClientFeedback.findOne({
      project: projectId,
      client: userId,
      weekStartDate: new Date(weekStartDate),
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: 'Feedback already submitted for this week' },
        { status: 409 }
      );
    }

    // Create feedback
    const feedback = await ClientFeedback.create({
      project: projectId,
      client: userId,
      satisfactionRating,
      communicationRating,
      comments: comments || '',
      issueFlagged: issueFlagged || false,
      weekStartDate: new Date(weekStartDate),
      weekEndDate: new Date(weekEndDate),
    });

    // Recalculate project health score
    await project.calculateHealthScore();

    await feedback.populate('project', 'name');
    await feedback.populate('client', 'name email');

    return NextResponse.json(
      {
        success: true,
        message: 'Feedback submitted successfully',
        feedback: {
          id: feedback._id,
          project: {
            id: feedback.project._id,
            name: feedback.project.name,
          },
          client: {
            id: feedback.client._id,
            name: feedback.client.name,
          },
          satisfactionRating: feedback.satisfactionRating,
          communicationRating: feedback.communicationRating,
          comments: feedback.comments,
          issueFlagged: feedback.issueFlagged,
          weekStartDate: feedback.weekStartDate,
          weekEndDate: feedback.weekEndDate,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create feedback error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Feedback already submitted for this week' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}