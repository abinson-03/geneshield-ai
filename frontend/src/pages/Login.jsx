import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authAPI.login(form);
      localStorage.setItem('geneshield_token', res.data.token);
      localStorage.setItem('geneshield_user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo login
  const demoLogin = async () => {
    setForm({ email: 'demo@geneshield.ai', password: 'Demo@1234' });
    setLoading(true); setError('');
    try {
      const res = await authAPI.login({ email: 'demo@geneshield.ai', password: 'Demo@1234' });
      localStorage.setItem('geneshield_token', res.data.token);
      localStorage.setItem('geneshield_user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch {
      // Try register first
      try {
        const reg = await authAPI.register({ name: 'Demo User', email: 'demo@geneshield.ai', password: 'Demo@1234' });
        localStorage.setItem('geneshield_token', reg.data.token);
        localStorage.setItem('geneshield_user', JSON.stringify(reg.data.user));
        navigate('/dashboard');
      } catch (err2) {
        setError('Demo login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      {/* BG */}
      <div className="glow-orb" style={{ width: 400, height: 400, background: 'rgba(0,212,255,0.08)', top: '10%', left: '10%' }} />
      <div className="glow-orb" style={{ width: 300, height: 300, background: 'rgba(124,58,237,0.1)', bottom: '10%', right: '10%' }} />

      <div className="container-sm" style={{ width: '100%', position: 'relative', zIndex: 1, padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            ← Back to Home
          </Link>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🧬</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sign in to your GeneShield AI account</p>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? <><span className="spinner" style={{ width: 18, height: 18 }}></span> Signing In...</> : '🔐 Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
            <div className="divider" style={{ flex: 1, margin: 0 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>or</span>
            <div className="divider" style={{ flex: 1, margin: 0 }} />
          </div>

          <button className="btn btn-ghost" onClick={demoLogin} disabled={loading} style={{ width: '100%' }}>
            ⚡ Try Demo Account
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}
