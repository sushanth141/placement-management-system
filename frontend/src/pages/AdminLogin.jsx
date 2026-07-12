import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Pass true for isAdmin flag
      await login(form.email, form.password, true);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ background: '#0a0a0f' }}>
      <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Admin Portal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Authorized personnel only.
          </p>
        </div>

        <div className="auth-card" style={{ margin: 0 }}>
          {error && <div className="error-msg">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Admin Email</label>
              <input
                id="admin-email"
                type="email"
                placeholder="admin@place.it"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button id="admin-login-submit" type="submit" className="btn btn-primary" style={{ background: 'var(--accent)', border: 'none' }} disabled={loading}>
              {loading ? <><span className="spinner"></span> Authenticating...</> : 'Authenticate →'}
            </button>
          </form>

          <div className="divider"></div>
          <div style={{ fontSize: '0.85rem', textAlign: 'center' }}>
            <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>
              Return to General Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
