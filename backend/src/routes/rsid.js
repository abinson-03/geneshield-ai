const express = require('express');
const router = express.Router();
const rsidController = require('../controllers/rsidController');
const { optionalAuth } = require('../middleware/auth');

// These endpoints are public (no auth needed for individual lookup)
router.get('/all', rsidController.listAll);
router.get('/search', rsidController.searchRSID);
router.get('/:rsid', rsidController.getRSID);
router.post('/ai-report', optionalAuth, rsidController.getAIReport);

module.exports = router;
