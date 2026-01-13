const nodemailer = require('nodemailer');

// Create connection to Gmail (or another mail service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your email address
    pass: process.env.EMAIL_PASS, // your app password (not your normal password)
  },
});

transporter.verify((err) => {
  if (err) console.error("❌ Mail error:", err);
  else console.log("✅ Mail server ready");
});

// Function to send the mail
async function sendMail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: `"CSE Internship Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err; // ✅ IMPORTANT
  }
}

module.exports = sendMail;
