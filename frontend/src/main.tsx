import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import AdminPage from './pages/AdminPage.tsx';

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) => {
  const { isAuthenticated, isAdmin, loading, authServiceAvailable } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If auth service is not available, allow access to the app but show warning
  if (!authServiceAvailable) {
    return (
      <>
        {children}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ff6b6b',
          color: 'white',
          padding: '10px',
          textAlign: 'center',
          zIndex: 9999
        }}>
          ⚠️ Brak dostępu do serwisu autoryzacyjnego - niektóre funkcje mogą być niedostępne
        </div>
      </>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppWithAuth = () => {
  const PublicApp = () => {
    const { authServiceAvailable } = useAuth();
    
    return (
      <>
        <App />
        {!authServiceAvailable && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#ff6b6b',
            color: 'white',
            padding: '10px',
            textAlign: 'center',
            zIndex: 9999
          }}>
            ⚠️ Brak dostępu do serwisu autoryzacyjnego - niektóre funkcje mogą być niedostępne
          </div>
        )}
      </>
    );
  };
  
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={<PublicApp />}
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWithAuth />
    </BrowserRouter>
  </React.StrictMode>,
);
