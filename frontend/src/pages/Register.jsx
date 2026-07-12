import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ROLES = [
  { value: 'student', icon: '🎓', label: 'Student' },
  { value: 'company', icon: '🏢', label: 'Company' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setRegistered(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⏳</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>Registration Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Your account is <strong style={{ color: 'var(--warning)' }}>pending admin approval</strong>.<br />
            Once the admin reviews and approves your account, you'll be able to log in.
          </p>
          <div style={{ background: 'var(--warning-bg)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--warning)' }}>
            📧 Registered as: <strong>{form.email}</strong> ({form.role})
          </div>
          <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto', textDecoration: 'none' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-brand">
        <div className="auth-brand-logo">
          <div className="auth-brand-icon">🎓</div>
          <div><div className="auth-brand-name">PlaceIt</div></div>
        </div>
        <h1>Join the<br /><span>PlaceIt Network.</span></h1>
        <p>Register as a student or company. Your account will be reviewed and approved by the admin.</p>
        <div className="auth-features">
          <div className="auth-feature"><div className="auth-feature-dot"></div>Register and await admin verification</div>
          <div className="auth-feature"><div className="auth-feature-dot"></div>Students: Browse & apply to dream jobs</div>
          <div className="auth-feature"><div className="auth-feature-dot"></div>Companies: Post jobs & screen candidates</div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h2>Create account</h2>
          <p className="subtitle">Submit your registration for admin approval</p>

          {error && <div className="error-msg">⚠️ {error}</div>}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              I am a
            </label>
            <div className="role-selector">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className={`role-btn ${form.role === r.value ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, role: r.value })}
                >
                  <span className="role-icon">{r.icon}</span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input id="reg-name" placeholder="John Doe" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input id="reg-email" type="email" placeholder="you@college.edu" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input id="reg-password" type="password" placeholder="Min. 8 characters" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button id="reg-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"></span> Submitting...</> : 'Submit for Approval →'}
            </button>
          </form>

          <div className="auth-link">
            Already approved? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
