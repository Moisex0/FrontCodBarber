import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit, User, Shield, Lock, 
  Save, Users, RefreshCcw, AlertTriangle, Loader2, Key, MapPin
} from 'lucide-react';
import api from '../api';
import Tabla from '../components/Tabla';
import Modal from '../components/Modal';
import Alerta from '../components/Alerta';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [barberias, setBarberias] = useState([]); 
  const [cargando, setCargando] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState('cliente');
  const [idBarberia, setIdBarberia] = useState(''); 
  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [alerta, setAlerta] = useState({ mensaje: '', tipo: 'success', visible: false });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo, visible: true });
  };

  const cargarDatosInitiales = async () => {
    setCargando(true);
    try {
      const [resUsers, resBarberias] = await Promise.all([
        api.get('/usuarios'),
        api.get('/barberias')
      ]);
      setUsuarios(resUsers.data || []);
      setBarberias(resBarberias.data || []);
    } catch (err) {
      mostrarAlerta("Error al sincronizar datos del sistema :(", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatosInitiales(); }, []);

  const prepararEdicion = (u) => {
    setEditando(true);
    setIdEditando(u.id_usuario);
    setNombreUsuario(u.nombre_usuario || '');
    setContrasena(''); 
    setRol(u.rol || 'cliente');
    setIdBarberia(u.id_barberia || ''); 
    setModalAbierto(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setIdEditando(null);
    setNombreUsuario('');
    setContrasena('');
    setRol('cliente');
    setIdBarberia('');
    setModalAbierto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const datos = { 
      nombre_usuario: nombreUsuario, 
      rol: rol,
      id_barberia: idBarberia === "" ? null : idBarberia 
    };
    
    if (contrasena.trim() !== "") {
      datos.contrasena = contrasena;
    }

    try {
      if (editando) {
        await api.put(`/usuarios/actualizar/${idEditando}`, datos);
        mostrarAlerta("Credenciales y sucursal actualizadas :)");
      } else {
        await api.post('/usuarios/registrar', datos);
        mostrarAlerta("Nuevo acceso generado con éxito :)");
      }
      cancelarEdicion();
      cargarDatosInitiales();
    } catch (err) {
      const msg = err.response?.data || "Fallo en el protocolo de seguridad :(";
      mostrarAlerta(msg, "error");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿REVOCAR ACCESO? El usuario será expulsado del sistema inmediatamente :)")) {
      try {
        await api.delete(`/usuarios/eliminar/${id}`);
        mostrarAlerta("Cuenta desactivada y eliminada");
        cargarDatosInitiales();
      } catch (err) {
        mostrarAlerta("No se pudo procesar la baja :(", "error");
      }
    }
  };

  const handleResetBD = async () => {
    const confirm1 = window.confirm("¡ALERTA DE SEGURIDAD!\n\n¿Deseas purgar todas las transacciones y citas?");
    if (confirm1) {
      const confirm2 = window.confirm("ESTA ACCIÓN ES IRREVERSIBLE.");
      if (confirm2) {
        try {
          await api.delete('/usuarios/admin/reset-database');
          mostrarAlerta("DATOS OPERATIVOS ELIMINADOS", "success");
          cargarDatosInitiales();
        } catch (err) {
          mostrarAlerta("Error en el comando de reseteo", "error");
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#04121F] text-white p-10 font-['Montserrat'] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] pointer-events-none"></div>

      <Alerta 
        mensaje={alerta.mensaje} tipo={alerta.tipo} visible={alerta.visible} 
        onHide={() => setAlerta({ ...alerta, visible: false })} 
      />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              Control de <span className="text-blue-400">Accesos</span>
            </h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-3 ml-1 italic">Security Terminal v2.6</p>
          </div>
          
          <div className="flex gap-4">
            <button onClick={handleResetBD} className="flex items-center gap-2 bg-rose-500/5 hover:bg-rose-500 border border-rose-500/20 px-6 py-4 rounded-[22px] transition-all text-rose-500 hover:text-white font-black text-[10px] uppercase active:scale-95 shadow-xl shadow-rose-500/5">
                <RefreshCcw className="w-4 h-4" /> Reset Data
            </button>
            <button onClick={() => { cancelarEdicion(); setModalAbierto(true); }} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-[22px] font-black uppercase text-xs tracking-widest transition-all shadow-2xl flex items-center gap-3 active:scale-95">
                <Plus className="w-5 h-5" /> Crear Acceso
            </button>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
          <Tabla headers={['Nivel', 'Identidad', 'Sucursal Asignada', 'Rol', 'Acciones']}>
            {cargando ? (
              <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-zinc-700" /></td></tr>
            ) : usuarios.map((u) => (
              <tr key={u.id_usuario} className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0 group">
                <td className="p-6">
                  <div className="text-[10px] font-mono text-zinc-600 bg-white/5 w-10 h-10 flex items-center justify-center rounded-xl border border-white/5">
                    #{u.id_usuario}
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-black text-lg border-2 ${
                      u.rol === 'admin' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                      u.rol === 'barbero' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 
                      'bg-zinc-800/50 text-zinc-500 border-zinc-700/30'
                    }`}>
                      {u.nombre_usuario?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-black text-zinc-200 text-lg uppercase italic">{u.nombre_usuario}</span>
                  </div>
                </td>
                <td className="p-6 font-bold text-zinc-400 text-sm uppercase">
                  {u.id_barberia ? (
                    <span className="flex items-center gap-2 text-blue-400">
                      <MapPin className="w-4 h-4" /> 
                      {barberias.find(b => b.id_barberia === u.id_barberia)?.nombre || `Sucursal #${u.id_barberia}`}
                    </span>
                  ) : (
                    <span className="text-zinc-600 italic">Acceso Global</span>
                  )}
                </td>
                <td className="p-6">
                  <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                      u.rol === 'admin' ? 'border-orange-500/30 text-orange-500 bg-orange-500/5' : 
                      u.rol === 'barbero' ? 'border-cyan-500/30 text-cyan-500 bg-cyan-500/5' : 
                      'border-zinc-700 text-zinc-500 bg-zinc-900/50'
                  }`}>
                    {u.rol}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => prepararEdicion(u)} className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl hover:bg-blue-500 hover:text-white transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEliminar(u.id_usuario)} className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Tabla>
        </div>

        <Modal isOpen={modalAbierto} onClose={cancelarEdicion} title={editando ? 'Rectificar Acceso' : 'Nueva Autorización'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 tracking-widest">ID Acceso</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-blue-500" />
                <input type="text" className="w-full bg-[#04121F] border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 font-bold" value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} placeholder="Usuario..." required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 tracking-widest">Contraseña de Seguridad</label>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-blue-500" />
                <input type="password" className="w-full bg-[#04121F] border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 font-bold" value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder={editando ? "Sin cambios..." : "********"} required={!editando} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 tracking-widest">Rango (Rol)</label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <select className="w-full bg-[#04121F] border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 font-black uppercase appearance-none" value={rol} onChange={(e) => setRol(e.target.value)}>
                    <option value="cliente">Cliente</option>
                    <option value="barbero">Barbero</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 tracking-widest">Ubicación / Sucursal</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <select className="w-full bg-[#04121F] border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 font-black uppercase appearance-none" value={idBarberia} onChange={(e) => setIdBarberia(e.target.value)}>
                    <option value="">Acceso Global</option>
                    {barberias.map(b => (
                      <option key={b.id_barberia} value={b.id_barberia}>{b.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <button type="submit" className="w-full bg-blue-500 p-6 rounded-[24px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-xl mt-4 flex items-center justify-center gap-4 active:scale-95">
              <Save className="w-6 h-6" /> {editando ? 'Guardar Cambios' : 'Activar Cuenta'}
            </button>
          </form>
        </Modal>
      </div>
    </div>
  );
}