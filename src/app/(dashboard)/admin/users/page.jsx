'use client';

import { useEffect, useState } from 'react';
import { Users, FolderKanban, AlertTriangle, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeProjects: 0,
    highRiskProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // In next phase, we'll fetch real stats from API
      // For now, using placeholder data
      setStats({
        totalUsers: 0,
        totalProjects: 0,
        activeProjects: 0,
        highRiskProjects: 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderKanban,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'High Risk Projects',
      value: stats.highRiskProjects,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
  ];

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
                  <Icon className={`${stat.color.replace('bg-', 'text-')} w-6 h-6`} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Users className="text-blue-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-600 mt-1">Create and manage user accounts</p>
          </a>
          <a
            href="/admin/projects"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <FolderKanban className="text-green-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-900">Manage Projects</h3>
            <p className="text-sm text-gray-600 mt-1">Create and track projects</p>
          </a>
          <a
            href="/admin/risks"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
          >
            <AlertTriangle className="text-red-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-900">View Risks</h3>
            <p className="text-sm text-gray-600 mt-1">Monitor project risks and issues</p>
          </a>
        </div>
      </div>
    </div>
  );
}