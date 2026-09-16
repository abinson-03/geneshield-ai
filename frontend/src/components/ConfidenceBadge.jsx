/**
 * ConfidenceBadge
 *
 * Renders a small colored pill badge indicating how broadly a variant's
 * risk associations have been studied across diverse populations.
 *
 *   High     -> green  -- at least one non-European population explicitly studied
 *   Moderate -> amber  -- 'Global' claimed, or partial multi-ethnic data
 *   Low      -> red    -- European-only evidence base; transferability uncertain
 *
 * Mirrors the existing .badge CSS dimensions and color conventions,
 * so it sits flush next to the Risk Level badge in VariantTable
 * without requiring any layout changes.
 *
 * Props:
 *   level  {string}  'High' | 'Moderate' | 'Low'  (case-sensitive, matches
 *                    the string returned by computeConfidenceScore on the backend)
 */

const CONFIDENCE_STYLES = {
  High: {
    background: 'rgba(0, 230, 118, 0.12)',
    color: '#69f0ae',
    border: '1px solid rgba(0, 230, 118, 0.3)',
    icon: '✦',
  },
  Moderate: {
    background: 'rgba(255, 152, 0, 0.15)',
    color: '#ffb74d',
    border: '1px solid rgba(255, 152, 0, 0.3)',
    icon: '◈',
  },
  Low: {
    background: 'rgba(255, 68, 68, 0.15)',
    color: '#ff6b6b',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    icon: '⚑',
  },
};

// Fallback for missing or unrecognised level values
const UNKNOWN_STYLE = {
  background: 'rgba(255,255,255,0.06)',
  color: '#849495',
  border: '1px solid rgba(255,255,255,0.1)',
  icon: '?',
};

export default function ConfidenceBadge({ level }) {
  const styles = CONFIDENCE_STYLES[level] ?? UNKNOWN_STYLE;
  const label  = level ?? '—';

  return (
    <span
      title={`Population Confidence: ${label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        background: styles.background,
        color: styles.color,
        border: styles.border,
      }}
    >
      <span style={{ fontSize: '0.65rem' }}>{styles.icon}</span>
      {label}
    </span>
  );
}
