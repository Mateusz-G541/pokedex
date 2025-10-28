import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const AUTH_SERVICE_URL = (import.meta.env.VITE_AUTH_SERVICE_URL || 'http://srv36.mikr.us:4000').replace(/\/+$/, '');
const API_URL = (import.meta.env.VITE_API_URL || 'http://srv36.mikr.us:3000').replace(/\/+$/, '');

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setError('');
      
      // Login to auth service
      const response = await axios.post(`${AUTH_SERVICE_URL}/auth/login`, { 
        email, 
        password 
      });
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Store token in httpOnly cookie via backend
        await axios.post(`${API_URL}/api/auth/session`, {
          token,
          user
        }, {
          withCredentials: true
        });
        
        // Store user info in localStorage (not the token)
        localStorage.setItem('authUser', JSON.stringify({
          id: user.id,
          email: user.email,
          role: user.role
        }));
        
        // Redirect based on role
        if (user.role === 'ADMINISTRATOR') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Login failed'
        : 'Login failed';
      setError(errorMessage as string);
      localStorage.removeItem('authUser');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 480, marginTop: 40 }}>
      <h1>Pokédex</h1>
      <div className="login-panel" data-testid="login-panel">
        <h2>Login</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            data-testid="login-username"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            data-testid="login-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button 
            data-testid="login-button" 
            type="submit"
            disabled={loading}
            style={{ marginBottom: '10px' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button 
            data-testid="guest-button"
            type="button"
            onClick={() => navigate('/')}
            disabled={loading}
            style={{ 
              backgroundColor: '#666', 
              color: 'white',
              border: 'none',
              padding: '10px',
              cursor: 'pointer',
              borderRadius: '4px',
              width: '100%'
            }}
          >
            Continue as Guest
          </button>
        </form>
        {error && (
          <div className="error" data-testid="login-error">{error}</div>
        )}
        <p className="login-hint">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
