import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://srv36.mikr.us:3000').replace(/\/+$/, '');

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authServiceAvailable: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure axios defaults
axios.defaults.withCredentials = true;

// Add request interceptor to attach token from cookie automatically
axios.interceptors.request.use(
  (config) => {
    // The cookie will be sent automatically with withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - just clear local state, don't redirect
      localStorage.removeItem('authUser');
      // Don't redirect - let the app handle missing auth gracefully
    }
    return Promise.reject(error);
  }
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authServiceAvailable, setAuthServiceAvailable] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/session`);
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('authUser', JSON.stringify(response.data.user));
      } else {
        setUser(null);
        localStorage.removeItem('authUser');
      }
      setAuthServiceAvailable(true);
    } catch (error: any) {
      // Check if it's a network error (service unavailable) vs auth error
      if (!error?.response) {
        // Network error - service is down
        setAuthServiceAvailable(false);
      } else {
        // Auth error - service is up but auth failed
        setAuthServiceAvailable(true);
      }
      setUser(null);
      localStorage.removeItem('authUser');
    } finally {
      setLoading(false);
    }
  };

  const login = async (_email: string, _password: string) => {
    // This is handled by the LoginPage component
    // After successful login, checkAuth will be called
    await checkAuth();
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('authUser');
      // Don't redirect - just clear the auth state
    }
  };

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('authUser');
      }
    }
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    authServiceAvailable,
    login,
    logout,
    checkAuth,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
