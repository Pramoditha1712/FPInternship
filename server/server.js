require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');

const { sendFeedbackEmailReminders } = require('./utils/reminderEmailService');
const adminRoutes = require('./routes/adminRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const authRoutes = require('./routes/authRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const userRoutes = require('./routes/UserRoutes');
const guestRoutes = require('./routes/guestRoutes');
const Admin = require('./models/Admin');

const app = express();

// ✅ Proper CORS setup — must be first
const allowedOrigins = [
  'http://localhost:3131',  // local frontend
  'https://www.cseinterns.vjstartup.com', // deployed frontend
  'https://hub.vjstartup.com',   
  
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));



// Parse JSON
app.use(express.json());

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unexpected Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Schedule reminder emails
cron.schedule('0 10 * * 1,4', async () => {
  console.log('⏰ Running feedback reminder email job...');
  await sendFeedbackEmailReminders();
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => { 
  console.log("MongoDB connected");

  const existingGuest = await Admin.findOne({ adminID: 'Guest' });
  if (existingGuest) {
    console.log('');
  } else {
    const guestAdmin = new Admin({
      adminID: process.env.GUEST_ID,
      name: process.env.GUEST_NAME,
      password: process.env.GUEST_PASSWORD, // hash in production
    });

    await guestAdmin.save();
    console.log('Guest user added successfully');
  }
})
.catch((err) => console.log('MongoDB Error:', err));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/guest', guestRoutes);

const PORT = process.env.PORT || 6131;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
