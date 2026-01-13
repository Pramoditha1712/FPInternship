const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema({
  adminID: String,
  name: String,
  email: String,
  phoneNo: Number,
  department: String,
  password: String,

  otp: {
    code: String,
    expiresAt: Date,
  },
});

/* 🔐 Hash password */
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* 🔑 Compare password */
AdminSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Admin", AdminSchema, "Admins");
