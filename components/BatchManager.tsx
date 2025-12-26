
import React, { useState } from 'react';
import { Batch, Recipient } from '../types';
import { storage } from '../services/storageService';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Users, Building, Mail, X, Layers, Edit3 } from 'lucide-react';
import DeleteModal from './DeleteModal';

interface Props {
  batches: Batch[];
  onUpdate: () => void;
}

const BatchManager: React.FC<Props> = ({ batches, onUpdate }) => {
  const [editingBatch, setEditingBatch] = useState<Partial<Batch> | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<Batch | null>(null);
  const [newRecipient, setNewRecipient] = useState({ company: '', email: '' });

  const startNew = () => {
    setEditingBatch({
      id: crypto.randomUUID(),
      name: '',
      recipients: [],
    });
  };

  const addRecipient = () => {
    if (!newRecipient.company || !newRecipient.email) return;
    setEditingBatch(prev => ({
      ...prev!,
      recipients: [
        ...(prev!.recipients || []),
        { id: crypto.randomUUID(), ...newRecipient }
      ]
    }));
    setNewRecipient({ company: '', email: '' });
  };

  const removeRecipient = (id: string) => {
    setEditingBatch(prev => ({
      ...prev!,
      recipients: prev!.recipients!.filter(r => r.id !== id)
    }));
  };

  const saveBatch = async () => {
    if (!editingBatch?.name || (editingBatch.recipients || []).length === 0) return;
    await storage.saveBatch(editingBatch as Batch);
    setEditingBatch(null);
    onUpdate();
  };

  const confirmDelete = async () => {
    if (templateToDelete) {
      await storage.deleteBatch(templateToDelete.id);
      setTemplateToDelete(null);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Company Groups</h2>
          <p className="text-sm text-slate-500">Organize target companies into batches</p>
        </div>
        {!editingBatch && (
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={startNew}
            aria-label="New Batch"
            className="flex items-center justify-center bg-indigo-600 text-white w-12 h-12 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
          >
            <Plus size={24} />
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {editingBatch ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-5"
          >
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 shadow-inner">
               <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Batch Label</label>
               <input 
                 type="text" 
                 placeholder="e.g. Kyoto Luxury Hotels" 
                 className="w-full bg-white border-slate-200 border p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg"
                 value={editingBatch.name}
                 onChange={e => setEditingBatch({...editingBatch, name: e.target.value})}
               />
               
               <div className="mt-6">
                 <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Add Recipient</label>
                 <div className="flex flex-col gap-3 mt-1">
                   <div className="relative">
                     <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                       type="text" 
                       placeholder="Company Name" 
                       className="w-full pl-11 pr-4 py-3 bg-white border-slate-200 border rounded-xl outline-none text-sm"
                       value={newRecipient.company}
                       onChange={e => setNewRecipient({...newRecipient, company: e.target.value})}
                     />
                   </div>
                   <div className="relative">
                     <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                       type="email" 
                       placeholder="hr@company.jp" 
                       className="w-full pl-11 pr-4 py-3 bg-white border-slate-200 border rounded-xl outline-none text-sm"
                       value={newRecipient.email}
                       onChange={e => setNewRecipient({...newRecipient, email: e.target.value})}
                     />
                   </div>
                   <button 
                     onClick={addRecipient}
                     className="bg-slate-900 text-white w-full py-3 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm"
                   >
                     Add Recipient
                   </button>
                 </div>
               </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
              <AnimatePresence initial={false}>
                {(editingBatch.recipients || []).map((r, idx) => (
                  <motion.div 
                    key={r.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="group bg-white border border-slate-100 p-4 rounded-2xl flex justify-between items-center shadow-sm hover:border-indigo-100 transition-all overflow-hidden"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-800 text-sm truncate">{r.company}</div>
                        <div className="text-xs text-slate-400 truncate">{r.email}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeRecipient(r.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {(editingBatch.recipients || []).length === 0 && (
                <div className="py-12 text-center text-slate-300 italic text-sm">No recipients yet.</div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                onClick={saveBatch}
                className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Save Group
              </button>
              <button 
                onClick={() => setEditingBatch(null)}
                className="px-8 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
              >
                Back
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {batches.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[2rem]">
                <Layers size={48} className="mb-4 opacity-20" />
                <p className="font-medium italic">No batches found.</p>
                <button onClick={startNew} className="mt-4 text-indigo-600 font-bold text-sm underline underline-offset-4">Create your first group</button>
              </div>
            ) : (
              batches.map(b => (
                <motion.div 
                  key={b.id}
                  layoutId={b.id}
                  whileHover={{ y: -4 }}
                  className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start mb-2 min-w-0">
                       <h3 className="font-bold text-slate-800 text-lg leading-tight truncate pr-2 flex-1">{b.name}</h3>
                       <div className="flex gap-1 shrink-0">
                          <button onClick={() => setEditingBatch(b)} className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors"><Edit3 size={16}/></button>
                          <button onClick={() => setTemplateToDelete(b)} className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={16}/></button>
                       </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                      <Users size={14} className="shrink-0" />
                      <span className="text-xs font-semibold">{b.recipients.length} Companies</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-wrap gap-1 min-w-0">
                     {b.recipients.slice(0, 3).map((r) => (
                       <span key={r.id} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100 max-w-[120px] truncate">{r.company}</span>
                     ))}
                     {b.recipients.length > 3 && <span className="text-[10px] text-slate-300 self-center shrink-0">+{b.recipients.length - 3} more</span>}
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
        title="Delete Batch?"
        itemName={templateToDelete?.name || ''}
      />
    </div>
  );
};

export default BatchManager;
