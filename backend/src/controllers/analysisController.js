const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { generateBulkAIReport } = require('../services/aiService');

const CLINVAR_DB = path.join(__dirname, '../data/clinvar_db.json');
const ANALYSES_FILE = path.join(__dirname, '../data/analyses.json');

const readClinVar = () => JSON.parse(fs.readFileSync(CLINVAR_DB, 'utf8'));
const readAnalyses = () => {
  try { return JSON.parse(fs.readFileSync(ANALYSES_FILE, 'utf8')); }
  catch { return []; }
};
const writeAnalyses = (data) => fs.writeFileSync(ANALYSES_FILE, JSON.stringify(data, null, 2));

// Parse CSV/TXT content into RSID → genotype map
const parseGeneticFile = (content) => {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  const rsidMap = {};
  for (const line of lines) {
    if (line.toLowerCase().startsWith('rsid') || line.startsWith('#')) continue;
    const parts = line.split(/[,\t\s]+/);
    if (parts.length >= 1 && parts[0].toLowerCase().startsWith('rs')) {
      rsidMap[parts[0].toLowerCase()] = parts[1] || 'Unknown';
    }
  }
  return rsidMap;
};

// Core analysis engine
const analyzeRSIDs = async (rsidMap, userApiKey = null) => {
  const clinvar = readClinVar();
  const matchedVariants = [];
  const diseaseRiskMap = {};
  let totalRiskScore = 0;
  let riskCount = 0;

  for (const [rsid, genotype] of Object.entries(rsidMap)) {
    const record = clinvar.find(r => r.rsid.toLowerCase() === rsid.toLowerCase());
    if (record) {
      matchedVariants.push({
        rsid: record.rsid,
        gene: record.gene,
        genotype,
        chromosome: record.chromosome,
        risk_allele: record.risk_allele,
        risk_level: record.risk_level,
        risk_score: record.risk_score,
        diseases: record.diseases,
        description: record.description,
        advice: record.advice
      });

      for (const disease of record.diseases) {
        if (!diseaseRiskMap[disease]) {
          diseaseRiskMap[disease] = { disease, score: 0, level: 'LOW', count: 0 };
        }
        diseaseRiskMap[disease].score = Math.max(diseaseRiskMap[disease].score, record.risk_score);
        diseaseRiskMap[disease].level = record.risk_level;
        diseaseRiskMap[disease].count++;
      }

      totalRiskScore += record.risk_score;
      riskCount++;
    }
  }

  const overallRiskScore = riskCount > 0 ? Math.round(totalRiskScore / riskCount) : 0;
  const highRiskCount = matchedVariants.filter(v => v.risk_level === 'HIGH').length;
  const mediumRiskCount = matchedVariants.filter(v => v.risk_level === 'MEDIUM').length;
  const lowRiskCount = matchedVariants.filter(v => v.risk_level === 'LOW').length;

  const diseaseRisks = Object.values(diseaseRiskMap).sort((a, b) => b.score - a.score);

  // Try generating real OpenAI bulk report, fallback to rule-based summary
  let aiSummary = null;
  if (matchedVariants.length > 0) {
    aiSummary = await generateBulkAIReport(matchedVariants, overallRiskScore, userApiKey);
  }

  if (!aiSummary) {
    aiSummary = generateRuleBasedSummary(matchedVariants, overallRiskScore);
  }

  return {
    totalVariantsScanned: Object.keys(rsidMap).length,
    matchedVariants: matchedVariants.length,
    overallRiskScore,
    riskBreakdown: { high: highRiskCount, medium: mediumRiskCount, low: lowRiskCount },
    variants: matchedVariants,
    diseaseRisks,
    aiSummary
  };
};

const generateRuleBasedSummary = (variants, overallScore) => {
  const highRisk = variants.filter(v => v.risk_level === 'HIGH');
  const allDietAdvice = [...new Set(variants.flatMap(v => v.advice?.diet || []))];
  const allExerciseAdvice = [...new Set(variants.flatMap(v => v.advice?.exercise || []))];
  const allScreening = [...new Set(variants.flatMap(v => v.advice?.screening || []))];
  const allLifestyle = [...new Set(variants.flatMap(v => v.advice?.lifestyle || []))];

  let riskCategory = overallScore >= 70 ? 'elevated' : overallScore >= 45 ? 'moderate' : 'low';
  let urgency = overallScore >= 70 ? 'We recommend consulting a healthcare provider.' : 
                overallScore >= 45 ? 'Proactive lifestyle modifications are recommended.' :
                'Your profile suggests favorable baseline health with standard maintenance habits.';

  return {
    headline: overallScore >= 70
      ? `Analysis reveals ${highRisk.length} high-priority genetic risk marker(s).`
      : overallScore >= 45
      ? `Your genomic profile shows moderate risk indicators manageable through lifestyle adaptation.`
      : `Your genomic profile suggests favorable baseline stats with minor indicators to track.`,
    overview: `Analyzed ${variants.length} matching genetic variants. Overall risk score is ${overallScore}/100, placing you in the ${riskCategory} risk zone. ${urgency}`,
    topConcerns: highRisk.map(v => ({
      gene: v.gene,
      rsid: v.rsid,
      diseases: v.diseases,
      keyAdvice: v.advice?.diet?.[0] || v.advice?.lifestyle?.[0] || 'Consult a specialist'
    })),
    dietPlan: allDietAdvice.slice(0, 8),
    exercisePlan: allExerciseAdvice.slice(0, 6),
    screeningSchedule: allScreening.slice(0, 6),
    lifestyleChanges: allLifestyle.slice(0, 6),
    disclaimer: 'This report is for educational purposes only. GeneShield AI does not provide medical diagnoses.',
    source: 'rule-based-fallback'
  };
};

exports.analyzeFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const content = req.file.buffer.toString('utf8');
    const rsidMap = parseGeneticFile(content);

    if (Object.keys(rsidMap).length === 0) {
      return res.status(400).json({ error: 'No valid RSID markers found in file. Please ensure the file has rsid,genotype format.' });
    }

    const userApiKey = req.headers['x-openai-key'] || null;
    const results = await analyzeRSIDs(rsidMap, userApiKey);
    const analyses = readAnalyses();

    const analysisRecord = {
      id: uuidv4(),
      userId: req.user.id,
      fileName: req.file.originalname,
      createdAt: new Date().toISOString(),
      ...results
    };

    analyses.push(analysisRecord);
    writeAnalyses(analyses);

    res.json({ message: 'Analysis complete', analysisId: analysisRecord.id, data: analysisRecord });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
};

exports.getAnalysis = (req, res) => {
  const analyses = readAnalyses();
  // BUG FIX: Allow the record owner OR any admin user to view the analysis report
  const analysis = analyses.find(a => a.id === req.params.id && (a.userId === req.user.id || req.user.isAdmin));
  if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
  res.json(analysis);
};

exports.getUserAnalyses = (req, res) => {
  const analyses = readAnalyses();
  const userAnalyses = analyses
    .filter(a => a.userId === req.user.id)
    .map(({ variants, aiSummary, diseaseRisks, ...summary }) => summary)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(userAnalyses);
};

exports.deleteAnalysis = (req, res) => {
  const analyses = readAnalyses();
  // BUG FIX: Admins can delete any analysis, users can only delete their own
  const index = analyses.findIndex(a => a.id === req.params.id && (a.userId === req.user.id || req.user.isAdmin));
  if (index === -1) return res.status(404).json({ error: 'Analysis not found' });
  analyses.splice(index, 1);
  writeAnalyses(analyses);
  res.json({ message: 'Analysis deleted' });
};
