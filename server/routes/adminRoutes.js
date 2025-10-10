const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Internship = require('../models/Internship');
const Feedback = require('../models/Feedback');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { normalizeCompanyName } = require('../service/helper');

// Basic test route for admin
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json({ message: "admin", payload: admins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Filter internships with query params including company acronym matching
router.get('/internships/filter', async (req, res) => {
  const {
    type,
    semester,
    section,
    branch,
    year,        // start year
    month,       // start month
    endYear,     // end year
    endMonth,    // end month
    company
  } = req.query;

  const today = new Date();

  const knownBranches = ["CSE", "CSBS"];

  const matchesAcronym = (query, name) => {
    const acronym = name
      .split(/\s+/)
      .map(word => word[0].toUpperCase())
      .join('');
    return acronym.includes(query.toUpperCase());
  };

  try {
    let dateQuery = {};

    // 🔹 Add status-based filtering
    if (type === 'ongoing') {
      dateQuery = {
        startingDate: { $lte: today },
        endingDate: { $gte: today }
      };
    } else if (type === 'past') {
      dateQuery = {
        endingDate: { $lt: today }
      };
    } else if (type === 'future') {
      dateQuery = {
        startingDate: { $gt: today }
      };
    }

    // 🔹 Fetch all internships based on type filter
    let internships = await Internship.find(dateQuery);

    // 🔹 Apply start date range (FROM)
    if (year && month) {
      const fromDate = new Date(Number(year), Number(month) - 1, 1);
      internships = internships.filter(i => new Date(i.startingDate) >= fromDate);
    }

    // 🔹 Apply end date range (TO)
    if (endYear && endMonth) {
      const toDate = new Date(Number(endYear), Number(endMonth), 0); // last day of end month
      internships = internships.filter(i => new Date(i.startingDate) <= toDate);
    }



    // 🔹 Filter by company name or acronym
    if (company) {
      const regex = new RegExp(company, 'i');
      internships = internships.filter(i =>
        regex.test(i.organizationName) || matchesAcronym(company, i.organizationName)
      );
    }

    // 🔹 Fetch all students
    let students = await User.find();

    // 🔹 Apply student filters
    if (semester) {
      students = students.filter(s => s.semester === semester);
    }

    if (branch) {
      if (branch === "Other") {
        students = students.filter(s => !knownBranches.includes(s.branch));
      } else {
        students = students.filter(s => s.branch === branch);
      }
    }

    if (section) {
      students = students.filter(s => s.section === section);
    }

    // 🔹 Build rollNo map for quick lookup
    const studentMap = {};
    students.forEach(s => {
      studentMap[s.rollNo] = s;
    });

    // 🔹 Final matching
    const filteredInternships = internships
      .filter(i => studentMap[i.rollNo])
      .map(i => {
        const student = studentMap[i.rollNo];
        const start = new Date(i.startingDate);
        const end = new Date(i.endingDate);
        let status = "";

        if (today < start) status = "future";
        else if (today > end) status = "past";
        else status = "ongoing";

        return {
          ...i.toObject(),
          status,
          semester: student.semester || null,
          branch: student.branch || null,
          section: student.section || null
        };
      });

    res.json(filteredInternships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update internship status
router.patch('/internships/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await Internship.findByIdAndUpdate(id, { status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Users with optional semester and section filters
router.get('/Users', async (req, res) => {
  try {
    const { semester, branch, section } = req.query;

    const query = {};
    if (semester) query.semester = semester;

    const knownBranches = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AI&ML", "AI&DS", "CSBS", "IoT", "AIDS"];
    if (branch) {
      if (branch === "OTHER") {
        query.branch = { $nin: knownBranches };
      } else {
        query.branch = branch;
      }
    }

    if (section) {
      query.section = section;
    }

    const users = await User.find(query);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Dashboard stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInternships = await Internship.countDocuments();
    const totalFeedbacks = await Feedback.countDocuments();
    const pendingInternships = await Internship.countDocuments({ status: 'Pending' });

    res.json({
      totalUsers,
      totalInternships,
      totalFeedbacks,
      pendingInternships,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all internships
router.get('/internships', async (req, res) => {
  try {
    const internships = await Internship.find();
    res.json(internships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all feedbacks
// Get all feedbacks
router.get('/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }); // latest first
    res.json(feedbacks);
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

// Submit feedback with basic validation
router.post('/feedbacks', async (req, res) => {
  try {
    const {
      rollNo,
      skillsLearned,
      technicalSkill,
      communicationSkill,
      teamWork,
      timeManagement,
      overallExperience,
    } = req.body;

    // Basic validation
    if (
      !rollNo ||
      !skillsLearned ||
      !technicalSkill ||
      !communicationSkill ||
      !teamWork ||
      !timeManagement ||
      !overallExperience
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if internship has ended before allowing feedback
    const internship = await Internship.findOne({ rollNo:rollNo });
    if (!internship) {
      return res.status(400).json({ error: 'No internship found for this roll number' });
    }

    const today = new Date();
    const endingDate = new Date(internship.endingDate);

    if (today < endingDate) {
      return res.status(400).json({ error: 'Feedback can only be submitted after the internship ends' });
    }

    const newFeedback = new Feedback({
      rollNo,
      skillsLearned,
      technicalSkill,
      communicationSkill,
      teamWork,
      timeManagement,
      overallExperience,
    });

    await newFeedback.save();

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error('Feedback submission error:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Analytics route: branch & semester counts for internships with optional filters
router.get('/analytics', async (req, res) => {
  try {
    const { status, year, section } = req.query;

    const internships = await Internship.find();
    const users = await User.find();

    const userMap = {};
    users.forEach((u) => {
      if (u.rollNo) {
        userMap[u.rollNo.toUpperCase().trim()] = u;
      }
    });

    const today = new Date();

    const knownBranches = ["CSE", "CSBS"];
    const branchCounts = {};
    const semesterCounts = {};

    // Initialize counts to 0
    knownBranches.forEach(b => branchCounts[b] = 0);
    // branchCounts["Other"] = 0;

    for (let i = 1; i <= 8; i++) {
      semesterCounts[i.toString()] = 0;
    }

    const filtered = internships.filter((i) => {
      const roll = i.rollNo?.toUpperCase().trim();
      const user = userMap[roll];
      if (!user) return false;

      const start = new Date(i.startingDate);
      const end = new Date(i.endingDate);

      let internshipStatus = "";
      if (today < start) internshipStatus = "future";
      else if (today > end) internshipStatus = "past";
      else internshipStatus = "ongoing";

      if (status && status !== "all" && internshipStatus !== status) return false;
      if (year && start.getFullYear().toString() !== year) return false;
      if (section && user.section !== section) return false;

      // Collect into counts
      const branch = user.branch || "Unknown";
      const semester = user.semester || "Unknown";

      if (knownBranches.includes(branch)) {
        branchCounts[branch]++;
      }
      //  else {
      //   branchCounts["Other"]++;
      // }

      if (semester in semesterCounts) {
        semesterCounts[semester]++;
      } else {
        semesterCounts[semester] = 1;
      }

      return true;
    });

    res.json({
      year: year || "All Years",
      branchData: Object.entries(branchCounts).map(([branch, count]) => ({ branch, count })),
      semesterData: Object.entries(semesterCounts).map(([semester, count]) => ({ semester, count }))
    });

  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});


router.get('/yearly-analytics', async (req, res) => {
  const allYears = [2023, 2024, 2025, 2026];
  const result = [];

  // Fetch Company Counts
  const internships = await Internship.find({ startingDate: { $exists: true } });
  const companyMap = {}; // { year: Set of normalized company names }

  internships.forEach(doc => {
    const yr = new Date(doc.startingDate).getFullYear();
    const normName = normalizeCompanyName(doc.organizationName);
    if (!companyMap[yr]) companyMap[yr] = new Set();
    if (normName) companyMap[yr].add(normName);
  });

  // Fetch Students Count per Year
  const studentMap = {}; // { year: count of students placed }

  internships.forEach(doc => {
    const yr = new Date(doc.startingDate).getFullYear();
    if (!studentMap[yr]) studentMap[yr] = new Set();
    studentMap[yr].add(doc.rollNo); // To avoid duplicates
  });

  // Prepare Response
  allYears.forEach(yr => {
    result.push({
      year: yr,
      students: studentMap[yr] ? studentMap[yr].size : 0,
      companies: companyMap[yr] ? companyMap[yr].size : 0
    });
  });

  res.json(result);
});


// Get User + their internships by roll number
router.get('/roll/:rollNo', async (req, res) => {
  try {
    const rollNo = req.params.rollNo.toUpperCase();

    const userData = await User.findOne({ rollNo });
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const internships = await Internship.find({ rollNo });
    const today = new Date();

    const detailedInternships = internships.map((internship) => {
      const start = new Date(internship.startingDate);
      const end = new Date(internship.endingDate);

      let status = "";
      if (today < start) status = "future";
      else if (today > end) status = "past";
      else status = "ongoing";

      return {
        internshipID: internship.internshipID,
        organizationName: internship.organizationName,
        role: internship.role,
        startingDate: internship.startingDate,
        endingDate: internship.endingDate,
        status,
      };
    });

    res.json({
      user: userData,
      internships: detailedInternships
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


// Change from GET to POST
router.post('/login', async (req, res) => {
  const { adminID, password } = req.body;

  try {
    const admin = await Admin.findOne({ adminID, password });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For now, return a simple token (later use JWT)
    res.json({ token: 'dummy-token-for-now', adminID: admin.adminID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



router.get('/add', async (req, res) => {

  try {
    const admin = await Admin.find();
      return res.status(400).json({admin:{admin} });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error'.admin);
  }
});

router.delete("/internships/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Internship.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Internship not found" });
    res.json({ message: "Internship deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/roll/:rollNo', async (req, res) => {
  const { rollNo } = req.params;
  const { email, semester, section, branch } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { rollNo },
      { email, semester, section, branch },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "Student not found" });

    res.json(user);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
router.get('/remind-feedback', async (req, res) => {
  try {
    const sent = await sendFeedbackEmailReminders();
    res.status(200).json({
      message: 'Reminder emails sent successfully.',
      data: sent
    });
  } catch (err) {
    console.error('Email reminder error:', err);
    res.status(500).json({ error: 'Failed to send reminders.' });
  }
});

module.exports = router;