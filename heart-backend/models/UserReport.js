const mongoose = require('mongoose');

const UserReportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  vitalsId: { type: String, required: true },
  reportType: { type: String, required: true },
  images: [{ type: String }],
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserReport', UserReportSchema);
