const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },  // ✅ Add this
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
});

module.exports = mongoose.model('User', userSchema);
