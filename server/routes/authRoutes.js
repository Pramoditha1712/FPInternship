// ==== BACKEND (Express) ==== 

// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;// Use process.env.JWT_SECRET in production

// ✅ Register Route
router.post('/register', async (req, res) => {
  const { rollNo, name, branch, semester, password, section } = req.body;
  const email = req.body.email.toLowerCase().trim();

  try {
    if (!rollNo || !name || !email || !branch || !semester || !password || !section) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    console.log('Registering user with email:', email);

    const user = new User({
      rollNo,
      name,
      email,
      branch,
      semester,
      section,
      password,
      role: 'student'
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err.message || err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Login Route
router.post('/login', async (req, res) => {
  const email = req.body.email.toLowerCase().trim();
  const password = req.body.password;

  console.log('Login attempt with email:', email);
  console.log('Password received:', password);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.warn('Login failed: User not found for email', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log('Comparing input password with hash:', user.password);
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.warn('Login failed: Incorrect password');
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, role: user.role, email: user.email });
  } catch (err) {
    console.error('Login error:', err.message || err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Admin: Get All Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'rollNo name email branch semester role');
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err.message || err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;