import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Project from '../../../../models/project';
import User from '../../../../models/user';
import { requireAuth } from '../../../../lib/auth';

// GET single project
export async function GET(request, { params }) {
  try {
    const authCheck = await requireAuth();
    
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    await connectDB();

    const { id } = await params;
    const project = await Project.findById(id)
      .populate('client', 'name email')
      .populate('employees', 'name email');

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const { role, userId } = authCheck.user;
    if (role === 'employee' && !project.employees.some(emp => emp._id.toString() === userId)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    if (role === 'client' && project.client._id.toString() !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
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
          isActive: project.isActive,
          createdAt: project.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update project (Admin only)
export async function PUT(request, { params }) {
  try {
    const authCheck = await requireAuth(['admin']);
    
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { name, description, startDate, endDate, clientId, employeeIds, status, isActive } = await request.json();
    const { id } = await params;

    await connectDB();

    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (name) project.name = name;
    if (description) project.description = description;
    
    if (startDate) {
      const start = new Date(startDate);
      project.startDate = start;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      if (end <= project.startDate) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
      project.endDate = end;
    }

    if (clientId) {
      const client = await User.findById(clientId);
      if (!client || client.role !== 'client') {
        return NextResponse.json(
          { error: 'Invalid client' },
          { status: 400 }
        );
      }
      project.client = clientId;
    }

    if (employeeIds !== undefined) {
      if (employeeIds.length > 0) {
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
      project.employees = employeeIds;
    }

    if (status) {
      const validStatuses = ['On Track', 'At Risk', 'Critical', 'Completed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
      project.status = status;
    }

    if (typeof isActive === 'boolean') {
      project.isActive = isActive;
    }

    await project.save();
    await project.populate('client', 'name email');
    await project.populate('employees', 'name email');

    return NextResponse.json(
      {
        success: true,
        message: 'Project updated successfully',
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
          isActive: project.isActive,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE project (Admin only)
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
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Project deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}