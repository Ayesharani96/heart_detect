const express = require("express");
const router = express.Router();
const multer = require("multer");
const { verifyToken } = require("../middleware/authMiddleware");
const Report = require("../models/Report");

// ✅ Store files in memory (for direct MongoDB save or sending to Colab)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// -------------------------------
// Save report with optional images
// -------------------------------
router.post('/', verifyToken, upload.array("images", 5), async (req, res) => {
  try {
    const { reportName, reportType, risk, recommendation, finalProbability, userData } = req.body;

    if (!reportName || reportName.trim() === '') {
      return res.status(400).json({ error: 'Report name is required' });
    }

    // ✅ Process uploaded images
    const images = req.files ? req.files.map(file => ({
      data: file.buffer,
      base64: file.buffer.toString("base64"),
      contentType: file.mimetype,
    })) : [];

    const newReport = new Report({
      userId: req.user.id,
      reportName,
      reportType: reportType || "General",
      risk,
      recommendation,
      finalProbability,
      userData,
      images
    });

    await newReport.save();

    res.status(201).json({ message: "Report saved successfully", report: newReport });
  } catch (err) {
    console.error("Save report error:", err);
    res.status(500).json({ error: "Server error while saving report" });
  }
});

module.exports = router;
