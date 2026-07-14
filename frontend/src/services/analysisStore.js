/**
 * GeneShield AI — Client-Side Analysis Store
 * 
 * Because Vercel serverless functions use ephemeral /tmp storage that resets
 * every few minutes, we use the browser's localStorage as the primary
 * persistence layer for analysis history.
 * 
 * The backend still handles: auth, AI generation, RSID lookup.
 * This module handles: reading, writing, deleting analyses.
 */

const getKey = (userId) => `geneshield_analyses_${userId}`;

export function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('geneshield_user') || '{}');
    return user.id || user._id || null;
  } catch { return null; }
}

export function getAllAnalyses(userId) {
  if (!userId) return [];
  try {
    const data = JSON.parse(localStorage.getItem(getKey(userId)) || '[]');
    return Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
  } catch { return []; }
}

export function getAnalysisById(userId, id) {
  if (!userId || !id) return null;
  const all = getAllAnalyses(userId);
  return all.find(a => a.id === id) || null;
}

export function saveAnalysis(userId, analysis) {
  if (!userId || !analysis) return;
  const all = getAllAnalyses(userId);
  const existingIdx = all.findIndex(a => a.id === analysis.id);
  if (existingIdx >= 0) {
    all[existingIdx] = analysis;
  } else {
    all.unshift(analysis); // newest first
  }
  localStorage.setItem(getKey(userId), JSON.stringify(all));
}

export function deleteAnalysis(userId, id) {
  if (!userId || !id) return;
  const all = getAllAnalyses(userId);
  const updated = all.filter(a => a.id !== id);
  localStorage.setItem(getKey(userId), JSON.stringify(updated));
  return updated;
}
