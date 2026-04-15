// AuthContext.jsx - Manteniendo tu estructura
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Validamos que el objeto no esté vacío
        if (parsedUser && parsedUser.id_usuario) {
          setUser(parsedUser);
        } else {
          logout();
        }
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (response) => {
    // IMPORTANTE: Aseguramos que el objeto traiga todos los campos
    const userData = response.user;
    const token = response.token;

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    
    // Redirección por rol
    if (userData.rol === 'admin') {
      navigate('/admin');
    } else if (userData.rol === 'barbero') {
      navigate('/empleado');
    } else {
      navigate('/cliente');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Forzamos limpieza total de caché de sesión
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);