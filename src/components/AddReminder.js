import React, { useState } from 'react';
import { Pill, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';

const AddReminder = () => {
  const [formData, setFormData] = useState({
    medication: '',
    time: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.medication.trim() || !formData.time.trim()) {
      setError('Please fill in both fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post('/api/save_reminder', formData);
      setSuccess(true);
      setFormData({ medication: '', time: '' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to schedule reminder. Please try again.');
      console.error('Error scheduling reminder:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Pill className="text-blue-500" size={28} />
            Add Reminder
          </h1>
          <p className="text-gray-600 mt-2">Schedule a new medication reminder</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle size={20} />
              <span className="font-medium">Reminder scheduled successfully!</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="medication" className="block text-sm font-medium text-gray-700 mb-2">
                💊 Medication Name
              </label>
              <input
                type="text"
                id="medication"
                name="medication"
                value={formData.medication}
                onChange={handleChange}
                placeholder="e.g., Aspirin, Vitamin D"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                ⏰ Time
              </label>
              <input
                type="text"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                placeholder="e.g., 8 PM, 20:00, 2024-01-15 20:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* Time Format Examples */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Time Format Examples:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                <div>• 8 PM</div>
                <div>• 20:00</div>
                <div>• 2024-01-15 20:00</div>
                <div>• Tomorrow 9 AM</div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Scheduling...
                </>
              ) : (
                <>
                  <Clock size={16} />
                  Schedule Reminder
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddReminder; 