import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setDevOtpHint('');
    if (!email.trim()) return setError('Email is required.');

    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email.trim());
      setMsg(res.data.message);
      
      // If server returned devFallback, display it directly on screen so they don't get blocked
      if (res.data.devFallback) {
        setDevOtpHint(`Dev Verification OTP: ${res.data.devFallback} (also logged to backend console)`);
      }
      
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (!otp.trim()) return setError('OTP code is required.');

    setLoading(true);
    try {
      await authAPI.verifyOTP(email.trim(), otp.trim());
      setMsg('OTP verified successfully! Please enter your new password.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.resetPassword(email.trim(), otp.trim(), newPassword);
      setMsg(res.data.message + ' Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', top: '20%', left: '-10%', width: 500, height: 500, background: 'rgba(0,212,255,0.05)', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '-10%', width: 500, height: 500, background: 'rgba(255,36,228,0.05)', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        
        {/* Back navigation */}
        <Link to="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: '#8899aa', fontSize: '0.88rem', textDecoration: 'none',
          marginBottom: '2rem', transition: 'color 0.2s'
        }}
          onMouseEnter={e => e.target.style.color = '#00d4ff'}
          onMouseLeave={e => e.target.style.color = '#8899aa'}
        >
          ← Back to Login
        </Link>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem', animation: 'float 4s ease-in-out infinite' }}>🧬</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg,#f0f6ff,#00f2ff,#ff24e4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.5rem' }}>
            {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify Identity' : 'Reset Password'}
          </h1>
          <p style={{ color: '#8899aa', fontSize: '0.9rem' }}>
            {step === 1 ? 'Enter your email to receive a One-Time Verification Code' : 
             step === 2 ? `We sent a 6-digit OTP code to ${email}` : 
             'Create a secure new password for your account'}
          </p>
        </div>

        {/* Card */}
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

          {devOtpHint && (
            <div style={{
              padding: '0.85rem 1.1rem', background: 'rgba(0,212,255,0.1)',
              border: '1px solid rgba(0,212,255,0.25)', borderRadius: '12px',
              color: '#00d4ff', fontSize: '0.88rem', fontWeight: 600, marginBottom: '1.25rem'
            }}>💡 {devOtpHint}</div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.85rem', borderRadius: '50px', border: 'none',
                  background: loading ? 'rgba(0,212,255,0.3)' : 'linear-gradient(135deg,#00f2ff,#ff24e4)',
                  color: '#000', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: loading ? 'none' : '0 0 25px rgba(0,242,255,0.35)',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? <span className="spinner" style={{ width: 18, height: 18, borderTopColor: '#000' }}></span> : '📤 Send Verification OTP'}
              </button>
            </form>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">6-DIGIT VERIFICATION CODE</label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="form-input"
                  placeholder="Enter 6-digit OTP"
                  style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '4px', fontWeight: 700 }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.85rem', borderRadius: '50px', border: 'none',
                  background: loading ? 'rgba(0,212,255,0.3)' : 'linear-gradient(135deg,#00f2ff,#ff24e4)',
                  color: '#000', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: loading ? 'none' : '0 0 25px rgba(0,242,255,0.35)',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? <span className="spinner" style={{ width: 18, height: 18, borderTopColor: '#000' }}></span> : '🔑 Verify OTP Code'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '0.85rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)', color: '#8899aa', fontSize: '0.88rem',
                  cursor: 'pointer', fontFamily: 'Inter', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.target.style.color = '#f0f6ff'}
                onMouseLeave={e => e.target.style.color = '#8899aa'}
              >
                Change Email Address
              </button>
            </form>
          )}

          {/* STEP 3: Reset Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">NEW PASSWORD</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  placeholder="Min 6 characters"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">CONFIRM NEW PASSWORD</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="Re-enter password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.85rem', borderRadius: '50px', border: 'none',
                  background: loading ? 'rgba(0,212,255,0.3)' : 'linear-gradient(135deg,#00f2ff,#ff24e4)',
                  color: '#000', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: loading ? 'none' : '0 0 25px rgba(0,242,255,0.35)',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? <span className="spinner" style={{ width: 18, height: 18, borderTopColor: '#000' }}></span> : '💾 Reset Account Password'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
