
import React, { useState, useEffect, useCallback } from 'react';
import { storage } from './services/storageService';
import { Template, Batch, AppSettings } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Users, Send, Settings as SettingsIcon } from 'lucide-react';

// Components
import TemplateManager from './components/TemplateManager';
import BatchManager from './components/BatchManager';
import SendDashboard from './components/SendDashboard';
import SettingsPanel from './components/SettingsPanel';

enum Tab {
  Templates = 'templates',
  Batches = 'batches',
  Send = 'send',
  Settings = 'settings',
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Templates);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ clientId: '', accessToken: '', tokenExpiry: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        await storage.init();
        const [loadedTemplates, loadedBatches, loadedSettings] = await Promise.all([
          storage.getTemplates(),
          storage.getBatches(),
          storage.getSettings(),
        ]);
        setTemplates(loadedTemplates);
        setBatches(loadedBatches);
        if (loadedSettings) {
          // Explicitly map settings to handle potential missing fields in older storage
          setSettings({
            clientId: loadedSettings.clientId || '',
            accessToken: loadedSettings.accessToken || '',
            tokenExpiry: loadedSettings.tokenExpiry || 0
          });
        }
      } catch (error) {
        console.error("Failed to initialize app data", error);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  const refreshData = useCallback(async () => {
    const [t, b] = await Promise.all([storage.getTemplates(), storage.getBatches()]);
    setTemplates(t);
    setBatches(b);
  }, []);

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    await storage.saveSettings(newSettings);
    setSettings(newSettings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
          </div>
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Initializing JobApp Mailer...</p>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: Tab.Templates, icon: FileText, label: 'Templates' },
    { id: Tab.Batches, icon: Users, label: 'Batches' },
    { id: Tab.Send, icon: Send, label: 'Send' },
    { id: Tab.Settings, icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="max-w-4xl mx-auto min-h-screen flex flex-col pt-6 px-4 pb-28 sm:pb-8">
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 flex justify-between items-end"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            JobApp Mailer
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Direct Gmail API Edition</p>
        </div>
        <div className="hidden sm:block">
           <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">V3.0 API</span>
        </div>
      </motion.header>

      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8 min-h-[60vh]"
          >
            {activeTab === Tab.Templates && <TemplateManager templates={templates} onUpdate={refreshData} />}
            {activeTab === Tab.Batches && <BatchManager batches={batches} onUpdate={refreshData} />}
            {activeTab === Tab.Send && <SendDashboard templates={templates} batches={batches} settings={settings} />}
            {activeTab === Tab.Settings && <SettingsPanel settings={settings} onUpdate={handleUpdateSettings} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg glass-effect border border-white/50 shadow-2xl rounded-full p-2 flex justify-between z-50 sm:relative sm:bottom-auto sm:left-auto sm:translate-x-0 sm:w-full sm:mt-12 sm:max-w-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center justify-center py-3 px-4 sm:px-8 rounded-full transition-all duration-300 group flex-1 ${
                isActive ? 'text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200"
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                />
              )}
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <Icon size={20} className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                <span className="text-[10px] sm:text-sm font-bold tracking-tight uppercase sm:capitalize">{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default App;
