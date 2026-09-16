import { useState, Fragment } from 'react';
import ConfidenceBadge from './ConfidenceBadge';
import { getLocalContextTip } from '../services/localContext';

export default function VariantTable({ variants }) {
  // Tracks which row indices have their explanation panel open
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (i) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };
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
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v, i) => {
            const isOpen = expandedRows.has(i);

            // Plain-language explanation copy — no clinical jargon
            const explanationPanel = (() => {
              if (v.confidenceScore === 'High') {
                return {
                  headline: '✦ Well-studied across diverse populations',
                  body: 'This variant has been researched in multiple groups of people, including non-European ancestries. That means the findings here are more likely to be relevant for you, regardless of your background.',
                  note: null,
                };
              }
              if (v.confidenceScore === 'Moderate') {
                return {
                  headline: '◈ Studied in a broad mix of populations',
                  body: 'There is some evidence from people of different backgrounds for this variant, though the research is not yet as complete as we\'d like. Results are likely meaningful for most people, but may be more accurate for some ancestries than others.',
                  note: null,
                };
              }
              // Low (or unknown)
              return {
                headline: '⚑ Studied mainly in people of European ancestry',
                body: 'Most large genetic databases were built using studies that focused on people of European descent. This variant is one of them. That doesn\'t mean the finding is wrong — but it does mean the risk estimate may be less accurate if your ancestry is different.',
                note: v.representation_note
                  ? v.representation_note.replace(/^DEMO DATA\s*[—–-]*\s*/i, '')
                  : null,
              };
            })();

            return (
              <Fragment key={`variant-row-${v.rsid || i}`}>
                {/* ── Main data row — all existing columns unchanged ── */}
                <tr key={`row-${i}`} style={{ animation: `fadeInUp 0.4s ease ${i * 0.05}s both` }}>
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
                  {/* ── Confidence column: badge + "Why?" toggle ── */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-start' }}>
                      <ConfidenceBadge level={v.confidenceScore} />
                      <button
                        onClick={() => toggleRow(i)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          textDecoration: 'underline',
                          fontFamily: 'inherit',
                          letterSpacing: '0.02em',
                        }}
                        aria-expanded={isOpen}
                        aria-label={`${isOpen ? 'Hide' : 'Show'} confidence explanation for ${v.rsid}`}
                      >
                        {isOpen ? '▲ hide' : '▾ why?'}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* ── Expandable explanation panel row ── */}
                <tr key={`panel-${i}`} style={{ display: isOpen ? 'table-row' : 'none' }}>
                  <td
                    colSpan={9}
                    style={{
                      padding: isOpen ? '0.75rem 1.25rem 1rem' : 0,
                      background: 'rgba(255,255,255,0.025)',
                      borderTop: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      maxWidth: '680px',
                    }}>
                      {/* Headline */}
                      <p style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: v.confidenceScore === 'High' ? '#69f0ae'
                             : v.confidenceScore === 'Moderate' ? '#ffb74d'
                             : '#ff6b6b',
                      }}>
                        {explanationPanel.headline}
                      </p>

                      {/* Plain-language body */}
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#b9cacb', lineHeight: 1.6 }}>
                        {explanationPanel.body}
                      </p>

                      {/* representation_note (Low only, DEMO DATA prefix stripped) */}
                      {explanationPanel.note && (
                        <p style={{
                          margin: '0.25rem 0 0',
                          fontSize: '0.74rem',
                          color: '#4a5568',
                          lineHeight: 1.5,
                          borderLeft: '2px solid rgba(255,107,107,0.3)',
                          paddingLeft: '0.6rem',
                          fontStyle: 'italic',
                        }}>
                          {explanationPanel.note}
                        </p>
                      )}

                      {/* ── Local context tip (HIGH risk only, India / Kerala) ── */}
                      {v.risk_level === 'HIGH' && (() => {
                        const tip = getLocalContextTip(v.diseases);
                        if (!tip) return null;
                        return (
                          <div style={{
                            marginTop: '0.75rem',
                            padding: '0.6rem 0.75rem',
                            background: 'rgba(255, 213, 79, 0.05)',
                            border: '1px solid rgba(255, 213, 79, 0.18)',
                            borderRadius: '6px',
                          }}>
                            {/* Header row */}
                            <p style={{
                              margin: '0 0 0.3rem',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#ffd54f',
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}>
                              <span>🇮🇳</span>
                              {tip.header}
                            </p>
                            {/* Tip body */}
                            <p style={{
                              margin: '0 0 0.35rem',
                              fontSize: '0.78rem',
                              color: '#b9cacb',
                              lineHeight: 1.6,
                            }}>
                              {tip.text}
                            </p>
                            {/* Mandatory disclaimer */}
                            <p style={{
                              margin: 0,
                              fontSize: '0.68rem',
                              color: '#4a5568',
                              fontStyle: 'italic',
                            }}>
                              Illustrative only — scheme names and availability may change.
                              Verify directly with the provider before taking action.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
