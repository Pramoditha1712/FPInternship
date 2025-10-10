const Internship = require('../models/Internship');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD
  }
});

async function sendFeedbackEmailReminders() {
  const today = new Date();
  const internships = await Internship.find({ endingDate: { $lte: today } });
  const feedbacks = await Feedback.find({});
  const remindersSent = [];

  for (let internship of internships) {
    const existingFeedback = feedbacks.find(fb =>
      fb.rollNo === internship.rollNo &&
      fb.internshipID?.toString() === internship._id.toString()
    );

    if (!existingFeedback) {
      const user = await User.findOne({ rollNo: internship.rollNo });
      if (!user) continue;

      const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: user.email,
        subject: 'Feedback Reminder for Internship',
        text: `Hi ${user.name},

Hope you’re doing well!

This is a gentle reminder to submit your feedback for your recently completed internship at ${internship.organizationName}. Your feedback helps us improve the internship experience.

Please login to your portal and fill the feedback form.

Regards,
Internship Cell`
      };

      try {
        await transporter.sendMail(mailOptions);
        remindersSent.push({ email: user.email, name: user.name });
        console.log(`✅ Feedback reminder sent to ${user.email}`);
      } catch (err) {
        console.error(`❌ Error sending to ${user.email}:`, err.message);
      }
    }
  }

  return remindersSent;
}

module.exports = { sendFeedbackEmailReminders };
