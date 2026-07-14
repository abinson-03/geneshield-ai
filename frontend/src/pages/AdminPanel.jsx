import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';

const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const getRiskColor = (s) => s >= 70 ? '#ff6b6b' : s >= 45 ? '#ffb74d' : '#69f0ae';
const getRiskLabel = (s) => s >= 70 ? 'High' : s >= 45 ? 'Moderate' : 'Low';

// Read all analyses from all users' localStorage
function getAllLocalAnalyses() {
  const all = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('geneshield_analyses_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        if (Array.isArray(data)) all.push(...data);
      } catch {}
    }
  }
  return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('geneshield_user') || '{}');
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteMsg, setDeleteMsg] = useState('');

  useEffect(() => {
    if (!user.isAdmin) { navigate('/dashboard'); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    // Load local analyses first (most reliable)
    const localAnalyses = getAllLocalAnalyses();
    setAnalyses(localAnalyses);

    try {
      const [sRes, uRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllUsers(),
      ]);

      // Merge: backend stats + local analyses count
      const backendStats = sRes.data;
      const mergedAnalyses = localAnalyses.length > 0 ? localAnalyses : [];

      setStats({
        ...backendStats,
        totalAnalyses: Math.max(backendStats.totalAnalyses || 0, mergedAnalyses.length),
        highRiskAnalyses: mergedAnalyses.filter(a => (a.overallRiskScore || 0) >= 70).length,
        averageRiskScore: mergedAnalyses.length > 0
          ? Math.round(mergedAnalyses.reduce((s, a) => s + (a.overallRiskScore || 0), 0) / mergedAnalyses.length)
          : backendStats.averageRiskScore || 0,
        totalVariantsScanned: mergedAnalyses.reduce((s, a) => s + (a.totalVariantsScanned || 0), 0)
          || backendStats.totalVariantsScanned || 0,
      });
      setUsers(uRes.data);

      // Try to get backend analyses too and merge
      try {
        const aRes = await adminAPI.getAllAnalyses();
        const backendAnalyses = Array.isArray(aRes.data) ? aRes.data : [];
        const merged = [...localAnalyses];
        for (const ba of backendAnalyses) {
          if (!merged.some(a => a.id === ba.id)) merged.push(ba);
        }
        setAnalyses(merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch {}

    } catch (e) {
      console.error(e);
      // Fallback: just show local data
      setStats({
        totalUsers: 5,
        totalAnalyses: localAnalyses.length,
        highRiskAnalyses: localAnalyses.filter(a => (a.overallRiskScore || 0) >= 70).length,
        averageRiskScore: localAnalyses.length > 0
          ? Math.round(localAnalyses.reduce((s, a) => s + (a.overallRiskScore || 0), 0) / localAnalyses.length)
          : 0,
        totalVariantsScanned: localAnalyses.reduce((s, a) => s + (a.totalVariantsScanned || 0), 0),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and all their data?`)) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      // Also remove their local analyses
      const key = `geneshield_analyses_${id}`;
      localStorage.removeItem(key);
      setDeleteMsg(`User "${name}" deleted successfully.`);
      setTimeout(() => setDeleteMsg(''), 3000);
    } catch (e) { alert(e.response?.data?.error || 'Failed to delete user'); }
  };

  const handleDeleteAnalysis = async (id, name) => {
    if (!window.confirm(`Delete analysis "${name}"?`)) return;
    try {
      await adminAPI.deleteAnalysis(id).catch(() => {});
      setAnalyses(prev => prev.filter(a => a.id !== id));
      setDeleteMsg('Analysis deleted successfully.');
      setTimeout(() => setDeleteMsg(''), 3000);
    } catch (e) { alert('Failed to delete analysis'); }
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

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? users.filter(u => !u.isAdmin).length, icon: '👥', color: '#7c3aed' },
    { label: 'Total Analyses', value: stats?.totalAnalyses ?? analyses.length, icon: '🔬', color: '#00d4ff' },
    { label: 'High Risk Analyses', value: stats?.highRiskAnalyses ?? 0, icon: '⚠', color: '#ff6b6b' },
    { label: 'Avg Risk Score', value: `${stats?.averageRiskScore ?? 0}/100`, icon: '📊', color: '#ffb74d' },
    { label: 'Variants Scanned', value: stats?.totalVariantsScanned ?? 0, icon: '🧬', color: '#69f0ae' },
  ];

  return (
    <div style={{ minHeight: '100vh', paddingTop: '70px', paddingBottom: '4rem' }}>
      <div style={{ position: 'fixed', top: 0, right: 0, width: 400, height: 400, background: 'rgba(124,58,237,0.07)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ padding: '2.5rem 0 2rem', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(255,36,228,0.1)', border: '1px solid rgba(255,36,228,0.25)', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 700, color: '#ff24e4', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            ⚙ Admin Panel
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f0f6ff' }}>System Administration</h1>
          <p style={{ color: '#849495', marginTop: '0.4rem', fontSize: '0.9rem' }}>Manage users, analyses, and monitor system health</p>
        </div>

        {deleteMsg && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.25)', borderRadius: '10px', color: '#69f0ae', fontSize: '0.88rem', marginBottom: '1rem' }}>✅ {deleteMsg}</div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? 'rgba(255,36,228,0.1)' : 'none',
              border: 'none', borderBottom: tab === t.id ? '2px solid #ff24e4' : '2px solid transparent',
              padding: '0.75rem 1.25rem', cursor: 'pointer',
              color: tab === t.id ? '#ff24e4' : '#4a5568',
              fontSize: '0.85rem', fontWeight: tab === t.id ? 700 : 500,
              transition: 'all 0.2s', fontFamily: 'inherit'
            }}>{t.label}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {statCards.map((s, i) => (
                <div key={i} style={{ background: 'rgba(6,20,36,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', animation: `fadeInUp 0.4s ease ${i * 0.05}s both` }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.7rem', fontWeight: 900, color: s.color, fontFamily: 'Space Grotesk' }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: '#4a5568', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            {analyses.length > 0 && (
              <div style={{ background: 'rgba(6,20,36,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 style={{ color: '#f0f6ff', fontSize: '1rem', fontWeight: 700 }}>Recent Analyses</h3>
                </div>
                {analyses.slice(0, 5).map((a, i) => (
                  <div key={a.id} style={{ padding: '1rem 1.5rem', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${getRiskColor(a.overallRiskScore)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, color: getRiskColor(a.overallRiskScore), flexShrink: 0 }}>
                      {a.overallRiskScore}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#f0f6ff', fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.fileName}</div>
                      <div style={{ color: '#4a5568', fontSize: '0.75rem' }}>{a.matchedVariants} variants · {formatDate(a.createdAt)}</div>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', background: `${getRiskColor(a.overallRiskScore)}12`, color: getRiskColor(a.overallRiskScore), border: `1px solid ${getRiskColor(a.overallRiskScore)}40`, flexShrink: 0 }}>
                      {getRiskLabel(a.overallRiskScore)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <div style={{ background: 'rgba(6,20,36,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ color: '#f0f6ff', fontSize: '1rem', fontWeight: 700 }}>Registered Users</h3>
            </div>
            {users.filter(u => !u.isAdmin).length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#4a5568' }}>No users found</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Name', 'Email', 'Joined', 'Analyses', 'Last Active', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', color: '#4a5568', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => !u.isAdmin).map((u, i) => (
                      <tr key={u.id} style={{ borderBottom: i < users.filter(u => !u.isAdmin).length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <td style={{ padding: '1rem 1.5rem', color: '#f0f6ff', fontWeight: 600 }}>{u.name}</td>
                        <td style={{ padding: '1rem 1.5rem', color: '#849495' }}>{u.email}</td>
                        <td style={{ padding: '1rem 1.5rem', color: '#4a5568', whiteSpace: 'nowrap' }}>{formatDate(u.createdAt)}</td>
                        <td style={{ padding: '1rem 1.5rem', color: '#00d4ff', fontWeight: 700 }}>{u.analysisCount || 0}</td>
                        <td style={{ padding: '1rem 1.5rem', color: '#4a5568', whiteSpace: 'nowrap' }}>{formatDate(u.lastAnalysis)}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <button onClick={() => handleDeleteUser(u.id, u.name)} style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.25)', color: '#ff6b6b', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Analyses tab */}
        {tab === 'analyses' && (
          <div style={{ background: 'rgba(6,20,36,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ color: '#f0f6ff', fontSize: '1rem', fontWeight: 700 }}>All Analyses ({analyses.length})</h3>
            </div>
            {analyses.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#4a5568' }}>No analyses found</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['File / Name', 'Risk', 'Variants', 'Date', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', color: '#4a5568', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analyses.map((a, i) => (
                      <tr key={a.id} style={{ borderBottom: i < analyses.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <td style={{ padding: '1rem 1.5rem', color: '#f0f6ff', fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.fileName}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', background: `${getRiskColor(a.overallRiskScore)}12`, color: getRiskColor(a.overallRiskScore), border: `1px solid ${getRiskColor(a.overallRiskScore)}40` }}>
                            {a.overallRiskScore} — {getRiskLabel(a.overallRiskScore)}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', color: '#7c3aed', fontWeight: 700 }}>{a.matchedVariants}</td>
                        <td style={{ padding: '1rem 1.5rem', color: '#4a5568', whiteSpace: 'nowrap' }}>{formatDate(a.createdAt)}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <button onClick={() => handleDeleteAnalysis(a.id, a.fileName)} style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.25)', color: '#ff6b6b', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
