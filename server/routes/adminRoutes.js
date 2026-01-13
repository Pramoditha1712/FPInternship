const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Internship = require('../models/Internship');
const Feedback = require('../models/Feedback');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs');
const { normalizeCompanyName } = require('../service/helper');

const sendMail = require("../utils/forgotpasswordEmailservice");

console.log("✅ adminRoutes.js loaded");


// Converts DB Date object into intended DD/MM interpretation



// Basic test route for admin
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json({ message: "admin", payload: admins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/internships/academic-years', async (req, res) => {
  try {
    const internships = await Internship.find(
      { startingDate: { $exists: true, $ne: null } },
      { startingDate: 1 }
    );

    const yearSet = new Set();

    internships.forEach(i => {
      const date = new Date(i.startingDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      // June–Dec → same year
      // Jan–May → previous year
      const academicStartYear = month >= 6 ? year : year - 1;

      yearSet.add(academicStartYear);
    });

    const result = [...yearSet]
      .sort()
      .map(y => ({
        label: `${y}-${(y + 1).toString().slice(-2)}`,
        value: y
      }));

    res.json(result);
  } catch (err) {
    console.error('Academic years error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});


router.get("/internships/filter", async (req, res) => {
  try {
    const {
      type,
      semester,
      section,
      branch,
      year,
      month,
      endYear,
      endMonth,
      company,
    } = req.query;

    const today = new Date();
    const mongoQuery = {};

    // ---------------- STATUS FILTER ----------------
    if (type === "ongoing") {
      mongoQuery.startingDate = { $lte: today };
      mongoQuery.endingDate = { $gte: today };
    } else if (type === "past") {
      mongoQuery.endingDate = { $lt: today };
    } else if (type === "future") {
      mongoQuery.startingDate = { $gt: today };
    }

// ---------------- ACADEMIC YEAR + MONTH FILTER (SAFE) ----------------

// ---------------- ACADEMIC YEAR + MONTH FILTER (NON-CONFLICTING) ----------------
if (req.query.year && req.query.year !== "") {
  const academicStartYear = parseInt(req.query.year, 10);

  if (!Number.isNaN(academicStartYear)) {
    let rangeStart;
    let rangeEnd;

    if (req.query.month && req.query.month !== "") {
      const m = parseInt(req.query.month, 10);
      if (!Number.isNaN(m)) {

        // 🔑 decide correct calendar year
        const calendarYear = m >= 6
          ? academicStartYear        // Jun–Dec
          : academicStartYear + 1;   // Jan–May

        rangeStart = new Date(calendarYear, m - 1, 1);
        rangeEnd   = new Date(calendarYear, m, 0);
      }
    } else {
      // Full academic year: June → May
      rangeStart = new Date(academicStartYear, 5, 1);      // June 1, 2025
      rangeEnd   = new Date(academicStartYear + 1, 4, 31); // May 31, 2026
    }

    if (rangeStart && rangeEnd) {
      mongoQuery.$and = mongoQuery.$and || [];
      mongoQuery.$and.push({
        startingDate: {
          $gte: rangeStart,
          $lte: rangeEnd
        }
      });
    }
  }
}



    // ---------------- COMPANY FILTER ----------------
    if (company) {
      mongoQuery.organizationName = new RegExp(company, "i");
    }

    console.log("Final Mongo Query:", JSON.stringify(mongoQuery, null, 2));

    const internships = await Internship.find(mongoQuery).lean();
    

  

    // ---------------- STUDENT FILTER ----------------
    const knownBranches = ["CSE", "CSBS"];
    const studentFilter = {};

    if (semester) studentFilter.semester = semester;
    if (section) studentFilter.section = section;

    if (branch) {
      studentFilter.branch =
        branch === "Other" ? { $nin: knownBranches } : branch;
    }

    const students = await User.find(studentFilter);
    const studentMap = {};
    students.forEach((s) => (studentMap[s.rollNo] = s));

    // ---------------- FINAL RESPONSE ----------------
    const final = internships
      .filter((i) => studentMap[i.rollNo])
      .map((i) => {
        const st = studentMap[i.rollNo];
        const start = new Date(i.startingDate);
        const end = new Date(i.endingDate);

        let status =
          today < start ? "future" : today > end ? "past" : "ongoing";

        return {
          ...i,
          status,
          semester: st.semester,
          branch: st.branch,
          section: st.section,
        };
      });

    res.json(final);
  } catch (err) {
    console.error("Filter Error:", err);
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

// Get x with optional semester and section filters
router.get('/Users', async (req, res) => {
  try {
    const { search, semester, branch, section, academicYear } = req.query;

    const userQuery = {};

    /* ========= SEARCH ========= */
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNo: { $regex: search, $options: "i" } }
      ];
    }

    if (semester) userQuery.semester = semester;
    if (section) userQuery.section = section;

    const knownBranches = ["CSE", "CSBS"];
    if (branch) {
      userQuery.branch =
        branch === "OTHER" ? { $nin: knownBranches } : branch;
    }

    /* ========= ACADEMIC YEAR FILTER ========= */
    if (academicYear) {
      const y = parseInt(academicYear, 10);

      const start = new Date(y, 5, 1);       // June 1
      const end   = new Date(y + 1, 4, 31);  // May 31

      const internships = await Internship.find({
        startingDate: { $gte: start, $lte: end }
      }).select("rollNo");

      const rollNos = [...new Set(internships.map(i => i.rollNo))];

      if (rollNos.length === 0) {
        return res.json([]); // no students
      }

      userQuery.rollNo = { $in: rollNos };
    }

    const users = await User.find(userQuery);
    res.json(users);

  } catch (err) {
    console.error("Users fetch error:", err);
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
    const { status, academicYear, section } = req.query;

    const internships = await Internship.find();
    const users = await User.find();

    const userMap = {};
    users.forEach(u => {
      if (u.rollNo) {
        userMap[u.rollNo.toUpperCase().trim()] = u;
      }
    });

    const today = new Date();
    const knownBranches = ["CSE", "CSBS"];
    const branchCounts = {};
    const semesterCounts = {};

    knownBranches.forEach(b => (branchCounts[b] = 0));
    for (let i = 1; i <= 8; i++) semesterCounts[i] = 0;

    // ✅ Academic year window
    let academicStart = null;
    let academicEnd = null;

    if (academicYear) {
      const [startYear, endYY] = academicYear.split("-");
      const endYear = Number(`20${endYY}`);

      academicStart = new Date(`${startYear}-06-01T00:00:00.000Z`);
      academicEnd = new Date(`${endYear}-05-31T23:59:59.999Z`);
    }

    internships.forEach(i => {
      const roll = i.rollNo?.toUpperCase().trim();
      const user = userMap[roll];
      if (!user) return;

      const start = new Date(i.startingDate);
      const end = new Date(i.endingDate);

      // ✅ Status filter
      let internshipStatus = "";
      if (today < start) internshipStatus = "future";
      else if (today > end) internshipStatus = "past";
      else internshipStatus = "ongoing";

      if (status !== "all" && status && internshipStatus !== status) return;
      if (section && user.section !== section) return;

      // ✅ Academic year filter (FIX)
      if (academicStart && academicEnd) {
        if (start < academicStart || start > academicEnd) return;
      }

      const branch = user.branch;
      const semester = user.semester;

      if (knownBranches.includes(branch)) {
        branchCounts[branch]++;
      }

      if (semesterCounts[semester] !== undefined) {
        semesterCounts[semester]++;
      }
    });

    res.json({
      branchData: Object.entries(branchCounts).map(([branch, count]) => ({
        branch,
        count
      })),
      semesterData: Object.entries(semesterCounts).map(([semester, count]) => ({
        semester,
        count
      }))
    });

  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

function getAcademicYearFromMongoDate(dbDate) {
  if (!(dbDate instanceof Date) || isNaN(dbDate)) return null;

  const year = dbDate.getFullYear();
  const month = dbDate.getMonth() + 1; // 1 = Jan, 7 = July

  // June (6) to December (12) → currentYear-nextYear
  if (month >= 6) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  }

  // January (1) to May (5) → previousYear-currentYear
  return `${year - 1}-${year.toString().slice(-2)}`;
}
router.get('/yearly-analytics', async (req, res) => {
  try {
    const internships = await Internship.find({
      startingDate: { $exists: true, $ne: null }
    });

    const analytics = {};

    internships.forEach(doc => {
      const academicYear = getAcademicYearFromMongoDate(doc.startingDate);
      if (!academicYear) return;

      if (!analytics[academicYear]) {
        analytics[academicYear] = {
          students: new Set(),
          companies: new Set()
        };
      }

      if (doc.rollNo) {
        analytics[academicYear].students.add(doc.rollNo);
      }

      if (doc.organizationName) {
        const norm = normalizeCompanyName(doc.organizationName);
        if (norm) analytics[academicYear].companies.add(norm);
      }
    });

    const result = Object.keys(analytics)
      .sort()
      .map(year => ({
        academicYear: year,
        students: analytics[year].students.size,
        companies: analytics[year].companies.size
      }));

    res.json(result);

  } catch (err) {
    console.error("Yearly Analytics Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
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
    const admin = await Admin.findOne({ adminID });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // later replace with JWT
    res.json({
      token: 'dummy-token-for-now',
      adminID: admin.adminID
    });

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

router.post("/send-otp", async (req, res) => {
  try {
    const { adminID } = req.body;
 

    if (!adminID) {
      return res.status(400).json({ error: "Admin ID is required" });
    }

    const admin = await Admin.findOne({ adminID });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    admin.otp = {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    };
    await admin.save();

    // ✅ EXPLICIT receiver
    console.log("DEBUG EMAIL_USER:", process.env.EMAIL_USER);
console.log("DEBUG EMAIL_PASS EXISTS:", !!process.env.EMAIL_PASS);

await sendMail(
  process.env.EMAIL_USER,
  "Admin Password Reset OTP",
  `Admin ID: ${adminID}\n\nYour OTP is ${otp}. Valid for 10 minutes.`
);


    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});





router.post("/reset-password", async (req, res) => {
  try {
    const { adminID, otp, newPassword } = req.body;

    const admin = await Admin.findOne({ adminID });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    if (!admin.otp || Date.now() > admin.otp.expiresAt) {
      return res.status(400).json({ error: "OTP expired. Request again." });
    }

    if (admin.otp.code !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    admin.password = newPassword; // auto-hashed
    admin.otp = undefined;
    await admin.save();

    res.json({ message: "Admin password reset successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});







module.exports = router;