// routes/predict.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyToken } = require("../middleware/authMiddleware");
const { predictHeartDisease } = require("../ml/predict_combined");
const Prediction = require("../models/Prediction");

// Ensure uploads dir
const uploadsDir = path.join(__dirname, "..", "uploads", "predict");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage });

// Helper funcs
function ynTo01(v) {
  if (v == null) return 0;
  const s = String(v).trim().toLowerCase();
  return s === "yes" || s === "y" || s === "true" || s === "1" ? 1 : 0;
}
function genderTo01(v) {
  if (!v) return 0;
  const s = String(v).trim().toLowerCase();
  if (s === "male" || s === "m") return 1;
  if (s === "female" || s === "f") return 0;
  return 0;
}
function toNumber(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

// ==========================
// 🔹 POST /api/predict
// ==========================
router.post("/", verifyToken, upload.array("images"), async (req, res) => {
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
      reportName,
      userData,
    } = req.body;

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Extract systolic BP
    let systolicBP = 0;
    if (typeof bloodPressure === "string" && bloodPressure.includes("/")) {
      systolicBP = toNumber(bloodPressure.split("/")[0]);
    } else {
      systolicBP = toNumber(bloodPressure);
    }

    // Normalize categorical -> numeric
    const textPayload = {
      age: toNumber(age),
      gender: genderTo01(gender),
      weight: toNumber(weight),
      height: toNumber(height),
      smokingStatus: ynTo01(smokingStatus),
      alcoholConsumption: ynTo01(alcoholConsumption),
      cholesterol: toNumber(cholesterolLevel),
      bp: systolicBP,
      sugar: ynTo01(fastingBloodSugar),
      chestPainType: ynTo01(chestPainType),
    };

    const imagePaths = (req.files || []).map(f => path.join(uploadsDir, f.filename));

    const inputData = {
      text: textPayload,
      images: imagePaths,
      extraUserData: userData ? (() => { try { return JSON.parse(userData); } catch { return {}; }})() : {},
    };

    // Run Python prediction
    const raw = await predictHeartDisease(inputData);

    // Parse prediction
    const textProb = typeof raw.text_prob === "number" ? raw.text_prob : 0;
    const imageProb = typeof raw.image_prob === "number" ? raw.image_prob : null;
    let finalProb = (typeof raw.final_prob === "number")
      ? raw.final_prob
      : (imageProb != null ? (textProb + imageProb) / 2 : textProb);

    finalProb = Math.max(0, Math.min(1, Number(finalProb)));
    const risk = raw.risk || raw.final_risk ||
      (finalProb >= 0.7 ? "High" : finalProb >= 0.4 ? "Medium" : "Low");

    let recommendation = "✅ Maintain a healthy lifestyle.";
    if (risk === "High") recommendation = "⚠️ Consult a cardiologist immediately.";
    else if (risk === "Medium") recommendation = "⚠️ Adopt a healthy lifestyle and routine checkups.";

    // Save to MongoDB
    const newPrediction = new Prediction({
      userId,
      reportName: (reportName || "Untitled Report").trim(),
      risk,
      finalProbability: Number(finalProb.toFixed(2)),
      textProbability: Number(textProb.toFixed(2)),
      imageProbability: imageProb != null ? Number(imageProb.toFixed(2)) : undefined,
      recommendation,
      images: (req.files || []).map(f => `/uploads/predict/${f.filename}`),
    });
    await newPrediction.save();

    // Response
    res.json({
      result: risk === "High" ? "Heart Disease" : "No Heart Disease",
      risk,
      finalProbability: newPrediction.finalProbability,
      textProbability: newPrediction.textProbability,
      imageProbability: newPrediction.imageProbability,
      recommendation,
      reportName: newPrediction.reportName,
      userId,
      savedImages: newPrediction.images,
    });
  } catch (err) {
    console.error("Prediction error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================
// 🔹 GET /api/predict/history
// ==========================
router.get("/history", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const predictions = await Prediction.find({ userId }).sort({ createdAt: -1 });
    res.json(predictions);
  } catch (err) {
    console.error("Fetch history error:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// 🔹 Add a test route to debug connectivity
router.get("/test", (req, res) => {
  res.json({ message: "✅ Predict route is working" });
});

module.exports = router;
