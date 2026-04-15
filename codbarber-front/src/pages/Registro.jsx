import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Scissors, ArrowRight, Loader2, UserPlus } from 'lucide-react';
import api from '../api';
import Alerta from '../components/Alerta';

export default function Registro() {
  const [nombre_usuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState({ mensaje: '', tipo: 'error', visible: false });
  
  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    
    if (contrasena !== confirmarContrasena) {
      return setAlerta({ mensaje: "Las contraseñas no coinciden", tipo: 'error', visible: true });
    }

    setCargando(true);

    try {
      await api.post('/usuarios/registrar', { 
        nombre_usuario, 
        contrasena, 
        rol: 'cliente' 
      });
      
      setAlerta({ 
        mensaje: "¡Cuenta creada! Redirigiendo al login...", 
        tipo: 'success', 
        visible: true 
      });

      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      setAlerta({ 
        mensaje: err.response?.data || "Error al registrar usuario :(", 
        tipo: 'error', 
        visible: true 
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04121F] flex items-center justify-center p-6 font-['Montserrat']">
      <Alerta 
        mensaje={alerta.mensaje} tipo={alerta.tipo} visible={alerta.visible} 
        onHide={() => setAlerta({ ...alerta, visible: false })} 
      />

      <div className="w-full max-w-md space-y-8 bg-black/40 backdrop-blur-2xl p-10 rounded-[40px] border border-white/5 shadow-2xl relative">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
            <UserPlus className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">
            Únete a <span className="text-blue-500">CodBarber</span>
          </h2>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold">Crea tu cuenta de cliente</p>
        </div>

        <form onSubmit={handleRegistro} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Elige un Usuario</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-blue-500" />
              <input 
                type="text" 
                className="w-full bg-[#04121F] border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 transition-all font-bold"
                placeholder="Nombre de usuario"
                value={nombre_usuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-blue-500" />
              <input 
                type="password" 
                className="w-full bg-[#04121F] border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 transition-all font-bold"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Confirmar Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
              <input 
                type="password" 
                className="w-full bg-[#04121F] border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 transition-all font-bold"
                placeholder="Repite tu contraseña"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-white text-black hover:bg-zinc-200 p-6 rounded-[24px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {cargando ? <Loader2 className="w-6 h-6 animate-spin" /> : "Crear Cuenta"}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-[10px] text-blue-400 font-black uppercase tracking-widest hover:text-white transition-colors">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}