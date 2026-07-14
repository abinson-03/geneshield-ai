import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { rsidAPI, analysisAPI } from '../services/api';

function DNAHelix3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!window.THREE) return;
    const THREE = window.THREE;
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    // Shift group down slightly so it sits beautifully below the main header text
    dnaGroup.position.y = -3;
    dnaGroup.position.x = -1;

    const cyanColor = 0x00f2ff;
    const magentaColor = 0xff00ff;

    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const cyanMaterial = new THREE.MeshPhongMaterial({ 
        color: cyanColor, 
        emissive: cyanColor, 
        emissiveIntensity: 0.6,
        shininess: 100 
    });
    const magentaMaterial = new THREE.MeshPhongMaterial({ 
        color: magentaColor, 
        emissive: magentaColor, 
        emissiveIntensity: 0.6, 
        shininess: 100 
    });

    const pointsCount = 45;
    const curveHeight = 30;
    const radius = 5;
    const twist = 1.8;

    for (let i = 0; i < pointsCount; i++) {
        const y = (i / pointsCount) * curveHeight - curveHeight / 2;
        const angle = (i / pointsCount) * Math.PI * 2 * twist;

        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        const sphere1 = new THREE.Mesh(sphereGeometry, cyanMaterial);
        sphere1.position.set(x1, y, z1);
        dnaGroup.add(sphere1);

        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;
        const sphere2 = new THREE.Mesh(sphereGeometry, magentaMaterial);
        sphere2.position.set(x2, y, z2);
        dnaGroup.add(sphere2);

        if (i % 2 === 0) {
            const cylinderGeometry = new THREE.CylinderGeometry(0.08, 0.08, radius * 2, 8);
            const cylinderMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xffffff, 
                transparent: true, 
                opacity: 0.25,
                emissive: 0xffffff,
                emissiveIntensity: 0.2
            });
            const rung = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
            rung.position.set(0, y, 0);
            rung.rotation.z = Math.PI / 2;
            rung.rotation.y = angle;
            dnaGroup.add(rung);
        }
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(cyanColor, 1.8, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(magentaColor, 1.8, 50);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    let mouseX = 0;
    let mouseY = 0;
    let targetRotationY = 0;

    const onMouseMove = (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const onResize = () => {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    let animationId;
    function animate() {
        animationId = requestAnimationFrame(animate);
        targetRotationY += 0.006;
        // Rotates on Y/X with mouse, and fixed diagonal/horizontal rotation on Z
        dnaGroup.rotation.y += (targetRotationY + mouseX * 0.4 - dnaGroup.rotation.y) * 0.05;
        dnaGroup.rotation.x += (mouseY * 0.4 - dnaGroup.rotation.x) * 0.05;
        dnaGroup.rotation.z = Math.PI / 3.2; // Lie down horizontally/diagonally crossing left to right!
        renderer.render(scene, camera);
    }

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div id="dna-hero-container" ref={containerRef} />;
}

export default function Landing() {
  const isLoggedIn = !!localStorage.getItem('geneshield_token');

  // Real-time dynamic stats linked to local database and API ping
  const [dbCount, setDbCount] = useState(0);
  const [myReportsCount, setMyReportsCount] = useState(0);
  const [ensemblPing, setEnsemblPing] = useState(null);

  useEffect(() => {
    // 1. Fetch total offline variants in local database
    const loadVariants = async () => {
      try {
        const start = performance.now();
        const res = await rsidAPI.listAll();
        const end = performance.now();
        setDbCount(res.data?.length || 0);
        setEnsemblPing(Math.round(end - start));
      } catch (e) {
        console.error('Error fetching variants list:', e);
      }
    };

    // 2. Fetch total reports generated for current session
    const loadReports = async () => {
      if (isLoggedIn) {
        try {
          const res = await analysisAPI.getAll();
          setMyReportsCount(res.data?.length || 0);
        } catch (e) {
          console.error('Error fetching personal reports:', e);
        }
      }
    };

    loadVariants();
    loadReports();
  }, [isLoggedIn]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* ===== HERO SECTION ===== */}
      <section style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 1.5rem 4rem',
        overflow: 'hidden'
      }}>
        {/* Three.js DNA Helix Background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.65 }}>
          <DNAHelix3D />
        </div>

        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Tagline Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            marginBottom: '2rem',
            background: 'rgba(0, 242, 255, 0.1)',
            border: '1px solid rgba(0, 242, 255, 0.3)',
            borderRadius: '100px',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInUp 0.8s ease both'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00f2ff', boxShadow: '0 0 10px #00f2ff', display: 'inline-block' }}></span>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', fontWeight: 700, color: '#00f2ff', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Techy Spot Hackathon 2026-2027
            </p>
          </div>

          {/* Heading */}
          <h2 style={{
            fontFamily: 'Space Grotesk',
            fontSize: 'clamp(2.4rem, 6vw, 4.8rem)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#e5e1e4',
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.8s ease 100ms both'
          }}>
            GENOMIC SECURITY<br />
            <span className="bio-glow-text" style={{
              background: 'linear-gradient(135deg, #00f2ff 0%, #ff24e4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>REDEFINED</span>
          </h2>

          {/* Subtext */}
          <p style={{
            fontFamily: 'Geist',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: '620px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
            opacity: 0.95,
            animation: 'fadeInUp 0.8s ease 200ms both'
          }}>
            Next-generation AI shielding and preventative health profiling for your biological blueprint. Prevent digital genetic theft and decode your DNA.
          </p>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            animation: 'fadeInUp 0.8s ease 300ms both'
          }}>
            {isLoggedIn ? (
              <>
                <Link to="/dashboard">
                  <button className="btn-refined" style={{
                    padding: '1rem 2rem',
                    background: 'linear-gradient(135deg, #00f2ff, #00d4ff)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#002022',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(0, 242, 255, 0.4)'
                  }}>
                    🚀 Initialize Shield / Go to Dashboard
                  </button>
                </Link>
                <Link to="/search">
                  <button className="btn-refined" style={{
                    padding: '1rem 2rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: '#e5e1e4',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)'
                  }}>
                    🔍 Search Specific RSID
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register">
                  <button className="btn-refined" style={{
                    padding: '1rem 2rem',
                    background: 'linear-gradient(135deg, #00f2ff, #00d4ff)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#002022',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(0, 242, 255, 0.4)'
                  }}>
                    🧬 Start Free Analysis
                  </button>
                </Link>
                <Link to="/login">
                  <button className="btn-refined" style={{
                    padding: '1rem 2rem',
                    background: 'none',
                    border: 'none',
                    color: '#ff24e4',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'JetBrains Mono',
                    textTransform: 'uppercase',
                    fontSize: '0.9rem',
                    letterSpacing: '0.05em'
                  }}>
                    Sign In →
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>


      {/* ===== INFORMATIONAL SECTION ===== */}
      <section style={{ padding: '5rem 1.5rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="grid-2">
          {/* Text block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#e5e1e4', fontWeight: 800, lineHeight: 1.15 }}>
              Your DNA is the ultimate <br />
              <span className="magenta-glow-text" style={{
                background: 'linear-gradient(135deg, #ff24e4, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>biometric key.</span>
            </h2>
            <p style={{ color: '#b9cacb', fontSize: '1rem', lineHeight: 1.7, opacity: 0.9 }}>
              GeneShield AI monitors your genomic metadata in real-time, creating a decentralized cryptographic hash of your biological identity. Our proprietary algorithms detect illegal sequence synthesis attempts instantly.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              {[
                { title: 'Zero-knowledge sequence verification', desc: 'Verify identity without revealing genetic data.' },
                { title: 'Real-time mutation monitoring', desc: 'Continuous scanning for sequence deviations.' },
                { title: 'Private genomic ledger hosting', desc: 'Immutable, encrypted records on the block.' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    border: '1px solid rgba(0, 242, 255, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '3px'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: '#00f2ff' }}>check</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e5e1e4' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.82rem', color: '#849495', marginTop: '2px' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image/Mockup Block */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              inset: '-16px',
              background: 'rgba(0, 242, 255, 0.05)',
              borderRadius: '2rem',
              filter: 'blur(30px)',
              pointerEvents: 'none'
            }} />

            <div className="glass-card" style={{
              borderRadius: '2rem',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              aspectRatio: '1 / 1',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBNPeRxG12U2os6ok62pOxQ52mXtxpwKNdivnM0BYDUVvMnimwtmxFLyLO2-dfyMBzguB7r6_I7JtHToWMFa_rQehADbbUAxhmIScpO-MauSs6j_IZaoLQxLfRC4XTDOH-bWrVclmnrvYDheHBrbejKoIEvLAmgcX-R_xdThDaGAE1Q9Jq9aCbJd4HkZKzRF3cqABpGx-HeJzrYeDTvn4hlSBF9U-hEgTDmcR-2O4QnBOvLXEYDHepeW8D4qUqYCdVQ32Nvjtj8qcHc')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 1s cubic-bezier(0.23, 1, 0.32, 1)'
              }} />

              {/* Floating ID Card */}
              <div className="glass-card float-animation" style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                right: '24px',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: '#00f2ff' }}>search</span>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.62rem', fontWeight: 900, color: '#00f2ff', letterSpacing: '0.2em' }}>LATEST SCAN</p>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e5e1e4', fontFamily: 'Space Grotesk' }}>
                  99.98% Match.<br />
                  <span style={{ fontSize: '0.85rem', color: '#b9cacb', fontWeight: 400 }}>Identity confirmed.</span>
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '2rem 0', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            🧬 <strong style={{ color: '#e5e1e4' }}>GeneShield AI</strong> — Developed by <strong style={{ color: '#00f2ff' }}>EvaSync Team</strong> for Techy Spot Hackathon 2026-2027
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem' }}>
            For educational purposes only. Not a substitute for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
