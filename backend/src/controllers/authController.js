const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const User = require('../models/User');
const Otp = require('../models/Otp');

const isMongoActive = () => !!process.env.MONGODB_URI && mongoose.connection.readyState === 1;

const otpStore = {};

const ADMIN_HASH = '$2a$10$X/cB0j/mOE4uTLEAjWvW0ekqTXmO1iIt2gaAf3n5lwOHtIGlnBTYW';
const JWT_SECRET = process.env.JWT_SECRET || 'geneshield_secret_2026';

const getUsersFilePath = () => {
  const localPath = path.join(__dirname, '../data', 'users.json');
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    const tmpPath = path.join('/tmp', 'users.json');
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

const readUsers = () => {
  const filePath = getUsersFilePath();
  let data = [];
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(data)) data = [];
  } catch {
    data = [];
  }

  // Self-heal admin on read
  let changed = false;
  let admin = data.find(u => u.email === 'admin@geneshield.ai');
  if (!admin) {
    data.push({
      id: 'admin-001',
      name: 'Admin',
      email: 'admin@geneshield.ai',
      password: ADMIN_HASH,
      isAdmin: true,
      createdAt: '2026-07-13T00:00:00.000Z'
    });
    changed = true;
    console.log('[GeneShield] Admin account restored.');
  } else if (admin.password !== ADMIN_HASH) {
    admin.password = ADMIN_HASH;
    changed = true;
    console.log('[GeneShield] Admin password hash corrected.');
  }
  if (changed) {
    try { fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); } catch {}
  }
  return data;
};

const writeUsers = (users) => {
  const filePath = getUsersFilePath();
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const cleanEmail = email.toLowerCase().trim();

    if (isMongoActive()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        id: uuidv4(),
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        isAdmin: false,
        createdAt: new Date()
      });

      const token = jwt.sign(
        { id: newUser.id, name: newUser.name, email: newUser.email, isAdmin: false },
        JWT_SECRET, { expiresIn: '7d' }
      );
      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, isAdmin: false }
      });
    }

    // Flat file fallback
    const users = readUsers();
    if (users.find(u => u.email.toLowerCase() === cleanEmail))
      return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      name,
      email: cleanEmail,
      password: hashedPassword,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    writeUsers(users);

    const token = jwt.sign(
      { id: newUser.id, name, email: newUser.email, isAdmin: false },
      JWT_SECRET, { expiresIn: '7d' }
    );
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: newUser.id, name, email: newUser.email, isAdmin: false }
    });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const cleanEmail = email.toLowerCase().trim();

    if (isMongoActive()) {
      let user = await User.findOne({ email: cleanEmail });

      // Admin auto-heal in Mongo
      if (!user && cleanEmail === 'admin@geneshield.ai') {
        user = await User.create({
          id: 'admin-001',
          name: 'Admin',
          email: 'admin@geneshield.ai',
          password: ADMIN_HASH,
          isAdmin: true,
          createdAt: new Date('2026-07-13T00:00:00.000Z')
        });
        console.log('[GeneShield] Admin account auto-created in MongoDB.');
      }

      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      let isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch && cleanEmail === 'admin@geneshield.ai') {
        isMatch = await bcrypt.compare(password, ADMIN_HASH);
        if (isMatch) {
          user.password = ADMIN_HASH;
          await user.save();
          console.log('[GeneShield] Admin password corrected in MongoDB.');
        }
      }

      if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin },
        JWT_SECRET, { expiresIn: '7d' }
      );
      return res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin }
      });
    }

    // Flat file fallback
    const users = readUsers();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user && cleanEmail === 'admin@geneshield.ai') {
      user = {
        id: 'admin-001',
        name: 'Admin',
        email: 'admin@geneshield.ai',
        password: ADMIN_HASH,
        isAdmin: true,
        createdAt: '2026-07-13T00:00:00.000Z'
      };
    }

    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && user.email.toLowerCase() === 'admin@geneshield.ai') {
      isMatch = await bcrypt.compare(password, ADMIN_HASH);
      if (isMatch) {
        user.password = ADMIN_HASH;
        const allUsers = readUsers();
        const idx = allUsers.findIndex(u => u.email === 'admin@geneshield.ai');
        if (idx >= 0) {
          allUsers[idx].password = ADMIN_HASH;
          writeUsers(allUsers);
        }
      }
    }

    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin },
      JWT_SECRET, { expiresIn: '7d' }
    );
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin }
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (isMongoActive()) {
      const user = await User.findOne({ id: req.user.id });
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin, createdAt: user.createdAt });
    }

    const users = readUsers();
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin, createdAt: user.createdAt });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const cleanEmail = email.toLowerCase().trim();

    if (isMongoActive()) {
      const user = await User.findOne({ id: req.user.id });
      if (!user) return res.status(404).json({ error: 'User not found' });

      if (cleanEmail !== user.email) {
        const emailTaken = await User.findOne({ id: { $ne: user.id }, email: cleanEmail });
        if (emailTaken) {
          return res.status(409).json({ error: 'Email already taken by another account' });
        }
      }

      if (currentPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(401).json({ error: 'Incorrect current password' });
        }
      } else if (newPassword || cleanEmail !== user.email) {
        return res.status(400).json({ error: 'Current password is required to verify changes' });
      }

      user.name = name.trim();
      user.email = cleanEmail;

      if (newPassword) {
        user.password = await bcrypt.hash(newPassword, 10);
      }

      await user.save();

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin },
        JWT_SECRET, { expiresIn: '7d' }
      );

      return res.json({
        message: 'Profile updated successfully',
        token,
        user: { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin }
      });
    }

    // Flat file fallback
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[userIndex];

    if (cleanEmail !== user.email.toLowerCase()) {
      if (users.some(u => u.id !== user.id && u.email.toLowerCase() === cleanEmail)) {
        return res.status(409).json({ error: 'Email already taken by another account' });
      }
    }

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect current password' });
      }
    } else if (newPassword || cleanEmail !== user.email.toLowerCase()) {
      return res.status(400).json({ error: 'Current password is required to verify changes' });
    }

    user.name = name;
    user.email = cleanEmail;

    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    users[userIndex] = user;
    writeUsers(users);

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin },
      JWT_SECRET, { expiresIn: '7d' }
    );

    res.json({
      message: 'Profile updated successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during profile update' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const cleanEmail = email.toLowerCase().trim();

    let userExists = false;
    if (isMongoActive()) {
      const user = await User.findOne({ email: cleanEmail });
      userExists = !!user;
    } else {
      const users = readUsers();
      userExists = users.some(u => u.email.toLowerCase() === cleanEmail);
    }

    if (!userExists) {
      return res.json({ message: 'If that email exists in our records, an OTP has been sent.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    if (isMongoActive()) {
      // Store in MongoDB with 5-minute expiry field
      await Otp.deleteMany({ email: cleanEmail });
      await Otp.create({ email: cleanEmail, otp, expiresAt });
    } else {
      otpStore[cleanEmail] = {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000
      };
    }

    let emailSent = false;
    const hasSmtp = process.env.EMAIL_USER && process.env.EMAIL_PASS;
    if (hasSmtp) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: `"GeneShield AI Support" <${process.env.EMAIL_USER}>`,
          to: cleanEmail,
          subject: 'GeneShield AI - Password Reset OTP Request',
          html: `
            <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: auto; padding: 25px; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; background: #020b18; color: #f0f6ff;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 2.2rem;">🧬</span>
                <h2 style="margin: 10px 0 5px; color: #00d4ff; font-family: 'Space Grotesk', sans-serif; font-weight: 900; letter-spacing: 0.05em;">GENESHIELD AI</h2>
                <p style="font-size: 0.85rem; color: #8899aa; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">Genomic Security Redefined</p>
              </div>
              <p style="font-size: 0.95rem; line-height: 1.6; color: #b0c0d0;">Hello,</p>
              <p style="font-size: 0.95rem; line-height: 1.6; color: #b0c0d0;">We received a request to reset the password for your GeneShield AI account. Use the following One-Time Password (OTP) code to verify your identity. This code is valid for 5 minutes:</p>
              <div style="background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.25); padding: 15px; border-radius: 12px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #00d4ff; font-family: monospace; margin: 25px 0;">
                ${otp}
              </div>
              <p style="font-size: 0.85rem; color: #4a5568; line-height: 1.5; margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 15px;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[SMTP] Sent OTP email successfully to ${cleanEmail}`);
        emailSent = true;
      } catch (err) {
        console.error('[SMTP] Failed to send email:', err.message);
        console.log(`\n🔑 [OTP FALLBACK] Generated OTP for ${cleanEmail}: ${otp}\n`);
      }
    } else {
      console.log(`\n🔑 [OTP FALLBACK] Generated OTP for ${cleanEmail}: ${otp}\n`);
    }

    res.json({
      message: 'OTP sent successfully',
      devFallback: !emailSent ? otp : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during OTP request' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });
    const cleanEmail = email.toLowerCase().trim();

    if (isMongoActive()) {
      const record = await Otp.findOne({
        email: cleanEmail,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });

      if (!record) return res.status(400).json({ error: 'No valid OTP found or it has expired. Please request a new one.' });
      if (record.otp !== otp.trim()) return res.status(400).json({ error: 'Invalid OTP code' });
      return res.json({ message: 'OTP verified successfully' });
    }

    const record = otpStore[cleanEmail];
    if (!record) return res.status(400).json({ error: 'No OTP requested for this email' });

    if (Date.now() > record.expiresAt) {
      delete otpStore[cleanEmail];
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid OTP code' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during OTP verification' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const cleanEmail = email.toLowerCase().trim();

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (isMongoActive()) {
      const record = await Otp.findOne({
        email: cleanEmail,
        otp: otp.trim(),
        expiresAt: { $gt: new Date() }
      });
      if (!record) {
        return res.status(400).json({ error: 'Invalid or expired OTP session. Please verify again.' });
      }

      const user = await User.findOne({ email: cleanEmail });
      if (!user) return res.status(404).json({ error: 'User not found' });

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      await Otp.deleteMany({ email: cleanEmail });

      return res.json({ message: 'Password reset successful. You can now login with your new password.' });
    }

    const record = otpStore[cleanEmail];
    if (!record || record.otp !== otp.trim() || Date.now() > record.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP session. Please verify again.' });
    }

    const users = readUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });

    users[idx].password = await bcrypt.hash(newPassword, 10);
    writeUsers(users);

    delete otpStore[cleanEmail];

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during password reset' });
  }
};
