import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit, Calendar, Clock, User, Scissors, 
  DollarSign, CheckCircle, Save, UserCheck, ArrowLeft, 
  AlertTriangle, Tag, MapPin, CreditCard 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

import Tabla from '../components/Tabla';
import Modal from '../components/Modal';
import Alerta from '../components/Alerta';
import BotonPaypal from '../components/BotonPaypal';

export default function Citas() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [barberias, setBarberias] = useState([]); 
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [metodoPago, setMetodoPago] = useState({});

  const [id_barberia, setIdBarberia] = useState(''); 
  const [id_cliente, setIdCliente] = useState('');
  const [id_barbero, setIdBarbero] = useState('');
  const [id_servicio, setIdServicio] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [precio, setPrecio] = useState('');
  const [estado, setEstado] = useState('Pendiente');

  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const [alerta, setAlerta] = useState({ mensaje: '', tipo: 'success', visible: false });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo, visible: true });
  };

  const cargarDatosIniciales = async () => {
    try {
      const resCitas = await api.get('/citas/todas');
      const resClie = await api.get('/clientes');
      const resBarbSedes = await api.get('/barberias');

      // CORRECCIÓN: PostgreSQL rows
      const dataCitas = resCitas.data.rows || resCitas.data || [];
      setCitas(dataCitas);
      
      setClientes(resClie.data.rows || resClie.data || []);
      setBarberias(resBarbSedes.data.rows || resBarbSedes.data || []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      mostrarAlerta("Error al sincronizar datos :(", "error");
    }
  };

  useEffect(() => {
    const cargarDependientes = async () => {
      if (id_barberia) {
        try {
          const resBarb = await api.get(`/barberos/sucursal/${id_barberia}`);
          const resServ = await api.get(`/servicios/sucursal/${id_barberia}`);
          setBarberos(resBarb.data.rows || resBarb.data || []);
          setServicios(resServ.data.rows || resServ.data || []);
        } catch (err) {}
      }
    };
    cargarDependientes();
  }, [id_barberia]);

  useEffect(() => { 
    cargarDatosIniciales(); 
  }, []);

  const finalizarPagoEfectivo = async (idCita) => {
    try {
      await api.patch(`/citas/estado/${idCita}`, { estado: 'Completada' });
      mostrarAlerta("Pago en efectivo registrado con éxito :)");
      cargarDatosIniciales();
    } catch (error) {
      mostrarAlerta("Error al procesar pago", "error");
    }
  };

  const prepararEdicion = (c) => {
    setEditando(true);
    setIdEditando(c.id_cita);
    setIdBarberia(c.id_barberia || ''); 
    setIdCliente(c.id_cliente || '');
    setIdBarbero(c.id_barbero || '');
    setIdServicio(c.id_servicio || '');
    setFecha(c.fecha ? c.fecha.split('T')[0] : '');
    setHora(c.hora || '');
    setPrecio(c.precio || '');
    setEstado(c.estado || 'Pendiente');
    setModalAbierto(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setIdEditando(null);
    setIdBarberia(''); setIdCliente(''); setIdBarbero(''); setIdServicio('');
    setFecha(''); setHora(''); setPrecio(''); setEstado('Pendiente');
    setModalAbierto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const datos = { 
        id_barberia: parseInt(id_barberia),
        id_cliente: parseInt(id_cliente), 
        id_barbero: parseInt(id_barbero), 
        id_servicio: parseInt(id_servicio), 
        fecha, 
        hora, 
        precio: parseFloat(precio), 
        estado 
    };
    try {
      if (editando) {
        await api.put(`/citas/actualizar/${idEditando}`, datos);
        mostrarAlerta("¡Agenda actualizada! :)");
      } else {
        await api.post('/citas/insertar', datos);
        mostrarAlerta("¡Nueva cita agendada! :)");
      }
      cancelarEdicion();
      cargarDatosIniciales();
    } catch (err) {
      mostrarAlerta("Error en la cita :(", "error");
    }
  };

  const ejecutarEliminacion = async () => {
    try {
      await api.delete(`/citas/eliminar/${idAEliminar}`);
      mostrarAlerta("Cita eliminada :)");
      setModalEliminar(false);
      cargarDatosIniciales();
    } catch (err) { mostrarAlerta("Error al eliminar :(", "error"); }
  };

  const getEstadoStyles = (est) => {
    const e = est ? est.toLowerCase() : '';
    if (e === 'completada') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (e === 'cancelada') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="min-h-screen bg-[#04121F] text-white p-4 md:p-12 font-['Montserrat']">
      <Alerta 
        mensaje={alerta.mensaje} tipo={alerta.tipo} visible={alerta.visible} 
        onHide={() => setAlerta({ ...alerta, visible: false })} 
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-3 bg-white/5 hover:bg-[#1E90FF]/20 text-zinc-400 hover:text-[#1E90FF] rounded-2xl transition-all border border-white/5">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
                <div className="flex items-center gap-2 text-[#1E90FF] text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                    <Clock className="w-3 h-3" /> Agenda CodBarber
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase">
                    Control de <span className="text-[#1E90FF]">Citas</span>
                </h1>
            </div>
          </div>
          <button onClick={() => { cancelarEdicion(); setModalAbierto(true); }} className="group flex items-center gap-3 bg-[#1E90FF] hover:bg-blue-600 px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 font-black uppercase text-xs tracking-widest">
            <Plus className="w-5 h-5" /> Nueva Cita
          </button>
        </div>

        <Tabla headers={['ID', 'Cliente / Barbero', 'Servicio & Precio', 'Fecha y Hora', 'Pago y Estado', 'Acciones']}>
          {citas.length > 0 ? citas.map((c) => (
            <tr key={c.id_cita} className="group hover:bg-white/[0.02] transition-colors border-b border-white/5">
              <td className="p-6 text-zinc-600 font-bold text-xs">#{c.id_cita}</td>
              <td className="p-6">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-zinc-200 group-hover:text-[#1E90FF] transition-colors">
                    {/* CORRECCIÓN: Nombres de campos según SQL */}
                    {c.cliente || 'Invitado'}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Scissors className="w-3 h-3" /> {c.barbero || 'Sin asignar'}
                  </span>
                </div>
              </td>
              <td className="p-6">
                <div className="flex flex-col">
                  {/* CORRECCIÓN: Nombres de campos según SQL */}
                  <span className="text-sm font-medium text-zinc-400">{c.servicio_nombre || 'Servicio'}</span>
                  <span className="text-[#1E90FF] font-black text-sm">${Number(c.precio).toFixed(2)}</span>
                </div>
              </td>
              <td className="p-6">
                <div className="space-y-1 text-xs font-bold uppercase tracking-tighter">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-[#1E90FF]/50" /> {c.fecha?.split('T')[0]}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Clock className="w-3.5 h-3.5 text-[#1E90FF]/50" /> {c.hora}
                  </div>
                </div>
              </td>
              <td className="p-6">
                <div className="flex flex-col gap-3 min-w-[150px]">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] uppercase font-black border tracking-widest text-center ${getEstadoStyles(c.estado)}`}>
                    {c.estado}
                  </span>
                  
                  {c.estado?.toLowerCase() === 'pendiente' && (
                    <div className="flex flex-col gap-2">
                      <select 
                        className="bg-[#0A1A2A] border border-white/10 text-[10px] font-black uppercase p-2 rounded-lg outline-none focus:border-[#1E90FF]"
                        value={metodoPago[c.id_cita] || ''}
                        onChange={(e) => setMetodoPago({...metodoPago, [c.id_cita]: e.target.value})}
                      >
                        <option value="">¿Cómo pagará?</option>
                        <option value="efectivo">💵 Efectivo</option>
                        <option value="paypal">💳 PayPal / Tarjeta</option>
                      </select>

                      {metodoPago[c.id_cita] === 'efectivo' && (
                        <button 
                          onClick={() => finalizarPagoEfectivo(c.id_cita)}
                          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 p-2 rounded-lg text-[10px] font-black uppercase transition-all"
                        >
                          <CheckCircle className="w-3 h-3" /> Finalizar
                        </button>
                      )}

                      {metodoPago[c.id_cita] === 'paypal' && (
                        <div className="scale-75 origin-top-left -mb-10">
                          <BotonPaypal cita={c} onSuccess={() => cargarDatosIniciales()} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </td>
              <td className="p-6 text-right">
                <div className="flex justify-end gap-3">
                  <button onClick={() => prepararEdicion(c)} className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setIdAEliminar(c.id_cita); setModalEliminar(true); }} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="6" className="p-10 text-center text-zinc-500 italic">No hay citas registradas para tu perfil.</td>
            </tr>
          )}
        </Tabla>

        <Modal isOpen={modalAbierto} onClose={cancelarEdicion} title={editando ? 'Modificar Registro' : 'Agendar Nueva Cita'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Sucursal</label>
                   <select className="w-full bg-[#04121F] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#1E90FF]" value={id_barberia} onChange={(e) => setIdBarberia(e.target.value)} required>
                    <option value="">Seleccionar Sucursal</option>
                    {barberias.map(b => <option key={b.id_barberia} value={b.id_barberia}>{b.nombre}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Cliente</label>
                   <select className="w-full bg-[#04121F] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#1E90FF]" value={id_cliente} onChange={(e) => setIdCliente(e.target.value)} required>
                    <option value="">Seleccionar Cliente</option>
                    {clientes.map(cl => <option key={cl.id_cliente} value={cl.id_cliente}>{cl.nombre}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Barbero</label>
                   <select className="w-full bg-[#04121F] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#1E90FF]" value={id_barbero} onChange={(e) => setIdBarbero(e.target.value)} required>
                    <option value="">Seleccionar Barbero</option>
                    {barberos.map(ba => <option key={ba.id_barbero} value={ba.id_barbero}>{ba.nombre}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Servicio</label>
                   <select className="w-full bg-[#04121F] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#1E90FF]" value={id_servicio} 
                    onChange={(e) => {
                      const s = servicios.find(srv => srv.id_servicio == e.target.value);
                      setIdServicio(e.target.value);
                      if(s) setPrecio(s.precio);
                    }} required>
                    <option value="">Seleccionar Servicio</option>
                    {servicios.map(sr => <option key={sr.id_servicio} value={sr.id_servicio}>{sr.nombre} (${sr.precio})</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Fecha</label>
                   <input type="date" className="w-full bg-[#04121F] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#1E90FF]" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Hora</label>
                   <input type="time" className="w-full bg-[#04121F] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#1E90FF]" value={hora} onChange={(e) => setHora(e.target.value)} required />
                </div>
            </div>
            <button type="submit" className="w-full bg-[#1E90FF] hover:bg-blue-600 p-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/20">
              <Save className="w-5 h-5" /> {editando ? 'Guardar Cambios' : 'Confirmar Reserva'}
            </button>
          </form>
        </Modal>

        <Modal isOpen={modalEliminar} onClose={() => setModalEliminar(false)} title="Anular Cita">
            <div className="text-center">
                <AlertTriangle className="text-rose-400 w-10 h-10 mx-auto mb-4" />
                <h3 className="text-2xl font-black mb-2 italic">¿Remover de la agenda?</h3>
                <p className="text-zinc-500 text-sm mb-8">Esta acción no se puede deshacer.</p>
                <div className="flex gap-4 mt-8">
                    <button onClick={() => setModalEliminar(false)} className="flex-1 bg-white/5 p-4 rounded-2xl font-bold uppercase text-xs">Mantener</button>
                    <button onClick={ejecutarEliminacion} className="flex-1 bg-rose-500 p-4 rounded-2xl font-black uppercase text-xs">Sí, Eliminar</button>
                </div>
            </div>
        </Modal>
      </div>
    </div>
  );
}