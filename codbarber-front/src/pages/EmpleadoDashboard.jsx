import React, { useState, useEffect } from 'react';
import { Scissors, Calendar, LogOut, Plus, Menu, DollarSign, CreditCard, Briefcase, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Alerta from '../components/Alerta';
import Tabla from '../components/Tabla';
import Modal from '../components/Modal';
import BotonPaypal from '../components/BotonPaypal';

export default function EmpleadoDashboard() {
  const { user, logout } = useAuth();
  const [seccion, setSeccion] = useState('agenda');
  const [menuAbierto, setMenuAbierto] = useState(true);
  const [misCitasHoy, setMisCitasHoy] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [alerta, setAlerta] = useState({ mensaje: '', tipo: 'success', visible: false });
  const [modalPago, setModalPago] = useState(false);
  const [modalNuevaCita, setModalNuevaCita] = useState(false);
  const [citaACobrar, setCitaACobrar] = useState(null);
  const [formCita, setFormCita] = useState({ id_cliente: '', id_servicio: '', fecha: '', hora: '' });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo, visible: true });
  };

  const cargarDatos = async () => {
    if (!user) return; 
    
    try {
      const [resCitas, resServicios, resClientes] = await Promise.all([
        api.get('/citas/todas'),
        api.get('/servicios/todos'),
        api.get('/clientes')
      ]);

      const dataCitas = resCitas.data.rows || resCitas.data || [];
      const dataServicios = resServicios.data.rows || resServicios.data || [];
      const dataClientes = resClientes.data.rows || resClientes.data || [];

      setMisCitasHoy(Array.isArray(dataCitas) ? dataCitas : []);
      setServicios(Array.isArray(dataServicios) ? dataServicios : []);
      setClientes(Array.isArray(dataClientes) ? dataClientes : []);
    } catch (err) {
      console.error("Error de sincronización:", err);
    }
  };

  useEffect(() => { 
    cargarDatos(); 
  }, [user]); 

  const handleNuevaCita = async (e) => {
    e.preventDefault();
    try {
      const srv = servicios.find(s => s.id_servicio == formCita.id_servicio);
      
      const data = {
        id_barberia: parseInt(user?.id_barberia || 1),
        id_cliente: parseInt(formCita.id_cliente), 
        id_barbero: parseInt(user?.id_barbero || user?.id_usuario || 0),
        id_servicio: parseInt(formCita.id_servicio),
        fecha: formCita.fecha,
        hora: formCita.hora,
        precio: srv ? parseFloat(srv.precio) : 0,
        estado: 'Pendiente'
      };

      if (isNaN(data.id_cliente) || isNaN(data.id_barbero) || isNaN(data.id_servicio)) {
        mostrarAlerta("Error: Faltan datos de selección", "error");
        return;
      }

      await api.post('/citas/insertar', data);
      mostrarAlerta("¡Cita agendada!");
      setModalNuevaCita(false);
      setFormCita({ id_cliente: '', id_servicio: '', fecha: '', hora: '' });
      setTimeout(() => cargarDatos(), 500); 

    } catch (err) {
      mostrarAlerta("Error: " + (err.response?.data?.mensaje || "Faltan datos"), "error");
    }
  };

  const finalizarYPay = async (metodo) => {
    try {
      await api.post('/pagos/insertar', { id_cita: citaACobrar.id_cita, monto: citaACobrar.precio, metodo_pago: metodo });
      await api.patch(`/citas/estado/${citaACobrar.id_cita}`, { estado: 'Completada' });
      mostrarAlerta(`Venta cerrada en ${metodo}`);
      setModalPago(false);
      cargarDatos();
    } catch (err) { mostrarAlerta("Error en pago", "error"); }
  };

  return (
    <div className="flex min-h-screen bg-[#04121F] text-white font-['Montserrat']">
      <Alerta mensaje={alerta.mensaje} tipo={alerta.tipo} visible={alerta.visible} onHide={() => setAlerta({ ...alerta, visible: false })} />
      
      <aside className={`${menuAbierto ? 'w-72' : 'w-24'} bg-[#0A1A2A] border-r border-white/5 transition-all flex flex-col z-20`}>
        <div className="p-8 flex items-center gap-4">
          <div className="bg-[#1E90FF] p-2 rounded-lg"><Scissors className="text-white w-6 h-6" /></div>
          {menuAbierto && <span className="font-black text-xl uppercase italic">Cod<span className="text-[#1E90FF]">Barber</span></span>}
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-6">
          <button onClick={() => setSeccion('agenda')} className={`w-full flex items-center gap-4 p-4 rounded-2xl ${seccion === 'agenda' ? 'bg-[#1E90FF]' : 'text-zinc-500'}`}><Calendar className="w-5 h-5" />{menuAbierto && <span className="font-bold text-sm">Agenda</span>}</button>
          <button onClick={() => setSeccion('servicios')} className={`w-full flex items-center gap-4 p-4 rounded-2xl ${seccion === 'servicios' ? 'bg-[#1E90FF]' : 'text-zinc-500'}`}><Briefcase className="w-5 h-5" />{menuAbierto && <span className="font-bold text-sm">Servicios</span>}</button>
        </nav>
        <div className="p-4"><button onClick={logout} className="w-full flex items-center gap-4 p-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl"><LogOut className="w-5 h-5" />{menuAbierto && <span className="font-bold text-sm">Salir</span>}</button></div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-[#04121F]/80 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="p-3 border border-white/5 rounded-2xl"><Menu className="w-5 h-5 text-zinc-400" /></button>
            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">Panel / <span className="text-white">{seccion}</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-[10px] font-black text-[#1E90FF] uppercase">Barbero</p>
                <p className="text-sm font-bold italic">{user?.nombre || user?.nombre_usuario || 'Staff'}</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black">{(user?.nombre || user?.nombre_usuario || 'B').charAt(0)}</div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full">
          {seccion === 'agenda' && (
            <>
              <div className="flex justify-between items-end mb-10">
                <h2 className="text-4xl font-black italic uppercase">Control de <span className="text-[#1E90FF]">Citas</span></h2>
                <button onClick={() => setModalNuevaCita(true)} className="bg-[#1E90FF] px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-3"><Plus className="w-5 h-5" /> Nuevo Turno</button>
              </div>
              <div className="bg-[#0A1A2A] border border-white/5 rounded-[40px] overflow-hidden">
                <Tabla headers={['Horario', 'Fecha', 'Cliente', 'Servicio', 'Monto', 'Estado', 'Acciones']}>
                  {misCitasHoy.length > 0 ? misCitasHoy.map((c) => (
                    <tr key={c.id_cita} className="border-b border-white/5 last:border-0">
                      <td className="p-6 font-black italic text-lg">{c.hora}</td>
                      <td className="p-6 text-zinc-400 text-sm">{c.fecha?.split('T')[0]}</td>
                      <td className="p-6 font-bold">{c.cliente || 'Invitado'}</td>
                      <td className="p-6 italic">{c.servicio_nombre || 'Servicio'}</td>
                      <td className="p-6 font-black text-emerald-400 text-xl">${c.precio}</td>
                      <td className="p-6 font-black uppercase text-[10px] tracking-widest">{c.estado}</td>
                      <td className="p-6">
                        {c.estado?.toLowerCase() === 'pendiente' && (
                          <button onClick={() => { setCitaACobrar(c); setModalPago(true); }} className="bg-emerald-500/10 text-emerald-400 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase">Cobrar</button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="p-10 text-center text-zinc-500 italic">No tienes citas para hoy.</td></tr>
                  )}
                </Tabla>
              </div>
            </>
          )}

          {seccion === 'servicios' && (
            <>
              <div className="mb-10">
                <h2 className="text-4xl font-black italic uppercase">Nuestros <span className="text-[#1E90FF]">Servicios</span></h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicios.map((s) => (
                  <div key={s.id_servicio} className="bg-[#0A1A2A] border border-white/5 p-8 rounded-[35px] hover:border-[#1E90FF]/50 transition-all group">
                    <div className="bg-[#1E90FF]/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#1E90FF] transition-colors">
                      <Scissors className="text-[#1E90FF] group-hover:text-white w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black italic uppercase mb-2">{s.nombre}</h3>
                    <p className="text-zinc-500 text-sm mb-6 line-clamp-2">{s.descripcion || 'Servicio profesional de barbería.'}</p>
                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">{s.duracion_estimada || '30'} MIN</span>
                      </div>
                      <span className="text-2xl font-black text-emerald-400">${s.precio}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Modal isOpen={modalNuevaCita} onClose={() => setModalNuevaCita(false)} title="Nuevo Turno">
        <form onSubmit={handleNuevaCita} className="space-y-6">
          <select className="w-full bg-[#04121F] border border-white/10 p-5 rounded-2xl text-white outline-none" value={formCita.id_cliente} onChange={(e) => setFormCita({...formCita, id_cliente: e.target.value})} required>
            <option value="">¿Quién se corta hoy?</option>
            {clientes.map(cl => <option key={cl.id_cliente} value={cl.id_cliente}>{cl.nombre}</option>)}
          </select>
          <select className="w-full bg-[#04121F] border border-white/10 p-5 rounded-2xl text-white outline-none" value={formCita.id_servicio} onChange={(e) => setFormCita({...formCita, id_servicio: e.target.value})} required>
            <option value="">Servicio...</option>
            {servicios.map(s => <option key={s.id_servicio} value={s.id_servicio}>{s.nombre} (${s.precio})</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" className="w-full bg-[#04121F] border border-white/10 p-5 rounded-2xl text-white outline-none" value={formCita.fecha} onChange={(e) => setFormCita({...formCita, fecha: e.target.value})} required />
            <input type="time" className="w-full bg-[#04121F] border border-white/10 p-5 rounded-2xl text-white outline-none" value={formCita.hora} onChange={(e) => setFormCita({...formCita, hora: e.target.value})} required />
          </div>
          <button type="submit" className="w-full bg-[#1E90FF] p-6 rounded-3xl font-black uppercase">Confirmar Turno</button>
        </form>
      </Modal>

      <Modal isOpen={modalPago} onClose={() => setModalPago(false)} title="Cobro">
        {citaACobrar && (
          <div className="text-center">
            <div className="bg-white/5 p-10 rounded-[40px] border border-white/10 mb-10">
              <h2 className="text-7xl font-black">${citaACobrar.precio}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => finalizarYPay('Efectivo')} 
                className="flex flex-col items-center gap-4 p-8 bg-white/5 rounded-[35px] hover:bg-emerald-500/10 transition-all"
              >
                <DollarSign className="text-emerald-400 w-8 h-8" />
                <span className="font-black uppercase text-[10px]">Efectivo</span>
              </button>

              <BotonPaypal 
                cita={citaACobrar} 
                onSuccess={(nombre) => {
                  mostrarAlerta(`¡Pago procesado!`);
                  setModalPago(false);
                  cargarDatos();
                }} 
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}