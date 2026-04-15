import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, MapPin, Save, Scissors, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

import Tabla from '../components/Tabla';
import Modal from '../components/Modal';
import Alerta from '../components/Alerta';

export default function Barberias() {
  const navigate = useNavigate();
  const [barberias, setBarberias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  
  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);

  const [alerta, setAlerta] = useState({ mensaje: '', tipo: 'success', visible: false });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo, visible: true });
  };

  const obtenerBarberias = async () => {
    try {
      const res = await api.get('/barberias');
      setBarberias(res.data);
    } catch (err) {
      console.error("Error al traer barberías:", err);
      mostrarAlerta("Error al conectar con el servidor :(", "error");
    }
  };

  useEffect(() => {
    obtenerBarberias();
  }, []);

  const abrirFormularioNuevo = () => {
    cancelarEdicion();
    setModalAbierto(true);
  };

  const prepararEdicion = (b) => {
    setEditando(true);
    setIdEditando(b.id_barberia);
    setNombre(b.nombre);
    setDireccion(b.direccion);
    setModalAbierto(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setIdEditando(null);
    setNombre('');
    setDireccion('');
    setModalAbierto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !direccion) return mostrarAlerta("Llena todos los campos :)", "error");

    try {
      if (editando) {
        await api.put(`/barberias/actualizar/${idEditando}`, { nombre, direccion });
        mostrarAlerta("¡Barbería actualizada con éxito! :)");
      } else {
        await api.post('/barberias/insertar', { nombre, direccion });
        mostrarAlerta("¡Barbería registrada correctamente! :)");
      }
      cancelarEdicion();
      obtenerBarberias();
    } catch (err) {
      mostrarAlerta("Hubo un error en la operación :(", "error");
    }
  };

  const confirmarEliminacion = (id) => {
    setIdAEliminar(id);
    setModalEliminar(true);
  };

  const ejecutarEliminacion = async () => {
    try {
      await api.delete(`/barberias/eliminar/${idAEliminar}`);
      mostrarAlerta("Barbería eliminada del sistema :)");
      setModalEliminar(false);
      obtenerBarberias();
    } catch (err) {
      mostrarAlerta("No se puede eliminar: tiene datos asociados :(", "error");
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
                    <Scissors className="w-3 h-3" /> Infraestructura
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter">
                    Barber<span className="text-[#1E90FF]">ías</span>
                </h1>
            </div>
          </div>
          
          <button 
            onClick={abrirFormularioNuevo}
            className="group flex items-center gap-3 bg-[#1E90FF] hover:bg-blue-600 px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 font-black uppercase text-xs tracking-widest"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Nueva Sucursal
          </button>
        </div>

        <Tabla headers={['ID', 'Barbería', 'Ubicación', 'Acciones']}>
          {barberias.map((b) => (
            <tr key={b.id_barberia} className="group hover:bg-white/[0.02] transition-colors">
              <td className="p-6 text-zinc-600 font-bold text-xs">#{b.id_barberia}</td>
              <td className="p-6">
                <span className="text-lg font-bold group-hover:text-[#1E90FF] transition-colors">{b.nombre}</span>
              </td>
              <td className="p-6">
                <div className="flex items-center gap-3 text-zinc-400 font-medium">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#1E90FF]/10 transition-colors">
                    <MapPin className="w-4 h-4 text-[#1E90FF]" />
                  </div>
                  {b.direccion}
                </div>
              </td>
              <td className="p-6">
                <div className="flex gap-3">
                  <button 
                    onClick={() => prepararEdicion(b)}
                    className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => confirmarEliminacion(b.id_barberia)}
                    className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Tabla>

        <Modal 
          isOpen={modalAbierto} 
          onClose={cancelarEdicion} 
          title={editando ? 'Modificar Sucursal' : 'Nueva Sucursal'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nombre Comercial</label>
              <input 
                type="text" 
                className="w-full bg-[#04121F] border border-white/10 p-4 rounded-2xl focus:border-[#1E90FF] outline-none text-white transition-all font-medium"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. CodBarber Central"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Dirección Física</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5" />
                <input 
                    type="text" 
                    className="w-full bg-[#04121F] border border-white/10 p-4 pl-12 rounded-2xl focus:border-[#1E90FF] outline-none text-white transition-all font-medium"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Calle, Número, Colonia..."
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-[#1E90FF] hover:bg-blue-600 p-5 rounded-2xl transition-all font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
            >
              <Save className="w-5 h-5" /> 
              {editando ? 'Actualizar Datos' : 'Registrar Ahora'}
            </button>
          </form>
        </Modal>

        <Modal isOpen={modalEliminar} onClose={() => setModalEliminar(false)} title="Atención: Acción Crítica">
            <div className="text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <AlertTriangle className="text-red-500 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black mb-2">¿Eliminar barbería?</h3>
                <p className="text-zinc-500 font-medium mb-8 text-sm">Esta acción es irreversible y podría afectar a los barberos y citas vinculados a este local :)</p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setModalEliminar(false)}
                        className="flex-1 bg-white/5 hover:bg-white/10 p-4 rounded-2xl font-bold transition-all uppercase text-xs tracking-widest"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={ejecutarEliminacion}
                        className="flex-1 bg-red-500 hover:bg-red-600 p-4 rounded-2xl font-black transition-all uppercase text-xs tracking-widest shadow-lg shadow-red-500/20"
                    >
                        Sí, Eliminar
                    </button>
                </div>
            </div>
        </Modal>
      </div>
    </div>
  );
}