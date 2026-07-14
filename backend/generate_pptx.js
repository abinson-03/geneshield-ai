const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

// Helper to define slides with deep navy background
function createDarkSlide() {
  const slide = pptx.addSlide();
  slide.background = { color: '020B18' };
  
  // Add a subtle glowing cyan/magenta bar at the top edge of each content slide
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '50%', h: 0.08,
    fill: { color: '00F2FF' }
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: '50%', y: 0, w: '50%', h: 0.08,
    fill: { color: 'FF24E4' }
  });
  
  return slide;
}

// ----------------------------------------------------
// SLIDE 1: Title Slide (Special Layout)
// ----------------------------------------------------
const slide1 = pptx.addSlide();
slide1.background = { color: '020B18' };

// Glowing decorative center accent
slide1.addShape(pptx.ShapeType.ellipse, {
  x: '35%', y: '25%', w: '30%', h: '50%',
  fill: { color: '00F2FF', transparency: 94 },
  line: { color: '00F2FF', width: 2, transparency: 60 }
});
slide1.addText("🧬", {
  x: '45%', y: '30%', w: '10%', h: 0.8,
  fontSize: 64, align: 'center'
});

slide1.addText("GENESHIELD AI", {
  x: '10%', y: '45%', w: '80%', h: 1.0,
  fontSize: 54, bold: true, color: '00F2FF',
  align: 'center', fontFace: 'Segoe UI'
});

slide1.addText("Genomic Security Redefined: AI-Powered Threat Analysis & Privacy", {
  x: '10%', y: '58%', w: '80%', h: 0.8,
  fontSize: 20, color: 'FF24E4',
  align: 'center', fontFace: 'Segoe UI'
});

slide1.addText("Presented by: Lead Systems Architect\nGeneShield AI Security Team", {
  x: '10%', y: '75%', w: '80%', h: 0.8,
  fontSize: 14, color: '8899AA',
  align: 'center', fontFace: 'Segoe UI'
});


// ----------------------------------------------------
// SLIDE 2: The Problem
// ----------------------------------------------------
const slide2 = createDarkSlide();
slide2.addText("The Genomic Privacy Crisis", {
  x: 0.6, y: 0.4, w: '80%', h: 0.6,
  fontSize: 32, bold: true, color: '00F2FF', fontFace: 'Segoe UI'
});
slide2.addText("The hidden vulnerabilities of consumer genetics", {
  x: 0.6, y: 0.9, w: '80%', h: 0.4,
  fontSize: 16, color: 'FF24E4', fontFace: 'Segoe UI'
});

// Left Column Card
slide2.addShape(pptx.ShapeType.roundRect, {
  x: 0.6, y: 1.6, w: 5.8, h: 4.8,
  fill: { color: '061424' },
  line: { color: 'FFFFFF', width: 1.5, transparency: 85 }
});
slide2.addText("CORE VULNERABILITIES", {
  x: 0.9, y: 1.9, w: 5.2, h: 0.4,
  fontSize: 16, bold: true, color: 'FF24E4', fontFace: 'Segoe UI'
});
slide2.addText(
  "• Data Monetization: DNA sequences are uploaded, stored, and sold to third parties without user ownership.\n\n" +
  "• Inactionable Data: Standard consumer reports present static lists of gene variants without actionable risk analysis.\n\n" +
  "• Weak Access Control: Most testing services lack robust authentication, allowing unauthorized profile tracking.",
  { x: 0.9, y: 2.5, w: 5.2, h: 3.6, fontSize: 14, color: '8899AA', fontFace: 'Segoe UI', lineSpacing: 24 }
);

// Right Column Card (Caution Banner)
slide2.addShape(pptx.ShapeType.roundRect, {
  x: 6.8, y: 1.6, w: 5.8, h: 4.8,
  fill: { color: '24060E' },
  line: { color: 'FF4444', width: 1.5, transparency: 70 }
});
slide2.addText("🚨 SECTOR THREAT REPORT", {
  x: 7.1, y: 1.9, w: 5.2, h: 0.4,
  fontSize: 16, bold: true, color: 'FF4444', fontFace: 'Segoe UI'
});
slide2.addText(
  "Genetic data leakages are irreversible. Unlike leaked passwords, a compromised raw DNA file exposes a user's entire genetic predispositions and family lineage forever.\n\n" +
  "GeneShield AI addresses this critical vulnerability by putting data controls, secure profiles, and dynamic analysis dashboards back into the hands of users.",
  { x: 7.1, y: 2.5, w: 5.2, h: 3.6, fontSize: 15, color: 'FFAAAA', fontFace: 'Segoe UI', lineSpacing: 26 }
);


// ----------------------------------------------------
// SLIDE 3: The Solution
// ----------------------------------------------------
const slide3 = createDarkSlide();
slide3.addText("Introducing GeneShield AI", {
  x: 0.6, y: 0.4, w: '80%', h: 0.6,
  fontSize: 32, bold: true, color: '00F2FF', fontFace: 'Segoe UI'
});
slide3.addText("Securing DNA analysis with zero compromises on personal sovereignty", {
  x: 0.6, y: 0.9, w: '80%', h: 0.4,
  fontSize: 16, color: 'FF24E4', fontFace: 'Segoe UI'
});

// Three Pillars
const pillars = [
  {
    title: "🔒 SECURE ARCHITECTURE",
    desc: "All calculations, logins, and profiles are secured with salted bcrypt hashing, JWT authentication, and strict password-verified updates."
  },
  {
    title: "⚡ LIVE GENOMIC SEARCH",
    desc: "Instant search scans matching local secure records and queries external databases directly for newly discovered genetic variants."
  },
  {
    title: "🧠 AI GENOMIC SHIELD",
    desc: "Automated analysis engines calculate threat levels, determine active genomic shield strength, and generate actionable lifestyle mitigations."
  }
];

pillars.forEach((p, idx) => {
  const xOffset = 0.6 + idx * 4.0;
  slide3.addShape(pptx.ShapeType.roundRect, {
    x: xOffset, y: 1.8, w: 3.7, h: 4.5,
    fill: { color: '061424' },
    line: { color: '00F2FF', width: 1.5, transparency: 80 }
  });
  slide3.addText(p.title, {
    x: xOffset + 0.2, y: 2.1, w: 3.3, h: 0.5,
    fontSize: 15, bold: true, color: '00F2FF', fontFace: 'Segoe UI'
  });
  slide3.addText(p.desc, {
    x: xOffset + 0.2, y: 2.8, w: 3.3, h: 3.2,
    fontSize: 13, color: '8899AA', fontFace: 'Segoe UI', lineSpacing: 22
  });
});


// ----------------------------------------------------
// SLIDE 4: Core Features
// ----------------------------------------------------
const slide4 = createDarkSlide();
slide4.addText("Core Platform Capabilities", {
  x: 0.6, y: 0.4, w: '80%', h: 0.6,
  fontSize: 32, bold: true, color: '00F2FF', fontFace: 'Segoe UI'
});
slide4.addText("Sleek dashboard utilities built for absolute user privacy", {
  x: 0.6, y: 0.9, w: '80%', h: 0.4,
  fontSize: 16, color: 'FF24E4', fontFace: 'Segoe UI'
});

const features = [
  { title: "🔍 RSID Search Engine", desc: "Live mutations mapping containing genotypes, genes, matched risk categories, and direct action plans." },
  { title: "📊 Genomic Dashboard", desc: "Monitors active threat level scores, variant match metrics, and scans history lists in real-time." },
  { title: "👤 Profile Settings", desc: "Requires current password verification to edit name, email, or security credentials, preventing session hijacking." },
  { title: "🔑 SMTP OTP Recovery", desc: "Allows secure account resets using One-Time Passwords delivered programmatically to the verified email inbox." }
];

features.forEach((f, idx) => {
  const row = Math.floor(idx / 2);
  const col = idx % 2;
  const xOffset = 0.6 + col * 6.1;
  const yOffset = 1.8 + row * 2.4;

  slide4.addShape(pptx.ShapeType.roundRect, {
    x: xOffset, y: yOffset, w: 5.8, h: 2.1,
    fill: { color: '061424' },
    line: { color: 'FFFFFF', width: 1, transparency: 85 }
  });
  slide4.addText(f.title, {
    x: xOffset + 0.3, y: yOffset + 0.2, w: 5.2, h: 0.4,
    fontSize: 16, bold: true, color: 'FF24E4', fontFace: 'Segoe UI'
  });
  slide4.addText(f.desc, {
    x: xOffset + 0.3, y: yOffset + 0.7, w: 5.2, h: 1.2,
    fontSize: 13, color: '8899AA', fontFace: 'Segoe UI', lineSpacing: 20
  });
});


// ----------------------------------------------------
// SLIDE 5: System Architecture
// ----------------------------------------------------
const slide5 = createDarkSlide();
slide5.addText("Behind the Shield: System Architecture", {
  x: 0.6, y: 0.4, w: '80%', h: 0.6,
  fontSize: 32, bold: true, color: '00F2FF', fontFace: 'Segoe UI'
});
slide5.addText("Modern web system optimized for microsecond query dispatching", {
  x: 0.6, y: 0.9, w: '80%', h: 0.4,
  fontSize: 16, color: 'FF24E4', fontFace: 'Segoe UI'
});

const layers = [
  { name: "FRONTEND SPA", tech: "React + Vite", desc: "WebGL canvas background, vanilla HSL tailoring, dynamic responsive layouts." },
  { name: "API ROUTER", tech: "Node.js + Express", desc: "JWT authorization checking, input validation filters, security interceptors." },
  { name: "SECURE FILESYSTEM", tech: "Saltd DB Layer", desc: "Local user JSON pools and metadata cache. Passwords hashed via Bcrypt." },
  { name: "AI INTEGRATION", tech: "OpenAI + Local Fallback", desc: "Custom GPT engines combined with instant rule-based parsing matrices." }
];

layers.forEach((l, idx) => {
  const xOffset = 0.6 + idx * 3.0;
  slide5.addShape(pptx.ShapeType.roundRect, {
    x: xOffset, y: 1.8, w: 2.7, h: 4.5,
    fill: { color: '061424' },
    line: { color: '00F2FF', width: 1.5, transparency: 80 }
  });
  slide5.addText(l.name, {
    x: xOffset + 0.15, y: 2.1, w: 2.4, h: 0.4,
    fontSize: 14, bold: true, color: 'FF24E4', align: 'center', fontFace: 'Segoe UI'
  });
  slide5.addText(l.tech, {
    x: xOffset + 0.15, y: 2.6, w: 2.4, h: 0.4,
    fontSize: 12, bold: true, color: '00F2FF', align: 'center', fontFace: 'Segoe UI'
  });
  slide5.addText(l.desc, {
    x: xOffset + 0.15, y: 3.1, w: 2.4, h: 2.9,
    fontSize: 12, color: '8899AA', align: 'center', fontFace: 'Segoe UI', lineSpacing: 20
  });
});


// ----------------------------------------------------
// SLIDE 6: Hardened Account Security
// ----------------------------------------------------
const slide6 = createDarkSlide();
slide6.addText("Hardened Profile Security", {
  x: 0.6, y: 0.4, w: '80%', h: 0.6,
  fontSize: 32, bold: true, color: '00F2FF', fontFace: 'Segoe UI'
});
slide6.addText("Protecting user identities alongside biological data points", {
  x: 0.6, y: 0.9, w: '80%', h: 0.4,
  fontSize: 16, color: 'FF24E4', fontFace: 'Segoe UI'
});

slide6.addShape(pptx.ShapeType.roundRect, {
  x: 0.6, y: 1.6, w: 12.0, h: 4.8,
  fill: { color: '061424' },
  line: { color: 'FFFFFF', width: 1, transparency: 85 }
});

const securityMeasures = [
  "🔒 Credential Sealing: Multi-round password salting using bcryptjs to verify credentials safely.",
  "🛡️ Verification Checkpoint: Sensitive field updates (Email, Name, Password) require verification using the current password.",
  "🚪 Auto-Logouts: Response interceptors intercept expired JWT authorization headers (401), automatically resetting client sessions.",
  "⚡ Safe Recovery: Temporary in-memory session blocks hold verification codes without saving tokens to local databases."
];

securityMeasures.forEach((m, idx) => {
  slide6.addText(m, {
    x: 1.0, y: 2.0 + idx * 1.0, w: 11.2, h: 0.8,
    fontSize: 15, color: '8899AA', fontFace: 'Segoe UI', lineSpacing: 24
  });
});


// ----------------------------------------------------
// SLIDE 7: Real-Time OTP Verification Flow
// ----------------------------------------------------
const slide7 = createDarkSlide();
slide7.addText("Real-Time OTP Verification Flow", {
  x: 0.6, y: 0.4, w: '80%', h: 0.6,
  fontSize: 32, bold: true, color: '00F2FF', fontFace: 'Segoe UI'
});
slide7.addText("Safe recovery loop configured using secure SMTP mailers", {
  x: 0.6, y: 0.9, w: '80%', h: 0.4,
  fontSize: 16, color: 'FF24E4', fontFace: 'Segoe UI'
});

const steps = [
  { num: "01", title: "Forgot Request", desc: "User types registered email." },
  { num: "02", title: "Generate OTP", desc: "Secure 6-digit code created in-memory." },
  { num: "03", title: "Dispatch Mail", desc: "Nodemailer dispatches formatted HTML mail." },
  { num: "04", title: "Verify Code", desc: "User inputs OTP; server verifies match." },
  { num: "05", title: "Safe Reset", desc: "Password updated; temporary code cleared." }
];

steps.forEach((s, idx) => {
  const xOffset = 0.6 + idx * 2.45;
  slide7.addShape(pptx.ShapeType.roundRect, {
    x: xOffset, y: 2.0, w: 2.2, h: 4.2,
    fill: { color: '061424' },
    line: { color: '00F2FF', width: 1.5, transparency: 80 }
  });
  slide7.addText(s.num, {
    x: xOffset + 0.1, y: 2.2, w: 2.0, h: 0.5,
    fontSize: 24, bold: true, color: 'FF24E4', align: 'center', fontFace: 'Segoe UI'
  });
  slide7.addText(s.title, {
    x: xOffset + 0.1, y: 2.8, w: 2.0, h: 0.5,
    fontSize: 13, bold: true, color: '00F2FF', align: 'center', fontFace: 'Segoe UI'
  });
  slide7.addText(s.desc, {
    x: xOffset + 0.1, y: 3.4, w: 2.0, h: 2.5,
    fontSize: 11, color: '8899AA', align: 'center', fontFace: 'Segoe UI', lineSpacing: 18
  });
});


// ----------------------------------------------------
// SLIDE 8: Dynamic Error Handling & Toasts
// ----------------------------------------------------
const slide8 = createDarkSlide();
slide8.addText("Dynamic Error Handling & Toasts", {
  x: 0.6, y: 0.4, w: '80%', h: 0.6,
  fontSize: 32, bold: true, color: '00F2FF', fontFace: 'Segoe UI'
});
slide8.addText("Preventing reloads and preserving state with floating popups", {
  x: 0.6, y: 0.9, w: '80%', h: 0.4,
  fontSize: 16, color: 'FF24E4', fontFace: 'Segoe UI'
});

slide8.addShape(pptx.ShapeType.roundRect, {
  x: 0.6, y: 1.8, w: 5.8, h: 4.5,
  fill: { color: '061424' },
  line: { color: 'FFFFFF', width: 1, transparency: 85 }
});
slide8.addText("STATE-PRESERVING INTERCEPTORS", {
  x: 0.9, y: 2.1, w: 5.2, h: 0.4,
  fontSize: 16, bold: true, color: '00F2FF', fontFace: 'Segoe UI'
});
slide8.addText(
  "• Skip-on-Login Filter: The 401 response interceptor does not trigger route reloads while already on the login path.\n\n" +
  "• Error Preservation: React state remains completely intact when typing wrong passwords, enabling instant on-page alerts.\n\n" +
  "• Smooth Animations: Warning popups utilize slide-in CSS keyframes to draw immediate user attention.",
  { x: 0.9, y: 2.7, w: 5.2, h: 3.2, fontSize: 13, color: '8899AA', fontFace: 'Segoe UI', lineSpacing: 22 }
);

// Toast mockup on the right
slide8.addShape(pptx.ShapeType.roundRect, {
  x: 6.8, y: 2.4, w: 5.8, h: 1.8,
  fill: { color: '4B0F15' },
  line: { color: 'EF4444', width: 1.5 }
});
slide8.addText("⚠️  Invalid email or password", {
  x: 7.1, y: 2.7, w: 4.5, h: 0.5,
  fontSize: 16, bold: true, color: 'FFFFFF', fontFace: 'Segoe UI'
});
slide8.addText("Please double-check your credentials and try again. This alert will dismiss automatically in 4.5 seconds.", {
  x: 7.1, y: 3.2, w: 4.8, h: 0.8,
  fontSize: 12, color: 'FFAAAA', fontFace: 'Segoe UI'
});
slide8.addShape(pptx.ShapeType.rect, {
  x: 11.8, y: 2.6, w: 0.5, h: 0.5,
  fill: { color: '4B0F15' }
});


// ----------------------------------------------------
// SLIDE 9: Future Roadmap
// ----------------------------------------------------
const slide9 = createDarkSlide();
slide9.addText("Future Development Path", {
  x: 0.6, y: 0.4, w: '80%', h: 0.6,
  fontSize: 32, bold: true, color: '00F2FF', fontFace: 'Segoe UI'
});
slide9.addText("Transforming personal genomics into a secure, decentralized standard", {
  x: 0.6, y: 0.9, w: '80%', h: 0.4,
  fontSize: 16, color: 'FF24E4', fontFace: 'Segoe UI'
});

const roadmap = [
  { phase: "PHASE 1 (CURRENT)", title: "Security Core", desc: "Profile edits with password verification, live OTP recoveries, and custom-styled warnings." },
  { phase: "PHASE 2 (Q3 2026)", title: "Batch Processing", desc: "Support for raw genetics file parsing (23andMe, AncestryDNA formats) with offline parsing support." },
  { phase: "PHASE 3 (2027)", title: "Zero-Knowledge", desc: "Integrate client-side cryptography to secure DNA reports, making analysis private even from the server host." }
];

roadmap.forEach((r, idx) => {
  const xOffset = 0.6 + idx * 4.0;
  slide9.addShape(pptx.ShapeType.roundRect, {
    x: xOffset, y: 1.8, w: 3.7, h: 4.5,
    fill: { color: '061424' },
    line: { color: 'FF24E4', width: 1.5, transparency: 80 }
  });
  slide9.addText(r.phase, {
    x: xOffset + 0.2, y: 2.1, w: 3.3, h: 0.4,
    fontSize: 12, bold: true, color: 'FF24E4', fontFace: 'Segoe UI'
  });
  slide9.addText(r.title, {
    x: xOffset + 0.2, y: 2.6, w: 3.3, h: 0.4,
    fontSize: 15, bold: true, color: '00F2FF', fontFace: 'Segoe UI'
  });
  slide9.addText(r.desc, {
    x: xOffset + 0.2, y: 3.1, w: 3.3, h: 2.8,
    fontSize: 12, color: '8899AA', fontFace: 'Segoe UI', lineSpacing: 20
  });
});


// ----------------------------------------------------
// SLIDE 10: Conclusion & Q&A
// ----------------------------------------------------
const slide10 = pptx.addSlide();
slide10.background = { color: '020B18' };

slide10.addShape(pptx.ShapeType.ellipse, {
  x: '35%', y: '25%', w: '30%', h: '50%',
  fill: { color: 'FF24E4', transparency: 94 },
  line: { color: 'FF24E4', width: 2, transparency: 60 }
});
slide10.addText("🧬", {
  x: '45%', y: '30%', w: '10%', h: 0.8,
  fontSize: 64, align: 'center'
});

slide10.addText("GENESHIELD AI", {
  x: '10%', y: '45%', w: '80%', h: 1.0,
  fontSize: 54, bold: true, color: '00F2FF',
  align: 'center', fontFace: 'Segoe UI'
});

slide10.addText("Genomic Security Redefined.", {
  x: '10%', y: '58%', w: '80%', h: 0.8,
  fontSize: 20, color: 'FF24E4',
  align: 'center', fontFace: 'Segoe UI'
});

slide10.addText("Thank You! Questions?", {
  x: '10%', y: '72%', w: '80%', h: 0.8,
  fontSize: 16, color: '8899AA',
  align: 'center', fontFace: 'Segoe UI'
});

// Output path
const outputPath = path.join('C:', 'Users', 'Abinson Babu', 'Desktop', 'GeneShield_AI_Presentation.pptx');

pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`\n🎉 Presentation successfully generated and saved to: ${outputPath}\n`);
  })
  .catch(err => {
    console.error('Error writing PPTX:', err.message);
  });
