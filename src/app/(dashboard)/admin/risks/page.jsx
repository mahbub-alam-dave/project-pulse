'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import Button from '../../../../components/ui/Button';

export default function AdminRisksPage() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    try {
      const response = await fetch('/api/risks');
      const data = await response.json();
      
      if (response.ok) {
        setRisks(data.risks);
      }
    } catch (error) {
      console.error('Failed to fetch risks');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRisk = async (riskId) => {
    if (!confirm('Are you sure you want to delete this risk?')) return;

    try {
      const response = await fetch(`/api/risks/${riskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Risk deleted successfully');
        fetchRisks();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to delete risk');
    }
  };

  const handleResolveRisk = async (riskId) => {
    try {
      const response = await fetch(`/api/risks/${riskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved' }),
      });

      if (response.ok) {
        setSuccess('Risk resolved successfully');
        fetchRisks();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to resolve risk');
    }
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      'Low': 'bg-blue-100 text-blue-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800',
    };
    return badges[severity] || 'bg-gray-100 text-gray-800';
  };

  const openRisks = risks.filter(r => r.status === 'Open');
  const resolvedRisks = risks.filter(r => r.status === 'Resolved');

  // Group risks by severity
  const highRisks = openRisks.filter(r => r.severity === 'High');
  const mediumRisks = openRisks.filter(r => r.severity === 'Medium');
  const lowRisks = openRisks.filter(r => r.severity === 'Low');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading risks...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Risk Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage all project risks</p>
      </div>

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

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Open Risks</p>
              <p className="text-3xl font-bold text-gray-900">{openRisks.length}</p>
            </div>
            <AlertTriangle className="text-gray-400" size={32} />
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">High Severity</p>
              <p className="text-3xl font-bold text-red-900">{highRisks.length}</p>
            </div>
            <AlertTriangle className="text-red-500" size={32} />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Medium Severity</p>
              <p className="text-3xl font-bold text-yellow-900">{mediumRisks.length}</p>
            </div>
            <AlertTriangle className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Resolved</p>
              <p className="text-3xl font-bold text-green-900">{resolvedRisks.length}</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      {/* High Priority Risks */}
      {highRisks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-red-900 mb-4 flex items-center">
            <AlertTriangle className="mr-2" size={24} />
            High Priority Risks ({highRisks.length})
          </h2>
          <div className="space-y-4">
            {highRisks.map((risk) => (
              <RiskCard 
                key={risk.id} 
                risk={risk} 
                onResolve={handleResolveRisk}
                onDelete={handleDeleteRisk}
                getSeverityBadge={getSeverityBadge}
              />
            ))}
          </div>
        </div>
      )}

      {/* Medium Priority Risks */}
      {mediumRisks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-yellow-900 mb-4">
            Medium Priority Risks ({mediumRisks.length})
          </h2>
          <div className="space-y-4">
            {mediumRisks.map((risk) => (
              <RiskCard 
                key={risk.id} 
                risk={risk} 
                onResolve={handleResolveRisk}
                onDelete={handleDeleteRisk}
                getSeverityBadge={getSeverityBadge}
              />
            ))}
          </div>
        </div>
      )}

      {/* Low Priority Risks */}
      {lowRisks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            Low Priority Risks ({lowRisks.length})
          </h2>
          <div className="space-y-4">
            {lowRisks.map((risk) => (
              <RiskCard 
                key={risk.id} 
                risk={risk} 
                onResolve={handleResolveRisk}
                onDelete={handleDeleteRisk}
                getSeverityBadge={getSeverityBadge}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Open Risks */}
      {openRisks.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center mb-8">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Open Risks</h3>
          <p className="text-gray-600">All risks have been resolved or no risks reported yet.</p>
        </div>
      )}

      {/* Resolved Risks */}
      {resolvedRisks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Resolved Risks ({resolvedRisks.length})
          </h2>
          <div className="space-y-4">
            {resolvedRisks.map((risk) => (
              <div key={risk.id} className="bg-gray-50 rounded-lg border border-gray-200 p-6 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{risk.title}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getSeverityBadge(risk.severity)}`}>
                        {risk.severity}
                      </span>
                      <CheckCircle className="text-green-600" size={20} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Project: {risk.project.name}</p>
                    {risk.description && (
                      <p className="text-sm text-gray-600 mb-3">{risk.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Resolved by {risk.resolvedBy?.name} on {new Date(risk.resolvedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteRisk(risk.id)}
                    className="text-red-600 hover:text-red-900 ml-4"
                    title="Delete risk"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RiskCard({ risk, onResolve, onDelete, getSeverityBadge }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{risk.title}</h3>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getSeverityBadge(risk.severity)}`}>
              {risk.severity}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">Project: {risk.project.name}</p>
          {risk.description && (
            <p className="text-sm text-gray-600 mb-3">{risk.description}</p>
          )}
          {risk.mitigationPlan && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
              <span className="text-sm font-medium text-blue-900">Mitigation Plan:</span>
              <p className="text-sm text-blue-800 mt-1">{risk.mitigationPlan}</p>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Reported by {risk.createdBy.name} on {new Date(risk.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResolve(risk.id)}
          >
            Mark Resolved
          </Button>
          <button
            onClick={() => onDelete(risk.id)}
            className="text-red-600 hover:text-red-900"
            title="Delete risk"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}