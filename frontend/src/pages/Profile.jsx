import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authAPI.getProfile();
      setName(res.data.name);
      setEmail(res.data.email);
    } catch (err) {
      setError('Failed to fetch user profile details.');
    } finally {
      setFetching(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    // Client side checks
    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
    }

    if (!currentPassword) {
      setError('Please enter your current password to verify changes.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.updateProfile({
        name,
        email,
        currentPassword,
        newPassword: newPassword || null
      });

      // Update localStorage cached user & token
      localStorage.setItem('geneshield_token', res.data.token);
      localStorage.setItem('geneshield_user', JSON.stringify(res.data.user));

      setMsg('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Refresh navbar state by triggering storage event or redirecting
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading account settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '70px', paddingBottom: '4rem' }}>
      {/* Glow background effects */}
      <div style={{ position: 'fixed', top: '15%', left: '-10%', width: 500, height: 500, background: 'rgba(0,212,255,0.05)', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '15%', right: '-10%', width: 450, height: 450, background: 'rgba(255,36,228,0.05)', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
        
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1.5rem 0 1rem', fontSize: '0.82rem', color: '#4a5568' }}>
          <Link to="/dashboard" style={{ color: '#00d4ff', textDecoration: 'none' }}>Dashboard</Link>
          <span>›</span>
          <span style={{ color: '#8899aa' }}>Account Settings</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg,#f0f6ff,#00f2ff,#ff24e4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.4rem' }}>
            👤 Account Settings
          </h1>
          <p style={{ color: '#8899aa', fontSize: '0.9rem' }}>
            Update your profile information and manage password security
          </p>
        </div>

        {/* Main Card */}
        <div style={{
          background: 'rgba(6,20,36,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          {error && (
            <div style={{
              padding: '0.85rem 1.1rem', background: 'rgba(255,68,68,0.08)',
              border: '1px solid rgba(255,68,68,0.25)', borderRadius: '12px',
              color: '#ff8080', fontSize: '0.88rem', marginBottom: '1.25rem'
            }}>⚠️ {error}</div>
          )}

          {msg && (
            <div style={{
              padding: '0.85rem 1.1rem', background: 'rgba(0,230,118,0.08)',
              border: '1px solid rgba(0,230,118,0.25)', borderRadius: '12px',
              color: '#69f0ae', fontSize: '0.88rem', marginBottom: '1.25rem'
            }}>✅ {msg}</div>
          )}

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">FULL NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Your Name"
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="name@example.com"
                required
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0.5rem 0' }} />

            {/* Password security header */}
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f0f6ff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🔑 Change Password (Optional)
            </h3>

            {/* New Password */}
            <div className="form-group">
              <label className="form-label">NEW PASSWORD</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
                placeholder="Min 6 characters (leave blank to keep current)"
              />
            </div>

            {/* Confirm New Password */}
            <div className="form-group">
              <label className="form-label">CONFIRM NEW PASSWORD</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="Re-enter new password"
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0.5rem 0' }} />

            {/* Verification Password (REQUIRED) */}
            <div className="form-group" style={{
              background: 'rgba(255,36,228,0.03)',
              border: '1px solid rgba(255,36,228,0.12)',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <label className="form-label" style={{ color: '#ff24e4', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🔒 CONFIRM CHANGES WITH CURRENT PASSWORD
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input"
                placeholder="Enter current password"
                style={{ marginTop: '0.4rem', background: 'rgba(0,0,0,0.2)' }}
                required
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1, padding: '0.85rem', borderRadius: '50px', border: 'none',
                  background: loading ? 'rgba(0,212,255,0.3)' : 'linear-gradient(135deg,#00f2ff,#ff24e4)',
                  color: '#000', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: loading ? 'none' : '0 0 25px rgba(0,242,255,0.35)',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 18, height: 18, borderTopColor: '#000' }}></span>
                    Saving Changes...
                  </>
                ) : '💾 Save Account Changes'}
              </button>
              
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <button
                  type="button"
                  style={{
                    padding: '0.85rem 1.5rem', borderRadius: '50px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#8899aa', cursor: 'pointer', fontFamily: 'Inter',
                    fontSize: '0.88rem', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.target.style.color = '#f0f6ff'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { e.target.style.color = '#8899aa'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
                >Cancel</button>
              </Link>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
