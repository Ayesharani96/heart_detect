const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');
const UserReport = require('../models/UserReport'); // Create this model

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post('/', verifyToken, upload.array('images', 5), async (req, res) => {
  try {
    const { vitalsId, reportType } = req.body;
    if (!vitalsId || !reportType) return res.status(400).json({ message: 'vitalsId and reportType required' });

    const images = req.files.map(f => f.filename);

    const report = new UserReport({
      userId: req.user.id,
      vitalsId,
      reportType,
      images,
      date: new Date(),
    });

    await report.save();
    res.status(201).json({ message: `${reportType} uploaded successfully` });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
