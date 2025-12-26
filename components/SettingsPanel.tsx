
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { motion } from 'framer-motion';
import { ShieldCheck, LogIn, LogOut, Key, ExternalLink, HelpCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

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
    // Basic validity check
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
        error_callback: (err: any) => {
          console.error("GSI Error:", err);
          alert("Login failed. Check console for details.");
        }
      });
      client.requestAccessToken();
    } catch (err) {
      alert("Error initializing Google Identity. Check if Client ID is valid.");
    }
  };

  const handleLogout = () => {
    onUpdate({ ...settings, accessToken: '', tokenExpiry: 0 });
    setIsLoggedIn(false);
  };

  const saveClientId = () => {
    onUpdate({ ...settings, clientId });
    alert("Client ID saved. Ready to Login.");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Gmail API Setup</h2>
        <p className="text-sm text-slate-500">Professional Direct Integration</p>
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

        <div className="pt-2">
          {isLoggedIn ? (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="text-emerald-600" size={24} />
                 <div>
                    <div className="text-sm font-bold text-emerald-900">Authenticated</div>
                    <div className="text-[10px] text-emerald-600">Gmail API session is active</div>
                 </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-3 hover:bg-rose-50 rounded-xl transition-colors text-rose-500"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              <LogIn size={20} />
              Authorize Gmail API
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500 rounded-xl"><HelpCircle size={20}/></div>
             <h3 className="text-lg font-bold">Step-by-Step Guide</h3>
          </div>

          <ol className="space-y-4 text-sm text-slate-300 list-decimal ml-5 marker:text-indigo-400 marker:font-bold">
            <li>Go to <a href="https://console.cloud.google.com" target="_blank" className="text-white underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink size={12}/></a>.</li>
            <li>Enable the <strong>Gmail API</strong> in "APIs &amp; Services".</li>
            <li>Configure <strong>OAuth Consent Screen</strong> (Use "External").</li>
            <li>Under <strong>Credentials</strong>, click "Create Credentials" &gt; "OAuth client ID".</li>
            <li>Application type: <strong>Web application</strong>.</li>
            <li>Authorized JavaScript origins: <strong>Add your Vercel/App URL</strong>.</li>
            <li>Copy the <strong>Client ID</strong> and paste it here.</li>
          </ol>
          
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] leading-relaxed text-amber-200">
             <AlertTriangle size={14} className="inline mr-2 text-amber-400" />
             <strong>Important:</strong> If your project is in "Testing" mode, you MUST add your email to the "Test Users" list in the OAuth Consent Screen.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
