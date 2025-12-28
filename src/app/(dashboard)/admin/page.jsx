'use client';

import { useEffect, useState } from 'react';
import { Users, FolderKanban, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeProjects: 0,
    atRiskProjects: 0,
    criticalProjects: 0,
    completedProjects: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch users
      const usersResponse = await fetch('/api/users');
      const usersData = await usersResponse.json();

      // Fetch projects
      const projectsResponse = await fetch('/api/projects');
      const projectsData = await projectsResponse.json();

      if (usersData.success && projectsData.success) {
        const projects = projectsData.projects;
        
        setStats({
          totalUsers: usersData.users.length,
          totalProjects: projects.length,
          activeProjects: projects.filter(p => p.isActive && p.status !== 'Completed').length,
          atRiskProjects: projects.filter(p => p.status === 'At Risk').length,
          criticalProjects: projects.filter(p => p.status === 'Critical').length,
          completedProjects: projects.filter(p => p.status === 'Completed').length,
        });

        // Get 5 most recent projects
        setRecentProjects(projects.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderKanban,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Projects At Risk',
      value: stats.atRiskProjects + stats.criticalProjects,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ];

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to ProjectPulse Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={stat.textColor} size={24} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Project Health Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Health Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-600" size={20} />
                <span className="text-sm font-medium">On Track</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {stats.totalProjects - stats.atRiskProjects - stats.criticalProjects - stats.completedProjects}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-yellow-600" size={20} />
                <span className="text-sm font-medium">At Risk</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{stats.atRiskProjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-red-600" size={20} />
                <span className="text-sm font-medium">Critical</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{stats.criticalProjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderKanban className="text-blue-600" size={20} />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{stats.completedProjects}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/users"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="text-blue-600" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Users</h3>
                  <p className="text-sm text-gray-600">Create and manage user accounts</p>
                </div>
              </div>
            </Link>
            <Link
              href="/admin/projects"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FolderKanban className="text-green-600" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Projects</h3>
                  <p className="text-sm text-gray-600">Create and track projects</p>
                </div>
              </div>
            </Link>
            <Link
              href="/admin/risks"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-red-600" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900">View Risks</h3>
                  <p className="text-sm text-gray-600">Monitor project risks and issues</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            <Link href="/admin/projects" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">{project.client.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${getHealthScoreColor(project.healthScore)}`}>
                        {project.healthScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}