const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    rsid: { type: String, required: true },
    gene: { type: String, required: true },
    genotype: { type: String, default: 'Unknown' },
    chromosome: { type: String },
    risk_allele: { type: String },
    risk_level: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], required: true },
    risk_score: { type: Number, required: true },
    diseases: [{ type: String }],
    description: { type: String },
    advice: {
      diet: [{ type: String }],
      exercise: [{ type: String }],
      screening: [{ type: String }],
      lifestyle: [{ type: String }],
    },
    population_studied: [{ type: String }],
    representation_note: { type: String },
    confidenceScore: { type: String, enum: ['High', 'Moderate', 'Low'] },
  },
  { _id: false }
);

const diseaseRiskSchema = new mongoose.Schema(
  {
    disease: { type: String, required: true },
    score: { type: Number, required: true },
    level: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'] },
    count: { type: Number, default: 1 },
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    totalVariantsScanned: {
      type: Number,
      default: 0,
    },
    matchedVariants: {
      type: Number,
      default: 0,
    },
    overallRiskScore: {
      type: Number,
      required: true,
    },
    overallConfidenceIndex: {
      type: Number,
      default: 0,
    },
    riskBreakdown: {
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
    },
    variants: [variantSchema],
    diseaseRisks: [diseaseRiskSchema],
    aiSummary: {
      headline: { type: String },
      overview: { type: String },
      topConcerns: [
        {
          gene: String,
          rsid: String,
          diseases: [String],
          keyAdvice: String,
        },
      ],
      dietPlan: [String],
      exercisePlan: [String],
      screeningSchedule: [String],
      lifestyleChanges: [String],
      disclaimer: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: -1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema);
