const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  reportName: { type: String, required: true },
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
});

module.exports = mongoose.model('UserData', userDataSchema);
