const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const ANALYSES_FILE = path.join(__dirname, '../data/analyses.json');

const readUsers = () => { try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch { return []; } };
const readAnalyses = () => { try { return JSON.parse(fs.readFileSync(ANALYSES_FILE, 'utf8')); } catch { return []; } };
const writeUsers = (data) => fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
const writeAnalyses = (data) => fs.writeFileSync(ANALYSES_FILE, JSON.stringify(data, null, 2));

// GET /api/admin/stats
exports.getStats = (req, res) => {
  const users = readUsers();
  const analyses = readAnalyses();
  const nonAdminUsers = users.filter(u => !u.isAdmin);

  const highRiskAnalyses = analyses.filter(a => a.overallRiskScore >= 70).length;
  const avgRisk = analyses.length > 0
    ? Math.round(analyses.reduce((s, a) => s + (a.overallRiskScore || 0), 0) / analyses.length)
    : 0;

  res.json({
    totalUsers: nonAdminUsers.length,
    totalAnalyses: analyses.length,
    highRiskAnalyses,
    averageRiskScore: avgRisk,
    totalVariantsScanned: analyses.reduce((s, a) => s + (a.totalVariantsScanned || 0), 0),
    recentActivity: analyses
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(a => {
        const user = users.find(u => u.id === a.userId);
        return {
          id: a.id,
          fileName: a.fileName,
          userName: user?.name || 'Unknown',
          userEmail: user?.email || '',
          overallRiskScore: a.overallRiskScore,
          matchedVariants: a.matchedVariants,
          createdAt: a.createdAt
        };
      })
  });
};

// GET /api/admin/users
exports.getAllUsers = (req, res) => {
  const users = readUsers();
  const analyses = readAnalyses();
  const result = users.map(u => {
    const userAnalyses = analyses.filter(a => a.userId === u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      isAdmin: !!u.isAdmin,
      createdAt: u.createdAt,
      analysisCount: userAnalyses.length,
      lastAnalysis: userAnalyses.length > 0
        ? userAnalyses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt
        : null
    };
  });
  res.json(result);
};

// DELETE /api/admin/users/:id
exports.deleteUser = (req, res) => {
  const users = readUsers();
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  if (users[idx].isAdmin) return res.status(403).json({ error: 'Cannot delete admin user' });
  users.splice(idx, 1);
  writeUsers(users);
  // Also delete their analyses
  const analyses = readAnalyses();
  writeAnalyses(analyses.filter(a => a.userId !== req.params.id));
  res.json({ message: 'User deleted successfully' });
};

// GET /api/admin/analyses
exports.getAllAnalyses = (req, res) => {
  const analyses = readAnalyses();
  const users = readUsers();
  const result = analyses
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(a => {
      const user = users.find(u => u.id === a.userId);
      return {
        id: a.id,
        fileName: a.fileName,
        userId: a.userId,
        userName: user?.name || 'Unknown',
        userEmail: user?.email || '',
        overallRiskScore: a.overallRiskScore,
        matchedVariants: a.matchedVariants,
        totalVariantsScanned: a.totalVariantsScanned,
        riskBreakdown: a.riskBreakdown,
        createdAt: a.createdAt
      };
    });
  res.json(result);
};

// DELETE /api/admin/analyses/:id
exports.deleteAnalysis = (req, res) => {
  const analyses = readAnalyses();
  const idx = analyses.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Analysis not found' });
  analyses.splice(idx, 1);
  writeAnalyses(analyses);
  res.json({ message: 'Analysis deleted successfully' });
};
