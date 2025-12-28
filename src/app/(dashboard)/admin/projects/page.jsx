'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, FolderKanban, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      
      if (response.ok) {
        setProjects(data.projects);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Project deleted successfully');
        fetchProjects();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to delete project');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'On Track': 'bg-green-100 text-green-800',
      'At Risk': 'bg-yellow-100 text-yellow-800',
      'Critical': 'bg-red-100 text-red-800',
      'Completed': 'bg-blue-100 text-blue-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (score) => {
    if (score >= 80) return <TrendingUp className="inline" size={16} />;
    if (score >= 60) return <AlertCircle className="inline" size={16} />;
    return <TrendingDown className="inline" size={16} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects Management</h1>
          <p className="text-gray-600 mt-2">Manage all projects and track their health</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Create Project
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Projects Grid/Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first project</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={20} className="mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{project.client.name}</div>
                    <div className="text-xs text-gray-500">{project.client.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {project.employees.length === 0 ? (
                        <span className="text-gray-400">No employees</span>
                      ) : (
                        <span>{project.employees.length} employee{project.employees.length > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-600">
                      {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-semibold ${getHealthScoreColor(project.healthScore)}`}>
                      {getHealthIcon(project.healthScore)} {project.healthScore}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setIsEditModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setError('');
        }}
        users={users}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          setSuccess('Project created successfully');
          fetchProjects();
          setTimeout(() => setSuccess(''), 3000);
        }}
        setError={setError}
      />

      {/* Edit Project Modal */}
      {selectedProject && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProject(null);
            setError('');
          }}
          project={selectedProject}
          users={users}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setSelectedProject(null);
            setSuccess('Project updated successfully');
            fetchProjects();
            setTimeout(() => setSuccess(''), 3000);
          }}
          setError={setError}
        />
      )}
    </div>
  );
}

function CreateProjectModal({ isOpen, onClose, users, onSuccess, setError }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    clientId: '',
    employeeIds: [],
  });
  const [loading, setLoading] = useState(false);

  const clients = users.filter(u => u.role === 'client');
  const employees = users.filter(u => u.role === 'employee');

  const handleEmployeeToggle = (empId) => {
    setFormData(prev => ({
      ...prev,
      employeeIds: prev.employeeIds.includes(empId)
        ? prev.employeeIds.filter(id => id !== empId)
        : [...prev.employeeIds, empId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({ name: '', description: '', startDate: '', endDate: '', clientId: '', employeeIds: [] });
        onSuccess();
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            rows="3"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
          <Input
            label="End Date"
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>

        <Select
          label="Client"
          name="clientId"
          value={formData.clientId}
          onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
          options={clients.map(c => ({ value: c.id, label: `${c.name} (${c.email})` }))}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Employees
          </label>
          <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
            {employees.length === 0 ? (
              <p className="text-sm text-gray-500">No employees available</p>
            ) : (
              employees.map(emp => (
                <label key={emp.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.employeeIds.includes(emp.id)}
                    onChange={() => handleEmployeeToggle(emp.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{emp.name} ({emp.email})</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function EditProjectModal({ isOpen, onClose, project, users, onSuccess, setError }) {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    startDate: new Date(project.startDate).toISOString().split('T')[0],
    endDate: new Date(project.endDate).toISOString().split('T')[0],
    clientId: project.client.id,
    employeeIds: project.employees.map(e => e.id),
    status: project.status,
    isActive: project.isActive,
  });
  const [loading, setLoading] = useState(false);

  const clients = users.filter(u => u.role === 'client');
  const employees = users.filter(u => u.role === 'employee');

  const handleEmployeeToggle = (empId) => {
    setFormData(prev => ({
      ...prev,
      employeeIds: prev.employeeIds.includes(empId)
        ? prev.employeeIds.filter(id => id !== empId)
        : [...prev.employeeIds, empId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            rows="3"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
          <Input
            label="End Date"
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>

        <Select
          label="Client"
          name="clientId"
          value={formData.clientId}
          onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
          options={clients.map(c => ({ value: c.id, label: `${c.name} (${c.email})` }))}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Employees
          </label>
          <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
            {employees.length === 0 ? (
              <p className="text-sm text-gray-500">No employees available</p>
            ) : (
              employees.map(emp => (
                <label key={emp.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.employeeIds.includes(emp.id)}
                    onChange={() => handleEmployeeToggle(emp.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{emp.name} ({emp.email})</span>
                </label>
              ))
            )}
          </div>
        </div>

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          options={[
            { value: 'On Track', label: 'On Track' },
            { value: 'At Risk', label: 'At Risk' },
            { value: 'Critical', label: 'Critical' },
            { value: 'Completed', label: 'Completed' },
          ]}
          required
        />

        <Select
          label="Active Status"
          name="isActive"
          value={formData.isActive ? 'true' : 'false'}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
          options={[
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
          ]}
          required
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}