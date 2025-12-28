'use client';

import { useEffect, useState } from 'react';
import { FolderKanban, MessageSquare, AlertCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function ClientDashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingFeedback: 0,
    issuesFlagged: 0,
    onTrackProjects: 0,
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch client projects
      const projectsResponse = await fetch('/api/projects');
      const projectsData = await projectsResponse.json();

      // Fetch feedback
      const feedbackResponse = await fetch('/api/feedback');
      const feedbackData = await feedbackResponse.json();

      if (projectsData.success) {
        const activeProjects = projectsData.projects.filter(p => p.isActive && p.status !== 'Completed');
        setProjects(activeProjects);

        // Calculate pending feedback
        const thisWeekStart = getWeekStart(new Date());
        const thisWeekFeedback = feedbackData.success 
          ? feedbackData.feedback.filter(fb => new Date(fb.weekStartDate) >= thisWeekStart)
          : [];
        
        const projectsWithFeedback = new Set(thisWeekFeedback.map(fb => fb.project.id));
        const pendingCount = activeProjects.filter(p => !projectsWithFeedback.has(p.id)).length;

        const issuesFlagged = feedbackData.success 
          ? feedbackData.feedback.filter(fb => fb.issueFlagged && fb.project && activeProjects.some(p => p.id === fb.project.id)).length
          : 0;

        setStats({
          totalProjects: activeProjects.length,
          pendingFeedback: pendingCount,
          issuesFlagged: issuesFlagged,
          onTrackProjects: activeProjects.filter(p => p.status === 'On Track').length,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
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

  const statCards = [
    {
      title: 'My Projects',
      value: stats.totalProjects,
      icon: FolderKanban,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'On Track',
      value: stats.onTrackProjects,
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Pending Feedback',
      value: stats.pendingFeedback,
      icon: MessageSquare,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Issues Flagged',
      value: stats.issuesFlagged,
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
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
        <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your project portal</p>
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

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/client/feedback"
            className="block p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <MessageSquare className="text-blue-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-900">Submit Feedback</h3>
            <p className="text-sm text-gray-600 mt-1">Provide weekly feedback on projects</p>
          </Link>
          <Link
            href="/client/projects"
            className="block p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <FolderKanban className="text-green-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-900">View Projects</h3>
            <p className="text-sm text-gray-600 mt-1">See all your projects</p>
          </Link>
        </div>
      </div>

      {/* My Projects */}
      {projects.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Projects</h2>
            <Link href="/client/projects" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(project.status)}`}>
                      {project.status}
                    </span>
                    <span className={`text-sm font-semibold ${getHealthScoreColor(project.healthScore)}`}>
                      Health: {project.healthScore}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FolderKanban className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects</h3>
          <p className="text-gray-600">You don&apos;t have any projects yet.</p>
        </div>
      )}
    </div>
  );
}