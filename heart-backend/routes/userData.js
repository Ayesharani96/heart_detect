const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const UserVitals = require('../models/UserVitals');

// ==============================
// POST /api/userData - Save user vitals
// ==============================
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      age,
      gender,
      weight,
      height,
      smokingStatus,
      alcoholConsumption,
      cholesterolLevel,
      bloodPressure,
      fastingBloodSugar,
      chestPainType,
    } = req.body;

    // Validate required fields
    if (
      !age || !gender || !weight || !height || !smokingStatus ||
      !alcoholConsumption || !cholesterolLevel || !bloodPressure ||
      !fastingBloodSugar || !chestPainType
    ) {
      return res.status(400).json({ message: 'All fields are required', success: false });
    }

    const vitals = new UserVitals({
      userId: req.user.id,
      age,
      gender,
      weight,
      height,
      smokingStatus,
      alcoholConsumption,
      cholesterolLevel,
      bloodPressure,
      fastingBloodSugar,
      chestPainType,
    });

    await vitals.save();

    res.status(201).json({ message: 'Vitals saved successfully', success: true, vitalsId: vitals._id });
  } catch (err) {
    console.error('Error saving vitals:', err);
    res.status(500).json({ message: 'Server error', success: false });
  }
});

// ==============================
// GET /api/userData - Fetch latest vitals
// ==============================
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch the latest vitals entry for the user
    const latestVitals = await UserVitals.findOne({ userId }).sort({ createdAt: -1 });

    if (!latestVitals) {
      return res.status(404).json({ message: 'No vitals found for this user' });
    }

    res.json({ vitals: latestVitals });
  } catch (err) {
    console.error('Error fetching vitals:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
