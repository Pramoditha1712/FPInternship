require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const adminID = process.env.ADMIN_ID;
const name = process.env.ADMIN_NAME;
const email = process.env.ADMIN_EMAIL;
const phoneNo = process.env.ADMIN_PHONE;
const department = process.env.ADMIN_DEPT;
const password = process.env.ADMIN_PASSWORD;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('MongoDB connected');

  const existingAdmin = await Admin.findOne({ adminID });
  if (existingAdmin) {
    console.log('Admin with this ID already exists.');
    process.exit(0);
  }

  const newAdmin = new Admin({
    adminID,
    name,
    email,
    phoneNo,
    department,
    password, 
  });

  await newAdmin.save();
  console.log('Admin user created successfully.');
  process.exit(0);
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
