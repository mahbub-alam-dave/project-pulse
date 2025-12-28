'use client';

import { useEffect, useState } from 'react';
import { Plus, CheckSquare, Calendar } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Rating from '../../../../components/ui/Rating';

export default function EmployeeCheckInsPage() {
  const [checkIns, setCheckIns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCheckIns();
    fetchProjects();
  }, []);

  const fetchCheckIns = async () => {
    try {
      const response = await fetch('/api/checkins');
      const data = await response.json();
      
      if (response.ok) {
        setCheckIns(data.checkIns);
      }
    } catch (error) {
      console.error('Failed to fetch check-ins');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading check-ins...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Check-ins</h1>
          <p className="text-gray-600 mt-2">Submit your weekly progress updates</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Submit Check-in
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

      {checkIns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CheckSquare className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Check-ins Yet</h3>
          <p className="text-gray-600 mb-4">Submit your first weekly check-in</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Submit Check-in
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {checkIns.map((checkIn) => (
            <div key={checkIn.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{checkIn.project.name}</h3>
                  <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>
                      {new Date(checkIn.weekStartDate).toLocaleDateString()} - {new Date(checkIn.weekEndDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {checkIn.completionPercentage}% Complete
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Progress Summary:</span>
                  <p className="text-sm text-gray-600 mt-1">{checkIn.progressSummary}</p>
                </div>

                {checkIn.blockers && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Blockers:</span>
                    <p className="text-sm text-gray-600 mt-1">{checkIn.blockers}</p>
                  </div>
                )}

                <div className="flex items-center space-x-4 pt-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Confidence Level:</span>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg ${i < checkIn.confidenceLevel ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{checkIn.confidenceLevel}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateCheckInModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setError('');
        }}
        projects={projects}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          setSuccess('Check-in submitted successfully');
          fetchCheckIns();
          setTimeout(() => setSuccess(''), 3000);
        }}
        setError={setError}
      />
    </div>
  );
}

function CreateCheckInModal({ isOpen, onClose, projects, onSuccess, setError }) {
  const [formData, setFormData] = useState({
    projectId: '',
    progressSummary: '',
    blockers: '',
    confidenceLevel: 0,
    completionPercentage: 0,
  });
  const [loading, setLoading] = useState(false);

  // Get current week dates
  const getWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      weekStartDate: monday.toISOString().split('T')[0],
      weekEndDate: sunday.toISOString().split('T')[0],
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.confidenceLevel === 0) {
      setError('Please select a confidence level');
      return;
    }

    setLoading(true);
    setError('');

    const weekDates = getWeekDates();

    try {
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...weekDates,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({
          projectId: '',
          progressSummary: '',
          blockers: '',
          confidenceLevel: 0,
          completionPercentage: 0,
        });
        onSuccess();
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to submit check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Weekly Check-in" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Project"
          name="projectId"
          value={formData.projectId}
          onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
          options={projects.map(p => ({ value: p.id, label: p.name }))}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Progress Summary <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.progressSummary}
            onChange={(e) => setFormData({ ...formData, progressSummary: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows="3"
            placeholder="What have you accomplished this week?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Blockers / Challenges
          </label>
          <textarea
            value={formData.blockers}
            onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows="3"
            placeholder="Any blockers or challenges? (Optional)"
          />
        </div>

        <Rating
          label="Confidence Level"
          value={formData.confidenceLevel}
          onChange={(value) => setFormData({ ...formData, confidenceLevel: value })}
        />

        <Input
          label="Completion Percentage"
          type="number"
          min="0"
          max="100"
          value={formData.completionPercentage}
          onChange={(e) => setFormData({ ...formData, completionPercentage: parseInt(e.target.value) || 0 })}
          placeholder="0-100"
          required
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Check-in'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}