export default function AIReport({ aiSummary }) {
  if (!aiSummary) return null;

  const sections = [
    {
      icon: '🥗',
      title: 'Personalized Diet Plan',
      color: '#00e676',
      gradient: 'linear-gradient(135deg,rgba(0,230,118,0.12),rgba(0,176,255,0.08))',
      border: 'rgba(0,230,118,0.2)',
      items: aiSummary.dietPlan || []
    },
    {
      icon: '🏃',
      title: 'Exercise Recommendations',
      color: '#00b0ff',
      gradient: 'linear-gradient(135deg,rgba(0,176,255,0.12),rgba(124,58,237,0.08))',
      border: 'rgba(0,176,255,0.2)',
      items: aiSummary.exercisePlan || []
    },
    {
      icon: '🔬',
      title: 'Screening Schedule',
      color: '#ff9800',
      gradient: 'linear-gradient(135deg,rgba(255,152,0,0.12),rgba(255,68,68,0.08))',
      border: 'rgba(255,152,0,0.2)',
      items: aiSummary.screeningSchedule || []
    },
    {
      icon: '✨',
      title: 'Lifestyle Changes',
      color: '#e040fb',
      gradient: 'linear-gradient(135deg,rgba(224,64,251,0.12),rgba(124,58,237,0.08))',
      border: 'rgba(224,64,251,0.2)',
      items: aiSummary.lifestyleChanges || []
    }
  ];

  return (
    <div>
      {/* Headline */}
      <div style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg,rgba(0,212,255,0.1),rgba(124,58,237,0.08))',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <span style={{ fontSize: '2rem', flexShrink: 0 }}>🤖</span>
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
              AI Health Analysis
            </h3>
            <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              {aiSummary.headline}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
              {aiSummary.overview}
            </p>
          </div>
        </div>
      </div>

      {/* Top Concerns */}
      {aiSummary.topConcerns && aiSummary.topConcerns.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            ⚠ High Priority Variants
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {aiSummary.topConcerns.map((c, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.85rem 1.2rem',
                background: 'rgba(255,68,68,0.07)',
                border: '1px solid rgba(255,68,68,0.2)',
                borderRadius: 'var(--radius-md)',
                animation: `fadeInUp 0.4s ease ${i * 0.1}s both`
              }}>
                <div style={{
                  background: 'rgba(255,68,68,0.15)',
                  color: '#ff6b6b',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  fontFamily: 'monospace'
                }}>{c.gene}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {c.diseases.join(', ')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    💡 {c.keyAdvice}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advice Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {sections.filter(s => s.items.length > 0).map((section, si) => (
          <div key={si} style={{
            padding: '1.25rem',
            background: section.gradient,
            border: `1px solid ${section.border}`,
            borderRadius: 'var(--radius-lg)',
            animation: `fadeInUp 0.5s ease ${si * 0.12}s both`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.3rem' }}>{section.icon}</span>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: section.color }}>{section.title}</h4>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {section.items.map((item, ii) => (
                <li key={ii} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                  fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5
                }}>
                  <span style={{ color: section.color, flexShrink: 0, marginTop: '2px' }}>→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{
        marginTop: '1.5rem',
        padding: '0.85rem 1.2rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        lineHeight: 1.6
      }}>
        ⚠️ <strong style={{ color: 'var(--text-secondary)' }}>Disclaimer:</strong> {aiSummary.disclaimer}
      </div>
    </div>
  );
}
