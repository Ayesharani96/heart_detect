const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// =============================
// 🔹 Show reset form (GET)
// =============================
router.get('/:token', async (req, res) => {
  const { token } = req.params;

  console.log("🔑 Incoming token:", token); // Debug log

  const user = await User.findOne({
    resetPasswordToken: token, // must match exactly
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    console.log("❌ No user found with this token or token expired");
    return res.send('<h2>Invalid or expired token</h2>');
  }

  res.send(`
    <form action="/api/reset-password/${token}" method="POST">
      <h2>Reset Password</h2>
      <input type="password" name="password" placeholder="New Password" required /><br><br>
      <input type="password" name="confirmPassword" placeholder="Confirm Password" required /><br><br>
      <button type="submit">Update Password</button>
    </form>
  `);
});

// =============================
// 🔹 Handle password reset (POST)
// =============================
router.post('/:token', express.urlencoded({ extended: true }), async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  console.log("🔑 Reset attempt with token:", token); // Debug log

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    console.log("❌ Invalid or expired token on POST");
    return res.send('<h2>Invalid or expired token</h2>');
  }

  if (password !== confirmPassword) {
    return res.send('<h2>Passwords do not match</h2>');
  }

  // ✅ Hash new password
  user.password = await bcrypt.hash(password, 10);

  // ✅ Clear reset fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.send('<h2>Password updated successfully! You can now login in the app.</h2>');
});

module.exports = router;
