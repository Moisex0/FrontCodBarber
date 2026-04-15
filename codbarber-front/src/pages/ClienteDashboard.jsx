import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, LogOut, Scissors, ShoppingBag, 
  Trash2, Star, Plus, MapPin, AlertTriangle
} from 'lucide-react'; 
import { useAuth } from '../context/AuthContext';
import api from '../api';

import Alerta from '../components/Alerta';
import Modal from '../components/Modal';
import BotonPaypal from '../components/BotonPaypal';
import InstagramFeed from '../components/InstagramFeed';

export default function ClienteDashboard() {
  const { user, logout } = useAuth();
  
  const [misCitas, setMisCitas] = useState([]);
  const [barberias, setBarberias] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [barberos, setBarberos] = useState([]);
  
  const [alerta, setAlerta] = useState({ mensaje: '', tipo: 'success', visible: false });
  const [modalNuevaCita, setModalNuevaCita] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false); 
  const [idACancelar, setIdACancelar] = useState(null); 
  const [cargando, setCargando] = useState(true);
  
  const [formCita, setFormCita] = useState({ 
    id_barberia: '', 
    id_barbero: '', 
    id_servicio: '', 
    fecha: '', 
    hora: '' 
  });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo, visible: true });
  };

  const cargarDatos = async () => {
    if (!user?.id_cliente) return;
    try {
      setCargando(true);
      const [resBarberias, resCitas] = await Promise.all([
        api.get('/barberias'),
        api.get('/citas/todas')
      ]);

      setBarberias(resBarberias.data || []);
      const todas = Array.isArray(resCitas.data) ? resCitas.data : (resCitas.data.rows || []);
      const filtradas = todas.filter(c => 
        Number(c.id_cliente) === Number(user.id_cliente)
      );
      
      setMisCitas(filtradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
    } catch (err) {
      mostrarAlerta("Error al sincronizar tu agenda :(", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const cargarDependientes = async () => {
      if (formCita.id_barberia) {
        try {
          const [resB, resS] = await Promise.all([
            api.get(`/barberos/sucursal/${formCita.id_barberia}`),
            api.get(`/servicios/sucursal/${formCita.id_barberia}`)
          ]);
          
          setBarberos(Array.isArray(resB.data) ? resB.data : (resB.data.rows || []));
          setServicios(Array.isArray(resS.data) ? resS.data : (resS.data.rows || []));
        } catch (err) {
          console.error("Error al cargar datos de sucursal");
        }
      } else {
        setBarberos([]);
        setServicios([]);
      }
    };
    cargarDependientes();
  }, [formCita.id_barberia]);

  useEffect(() => { cargarDatos(); }, [user]);

  const ejecutarCancelacion = async () => {
    try {
      await api.patch(`/citas/estado/${idACancelar}`, { estado: 'Cancelada' });
      mostrarAlerta("Cita cancelada. ¡Te esperamos pronto!", "success");
      setModalCancelar(false);
      cargarDatos();
    } catch (err) {
      mostrarAlerta("No pudimos procesar la cancelación", "error");
    }
  };

  const handleNuevaCita = async (e) => {
    e.preventDefault();
    try {
      const srv = servicios.find(s => s.id_servicio == formCita.id_servicio);
      const data = {
        id_barberia: parseInt(formCita.id_barberia),
        id_cliente: user.id_cliente, 
        id_barbero: parseInt(formCita.id_barbero),
        id_servicio: parseInt(formCita.id_servicio),
        fecha: formCita.fecha,
        hora: formCita.hora,
        precio: parseFloat(srv.precio),
        estado: 'Pendiente'
      };
      await api.post('/citas/insertar', data);
      mostrarAlerta("¡Reserva confirmada! Revisa tu agenda :)");
      setModalNuevaCita(false);
      setFormCita({ id_barberia: '', id_barbero: '', id_servicio: '', fecha: '', hora: '' });
      setTimeout(() => cargarDatos(), 500); 
    } catch (err) {
      mostrarAlerta("Error al reservar: Horario no disponible", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#04121F] text-white font-['Montserrat'] pb-20">
      <Alerta 
        mensaje={alerta.mensaje} tipo={alerta.tipo} visible={alerta.visible} 
        onHide={() => setAlerta({ ...alerta, visible: false })} 
      />

      <nav className="border-b border-white/5 bg-[#0A1A2A]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="bg-[#1E90FF] p-2.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                <Scissors className="text-white w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase italic">Cod<span className="text-[#1E90FF]">Barber</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end border-r border-white/10 pr-4">
                <span className="text-[9px] font-black text-[#1E90FF] uppercase tracking-[0.2em]">Suscripción Gold</span>
                <span className="text-sm font-bold tracking-tight">{user.nombre || 'Usuario'}</span>
            </div>
            <button onClick={logout} className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all active:scale-90">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <div className="lg:col-span-2">
                <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Mi <span className="text-[#1E90FF]">Agenda</span></h1>
                <p className="text-zinc-500 font-medium">Gestiona tus cortes y tratamientos desde un solo lugar.</p>
            </div>
            <div className="flex items-center justify-end">
                <button 
                    onClick={() => setModalNuevaCita(true)}
                    className="w-full lg:w-auto bg-[#1E90FF] hover:bg-blue-600 px-10 py-5 rounded-[24px] font-black flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-600/30 active:scale-95 group"
                >
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" /> AGENDAR CORTE
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cargando ? (
            <div className="col-span-full py-20 text-center animate-pulse text-zinc-600 font-black uppercase tracking-[0.3em]">Sincronizando...</div>
          ) : misCitas.length > 0 ? misCitas.map((cita) => (
            <div key={cita.id_cita} className="bg-[#0A1A2A] border border-white/5 rounded-[35px] p-1 hover:border-[#1E90FF]/30 transition-all group relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#1E90FF]/5 rounded-full blur-2xl group-hover:bg-[#1E90FF]/10 transition-colors" />
              <div className="p-7">
                <div className="flex justify-between items-center mb-8">
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
                    <ShoppingBag className="text-[#1E90FF] w-5 h-5" />
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border ${
                    cita.estado === 'Completada' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    cita.estado === 'Cancelada' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {cita.estado}
                  </div>
                </div>
                
                <h3 className="text-2xl font-black italic uppercase tracking-tight mb-1 truncate">
                  {cita.servicio_nombre || cita.nombre_servicio || 'Servicio'}
                </h3>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-8">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {cita.nombre_barbero || 'Especialista'}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Fecha</span>
                        <div className="flex items-center gap-2 font-bold text-xs">
                            <Calendar className="w-3.5 h-3.5 text-[#1E90FF]" /> {new Date(cita.fecha).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Hora</span>
                        <div className="flex items-center gap-2 font-bold text-xs">
                            <Clock className="w-3.5 h-3.5 text-[#1E90FF]" /> {cita.hora}
                        </div>
                    </div>
                </div>
                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Inversión</span>
                    <span className="text-2xl font-black text-emerald-400 tracking-tighter">${Number(cita.precio).toFixed(2)}</span>
                </div>
                {cita.estado === 'Pendiente' && (
                  <div className="flex flex-col gap-2">
                    <BotonPaypal 
                      cita={cita} 
                      onSuccess={(nombre) => {
                        mostrarAlerta(`¡Gracias ${nombre}! Pago procesado exitosamente.`);
                        cargarDatos();
                      }} 
                    />
                    <button 
                      onClick={() => { setIdACancelar(cita.id_cita); setModalCancelar(true); }}
                      className="w-full bg-transparent hover:bg-rose-500/10 text-zinc-600 hover:text-rose-500 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Cancelar Reserva
                    </button>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="col-span-full py-32 text-center bg-[#0A1A2A] rounded-[50px] border-2 border-dashed border-white/5 group hover:border-[#1E90FF]/20 transition-colors">
              <div className="bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                <Calendar className="w-10 h-10 text-zinc-700" />
              </div>
              <p className="text-zinc-400 text-xl font-bold italic uppercase tracking-tighter">Tu agenda está vacía</p>
              <button onClick={() => setModalNuevaCita(true)} className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#1E90FF] hover:text-white transition-all mt-6">
                Reservar Mi Primer Corte
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 bg-[#0A1A2A] p-8 rounded-[40px] border border-white/5">
            <h2 className="text-2xl font-black italic uppercase mb-8 text-[#1E90FF] flex items-center gap-3">
              <Star className="w-6 h-6 fill-[#1E90FF]" /> Tendencias & Estilo
            </h2>
            <InstagramFeed />
        </div>

      </main>

      <Modal isOpen={modalNuevaCita} onClose={() => setModalNuevaCita(false)} title="Nueva Reserva">
        <form onSubmit={handleNuevaCita} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2 italic">¿En qué sucursal?</label>
            <div className="relative">
                <select 
                    className="w-full bg-[#04121F] border border-white/10 p-5 rounded-3xl text-white outline-none focus:border-[#1E90FF] transition-all appearance-none font-bold" 
                    value={formCita.id_barberia} 
                    onChange={(e) => setFormCita({...formCita, id_barberia: e.target.value, id_barbero: '', id_servicio: ''})} 
                    required
                >
                <option value="">Selecciona ubicación...</option>
                {barberias.map(b => <option key={b.id_barberia} value={b.id_barberia}>{b.nombre.toUpperCase()}</option>)}
                </select>
                <MapPin className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none w-5 h-5" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2 italic">Barbero</label>
                <select 
                    disabled={!formCita.id_barberia}
                    className="w-full bg-[#04121F] border border-white/10 p-5 rounded-3xl text-white outline-none focus:border-[#1E90FF] transition-all appearance-none font-bold disabled:opacity-30" 
                    value={formCita.id_barbero} 
                    onChange={(e) => setFormCita({...formCita, id_barbero: e.target.value})} 
                    required
                >
                <option value="">{formCita.id_barberia ? '¿Quién te atiende?' : 'Elige sucursal'}</option>
                {barberos.map(b => <option key={b.id_barberero || b.id_barbero} value={b.id_barberero || b.id_barbero}>{b.nombre}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2 italic">Servicio</label>
                <select 
                    disabled={!formCita.id_barberia}
                    className="w-full bg-[#04121F] border border-white/10 p-5 rounded-3xl text-white outline-none focus:border-[#1E90FF] transition-all appearance-none font-bold disabled:opacity-30" 
                    value={formCita.id_servicio} 
                    onChange={(e) => setFormCita({...formCita, id_servicio: e.target.value})} 
                    required
                >
                <option value="">{formCita.id_barberia ? '¿Qué estilo?' : 'Elige sucursal'}</option>
                {servicios.map(s => <option key={s.id_servicio} value={s.id_servicio}>{s.nombre} — ${s.precio}</option>)}
                </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-center">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic block">Fecha</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-[#04121F] border border-white/10 p-5 rounded-3xl text-white outline-none focus:border-[#1E90FF] transition-all text-center font-bold" 
                  value={formCita.fecha} 
                  onChange={(e) => setFormCita({...formCita, fecha: e.target.value})} 
                  required 
                />
            </div>
            <div className="space-y-2 text-center">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic block">Hora</label>
                <input 
                  type="time" 
                  className="w-full bg-[#04121F] border border-white/10 p-5 rounded-3xl text-white outline-none focus:border-[#1E90FF] transition-all text-center font-bold" 
                  value={formCita.hora} 
                  onChange={(e) => setFormCita({...formCita, hora: e.target.value})} 
                  required 
                />
            </div>
          </div>
          <button type="submit" className="w-full bg-[#1E90FF] p-6 rounded-[28px] font-black uppercase tracking-[0.25em] italic hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/20 active:scale-95">
            CONFIRMAR RESERVA
          </button>
        </form>
      </Modal>

      <Modal isOpen={modalCancelar} onClose={() => setModalCancelar(false)} title="Cancelar Cita">
          <div className="text-center">
              <AlertTriangle className="text-rose-400 w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-black mb-2 italic">¿Anular Reserva?</h3>
              <p className="text-zinc-500 text-sm font-medium">Esta acción no se puede deshacer y el barbero será notificado.</p>
              <div className="flex gap-4 mt-8">
                  <button onClick={() => setModalCancelar(false)} className="flex-1 bg-white/5 p-4 rounded-2xl font-bold uppercase text-xs">Mantener</button>
                  <button onClick={ejecutarCancelacion} className="flex-1 bg-rose-500 p-4 rounded-2xl font-black uppercase text-xs">Confirmar Cancelación</button>
              </div>
          </div>
      </Modal>

    </div>
  );
}