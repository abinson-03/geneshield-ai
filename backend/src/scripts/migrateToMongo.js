require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const connectDB = require('../config/db');
const User = require('../models/User');
const Analysis = require('../models/Analysis');

async function migrate() {
  console.log('[Migration] Starting data migration to MongoDB Atlas...');

  const conn = await connectDB();
  if (!conn) {
    console.error('[Migration] Aborted: No MongoDB connection established.');
    process.exit(1);
  }

  // 1. Migrate Users
  const usersPath = path.join(__dirname, '../data/users.json');
  if (fs.existsSync(usersPath)) {
    try {
      const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      console.log(`[Migration] Found ${users.length} users in users.json`);
      let userCount = 0;
      for (const u of users) {
        await User.findOneAndUpdate(
          { id: u.id },
          {
            $set: {
              id: u.id,
              name: u.name,
              email: u.email.toLowerCase().trim(),
              password: u.password,
              isAdmin: !!u.isAdmin,
              createdAt: u.createdAt ? new Date(u.createdAt) : new Date()
            }
          },
          { upsert: true, new: true }
        );
        userCount++;
      }
      console.log(`[Migration] Successfully upserted ${userCount} users.`);
    } catch (err) {
      console.error('[Migration] Error migrating users:', err.message);
    }
  }

  // 2. Migrate Analyses
  const analysesPath = path.join(__dirname, '../data/analyses.json');
  if (fs.existsSync(analysesPath)) {
    try {
      const analyses = JSON.parse(fs.readFileSync(analysesPath, 'utf8'));
      console.log(`[Migration] Found ${analyses.length} analyses in analyses.json`);
      let analysisCount = 0;
      for (const a of analyses) {
        await Analysis.findOneAndUpdate(
          { id: a.id },
          {
            $set: {
              id: a.id,
              userId: a.userId,
              fileName: a.fileName,
              totalVariantsScanned: a.totalVariantsScanned || 0,
              matchedVariants: a.matchedVariants || 0,
              overallRiskScore: a.overallRiskScore || 0,
              overallConfidenceIndex: a.overallConfidenceIndex || 0,
              riskBreakdown: a.riskBreakdown || { high: 0, medium: 0, low: 0 },
              variants: a.variants || [],
              diseaseRisks: a.diseaseRisks || [],
              aiSummary: a.aiSummary || null,
              createdAt: a.createdAt ? new Date(a.createdAt) : new Date()
            }
          },
          { upsert: true, new: true }
        );
        analysisCount++;
      }
      console.log(`[Migration] Successfully upserted ${analysisCount} analyses.`);
    } catch (err) {
      console.error('[Migration] Error migrating analyses:', err.message);
    }
  }

  console.log('[Migration] Migration complete.');
  process.exit(0);
}

if (require.main === module) {
  migrate().catch(err => {
    console.error('[Migration] Fatal error:', err);
    process.exit(1);
  });
}

module.exports = migrate;
