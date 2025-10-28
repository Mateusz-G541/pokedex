import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import axios from 'axios';

const AUTH_SERVICE_URL = (import.meta.env.VITE_AUTH_SERVICE_URL || 'http://srv36.mikr.us:4000').replace(/\/+$/, '');

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const updateData: { email?: string; password?: string; currentPassword?: string } = {};
      if (email !== user?.email) updateData.email = email;
      if (newPassword) {
        updateData.password = newPassword;
        updateData.currentPassword = currentPassword;
      }

      const response = await axios.put(
        `${AUTH_SERVICE_URL}/users/profile`,
        updateData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessage('Profile updated successfully');
        setEditing(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Failed to update profile'
        : 'Failed to update profile';
      setError(message as string);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 600, marginTop: 40 }}>
      <h1>My Profile</h1>
      
      <div className="profile-info">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>User ID:</strong> {user?.id}</p>
      </div>

      {!editing ? (
        <div className="profile-actions">
          <button onClick={() => setEditing(true)}>Edit Profile</button>
          <button onClick={logout} style={{ marginLeft: 10, background: '#dc3545' }}>
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile} className="profile-form">
          <h3>Update Profile</h3>
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <hr />
          <p>Leave password fields empty to keep current password</p>
          
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
          />
          
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          
          <div className="form-actions">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => {
              setEditing(false);
              setEmail(user?.email || '');
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setError('');
            }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
