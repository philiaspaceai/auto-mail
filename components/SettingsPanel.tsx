
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Key, LogIn, LogOut, ExternalLink, HelpCircle, CheckCircle } from 'lucide-react';

interface Props {
  settings: AppSettings;
  onUpdate: (s: AppSettings) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

const SettingsPanel: React.FC<Props> = ({ settings, onUpdate }) => {
  const [clientId, setClientId] = useState(settings.clientId || '');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if token is still valid
    if (settings.accessToken && settings.tokenExpiry > Date.now()) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [settings]);

  const handleLogin = () => {
    if (!clientId) {
      alert("Please enter your Google Client ID first.");
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/gmail.send',
        callback: (response: any) => {
          if (response.access_token) {
            onUpdate({
              clientId,
              accessToken: response.access_token,
              tokenExpiry: Date.now() + (response.expires_in * 1000)
            });
            setIsLoggedIn(true);
          }
        },
      });
      client.requestAccessToken();
    } catch (err) {
      alert("Error initializing Google Login. Make sure Client ID is correct.");
    }
  };

  const handleLogout = () => {
    onUpdate({ ...settings, accessToken: '', tokenExpiry: 0 });
    setIsLoggedIn(false);
  };

  const saveClientId = () => {
    onUpdate({ ...settings, clientId });
    alert("Client ID saved. Now you can Login.");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Gmail Engine Setup</h2>
        <p className="text-sm text-slate-500">Directly connect to Google's mailing system</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 ml-1">
            <Key size={12} /> Google Client ID
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              placeholder="12345678-abc.apps.googleusercontent.com"
              className="flex-1 bg-slate-50 border-slate-200 border p-4 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-mono text-xs"
              value={clientId}
              onChange={e => setClientId(e.target.value)}
            />
            <button 
              onClick={saveClientId}
              className="px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Save ID
            </button>
          </div>
        </div>

        <div className="pt-4 flex flex-col items-center">
          {isLoggedIn ? (
            <div className="w-full space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                 <ShieldCheck className="text-emerald-600" size={24} />
                 <div>
                    <div className="text-sm font-bold text-emerald-900">Authenticated</div>
                    <div className="text-[10px] text-emerald-600">You are connected to Gmail API</div>
                 </div>
                 <button 
                  onClick={handleLogout}
                  className="ml-auto p-2 hover:bg-emerald-100 rounded-xl transition-colors text-emerald-700"
                  title="Logout"
                 >
                   <LogOut size={18} />
                 </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
            >
              <LogIn size={20} />
              Login with Google
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500 rounded-xl"><HelpCircle size={20}/></div>
             <h3 className="text-lg font-bold">How to get Client ID?</h3>
          </div>

          <ol className="space-y-4 text-sm text-slate-300 list-decimal ml-5 marker:text-indigo-400 marker:font-bold">
            <li>Go to <a href="https://console.cloud.google.com" target="_blank" className="text-white underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink size={12}/></a>.</li>
            <li>Create a <strong>New Project</strong>.</li>
            <li>Search for "Gmail API" and click <strong>Enable</strong>.</li>
            <li>Go to <strong>APIs & Services > OAuth consent screen</strong>. Select "External", set your email.</li>
            <li>Go to <strong>Credentials > Create Credentials > OAuth client ID</strong>.</li>
            <li>Application type: <strong>Web application</strong>.</li>
            <li>Authorized JavaScript origins: <strong>Add the current URL of this app</strong>.</li>
            <li>Copy the <strong>Client ID</strong> and paste it here.</li>
          </ol>
          
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] leading-relaxed text-amber-200">
             <AlertTriangle size={14} className="inline mr-2 text-amber-400" />
             <strong>Note:</strong> Tokens expire every 60 minutes. If your emails aren't sending, just click "Login with Google" again here.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
