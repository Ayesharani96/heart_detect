const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { verifyToken } = require('../middleware/authMiddleware');
const Report = require('../models/Report');

const ensureDir = p => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); };
const uploadsDir = path.join(__dirname, '..', 'uploads', 'reports');
ensureDir(uploadsDir);

// Multer (for multipart)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({ storage });

// POST /api/reports  (supports base64 or multipart)
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { reportName, reportType, imageBase64 } = req.body;
    if (!reportName || !reportType) {
      return res.status(400).json({ message: 'reportName and reportType are required' });
    }
    if (!['ECG', 'ETT', 'Echo'].includes(reportType)) {
      return res.status(400).json({ message: 'Invalid reportType' });
    }

    let imagePath = null;
    let base64ToStore = null;

    if (req.file) {
      // multipart upload
      imagePath = `/uploads/reports/${req.file.filename}`;
    } else if (imageBase64) {
      // base64 upload
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.png`;
      const filePath = path.join(uploadsDir, filename);
      const b64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(filePath, b64, 'base64');
      imagePath = `/uploads/reports/${filename}`;
      base64ToStore = imageBase64.length > 500000 ? undefined : imageBase64; // optional: avoid huge docs
    } else {
      return res.status(400).json({ message: 'No image provided (file or imageBase64)' });
    }

    const report = await Report.create({
      userId: req.user.id,
      reportName,
      reportType,
      imagePath,
      imageBase64: base64ToStore,
      date: new Date()
    });

    res.status(201).json({ message: 'Report saved', report });
  } catch (e) {
    console.error('Report upload error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reports/history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const list = await Report.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(list);
  } catch (e) {
    console.error('Report history error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
