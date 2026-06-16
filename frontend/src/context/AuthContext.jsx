import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  // Set default baseURL for API requests
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '';

  // Apply Authorization token header whenever token state changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Sync dark mode class with DOM element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Restore session on initial mount
  useEffect(() => {
    const restoreSession = async () => {
      const activeToken = localStorage.getItem('token');
      if (!activeToken) {
        setLoading(false);
        return;
      }
      try {
        // Explicitly set authorization header for mount check
        axios.defaults.headers.common['Authorization'] = `Bearer ${activeToken}`;
        const response = await axios.get('/api/auth/me');
        if (response.data?.success) {
          setUser(response.data.user);
        } else {
          // Token expired or invalid
          setToken('');
          setUser(null);
        }
      } catch (err) {
        console.error('Session restoration failed:', err.response?.data?.message || err.message);
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []); // Run only once on initial mount to prevent race conditions during sign-in

  // Axios Interceptors to catch 401 errors globally and sign-out user
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn('Unauthorized request - signing out user.');
          setToken('');
          setUser(null);
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data?.success) {
        // Set header synchronously to prevent navigation race conditions
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Server connection failed' 
      };
    }
  };

  // Register handler
  const register = async (name, email, password, role) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password, role });
      if (response.data?.success) {
        // Set header synchronously to prevent navigation race conditions
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Server connection failed' 
      };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      if (token) {
        await axios.post('/api/auth/logout');
      }
    } catch (err) {
      console.warn('Logout API error:', err.message);
    } finally {
      setToken('');
      setUser(null);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const hasPermission = (requiredPermission) => {
    if (!user) return false;
    if (user.role === 'Super Admin') return true; // Super admin has all permissions
    if (user.role === 'Manager') {
      return ['Dashboard', 'Orders', 'Reports'].includes(requiredPermission);
    }
    if (user.role === 'Staff') {
      return ['Dashboard', 'Orders'].includes(requiredPermission);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      darkMode,
      login,
      register,
      logout,
      toggleDarkMode,
      hasPermission,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
