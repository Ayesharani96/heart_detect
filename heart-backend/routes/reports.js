const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const { verifyToken } = require("../middleware/authMiddleware");

// =============================
// CREATE / SAVE report
// =============================
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      reportName,
      reportType,
      risk,
      recommendation,
      finalProbability,
      userData,
      rawResult,
      images,
    } = req.body;

    if (!reportName || reportName.trim() === "") {
      return res.status(400).json({ error: "Report name is required" });
    }

    const newReport = new Report({
      userId: req.user.id,
      reportName,
      reportType: reportType || "General",
      risk,
      recommendation,
      finalProbability,
      userData,
      rawResult,
      images: images || [],
    });

    await newReport.save();

    res.status(201).json({
      message: "Report saved successfully",
      report: newReport,
    });
  } catch (err) {
    console.error("Upload/Save report error:", err);
    res.status(500).json({ error: "Server error while saving report" });
  }
});

// =============================
// GET all reports of logged-in user
// =============================
router.get("/", verifyToken, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(reports);
  } catch (err) {
    console.error("Fetch reports error:", err);
    res.status(500).json({ error: "Server error while fetching reports" });
  }
});

// =============================
// GET single report by ID
// =============================
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json(report);
  } catch (err) {
    console.error("Fetch single report error:", err);
    res.status(500).json({ error: "Server error while fetching report" });
  }
});

// =============================
// DELETE report
// =============================
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!report) {
      return res
        .status(404)
        .json({ error: "Report not found or not authorized" });
    }
    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error("Delete report error:", err);
    res.status(500).json({ error: "Server error while deleting report" });
  }
});

module.exports = router;
