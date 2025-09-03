const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const UserData = require('../models/UserData'); // Create this model

router.post('/save', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = new UserData({ ...req.body, userId });
    await userData.save();
    res.status(201).json({ message: 'User data saved' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save user data', error: err.message });
  }
});

module.exports = router;
