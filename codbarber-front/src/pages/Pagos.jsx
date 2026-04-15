import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit, DollarSign, CreditCard, Receipt, 
  Save, Hash, Calendar, Search, TrendingUp, Wallet, X 
} from 'lucide-react';
import api from '../api';

import Tabla from '../components/Tabla';
import Modal from '../components/Modal';
import Alerta from '../components/Alerta';
import BotonPaypal from '../components/BotonPaypal'; 

export default function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [citas, setCitas] = useState([]);
  
  const [id_cita, setIdCita] = useState('');
  const [monto, setMonto] = useState('');
  const [metodo_pago, setMetodoPago] = useState('efectivo');
  const [id_paypal, setIdPaypal] = useState('');

  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [alerta, setAlerta] = useState({ mensaje: '', tipo: 'success', visible: false });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo, visible: true });
  };

  const cargarDatos = async () => {
    try {
      const [resPagos, resCitas] = await Promise.all([
        api.get('/pagos').catch(() => ({ data: [] })),
        api.get('/citas/todas').catch(() => ({ data: [] }))
      ]);

      setPagos(Array.isArray(resPagos.data) ? resPagos.data : resPagos.data.rows || []);
      setCitas(Array.isArray(resCitas.data) ? resCitas.data : resCitas.data.rows || []);
    } catch (err) {
      mostrarAlerta("Error al sincronizar la caja registradora :(", "error");
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  useEffect(() => {
    if (!editando && id_cita) {
      const citaSel = citas.find(c => c.id_cita === parseInt(id_cita));
      if (citaSel) setMonto(citaSel.precio);
    }
  }, [id_cita, citas, editando]);

  const handlePaypalSuccess = async (details) => {
    const txnId = details.purchase_units[0].payments.captures[0].id;
    const datos = { 
        id_cita: parseInt(id_cita), 
        monto: parseFloat(monto), 
        metodo_pago: 'paypal', 
        id_transaccion_paypal: txnId
    };

    try {
        await api.post('/pagos/registrar', datos);
        mostrarAlerta("¡Pago de PayPal procesado y registrado! :)");
        cancelarEdicion();
        cargarDatos();
    } catch (err) {
        mostrarAlerta("Pago cobrado pero error al registrar en DB :(", "error");
    }
  };

  const abrirFormularioNuevo = () => { cancelarEdicion(); setModalAbierto(true); };

  const prepararEdicion = (p) => {
    setEditando(true);
    setIdEditando(p.id_pago);
    setIdCita(p.id_cita || '');
    setMonto(p.monto || '');
    setMetodoPago(p.metodo_pago || 'efectivo');
    setIdPaypal(p.id_transaccion_paypal || '');
    setModalAbierto(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setIdEditando(null);
    setIdCita('');
    setMonto('');
    setMetodoPago('efectivo');
    setIdPaypal('');
    setModalAbierto(false);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const datos = { 
        id_cita: parseInt(id_cita), 
        monto: parseFloat(monto), 
        metodo_pago, 
        id_transaccion_paypal: id_paypal || null
    };

    try {
      if (editando) {
        await api.put(`/pagos/actualizar/${idEditando}`, datos);
        mostrarAlerta("Transacción corregida :)");
      } else {
        await api.post('/pagos/registrar', datos);
        mostrarAlerta("¡Cobro registrado en caja! :)");
      }
      cancelarEdicion();
      cargarDatos();
    } catch (err) {
      mostrarAlerta("Error en el procesamiento :(", "error");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Anular este movimiento?")) {
      try {
        await api.delete(`/pagos/eliminar/${id}`);
        mostrarAlerta("Registro anulado correctamente");
        cargarDatos();
      } catch (err) {
        mostrarAlerta("Error al intentar anular", "error");
      }
    }
  };

  const totalRecaudado = pagos.reduce((acc, curr) => acc + Number(curr.monto), 0);

  return (
    <div className="min-h-screen bg-[#04121F] text-white p-10 font-['Montserrat']">
      <Alerta 
        mensaje={alerta.mensaje} tipo={alerta.tipo} visible={alerta.visible} 
        onHide={() => setAlerta({ ...alerta, visible: false })} 
      />

      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <Wallet className="w-8 h-8 text-emerald-400" />
              </div>
              Flujo de <span className="text-emerald-400">Caja</span>
            </h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-3 ml-1">Control de ingresos y transacciones reales</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-[#0A1A2A] border border-white/5 p-4 rounded-3xl px-8 flex items-center gap-4 shadow-xl">
               <div className="text-right">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Total Ingresos</p>
                  <p className="text-2xl font-black text-emerald-400 tracking-tighter">${totalRecaudado.toFixed(2)}</p>
               </div>
               <TrendingUp className="text-emerald-500 w-6 h-6" />
            </div>
            <button onClick={abrirFormularioNuevo} className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-[22px] font-black uppercase text-xs tracking-widest transition-all shadow-2xl shadow-emerald-500/20 flex items-center gap-3 active:scale-95">
              <Plus className="w-5 h-5" /> Nuevo Cobro
            </button>
          </div>
        </div>

        <div className="bg-[#0A1A2A] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
          <Tabla headers={['Transacción', 'Referencia Cita', 'Cliente', 'Monto', 'Medio de Pago', 'Acciones']}>
            {pagos.map((p) => (
              <tr key={p.id_pago} className="hover:bg-white/[0.02] border-b border-white/5 last:border-0 group">
                <td className="p-6 text-zinc-500 font-mono text-xs italic"><Hash className="inline w-3 h-3" /> {p.id_pago}</td>
                <td className="p-6 italic text-zinc-400">Ticket #{p.id_cita}</td>
                <td className="p-6 font-bold">{p.cliente || 'Consumidor Final'}</td>
                <td className="p-6 font-black text-emerald-400">${Number(p.monto).toFixed(2)}</td>
                <td className="p-6">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black border w-fit ${
                    p.metodo_pago === 'paypal' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                  }`}>
                    {p.metodo_pago === 'paypal' ? <CreditCard className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                    {p.metodo_pago}
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => prepararEdicion(p)} className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl hover:bg-blue-500 hover:text-white transition-all"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleEliminar(p.id_pago)} className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </Tabla>
        </div>

        <Modal isOpen={modalAbierto} onClose={cancelarEdicion} title={editando ? 'Rectificar Transacción' : 'Registrar Venta Directa'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Vincular a Cita Agendada</label>
              <div className="relative">
                <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <select className="w-full bg-[#04121F] border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all font-bold appearance-none cursor-pointer"
                  value={id_cita} onChange={(e) => setIdCita(e.target.value)} required>
                  <option value="">Buscar ticket...</option>
                  {citas.map(c => (
                      <option key={c.id_cita} value={c.id_cita}>
                          ID {c.id_cita} - {c.cliente} ({new Date(c.fecha).toLocaleDateString()})
                      </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Monto Final ($)</label>
                <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />
                    <input type="number" step="0.01" className="w-full bg-[#04121F] border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all font-black text-xl tracking-tighter"
                      value={monto} onChange={(e) => setMonto(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Medio de Pago</label>
                <select className="w-full bg-[#04121F] border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all font-bold cursor-pointer"
                  value={metodo_pago} onChange={(e) => setMetodoPago(e.target.value)} required>
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="paypal">💳 PayPal Business</option>
                  <option value="transferencia">🏦 Transferencia</option>
                  <option value="tarjeta">📟 Terminal (Tarjeta)</option>
                </select>
              </div>
            </div>

            {metodo_pago === 'paypal' ? (
                <div className="space-y-4 animate-in zoom-in-95 duration-300">
                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 text-center">Checkout Digital de CodBarber</p>
                        <BotonPaypal 
                            cita={{ id_cita, precio: monto, servicio_nombre: 'Cobro de Caja' }} 
                            onSuccess={handlePaypalSuccess}
                        />
                    </div>
                </div>
            ) : (
                <button type="submit" className="w-full bg-emerald-500 p-6 rounded-[24px] font-black uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 mt-4 italic flex items-center justify-center gap-4 text-[#04121F]">
                  <Save className="w-6 h-6" /> {editando ? 'Confirmar Cambios' : 'Emitir Comprobante'}
                </button>
            )}
          </form>
        </Modal>
      </div>
    </div>
  );
}