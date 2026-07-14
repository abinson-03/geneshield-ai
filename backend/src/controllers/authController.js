const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const otpStore = {};

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
const JWT_SECRET = process.env.JWT_SECRET || 'geneshield_secret_2026';

const readUsers = () => {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); }
  catch { return []; }
};

const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const users = readUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      name,
      email: email.toLowerCase(),
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
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const users = readUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
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
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.getProfile = (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin, createdAt: user.createdAt });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[userIndex];

    // Check if new email is already taken
    if (email.toLowerCase() !== user.email.toLowerCase()) {
      if (users.some(u => u.id !== user.id && u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(409).json({ error: 'Email already taken by another account' });
      }
    }

    // Verify current password if changing email, name, or password
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect current password' });
      }
    } else if (newPassword || email.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(400).json({ error: 'Current password is required to verify changes' });
    }

    // Apply updates
    user.name = name;
    user.email = email.toLowerCase();

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

    const users = readUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      // Return 200 for security so attackers can't easily enumerate emails,
      // but don't perform sending operations.
      return res.json({ message: 'If that email exists in our records, an OTP has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email.toLowerCase().trim()] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
    };

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
          to: email.trim(),
          subject: 'GeneShield AI - Password Reset OTP Request',
          html: `
            <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: auto; padding: 25px; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; background: #020b18; color: #f0f6ff;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 2.2rem;">🧬</span>
                <h2 style="margin: 10px 0 5px; color: #00d4ff; font-family: 'Space Grotesk', sans-serif; font-weight: 900; letter-spacing: 0.05em;">GENESHIELD AI</h2>
                <p style="font-size: 0.85rem; color: #8899aa; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">Genomic Security Redefined</p>
              </div>
              <p style="font-size: 0.95rem; line-height: 1.6; color: #b0c0d0;">Hello,</p>
              <p style="font-size: 0.95rem; line-height: 1.6; color: #b0c0d0;">We received a request to reset the password for your GeneShield AI account. Use the following One-Time Password (OTP) code to verify your identity. This code is valid for 10 minutes:</p>
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
        console.log(`[SMTP] Sent OTP email successfully to ${email}`);
      } catch (err) {
        console.error('[SMTP] Failed to send email:', err.message);
        // Fallback log to console if SMTP sending fails
        console.log(`\n🔑 [OTP FALLBACK] Generated OTP for ${email}: ${otp}\n`);
      }
    } else {
      // Fallback console log for local development
      console.log(`\n🔑 [OTP FALLBACK] Generated OTP for ${email}: ${otp}\n`);
    }

    res.json({
      message: 'OTP sent successfully',
      devFallback: !hasSmtp ? otp : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during OTP request' });
  }
};

exports.verifyOTP = (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const record = otpStore[email.toLowerCase().trim()];
    if (!record) return res.status(400).json({ error: 'No OTP requested for this email' });

    if (Date.now() > record.expiresAt) {
      delete otpStore[email.toLowerCase().trim()];
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

    const record = otpStore[email.toLowerCase().trim()];
    if (!record || record.otp !== otp.trim() || Date.now() > record.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP session. Please verify again.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const users = readUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (idx === -1) return res.status(404).json({ error: 'User not found' });

    users[idx].password = await bcrypt.hash(newPassword, 10);
    writeUsers(users);

    delete otpStore[email.toLowerCase().trim()];

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during password reset' });
  }
};
