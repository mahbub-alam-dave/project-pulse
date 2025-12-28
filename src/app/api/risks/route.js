import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Risk from '../../../models/risk';
import Project from '../../../models/project';
import { requireAuth } from '../../../lib/auth';

// GET all risks
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
      const projects = await Project.find({ employees: userId }).select('_id');
      query.project = { $in: projects.map(p => p._id) };
    } else if (role === 'client') {
      const projects = await Project.find({ client: userId }).select('_id');
      query.project = { $in: projects.map(p => p._id) };
    }

    // Filter by project if specified
    if (projectId) {
      query.project = projectId;
    }

    const risks = await Risk.find(query)
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        risks: risks.map(risk => ({
          id: risk._id,
          project: {
            id: risk.project._id,
            name: risk.project.name,
          },
          createdBy: {
            id: risk.createdBy._id,
            name: risk.createdBy.name,
            email: risk.createdBy.email,
          },
          title: risk.title,
          description: risk.description,
          severity: risk.severity,
          mitigationPlan: risk.mitigationPlan,
          status: risk.status,
          resolvedAt: risk.resolvedAt,
          resolvedBy: risk.resolvedBy ? {
            id: risk.resolvedBy._id,
            name: risk.resolvedBy.name,
            email: risk.resolvedBy.email,
          } : null,
          createdAt: risk.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get risks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new risk (Employee only)
export async function POST(request) {
  try {
    const authCheck = await requireAuth(['employee', 'admin']);
    
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { projectId, title, description, severity, mitigationPlan } = await request.json();

    // Validate input
    if (!projectId || !title || !severity) {
      return NextResponse.json(
        { error: 'Project, title, and severity are required' },
        { status: 400 }
      );
    }

    const validSeverities = ['Low', 'Medium', 'High'];
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { error: 'Invalid severity level' },
        { status: 400 }
      );
    }

    await connectDB();

    const { userId, role } = authCheck.user;

    // Verify user has access to this project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (role === 'employee' && !project.employees.includes(userId)) {
      return NextResponse.json(
        { error: 'You are not assigned to this project' },
        { status: 403 }
      );
    }

    // Create risk
    const risk = await Risk.create({
      project: projectId,
      createdBy: userId,
      title,
      description: description || '',
      severity,
      mitigationPlan: mitigationPlan || '',
    });

    // Recalculate project health score
    await project.calculateHealthScore();

    await risk.populate('project', 'name');
    await risk.populate('createdBy', 'name email');

    return NextResponse.json(
      {
        success: true,
        message: 'Risk created successfully',
        risk: {
          id: risk._id,
          project: {
            id: risk.project._id,
            name: risk.project.name,
          },
          createdBy: {
            id: risk.createdBy._id,
            name: risk.createdBy.name,
          },
          title: risk.title,
          description: risk.description,
          severity: risk.severity,
          mitigationPlan: risk.mitigationPlan,
          status: risk.status,
          createdAt: risk.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create risk error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}