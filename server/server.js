const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const adminRoutes = require('./routes/adminRoutes');

const authRoutes = require('./routes/authRoutes');

const internshipRoutes = require('./routes/internshipRoutes');
const userRoutes = require('./routes/UserRoutes')
const guestRoutes=require('./routes/guestRoutes')
const path = require('path');
const Admin = require('./models/Admin');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use((err, req, res, next) => {
  console.error('Unexpected Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

mongoose.connect('mongodb://127.0.0.1:27017/internship', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(
  async() =>{ 
    console.log("MongoDB connected")
    const existingGuest = await Admin.findOne({ adminID: 'Guest' });
    if (existingGuest) {
      console.log('Guest user already exists');
    } else {
      const guestAdmin = new Admin({
        adminID: 'Guest',
        name: 'Guest',
        password: 'Guest@123', // Store hashed password in production
      });

      await guestAdmin.save();
      console.log('Guest user added successfully');
    }
  }
)
  .catch((err) => console.log(err));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/guest',guestRoutes)

const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
