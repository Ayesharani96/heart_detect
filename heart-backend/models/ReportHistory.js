const mongoose = require('mongoose');

const ReportHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportName: { type: String, required: true },
  reportType: { 
    type: String, 
    enum: ['ECG', 'ETT', 'Echo'], 
    required: true 
  },
  imagePath: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReportHistory', ReportHistorySchema);
