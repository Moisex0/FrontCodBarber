import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit, User, Phone, Mail, Save, Users, 
  Search, ArrowLeft, AlertTriangle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

import Tabla from '../components/Tabla';
import Modal from '../components/Modal';
import Alerta from '../components/Alerta';

export default function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');

  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const [alerta, setAlerta] = useState({ mensaje: '', tipo: 'success', visible: false });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo, visible: true });
  };

  const cargarClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      mostrarAlerta("Error al sincronizar clientes :(", "error");
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  const clientesFiltrados = clientes.filter(c => 
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono?.includes(busqueda)
  );

  const abrirFormularioNuevo = () => {
    cancelarEdicion();
    setModalAbierto(true);
  };

  const prepararEdicion = (c) => {
    setEditando(true);
    setIdEditando(c.id_cliente);
    setNombre(c.nombre || '');
    setTelefono(c.telefono || '');
    setCorreo(c.correo || '');
    setModalAbierto(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setIdEditando(null);
    setNombre(''); setTelefono(''); setCorreo('');
    setModalAbierto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre) return mostrarAlerta("El nombre es vital :)", "error");
    const datos = { nombre, telefono, correo };
    try {
      if (editando) {
        await api.put(`/clientes/actualizar/${idEditando}`, datos);
        mostrarAlerta("¡Perfil de cliente actualizado! :)");
      } else {
        await api.post('/clientes/insertar', datos);
        mostrarAlerta("¡Nuevo cliente en la familia! :)");
      }
      cancelarEdicion();
      cargarClientes();
    } catch (err) {
      mostrarAlerta("Hubo un problema con los datos :(", "error");
    }
  };

  const ejecutarEliminacion = async () => {
    try {
      await api.delete(`/clientes/eliminar/${idAEliminar}`);
      mostrarAlerta("Cliente removido con éxito :)");
      setModalEliminar(false);
      cargarClientes();
    } catch (err) {
      mostrarAlerta("No se puede eliminar: Cliente tiene citas activas :(", "error");
      setModalEliminar(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04121F] text-white p-6 md:p-12 font-['Montserrat']">
      <Alerta 
        mensaje={alerta.mensaje} tipo={alerta.tipo} visible={alerta.visible} 
        onHide={() => setAlerta({ ...alerta, visible: false })} 
      />

      <div className="max-w-7xl mx-auto">
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
                    <Users className="w-3 h-3" /> CRM CodBarber
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase">
                    Nuestros <span className="text-[#1E90FF]">Clientes</span>
                </h1>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#1E90FF] transition-colors" />
              <input 
                type="text"
                placeholder="Buscar cliente..."
                className="bg-white/5 border border-white/10 py-3 pl-12 pr-6 rounded-2xl outline-none focus:border-[#1E90FF]/50 transition-all text-sm w-full sm:w-64"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button 
                onClick={abrirFormularioNuevo}
                className="bg-[#1E90FF] hover:bg-blue-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" /> Registrar
            </button>
          </div>
        </div>

        <Tabla headers={['ID', 'Cliente / Miembro', 'Información de Contacto', 'Acciones']}>
          {clientesFiltrados.length > 0 ? clientesFiltrados.map((c) => (
            <tr key={c.id_cliente} className="group hover:bg-white/[0.02] transition-colors">
              <td className="p-6 text-zinc-600 font-bold text-xs italic">#{c.id_cliente}</td>
              <td className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center text-[#1E90FF] font-black text-lg border border-white/5 group-hover:border-[#1E90FF]/50 transition-all shadow-lg">
                    {c.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-200 text-lg group-hover:text-white transition-colors">{c.nombre}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Cliente Frecuente</span>
                  </div>
                </div>
              </td>
              <td className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                    <Phone className="w-4 h-4 text-[#1E90FF]/50" /> {c.telefono || 'Sin teléfono'}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs italic">
                    <Mail className="w-4 h-4 text-[#1E90FF]/50" /> {c.correo || 'Sin correo'}
                  </div>
                </div>
              </td>
              <td className="p-6">
                <div className="flex justify-end gap-3">
                  <button onClick={() => prepararEdicion(c)} className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20 shadow-lg shadow-blue-500/5">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setIdAEliminar(c.id_cliente); setModalEliminar(true); }} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-lg shadow-red-500/5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" className="p-20 text-center">
                <div className="flex flex-col items-center gap-3 opacity-20">
                    <Users className="w-16 h-16" />
                    <p className="italic font-bold tracking-widest uppercase text-xs">No se encontraron clientes :)</p>
                </div>
              </td>
            </tr>
          )}
        </Tabla>

        <Modal isOpen={modalAbierto} onClose={cancelarEdicion} title={editando ? 'Editar Perfil VIP' : 'Nuevo Cliente VIP'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1E90FF] w-5 h-5" />
                <input 
                  type="text" 
                  className="w-full bg-[#04121F] border border-white/10 p-5 pl-12 rounded-2xl focus:border-[#1E90FF] outline-none text-white font-bold transition-all"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Teléfono</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
                        <input 
                            type="text" 
                            className="w-full bg-[#04121F] border border-white/10 p-4 pl-12 rounded-2xl focus:border-[#1E90FF] outline-none text-white font-medium"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            placeholder="33 1234 5678"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">E-mail</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
                        <input 
                            type="email" 
                            className="w-full bg-[#04121F] border border-white/10 p-4 pl-12 rounded-2xl focus:border-[#1E90FF] outline-none text-white font-medium"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            placeholder="correo@ejemplo.com"
                        />
                    </div>
                </div>
            </div>
            <button type="submit" className="w-full bg-[#1E90FF] hover:bg-blue-600 p-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 transition-all italic">
              <Save className="w-5 h-5" /> {editando ? 'Guardar Cambios' : 'Confirmar Registro'}
            </button>
          </form>
        </Modal>

        <Modal isOpen={modalEliminar} onClose={() => setModalEliminar(false)} title="Dar de Baja">
            <div className="text-center">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                    <AlertTriangle className="text-rose-400 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black mb-2 italic">¿Eliminar cliente?</h3>
                <p className="text-zinc-500 font-medium mb-8 text-sm px-6">Esta acción es permanente. No podrás recuperar el historial de este cliente :)</p>
                <div className="flex gap-4">
                    <button onClick={() => setModalEliminar(false)} className="flex-1 bg-white/5 hover:bg-white/10 p-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all">Cancelar</button>
                    <button onClick={ejecutarEliminacion} className="flex-1 bg-rose-500 hover:bg-rose-600 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-500/20 transition-all">Eliminar de la Base</button>
                </div>
            </div>
        </Modal>
      </div>
    </div>
  );
}