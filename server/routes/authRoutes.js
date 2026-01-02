// ==== BACKEND (Express) ==== 

// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendMail = require('../utils/forgotpasswordEmailservice');
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

  try {
    console.log('Login attempt with email:', email);
    console.log('Password provided:', password);

    // 🔍 Find user in DB
    const user = await User.findOne({ email });
    if (!user) {
      console.warn('Login failed: User not found for email', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', user.email, 'Hashed password:', user.password);

    // 🔐 Compare plain password with hashed DB password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.warn('Login failed: Incorrect password');
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 🪪 Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

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

// POST /auth/send-reset-code
// POST /auth/send-reset-code
router.post('/send-reset-code', async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📩 Received email for reset:", email);

    // 1️⃣ Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 2️⃣ Generate OTP (6 digits)
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 3️⃣ Set reset code and expiry (10 minutes)
    user.resetCode = code;
    user.resetCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // 4️⃣ Send email
    await sendMail(email, "Your password reset code", `Your verification code is ${code}`);

    console.log("✅ Reset code sent to:", email);
    res.json({ message: "Code sent to your email." });

  } catch (err) {
    console.error("❌ send-reset-code error:", err);
    res.status(500).json({ error: "Server error while sending reset code." });
  }
});


// POST /auth/verify-reset-code
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    console.log("🧾 Received verify-reset-code body:", req.body);
    console.log("🔑 New plain password:", newPassword);
   



    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Missing email, otp, or new password." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found." });

    if (String(user.resetCode) !== String(otp)) {
      return res.status(400).json({ error: "Invalid verification code." });
    }

    if (Date.now() > user.resetCodeExpiry) {
      return res.status(400).json({ error: "Code expired. Please request a new one." });
    }

    // ✅ Explicitly hash new password
    user.password = newPassword;


    // Clear reset fields
    user.resetCode = null;
    user.resetCodeExpiry = null;
    await user.save();

    console.log("✅ Password reset successful for", email);
    res.json({ message: "Password updated successfully." });

  } catch (err) {
    console.error("❌ verify-reset-code error:", err);
    res.status(500).json({ error: "Server error while verifying reset code." });
  }
});





module.exports = router;