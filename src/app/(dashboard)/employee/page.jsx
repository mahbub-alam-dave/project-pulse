'use client';

import { useEffect, useState } from 'react';
import { FolderKanban, CheckSquare, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeDashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingCheckIns: 0,
    openRisks: 0,
    recentCheckIns: 0,
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch employee projects
      const projectsResponse = await fetch('/api/projects');
      const projectsData = await projectsResponse.json();

      // Fetch check-ins
      const checkInsResponse = await fetch('/api/checkins');
      const checkInsData = await checkInsResponse.json();

      // Fetch risks
      const risksResponse = await fetch('/api/risks');
      const risksData = await risksResponse.json();

      if (projectsData.success) {
        const activeProjects = projectsData.projects.filter(p => p.isActive && p.status !== 'Completed');
        setProjects(activeProjects);

        // Calculate pending check-ins (projects without check-in this week)
        const thisWeekStart = getWeekStart(new Date());
        const thisWeekCheckIns = checkInsData.success 
          ? checkInsData.checkIns.filter(ci => new Date(ci.weekStartDate) >= thisWeekStart)
          : [];
        
        const projectsWithCheckIn = new Set(thisWeekCheckIns.map(ci => ci.project.id));
        const pendingCount = activeProjects.filter(p => !projectsWithCheckIn.has(p.id)).length;

        setStats({
          totalProjects: activeProjects.length,
          pendingCheckIns: pendingCount,
          openRisks: risksData.success ? risksData.risks.filter(r => r.status === 'Open').length : 0,
          recentCheckIns: thisWeekCheckIns.length,
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
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as week start
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
      title: 'Pending Check-ins',
      value: stats.pendingCheckIns,
      icon: Clock,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Open Risks',
      value: stats.openRisks,
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      title: 'This Week Check-ins',
      value: stats.recentCheckIns,
      icon: CheckSquare,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
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
        <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your project workspace</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/employee/checkins"
            className="block p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <CheckSquare className="text-blue-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-900">Submit Check-in</h3>
            <p className="text-sm text-gray-600 mt-1">Update your weekly progress</p>
          </Link>
          <Link
            href="/employee/risks"
            className="block p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
          >
            <AlertTriangle className="text-red-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-900">Report Risk</h3>
            <p className="text-sm text-gray-600 mt-1">Flag project risks or blockers</p>
          </Link>
          <Link
            href="/employee/projects"
            className="block p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <FolderKanban className="text-green-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-900">View Projects</h3>
            <p className="text-sm text-gray-600 mt-1">See all assigned projects</p>
          </Link>
        </div>
      </div>

      {/* My Projects */}
      {projects.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Projects</h2>
            <Link href="/employee/projects" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Assigned</h3>
          <p className="text-gray-600">You haven&apos;t been assigned to any projects yet.</p>
        </div>
      )}
    </div>
  );
}