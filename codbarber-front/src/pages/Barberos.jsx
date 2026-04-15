import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit, User, Phone, Mail, Save, 
  Scissors, ArrowLeft, AlertTriangle, MapPin 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

import Tabla from '../components/Tabla';
import Modal from '../components/Modal';
import Alerta from '../components/Alerta';

export default function Barberos() {
  const navigate = useNavigate();
  const [barberos, setBarberos] = useState([]);
  const [barberias, setBarberias] = useState([]); 
  
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [idBarberia, setIdBarberia] = useState('');

  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);

  const [alerta, setAlerta] = useState({ mensaje: '', tipo: 'success', visible: false });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo, visible: true });
  };

  const cargarDatos = async () => {
    try {
      const [resB, resS] = await Promise.all([
        api.get('/barberos'),
        api.get('/barberias')
      ]);
      setBarberos(resB.data || []);
      setBarberias(resS.data || []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      mostrarAlerta("Error al actualizar la lista de personal :(", "error");
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const abrirFormularioNuevo = () => {
    cancelarEdicion();
    setModalAbierto(true);
  };

  const prepararEdicion = (b) => {
    setEditando(true);
    setIdEditando(b.id_barbero);
    setNombre(b.nombre || '');
    setTelefono(b.telefono || '');
    setCorreo(b.correo || '');
    setIdBarberia(b.id_barberia || '');
    setModalAbierto(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setIdEditando(null);
    setNombre('');
    setTelefono('');
    setCorreo('');
    setIdBarberia('');
    setModalAbierto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !idBarberia) return mostrarAlerta("Nombre y Sucursal son obligatorios :)", "error");

    const datos = { nombre, telefono, correo, id_barberia: idBarberia };

    try {
      if (editando) {
        await api.put(`/barberos/actualizar/${idEditando}`, datos);
        mostrarAlerta("¡Perfil de barbero actualizado! :)");
      } else {
        await api.post('/barberos/insertar', datos);
        mostrarAlerta("¡Nuevo barbero reclutado con éxito! :)");
      }
      cancelarEdicion();
      cargarDatos();
    } catch (err) {
      mostrarAlerta("Error al procesar la solicitud :(", "error");
    }
  };

  const confirmarEliminacion = (id) => {
    setIdAEliminar(id);
    setModalEliminar(true);
  };

  const ejecutarEliminacion = async () => {
    try {
      await api.delete(`/barberos/eliminar/${idAEliminar}`);
      mostrarAlerta("Barbero dado de baja correctamente :)");
      setModalEliminar(false);
      cargarDatos();
    } catch (err) {
      mostrarAlerta("No se pudo eliminar al barbero :(", "error");
      setModalEliminar(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04121F] text-white p-4 md:p-12 font-['Montserrat']">
      <Alerta 
        mensaje={alerta.mensaje} tipo={alerta.tipo} visible={alerta.visible} 
        onHide={() => setAlerta({ ...alerta, visible: false })} 
      />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/admin')}
                className="p-3 bg-white/5 hover:bg-[#1E90FF]/20 text-zinc-400 hover:text-[#1E90FF] rounded-2xl transition-all border border-white/5"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
                <div className="flex items-center gap-2 text-[#1E90FF] text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                    <User className="w-3 h-3" /> Equipo Humano
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase">
                    Barbe<span className="text-[#1E90FF]">ros</span>
                </h1>
            </div>
          </div>
          
          <button 
            onClick={abrirFormularioNuevo}
            className="group flex items-center gap-3 bg-[#1E90FF] hover:bg-blue-600 px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 font-black uppercase text-xs tracking-widest"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Reclutar Staff
          </button>
        </div>

        <Tabla headers={['ID', 'Especialista', 'Contacto', 'Sucursal', 'Acciones']}>
          {barberos.length > 0 ? barberos.map((b) => (
            <tr key={b.id_barbero} className="group hover:bg-white/[0.02] transition-colors">
              <td className="p-6 text-zinc-600 font-bold text-xs">#{b.id_barbero}</td>
              <td className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1E90FF]/20 to-blue-600/10 rounded-2xl flex items-center justify-center text-[#1E90FF] font-black border border-[#1E90FF]/20 group-hover:scale-110 transition-transform">
                    {b.nombre ? b.nombre.charAt(0).toUpperCase() : '?'}
                  </div>
                  <span className="text-lg font-bold group-hover:text-[#1E90FF] transition-colors">{b.nombre}</span>
                </div>
              </td>
              <td className="p-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#1E90FF]/50" /> {b.telefono || 'Sin tel.'}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs">
                    <Mail className="w-3.5 h-3.5 text-[#1E90FF]/50" /> {b.correo || 'Sin correo'}
                  </div>
                </div>
              </td>
              <td className="p-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-zinc-400 font-bold text-xs uppercase italic">
                  <MapPin className="w-3 h-3 text-[#1E90FF]" /> {b.barberia || 'No asignada'}
                </div>
              </td>
              <td className="p-6 text-right">
                <div className="flex justify-end gap-3">
                  <button onClick={() => prepararEdicion(b)} className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => confirmarEliminacion(b.id_barbero)} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="5" className="p-20 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs italic">Aún no hay especialistas registrados :)</td></tr>
          )}
        </Tabla>

        <Modal 
          isOpen={modalAbierto} 
          onClose={cancelarEdicion} 
          title={editando ? 'Editar Especialista' : 'Registrar Especialista'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5" />
                <input 
                  type="text" 
                  className="w-full bg-[#04121F] border border-white/10 p-4 pl-12 rounded-2xl focus:border-[#1E90FF] outline-none text-white transition-all font-medium"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Juan Carlos "
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 text-center block">Teléfono</label>
                <input 
                  type="text" 
                  className="w-full bg-[#04121F] border border-white/10 p-4 rounded-2xl focus:border-[#1E90FF] outline-none text-white transition-all text-center"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="33 1234..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 text-center block">Correo</label>
                <input 
                  type="email" 
                  className="w-full bg-[#04121F] border border-white/10 p-4 rounded-2xl focus:border-[#1E90FF] outline-none text-white transition-all text-center"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="nombre@dev.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Asignar a Sucursal</label>
              <select 
                className="w-full bg-[#04121F] border border-white/10 p-4 rounded-2xl focus:border-[#1E90FF] outline-none text-white cursor-pointer appearance-none"
                value={idBarberia}
                onChange={(e) => setIdBarberia(e.target.value)}
                required
              >
                <option value="">-- Selecciona Barbería --</option>
                {barberias.map(b => (
                  <option key={b.id_barberia} value={b.id_barberia}>{b.nombre}</option>
                ))}
              </select>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-[#1E90FF] hover:bg-blue-600 p-5 rounded-2xl transition-all font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
            >
              <Save className="w-5 h-5" /> 
              {editando ? 'Guardar Cambios' : 'Registrar Barbero'}
            </button>
          </form>
        </Modal>

        <Modal isOpen={modalEliminar} onClose={() => setModalEliminar(false)} title="Seguridad del Personal">
            <div className="text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <AlertTriangle className="text-red-500 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black mb-2 uppercase italic tracking-tighter">¿Dar de baja?</h3>
                <p className="text-zinc-500 font-medium mb-8 text-sm">El barbero será eliminado del staff y su agenda quedará inactiva :)</p>
                <div className="flex gap-4">
                    <button onClick={() => setModalEliminar(false)} className="flex-1 bg-white/5 hover:bg-white/10 p-4 rounded-2xl font-bold transition-all uppercase text-xs tracking-widest">Abortar</button>
                    <button onClick={ejecutarEliminacion} className="flex-1 bg-red-500 hover:bg-red-600 p-4 rounded-2xl font-black transition-all uppercase text-xs tracking-widest shadow-lg shadow-red-500/20">Sí, Eliminar</button>
                </div>
            </div>
        </Modal>
      </div>
    </div>
  );
}