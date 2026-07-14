const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';

// Absolute paths to generated assets
const imageBg = "C:\\Users\\Abinson Babu\\.gemini\\antigravity\\brain\\703011ad-84b9-4bea-b6fa-5e7df54795be\\dark_cyber_gradient_bg_1784009564894.png";
const imageDna = "C:\\Users\\Abinson Babu\\.gemini\\antigravity\\brain\\703011ad-84b9-4bea-b6fa-5e7df54795be\\dna_neon_graphic_1784009093034.png";
const imageShield = "C:\\Users\\Abinson Babu\\.gemini\\antigravity\\brain\\703011ad-84b9-4bea-b6fa-5e7df54795be\\cyber_protection_shield_1784009113198.png";
const imageBiotech = "C:\\Users\\Abinson Babu\\.gemini\\antigravity\\brain\\703011ad-84b9-4bea-b6fa-5e7df54795be\\biotech_data_visualization_1784009131532.png";

// Helper to define slides with premium gradient background
function createPremiumSlide() {
  const slide = pptx.addSlide();
  slide.background = { path: imageBg };
  
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
// SLIDE 1: Title Slide (Combined text box, no overlap)
// ----------------------------------------------------
const slide1 = pptx.addSlide();
slide1.background = { path: imageBg };

// Neon DNA Helix Illustration (Left side graphic)
slide1.addImage({
  path: imageDna,
  x: 0.8, y: 1.5, w: 4.5, h: 4.2
});

// Single combined text box to prevent overlaps
slide1.addText([
  { text: "GENESHIELD AI\n", options: { fontSize: 48, bold: true, color: '00F2FF', fontFace: 'Segoe UI' } },
  { text: "Genomic Security Redefined\n\n", options: { fontSize: 20, bold: true, color: 'FF24E4', fontFace: 'Segoe UI' } },
  { text: "AI-Powered Threat Analysis & Privacy Protection for Personal DNA Assets\n\n\n\n", options: { fontSize: 14, color: '8899AA', fontFace: 'Segoe UI' } },
  { text: "Developed by: EvaSync Team\nFor Techy Spot Hackathon 2026-2027", options: { fontSize: 13, color: 'FFFFFF', bold: true, fontFace: 'Segoe UI' } }
], {
  x: 5.8, y: 1.8, w: 6.8, h: 4.2,
  valign: 'middle'
});


// ----------------------------------------------------
// SLIDE 2: The Problem (Combined Titles, Reduced Height)
// ----------------------------------------------------
const slide2 = createPremiumSlide();

// Combined Title and Subtitle Box to prevent overlaps
slide2.addText([
  { text: "The Genomic Privacy Crisis\n", options: { fontSize: 28, bold: true, color: '00F2FF', fontFace: 'Segoe UI' } },
  { text: "The hidden vulnerabilities of consumer genetics", options: { fontSize: 14, color: 'FF24E4', fontFace: 'Segoe UI' } }
], { x: 0.6, y: 0.3, w: 12.0, h: 1.0 });

// Left Column Card
slide2.addShape(pptx.ShapeType.roundRect, {
  x: 0.6, y: 1.5, w: 5.8, h: 4.2,
  fill: { color: '061424', transparency: 15 },
  line: { color: 'FFFFFF', width: 1.5, transparency: 85 }
});
slide2.addText("CORE VULNERABILITIES", {
  x: 0.9, y: 1.7, w: 5.2, h: 0.35,
  fontSize: 15, bold: true, color: 'FF24E4', fontFace: 'Segoe UI'
});
slide2.addText(
  "• Data Monetization: DNA sequences are uploaded, stored, and sold to third parties without user ownership.\n\n" +
  "• Inactionable Data: Standard consumer reports present static lists of gene variants without actionable risk analysis.\n\n" +
  "• Weak Access Control: Most testing services lack robust authentication, allowing unauthorized profile tracking.",
  { x: 0.9, y: 2.1, w: 5.2, h: 3.4, fontSize: 11.5, color: '8899AA', fontFace: 'Segoe UI', lineSpacing: 20 }
);

// Right Column Card (Caution Banner)
slide2.addShape(pptx.ShapeType.roundRect, {
  x: 6.8, y: 1.5, w: 5.8, h: 4.2,
  fill: { color: '24060E', transparency: 15 },
  line: { color: 'FF4444', width: 1.5, transparency: 70 }
});
slide2.addText("🚨 SECTOR THREAT REPORT", {
  x: 7.1, y: 1.7, w: 5.2, h: 0.35,
  fontSize: 15, bold: true, color: 'FF4444', fontFace: 'Segoe UI'
});
slide2.addText(
  "Genetic data leakages are irreversible. Unlike leaked passwords, a compromised raw DNA file exposes a user's entire genetic predispositions and family lineage forever.\n\n" +
  "GeneShield AI addresses this critical vulnerability by putting data controls, secure profiles, and dynamic analysis dashboards back into the hands of users.",
  { x: 7.1, y: 2.1, w: 5.2, h: 3.4, fontSize: 12, color: 'FFAAAA', fontFace: 'Segoe UI', lineSpacing: 22 }
);


// ----------------------------------------------------
// SLIDE 3: The Solution
// ----------------------------------------------------
const slide3 = createPremiumSlide();
slide3.addText([
  { text: "Introducing GeneShield AI\n", options: { fontSize: 28, bold: true, color: '00F2FF', fontFace: 'Segoe UI' } },
  { text: "Securing DNA analysis with zero compromises on personal sovereignty", options: { fontSize: 14, color: 'FF24E4', fontFace: 'Segoe UI' } }
], { x: 0.6, y: 0.3, w: 12.0, h: 1.0 });

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
  const xOffset = 0.6 + idx * 4.2;
  slide3.addShape(pptx.ShapeType.roundRect, {
    x: xOffset, y: 1.5, w: 3.7, h: 4.2,
    fill: { color: '061424', transparency: 15 },
    line: { color: '00F2FF', width: 1.5, transparency: 80 }
  });
  slide3.addText(p.title, {
    x: xOffset + 0.15, y: 1.7, w: 3.4, h: 0.35,
    fontSize: 14, bold: true, color: '00F2FF', fontFace: 'Segoe UI'
  });
  slide3.addText(p.desc, {
    x: xOffset + 0.15, y: 2.15, w: 3.4, h: 3.4,
    fontSize: 11, color: '8899AA', fontFace: 'Segoe UI', lineSpacing: 20
  });
});


// ----------------------------------------------------
// SLIDE 4: Core Features
// ----------------------------------------------------
const slide4 = createPremiumSlide();
slide4.addText([
  { text: "Core Platform Capabilities\n", options: { fontSize: 28, bold: true, color: '00F2FF', fontFace: 'Segoe UI' } },
  { text: "Sleek dashboard utilities built for absolute user privacy", options: { fontSize: 14, color: 'FF24E4', fontFace: 'Segoe UI' } }
], { x: 0.6, y: 0.3, w: 12.0, h: 1.0 });

const features = [
  { title: "🔍 RSID Search Engine", desc: "Live mutations mapping containing genotypes, genes, matched risk categories, and direct action plans." },
  { title: "📊 Genomic Dashboard", desc: "Monitors active threat level scores, variant match metrics, and scans history lists in real-time." },
  { title: "👤 Profile Settings", desc: "Requires current password verification to edit name, email, or security credentials, preventing session hijacking." },
  { title: "🔑 SMTP OTP Recovery", desc: "Allows secure account resets using One-Time Passwords delivered programmatically to the verified email inbox." }
];

features.forEach((f, idx) => {
  const row = Math.floor(idx / 2);
  const col = idx % 2;
  const xOffset = 0.6 + col * 6.2;
  const yOffset = 1.5 + row * 2.3;

  slide4.addShape(pptx.ShapeType.roundRect, {
    x: xOffset, y: yOffset, w: 5.8, h: 1.9,
    fill: { color: '061424', transparency: 15 },
    line: { color: 'FFFFFF', width: 1, transparency: 85 }
  });
  slide4.addText(f.title, {
    x: xOffset + 0.2, y: yOffset + 0.15, w: 5.4, h: 0.3,
    fontSize: 15, bold: true, color: 'FF24E4', fontFace: 'Segoe UI'
  });
  slide4.addText(f.desc, {
    x: xOffset + 0.2, y: yOffset + 0.5, w: 5.4, h: 1.3,
    fontSize: 11, color: '8899AA', fontFace: 'Segoe UI', lineSpacing: 18
  });
});


// ----------------------------------------------------
// SLIDE 5: System Architecture
// ----------------------------------------------------
const slide5 = createPremiumSlide();
slide5.addText([
  { text: "Behind the Shield: System Architecture\n", options: { fontSize: 28, bold: true, color: '00F2FF', fontFace: 'Segoe UI' } },
  { text: "Modern web system optimized for microsecond query dispatching", options: { fontSize: 14, color: 'FF24E4', fontFace: 'Segoe UI' } }
], { x: 0.6, y: 0.3, w: 12.0, h: 1.0 });

const layers = [
  { name: "FRONTEND SPA", tech: "React + Vite", desc: "WebGL canvas background, vanilla HSL tailoring, dynamic responsive layouts." },
  { name: "API ROUTER", tech: "Node.js + Express", desc: "JWT authorization checking, input validation filters, security interceptors." },
  { name: "SECURE FILESYSTEM", tech: "Saltd DB Layer", desc: "Local user JSON pools and metadata cache. Passwords hashed via Bcrypt." },
  { name: "AI INTEGRATION", tech: "OpenAI + Local Fallback", desc: "Custom GPT engines combined with instant rule-based parsing matrices." }
];

layers.forEach((l, idx) => {
  const xOffset = 0.6 + idx * 3.1;
  slide5.addShape(pptx.ShapeType.roundRect, {
    x: xOffset, y: 1.5, w: 2.7, h: 4.2,
    fill: { color: '061424', transparency: 15 },
    line: { color: '00F2FF', width: 1.5, transparency: 80 }
  });
  slide5.addText(l.name, {
    x: xOffset + 0.1, y: 1.7, w: 2.5, h: 0.3,
    fontSize: 13, bold: true, color: 'FF24E4', align: 'center', fontFace: 'Segoe UI'
  });
  slide5.addText(l.tech, {
    x: xOffset + 0.1, y: 2.0, w: 2.5, h: 0.3,
    fontSize: 11, bold: true, color: '00F2FF', align: 'center', fontFace: 'Segoe UI'
  });
  slide5.addText(l.desc, {
    x: xOffset + 0.1, y: 2.4, w: 2.5, h: 3.1,
    fontSize: 10.5, color: '8899AA', align: 'center', fontFace: 'Segoe UI', lineSpacing: 18
  });
});


// ----------------------------------------------------
// SLIDE 6: Hardened Profile Security (Visual alignment)
// ----------------------------------------------------
const slide6 = createPremiumSlide();
slide6.addText([
  { text: "Hardened Profile Security\n", options: { fontSize: 28, bold: true, color: '00F2FF', fontFace: 'Segoe UI' } },
  { text: "Protecting user identities alongside biological data points", options: { fontSize: 14, color: 'FF24E4', fontFace: 'Segoe UI' } }
], { x: 0.6, y: 0.3, w: 12.0, h: 1.0 });

// Left Column Card (Text)
slide6.addShape(pptx.ShapeType.roundRect, {
  x: 0.6, y: 1.5, w: 6.2, h: 4.2,
  fill: { color: '061424', transparency: 15 },
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
    x: 0.9, y: 1.7 + idx * 1.0, w: 5.6, h: 0.9,
    fontSize: 11.5, color: '8899AA', fontFace: 'Segoe UI', lineSpacing: 20
  });
});

// Right Column: Cyber Security Shield Image
slide6.addImage({
  path: imageShield,
  x: 7.2, y: 1.5, w: 5.4, h: 4.2
});


// ----------------------------------------------------
// SLIDE 7: Real-Time OTP Verification Flow
// ----------------------------------------------------
const slide7 = createPremiumSlide();
slide7.addText([
  { text: "Real-Time OTP Verification Flow\n", options: { fontSize: 28, bold: true, color: '00F2FF', fontFace: 'Segoe UI' } },
  { text: "Safe recovery loop configured using secure SMTP mailers", options: { fontSize: 14, color: 'FF24E4', fontFace: 'Segoe UI' } }
], { x: 0.6, y: 0.3, w: 12.0, h: 1.0 });

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
    x: xOffset, y: 1.5, w: 2.2, h: 4.2,
    fill: { color: '061424', transparency: 15 },
    line: { color: '00F2FF', width: 1.5, transparency: 80 }
  });
  slide7.addText(s.num, {
    x: xOffset + 0.1, y: 1.7, w: 2.0, h: 0.5,
    fontSize: 24, bold: true, color: 'FF24E4', align: 'center', fontFace: 'Segoe UI'
  });
  slide7.addText(s.title, {
    x: xOffset + 0.1, y: 2.2, w: 2.0, h: 0.5,
    fontSize: 13, bold: true, color: '00F2FF', align: 'center', fontFace: 'Segoe UI'
  });
  slide7.addText(s.desc, {
    x: xOffset + 0.1, y: 2.7, w: 2.0, h: 2.8,
    fontSize: 10.5, color: '8899AA', align: 'center', fontFace: 'Segoe UI', lineSpacing: 18
  });
});


// ----------------------------------------------------
// SLIDE 8: Dynamic Error Handling & Toasts
// ----------------------------------------------------
const slide8 = createPremiumSlide();
slide8.addText([
  { text: "Dynamic Error Handling & Toasts\n", options: { fontSize: 28, bold: true, color: '00F2FF', fontFace: 'Segoe UI' } },
  { text: "Preventing reloads and preserving state with floating popups", options: { fontSize: 14, color: 'FF24E4', fontFace: 'Segoe UI' } }
], { x: 0.6, y: 0.3, w: 12.0, h: 1.0 });

slide8.addShape(pptx.ShapeType.roundRect, {
  x: 0.6, y: 1.5, w: 5.8, h: 4.2,
  fill: { color: '061424', transparency: 15 },
  line: { color: 'FFFFFF', width: 1, transparency: 85 }
});
slide8.addText("STATE-PRESERVING INTERCEPTORS", {
  x: 0.9, y: 1.7, w: 5.2, h: 0.35,
  fontSize: 16, bold: true, color: '00F2FF', fontFace: 'Segoe UI'
});
slide8.addText(
  "• Skip-on-Login Filter: The 401 response interceptor does not trigger route reloads while already on the login path.\n\n" +
  "• Error Preservation: React state remains completely intact when typing wrong passwords, enabling instant on-page alerts.\n\n" +
  "• Smooth Animations: Warning popups utilize slide-in CSS keyframes to draw immediate user attention.",
  { x: 0.9, y: 2.1, w: 5.2, h: 3.4, fontSize: 11.5, color: '8899AA', fontFace: 'Segoe UI', lineSpacing: 22 }
);

// Toast mockup on the right
slide8.addShape(pptx.ShapeType.roundRect, {
  x: 6.8, y: 2.4, w: 5.8, h: 1.8,
  fill: { color: '4B0F15', transparency: 15 },
  line: { color: 'EF4444', width: 1.5 }
});
slide8.addText("⚠️  Invalid email or password", {
  x: 7.1, y: 2.7, w: 4.5, h: 0.5,
  fontSize: 16, bold: true, color: 'FFFFFF', fontFace: 'Segoe UI'
});
slide8.addText("Please double-check your credentials and try again. This alert will dismiss automatically in 4.5 seconds.", {
  x: 7.1, y: 3.2, w: 4.8, h: 0.8,
  fontSize: 11.5, color: 'FFAAAA', fontFace: 'Segoe UI'
});


// ----------------------------------------------------
// SLIDE 9: Future Roadmap & Visual Analytics
// ----------------------------------------------------
const slide9 = createPremiumSlide();
slide9.addText([
  { text: "Future Development Path\n", options: { fontSize: 28, bold: true, color: '00F2FF', fontFace: 'Segoe UI' } },
  { text: "Transforming personal genomics into a secure, decentralized standard", options: { fontSize: 14, color: 'FF24E4', fontFace: 'Segoe UI' } }
], { x: 0.6, y: 0.3, w: 12.0, h: 1.0 });

const roadmap = [
  { phase: "PHASE 1 (CURRENT)", title: "Security Core", desc: "Password verification checks, OTP recoveries, and custom toast warnings." },
  { phase: "PHASE 2 (Q3 2026)", title: "Batch uploads", desc: "Support for raw files (23andMe, AncestryDNA formats) with offline parsing libraries." },
  { phase: "PHASE 3 (2027)", title: "Zero-Knowledge", desc: "Client-side crypto libraries to secure reports, keeping DNA private from the host." }
];

roadmap.forEach((r, idx) => {
  const xOffset = 0.6 + idx * 2.15;
  slide9.addShape(pptx.ShapeType.roundRect, {
    x: xOffset, y: 1.5, w: 2.0, h: 4.2,
    fill: { color: '061424', transparency: 15 },
    line: { color: 'FF24E4', width: 1.5, transparency: 80 }
  });
  slide9.addText(r.phase, {
    x: xOffset + 0.1, y: 1.7, w: 1.8, h: 0.3,
    fontSize: 10, bold: true, color: 'FF24E4', align: 'center', fontFace: 'Segoe UI'
  });
  slide9.addText(r.title, {
    x: xOffset + 0.1, y: 2.1, w: 1.8, h: 0.3,
    fontSize: 13, bold: true, color: '00F2FF', align: 'center', fontFace: 'Segoe UI'
  });
  slide9.addText(r.desc, {
    x: xOffset + 0.1, y: 2.5, w: 1.8, h: 3.0,
    fontSize: 10, color: '8899AA', align: 'center', fontFace: 'Segoe UI', lineSpacing: 18
  });
});

// Right side: Biotech Analytics illustration
slide9.addImage({
  path: imageBiotech,
  x: 7.2, y: 1.5, w: 5.4, h: 4.2
});


// ----------------------------------------------------
// SLIDE 10: Conclusion & Q&A
// ----------------------------------------------------
const slide10 = pptx.addSlide();
slide10.background = { path: imageBg };

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

// Output path on Desktop (Premium version)
const outputPath = path.join('C:', 'Users', 'Abinson Babu', 'Desktop', 'GeneShield_AI_Presentation_EvaSync.pptx');

pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`\n🎉 Presentation successfully generated and saved to: ${outputPath}\n`);
  })
  .catch(err => {
    console.error('Error writing PPTX:', err.message);
  });
