
import React, { useState } from 'react';
import { Template, Attachment } from '../types';
import { storage } from '../services/storageService';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, FileJson, Paperclip, X, ChevronRight, FileText } from 'lucide-react';
import DeleteModal from './DeleteModal';

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

私は特定技能（宿泊分野）ের試験に合格しています。
必要な場合は、証明書をご提出できます。

日本語はJFT-Basic A2レベルです。
読むことは比較的できますが、
会話はまだ勉強中です。
仕事 di jepang の指示や簡単な会話 is 이해できます。

日本語のほかに、
英語での簡単なコミュニケーションも可能です。

体を動かす仕事や、
シフト勤務 adalah masalahありません。
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
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

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
          alert(`File ${file.name} is not a PDF.`);
          continue;
        }
        const reader = new FileReader();
        const promise = new Promise<Attachment>((resolve) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({ name: file.name, mimeType: file.type, data: base64 });
          };
        });
        reader.readAsDataURL(file);
        newAttachments.push(await promise);
      }
      setEditingTemplate(prev => ({
        ...prev!,
        attachments: [...(prev!.attachments || []), ...newAttachments]
      }));
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

  const confirmDelete = async () => {
    if (templateToDelete) {
      await storage.deleteTemplate(templateToDelete.id);
      setTemplateToDelete(null);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Email Templates</h2>
          <p className="text-sm text-slate-500">Manage your application masters</p>
        </div>
        {!editingTemplate && (
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={startNew}
            className="flex items-center justify-center bg-indigo-600 text-white w-12 h-12 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
          >
            <Plus size={24} />
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {editingTemplate ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-5"
          >
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 shadow-inner space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Template Label</label>
                <input 
                  type="text" 
                  placeholder="e.g. Resort Hotel Application" 
                  className="w-full bg-white border-slate-200 border p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg"
                  value={editingTemplate.name}
                  onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Email Subject</label>
                <input 
                  type="text" 
                  placeholder="Subject line..."
                  className="w-full bg-white border-slate-200 border p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-600"
                  value={editingTemplate.subject}
                  onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Message Content</label>
                <textarea 
                  className="w-full h-80 bg-white border-slate-200 border p-5 rounded-[2rem] focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm leading-relaxed resize-none"
                  value={editingTemplate.content}
                  onChange={e => setEditingTemplate({...editingTemplate, content: e.target.value})}
                />
              </div>

              <div className="bg-white/50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">PDF Attachments</span>
                  <label className="cursor-pointer text-indigo-600 text-xs font-bold hover:underline">
                    + Add PDF
                    <input type="file" accept=".pdf" multiple onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editingTemplate.attachments?.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600 shadow-sm">
                      <Paperclip size={12} className="text-indigo-500" />
                      <span className="max-w-[100px] truncate">{att.name}</span>
                      <button type="button" onClick={() => removeAttachment(idx)} className="text-rose-400 hover:text-rose-600 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                onClick={save}
                className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Save Template
              </button>
              <button 
                onClick={() => setEditingTemplate(null)}
                className="px-8 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
              >
                Back
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {templates.length === 0 ? (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-300 bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
                <FileJson size={64} className="mb-4 opacity-10" />
                <p className="font-black uppercase tracking-[0.3em] text-[10px]">No templates found</p>
                <button onClick={startNew} className="mt-4 text-indigo-600 font-bold text-sm underline underline-offset-4">Create your first template</button>
              </div>
            ) : (
              templates.map(t => (
                <motion.div 
                  key={t.id}
                  layoutId={t.id}
                  whileHover={{ y: -4 }}
                  className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl transition-all flex flex-col justify-between group overflow-hidden"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start mb-2 min-w-0">
                       <h3 className="font-bold text-slate-800 text-lg leading-tight truncate pr-2 flex-1">{t.name}</h3>
                       <div className="flex gap-1 shrink-0">
                          <button 
                            onClick={() => setEditingTemplate(t)} 
                            className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors"
                          >
                            <Edit3 size={16}/>
                          </button>
                          <button 
                            onClick={() => setTemplateToDelete(t)} 
                            className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 size={16}/>
                          </button>
                       </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                      <FileText size={14} className="shrink-0" />
                      <span className="text-xs font-medium truncate italic">"{t.subject}"</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                     <div className="flex gap-1.5 shrink-0">
                       <div className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100 text-[10px] font-black uppercase flex items-center gap-1">
                         <Paperclip size={10} /> {t.attachments?.length || 0}
                       </div>
                       <div className="bg-slate-50 text-slate-400 px-2 py-0.5 rounded-lg border border-slate-100 text-[10px] font-black uppercase">
                         {Math.round(t.content.length / 100) / 10} KB
                       </div>
                     </div>
                     <ChevronRight size={16} className="text-slate-200 group-hover:text-indigo-300 transition-colors shrink-0" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </AnimatePresence>

      <DeleteModal 
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Template?"
        itemName={templateToDelete?.name || ''}
      />
    </div>
  );
};

export default TemplateManager;
