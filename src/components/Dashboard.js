import React, { useState, useEffect } from 'react';
import { RefreshCw, Phone, Clock, Calendar, Trash2, ChevronDown, ChevronUp, X, AlertTriangle, Info, Copy } from 'lucide-react';
import axios from 'axios';

const ReminderCard = ({ reminder, onCancel, onDelete }) => {
  const { id, medication, time, created_at, status } = reminder;

  const statusStyles = {
    scheduled: { icon: Clock, color: 'primary', bgColor: 'bg-primary/10', textColor: 'text-primary' },
    completed: { icon: Calendar, color: 'primary', bgColor: 'bg-primary/20', textColor: 'text-primary' },
    cancelled: { icon: X, color: 'accent', bgColor: 'bg-accent/10', textColor: 'text-accent' },
  };

  const { icon: Icon, color, bgColor, textColor } = statusStyles[status] || statusStyles.scheduled;

  return (
    <div className={`bg-surface rounded-lg shadow-subtle p-4 border border-primary/10 transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full ${bgColor}`}>
            <Icon size={20} className={`text-${color}`} />
          </div>
          <div>
            <p className="font-semibold text-text-primary">{medication}</p>
            <p className="text-sm text-text-secondary">Scheduled for: {time}</p>
          </div>
        </div>
        <div className="text-right">
          {status === 'scheduled' && (
            <button
              onClick={() => onCancel(id)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-accent bg-accent/10 rounded-full hover:bg-accent/20 transition-colors"
            >
              <X size={12} />
              Cancel
            </button>
          )}
          {(status === 'completed' || status === 'cancelled') && (
            <button
              onClick={() => onDelete(id)}
              className="p-1 text-accent hover:text-white hover:bg-accent rounded-full transition-colors"
              title="Delete reminder"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      <div className={`mt-2 pt-2 border-t border-surface flex justify-between items-center text-xs text-text-secondary`}>
        <span>Status: <span className={`font-medium ${textColor} capitalize`}>{status}</span></span>
        <span>Created: {new Date(created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [cancelledExpanded, setCancelledExpanded] = useState(false);
  const [deletedReminders, setDeletedReminders] = useState(new Set());
  const [cancellingReminders, setCancellingReminders] = useState(new Set());
  const [copied, setCopied] = useState(false);

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

  const handleCopy = () => {
    navigator.clipboard.writeText('+17193093515');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="p-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">Welcome back! Here are your medication reminders.</p>
        </div>
        <button
          onClick={fetchReminders}
          className="p-2 rounded-lg bg-surface shadow-subtle text-primary hover:bg-primary/10 transition-colors border border-primary/10"
          title="Refresh reminders"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-surface border-l-4 border-primary p-4 rounded-r-lg mb-8 flex items-center gap-4 shadow-subtle">
        <Phone size={24} className="text-primary" />
        <div>
          <p className="font-semibold text-primary">MedBuddy Assistant Phone Number</p>
          <div className="flex items-center gap-2">
            <span className="text-text-primary font-medium text-lg tracking-wide">+1 (719) 309-3515</span>
            <button onClick={handleCopy} className="p-1 rounded-md hover:bg-primary/10 transition-colors">
              <Copy size={14} className="text-primary" />
            </button>
            {copied && <span className="text-xs text-primary">Copied!</span>}
          </div>
        </div>
      </div>

      {/* Active Reminders */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Clock className="text-primary" size={20} />
          Active Reminders ({activeReminders.length})
        </h2>
        {activeReminders.length > 0 ? (
          <div className="space-y-3">
            {activeReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} onCancel={handleCancel} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-surface rounded-lg shadow-subtle border border-primary/10">
             <Info size={32} className="mx-auto text-primary" />
             <p className="mt-2 text-text-secondary">No active reminders.</p>
          </div>
        )}
      </div>

      {/* Collapsible Sections */}
      <div>
        {/* Completed Reminders */}
        <div className="mb-4">
          <button
            onClick={() => setCompletedExpanded(!completedExpanded)}
            className="w-full flex justify-between items-center p-4 rounded-lg bg-surface shadow-subtle hover:bg-primary/10 transition-colors border border-primary/10"
          >
            <div className="flex items-center gap-2 font-semibold text-text-primary">
              <Calendar className="text-primary" size={20} />
              Completed ({completedReminders.length})
            </div>
            {completedExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {completedExpanded && (
            <div className="p-4 bg-surface rounded-b-lg shadow-inner border-t border-primary/10">
              {completedReminders.length > 0 ? (
                 <div className="space-y-3">
                  {completedReminders.map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} onCancel={handleCancel} onDelete={handleDelete} />
                  ))}
                </div>
              ) : <p className="text-text-secondary">No completed reminders yet.</p>}
            </div>
          )}
        </div>

        {/* Cancelled Reminders */}
        <div>
          <button
            onClick={() => setCancelledExpanded(!cancelledExpanded)}
            className="w-full flex justify-between items-center p-4 rounded-lg bg-surface shadow-subtle hover:bg-primary/10 transition-colors border border-primary/10"
          >
            <div className="flex items-center gap-2 font-semibold text-text-primary">
              <X className="text-accent" size={20} />
              Cancelled ({cancelledReminders.length})
            </div>
            {cancelledExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {cancelledExpanded && (
            <div className="p-4 bg-surface rounded-b-lg shadow-inner border-t border-primary/10">
              {cancelledReminders.length > 0 ? (
                <div className="space-y-3">
                  {cancelledReminders.map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} onCancel={handleCancel} onDelete={handleDelete} />
                  ))}
                </div>
              ) : <p className="text-text-secondary">No cancelled reminders.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 