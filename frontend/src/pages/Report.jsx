import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import { getAnalysisById, getUserId } from '../services/analysisStore';
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
    const userId = getUserId();

    // 1. Try localStorage first (always reliable, no Vercel /tmp issues)
    const local = getAnalysisById(userId, id);
    if (local) {
      setData(local);
      setLoading(false);
      return;
    }

    // 2. Fallback to backend (in case user is on new device / cleared storage)
    try {
      const res = await analysisAPI.getById(id);
      setData(res.data);
    } catch (err) {
      setError('Report not found. It may have been deleted or not saved yet.');
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
      pdf.save(`GeneShield_Report_${data.fileName?.split('.')[0] || id}.pdf`);
    } catch (e) {
      alert('PDF export failed. Try again.');
    } finally {
      setExporting(false);
    }
  };

  const getRiskColor = (score) => score >= 70 ? '#ff6b6b' : score >= 45 ? '#ffb74d' : '#69f0ae';
  const getRiskLabel = (score) => score >= 70 ? 'High Risk' : score >= 45 ? 'Moderate Risk' : 'Low Risk';
  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso || ''; }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '70px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, border: '3px solid rgba(0,212,255,0.2)', borderTop: '3px solid #00d4ff', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite', margin: '0 auto 1.5rem' }}></div>
        <p style={{ color: '#849495', fontSize: '1rem' }}>Loading your genetic report...</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '70px' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '0 1.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
        <h2 style={{ color: '#f0f6ff', marginBottom: '0.75rem' }}>Report Not Found</h2>
        <p style={{ color: '#4a5568', marginBottom: '1.5rem' }}>{error || 'This report was not found in your history.'}</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">← Back to Dashboard</button>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'variants', label: '🧬 Variants' },
    { id: 'diseases', label: '🩺 Disease Risks' },
    { id: 'ai', label: '🤖 AI Report' },
  ];

  return (
    <div style={{ minHeight: '100vh', paddingTop: '70px', paddingBottom: '4rem' }}>
      <div style={{ position: 'fixed', top: '5%', left: '-5%', width: 500, height: 500, background: 'rgba(124,58,237,0.06)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '5%', right: '-5%', width: 400, height: 400, background: 'rgba(0,212,255,0.06)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div ref={reportRef} style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>

        {/* Breadcrumb + actions */}
        <div style={{ padding: '2rem 0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Link to="/dashboard" style={{ color: '#4a5568', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
              ← Dashboard
            </Link>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f0f6ff', margin: 0 }}>{data.fileName}</h1>
            <p style={{ color: '#4a5568', fontSize: '0.82rem', marginTop: '0.25rem' }}>Generated: {formatDate(data.createdAt)}</p>
          </div>
          <button
            onClick={handlePDFExport}
            disabled={exporting}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', opacity: exporting ? 0.7 : 1 }}
          >
            {exporting ? '⏳ Exporting...' : '📄 Export PDF'}
          </button>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Overall Risk Score', value: `${data.overallRiskScore}/100`, color: getRiskColor(data.overallRiskScore) },
            { label: 'Risk Level', value: getRiskLabel(data.overallRiskScore), color: getRiskColor(data.overallRiskScore) },
            { label: 'Variants Scanned', value: data.totalVariantsScanned, color: '#00d4ff' },
            { label: 'Matched Variants', value: data.matchedVariants, color: '#7c3aed' },
          ].map((c, i) => (
            <div key={i} style={{ background: 'rgba(6,20,36,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.25rem', animation: `fadeInUp 0.4s ease ${i * 0.06}s both` }}>
              <div style={{ fontSize: '0.72rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>{c.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: c.color, fontFamily: 'Space Grotesk' }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Risk breakdown badges */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'High Risk', count: data.riskBreakdown?.high || 0, color: '#ff6b6b' },
            { label: 'Moderate Risk', count: data.riskBreakdown?.medium || 0, color: '#ffb74d' },
            { label: 'Low Risk', count: data.riskBreakdown?.low || 0, color: '#69f0ae' },
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: `${b.color}10`, border: `1px solid ${b.color}40`, borderRadius: '20px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, flexShrink: 0 }}></span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: b.color }}>{b.count} {b.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '2rem', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              background: activeTab === t.id ? 'rgba(0,212,255,0.1)' : 'none',
              border: 'none', borderBottom: activeTab === t.id ? '2px solid #00d4ff' : '2px solid transparent',
              padding: '0.75rem 1.25rem', cursor: 'pointer',
              color: activeTab === t.id ? '#00d4ff' : '#4a5568',
              fontSize: '0.85rem', fontWeight: activeTab === t.id ? 700 : 500,
              transition: 'all 0.2s', whiteSpace: 'nowrap', fontFamily: 'inherit'
            }}>{t.label}</button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(6,20,36,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ color: '#f0f6ff', marginBottom: '1rem', fontSize: '1rem' }}>Risk Score</h3>
              <RiskDonutChart score={data.overallRiskScore} />
            </div>
            <div style={{ background: 'rgba(6,20,36,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ color: '#f0f6ff', marginBottom: '1rem', fontSize: '1rem' }}>Risk Breakdown</h3>
              <RiskBreakdownChart breakdown={data.riskBreakdown} />
            </div>
            {data.aiSummary && (
              <div style={{ background: 'rgba(6,20,36,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', gridColumn: '1 / -1' }}>
                <h3 style={{ color: '#00d4ff', marginBottom: '0.75rem', fontSize: '1rem' }}>🤖 AI Summary</h3>
                <p style={{ color: '#b9cacb', lineHeight: 1.7, fontSize: '0.9rem' }}>{data.aiSummary.headline}</p>
                {data.aiSummary.overview && <p style={{ color: '#849495', lineHeight: 1.7, fontSize: '0.875rem', marginTop: '0.5rem' }}>{data.aiSummary.overview}</p>}
              </div>
            )}
          </div>
        )}

        {activeTab === 'variants' && (
          <div style={{ background: 'rgba(6,20,36,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ color: '#f0f6ff', marginBottom: '1.25rem', fontSize: '1rem' }}>Matched Genetic Variants</h3>
            <VariantTable variants={data.variants || []} />
          </div>
        )}

        {activeTab === 'diseases' && (
          <div style={{ background: 'rgba(6,20,36,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ color: '#f0f6ff', marginBottom: '1.25rem', fontSize: '1rem' }}>Disease Risk Profile</h3>
            <DiseaseRiskBarChart diseases={data.diseaseRisks || []} />
          </div>
        )}

        {activeTab === 'ai' && (
          <AIReport report={data.aiSummary} variants={data.variants} />
        )}
      </div>
    </div>
  );
}
