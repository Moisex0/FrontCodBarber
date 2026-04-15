import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit, Save, Scissors, DollarSign, 
  AlignLeft, MapPin, Loader2, Info 
} from 'lucide-react';
import api from '../api';
import Tabla from '../components/Tabla';
import Modal from '../components/Modal';
import Alerta from '../components/Alerta';

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [barberias, setBarberias] = useState([]); 
  
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [idBarberia, setIdBarberia] = useState('');

  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState({ mensaje: '', tipo: 'success', visible: false });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo, visible: true });
  };

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resServicios, resBarberias] = await Promise.all([
        api.get('/servicios/todos'),
        api.get('/barberias')
      ]);
      setServicios(resServicios.data || []);
      setBarberias(resBarberias.data || []);
    } catch (err) {
      mostrarAlerta("Error al sincronizar el catálogo :(", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const abrirFormularioNuevo = () => {
    cancelarEdicion();
    setModalAbierto(true);
  };

  const prepararEdicion = (s) => {
    setEditando(true);
    setIdEditando(s.id_servicio);
    setNombre(s.nombre || '');
    setDescripcion(s.descripcion || '');
    setPrecio(s.precio || '');
    setIdBarberia(s.id_barberia || ''); 
    setModalAbierto(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setIdEditando(null);
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setIdBarberia('');
    setModalAbierto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const datos = { 
      nombre, 
      descripcion, 
      precio: parseFloat(precio), 
      id_barberia: idBarberia === "" ? null : parseInt(idBarberia) 
    };

    try {
      if (editando) {
        await api.put(`/servicios/actualizar/${idEditando}`, datos);
        mostrarAlerta("Servicio actualizado correctamente :)");
      } else {
        await api.post('/servicios/insertar', datos);
        mostrarAlerta("¡Nuevo estilo añadido al catálogo! :)");
      }
      cancelarEdicion();
      cargarDatos();
    } catch (err) {
      mostrarAlerta("No se pudo procesar la solicitud :(", "error");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Retirar este servicio del menú? Los clientes ya no podrán agendarlo :)")) {
      try {
        await api.delete(`/servicios/eliminar/${id}`);
        mostrarAlerta("Servicio eliminado del catálogo");
        cargarDatos();
      } catch (err) {
        mostrarAlerta("Error al eliminar :(", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#04121F] text-white p-10 font-['Montserrat'] relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#1E90FF]/5 blur-[100px] rounded-full pointer-events-none"></div>

      <Alerta 
        mensaje={alerta.mensaje} tipo={alerta.tipo} visible={alerta.visible} 
        onHide={() => setAlerta({ ...alerta, visible: false })} 
      />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-4">
              <div className="p-3 bg-[#1E90FF]/10 rounded-2xl border border-[#1E90FF]/20 shadow-[0_0_15px_rgba(30,144,255,0.2)]">
                <Scissors className="w-8 h-8 text-[#1E90FF]" />
              </div>
              Menú de <span className="text-[#1E90FF]">Estilos</span>
            </h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-3 ml-1">Configuración técnica de servicios y tarifas</p>
          </div>
          
          <button 
            onClick={abrirFormularioNuevo}
            className="bg-[#1E90FF] hover:bg-blue-600 text-white px-8 py-4 rounded-[22px] font-black uppercase text-xs tracking-widest transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-3 active:scale-95 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Nuevo Servicio
          </button>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
          <Tabla headers={['ID', 'Especificaciones del Servicio', 'Inversión', 'Ubicación', 'Acciones']}>
            {cargando ? (
              <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-zinc-700" /></td></tr>
            ) : servicios.length > 0 ? servicios.map((s) => (
              <tr key={s.id_servicio} className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0 group">
                <td className="p-6 text-zinc-600 font-mono text-xs">#{s.id_servicio}</td>
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="font-black text-zinc-100 uppercase tracking-tight text-lg">{s.nombre}</span>
                    <span className="text-xs text-zinc-500 italic flex items-center gap-1">
                      <Info className="w-3 h-3" /> {s.descripcion || 'Sin especificaciones técnicas'}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <span className="text-2xl font-black text-[#1E90FF] tracking-tighter">${Number(s.precio).toFixed(2)}</span>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 w-fit">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {s.barberia || s.nombre_barberia || 'Sucursal Global'}
                    </span>
                  </div>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => prepararEdicion(s)} className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl hover:bg-blue-500 hover:text-white transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEliminar(s.id_servicio)} className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="p-20 text-center text-zinc-600 font-bold uppercase tracking-widest italic opacity-50">Menú vacío por ahora...</td></tr>
            )}
          </Tabla>
        </div>

        {/* MODAL :) */}
        <Modal 
          isOpen={modalAbierto} 
          onClose={cancelarEdicion} 
          title={editando ? 'Modificar Parámetros' : 'Añadir al Menú'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Nombre Comercial</label>
              <div className="relative group">
                <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-[#1E90FF] transition-colors" />
                <input 
                  type="text" 
                  className="w-full bg-[#04121F] border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-[#1E90FF] transition-all font-bold placeholder:text-zinc-800"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Fade Master + Beard Trim"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Descripción del Servicio</label>
              <div className="relative group">
                <AlignLeft className="absolute left-4 top-5 w-5 h-5 text-zinc-600 group-focus-within:text-[#1E90FF] transition-colors" />
                <textarea 
                  className="w-full bg-[#04121F] border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-[#1E90FF] transition-all font-medium h-32 resize-none placeholder:text-zinc-800"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe los beneficios y detalles..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Tarifa ($)</label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 transition-colors" />
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full bg-[#04121F] border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all font-black text-xl tracking-tighter"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Sucursal</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-[#1E90FF] transition-colors" />
                  <select 
                    className="w-full bg-[#04121F] border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-[#1E90FF] transition-all font-bold appearance-none cursor-pointer"
                    value={idBarberia}
                    onChange={(e) => setIdBarberia(e.target.value)}
                  >
                    <option value="">Global (Todas)</option>
                    {barberias.map(b => (
                      <option key={b.id_barberia} value={b.id_barberia}>{b.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-[#1E90FF] p-6 rounded-[24px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 mt-4 italic flex items-center justify-center gap-4 active:scale-95"
            >
              <Save className="w-6 h-6" /> 
              {editando ? 'Actualizar Sistema' : 'Publicar Servicio'}
            </button>
          </form>
        </Modal>
      </div>
    </div>
  );
}