import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const features = [
  { icon: '🧬', title: 'RSID Variant Analysis', desc: 'Upload your genetic data file and we instantly cross-reference thousands of RSIDs against curated ClinVar & GWAS databases.', color: '#00d4ff' },
  { icon: '⚡', title: 'Real-Time Risk Scoring', desc: 'Get an instant genomic risk score with detailed breakdowns for Alzheimer\'s, cardiovascular, metabolic, and more.', color: '#7c3aed' },
  { icon: '🤖', title: 'AI Health Reports', desc: 'Our AI engine converts complex genetic data into plain-English actionable advice on diet, exercise, and screening.', color: '#00e676' },
  { icon: '📊', title: 'Interactive Dashboard', desc: 'Beautiful charts and visualizations make your genetic risk profile instantly understandable at a glance.', color: '#ff9800' },
  { icon: '🔒', title: 'Secure & Private', desc: 'Your genetic data is encrypted and associated only with your account. We never share or sell your data.', color: '#e040fb' },
  { icon: '📄', title: 'PDF Reports', desc: 'Export a comprehensive health report to share with your doctor or keep for your medical records.', color: '#ff4444' }
];

const stats = [
  { value: '20+', label: 'Genetic Markers' },
  { value: '15+', label: 'Disease Conditions' },
  { value: '100%', label: 'Privacy First' },
  { value: 'AI', label: 'Powered Insights' }
];

function DNAHelix() {
  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, width: '600px', height: '100%',
      overflow: 'hidden', pointerEvents: 'none', zIndex: 0
    }}>
      {[...Array(20)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: '8px', height: '8px',
          borderRadius: '50%',
          background: i % 3 === 0 ? 'rgba(0,212,255,0.6)' : i % 3 === 1 ? 'rgba(124,58,237,0.6)' : 'rgba(0,230,118,0.4)',
          left: `${30 + 40 * Math.sin((i / 20) * Math.PI * 4)}%`,
          top: `${(i / 20) * 100}%`,
          animation: `dna-float ${3 + (i % 5)}s ease-in-out ${i * 0.3}s infinite`,
          boxShadow: `0 0 10px currentColor`
        }} />
      ))}
      {[...Array(20)].map((_, i) => (
        <div key={`b-${i}`} style={{
          position: 'absolute',
          width: '4px', height: '4px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          left: `${60 - 40 * Math.sin((i / 20) * Math.PI * 4)}%`,
          top: `${(i / 20) * 100}%`,
          animation: `dna-float ${4 + (i % 4)}s ease-in-out ${i * 0.4 + 0.5}s infinite`
        }} />
      ))}
    </div>
  );
}

export default function Landing() {
  const isLoggedIn = !!localStorage.getItem('geneshield_token');

  return (
    <div className="page-wrapper">
      {/* ===== HERO ===== */}
      <section style={{
        position: 'relative',
        minHeight: 'calc(100vh - 70px)',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
        padding: '4rem 0'
      }}>
        {/* Background orbs */}
        <div className="glow-orb" style={{ width: 500, height: 500, background: 'rgba(0,212,255,0.12)', top: '10%', left: '-10%' }} />
        <div className="glow-orb" style={{ width: 400, height: 400, background: 'rgba(124,58,237,0.12)', bottom: '10%', right: '-5%' }} />
        <DNAHelix />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '700px' }}>
            <div className="section-tag animate-fade-up">
              🧬 KTU MCA Mini Project — SNGCE 2026-2027
            </div>

            <h1 className="animate-fade-up delay-1" style={{
              fontSize: 'clamp(2.8rem, 6vw, 5rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #f0f6ff 0%, #00d4ff 50%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Decode Your<br />DNA. Protect<br />Your Future.
            </h1>

            <p className="animate-fade-up delay-2" style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              marginBottom: '2.5rem',
              lineHeight: 1.8,
              maxWidth: '560px'
            }}>
              GeneShield AI transforms your raw genetic data into a personalized
              preventative health roadmap — powered by AI, backed by clinical research.
            </p>

            <div className="animate-fade-up delay-3" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {isLoggedIn ? (
                <>
                  <Link to="/dashboard">
                    <button className="btn btn-primary btn-lg">
                      🚀 Go to Dashboard
                    </button>
                  </Link>
                  <Link to="/search">
                    <button className="btn btn-outline btn-lg">
                      🔍 Search Specific RSID
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <button className="btn btn-primary btn-lg animate-pulse-glow">
                      🧬 Start Free Analysis
                    </button>
                  </Link>
                  <Link to="/search">
                    <button className="btn btn-outline btn-lg">
                      🔍 Search Specific RSID
                    </button>
                  </Link>
                  <Link to="/login">
                    <button className="btn btn-ghost btn-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      Sign In
                    </button>
                  </Link>
                </>
              )}
            </div>

            <div className="animate-fade-up delay-4" style={{
              marginTop: '2.5rem',
              display: 'flex', gap: '2rem', flexWrap: 'wrap'
            }}>
              {[
                { v: 'CSV / VCF', l: 'File Support' },
                { v: '< 30s', l: 'Analysis Time' },
                { v: 'ClinVar', l: 'Database' }
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'Space Grotesk' }}>{item.v}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section style={{ padding: '2rem 0', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', textAlign: 'center' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ animation: `fadeInUp 0.5s ease ${i * 0.1}s both` }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontFamily: 'Space Grotesk' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-tag" style={{ margin: '0 auto 1rem' }}>How It Works</div>
            <h2 className="section-title">From DNA File to Health Plan<br />in 3 Simple Steps</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2rem', position: 'relative' }}>
            {[
              { step: '01', icon: '📤', title: 'Upload Your File', desc: 'Upload a CSV or VCF file containing your RSID genetic markers from any sequencing provider.', color: '#00d4ff' },
              { step: '02', icon: '🔬', title: 'AI Analysis Engine', desc: 'Our engine cross-references your markers against a curated ClinVar database and scores each variant.', color: '#7c3aed' },
              { step: '03', icon: '📋', title: 'Get Your Report', desc: 'Receive a comprehensive health report with AI-generated diet, exercise, and screening recommendations.', color: '#00e676' }
            ].map((item, i) => (
              <div key={i} className="glass-card" style={{ padding: '2rem', position: 'relative', textAlign: 'center', animation: `fadeInUp 0.5s ease ${i * 0.15}s both` }}>
                <div style={{
                  position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)',
                  background: item.color,
                  color: '#000',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  padding: '4px 14px',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.05em'
                }}>STEP {item.step}</div>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', marginTop: '0.5rem' }}>{item.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem', color: item.color }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{ padding: '5rem 0', background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div style={{ marginBottom: '3rem' }}>
            <div className="section-tag">Features</div>
            <h2 className="section-title">Everything You Need<br />to Understand Your Genes</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>
            {features.map((f, i) => (
              <div key={i} className="glass-card" style={{ padding: '1.75rem', animation: `fadeInUp 0.5s ease ${i * 0.1}s both` }}>
                <div style={{
                  width: '52px', height: '52px',
                  background: `rgba(${f.color === '#00d4ff' ? '0,212,255' : f.color === '#7c3aed' ? '124,58,237' : f.color === '#00e676' ? '0,230,118' : f.color === '#ff9800' ? '255,152,0' : f.color === '#e040fb' ? '224,64,251' : '255,68,68'},0.1)`,
                  border: `1px solid ${f.color}33`,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '1rem'
                }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', color: f.color }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{
            padding: '4rem',
            background: 'linear-gradient(135deg,rgba(0,212,255,0.08),rgba(124,58,237,0.08))',
            border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: 'var(--radius-xl)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div className="glow-orb" style={{ width: 300, height: 300, background: 'rgba(0,212,255,0.08)', top: '-50%', left: '-10%' }} />
            <div className="glow-orb" style={{ width: 300, height: 300, background: 'rgba(124,58,237,0.08)', bottom: '-50%', right: '-10%' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧬</div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Ready to Know Your Genetic Story?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                Join GeneShield AI and get your personalized preventive health report in under 30 seconds.
              </p>
              {!isLoggedIn && (
                <Link to="/register">
                  <button className="btn btn-primary btn-lg animate-pulse-glow">
                    🚀 Start Your Free Analysis
                  </button>
                </Link>
              )}
              {isLoggedIn && (
                <Link to="/dashboard">
                  <button className="btn btn-primary btn-lg">Go to Dashboard</button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '2rem 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            🧬 <strong style={{ color: 'var(--text-secondary)' }}>GeneShield AI</strong> — SNGCE MCA Mini Project by <strong style={{ color: 'var(--accent-primary)' }}>Abinson Babu</strong> | 3rd Semester | Academic Year 2026-2027
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem' }}>
            For educational purposes only. Not a substitute for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
