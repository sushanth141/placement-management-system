import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ROLE_REDIRECT = {
  student: '/student/dashboard',
  admin: '/admin/dashboard',
  company: '/company/dashboard',
};

export default function ChangePassword() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', { newPassword: form.newPassword });
      updateUser({ mustChangePassword: false });
      navigate(ROLE_REDIRECT[user.role]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '2rem', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
      </div>

      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Set Your Password</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Welcome, <strong>{user?.name}</strong>! Your account was created by the admin.<br />
            Please set a new password to continue.
          </p>
        </div>

        <div style={{ background: 'var(--warning-bg)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.9rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--warning)', display: 'flex', gap: 8, alignItems: 'center' }}>
          ⚠️ You must change your password before accessing the system.
        </div>

        <div className="auth-card" style={{ margin: 0 }}>
          {error && <div className="error-msg">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <input
                id="new-password"
                type="password"
                placeholder="Min. 6 characters"
                required
                value={form.newPassword}
                onChange={e => setForm({ ...form, newPassword: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Re-enter new password"
                required
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>

            {form.newPassword && form.confirmPassword && (
              <div style={{ fontSize: '0.82rem', marginBottom: '1rem', color: form.newPassword === form.confirmPassword ? 'var(--success)' : 'var(--danger)' }}>
                {form.newPassword === form.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
              </div>
            )}

            <button id="change-pw-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"></span> Saving...</> : '🔐 Set Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
