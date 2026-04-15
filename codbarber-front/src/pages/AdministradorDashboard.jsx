import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Scissors, 
  CreditCard, 
  LogOut,
  MapPin,
  LayoutDashboard,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import api from '../api';
import Alerta from '../components/Alerta';
import BotonPaypal from '../components/BotonPaypal';

export default function AdministradorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 
  
  const [alerta, setAlerta] = useState({ mensaje: '', tipo: 'success', visible: false });
  const [busquedaCita, setBusquedaCita] = useState('');
  const [citaEncontrada, setCitaEncontrada] = useState(null);

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo, visible: true });
  };

  const buscarCitaCobro = async () => {
    if (!busquedaCita) return;
    try {
      const res = await api.get(`/citas/todas`);
      const cita = res.data.find(c => c.id_cita === parseInt(busquedaCita) && c.estado === 'Pendiente');
      if (cita) {
        setCitaEncontrada(cita);
      } else {
        mostrarAlerta("Cita no encontrada o ya pagada", "error");
        setCitaEncontrada(null);
      }
    } catch (err) {
      mostrarAlerta("Error al buscar cita", "error");
    }
  };

  const menuItems = [
    { title: 'Gestión de Barberos', desc: 'Administra el equipo y sus horarios.', icon: <Scissors />, color: 'from-indigo-600 to-blue-500', shadow: 'shadow-indigo-500/20', path: '/barberos' },
    { title: 'Gestión de Barberías', desc: 'Configura locales y ubicaciones.', icon: <MapPin />, color: 'from-cyan-600 to-blue-400', shadow: 'shadow-cyan-500/20', path: '/barberias' },
    { title: 'Gestión de Clientes', desc: 'Base de datos y perfiles VIP.', icon: <Users />, color: 'from-purple-600 to-indigo-400', shadow: 'shadow-purple-500/20', path: '/clientes' },
    { title: 'Gestión de Servicios', desc: 'Precios, tiempos y catálogo.', icon: <Briefcase />, color: 'from-orange-600 to-yellow-400', shadow: 'shadow-orange-500/20', path: '/servicios' },
    { title: 'Gestión de Citas', desc: 'Control total de la agenda.', icon: <Calendar />, color: 'from-blue-600 to-cyan-400', shadow: 'shadow-blue-500/20', path: '/citas' },
    { title: 'Pagos y Caja', desc: 'Reportes de ingresos y transacciones.', icon: <CreditCard />, color: 'from-emerald-600 to-teal-400', shadow: 'shadow-emerald-500/20', path: '/pagos' },
    { title: 'Gestión de Personal', desc: 'Crea barberos y admins manualmente.', icon: <UserPlus />, color: 'from-rose-600 to-pink-500', shadow: 'shadow-rose-500/20', path: '/gestion-usuarios' },
  ];

  return (
    <div className="min-h-screen bg-[#04121F] text-white font-['Montserrat'] selection:bg-[#1E90FF]/30">
      
      <Alerta 
        mensaje={alerta.mensaje} 
        tipo={alerta.tipo} 
        visible={alerta.visible} 
        onHide={() => setAlerta({ ...alerta, visible: false })} 
      />

      <nav className="bg-[#0A1A2A]/60 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-[#1E90FF] p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <Scissors className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">
            Cod<span className="text-[#1E90FF]">Barber</span>
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <div className="flex items-center gap-2 justify-end">
              <ShieldCheck className="w-3 h-3 text-[#1E90FF]" />
              <p className="text-[10px] font-black text-[#1E90FF] uppercase tracking-[0.2em]">Master Admin</p>
            </div>
            <p className="text-sm font-bold">{user?.nombre_usuario || 'Administrador'}</p>
          </div>
          
          <button 
            onClick={logout}
            className="group p-3 bg-red-500/10 hover:bg-red-500 rounded-2xl transition-all duration-500 border border-red-500/20 hover:border-red-500 shadow-lg hover:shadow-red-500/20"
          >
            <LogOut className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <header className="mb-14 relative">
          <div className="absolute -left-10 top-0 w-1 h-20 bg-gradient-to-b from-[#1E90FF] to-transparent rounded-full hidden md:block" />
          <div className="flex items-center gap-4 mb-4 text-zinc-500 font-bold tracking-widest text-xs uppercase">
             <LayoutDashboard className="w-4 h-4 text-[#1E90FF]" />
             <span>System Overview</span>
          </div>
          <h1 className="text-5xl font-black mb-3 tracking-tight">
            Panel de <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 italic">Control</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl font-medium leading-relaxed">
            Bienvenido al centro de mando. Aquí tienes todas las herramientas para gestionar <span className="text-[#1E90FF] font-bold">CodBarber Pro</span>.
          </p>
        </header>

        <section className="mb-12 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem]">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#1E90FF] mb-6 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Terminal de Cobro Presencial
          </h2>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="relative flex-1 w-full">
              <input 
                type="number" 
                placeholder="Ingresa ID de la cita (Ej: 45)..."
                className="w-full bg-[#04121F] border border-white/10 p-5 rounded-2xl outline-none focus:border-[#1E90FF] transition-all font-bold"
                value={busquedaCita}
                onChange={(e) => setBusquedaCita(e.target.value)}
              />
              <button 
                onClick={buscarCitaCobro}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#1E90FF] p-3 rounded-xl hover:bg-blue-600 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            
            {citaEncontrada && (
              <div className="w-full md:w-80 bg-[#0A1A2A] p-6 rounded-2xl border border-[#1E90FF]/30 animate-in fade-in slide-in-from-top-4">
                <p className="text-[10px] font-black text-zinc-500 uppercase mb-1">Cita Encontrada</p>
                <p className="font-bold text-sm mb-4">{citaEncontrada.servicio_nombre} - ${citaEncontrada.precio}</p>
                <BotonPaypal 
                  cita={citaEncontrada} 
                  onSuccess={(nombre) => {
                    mostrarAlerta(`Cobro de ${nombre} realizado con éxito`);
                    setCitaEncontrada(null);
                    setBusquedaCita('');
                  }} 
                />
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`group relative bg-[#0A1A2A] border border-white/5 p-10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-[#1E90FF]/50 hover:-translate-y-3 shadow-2xl ${item.shadow}`}
            >
              <div className={`absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br ${item.color} opacity-[0.03] group-hover:opacity-10 rounded-full transition-opacity duration-700`} />

              <div className={`inline-flex p-5 rounded-[1.5rem] bg-gradient-to-br ${item.color} mb-8 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                {React.cloneElement(item.icon, { className: "w-8 h-8 text-white stroke-[2.5px]" })}
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-black tracking-tight group-hover:text-[#1E90FF] transition-colors">
                  {item.title.split(' ').pop()}
                </h3>
                <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-[#1E90FF] group-hover:translate-x-2 transition-all" />
              </div>
              
              <p className="text-zinc-500 font-medium text-sm leading-relaxed mb-8">
                {item.desc}
              </p>
              
              <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full w-0 group-hover:w-full bg-gradient-to-r ${item.color} transition-all duration-700 ease-out`} />
              </div>
            </button>
          ))}
        </div>
      </main>

      <footer className="mt-20 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600">
           <p className="text-[10px] font-black uppercase tracking-[0.4em]">© 2026 CodBarber System • Master v2.0</p>
        </div>
      </footer>
    </div>
  );
}