const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { generateAIReport } = require('../services/aiService');

const getDatabasePath = (filename) => {
  const localPath = path.join(__dirname, '../data', filename);
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    const tmpPath = path.join('/tmp', filename);
    if (!fs.existsSync(tmpPath)) {
      try {
        const content = fs.readFileSync(localPath, 'utf8');
        fs.writeFileSync(tmpPath, content);
      } catch (err) {
        fs.writeFileSync(tmpPath, '[]');
      }
    }
    return tmpPath;
  }
  return localPath;
};

const CLINVAR_DB = path.join(__dirname, '../data/clinvar_db.json');
const ANALYSES_FILE = getDatabasePath('analyses.json');

const readClinVar = () => JSON.parse(fs.readFileSync(CLINVAR_DB, 'utf8'));
const readAnalyses = () => {
  try { return JSON.parse(fs.readFileSync(ANALYSES_FILE, 'utf8')); }
  catch { return []; }
};
const writeAnalyses = (data) => fs.writeFileSync(ANALYSES_FILE, JSON.stringify(data, null, 2));

// Identify obviously fake, repeating, or sequential RSIDs typed by humans
const isObviouslyFakeRSID = (rsid) => {
  const numStr = rsid.toLowerCase().replace('rs', '').trim();
  
  // Must be only digits
  if (!/^\d+$/.test(numStr)) return true;

  // Block single/double digits that are repeating or zero (e.g., 0, 00, 1, 11)
  if (/^0+$/.test(numStr)) return true;
  if (numStr.length < 3 && /^1+$/.test(numStr)) return true;

  // Block sequences of identical digits of length >= 4 (e.g., 1111, 22222, 55555, 444444)
  if (numStr.length >= 4 && /^(\d)\1+$/.test(numStr)) return true;

  // Block common sequential ascending/descending patterns of length >= 3 (blocks rs123, rs321, rs456)
  const sequentialAsc = "0123456789";
  const sequentialDesc = "9876543210";
  if (numStr.length >= 3) {
    if (sequentialAsc.includes(numStr) || sequentialDesc.includes(numStr)) return true;
  }
  
  // Block common alternating/dummy patterns
  const fakePatterns = [
    '121212', '212121', '123123', '224466', '664422', '113355',
    '123456', '654321', '12345', '54321', '1234', '4321', '123'
  ];
  if (fakePatterns.includes(numStr)) return true;

  return false;
};

// Verify if an RSID exists in the real-world dbSNP database using Ensembl REST API
const verifyWithEnsembl = async (rsid) => {
  try {
    const response = await fetch(`https://rest.ensembl.org/variation/human/${rsid}?content-type=application/json`, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    if (!response.ok) {
      if (response.status >= 400 && response.status < 500) return { valid: false, reason: 'not_found' };
      return { valid: false, reason: 'api_error' };
    }
    const data = await response.json();
    return { valid: true, data };
  } catch (err) {
    return { valid: false, reason: 'network_error', error: err.message };
  }
};

// GET /api/rsid/search?q=rs429358  — search/autocomplete
exports.searchRSID = (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q || q.length < 2) return res.json([]);

  // If the autocomplete query matches a fake pattern, don't return suggestions
  if (isObviouslyFakeRSID(q)) {
    return res.json([]);
  }

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
      diseases: ['Click to verify & analyze'],
      isUnlisted: true
    });
  }

  res.json(matches);
};

// GET /api/rsid/:rsid  — get variant details with real-time Ensembl dbSNP validation
exports.getRSID = async (req, res) => {
  const rsid = req.params.rsid.toLowerCase().trim();
  
  if (!rsid.startsWith('rs')) {
    return res.status(400).json({
      error: 'Invalid RSID format.',
      hint: 'RSIDs must start with "rs" followed by numbers (e.g. rs429358).'
    });
  }

  // Instant block for obviously fake / sequential pattern inputs
  if (isObviouslyFakeRSID(rsid)) {
    return res.status(400).json({
      error: `RSID "${req.params.rsid}" is not a valid genetic variant.`,
      hint: 'It matches a simulated or sequential pattern (e.g. repeating digits or ascending sequences). Please enter a real RSID.'
    });
  }

  const db = readClinVar();
  const record = db.find(r => r.rsid.toLowerCase() === rsid);

  if (record) {
    return res.json(record);
  }

  // Real-time verification with international dbSNP Ensembl database
  const verification = await verifyWithEnsembl(req.params.rsid);
  
  if (!verification.valid) {
    if (verification.reason === 'not_found') {
      return res.status(404).json({
        error: `RSID "${req.params.rsid}" is not a valid genetic variant.`,
        hint: 'It does not exist in the official dbSNP or Ensembl databases. Please check the spelling.'
      });
    }
    // Network fallback
    return res.json({
      rsid: req.params.rsid,
      gene: 'Resolving with AI...',
      chromosome: 'Unknown (Offline)',
      risk_allele: 'Unknown',
      diseases: ['Offline Lookup Required'],
      risk_level: 'MEDIUM',
      risk_score: 50,
      description: `We were unable to reach the Ensembl database to verify this variant online. You can still try generating the AI report, but please ensure the RSID is correct.`,
      isUnlisted: true,
      verifiedOffline: true
    });
  }

  // Real variant verified! Extract exact genomic details from Ensembl
  const data = verification.data;
  const chromosome = data.mappings?.[0]?.seq_region_name || 'Unknown';
  const consequence = data.most_severe_consequence || 'unknown consequence';

  res.json({
    rsid: data.name,
    gene: 'Resolving with AI...',
    chromosome: String(chromosome),
    risk_allele: data.ambiguity || 'TBD',
    diseases: ['Clinical Lookup Required'],
    risk_level: 'MEDIUM',
    risk_score: 50,
    description: `Variant "${data.name}" has been verified in the Ensembl database. It is located on Chromosome ${chromosome} (consequence: ${consequence}). Click "Generate AI Report" to query ClinVar and resolve its gene and health associations.`,
    isUnlisted: true,
    verified: true
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

// POST /api/rsid/ai-report  — generate AI report for a single RSID with cache persistence
exports.getAIReport = async (req, res) => {
  try {
    const { rsid, genotype } = req.body;
    if (!rsid) return res.status(400).json({ error: 'RSID is required' });

    // Block fake inputs
    if (isObviouslyFakeRSID(rsid)) {
      return res.status(400).json({ error: 'Invalid RSID pattern.' });
    }

    const db = readClinVar();
    let record = db.find(r => r.rsid.toLowerCase() === rsid.toLowerCase().trim());
    
    // User-provided API key from header or body
    const userApiKey = req.headers['x-openai-key'] || req.body.openaiKey || null;

    let variantData;
    if (record) {
      variantData = { ...record, userGenotype: genotype || 'Not specified', isUnlisted: false };
    } else {
      // Unlisted but already validated
      variantData = {
        rsid,
        userGenotype: genotype || 'Not specified',
        isUnlisted: true
      };
    }

    const aiReport = await generateAIReport(variantData, userApiKey);

    // Merge resolved details
    const responseVariant = {
      rsid: record ? record.rsid : rsid,
      gene: record ? record.gene : (aiReport.resolvedVariant?.gene || 'Unknown Gene'),
      chromosome: record ? record.chromosome : (aiReport.resolvedVariant?.chromosome || 'Unknown'),
      risk_allele: record ? record.risk_allele : (aiReport.resolvedVariant?.risk_allele || 'Unknown'),
      risk_level: record ? record.risk_level : (aiReport.resolvedVariant?.risk_level || 'MEDIUM'),
      risk_score: record ? record.risk_score : (aiReport.resolvedVariant?.risk_score || 50),
      diseases: record ? record.diseases : (aiReport.resolvedVariant?.diseases || ['General Risk']),
      description: record ? record.description : (aiReport.resolvedVariant?.description || 'No description resolved.'),
      advice: record ? record.advice : {
        diet: aiReport.dietPlan || [],
        exercise: aiReport.exercisePlan || [],
        screening: aiReport.screeningSchedule || [],
        lifestyle: aiReport.lifestyleChanges || []
      }
    };

    // CACHE PERSISTENCE: Save new variants permanently in JSON DB to ensure zero future variance
    if (!record) {
      db.push(responseVariant);
      fs.writeFileSync(CLINVAR_DB, JSON.stringify(db, null, 2));
    }

    // Automatically save this lookup as a Dashboard Analysis report if the user is logged in
    if (req.user) {
      const analyses = readAnalyses();
      const overallScore = responseVariant.risk_score;
      const level = responseVariant.risk_level;
      
      const analysisRecord = {
        id: uuidv4(),
        userId: req.user.id,
        fileName: `Single Locus: ${responseVariant.rsid}`,
        createdAt: new Date().toISOString(),
        totalVariantsScanned: 1,
        matchedVariants: 1,
        overallRiskScore: overallScore,
        riskBreakdown: {
          high: level === 'HIGH' ? 1 : 0,
          medium: level === 'MEDIUM' ? 1 : 0,
          low: level === 'LOW' ? 1 : 0
        },
        variants: [
          {
            rsid: responseVariant.rsid,
            gene: responseVariant.gene,
            genotype: genotype || 'Not specified',
            chromosome: responseVariant.chromosome,
            risk_allele: responseVariant.risk_allele,
            risk_level: responseVariant.risk_level,
            risk_score: responseVariant.risk_score,
            diseases: responseVariant.diseases,
            description: responseVariant.description,
            advice: responseVariant.advice
          }
        ],
        diseaseRisks: responseVariant.diseases.map(d => ({
          disease: d,
          score: overallScore,
          level: level,
          count: 1
        })),
        aiSummary: {
          headline: aiReport.headline || `Single variant analysis completed for ${responseVariant.rsid}.`,
          overview: aiReport.whatItMeans || `This report details the health implications of carrying the genotype ${genotype} at the ${responseVariant.rsid} locus.`,
          topConcerns: [
            {
              gene: responseVariant.gene,
              rsid: responseVariant.rsid,
              diseases: responseVariant.diseases,
              keyAdvice: aiReport.yourRisk || 'Refer to personalized recommendations.'
            }
          ],
          dietPlan: aiReport.dietPlan || [],
          exercisePlan: aiReport.exercisePlan || [],
          screeningSchedule: aiReport.screeningSchedule || [],
          lifestyleChanges: aiReport.lifestyleChanges || [],
          disclaimer: aiReport.disclaimer || 'Standard medical disclaimer'
        }
      };
      
      analyses.push(analysisRecord);
      writeAnalyses(analyses);
    }

    res.json({
      variant: { ...responseVariant, userGenotype: genotype || null, isUnlisted: !record },
      aiReport,
      aiPowered: ['openai', 'groq'].includes(aiReport.source),
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('AI report error:', err);
    res.status(500).json({ error: 'Failed to generate report: ' + err.message });
  }
};
