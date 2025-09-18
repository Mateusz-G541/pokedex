import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError('');
      const response = await axios.post(`${API_URL}/api/login`, { username, password });
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', user?.username || username);
      navigate('/');
    } catch {
      setError('Invalid credentials');
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 480, marginTop: 40 }}>
      <h1>Pokédex</h1>
      <div className="login-panel" data-testid="login-panel">
        <h2>Login</h2>
        <div className="login-form">
          <input
            data-testid="login-username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            data-testid="login-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button data-testid="login-button" onClick={handleLogin}>Login</button>
        </div>
        {error && (
          <div className="error" data-testid="login-error">{error}</div>
        )}
        <p className="login-hint">Use test/test</p>
      </div>
    </div>
  );
}
