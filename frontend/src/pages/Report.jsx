import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import { RiskDonutChart, DiseaseRiskBarChart, RiskBreakdownChart } from '../components/Charts';
import VariantTable from '../components/VariantTable';
import AIReport from '../components/AIReport';

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const res = await analysisAPI.getById(id);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handlePDFExport = async () => {
    setExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#020b18',
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`GeneShield_Report_${data.fileName.split('.')[0]}.pdf`);
    } catch (e) {
      alert('PDF export failed. Try again.');
    } finally {
      setExporting(false);
    }
  };

  const getRiskColor = (score) => score >= 70 ? '#ff6b6b' : score >= 45 ? '#ffb74d' : '#69f0ae';
  const getRiskLabel = (score) => score >= 70 ? 'High Risk' : score >= 45 ? 'Moderate Risk' : 'Low Risk';
  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'variants', label: '🧬 Variants', icon: '🧬' },
    { id: 'diseases', label: '🏥 Disease Risks', icon: '🏥' },
    { id: 'ai', label: '🤖 AI Report', icon: '🤖' }
  ];

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading your genetic report...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Report Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <Link to="/dashboard"><button className="btn btn-primary">← Back to Dashboard</button></Link>
        </div>
      </div>
    );
  }

  const riskColor = getRiskColor(data.overallRiskScore);

  return (
    <div className="page-wrapper" ref={reportRef}>
      <div className="glow-orb" style={{ width: 500, height: 500, background: `${riskColor}10`, top: 0, right: '-10%' }} />

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', position: 'relative', zIndex: 1 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link to="/dashboard" style={{ color: 'var(--accent-primary)' }}>Dashboard</Link>
          <span>›</span>
          <span>Analysis Report</span>
        </div>

        {/* Header */}
        <div style={{
          padding: '2rem',
          background: `linear-gradient(135deg, ${riskColor}10, rgba(2,11,24,0.8))`,
          border: `1px solid ${riskColor}25`,
          borderRadius: 'var(--radius-xl)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <div className="section-tag" style={{ marginBottom: '0.75rem' }}>Genetic Analysis Report</div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                {data.fileName}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Analyzed on {formatDate(data.createdAt)}
              </p>
              {/* Quick stats */}
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Variants Scanned', value: data.totalVariantsScanned },
                  { label: 'Matches Found', value: data.matchedVariants },
                  { label: 'High Risk', value: data.riskBreakdown?.high || 0 },
                  { label: 'Conditions Flagged', value: data.diseaseRisks?.length || 0 }
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: riskColor, fontFamily: 'Space Grotesk' }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Big risk score */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '120px', height: '120px',
                borderRadius: '50%',
                border: `4px solid ${riskColor}`,
                background: `${riskColor}10`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 40px ${riskColor}30`
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: riskColor, fontFamily: 'Space Grotesk', lineHeight: 1 }}>{data.overallRiskScore}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>/ 100</div>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: riskColor }}>{getRiskLabel(data.overallRiskScore)}</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePDFExport} disabled={exporting}>
              {exporting ? <><span className="spinner" style={{ width: 16, height: 16 }}></span> Exporting...</> : '📄 Export PDF'}
            </button>
            <Link to="/dashboard"><button className="btn btn-ghost btn-sm">← Back to Dashboard</button></Link>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter',
                fontSize: '0.88rem',
                fontWeight: 600,
                transition: 'var(--transition)',
                background: activeTab === tab.id ? 'var(--gradient-primary)' : 'transparent',
                color: activeTab === tab.id ? '#000' : 'var(--text-secondary)',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Risk Donut */}
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>Overall Genomic Risk Score</h3>
              <RiskDonutChart overallRiskScore={data.overallRiskScore} riskBreakdown={data.riskBreakdown} />
              <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Your genomic risk score is <strong style={{ color: riskColor }}>{data.overallRiskScore}/100</strong> based on {data.matchedVariants} matched genetic variants.
              </p>
            </div>

            {/* Risk Breakdown */}
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>Variant Risk Distribution</h3>
              <div style={{ maxWidth: '220px', margin: '0 auto' }}>
                <RiskBreakdownChart riskBreakdown={data.riskBreakdown} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                {[
                  { label: 'High', value: data.riskBreakdown?.high || 0, color: '#ff6b6b' },
                  { label: 'Medium', value: data.riskBreakdown?.medium || 0, color: '#ffb74d' },
                  { label: 'Low', value: data.riskBreakdown?.low || 0, color: '#69f0ae' }
                ].map((item, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: item.color, fontFamily: 'Space Grotesk' }}>{item.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top High-Risk Conditions */}
            <div className="glass-card" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1rem' }}>Top Disease Risk Scores</h3>
              <DiseaseRiskBarChart diseaseRisks={data.diseaseRisks} />
            </div>
          </div>
        )}

        {activeTab === 'variants' && (
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Matched Genetic Variants</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-glass)', padding: '3px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-glass)' }}>
                {data.variants?.length || 0} variants
              </span>
            </div>
            <VariantTable variants={data.variants} />
          </div>
        )}

        {activeTab === 'diseases' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Disease Risk Analysis</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {(data.diseaseRisks || []).map((d, i) => {
                  const col = d.score >= 70 ? '#ff6b6b' : d.score >= 45 ? '#ffb74d' : '#69f0ae';
                  return (
                    <div key={i} style={{
                      padding: '1.25rem',
                      background: `${col}08`,
                      border: `1px solid ${col}25`,
                      borderRadius: 'var(--radius-md)',
                      animation: `fadeInUp 0.4s ease ${i * 0.06}s both`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', flex: 1 }}>{d.disease}</h4>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: col, fontFamily: 'Space Grotesk', marginLeft: '0.5rem' }}>{d.score}</span>
                      </div>
                      <div className="progress-bar-wrap" style={{ height: 6, marginBottom: '0.5rem' }}>
                        <div className="progress-bar-fill" style={{ width: `${d.score}%`, background: d.score >= 70 ? 'linear-gradient(90deg,#ff4444,#ff9800)' : d.score >= 45 ? 'linear-gradient(90deg,#ff9800,#ffd740)' : 'linear-gradient(90deg,#00e676,#00b0ff)' }} />
                      </div>
                      <span className={`badge badge-${d.level.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>{d.level} RISK</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="glass-card" style={{ padding: '2rem' }}>
            <AIReport aiSummary={data.aiSummary} />
          </div>
        )}
      </div>
    </div>
  );
}
