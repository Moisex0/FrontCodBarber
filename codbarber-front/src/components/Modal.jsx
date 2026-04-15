import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F0F0F] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-white/5 shrink-0">
          <h3 className="text-xl font-bold text-[#1E90FF] italic">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scroll">
          {children}
        </div>
      </div>
    </div>
  );
}