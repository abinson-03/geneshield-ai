import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { analysisAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function FileUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError('Invalid file. Please upload a CSV, TXT, or VCF file (max 10MB).');
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'application/octet-stream': ['.vcf'],
      'text/x-vcard': ['.vcf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    noClick: true,   // we handle click manually
    noKeyboard: true,
  });

  const messages = [
    'Parsing RSID markers...',
    'Cross-referencing ClinVar database...',
    'Calculating risk scores...',
    'Generating AI health report...',
    'Finalizing results...',
  ];

  const handleAnalyze = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setProgress(5);

    let msgIdx = 0;
    setProgressMsg(messages[0]);
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      setProgressMsg(messages[msgIdx]);
    }, 1500);

    const progInterval = setInterval(() => {
      setProgress(p => p < 85 ? p + 8 : p);
    }, 400);

    try {
      const formData = new FormData();
      formData.append('geneticFile', file);
      const res = await analysisAPI.analyze(formData);
      clearInterval(progInterval);
      clearInterval(msgInterval);
      setProgress(100);
      setProgressMsg('Analysis complete! Redirecting...');
      setTimeout(() => navigate(`/report/${res.data.analysisId}`), 700);
    } catch (err) {
      clearInterval(progInterval);
      clearInterval(msgInterval);
      setProgress(0);
      setProgressMsg('');
      setError(err.response?.data?.error || 'Analysis failed. Please check your file format and try again.');
      setUploading(false);
    }
  };

  const removeFile = () => { setFile(null); setProgress(0); setError(''); setProgressMsg(''); };

  // Download sample CSV inline
  const downloadSample = (e) => {
    e.preventDefault();
    const csv = `rsid,genotype\nrs429358,TC\nrs7412,CC\nrs1801133,CT\nrs1801131,AC\nrs9939609,AA\nrs4988235,CT\nrs1815739,CT\nrs1800562,AG\nrs4244285,AG\nrs762551,AC\nrs1800497,CT\nrs5082,TC\nrs9271366,AG\nrs2075650,AG\nrs3135506,AG\nrs328,CG\nrs1800629,AG\nrs4149056,TC\nrs1042714,CG\nrs4680,AG`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sample_genetic_data.csv';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      background: 'rgba(6,20,36,0.85)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px', padding: '2rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.4rem', color: '#f0f6ff' }}>
          🔬 Upload Genetic File
        </h2>
        <p style={{ color: '#8899aa', fontSize: '0.88rem' }}>
          CSV or TXT with RSID markers — instant AI analysis
        </p>
      </div>

      {error && (
        <div style={{
          padding: '0.85rem 1rem', background: 'rgba(255,68,68,0.1)',
          border: '1px solid rgba(255,68,68,0.3)', borderRadius: '10px',
          color: '#ff8080', fontSize: '0.88rem', marginBottom: '1rem'
        }}>⚠ {error}</div>
      )}

      {!file ? (
        <>
          {/* Drop zone */}
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? '#00d4ff' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: '16px', padding: '2.5rem 1.5rem', textAlign: 'center',
              background: isDragActive ? 'rgba(0,212,255,0.07)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.3s ease',
              transform: isDragActive ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <input {...getInputProps()} />
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🧬</div>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: isDragActive ? '#00d4ff' : '#f0f6ff', marginBottom: '0.4rem' }}>
              {isDragActive ? 'Drop it here!' : 'Drag & drop your genetic file'}
            </p>
            <p style={{ color: '#4a5568', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
              CSV · TXT · VCF supported (max 10MB)
            </p>

            {/* Browse button — click opens file picker */}
            <button
              type="button"
              onClick={open}
              style={{
                padding: '0.6rem 1.5rem',
                background: 'transparent',
                border: '1.5px solid rgba(0,212,255,0.4)',
                borderRadius: '50px', color: '#00d4ff',
                fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter', transition: 'all 0.2s',
                marginRight: '0.5rem'
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(0,212,255,0.1)'; e.target.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.transform = ''; }}
            >
              📁 Browse Files
            </button>
            <button
              type="button"
              onClick={downloadSample}
              style={{
                padding: '0.6rem 1.5rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '50px', color: '#8899aa',
                fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer',
                fontFamily: 'Inter', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.target.style.color = '#f0f6ff'; }}
              onMouseLeave={e => { e.target.style.color = '#8899aa'; }}
            >
              ⬇ Sample CSV
            </button>
          </div>

          {/* Format hint */}
          <div style={{
            marginTop: '1rem', padding: '0.85rem 1rem',
            background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#4a5568', marginBottom: '0.4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected Format:</p>
            <pre style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#00d4ff', lineHeight: 1.7 }}>
              {`rsid,genotype\nrs429358,TC\nrs1801133,CT`}
            </pre>
          </div>
        </>
      ) : (
        <>
          {/* Selected file */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            background: 'rgba(0,212,255,0.07)',
            border: '1px solid rgba(0,212,255,0.25)',
            borderRadius: '12px', marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📄</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f0f6ff' }}>{file.name}</p>
                <p style={{ color: '#4a5568', fontSize: '0.78rem' }}>
                  {(file.size / 1024).toFixed(1)} KB · Ready to analyze
                </p>
              </div>
            </div>
            {!uploading && (
              <button
                onClick={removeFile}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5568', fontSize: '1.3rem', lineHeight: 1, padding: '4px' }}
                title="Remove file"
              >×</button>
            )}
          </div>

          {/* Progress */}
          {uploading && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#8899aa' }}>
                <span>{progressMsg}</span>
                <span style={{ fontWeight: 700, color: '#00d4ff' }}>{progress}%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '50px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '50px',
                  background: 'linear-gradient(90deg,#00d4ff,#7c3aed)',
                  width: `${progress}%`,
                  transition: 'width 0.4s ease',
                  boxShadow: '0 0 10px rgba(0,212,255,0.5)'
                }} />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleAnalyze}
              disabled={uploading}
              style={{
                flex: 1, padding: '0.85rem', borderRadius: '50px', border: 'none',
                background: uploading ? 'rgba(0,212,255,0.3)' : 'linear-gradient(135deg,#00d4ff,#7c3aed)',
                color: '#000', fontWeight: 700, fontSize: '0.95rem', cursor: uploading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: uploading ? 'none' : '0 0 25px rgba(0,212,255,0.35)',
                transition: 'all 0.3s'
              }}
            >
              {uploading ? (
                <>
                  <span style={{ width: 18, height: 18, border: '2.5px solid rgba(0,0,0,0.3)', borderTop: '2.5px solid #000', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite', display: 'inline-block' }}></span>
                  Analyzing...
                </>
              ) : '🔬 Run Genetic Analysis'}
            </button>
            {!uploading && (
              <button
                onClick={removeFile}
                style={{
                  padding: '0.85rem 1.25rem', borderRadius: '50px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#8899aa', cursor: 'pointer', fontFamily: 'Inter',
                  fontSize: '0.88rem', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.target.style.color = '#f0f6ff'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { e.target.style.color = '#8899aa'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
              >Change File</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
