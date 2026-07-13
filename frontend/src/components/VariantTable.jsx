export default function VariantTable({ variants }) {
  if (!variants || variants.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🧬</div>
        <h3>No variants matched</h3>
        <p>No RSIDs in your file matched our database</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>RSID</th>
            <th>Gene</th>
            <th>Chr</th>
            <th>Genotype</th>
            <th>Risk Allele</th>
            <th>Risk Level</th>
            <th>Risk Score</th>
            <th>Associated Conditions</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v, i) => (
            <tr key={i} style={{ animation: `fadeInUp 0.4s ease ${i * 0.05}s both` }}>
              <td className="rsid-cell">{v.rsid}</td>
              <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{v.gene}</td>
              <td style={{ color: 'var(--text-muted)' }}>{v.chromosome}</td>
              <td>
                <code style={{
                  background: 'rgba(255,255,255,0.06)',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: '0.82rem',
                  letterSpacing: '0.1em'
                }}>{v.genotype}</code>
              </td>
              <td>
                <code style={{
                  background: 'rgba(0,212,255,0.08)',
                  color: 'var(--accent-primary)',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: '0.82rem'
                }}>{v.risk_allele}</code>
              </td>
              <td>
                <span className={`badge badge-${v.risk_level.toLowerCase()}`}>
                  {v.risk_level === 'HIGH' ? '⚠' : v.risk_level === 'MEDIUM' ? '◎' : '✓'} {v.risk_level}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ flex: 1, minWidth: '60px' }}>
                    <div className="progress-bar-wrap" style={{ height: 6 }}>
                      <div className="progress-bar-fill" style={{
                        width: `${v.risk_score}%`,
                        background: v.risk_level === 'HIGH' ? 'linear-gradient(90deg,#ff4444,#ff9800)' :
                                    v.risk_level === 'MEDIUM' ? 'linear-gradient(90deg,#ff9800,#ffd740)' :
                                    'linear-gradient(90deg,#00e676,#00b0ff)'
                      }} />
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: v.risk_level === 'HIGH' ? '#ff6b6b' : v.risk_level === 'MEDIUM' ? '#ffb74d' : '#69f0ae',
                    minWidth: '32px'
                  }}>{v.risk_score}</span>
                </div>
              </td>
              <td style={{ maxWidth: '220px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {v.diseases.slice(0, 2).map((d, di) => (
                    <span key={di} style={{
                      background: 'rgba(124,58,237,0.12)',
                      color: '#c4b5fd',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      border: '1px solid rgba(124,58,237,0.2)'
                    }}>{d}</span>
                  ))}
                  {v.diseases.length > 2 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{v.diseases.length - 2}</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
