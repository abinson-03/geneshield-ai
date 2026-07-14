const express = require('express');
const router = express.Router();
const multer = require('multer');
const analysisController = require('../controllers/analysisController');
const { authMiddleware } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.csv', '.txt', '.vcf'];
    const ext = '.' + file.originalname.split('.').pop().toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only CSV, TXT, and VCF files are allowed'));
  }
});

router.post('/analyze', authMiddleware, upload.single('geneticFile'), analysisController.analyzeFile);
router.get('/', authMiddleware, analysisController.getUserAnalyses);
router.get('/:id', authMiddleware, analysisController.getAnalysis);
router.delete('/:id', authMiddleware, analysisController.deleteAnalysis);

module.exports = router;
