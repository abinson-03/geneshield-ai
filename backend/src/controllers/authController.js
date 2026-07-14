const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const USERS_FILE = path.join(__dirname, '../data/users.json');
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
