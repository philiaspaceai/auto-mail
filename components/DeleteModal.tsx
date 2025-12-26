
import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, title, itemName }) => {
  // Kita teleportasikan modal ini ke document.body agar tidak terjebak di dalam container
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 outline-none focus:outline-none">
          {/* Background Overlay - Sekarang benar-benar menutupi seluruh layar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60"
            style={{ pointerEvents: 'auto' }}
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] p-8 text-center space-y-6 overflow-hidden z-[1000]"
          >
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-2 rotate-3">
               <Trash2 size={32} className="text-rose-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-4">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{itemName}"</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                type="button"
                onClick={onConfirm}
                className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-rose-100 active:scale-95 transition-all"
              >
                YES, DELETE PERMANENTLY
              </button>
              <button 
                type="button"
                onClick={onClose}
                className="w-full bg-white text-slate-400 py-3 rounded-2xl font-bold text-xs hover:bg-slate-50 active:scale-95 transition-all"
              >
                CANCEL
              </button>
            </div>

            {/* Accent decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 -mr-12 -mt-12 rounded-full opacity-50 pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default DeleteModal;
