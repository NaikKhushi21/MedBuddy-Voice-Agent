import React, { useState } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, AlertTriangle } from 'lucide-react';

const AddReminder = () => {
  const [medication, setMedication] = useState('');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', content: '' });

    try {
      await axios.post('/api/save_reminder', { medication, time });
      setMessage({ type: 'success', content: 'Reminder added successfully!' });
      setMedication('');
      setTime('');
    } catch (error) {
      setMessage({ type: 'error', content: 'Failed to add reminder. Please try again.' });
      console.error('Error adding reminder:', error);
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage({ type: '', content: '' }), 4000);
    }
  };

  return (
    <div className="p-8 flex items-center justify-center bg-background min-h-screen">
      <div className="max-w-md w-full">
        <div className="bg-surface rounded-xl shadow-lg p-8 border border-primary/10">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-primary p-3 rounded-full mb-3">
              <Plus size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Add New Reminder</h1>
            <p className="text-text-secondary mt-1">Fill in the details below to add a new medication reminder.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="medication" className="block text-sm font-medium text-text-primary mb-1">
                Medication Name
              </label>
              <input
                id="medication"
                type="text"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                placeholder="e.g., Ibuprofen"
                required
                className="w-full px-4 py-2 bg-background border border-surface rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-text-primary mb-1">
                Time (HH:MM)
              </label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-4 py-2 bg-background border border-surface rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Add Reminder'}
              <Plus size={18} />
            </button>
          </form>

          {message.content && (
            <div className={`mt-6 p-3 rounded-lg flex items-center gap-3 text-sm ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
              <span>{message.content}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddReminder; 