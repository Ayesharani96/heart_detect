// routes/resultRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const resultController = require("../controllers/resultController");
const { verifyToken } = require("../middleware/authMiddleware");
const Result = require("../models/Result");

// 🔹 Multer setup for file uploads (in-memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🔹 Ensure results PDF directory exists
const ensureDir = (p) => {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
};
const resultsDir = path.join(__dirname, "..", "uploads", "results");
ensureDir(resultsDir);

// ================= ROUTES =================

// 📌 Upload result with image
router.post(
  "/upload",
  verifyToken,
  upload.single("image"),
  resultController.uploadResult
);

// 📌 Save prediction result
router.post("/save", verifyToken, resultController.saveResult);

// 📌 Get result history
router.get("/history", verifyToken, resultController.getUserResults);

// 📌 Generate PDF for a specific result
router.post("/:id/pdf", verifyToken, async (req, res) => {
  try {
    const result = await Result.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!result) return res.status(404).json({ message: "Result not found" });

    const filename = `${result._id}.pdf`;
    const filePath = path.join(resultsDir, filename);

    // 🔹 Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text("❤️ Heart Disease Risk Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`📄 Report Name: ${result.reportName}`);
    doc.text(`🧑 User ID: ${result.userId}`);
    doc.text(`⚠️ Risk Level: ${result.riskLevel}`);
    doc.text(`📊 Score: ${result.score || "N/A"}`);
    doc.moveDown().text(`💡 Recommendation: ${result.recommendation || "—"}`);

    doc.end();

    const pdfPath = `/uploads/results/${filename}`;
    result.pdfPath = pdfPath;
    await result.save();

    res.json({ message: "PDF generated", pdfPath });
  } catch (e) {
    console.error("PDF Error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
