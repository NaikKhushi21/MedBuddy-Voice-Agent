import React, { useState, useEffect } from 'react';
import { RefreshCw, Phone, Clock, Calendar, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [deletedReminders, setDeletedReminders] = useState(new Set());
  const [cancellingReminders, setCancellingReminders] = useState(new Set());

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/reminders');
      setReminders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch reminders');
      console.error('Error fetching reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();

    // Establish WebSocket connection
    const ws = new WebSocket(`ws://${window.location.host.replace(':3000', ':8000')}/ws`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.event === 'reminders_updated') {
        setReminders(message.data);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup on component unmount
    return () => {
      ws.close();
    };
  }, []);

  const handleDelete = async (reminderId) => {
    try {
      await axios.delete(`/reminders/${reminderId}`);
      setDeletedReminders(prev => new Set([...prev, reminderId]));
      setReminders(prev => prev.filter(r => r.id !== reminderId));
    } catch (err) {
      console.error('Error deleting reminder:', err);
    }
  };

  const handleCancel = async (reminderId) => {
    try {
      setCancellingReminders(prev => new Set([...prev, reminderId]));
      await axios.post(`/reminders/${reminderId}/cancel`);
      // Update the reminder status locally
      setReminders(prev => prev.map(r => 
        r.id === reminderId ? { ...r, status: 'cancelled' } : r
      ));
    } catch (err) {
      console.error('Error cancelling reminder:', err);
    } finally {
      setCancellingReminders(prev => {
        const newSet = new Set(prev);
        newSet.delete(reminderId);
        return newSet;
      });
    }
  };

  const activeReminders = reminders.filter(r => r.status === 'scheduled');
  const completedReminders = reminders.filter(r => r.status === 'completed' && !deletedReminders.has(r.id));
  const cancelledReminders = reminders.filter(r => r.status === 'cancelled' && !deletedReminders.has(r.id));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Clock className="text-yellow-500" size={16} />;
      case 'completed': return <Calendar className="text-green-500" size={16} />;
      case 'cancelled': return <X className="text-red-500" size={16} />;
      default: return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-yellow-600';
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Medication Reminders</h1>
        <button
          onClick={fetchReminders}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Call MedBuddy Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-blue-800">
          <Phone size={20} />
          <span className="font-medium">Call MedBuddy</span>
        </div>
        <p className="text-blue-700 mt-1">To set a reminder by voice, call your MedBuddy assistant directly.</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-blue-800 font-semibold">📞 +1 (719) 309-3515</span>
          <button
            onClick={() => navigator.clipboard.writeText('+1 (719) 309-3515')}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
            title="Copy phone number"
          >
            Copy
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Active Reminders */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="text-yellow-500" size={20} />
          Active Reminders
        </h2>
        
        {activeReminders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-gray-500">No active reminders found. Call MedBuddy to set your first reminder!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeReminders.map((reminder) => (
              <div key={reminder.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(reminder.status)}
                      <span className="font-medium text-gray-800">{reminder.medication}</span>
                    </div>
                    <div className="text-gray-600">at {reminder.time}</div>
                    <div className="text-sm text-gray-500">
                      Created: {formatDate(reminder.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm capitalize ${getStatusColor(reminder.status)}`}>
                      {reminder.status}
                    </span>
                    <button
                      onClick={() => handleCancel(reminder.id)}
                      disabled={cancellingReminders.has(reminder.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Cancel reminder"
                    >
                      {cancellingReminders.has(reminder.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <X size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-4 hover:text-gray-600 transition-colors"
          >
            <Calendar className="text-green-500" size={20} />
            Completed Reminders ({completedReminders.length})
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {expanded && (
            <div className="space-y-3">
              {completedReminders.map((reminder) => (
                <div key={reminder.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(reminder.status)}
                        <span className="font-medium text-gray-800">{reminder.medication}</span>
                      </div>
                      <div className="text-gray-600">at {reminder.time}</div>
                      <div className="text-sm text-gray-500">
                        Created: {formatDate(reminder.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${getStatusColor(reminder.status)}`}>completed</span>
                      <button
                        onClick={() => handleDelete(reminder.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Delete reminder"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancelled Reminders */}
      {cancelledReminders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <X className="text-red-500" size={20} />
            Cancelled Reminders ({cancelledReminders.length})
          </h2>
          <div className="space-y-3">
            {cancelledReminders.map((reminder) => (
              <div key={reminder.id} className="bg-white rounded-lg border border-gray-200 p-4 opacity-75">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(reminder.status)}
                      <span className="font-medium text-gray-800 line-through">{reminder.medication}</span>
                    </div>
                    <div className="text-gray-600">at {reminder.time}</div>
                    <div className="text-sm text-gray-500">
                      Created: {formatDate(reminder.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getStatusColor(reminder.status)}`}>cancelled</span>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Delete reminder"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 