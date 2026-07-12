import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
const ROLE_REDIRECT = {
  student: '/student/dashboard',
  admin: '/admin/dashboard',
  company: '/company/dashboard',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg('');
    try {
      const { data } = await api.post('/auth/forgot-password-request', { email: forgotEmail });
      setForgotMsg(data.message);
      setForgotEmail('');
    } catch (err) {
      setForgotMsg('Failed to send request. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate(ROLE_REDIRECT[user.role]);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.status === 'pending') {
        setError('⏳ Your account is pending admin approval. Please wait.');
      } else if (data?.status === 'rejected') {
        setError('❌ Your account was rejected. Please contact admin.');
      } else {
        setError(data?.message || 'Login failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-brand">
        <div className="auth-brand-logo">
          <div className="auth-brand-icon">🎓</div>
          <div><div className="auth-brand-name">PlaceIt</div></div>
        </div>
        <h1>Your Career<br /><span>Starts Here.</span></h1>
        <p>The official placement portal. Login with credentials provided by your placement office.</p>
        <div className="auth-features">
          <div className="auth-feature"><div className="auth-feature-dot"></div>Students: Browse & apply to dream jobs</div>
          <div className="auth-feature"><div className="auth-feature-dot"></div>Companies: Post jobs & screen candidates</div>
          <div className="auth-feature"><div className="auth-feature-dot"></div>AI-powered job matching</div>
          <div className="auth-feature"><div className="auth-feature-dot"></div>Real-time application tracking</div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in with your credentials</p>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email / Roll Number</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@college.edu"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>Password</label>
                <button type="button" onClick={() => { setShowForgot(true); setForgotMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>Forgot Password?</button>
              </div>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button id="login-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"></span> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div className="divider"></div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
            Contact your placement office if you haven't received your credentials.
          </div>
        </div>
      </div>

      {showForgot && (
        <div className="modal-overlay" onClick={() => setShowForgot(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2>Reset Password Request</h2>
              <button className="modal-close" onClick={() => setShowForgot(false)}>×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {forgotMsg ? (
                <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '1rem', borderRadius: 'var(--radius)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {forgotMsg}
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                    Enter your email address. We will notify the placement administrator to reset your password back to the default.
                  </p>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" required placeholder="you@college.edu" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                    {forgotLoading ? <><span className="spinner"></span> Requesting...</> : 'Send Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
