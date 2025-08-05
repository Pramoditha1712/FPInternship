const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  feedbackID: String,
  internshipID: { type: mongoose.Schema.Types.ObjectId, ref: 'internship' },
  skillsLearned: String,
  technicalSkill: Number,
  communicationSkill: Number,
  teamWork: Number,
  timeManagement: Number,
  rollNo: String,
  overallExperience: String,
});

module.exports = mongoose.model('feedback', FeedbackSchema);