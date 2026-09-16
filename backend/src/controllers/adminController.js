const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Analysis = require('../models/Analysis');

const isMongoActive = () => !!process.env.MONGODB_URI && mongoose.connection.readyState === 1;

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

const USERS_FILE = getDatabasePath('users.json');
const ANALYSES_FILE = getDatabasePath('analyses.json');

const readUsers = () => { try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch { return []; } };
const readAnalyses = () => { try { return JSON.parse(fs.readFileSync(ANALYSES_FILE, 'utf8')); } catch { return []; } };
const writeUsers = (data) => fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
const writeAnalyses = (data) => fs.writeFileSync(ANALYSES_FILE, JSON.stringify(data, null, 2));

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    if (isMongoActive()) {
      const nonAdminUsers = await User.countDocuments({ isAdmin: { $ne: true } });
      const totalAnalyses = await Analysis.countDocuments();
      const highRiskAnalyses = await Analysis.countDocuments({ overallRiskScore: { $gte: 70 } });

      const allAnalyses = await Analysis.find().select('overallRiskScore totalVariantsScanned').lean();
      const totalVariantsScanned = allAnalyses.reduce((s, a) => s + (a.totalVariantsScanned || 0), 0);
      const averageRiskScore = allAnalyses.length > 0
        ? Math.round(allAnalyses.reduce((s, a) => s + (a.overallRiskScore || 0), 0) / allAnalyses.length)
        : 0;

      const recentAnalyses = await Analysis.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      const userIds = [...new Set(recentAnalyses.map(a => a.userId))];
      const users = await User.find({ id: { $in: userIds } }).select('id name email').lean();
      const userMap = new Map(users.map(u => [u.id, u]));

      const recentActivity = recentAnalyses.map(a => {
        const user = userMap.get(a.userId);
        return {
          id: a.id,
          fileName: a.fileName,
          userName: user?.name || 'Unknown',
          userEmail: user?.email || '',
          overallRiskScore: a.overallRiskScore,
          matchedVariants: a.matchedVariants,
          createdAt: a.createdAt
        };
      });

      return res.json({
        totalUsers: nonAdminUsers,
        totalAnalyses,
        highRiskAnalyses,
        averageRiskScore,
        totalVariantsScanned,
        recentActivity
      });
    }

    // Flat file fallback
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
  } catch (err) {
    console.error('[Admin getStats Error]:', err);
    res.status(500).json({ error: 'Failed to retrieve admin stats' });
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    if (isMongoActive()) {
      const users = await User.find().sort({ createdAt: -1 }).lean();
      const analyses = await Analysis.find().select('userId createdAt').lean();

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
      return res.json(result);
    }

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
  } catch (err) {
    console.error('[Admin getAllUsers Error]:', err);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (isMongoActive()) {
      const user = await User.findOne({ id: req.params.id });
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.isAdmin) return res.status(403).json({ error: 'Cannot delete admin user' });

      await User.deleteOne({ id: req.params.id });
      await Analysis.deleteMany({ userId: req.params.id });
      return res.json({ message: 'User deleted successfully' });
    }

    const users = readUsers();
    const idx = users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });
    if (users[idx].isAdmin) return res.status(403).json({ error: 'Cannot delete admin user' });
    users.splice(idx, 1);
    writeUsers(users);
    const analyses = readAnalyses();
    writeAnalyses(analyses.filter(a => a.userId !== req.params.id));
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('[Admin deleteUser Error]:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// GET /api/admin/analyses
exports.getAllAnalyses = async (req, res) => {
  try {
    if (isMongoActive()) {
      const analyses = await Analysis.find()
        .select('id fileName userId overallRiskScore matchedVariants totalVariantsScanned riskBreakdown createdAt')
        .sort({ createdAt: -1 })
        .lean();

      const userIds = [...new Set(analyses.map(a => a.userId))];
      const users = await User.find({ id: { $in: userIds } }).select('id name email').lean();
      const userMap = new Map(users.map(u => [u.id, u]));

      const result = analyses.map(a => {
        const user = userMap.get(a.userId);
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
      return res.json(result);
    }

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
  } catch (err) {
    console.error('[Admin getAllAnalyses Error]:', err);
    res.status(500).json({ error: 'Failed to retrieve analyses' });
  }
};

// DELETE /api/admin/analyses/:id
exports.deleteAnalysis = async (req, res) => {
  try {
    if (isMongoActive()) {
      const result = await Analysis.deleteOne({ id: req.params.id });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Analysis not found' });
      return res.json({ message: 'Analysis deleted successfully' });
    }

    const analyses = readAnalyses();
    const idx = analyses.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Analysis not found' });
    analyses.splice(idx, 1);
    writeAnalyses(analyses);
    res.json({ message: 'Analysis deleted successfully' });
  } catch (err) {
    console.error('[Admin deleteAnalysis Error]:', err);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
};
