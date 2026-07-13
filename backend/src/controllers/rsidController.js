const fs = require('fs');
const path = require('path');
const { generateAIReport } = require('../services/aiService');

const CLINVAR_DB = path.join(__dirname, '../data/clinvar_db.json');
const readClinVar = () => JSON.parse(fs.readFileSync(CLINVAR_DB, 'utf8'));

// GET /api/rsid/search?q=rs429358  — search/autocomplete
exports.searchRSID = (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q || q.length < 2) return res.json([]);

  const db = readClinVar();
  const matches = db.filter(r =>
    r.rsid.toLowerCase().includes(q) ||
    r.gene.toLowerCase().includes(q) ||
    r.diseases.some(d => d.toLowerCase().includes(q))
  ).slice(0, 8).map(r => ({
    rsid: r.rsid,
    gene: r.gene,
    risk_level: r.risk_level,
    diseases: r.diseases.slice(0, 2)
  }));

  // If no matches in our local DB, allow searching it as a custom/unlisted variant
  if (matches.length === 0 && q.startsWith('rs')) {
    matches.push({
      rsid: q,
      gene: 'Unlisted Variant',
      risk_level: 'MEDIUM',
      diseases: ['Click to resolve with AI'],
      isUnlisted: true
    });
  }

  res.json(matches);
};

// GET /api/rsid/:rsid  — get variant details (with dynamic fallback for unlisted)
exports.getRSID = (req, res) => {
  const rsid = req.params.rsid.toLowerCase().trim();
  const db = readClinVar();
  const record = db.find(r => r.rsid.toLowerCase() === rsid);

  if (record) {
    return res.json(record);
  }

  // Realistic dynamic fallback for ANY RSID
  if (rsid.startsWith('rs')) {
    return res.json({
      rsid: req.params.rsid,
      gene: 'Resolving with AI...',
      chromosome: 'Calculating...',
      risk_allele: 'Calculating...',
      diseases: ['Bioinformatics Lookup Required'],
      risk_level: 'MEDIUM',
      risk_score: 50,
      description: `Variant "${req.params.rsid}" is not in our local offline catalog. Click the "Generate AI Report" button below to query the international ClinVar, dbSNP, and GWAS databases in real-time using GPT-4o.`,
      isUnlisted: true
    });
  }

  res.status(404).json({
    error: `Invalid RSID format. RSIDs must start with "rs" (e.g. rs429358).`,
  });
};

// GET /api/rsid/all  — list all RSIDs in database
exports.listAll = (req, res) => {
  const db = readClinVar();
  const list = db.map(r => ({
    rsid: r.rsid,
    gene: r.gene,
    chromosome: r.chromosome,
    risk_level: r.risk_level,
    risk_score: r.risk_score,
    diseases: r.diseases
  }));
  res.json(list);
};

// POST /api/rsid/ai-report  — generate AI report for a single RSID
exports.getAIReport = async (req, res) => {
  try {
    const { rsid, genotype, isUnlisted } = req.body;
    if (!rsid) return res.status(400).json({ error: 'RSID is required' });

    const db = readClinVar();
    let record = db.find(r => r.rsid.toLowerCase() === rsid.toLowerCase().trim());
    
    // User-provided API key from header or body
    const userApiKey = req.headers['x-openai-key'] || req.body.openaiKey || null;

    let variantData;
    if (record) {
      variantData = { ...record, userGenotype: genotype || 'Not specified', isUnlisted: false };
    } else {
      // Dynamic unlisted variant
      variantData = {
        rsid,
        userGenotype: genotype || 'Not specified',
        isUnlisted: true
      };
    }

    const aiReport = await generateAIReport(variantData, userApiKey);

    // If AI successfully resolved the unlisted variant, merge the resolved data back!
    const responseVariant = {
      rsid: record ? record.rsid : rsid,
      gene: record ? record.gene : (aiReport.resolvedVariant?.gene || 'Unknown Gene'),
      chromosome: record ? record.chromosome : (aiReport.resolvedVariant?.chromosome || 'Unknown'),
      risk_allele: record ? record.risk_allele : (aiReport.resolvedVariant?.risk_allele || 'Unknown'),
      risk_level: record ? record.risk_level : (aiReport.resolvedVariant?.risk_level || 'MEDIUM'),
      risk_score: record ? record.risk_score : (aiReport.resolvedVariant?.risk_score || 50),
      diseases: record ? record.diseases : (aiReport.resolvedVariant?.diseases || ['General Risk']),
      description: record ? record.description : (aiReport.resolvedVariant?.description || 'No description resolved.'),
      userGenotype: genotype || null,
      isUnlisted: !record
    };

    res.json({
      variant: responseVariant,
      aiReport,
      aiPowered: aiReport.source === 'openai',
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('AI report error:', err);
    res.status(500).json({ error: 'Failed to generate report: ' + err.message });
  }
};
