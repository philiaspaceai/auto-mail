
import React, { useState } from 'react';
import { Template, Attachment } from '../types';
import { storage } from '../services/storageService';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, FileJson, CheckCircle2, Paperclip, AlertCircle, X } from 'lucide-react';

interface Props {
  templates: Template[];
  onUpdate: () => void;
}

const DEFAULT_JAPANESE_BODY = `株式会社{{company}}
採用ご担当者様

はじめまして。
インドネシアに住んでいるPutera（プテラ）と申します。

宿泊やホテルや旅館などの仕事に興味があり、
応募のご連絡をいたしました。

私は特定技能（宿泊分野）の試験に合格しています。
必要な場合は、証明書をご提出できます。

日本語はJFT-Basic A2レベルです。
読むことは比較的できますが、
会話はまだ勉強中です。
仕事 di jepang の指示や簡単な会話は理解できます。

日本語のほかに、
英語での簡単なコミュニケーションも可能です。

体を動かす仕事や、
シフト勤務は問題ありません。
日本で長く働きたいと考えています。

入社時期や在留資格の手続きについては、
会社の方針に従います。

履歴書を添付しました。
ご確認いただけましたら幸いです。

どうぞよろしくお願いいたします。

――――――――――――――――――――

氏名：プテラ・ペルダナ・ゲミラン・バーン
(Putera Perdana Gemilang Baang）
住所：インドネシア
メール：puteraperdanagb@gmail.com
電話：+62-816-1771-5202（WhatsApp可）`;

const TemplateManager: React.FC<Props> = ({ templates, onUpdate }) => {
  const [editingTemplate, setEditingTemplate] = useState<Partial<Template> | null>(null);

  const startNew = () => {
    setEditingTemplate({
      id: crypto.randomUUID(),
      name: '',
      subject: '【応募】宿泊職種への応募について（プテラ）',
      content: DEFAULT_JAPANESE_BODY,
      attachments: [],
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments: Attachment[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type !== 'application/pdf') {
          alert(`File ${file.name} is not a PDF and will be ignored.`);
          continue;
        }

        const reader = new FileReader();
        const promise = new Promise<Attachment>((resolve) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({
              name: file.name,
              mimeType: file.type,
              data: base64
            });
          };
        });
        reader.readAsDataURL(file);
        newAttachments.push(await promise);
      }

      setEditingTemplate(prev => ({
        ...prev!,
        attachments: [...(prev!.attachments || []), ...newAttachments]
      }));
      
      // Reset input
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setEditingTemplate(prev => ({
      ...prev!,
      attachments: (prev!.attachments || []).filter((_, i) => i !== index)
    }));
  };

  const save = async () => {
    if (!editingTemplate?.name || !editingTemplate?.content) return;
    const templateToSave = {
      ...editingTemplate,
      attachments: editingTemplate.attachments || []
    } as Template;
    
    await storage.saveTemplate(templateToSave);
    setEditingTemplate(null);
    onUpdate();
  };

  const remove = async (id: string) => {
    if (confirm('Delete this template?')) {
      await storage.deleteTemplate(id);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Email Templates</h2>
          <p className="text-sm text-slate-500">Design your job application letters</p>
        </div>
        {!editingTemplate && (
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={startNew}
            aria-label="New Template"
            className="flex items-center justify-center bg-indigo-600 text-white w-12 h-12 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
          >
            <Plus size={24} />
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {editingTemplate ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4 bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-200"
          >
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Template Label</label>
                <input 
                  type="text" 
                  placeholder="e.g. Hotel Front Desk Application" 
                  className="w-full bg-white border-slate-200 border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingTemplate.name}
                  onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Subject Line</label>
                <input 
                  type="text" 
                  className="w-full bg-white border-slate-200 border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingTemplate.subject}
                  onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Email Body</label>
              <div className="relative group">
                <textarea 
                  className="w-full h-80 bg-white border-slate-200 border p-4 rounded-2xl font-mono text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingTemplate.content}
                  onChange={e => setEditingTemplate({...editingTemplate, content: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Attachments (PDF)</span>
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    multiple 
                    onChange={handleFileChange} 
                    className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" 
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {(editingTemplate.attachments || []).map((att, idx) => (
                    <motion.div 
                      key={att.name + idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 bg-slate-50 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 group"
                    >
                      <Paperclip size={12} className="text-slate-400" />
                      <span className="max-w-[150px] truncate">{att.name}</span>
                      <button 
                        onClick={() => removeAttachment(idx)}
                        className="text-slate-400 hover:text-rose-500 transition-colors ml-1"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {(editingTemplate.attachments || []).length === 0 && (
                  <div className="text-[10px] text-slate-400 italic">No files attached yet.</div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={save}
                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                Save Template
              </button>
              <button 
                onClick={() => setEditingTemplate(null)}
                className="px-6 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-white transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid sm:grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {templates.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[2rem]">
                <FileJson size={48} className="mb-4 opacity-20" />
                <p className="font-medium italic">Your template collection is empty.</p>
                <button onClick={startNew} className="mt-4 text-indigo-600 font-bold text-sm underline underline-offset-4">Create your first one</button>
              </div>
            ) : (
              templates.map(t => (
                <motion.div 
                  key={t.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -4 }}
                  className="group bg-slate-50 hover:bg-white p-5 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all hover:shadow-xl hover:shadow-indigo-500/5 cursor-default relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3 flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingTemplate(t)} className="p-2 bg-white text-slate-500 hover:text-indigo-600 rounded-full shadow-sm border border-slate-100"><Edit3 size={14}/></button>
                    <button onClick={() => remove(t.id)} className="p-2 bg-white text-slate-400 hover:text-rose-600 rounded-full shadow-sm border border-slate-100"><Trash2 size={14}/></button>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors pr-16">{t.name}</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-1 italic">{t.subject}</p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                       {t.attachments && t.attachments.length > 0 ? (
                         <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md font-bold flex items-center gap-1 uppercase tracking-wider">
                           <Paperclip size={10} /> {t.attachments.length} {t.attachments.length === 1 ? 'PDF' : 'PDFs'}
                         </span>
                       ) : (
                         <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-1 rounded-md font-bold uppercase tracking-wider flex items-center gap-1">
                           <AlertCircle size={10} /> No Files
                         </span>
                       )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.content.length} chars</span>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplateManager;
