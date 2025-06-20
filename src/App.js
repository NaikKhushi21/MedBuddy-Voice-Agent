import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Pill, Plus, MessageSquare, LayoutDashboard } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AddReminder from './components/AddReminder';
import Chat from './components/Chat';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <AppContent />
      </div>
    </Router>
  );
}

function AppContent() {
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'add-reminder', label: 'Add Reminder', icon: Plus, path: '/add-reminder' },
    { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/chat' },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-surface shadow-lg flex flex-col border-r border-primary/10">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Pill className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-text-primary">
              MedBuddy
            </h1>
          </div>
        </div>
        
        <nav className="mt-4 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <a 
                href={item.path}
                key={item.id}
                className={`flex items-center gap-3 px-6 mx-4 my-1 py-2.5 rounded-lg text-left transition-all duration-200 ease-in-out font-medium ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:bg-primary/20 hover:text-primary'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm">{item.label}</span>
              </a>
            );
          })}
        </nav>
        <div className="p-4">
          <div className="bg-background rounded-lg p-4 text-center border border-surface">
            <p className="text-sm text-text-secondary">Having trouble?</p>
            <a href="#" className="text-sm font-medium text-primary hover:underline">
              Contact Support
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate replace to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-reminder" element={<AddReminder />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 