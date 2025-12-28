import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Risk from '../../../../models/risk';
import Project from '../../../../models/project';
import { requireAuth } from '../../../../lib/auth';

// PUT update risk (resolve/update)
export async function PUT(request, { params }) {
  try {
    const authCheck = await requireAuth(['employee', 'admin']);
    
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { title, description, severity, mitigationPlan, status } = await request.json();
    const { id } = await params;

    await connectDB();

    const risk = await Risk.findById(id).populate('project');

    if (!risk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      );
    }

    const { userId, role } = authCheck.user;

    // Verify user has access
    if (role === 'employee' && !risk.project.employees.includes(userId)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update fields
    if (title) risk.title = title;
    if (description !== undefined) risk.description = description;
    if (severity) risk.severity = severity;
    if (mitigationPlan !== undefined) risk.mitigationPlan = mitigationPlan;
    
    if (status) {
      risk.status = status;
      if (status === 'Resolved') {
        risk.resolvedAt = new Date();
        risk.resolvedBy = userId;
      }
    }

    await risk.save();

    // Recalculate project health score
    const project = await Project.findById(risk.project._id);
    await project.calculateHealthScore();

    await risk.populate('createdBy', 'name email');
    await risk.populate('resolvedBy', 'name email');

    return NextResponse.json(
      {
        success: true,
        message: 'Risk updated successfully',
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
          resolvedAt: risk.resolvedAt,
          resolvedBy: risk.resolvedBy ? {
            id: risk.resolvedBy._id,
            name: risk.resolvedBy.name,
          } : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update risk error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE risk (Admin only)
export async function DELETE(request, { params }) {
  try {
    const authCheck = await requireAuth(['admin']);
    
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    await connectDB();

    const { id } = await params;
    const risk = await Risk.findByIdAndDelete(id);

    if (!risk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Risk deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete risk error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}