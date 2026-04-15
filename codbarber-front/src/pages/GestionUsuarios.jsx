import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, Scissors, Menu, 
  LogOut, Trash2, Edit3, MapPin, Key, 
  CheckCircle, X, ChevronRight, UserCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Alerta from '../components/Alerta';
import Tabla from '../components/Tabla';
import Modal from '../components/Modal';

export default function GestionUsuarios() {
  const { user, logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(true);
  
  const [usuarios, setUsuarios] = useState([]);
  const [barberias, setBarberias] = useState([]);
  
  const [alerta, setAlerta] = useState({ mensaje: '', tipo: 'success', visible: false });
  const [modalNuevoUsuario, setModalNuevoUsuario] = useState(false);
  
  const [editando, setEditando] = useState(false);
  const [idUsuarioEdit, setIdUsuarioEdit] = useState(null);

  const [formUser, setFormUser] = useState({ 
    nombre_usuario: '', 
    contrasena: '', 
    rol: 'barbero', 
    id_barberia: '' 
  });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo, visible: true });
  };

  const cargarDatos = async () => {
    try {
      const [resUsers, resBarberias] = await Promise.all([
        api.get('/usuarios/').catch(() => ({ data: [] })),
        api.get('/barberias/').catch(() => ({ data: [] }))
      ]);
      setUsuarios(Array.isArray(resUsers.data) ? resUsers.data : []);
      setBarberias(Array.isArray(resBarberias.data) ? resBarberias.data : []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      mostrarAlerta("Error al sincronizar con el servidor", "error");
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const prepararEdicion = (u) => {
    setFormUser({
      nombre_usuario: u.nombre_usuario || '',
      contrasena: '', 
      rol: u.rol || 'barbero',
      id_barberia: u.id_barberia || ''
    });
    setIdUsuarioEdit(u.id_usuario);
    setEditando(true);
    setModalNuevoUsuario(true);
  };

  const prepararCreacion = () => {
    setFormUser({ nombre_usuario: '', contrasena: '', rol: 'barbero', id_barberia: '' });
    setEditando(false);
    setIdUsuarioEdit(null);
    setModalNuevoUsuario(true);
  };

  const handleGuardarUsuario = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/usuarios/actualizar/${idUsuarioEdit}`, formUser);
        mostrarAlerta(`Usuario actualizado correctamente`);
      } else {
        await api.post('/usuarios/registrar', formUser);
        mostrarAlerta(`Usuario creado exitosamente`);
      }
      setModalNuevoUsuario(false);
      cargarDatos();
    } catch (err) {
      mostrarAlerta(err.response?.data || "Error en la operación", "error");
    }
  };

  const eliminarUsuario = async (id) => {
    if(!window.confirm("¿Seguro que deseas eliminar esta cuenta?")) return;
    try {
      await api.delete(`/usuarios/eliminar/${id}`);
      mostrarAlerta("Usuario eliminado del sistema");
      cargarDatos();
    } catch (err) {
      mostrarAlerta("No se pudo eliminar el usuario", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#04121F] text-white font-['Montserrat']">
      <Alerta 
        mensaje={alerta.mensaje} tipo={alerta.tipo} visible={alerta.visible} 
        onHide={() => setAlerta({ ...alerta, visible: false })} 
      />

      <aside className={`${menuAbierto ? 'w-72' : 'w-24'} bg-[#0A1A2A] border-r border-white/5 transition-all duration-500 flex flex-col z-20`}>
        <div className="p-8 flex items-center gap-4">
          <div className="bg-[#1E90FF] p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <Shield className="text-white w-6 h-6" />
          </div>
          {menuAbierto && <span className="font-black text-xl tracking-tighter uppercase italic">Admin<span className="text-[#1E90FF]">Dios</span></span>}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#1E90FF] text-white shadow-xl shadow-blue-600/20">
            <Users className="w-5 h-5" />
            {menuAbierto && <span className="font-bold text-sm tracking-wide">Gestión Personal</span>}
          </button>
        </nav>

        <div className="p-4">
          <button onClick={logout} className="w-full flex items-center gap-4 p-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all">
            <LogOut className="w-5 h-5" /> {menuAbierto && <span className="font-bold text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-[#04121F]/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors border border-white/5">
              <Menu className="w-5 h-5 text-zinc-400" />
            </button>
            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">
              Seguridad / <span className="text-white">Usuarios</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-[#1E90FF] uppercase tracking-widest">Administrador Supremo</p>
              <p className="text-sm font-bold italic">{String(user?.nombre_usuario || 'Admin')}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-blue-500/20">
              {String(user?.nombre_usuario || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Control de <span className="text-[#1E90FF]">Personal</span></h2>
                <p className="text-zinc-500 font-medium">Registra o edita barberos y administradores del sistema.</p>
              </div>
              <button 
                onClick={prepararCreacion} 
                className="bg-[#1E90FF] hover:bg-blue-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl shadow-blue-600/30 active:scale-95"
              >
                <UserPlus className="w-5 h-5" /> Nuevo Empleado
              </button>
            </div>

            <div className="bg-[#0A1A2A] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
              <Tabla headers={['Usuario', 'Rol de Acceso', 'Sucursal', 'Vinculación', 'Acciones']}>
                {usuarios.map((u) => (
                  <tr key={u.id_usuario} className="group hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[#1E90FF]/30 transition-all">
                            <UserCircle className="w-5 h-5 text-[#1E90FF]" />
                        </div>
                        <span className="font-black text-lg italic">{String(u.nombre_usuario || 'Sin Nombre')}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        u.rol === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {String(u.rol || 'Cliente')}
                      </span>
                    </td>
                    <td className="p-6 text-zinc-400 font-bold italic">
                      {u.id_barberia ? `#${u.id_barberia}` : <span className="text-zinc-600">Global</span>}
                    </td>
                    <td className="p-6 text-sm font-medium text-zinc-500">
                        {u.id_cliente ? 'Cliente Registrado' : 'Staff Interno'}
                    </td>
                    <td className="p-6 flex gap-2">
                      <button onClick={() => prepararEdicion(u)} className="p-3 text-[#1E90FF] hover:bg-[#1E90FF]/10 rounded-xl transition-all border border-transparent hover:border-[#1E90FF]/20">
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button onClick={() => eliminarUsuario(u.id_usuario)} className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </Tabla>
            </div>
          </div>
        </div>
      </main>

      <Modal 
        isOpen={modalNuevoUsuario} 
        onClose={() => { setModalNuevoUsuario(false); setEditando(false); }} 
        title={editando ? "Editar Perfil de Usuario" : "Alta Manual de Personal"}
      >
        <form onSubmit={handleGuardarUsuario} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Nombre de Usuario</label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input 
                type="text" 
                className="w-full bg-[#04121F] border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-[#1E90FF] transition-all font-bold"
                placeholder="Ej: carlitos_pro"
                value={formUser.nombre_usuario}
                onChange={(e) => setFormUser({...formUser, nombre_usuario: e.target.value})}
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">
              {editando ? "Nueva Contraseña (Opcional)" : "Contraseña Temporal"}
            </label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input 
                type="password" 
                className="w-full bg-[#04121F] border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-[#1E90FF] transition-all font-bold"
                placeholder={editando ? "Dejar vacío para mantener actual" : "••••••••"}
                value={formUser.contrasena}
                onChange={(e) => setFormUser({...formUser, contrasena: e.target.value})}
                required={!editando} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Nivel de Acceso</label>
              <select 
                className="w-full bg-[#04121F] border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-[#1E90FF] transition-all font-bold italic"
                value={formUser.rol}
                onChange={(e) => setFormUser({...formUser, rol: e.target.value})}
              >
                <option value="barbero">Barbero (Staff)</option>
                <option value="admin">Administrador</option>
                <option value="cliente">Cliente (Usuario)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Asignar Sucursal</label>
              <select 
                className="w-full bg-[#04121F] border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-[#1E90FF] transition-all font-bold"
                value={formUser.id_barberia}
                onChange={(e) => setFormUser({...formUser, id_barberia: e.target.value})}
              >
                <option value="">Global / Sin Sede</option>
                {barberias.map(b => (
                  <option key={b.id_barberia} value={b.id_barberia}>{String(b.nombre || 'Sucursal')}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#1E90FF] p-6 rounded-[24px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 mt-4 italic">
            {editando ? "Guardar Cambios" : "Confirmar Alta en Sistema"}
          </button>
        </form>
      </Modal>
    </div>
  );
}