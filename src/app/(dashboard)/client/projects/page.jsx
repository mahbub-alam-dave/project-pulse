'use client';

import { useEffect, useState } from 'react';
import { FolderKanban, TrendingUp, TrendingDown, AlertCircle, Calendar, Users } from 'lucide-react';

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      
      if (response.ok) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch projects');
    } finally {
      setLoading(false);
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

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
        <p className="text-gray-600 mt-2">View and track your project progress</p>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FolderKanban className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects</h3>
          <p className="text-gray-600">You don&apos;t have any projects yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => {
            const daysLeft = getDaysRemaining(project.endDate);
            return (
              <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Health Score */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Project Health</span>
                    <span className={`text-lg font-bold ${getHealthScoreColor(project.healthScore)}`}>
                      {getHealthIcon(project.healthScore)} {project.healthScore}/100
                    </span>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Timeline</span>
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <Calendar size={14} />
                      <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Days Remaining */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Days Remaining</span>
                    <span className={`text-sm font-semibold ${daysLeft < 7 ? 'text-red-600' : daysLeft < 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {daysLeft > 0 ? `${daysLeft} days` : 'Overdue'}
                    </span>
                  </div>

                  {/* Team Members */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-600">Development Team</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.employees.map((emp) => (
                        <span key={emp.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {emp.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-medium text-gray-900">{project.healthScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getHealthScoreColor(project.healthScore).replace('text-', 'bg-')}`}
                        style={{ width: `${project.healthScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}