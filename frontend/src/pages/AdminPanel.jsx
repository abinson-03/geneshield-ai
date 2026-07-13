import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';

const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const getRiskColor = (s) => s >= 70 ? '#ff6b6b' : s >= 45 ? '#ffb74d' : '#69f0ae';

export default function AdminPanel() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('geneshield_user') || '{}');
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteMsg, setDeleteMsg] = useState('');

  // Redirect non-admins
  useEffect(() => {
    if (!user.isAdmin) { navigate('/dashboard'); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sRes, uRes, aRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllUsers(),
        adminAPI.getAllAnalyses()
      ]);
      setStats(sRes.data);
      setUsers(uRes.data);
      setAnalyses(aRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and all their data?`)) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setDeleteMsg(`User "${name}" deleted successfully.`);
      setTimeout(() => setDeleteMsg(''), 3000);
    } catch (e) { alert(e.response?.data?.error || 'Failed to delete user'); }
  };

  const handleDeleteAnalysis = async (id, name) => {
    if (!window.confirm(`Delete analysis "${name}"?`)) return;
    try {
      await adminAPI.deleteAnalysis(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
      setDeleteMsg('Analysis deleted successfully.');
      setTimeout(() => setDeleteMsg(''), 3000);
    } catch (e) { alert(e.response?.data?.error || 'Failed to delete analysis'); }
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'users', label: `👥 Users (${users.filter(u => !u.isAdmin).length})` },
    { id: 'analyses', label: `🔬 Analyses (${analyses.length})` },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid rgba(0,212,255,0.2)', borderTop: '4px solid #00d4ff', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite', margin: '0 auto 1rem' }}></div>
        <p style={{ color: '#4a5568' }}>Loading admin panel...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: '70px', paddingBottom: '4rem' }}>
      {/* Background */}
      <div style={{ position: 'fixed', top: 0, right: 0, width: 400, height: 400, background: 'rgba(124,58,237,0.07)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ padding: '2rem 0 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(224,64,251,0.1)', border: '1px solid rgba(224,64,251,0.25)', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, color: '#e040fb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            ⚙ Admin Panel
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f0f6ff', marginBottom: '0.25rem' }}>System Administration</h1>
          <p style={{ color: '#4a5568', fontSize: '0.88rem' }}>Manage users, analyses, and monitor system health</p>
        </div>

        {/* Success message */}
        {deleteMsg && (
          <div style={{ padding: '0.85rem 1rem', background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.25)', borderRadius: '10px', color: '#69f0ae', fontSize: '0.88rem', marginBottom: '1rem' }}>
            ✅ {deleteMsg}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.5rem', width: 'fit-content' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter', fontSize: '0.88rem', fontWeight: 600, transition: 'all 0.2s',
              background: tab === t.id ? 'linear-gradient(135deg,#7c3aed,#e040fb)' : 'transparent',
              color: tab === t.id ? '#fff' : '#8899aa',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ===== OVERVIEW TAB ===== */}
        {tab === 'overview' && stats && (
          <div>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#00d4ff', sub: 'Registered accounts' },
                { label: 'Total Analyses', value: stats.totalAnalyses, icon: '🔬', color: '#7c3aed', sub: 'Files processed' },
                { label: 'High Risk Analyses', value: stats.highRiskAnalyses, icon: '⚠', color: '#ff6b6b', sub: 'Score ≥ 70' },
                { label: 'Avg Risk Score', value: `${stats.averageRiskScore}/100`, icon: '📊', color: '#ffb74d', sub: 'Platform average' },
                { label: 'Variants Scanned', value: stats.totalVariantsScanned, icon: '🧬', color: '#00e676', sub: 'Total RSIDs processed' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(6,20,36,0.85)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px', padding: '1.5rem',
                  transition: 'all 0.3s', cursor: 'default',
                  animation: `fadeInUp 0.4s ease ${i * 0.08}s both`
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color, fontFamily: 'Space Grotesk', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f0f6ff', marginTop: '0.3rem' }}>{s.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#4a5568', marginTop: '0.2rem' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div style={{ background: 'rgba(6,20,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#f0f6ff' }}>⚡ Recent Activity</h3>
              </div>
              {stats.recentActivity.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#4a5568' }}>No analyses yet</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr>
                      {['File', 'User', 'Risk Score', 'Matched', 'Date'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentActivity.map((a, i) => (
                      <tr key={i} style={{ transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        <td style={{ padding: '0.85rem 1.5rem', color: '#f0f6ff', fontWeight: 500 }}>{a.fileName}</td>
                        <td style={{ padding: '0.85rem 1.5rem' }}>
                          <div style={{ color: '#8899aa' }}>{a.userName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#4a5568' }}>{a.userEmail}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1.5rem' }}>
                          <span style={{ fontWeight: 800, color: getRiskColor(a.overallRiskScore), fontFamily: 'Space Grotesk' }}>{a.overallRiskScore}</span>
                          <span style={{ color: '#4a5568', fontSize: '0.78rem' }}>/100</span>
                        </td>
                        <td style={{ padding: '0.85rem 1.5rem', color: '#8899aa' }}>{a.matchedVariants} variants</td>
                        <td style={{ padding: '0.85rem 1.5rem', color: '#4a5568', fontSize: '0.82rem' }}>{formatDate(a.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ===== USERS TAB ===== */}
        {tab === 'users' && (
          <div style={{ background: 'rgba(6,20,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#f0f6ff' }}>👥 Registered Users</h3>
              <span style={{ fontSize: '0.78rem', color: '#4a5568', background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)' }}>
                {users.filter(u => !u.isAdmin).length} users
              </span>
            </div>
            {users.filter(u => !u.isAdmin).length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#4a5568' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.4 }}>👥</div>
                <p>No users registered yet</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    {['#', 'Name', 'Email', 'Joined', 'Analyses', 'Last Analysis', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => !u.isAdmin).map((u, i) => (
                    <tr key={u.id} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '0.85rem 1.25rem', color: '#4a5568', fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 800, flexShrink: 0 }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: '#f0f6ff' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#8899aa' }}>{u.email}</td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#4a5568', fontSize: '0.82rem' }}>{formatDate(u.createdAt)}</td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', padding: '3px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '0.82rem', border: '1px solid rgba(0,212,255,0.2)' }}>
                          {u.analysisCount}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#4a5568', fontSize: '0.82rem' }}>{formatDate(u.lastAnalysis)}</td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          style={{
                            background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.25)',
                            color: '#ff6b6b', padding: '4px 14px', borderRadius: '20px',
                            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Inter',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => { e.target.style.background = 'rgba(255,68,68,0.2)'; }}
                          onMouseLeave={e => { e.target.style.background = 'rgba(255,68,68,0.1)'; }}
                        >🗑 Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ===== ANALYSES TAB ===== */}
        {tab === 'analyses' && (
          <div style={{ background: 'rgba(6,20,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#f0f6ff' }}>🔬 All Analyses</h3>
              <span style={{ fontSize: '0.78rem', color: '#4a5568', background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)' }}>
                {analyses.length} total
              </span>
            </div>
            {analyses.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#4a5568' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.4 }}>🔬</div>
                <p>No analyses yet</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr>
                      {['#', 'File', 'User', 'Risk Score', 'Variants', 'H/M/L', 'Date', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analyses.map((a, i) => (
                      <tr key={a.id} style={{ transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        <td style={{ padding: '0.85rem 1.25rem', color: '#4a5568', fontWeight: 600 }}>{i + 1}</td>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#f0f6ff', fontWeight: 500, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.fileName}</td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ color: '#8899aa' }}>{a.userName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#4a5568' }}>{a.userEmail}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${getRiskColor(a.overallRiskScore)}`, background: `${getRiskColor(a.overallRiskScore)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, color: getRiskColor(a.overallRiskScore) }}>
                              {a.overallRiskScore}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#8899aa' }}>
                          <span style={{ color: '#00d4ff', fontWeight: 600 }}>{a.matchedVariants}</span>
                          <span style={{ color: '#4a5568' }}> / {a.totalVariantsScanned}</span>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ fontSize: '0.72rem', background: 'rgba(255,68,68,0.15)', color: '#ff6b6b', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{a.riskBreakdown?.high || 0}H</span>
                            <span style={{ fontSize: '0.72rem', background: 'rgba(255,152,0,0.15)', color: '#ffb74d', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{a.riskBreakdown?.medium || 0}M</span>
                            <span style={{ fontSize: '0.72rem', background: 'rgba(0,230,118,0.12)', color: '#69f0ae', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{a.riskBreakdown?.low || 0}L</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#4a5568', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatDate(a.createdAt)}</td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Link to={`/report/${a.id}`}>
                              <button style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', padding: '4px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Inter' }}>
                                👁 View
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDeleteAnalysis(a.id, a.fileName)}
                              style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.25)', color: '#ff6b6b', padding: '4px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Inter' }}
                            >🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Admin credentials reminder */}
        <div style={{ marginTop: '2rem', padding: '1rem 1.5rem', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.2rem' }}>🔑</span>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#c4b5fd', marginBottom: '2px' }}>Admin Credentials</div>
            <div style={{ fontSize: '0.8rem', color: '#4a5568' }}>
              Email: <code style={{ color: '#00d4ff' }}>admin@geneshield.ai</code> · Password: <code style={{ color: '#00d4ff' }}>Admin@1234</code>
            </div>
          </div>
          <button onClick={loadAll} style={{ marginLeft: 'auto', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Inter', fontWeight: 600 }}>
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
