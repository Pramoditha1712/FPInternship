const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Internship = require('../models/Internship');

const JWT_SECRET = process.env.JWT_SECRET;


// Guest login route
router.post('/login', async (req, res) => {
  const { name, password } = req.body;

  try {
    const adminUser = await Admin.findOne({ adminID: name });

    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid guest credentials' });
    }

    // For simplicity, assuming password stored in plain text; otherwise use bcrypt.compare
    if (adminUser.password !== password) {
      return res.status(401).json({ error: 'Invalid guest credentials' });
    }

    const token = jwt.sign({ role: 'guest', name: adminUser.adminID }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  } catch (err) {
    console.error('Guest login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Guest dashboard route
router.get('/guest-dashboard', async (req, res) => {
  try {
    const now = new Date();

    // Find ongoing internships based on starting and ending dates only
    const ongoingInternships = await Internship.find({
      startingDate: { $lte: now },
      endingDate: { $gte: now },
    });

    // Get rollNos of ongoing interns
    const rollNos = ongoingInternships.map(i => i.rollNo);

    // Find Users who are currently interning
    const Users = await User.find({ rollNo: { $in: rollNos } });

    // Create a map of rollNo to internship for quick lookup
    const internshipMap = {};
    ongoingInternships.forEach(internship => {
      internshipMap[internship.rollNo] = internship;
    });

    // Categorize Users by branch and section, including email and organizationName
    const categorized = {};

    Users.forEach(User => {
      const branch = User.branch || 'Unknown';
      const section = User.section || 'Unknown';
      const internship = internshipMap[User.rollNo] || {};

      if (!categorized[branch]) {
        categorized[branch] = {};
      }
      if (!categorized[branch][section]) {
        categorized[branch][section] = [];
      }
      categorized[branch][section].push({
        _id: User._id,
        name: User.name,
        rollNo: User.rollNo,
        email: User.email,
        semester: User.semester,
        organizationName: internship.organizationName || 'N/A',
      });
    });

    res.json({ categorized });
  } catch (err) {
    console.error('Guest dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;