const mongoose = require('mongoose');

const UserVitalsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  smokingStatus: { type: String, required: true },
  alcoholConsumption: { type: String, required: true },
  cholesterolLevel: { type: Number, required: true },
  bloodPressure: { type: String, required: true },
  fastingBloodSugar: { type: String, required: true },
  chestPainType: { type: String, required: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('UserVitals', UserVitalsSchema);
