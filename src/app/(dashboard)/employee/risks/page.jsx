'use client';

import { useEffect, useState } from 'react';
import { Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';

export default function EmployeeRisksPage() {
  const [risks, setRisks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRisks();
    fetchProjects();
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

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      
      if (response.ok) {
        setProjects(data.projects.filter(p => p.isActive && p.status !== 'Completed'));
      }
    } catch (error) {
      console.error('Failed to fetch projects');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading risks...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Risks</h1>
          <p className="text-gray-600 mt-2">Track and manage project risks</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Report Risk
        </Button>
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

      {/* Open Risks */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Open Risks ({openRisks.length})</h2>
        {openRisks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Open Risks</h3>
            <p className="text-gray-600">All risks have been resolved or no risks reported yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {openRisks.map((risk) => (
              <div key={risk.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveRisk(risk.id)}
                  >
                    Mark Resolved
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Risks */}
      {resolvedRisks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resolved Risks ({resolvedRisks.length})</h2>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateRiskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setError('');
        }}
        projects={projects}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          setSuccess('Risk reported successfully');
          fetchRisks();
          setTimeout(() => setSuccess(''), 3000);
        }}
        setError={setError}
      />
    </div>
  );
}

function CreateRiskModal({ isOpen, onClose, projects, onSuccess, setError }) {
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    description: '',
    severity: '',
    mitigationPlan: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({
          projectId: '',
          title: '',
          description: '',
          severity: '',
          mitigationPlan: '',
        });
        onSuccess();
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to report risk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report New Risk" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Project"
          name="projectId"
          value={formData.projectId}
          onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
          options={projects.map(p => ({ value: p.id, label: p.name }))}
          required
        />

        <Input
          label="Risk Title"
          name="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Brief description of the risk"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows="3"
            placeholder="Detailed description of the risk"
          />
        </div>

        <Select
          label="Severity"
          name="severity"
          value={formData.severity}
          onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
          options={[
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' },
          ]}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mitigation Plan
          </label>
          <textarea
            value={formData.mitigationPlan}
            onChange={(e) => setFormData({ ...formData, mitigationPlan: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows="3"
            placeholder="How do you plan to mitigate this risk?"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Reporting...' : 'Report Risk'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}