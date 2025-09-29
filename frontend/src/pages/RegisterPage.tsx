import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const AUTH_SERVICE_URL = (import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:4000').replace(/\/+$/, '');
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      setError('');
      
      // Register with auth service
      const response = await axios.post(`${AUTH_SERVICE_URL}/auth/register`, { 
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
        
        // Store user info in localStorage
        localStorage.setItem('authUser', JSON.stringify({
          id: user.id,
          email: user.email,
          role: user.role || 'USER'
        }));
        
        navigate('/');
      }
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Registration failed'
        : 'Registration failed';
      setError(errorMessage as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 480, marginTop: 40 }}>
      <h1>Pokédex</h1>
      <div className="login-panel" data-testid="register-panel">
        <h2>Register</h2>
        <form className="login-form" onSubmit={handleRegister}>
          <input
            data-testid="register-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            data-testid="register-password"
            type="password"
            placeholder="Password (min 8 chars, 1 upper, 1 lower, 1 number, 1 special)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={8}
          />
          <input
            data-testid="register-confirm-password"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button 
            data-testid="register-button" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        {error && (
          <div className="error" data-testid="register-error">{error}</div>
        )}
        <p className="login-hint">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
