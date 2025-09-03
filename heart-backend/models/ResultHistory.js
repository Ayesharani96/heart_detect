const mongoose = require('mongoose');

const ResultHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportName: { type: String, required: true },
  prediction: { type: String, required: true },       // "Heart Disease" or "No Heart Disease"
  risk: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'], 
    required: true 
  },
  recommendation: { type: String, required: true },
  pdfPath: { type: String, required: true },          // path to generated PDF file
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ResultHistory', ResultHistorySchema);
