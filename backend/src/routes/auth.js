const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

router.get('/debug-users', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const USERS_FILE = path.join('/tmp', 'users.json');
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf8');
      res.json(JSON.parse(content));
    } else {
      res.json({ error: 'File not found in /tmp' });
    }
  } catch (err) {
    res.json({ error: err.message });
  }
});

module.exports = router;
