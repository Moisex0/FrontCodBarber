import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Login from './pages/Login';
import Registro from './pages/Registro';
import AdminDashboard from './pages/AdministradorDashboard'; 
import ClienteDashboard from './pages/ClienteDashboard';    
import EmpleadoDashboard from './pages/EmpleadoDashboard';   
import Barberias from './pages/Barberias'; 
import Barberos from './pages/Barberos';
import Clientes from './pages/Clientes'; 
import Servicios from './pages/Servicios'; 
import Citas from './pages/Citas'; 
import Pagos from './pages/Pagos'; 
import Usuarios from './pages/Usuarios';
import GestionUsuarios from './pages/GestionUsuarios';

function App() {
  return (
    <PayPalScriptProvider options={{ 
      "client-id": "Abg5ZNZsgBjK2-PZtf38NE4QCUSefWzFeYQi2kRO3x32CEfy03Ei4gCrHaVNdHODaQ77P_ax5BYsqo0M",
      currency: "MXN",
      components: "buttons", 
      "disable-funding": "" 
    }}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            
            <Route path="/catalogo" element={<Navigate to="/login" />} />

            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/barberias" element={<ProtectedRoute allowedRoles={['admin']}><Barberias /></ProtectedRoute>} /> 
            <Route path="/barberos" element={<ProtectedRoute allowedRoles={['admin']}><Barberos /></ProtectedRoute>} /> 
            <Route path="/clientes" element={<ProtectedRoute allowedRoles={['admin']}><Clientes /></ProtectedRoute>} /> 
            <Route path="/servicios" element={<ProtectedRoute allowedRoles={['admin']}><Servicios /></ProtectedRoute>} />
            <Route path="/citas" element={<ProtectedRoute allowedRoles={['admin']}><Citas /></ProtectedRoute>} />
            <Route path="/pagos" element={<ProtectedRoute allowedRoles={['admin']}><Pagos /></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute allowedRoles={['admin']}><Usuarios /></ProtectedRoute>} />
            
            <Route path="/gestion-usuarios" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <GestionUsuarios />
              </ProtectedRoute>
            } />

            <Route path="/empleado" element={
              <ProtectedRoute allowedRoles={['barbero', 'admin']}> 
                <EmpleadoDashboard />
              </ProtectedRoute>
            } />

            <Route path="/cliente" element={
              <ProtectedRoute allowedRoles={['cliente', 'admin']}>
                <ClienteDashboard />
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </AuthProvider>
      </Router>
    </PayPalScriptProvider>
  );
}

export default App;