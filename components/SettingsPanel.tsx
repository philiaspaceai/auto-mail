
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  Key, 
  ExternalLink, 
  CheckCircle2, 
  Globe, 
  Settings2,
  AlertCircle,
  UserPlus,
  Rocket
} from 'lucide-react';

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
          if (err.type === 'popup_closed') return;
          alert("Login Failed. Please ensure your email is added to 'Test Users' in Step 5.");
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
    alert("Configuration saved.");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 px-2">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
          <Settings2 size={24} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">System Configuration</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Set up your Gmail API credentials to enable sending.</p>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
              <Key size={14} className="text-slate-300" /> Google OAuth Client ID
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                placeholder="0000000000-xxxx.apps.googleusercontent.com"
                className="flex-1 bg-slate-50 border-slate-200 border px-5 py-4 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-mono text-xs sm:text-sm transition-all"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
              />
              <button 
                onClick={saveClientId}
                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 whitespace-nowrap"
              >
                Save ID
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            {isLoggedIn ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <div className="flex items-center gap-4 overflow-hidden">
                   <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                      <ShieldCheck size={20} />
                   </div>
                   <div className="overflow-hidden">
                      <div className="font-bold text-emerald-900 text-sm">Verified</div>
                      <div className="text-[10px] text-emerald-600 truncate">Session is active.</div>
                   </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-rose-400 hover:text-rose-600 flex items-center gap-1 font-bold text-xs shrink-0"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98]"
              >
                <LogIn size={20} />
                Authorize via Google
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Standard Setup Guide Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-800">Setup Guide</h3>
        
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-z-10 before:h-full before:w-0.5 before:bg-slate-100">
          
          {/* Step 1 */}
          <div className="relative flex gap-6">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border-2 border-slate-100 text-slate-400 font-bold text-sm">1</div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">Create Project</h4>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Open <a href="https://console.cloud.google.com" target="_blank" className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1">Google Console <ExternalLink size={12}/></a> and create a new project.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex gap-6">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border-2 border-slate-100 text-slate-400 font-bold text-sm">2</div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">Enable Gmail API</h4>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Go to <strong>Library</strong>, search for <strong>Gmail API</strong>, and click <strong>Enable</strong>.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex gap-6">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border-2 border-slate-100 text-slate-400 font-bold text-sm">3</div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">OAuth Consent</h4>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Set User Type to <strong>External</strong>. Fill in App Name and emails, then save.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative flex gap-6">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border-2 border-slate-100 text-slate-400 font-bold text-sm">4</div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">Credentials</h4>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Create <strong>OAuth client ID</strong> as <strong>Web application</strong>. 
                Under <strong>Authorized JavaScript Origins</strong>, add this URL:
              </p>
              <div className="mt-2 p-3 bg-slate-100 rounded-lg border border-slate-200 font-mono text-[11px] sm:text-xs text-indigo-700 font-bold break-all">
                https://auto-mail-lilac.vercel.app
              </div>
              <p className="mt-1 text-[10px] text-slate-400 italic font-medium">* No slash (/) at the end.</p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="relative flex gap-6">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm">5</div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                Register Test User <CheckCircle2 size={16} className="text-indigo-600" />
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                On the <strong>OAuth consent screen</strong>, scroll to <strong>Test users</strong>. Click <strong>+ ADD USERS</strong> and enter your Gmail:
              </p>
              <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100 font-mono text-[11px] sm:text-xs text-indigo-600 font-bold break-all">
                your-email@gmail.com
              </div>
              <p className="mt-2 text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <AlertCircle size={12} /> This step is mandatory for testing!
              </p>
            </div>
          </div>

          {/* Step 6 */}
          <div className="relative flex gap-6">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-sm">6</div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                Apply & Authorize <Rocket size={16} className="text-amber-500" />
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Copy the <strong>Client ID</strong> you just created, then paste it into the <strong>Google OAuth Client ID</strong> field at the top of this page. Click the <strong>Save ID</strong> button, followed by <strong>Authorize via Google</strong> to begin your application process!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Footer */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-start gap-4">
        <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed opacity-80">
          <strong>Important:</strong> If you get a "403 Access Blocked" error, double-check that your email is registered exactly in <strong>Step 5</strong> and the URL in <strong>Step 4</strong> has no typo.
        </p>
      </div>
    </div>
  );
};

export default SettingsPanel;
