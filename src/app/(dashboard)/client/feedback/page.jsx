'use client';

import { useEffect, useState } from 'react';
import { Plus, MessageSquare, Calendar, AlertTriangle } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import Select from '../../../../components/ui/Select';
import Rating from '../../../../components/ui/Rating';

export default function ClientFeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFeedback();
    fetchProjects();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/feedback');
      const data = await response.json();
      
      if (response.ok) {
        setFeedback(data.feedback);
      }
    } catch (error) {
      console.error('Failed to fetch feedback');
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
        <div className="text-gray-500">Loading feedback...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Feedback</h1>
          <p className="text-gray-600 mt-2">Submit weekly feedback for your projects</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Submit Feedback
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

      {feedback.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Submitted</h3>
          <p className="text-gray-600 mb-4">Submit your first feedback for a project</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Submit Feedback
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((fb) => (
            <div key={fb.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{fb.project.name}</h3>
                  <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>
                      {new Date(fb.weekStartDate).toLocaleDateString()} - {new Date(fb.weekEndDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {fb.issueFlagged && (
                  <span className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                    <AlertTriangle size={14} />
                    <span>Issue Flagged</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Satisfaction Rating:</span>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-lg ${i < fb.satisfactionRating ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                      </span>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{fb.satisfactionRating}/5</span>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">Communication Rating:</span>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-lg ${i < fb.communicationRating ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                      </span>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{fb.communicationRating}/5</span>
                  </div>
                </div>
              </div>

              {fb.comments && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Comments:</span>
                  <p className="text-sm text-gray-600 mt-1">{fb.comments}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CreateFeedbackModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setError('');
        }}
        projects={projects}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          setSuccess('Feedback submitted successfully');
          fetchFeedback();
          setTimeout(() => setSuccess(''), 3000);
        }}
        setError={setError}
      />
    </div>
  );
}

function CreateFeedbackModal({ isOpen, onClose, projects, onSuccess, setError }) {
  const [formData, setFormData] = useState({
    projectId: '',
    satisfactionRating: 0,
    communicationRating: 0,
    comments: '',
    issueFlagged: false,
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
    
    if (formData.satisfactionRating === 0) {
      setError('Please provide a satisfaction rating');
      return;
    }

    if (formData.communicationRating === 0) {
      setError('Please provide a communication rating');
      return;
    }

    setLoading(true);
    setError('');

    const weekDates = getWeekDates();

    try {
      const response = await fetch('/api/feedback', {
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
          satisfactionRating: 0,
          communicationRating: 0,
          comments: '',
          issueFlagged: false,
        });
        onSuccess();
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Project Feedback" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Project"
          name="projectId"
          value={formData.projectId}
          onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
          options={projects.map(p => ({ value: p.id, label: p.name }))}
          required
        />

        <Rating
          label="Satisfaction Rating"
          value={formData.satisfactionRating}
          onChange={(value) => setFormData({ ...formData, satisfactionRating: value })}
        />

        <Rating
          label="Communication Rating"
          value={formData.communicationRating}
          onChange={(value) => setFormData({ ...formData, communicationRating: value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comments / Feedback
          </label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows="4"
            placeholder="Share your thoughts, concerns, or suggestions..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="issueFlagged"
            checked={formData.issueFlagged}
            onChange={(e) => setFormData({ ...formData, issueFlagged: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="issueFlagged" className="text-sm font-medium text-gray-700 cursor-pointer">
            Flag an issue that needs immediate attention
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}