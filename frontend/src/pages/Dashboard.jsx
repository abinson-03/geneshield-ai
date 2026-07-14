import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import { analysisAPI } from '../services/api';

const getRiskColor = (s) => s >= 70 ? '#ff6b6b' : s >= 45 ? '#ffb74d' : '#69f0ae';
const getRiskLabel = (s) => s >= 70 ? 'High' : s >= 45 ? 'Moderate' : 'Low';
const getRiskClass = (s) => s >= 70 ? 'high' : s >= 45 ? 'medium' : 'low';
const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('geneshield_user') || '{}');
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchAnalyses(); }, []);

  const fetchAnalyses = async () => {
    try {
      const res = await analysisAPI.getAll();
      setAnalyses(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete analysis "${name}"?`)) return;
    setDeleting(id);
    try {
      await analysisAPI.delete(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
      setMsg('Analysis deleted.');
      setTimeout(() => setMsg(''), 2500);
    } catch (e) { alert('Delete failed'); }
    finally { setDeleting(null); }
  };

  const totalHigh = analyses.reduce((a, r) => a + (r.riskBreakdown?.high || 0), 0);
  const totalMatched = analyses.reduce((a, r) => a + (r.matchedVariants || 0), 0);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '70px', paddingBottom: '4rem' }}>
      {/* BG glow */}
      <div style={{ position: 'fixed', top: 0, right: 0, width: 500, height: 500, background: 'rgba(0,212,255,0.05)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>

        {/* Page Header */}
        <div style={{ padding: '2.5rem 0 2rem', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 700, color: '#00d4ff', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            🧬 Dashboard
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f0f6ff' }}>
            Welcome back, <span style={{ background: 'linear-gradient(135deg,#00f2ff,#ff24e4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{user.name?.split(' ')[0] || 'User'}</span> 👋
          </h1>
          <p style={{ color: '#849495', marginTop: '0.4rem', fontSize: '0.9rem' }}>
            Upload your genetic data and get AI-powered health insights
          </p>
          {user.isAdmin && (
            <div className="glass-card" style={{
              marginTop: '1.25rem',
              padding: '1rem 1.25rem',
              background: 'rgba(255, 36, 228, 0.1) !important',
              border: '1px solid rgba(255, 36, 228, 0.25) !important',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚙️</span>
              <p style={{ fontSize: '0.85rem', color: '#b9cacb', margin: 0 }}>
                You are logged in as an Administrator. To manage users, delete analyses, or view system-wide stats, please visit the <Link to="/admin" style={{ color: '#00f2ff', textDecoration: 'underline', fontWeight: 700 }}>Admin Panel</Link>.
              </p>
            </div>
          )}
        </div>

        {/* Toast message */}
        {msg && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.25)', borderRadius: '10px', color: '#69f0ae', fontSize: '0.88rem', marginBottom: '1rem' }}>
            ✅ {msg}
          </div>
        )}

        {/* Stats row */}
        <div className="dashboard-stats-grid">
          {[
            { label: 'Total Analyses', value: analyses.length, icon: '🔬', color: '#00d4ff' },
            { label: 'Variants Matched', value: totalMatched, icon: '🧬', color: '#7c3aed' },
            { label: 'High Risk Variants', value: totalHigh, icon: '⚠', color: '#ff6b6b' },
            { label: 'Account', value: user.isAdmin ? 'Admin' : 'Active', icon: user.isAdmin ? '👑' : '✅', color: user.isAdmin ? '#e040fb' : '#69f0ae' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(6,20,36,0.85)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px', padding: '1.5rem',
              transition: 'all 0.3s',
              animation: `fadeInUp 0.4s ease ${i * 0.08}s both`
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${s.color}40`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            >
              <div style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.color, fontFamily: 'Space Grotesk', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 500, color: '#4a5568', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Main 2-column grid */}
        <div className="dashboard-grid">

          {/* Upload panel */}
          <div style={{ animation: 'fadeInUp 0.5s ease 0.2s both' }}>
            <FileUpload />
          </div>

          {/* Analysis History */}
          <div style={{
            background: 'rgba(6,20,36,0.85)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px', overflow: 'hidden',
            animation: 'fadeInUp 0.5s ease 0.3s both'
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f0f6ff' }}>📋 Analysis History</h2>
              {analyses.length > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#4a5568', background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {analyses.length} {analyses.length === 1 ? 'result' : 'results'}
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, border: '3px solid rgba(0,212,255,0.2)', borderTop: '3px solid #00d4ff', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite', margin: '0 auto 1rem' }}></div>
                <p style={{ color: '#4a5568', fontSize: '0.85rem' }}>Loading your analyses...</p>
              </div>
            ) : analyses.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem', opacity: 0.3 }}>📂</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f6ff', marginBottom: '0.4rem' }}>No analyses yet</h3>
                <p style={{ fontSize: '0.85rem', color: '#4a5568' }}>Upload a genetic file on the left to get started</p>
              </div>
            ) : (
              <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {analyses.map((a, i) => (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.5rem',
                    borderBottom: i < analyses.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    cursor: 'pointer', transition: 'background 0.15s'
                  }}
                    onClick={() => navigate(`/report/${a.id}`)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    {/* Risk circle */}
                    <div style={{
                      width: 46, height: 46, flexShrink: 0, borderRadius: '50%',
                      border: `2.5px solid ${getRiskColor(a.overallRiskScore)}`,
                      background: `${getRiskColor(a.overallRiskScore)}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.82rem', fontWeight: 800,
                      color: getRiskColor(a.overallRiskScore), fontFamily: 'Space Grotesk'
                    }}>
                      {a.overallRiskScore}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f0f6ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.2rem' }}>
                        {a.fileName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#4a5568' }}>
                        {a.matchedVariants} variants · {formatDate(a.createdAt)}
                      </div>
                    </div>

                    {/* Badge + delete */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                        background: a.overallRiskScore >= 70 ? 'rgba(255,68,68,0.12)' : a.overallRiskScore >= 45 ? 'rgba(255,152,0,0.12)' : 'rgba(0,230,118,0.1)',
                        color: getRiskColor(a.overallRiskScore),
                        border: `1px solid ${getRiskColor(a.overallRiskScore)}40`
                      }}>
                        {getRiskLabel(a.overallRiskScore)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(a.id, a.fileName); }}
                        disabled={deleting === a.id}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5568', fontSize: '1rem', padding: '4px', borderRadius: '6px', transition: 'all 0.15s', lineHeight: 1 }}
                        onMouseEnter={e => { e.target.style.color = '#ff6b6b'; e.target.style.background = 'rgba(255,68,68,0.08)'; }}
                        onMouseLeave={e => { e.target.style.color = '#4a5568'; e.target.style.background = ''; }}
                        title="Delete analysis"
                      >
                        {deleting === a.id ? '⌛' : '🗑'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {analyses.length > 0 && (
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <p style={{ fontSize: '0.78rem', color: '#4a5568' }}>Click any row to view the full report →</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
