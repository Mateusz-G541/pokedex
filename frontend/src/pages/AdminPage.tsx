import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AUTH_SERVICE_URL = (import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:4000').replace(/\/+$/, '');

interface User {
  id: number;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'USER',
    isActive: true
  });

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${AUTH_SERVICE_URL}/users`, {
        withCredentials: true
      });
      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/users`, formData, {
        withCredentials: true
      });
      if (response.data.success) {
        fetchUsers();
        setFormData({ email: '', password: '', role: 'USER', isActive: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (userId: number) => {
    try {
      const response = await axios.put(
        `${AUTH_SERVICE_URL}/users/${userId}`,
        formData,
        { withCredentials: true }
      );
      if (response.data.success) {
        fetchUsers();
        setEditingUser(null);
        setFormData({ email: '', password: '', role: 'USER', isActive: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await axios.delete(`${AUTH_SERVICE_URL}/users/${userId}`, {
        withCredentials: true
      });
      if (response.data.success) {
        fetchUsers();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  if (!isAdmin) {
    return (
      <div className="container" style={{ maxWidth: 800, marginTop: 40 }}>
        <h1>Access Denied</h1>
        <p>You must be an administrator to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 1200, marginTop: 40 }}>
      <h1>Admin Panel - User Management</h1>
      
      {error && <div className="error">{error}</div>}
      
      <div className="admin-section">
        <h2>Create New User</h2>
        <form onSubmit={handleCreateUser} className="admin-form">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={8}
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="USER">User</option>
            <option value="ADMINISTRATOR">Administrator</option>
          </select>
          <button type="submit">Create User</button>
        </form>
      </div>

      <div className="admin-section">
        <h2>Users ({users.length})</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u.id !== user?.id && (
                      <>
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setFormData({
                              email: u.email,
                              password: '',
                              role: u.role,
                              isActive: u.isActive
                            });
                          }}
                          style={{ marginRight: 5 }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          style={{ background: '#dc3545' }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingUser && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit User: {editingUser.email}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateUser(editingUser.id);
            }}>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="New Password (leave empty to keep current)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="USER">User</option>
                <option value="ADMINISTRATOR">Administrator</option>
              </select>
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Active
              </label>
              <div className="modal-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingUser(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-form {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .users-table {
          width: 100%;
          border-collapse: collapse;
        }
        .users-table th,
        .users-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        .role-badge {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        .role-badge.user {
          background: #17a2b8;
          color: white;
        }
        .role-badge.administrator {
          background: #ffc107;
          color: black;
        }
        .status-badge {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .status-badge.active {
          background: #28a745;
          color: white;
        }
        .status-badge.inactive {
          background: #6c757d;
          color: white;
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 500px;
          width: 100%;
        }
        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
