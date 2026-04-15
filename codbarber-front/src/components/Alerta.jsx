import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Alerta({ mensaje, tipo = 'success', visible, onHide }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => onHide(), 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400',
    error: 'bg-red-500/10 border-red-500/50 text-red-400'
  };

  return (
    <div className={`fixed top-5 right-5 z-[200] flex items-center gap-3 p-4 rounded-2xl border ${styles[tipo]} shadow-2xl animate-in slide-in-from-right duration-500`}>
      {tipo === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-medium">{mensaje}</span>
    </div>
  );
}