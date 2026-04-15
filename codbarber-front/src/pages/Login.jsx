import React, { useState } from 'react';
import { Scissors, User, Lock, AlertCircle, Loader2, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom'; 
import api from '../api'; 
import { useAuth } from '../context/AuthContext'; 

export default function Login() {
  const [nombre_usuario, setUsuario] = useState('');
  const [contrasena, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const response = await api.post('/auth/login', { 
        nombre_usuario, 
        contrasena 
      });

      login(response.data); 

    } catch (err) {
      const mensajeError = err.response?.data?.error || "Credenciales no válidas :(";
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04121F] flex items-center justify-center p-4 font-['Montserrat'] relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#1E90FF]/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#1E90FF]/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[420px] bg-black/40 backdrop-blur-2xl border border-white/5 p-10 rounded-[35px] shadow-2xl relative z-10">
        
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-[#1E90FF]/10 rounded-3xl mb-6 border border-[#1E90FF]/20 group transition-all hover:shadow-[0_0_30px_rgba(30,144,255,0.2)]">
            <Scissors className="w-12 h-12 text-[#1E90FF] drop-shadow-[0_0_10px_rgba(30,144,255,0.5)] transition-transform group-hover:rotate-12" />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">
            Cod<span className="text-[#1E90FF]">Barber</span>
          </h2>
          <div className="h-1 w-12 bg-[#1E90FF] mx-auto mt-2 rounded-full shadow-[0_0_10px_#1E90FF]"></div>
          <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.4em] mt-4">Security Access Terminal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-bold animate-in fade-in zoom-in duration-300 italic">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Identificador</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-[#1E90FF] transition-colors" />
              <input 
                type="text" 
                value={nombre_usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Usuario de sistema"
                className="w-full bg-white/5 border border-white/5 text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-[#1E90FF]/50 focus:bg-white/[0.08] transition-all placeholder:text-zinc-700 font-bold"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Clave de Acceso</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-[#1E90FF] transition-colors" />
              <input 
                type="password" 
                value={contrasena}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/5 text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-[#1E90FF]/50 focus:bg-white/[0.08] transition-all placeholder:text-zinc-700 font-bold"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={cargando}
            className={`w-full bg-[#1E90FF] hover:bg-blue-600 text-white font-black py-5 rounded-[22px] shadow-xl shadow-blue-500/20 transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em] italic`}
          >
            {cargando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sincronizando...
              </>
            ) : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link 
            to="/registro" 
            className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#1E90FF] transition-colors"
          >
            <UserPlus className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            ¿No tienes cuenta? <span className="text-white ml-1">Regístrate aquí</span>
          </Link>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex justify-between items-center">
            <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">CodBarber &copy; 2026</span>
            <div className="flex items-center gap-3">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">System Status</span>
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}