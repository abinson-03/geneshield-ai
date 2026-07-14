import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('geneshield_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, [location]); // re-read on route change so logout updates instantly

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('geneshield_token');
    localStorage.removeItem('geneshield_user');
    setUser(null);
    setMenuOpen(false);
    navigate('/', { replace: true });
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: '70px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem',
        background: scrolled ? 'rgba(2,11,24,0.97)' : 'rgba(2,11,24,0.80)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        transition: 'all 0.3s ease'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg,#00f2ff,#ff24e4)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', boxShadow: '0 0 20px rgba(0,242,255,0.4)'
          }}>🧬</div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.25rem', color: '#e5e1e4', letterSpacing: '-0.02em' }}>
            GENESHIELD <span style={{ color: '#00f2ff' }}>AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {user ? (
            <>
              <NavLink to="/dashboard" active={isActive('/dashboard')} label="Dashboard" />
              <NavLink to="/search" active={isActive('/search')} label="🔍 Search RSID" />
              {user.isAdmin && <NavLink to="/admin" active={isActive('/admin')} label="⚙ Admin" highlight />}

              {/* User avatar + dropdown */}
              <div style={{ position: 'relative', marginLeft: '0.5rem' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid rgba(0,212,255,0.25)',
                    borderRadius: '50px',
                    padding: '6px 14px 6px 8px',
                    cursor: 'pointer', color: '#f0f6ff',
                    fontFamily: 'Inter', fontSize: '0.88rem', fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#7c3aed,#e040fb)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 800
                  }}>{user.name?.charAt(0).toUpperCase()}</div>
                  {user.name?.split(' ')[0]}
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>▼</span>
                </button>

                {menuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: '#061424', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', minWidth: '180px',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                    overflow: 'hidden', zIndex: 200
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0f6ff' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#4a5568', marginTop: '2px' }}>{user.email}</div>
                      {user.isAdmin && (
                        <div style={{ marginTop: '4px' }}>
                          <span style={{ fontSize: '0.68rem', background: 'rgba(0,212,255,0.15)', color: '#00d4ff', padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(0,212,255,0.3)', fontWeight: 700 }}>
                            ADMIN
                          </span>
                        </div>
                      )}
                    </div>
                    <Link to="/search" onClick={() => setMenuOpen(false)}
                      style={{ display: 'block', padding: '10px 16px', color: '#8899aa', fontSize: '0.88rem', textDecoration: 'none', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#f0f6ff'; }}
                      onMouseLeave={e => { e.target.style.background = ''; e.target.style.color = '#8899aa'; }}
                    >🔍 Search RSID</Link>
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                      style={{ display: 'block', padding: '10px 16px', color: '#8899aa', fontSize: '0.88rem', textDecoration: 'none', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#f0f6ff'; }}
                      onMouseLeave={e => { e.target.style.background = ''; e.target.style.color = '#8899aa'; }}
                    >📊 Dashboard</Link>
                    {user.isAdmin && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)}
                        style={{ display: 'block', padding: '10px 16px', color: '#8899aa', fontSize: '0.88rem', textDecoration: 'none', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#f0f6ff'; }}
                        onMouseLeave={e => { e.target.style.background = ''; e.target.style.color = '#8899aa'; }}
                      >⚙ Admin Panel</Link>
                    )}
                    <Link to="/profile" onClick={() => setMenuOpen(false)}
                      style={{ display: 'block', padding: '10px 16px', color: '#8899aa', fontSize: '0.88rem', textDecoration: 'none', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#f0f6ff'; }}
                      onMouseLeave={e => { e.target.style.background = ''; e.target.style.color = '#8899aa'; }}
                    >👤 Edit Profile</Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 16px', background: 'none', border: 'none',
                        color: '#ff6b6b', fontSize: '0.88rem', cursor: 'pointer',
                        fontFamily: 'Inter', transition: 'all 0.15s',
                        borderTop: '1px solid rgba(255,255,255,0.06)'
                      }}
                      onMouseEnter={e => e.target.style.background = 'rgba(255,68,68,0.08)'}
                      onMouseLeave={e => e.target.style.background = ''}
                    >🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink to="/search" active={isActive('/search')} label="🔍 Search RSID" />
              <NavLink to="/login" active={isActive('/login')} label="Login" />
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '8px 20px', borderRadius: '50px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#00d4ff,#7c3aed)',
                  color: '#000', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Inter',
                  boxShadow: '0 0 20px rgba(0,212,255,0.3)',
                  transition: 'all 0.3s', marginLeft: '0.5rem'
                }}
                  onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 0 35px rgba(0,212,255,0.5)'; }}
                  onMouseLeave={e => { e.target.style.transform = ''; e.target.style.boxShadow = '0 0 20px rgba(0,212,255,0.3)'; }}
                >Get Started</button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Click outside to close */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
      )}
    </>
  );
}

function NavLink({ to, label, active, highlight }) {
  return (
    <Link to={to} style={{
      padding: '6px 14px', borderRadius: '50px', textDecoration: 'none',
      fontSize: '0.9rem', fontWeight: 600,
      color: active ? '#00d4ff' : highlight ? '#e040fb' : '#8899aa',
      background: active ? 'rgba(0,212,255,0.1)' : 'transparent',
      border: active ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
      transition: 'all 0.2s'
    }}>
      {label}
    </Link>
  );
}
