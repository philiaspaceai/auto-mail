
import React, { useState, useMemo } from 'react';
import { Template, Batch, SendStatus, Recipient, AppSettings } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Send, ChevronRight, FileText, LayoutList, AlertCircle, Info, ShieldAlert } from 'lucide-react';

interface Props {
  templates: Template[];
  batches: Batch[];
  settings: AppSettings;
}

const SendDashboard: React.FC<Props> = ({ templates, batches, settings }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [sendingStatus, setSendingStatus] = useState<Record<string, SendStatus>>({});
  const [isSending, setIsSending] = useState(false);

  const selectedTemplate = useMemo(() => templates.find(t => t.id === selectedTemplateId), [templates, selectedTemplateId]);
  const selectedBatch = useMemo(() => batches.find(b => b.id === selectedBatchId), [batches, selectedBatchId]);

  const replacePlaceholders = (text: string, recipient: Recipient) => {
    return text.replace(/\{\{company\}\}/g, recipient.company);
  };

  const completedCount = useMemo(() => 
    (Object.values(sendingStatus) as SendStatus[]).filter(s => s.status === 'success').length, 
  [sendingStatus]);

  const totalCount = selectedBatch?.recipients.length || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Function to build a raw MIME message
  const createMimeMessage = (to: string, subject: string, body: string, attachments: any[]) => {
    const boundary = "job_app_mailer_boundary_" + Date.now();
    let email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      body,
      ''
    ];

    attachments.forEach(att => {
      email.push(`--${boundary}`);
      email.push(`Content-Type: ${att.mimeType}; name="${att.name}"`);
      email.push(`Content-Disposition: attachment; filename="${att.name}"`);
      email.push('Content-Transfer-Encoding: base64');
      email.push('');
      email.push(att.data);
      email.push('');
    });

    email.push(`--${boundary}--`);
    
    // Base64 encode the whole message according to Gmail API specs
    return btoa(unescape(encodeURIComponent(email.join('\r\n'))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const startSending = async () => {
    if (!settings.accessToken || settings.tokenExpiry < Date.now()) {
      alert('Your session has expired or you are not logged in. Please go to Settings and Login with Google.');
      return;
    }
    if (!selectedTemplate || !selectedBatch) return;

    if (!confirm(`Ready to send ${selectedBatch.recipients.length} applications? This will use your Gmail account directly.`)) return;

    setIsSending(true);
    const initialStatus: Record<string, SendStatus> = {};
    selectedBatch.recipients.forEach(r => {
      initialStatus[r.id] = { recipientId: r.id, status: 'pending' };
    });
    setSendingStatus(initialStatus);

    for (const recipient of selectedBatch.recipients) {
      setSendingStatus(prev => ({ 
        ...prev, 
        [recipient.id]: { ...prev[recipient.id], status: 'sending' } 
      }));

      try {
        const subject = replacePlaceholders(selectedTemplate.subject, recipient);
        const body = replacePlaceholders(selectedTemplate.content, recipient);
        const rawMessage = createMimeMessage(
          recipient.email, 
          subject, 
          body, 
          selectedTemplate.attachments || []
        );

        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ raw: rawMessage })
        });

        if (response.ok) {
          setSendingStatus(prev => ({ 
            ...prev, 
            [recipient.id]: { ...prev[recipient.id], status: 'success' } 
          }));
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Gmail API Error");
        }

      } catch (error: any) {
        console.error("Gmail Send Error:", error);
        setSendingStatus(prev => ({ 
          ...prev, 
          [recipient.id]: { 
            ...prev[recipient.id], 
            status: 'error', 
            error: error.message 
          } 
        }));
      }
      
      // Minor delay to prevent rate issues
      await new Promise(r => setTimeout(r, 800));
    }
    
    setIsSending(false);
    alert('Process complete. Check your results below.');
  };

  const isTokenValid = settings.accessToken && settings.tokenExpiry > Date.now();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Blast Terminal</h2>
          <p className="text-sm text-slate-500">Secure Direct-to-Gmail Delivery</p>
        </div>
        {!isTokenValid && (
          <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-[10px] font-bold flex items-center gap-2 border border-rose-200">
            <ShieldAlert size={14} /> Session Expired
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 ml-1">
            <FileText size={12} /> Template
          </label>
          <div className="relative">
             <select 
               disabled={isSending}
               className="w-full bg-white border-slate-200 border p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold text-slate-700 disabled:opacity-50"
               value={selectedTemplateId}
               onChange={e => { setSelectedTemplateId(e.target.value); setSendingStatus({}); }}
             >
               <option value="">-- Choose Template --</option>
               {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
             </select>
             <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 ml-1">
            <LayoutList size={12} /> Target Group
          </label>
          <div className="relative">
            <select 
              disabled={isSending}
              className="w-full bg-white border-slate-200 border p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold text-slate-700 disabled:opacity-50"
              value={selectedBatchId}
              onChange={e => { setSelectedBatchId(e.target.value); setSendingStatus({}); }}
            >
              <option value="">-- Choose Batch --</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.recipients.length})</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" />
          </div>
        </div>
      </div>

      {(isSending || Object.keys(sendingStatus).length > 0) && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex justify-between items-end mb-4">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-indigo-400 tracking-widest">Gmail API Queue</div>
                      <div className="text-2xl font-black">{completedCount} / {totalCount}</div>
                    </div>
                    <div className="text-xs font-bold text-emerald-400">{Math.round(progressPercent)}% Sent</div>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      className="h-full bg-emerald-500"
                    />
                </div>
             </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden divide-y divide-slate-50 max-h-[400px] overflow-y-auto shadow-inner">
            {selectedBatch?.recipients.map((r, i) => {
              const s = sendingStatus[r.id];
              return (
                <div key={r.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-100">{i+1}</div>
                    <div>
                      <div className="text-sm font-bold text-slate-700">{r.company}</div>
                      <div className="text-[10px] text-slate-400">{r.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {s?.status === 'sending' && <Loader2 size={14} className="animate-spin text-indigo-500" />}
                    {s?.status === 'success' && <div className="text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-emerald-100">Delivered</div>}
                    {s?.status === 'error' && (
                      <div className="group relative">
                        <div className="text-rose-500 bg-rose-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-rose-100 flex items-center gap-1 cursor-help">
                          <XCircle size={12} /> Error
                        </div>
                        <div className="hidden group-hover:block absolute bottom-full right-0 mb-2 w-48 bg-rose-600 text-white text-[9px] p-2 rounded-lg shadow-xl z-20">
                          {s.error}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <motion.button
        disabled={isSending || !selectedTemplate || !selectedBatch || !isTokenValid}
        onClick={startSending}
        className={`w-full py-5 rounded-[2rem] font-black text-xl shadow-2xl transition-all relative overflow-hidden group ${
          isSending || !selectedTemplate || !selectedBatch || !isTokenValid
            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
           {isSending ? (
             <>Sending via Gmail... <Loader2 className="animate-spin" /></>
           ) : (
             <>Blast via Gmail API <Send size={22} /></>
           )}
        </span>
      </motion.button>

      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3">
         <Info size={18} className="text-indigo-400 shrink-0 mt-0.5" />
         <div className="text-[11px] text-indigo-700 leading-relaxed">
            <strong>Professional Mode:</strong> Your emails are sent directly through Gmail's official API. 
            Success status is 100% accurate. You will find all sent emails in your Gmail <strong>Sent</strong> folder instantly.
         </div>
      </div>
    </div>
  );
};

export default SendDashboard;
