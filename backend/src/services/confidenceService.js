/**
 * confidenceService.js
 *
 * Shared utility for computing population confidence scores.
 * Used by both analysisController.js (bulk file upload) and
 * rsidController.js (single RSID lookup / AI report).
 *
 * Extracted here to avoid duplicating logic across controllers.
 */

// Populations whose presence in population_studied → 'High' confidence.
const CONFIDENCE_HIGH_POPULATIONS = [
  'South Asian', 'Indian', 'African', 'African American',
  'East Asian', 'Latin American', 'Middle Eastern'
];

// Populations whose presence (when no HIGH-tier population is listed) → 'Moderate'.
const CONFIDENCE_MODERATE_POPULATIONS = ['Global'];

// If population_studied contains ONLY values in this list → 'Low'.
const CONFIDENCE_EUROPEAN_ONLY_LABELS = ['European', 'Northern European'];

// Numeric weights for each confidence tier, used when computing overallConfidenceIndex.
const CONFIDENCE_NUMERIC = { High: 3, Moderate: 2, Low: 1 };

/**
 * computeConfidenceScore(variant)
 *
 * Returns how confident we are that this variant's risk associations are
 * applicable to a diverse (non-exclusively-European) population, based solely
 * on its population_studied array from clinvar_db.json.
 *
 * @param {object} variant - Any variant object
 * @param {string[]} [variant.population_studied] - Optional array of population strings
 * @returns {'High' | 'Moderate' | 'Low'}
 */
const computeConfidenceScore = (variant) => {
  const populations = Array.isArray(variant.population_studied)
    ? variant.population_studied
    : [];

  // Step 1 — any explicitly named diverse population → High
  if (populations.some(p => CONFIDENCE_HIGH_POPULATIONS.includes(p))) {
    return 'High';
  }

  // Step 2 — 'Global' (or similar broad label) without a specific diverse group → Moderate
  if (populations.some(p => CONFIDENCE_MODERATE_POPULATIONS.includes(p))) {
    return 'Moderate';
  }

  // Step 3 — exclusively European labels, or no data at all → Low
  if (
    populations.length === 0 ||
    populations.every(p => CONFIDENCE_EUROPEAN_ONLY_LABELS.includes(p))
  ) {
    return 'Low';
  }

  // Step 4 — partial / unrecognised combination → Moderate (safe default)
  return 'Moderate';
};

module.exports = {
  computeConfidenceScore,
  CONFIDENCE_NUMERIC,
  CONFIDENCE_HIGH_POPULATIONS,
  CONFIDENCE_MODERATE_POPULATIONS,
  CONFIDENCE_EUROPEAN_ONLY_LABELS,
};
