
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Settings, Bell, ChevronLeft, Trash2, Plus, PieChart as PieChartIcon, Sparkles } from 'lucide-react';
import VoiceRecorder from './components/VoiceRecorder';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Onboarding from './components/Onboarding';
import EditLogModal from './components/EditLogModal';
import HistoryPage from './components/HistoryPage';
import SettingsPage from './components/SettingsPage';
import { Storage } from './services/storage';
import { generateHealthTip, generateDailyAnalysis } from './services/geminiService';
import { FoodLog, HealthTip, Reminder, UserSettings as IUserSettings } from './types';
import { format } from 'date-fns';

// --- COMPONENTS FOR ROUTES ---

const DashboardPage: React.FC<{
  logs: FoodLog[];
  settings: IUserSettings;
  healthTip: HealthTip | null;
  addLog: (log: FoodLog) => void;
  onRefreshAnalysis: () => void;
}> = ({ logs, settings, healthTip, addLog, onRefreshAnalysis }) => (
  <div className="pb-28 pt-6 px-4 max-w-md mx-auto">
    <header className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-normal text-onSurface">Hi, {settings.name}</h1>
        <p className="text-onSurface-variant text-sm mt-1">{format(new Date(), 'EEEE, MMM do')}</p>
      </div>
      <Link to="/reminders" className="p-3 bg-surface-container hover:bg-surface-variant rounded-full transition-colors text-onSurface-variant">
        <Bell size={24} />
      </Link>
    </header>

    <VoiceRecorder onLogAdded={addLog} />
    
    <div className="mt-8">
      <div className="flex justify-between items-end mb-2">
         {/* Hidden trigger for analysis for now, mostly handled by health tip logic but can be explicit */}
      </div>
      <Dashboard logs={logs} settings={settings} healthTip={healthTip} />
      
      {/* Explicit AI Analysis Button */}
      <div className="mt-6">
          <button 
             onClick={onRefreshAnalysis}
             className="w-full bg-surface-bright border border-outline/10 p-4 rounded-2xl flex items-center justify-center gap-2 text-primary text-sm font-medium hover:bg-surface-container transition-colors shadow-sm"
          >
             <Sparkles size={16} />
             Get Daily AI Analysis
          </button>
      </div>
    </div>
  </div>
);

const RemindersPage: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(Storage.getReminders());
  const [newTime, setNewTime] = useState('09:00');
  const [newTitle, setNewTitle] = useState('Drink Water');

  const addReminder = () => {
    const r: Reminder = {
      id: crypto.randomUUID(),
      title: newTitle,
      time: newTime,
      enabled: true
    };
    const updated = [...reminders, r];
    setReminders(updated);
    Storage.saveReminders(updated);
    
    if (Notification.permission !== 'granted') Notification.requestPermission();
  };

  const toggleReminder = (id: string) => {
    const updated = reminders.map(r => r.id === id ? {...r, enabled: !r.enabled} : r);
    setReminders(updated);
    Storage.saveReminders(updated);
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    Storage.saveReminders(updated);
  };

  return (
    <div className="pb-28 pt-6 px-4 max-w-md mx-auto">
       <header className="mb-6 flex items-center gap-4">
         <Link to="/" className="p-2 rounded-full hover:bg-surface-variant text-onSurface"><ChevronLeft /></Link>
         <h1 className="text-2xl font-normal text-onSurface">Reminders</h1>
       </header>

       <div className="bg-surface-container p-6 rounded-[28px] mb-6">
         <h3 className="font-medium mb-4 text-onSurface">Add Reminder</h3>
         <div className="flex flex-col gap-3">
           <input 
             type="text" 
             value={newTitle} 
             onChange={(e) => setNewTitle(e.target.value)}
             className="border border-outline/20 bg-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
             placeholder="Reminder title"
           />
           <div className="flex gap-2">
             <input 
               type="time" 
               value={newTime} 
               onChange={(e) => setNewTime(e.target.value)}
               className="flex-1 border border-outline/20 bg-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
             />
             <button onClick={addReminder} className="bg-primary text-white px-6 rounded-xl shadow-sm active:scale-95 transition-transform">
               <Plus size={24} />
             </button>
           </div>
         </div>
       </div>

       <div className="space-y-3">
         {reminders.map(r => (
           <div key={r.id} className="flex items-center justify-between bg-surface-bright p-4 rounded-2xl border border-outline/10">
              <div>
                <div className="font-medium text-onSurface text-base">{r.title}</div>
                <div className="text-sm text-primary font-medium mt-1">{r.time}</div>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox" 
                  checked={r.enabled} 
                  onChange={() => toggleReminder(r.id)}
                  className="w-6 h-6 accent-primary rounded-md"
                />
                <button onClick={() => deleteReminder(r.id)} className="text-outline hover:text-error">
                  <Trash2 size={20} />
                </button>
              </div>
           </div>
         ))}
       </div>
    </div>
  );
};

const Navigation: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Material 3 Navigation Bar style
  const NavItem = ({ to, icon: Icon, label, active }: any) => (
    <Link to={to} className="flex flex-col items-center gap-1 w-16 group">
      <div className={`w-16 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${active ? 'bg-primary-container' : 'group-hover:bg-surface-variant'}`}>
        <Icon size={20} className={active ? 'text-primary-onContainer' : 'text-onSurface-variant'} />
      </div>
      <span className={`text-xs font-medium tracking-wide ${active ? 'text-onSurface' : 'text-onSurface-variant'}`}>
        {label}
      </span>
    </Link>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface-container h-20 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-evenly items-center h-full max-w-md mx-auto">
        <NavItem to="/" icon={LayoutDashboard} label="Daily" active={isActive('/')} />
        <NavItem to="/analytics" icon={PieChartIcon} label="Track" active={isActive('/analytics')} />
        <NavItem to="/history" icon={History} label="Logs" active={isActive('/history')} />
        <NavItem to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [settings, setSettings] = useState<IUserSettings>(Storage.getSettings());
  const [healthTip, setHealthTip] = useState<HealthTip | null>(null);
  const [editingLog, setEditingLog] = useState<FoodLog | null>(null);

  // Initialize Data
  useEffect(() => {
    setLogs(Storage.getLogs());
    const savedTip = Storage.getHealthTip();
    
    // Check if tip is from today
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (savedTip && savedTip.date === todayStr) {
      setHealthTip(savedTip);
    } else {
      // Generate new tip if undefined or old
      const currentLogs = Storage.getLogs();
      const todayLogs = currentLogs.filter(l => format(new Date(l.timestamp), 'yyyy-MM-dd') === todayStr);
      if (settings.isOnboardingComplete) {
        generateHealthTip(todayLogs, settings).then(tipText => {
          const newTip: HealthTip = { date: todayStr, tip: tipText, category: 'general' };
          setHealthTip(newTip);
          Storage.saveHealthTip(newTip);
        });
      }
    }
  }, [settings.isOnboardingComplete]);

  const handleAddLog = (log: FoodLog) => {
    const updated = Storage.addLog(log);
    setLogs(updated);
  };

  const handleUpdateLog = (log: FoodLog) => {
    const updated = Storage.updateLog(log);
    setLogs(updated);
  };

  const handleDeleteLog = (id: string) => {
    const updated = Storage.deleteLog(id);
    setLogs(updated);
  };

  const handleSettingsUpdate = (newSettings: IUserSettings) => {
    Storage.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const triggerDailyAnalysis = async () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayLogs = logs.filter(l => format(new Date(l.timestamp), 'yyyy-MM-dd') === todayStr);
    
    // Show a temporary loading tip
    setHealthTip({ date: todayStr, tip: "Analyzing your day... please wait!", category: 'general' });
    
    const analysis = await generateDailyAnalysis(todayLogs, settings);
    const newTip: HealthTip = { date: todayStr, tip: analysis, category: 'general' };
    setHealthTip(newTip);
    Storage.saveHealthTip(newTip);
  };

  if (!settings.isOnboardingComplete) {
    return <Onboarding onComplete={handleSettingsUpdate} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-surface font-sans text-onSurface pb-10">
        <Routes>
          <Route path="/" element={
            <DashboardPage 
                logs={logs} 
                settings={settings} 
                healthTip={healthTip} 
                addLog={handleAddLog} 
                onRefreshAnalysis={triggerDailyAnalysis}
            />
          } />
          <Route path="/analytics" element={
            <Analytics logs={logs} settings={settings} />
          } />
          <Route path="/history" element={
            <HistoryPage 
                logs={logs} 
                deleteLog={handleDeleteLog} 
                editLog={(log) => setEditingLog(log)}
            />
          } />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/settings" element={
             <SettingsPage settings={settings} onUpdate={handleSettingsUpdate} />
          } />
        </Routes>
        <Navigation />

        {editingLog && (
            <EditLogModal 
                log={editingLog} 
                onClose={() => setEditingLog(null)} 
                onSave={handleUpdateLog} 
            />
        )}
      </div>
    </Router>
  );
};

export default App;
