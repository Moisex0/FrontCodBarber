import axios from 'axios';

function apiBaseUrl() {
    const raw = import.meta.env.VITE_API_URL || 'https://backend-codbarber-v2.onrender.com';
    const origin = String(raw).trim().replace(/\/+$/, '');
    return `${origin}/api`;
}

const api = axios.create({
    baseURL: apiBaseUrl(),
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            
            if (localStorage.getItem('token')) {
                console.warn("Sesión expirada o acceso denegado. Limpiando credenciales...");
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                if (!window.location.pathname.includes('/login')) {
                    window.location.replace('/login'); 
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;