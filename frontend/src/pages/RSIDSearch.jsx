import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { rsidAPI } from '../services/api';

const RISK_COLOR = { HIGH: '#ff6b6b', MEDIUM: '#ffb74d', LOW: '#69f0ae' };
const RISK_BG = { HIGH: 'rgba(255,68,68,0.08)', MEDIUM: 'rgba(255,152,0,0.08)', LOW: 'rgba(0,230,118,0.07)' };
const RISK_BORDER = { HIGH: 'rgba(255,68,68,0.2)', MEDIUM: 'rgba(255,152,0,0.2)', LOW: 'rgba(0,230,118,0.2)' };

const POPULAR_RSIDS = [
  { rsid: 'rs429358', gene: 'APOE', desc: "Alzheimer's / Cardiovascular" },
  { rsid: 'rs1801133', gene: 'MTHFR', desc: 'Cardiovascular / Folate' },
  { rsid: 'rs9939609', gene: 'FTO', desc: 'Obesity / Diabetes' },
  { rsid: 'rs4680', gene: 'COMT', desc: 'Anxiety / Cognition' },
  { rsid: 'rs1800562', gene: 'HFE', desc: 'Iron Overload' },
  { rsid: 'rs4149056', gene: 'SLCO1B1', desc: 'Statin Sensitivity' },
  { rsid: 'rs762551', gene: 'CYP1A2', desc: 'Caffeine Metabolism' },
  { rsid: 'rs1815739', gene: 'ACTN3', desc: 'Athletic Performance' },
];

export default function RSIDSearch() {
  const [query, setQuery] = useState('');
  const [genotype, setGenotype] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [result, setResult] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiError, setAiError] = useState('');

  const [aiPowered, setAiPowered] = useState(false);
  const dropRef = useRef();
  const debounceRef = useRef();

  // Close suggestion dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced autocomplete
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setError('');
    clearTimeout(debounceRef.current);
    if (val.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await rsidAPI.search(val);
        setSuggestions(res.data);
        setShowSuggestions(res.data.length > 0);
      } catch {}
    }, 280);
  };

  const handleSearch = async (rsidOverride) => {
    const searchRSID = (rsidOverride || query).trim();
    if (!searchRSID) return;
    setQuery(searchRSID);
    setShowSuggestions(false);
    setSuggestions([]);
    setLoading(true);
    setError('');
    setResult(null);
    setAiReport(null);
    setAiError('');

    try {
      const res = await rsidAPI.getOne(searchRSID);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'RSID not found in database.');
      if (err.response?.data?.hint) setError(prev => prev + '\n💡 ' + err.response.data.hint);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAIReport = async () => {
    if (!result) return;
    setAiLoading(true);
    setAiError('');
    setAiReport(null);
    try {
      const res = await rsidAPI.getAIReport(result.rsid, genotype || null, null);
      setAiReport(res.data.aiReport);
      setAiPowered(res.data.aiPowered);
      if (res.data.variant) {
        setResult(res.data.variant);
      }
    } catch (err) {
      setAiError(err.response?.data?.error || 'Failed to generate AI report.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '70px', paddingBottom: '4rem' }}>
      {/* BG glow */}
      <div style={{ position: 'fixed', top: '10%', left: '-5%', width: 500, height: 500, background: 'rgba(0,212,255,0.06)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '-5%', width: 400, height: 400, background: 'rgba(124,58,237,0.07)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', padding: '2.5rem 0 2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 700, color: '#00d4ff', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            🔍 Individual RSID Lookup
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, background: 'linear-gradient(135deg,#f0f6ff,#00d4ff,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.75rem', lineHeight: 1.15 }}>
            Search Your Genetic Variant
          </h1>
          <p style={{ color: '#8899aa', fontSize: '1rem', maxWidth: '520px', margin: '0 auto' }}>
            Enter any RSID to instantly look up your genetic marker, understand your risk, and get a personalized AI health report.
          </p>
        </div>

        {/* ===== SEARCH BOX ===== */}
        <div style={{ background: 'rgba(6,20,36,0.9)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem', backdropFilter: 'blur(20px)' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', marginBottom: '1rem' }} ref={dropRef}>
            {/* RSID input + dropdown */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', pointerEvents: 'none' }}>🧬</span>
                <input
                  value={query}
                  onChange={handleQueryChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="e.g. rs429358, rs1801133, APOE..."
                  style={{
                    width: '100%', padding: '0.95rem 1rem 0.95rem 2.8rem',
                    background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', color: '#f0f6ff', fontSize: '1rem', fontFamily: 'Inter',
                    outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#00d4ff'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Autocomplete dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100,
                  background: '#061424', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', boxShadow: '0 16px 48px rgba(0,0,0,0.6)', overflow: 'hidden'
                }}>
                  {suggestions.map((s, i) => (
                    <button key={i}
                      onMouseDown={() => { setQuery(s.rsid); setShowSuggestions(false); handleSearch(s.rsid); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '0.85rem 1.25rem', background: 'none',
                        border: 'none', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        cursor: 'pointer', color: '#f0f6ff', fontFamily: 'Inter', textAlign: 'left',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <div>
                        <span style={{ fontFamily: 'monospace', color: '#00d4ff', fontWeight: 700, fontSize: '0.95rem' }}>{s.rsid}</span>
                        <span style={{ color: '#8899aa', marginLeft: '0.75rem', fontSize: '0.85rem' }}>{s.gene}</span>
                        <div style={{ fontSize: '0.75rem', color: '#4a5568', marginTop: '2px' }}>{s.diseases.join(', ')}</div>
                      </div>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase',
                        background: RISK_BG[s.risk_level], color: RISK_COLOR[s.risk_level], border: `1px solid ${RISK_BORDER[s.risk_level]}`
                      }}>{s.risk_level}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search button */}
            <button onClick={() => handleSearch()} disabled={loading || !query.trim()}
              style={{
                padding: '0.95rem 1.75rem', background: loading ? 'rgba(0,212,255,0.3)' : 'linear-gradient(135deg,#00d4ff,#7c3aed)',
                border: 'none', borderRadius: '12px', color: '#000', fontWeight: 800, fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter', whiteSpace: 'nowrap',
                boxShadow: '0 0 25px rgba(0,212,255,0.3)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 0 40px rgba(0,212,255,0.5)'; } }}
              onMouseLeave={e => { e.target.style.transform = ''; e.target.style.boxShadow = '0 0 25px rgba(0,212,255,0.3)'; }}
            >
              {loading
                ? <><span style={{ width: 18, height: 18, border: '2.5px solid rgba(0,0,0,0.25)', borderTop: '2.5px solid #000', borderRadius: '50%', display: 'inline-block', animation: 'spin-slow 0.7s linear infinite' }}></span> Searching</>
                : '🔍 Search'
              }
            </button>
          </div>

          {/* Optional genotype input */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              value={genotype}
              onChange={e => setGenotype(e.target.value.toUpperCase())}
              placeholder="Your genotype (optional, e.g. TC, AA, CT)"
              maxLength={4}
              style={{
                width: '100%', padding: '0.65rem 1rem',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', color: '#f0f6ff', fontSize: '0.88rem', fontFamily: 'monospace',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Popular RSIDs */}
        {!result && !loading && (
          <div style={{ background: 'rgba(6,20,36,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.78rem', color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>🔥 Popular Variants in Our Database</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.6rem' }}>
              {POPULAR_RSIDS.map((r, i) => (
                <button key={i} onClick={() => { setQuery(r.rsid); handleSearch(r.rsid); }}
                  style={{
                    padding: '0.7rem 0.9rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '10px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontFamily: 'Inter'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                >
                  <div style={{ fontFamily: 'monospace', color: '#00d4ff', fontWeight: 700, fontSize: '0.9rem' }}>{r.rsid}</div>
                  <div style={{ fontSize: '0.72rem', color: '#8899aa', marginTop: '2px' }}>{r.gene} · {r.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)', borderRadius: '12px', color: '#ff8080', fontSize: '0.9rem', marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>
            {error}
          </div>
        )}

        {/* ===== RESULT CARD ===== */}
        {result && (
          <div style={{ animation: 'fadeInUp 0.5s ease both' }}>

            {/* Variant summary */}
            <div style={{
              background: `linear-gradient(135deg, ${RISK_BG[result.risk_level]}, rgba(6,20,36,0.9))`,
              border: `1px solid ${RISK_BORDER[result.risk_level]}`,
              borderRadius: '20px', padding: '2rem', marginBottom: '1.25rem',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  {/* RSID + gene */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 900, color: '#00d4ff' }}>{result.rsid}</span>
                    <span style={{ background: 'rgba(0,212,255,0.12)', color: '#00d4ff', padding: '3px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(0,212,255,0.25)' }}>{result.gene}</span>
                    <span style={{ background: RISK_BG[result.risk_level], color: RISK_COLOR[result.risk_level], padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, border: `1px solid ${RISK_BORDER[result.risk_level]}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {result.risk_level === 'HIGH' ? '⚠ ' : result.risk_level === 'MEDIUM' ? '◎ ' : '✓ '}{result.risk_level} RISK
                    </span>
                  </div>

                  {/* Quick info */}
                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Chromosome', val: result.chromosome },
                      { label: 'Risk Allele', val: result.risk_allele },
                      { label: 'Your Genotype', val: genotype || '—' },
                    ].map((f, i) => (
                      <div key={i}>
                        <div style={{ fontSize: '0.68rem', color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, color: '#f0f6ff', marginTop: '1px' }}>{f.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Diseases */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
                    {result.diseases.map((d, i) => (
                      <span key={i} style={{ background: 'rgba(124,58,237,0.12)', color: '#c4b5fd', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid rgba(124,58,237,0.2)' }}>{d}</span>
                    ))}
                  </div>

                  <p style={{ color: '#8899aa', fontSize: '0.9rem', lineHeight: 1.7 }}>{result.description}</p>
                </div>

                {/* Risk score circle */}
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 100, height: 100, borderRadius: '50%',
                    border: `4px solid ${RISK_COLOR[result.risk_level]}`,
                    background: RISK_BG[result.risk_level],
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 30px ${RISK_COLOR[result.risk_level]}30`
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: RISK_COLOR[result.risk_level], fontFamily: 'Space Grotesk', lineHeight: 1 }}>{result.risk_score}</div>
                    <div style={{ fontSize: '0.62rem', color: '#4a5568', fontWeight: 600, textTransform: 'uppercase' }}>/100</div>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: RISK_COLOR[result.risk_level] }}>Risk Score</div>
                </div>
              </div>

              {/* Risk progress bar */}
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#4a5568', marginBottom: '0.4rem' }}>
                  <span>Risk Score</span><span style={{ fontWeight: 700, color: RISK_COLOR[result.risk_level] }}>{result.risk_score}/100</span>
                </div>
                <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '50px',
                    background: result.risk_level === 'HIGH' ? 'linear-gradient(90deg,#ff4444,#ff9800)' : result.risk_level === 'MEDIUM' ? 'linear-gradient(90deg,#ff9800,#ffd740)' : 'linear-gradient(90deg,#00e676,#00b0ff)',
                    width: `${result.risk_score}%`,
                    transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
                    boxShadow: `0 0 12px ${RISK_COLOR[result.risk_level]}80`
                  }} />
                </div>
              </div>
            </div>

            {/* Built-in advice cards (always shown) */}
            {result.advice && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                {[
                  { key: 'diet', icon: '🥗', label: 'Diet Plan', color: '#00e676', bg: 'linear-gradient(135deg,rgba(0,230,118,0.08),rgba(0,176,255,0.05))', border: 'rgba(0,230,118,0.15)' },
                  { key: 'exercise', icon: '🏃', label: 'Exercise', color: '#00b0ff', bg: 'linear-gradient(135deg,rgba(0,176,255,0.08),rgba(124,58,237,0.05))', border: 'rgba(0,176,255,0.15)' },
                  { key: 'screening', icon: '🔬', label: 'Screening', color: '#ffb74d', bg: 'linear-gradient(135deg,rgba(255,152,0,0.08),rgba(255,68,68,0.05))', border: 'rgba(255,152,0,0.15)' },
                  { key: 'lifestyle', icon: '✨', label: 'Lifestyle', color: '#e040fb', bg: 'linear-gradient(135deg,rgba(224,64,251,0.08),rgba(124,58,237,0.05))', border: 'rgba(224,64,251,0.15)' },
                ].filter(s => result.advice[s.key]?.length).map((s, i) => (
                  <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '16px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: s.color }}>{s.label}</span>
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {result.advice[s.key].map((item, ii) => (
                        <li key={ii} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.82rem', color: '#8899aa', lineHeight: 1.5 }}>
                          <span style={{ color: s.color, flexShrink: 0 }}>→</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* AI Report section */}
            <div style={{ background: 'rgba(6,20,36,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>🤖</span>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#f0f6ff' }}>AI-Powered Health Report</h3>
                    <p style={{ fontSize: '0.75rem', color: '#00f2ff', marginTop: '1px' }}>
                      ⚡ Real-time LLaMA 3.3 Powered Report (Groq AI)
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleGetAIReport}
                  disabled={aiLoading}
                  style={{
                    padding: '0.65rem 1.5rem', background: aiLoading ? 'rgba(124,58,237,0.3)' : 'linear-gradient(135deg,#7c3aed,#e040fb)',
                    border: 'none', borderRadius: '50px', color: '#fff', fontWeight: 700, fontSize: '0.88rem',
                    cursor: aiLoading ? 'not-allowed' : 'pointer', fontFamily: 'Inter',
                    boxShadow: aiLoading ? 'none' : '0 0 20px rgba(124,58,237,0.4)',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  {aiLoading
                    ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin-slow 0.7s linear infinite' }}></span> Generating...</>
                    : aiReport ? '🔄 Regenerate Report' : '✨ Generate AI Report'
                  }
                </button>
              </div>

              {aiError && (
                <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,68,68,0.07)', borderBottom: '1px solid rgba(255,68,68,0.15)', color: '#ff8080', fontSize: '0.88rem' }}>
                  ⚠ {aiError}
                </div>
              )}

              {!aiReport && !aiLoading && !aiError && (
                <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem', opacity: 0.3 }}>🤖</div>
                  <p style={{ color: '#4a5568', fontSize: '0.9rem' }}>Click "Generate AI Report" to get a personalized health analysis for this variant</p>
                </div>
              )}

              {aiLoading && (
                <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, border: '4px solid rgba(124,58,237,0.2)', borderTop: '4px solid #7c3aed', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite', margin: '0 auto 1rem' }}></div>
                  <p style={{ color: '#8899aa', fontSize: '0.9rem' }}>
                    LLaMA 3.3 is analyzing your genetic variant via Groq...
                  </p>
                </div>
              )}

              {aiReport && (
                <div style={{ padding: '1.5rem' }}>
                  {/* AI badge */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: aiReport.source === 'groq' ? 'rgba(124,58,237,0.15)' : aiPowered ? 'rgba(0,230,118,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${aiReport.source === 'groq' ? 'rgba(124,58,237,0.3)' : aiPowered ? 'rgba(0,230,118,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, color: aiReport.source === 'groq' ? '#c4b5fd' : aiPowered ? '#69f0ae' : '#8899aa', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                    {aiReport.source === 'groq' ? '🚀 LLaMA 3.3 Powered (Groq)' : aiPowered ? '✅ GPT-4o Mini Powered' : '⚡ Rule-Based Engine'}
                  </div>

                  {/* Headline */}
                  <div style={{ padding: '1.25rem', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '14px', marginBottom: '1.25rem' }}>
                    <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f0f6ff', marginBottom: '0.75rem' }}>{aiReport.headline}</h4>
                    {aiReport.whatItMeans && <p style={{ color: '#8899aa', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>{aiReport.whatItMeans}</p>}
                    {aiReport.yourRisk && <p style={{ color: '#8899aa', fontSize: '0.88rem', lineHeight: 1.7 }}>{aiReport.yourRisk}</p>}
                  </div>

                  {/* Advice sections */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    {[
                      { key: 'dietPlan', icon: '🥗', label: 'Diet Recommendations', color: '#00e676' },
                      { key: 'exercisePlan', icon: '🏋', label: 'Exercise Plan', color: '#00b0ff' },
                      { key: 'screeningSchedule', icon: '🏥', label: 'Screening Schedule', color: '#ffb74d' },
                      { key: 'lifestyleChanges', icon: '✨', label: 'Lifestyle Changes', color: '#e040fb' },
                    ].filter(s => aiReport[s.key]?.length).map((s, i) => (
                      <div key={i} style={{ padding: '1.1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                          <span>{s.icon}</span>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: s.color }}>{s.label}</span>
                        </div>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {aiReport[s.key].map((item, ii) => (
                            <li key={ii} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.82rem', color: '#8899aa', lineHeight: 1.5 }}>
                              <span style={{ color: s.color, flexShrink: 0 }}>→</span>{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Good news */}
                  {aiReport.goodNews && (
                    <div style={{ padding: '1rem 1.25rem', background: 'rgba(0,230,118,0.07)', border: '1px solid rgba(0,230,118,0.15)', borderRadius: '12px', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1rem' }}>💚 </span>
                      <span style={{ color: '#69f0ae', fontSize: '0.88rem', fontWeight: 500 }}>{aiReport.goodNews}</span>
                    </div>
                  )}

                  {/* Dashboard notice */}
                  <div style={{
                    padding: '1rem 1.25rem',
                    background: 'rgba(0, 212, 255, 0.1)',
                    border: '1px solid rgba(0, 212, 255, 0.25)',
                    borderRadius: '12px',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>📈</span>
                      <span style={{ color: '#00d4ff', fontSize: '0.85rem', fontWeight: 600 }}>This analysis report has been saved to your dashboard history!</span>
                    </div>
                    <Link to="/dashboard" style={{ color: '#00d4ff', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'underline' }}>View Dashboard →</Link>
                  </div>

                  {/* Disclaimer */}
                  <p style={{ fontSize: '0.75rem', color: '#4a5568', lineHeight: 1.6, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    ⚠️ {aiReport.disclaimer}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
