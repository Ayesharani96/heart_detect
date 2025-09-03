const Report = require("../models/Report");
const axios = require("axios");
const FormData = require("form-data");

// =============================
// 🔹 Save text-only heart result
// =============================
exports.saveResult = async (req, res) => {
  try {
    const { reportName, reportType, bpm, status, age, weight, bp, sugar, cholesterol } = req.body;
    const userId = req.user.id;

    if (!reportName || !reportType || !bpm || !status || !age || !weight || !bp || !sugar || !cholesterol) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const textResult = { reportName, reportType, bpm, status, age, weight, bp, sugar, cholesterol };

    const newReport = new Report({
      userId,
      reportName,
      reportType,
      result: { textResult },
      images: [], // no images for text-only result
    });

    await newReport.save();

    res.status(201).json({
      message: "Text result saved successfully",
      reportId: newReport._id,
      finalResult: newReport.result,
    });
  } catch (err) {
    console.error("Save result error:", err.message);
    res.status(500).json({ message: "Failed to save result", error: err.message });
  }
};

// =============================
// 🔹 Get all results for logged-in user
// =============================
exports.getUserResults = async (req, res) => {
  try {
    const userId = req.user.id;
    const results = await Report.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ results });
  } catch (err) {
    console.error("Get results error:", err.message);
    res.status(500).json({ message: "Failed to fetch results", error: err.message });
  }
};

// =============================
// 🔹 Upload report with multiple images + text result
// =============================
exports.uploadResult = async (req, res) => {
  try {
    const { reportName, reportType, bpm, status, age, weight, bp, sugar, cholesterol } = req.body;
    const userId = req.user.id;

    // Validate images
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Please upload at least one image" });
    }

    // Prepare form-data for Colab
    const formData = new FormData();
    req.files.forEach((file, idx) => {
      formData.append(`image${idx + 1}`, file.buffer, { filename: file.originalname });
    });

    formData.append("age", age);
    formData.append("weight", weight);
    formData.append("bp", bp);
    formData.append("sugar", sugar);
    formData.append("cholesterol", cholesterol);

    // Colab endpoint (update if needed)
    const colabUrl = " https://swift-stars-refuse.loca.lt/predict";

    // Send images + text to Colab
    const response = await axios.post(colabUrl, formData, {
      headers: formData.getHeaders(),
      timeout: 120000, // 2 minutes
    });

    const colabResult = response.data;

    const textResult = { reportName, reportType, bpm, status, age, weight, bp, sugar, cholesterol };
    const summary = `${status} - Disease Probability: ${colabResult?.disease_probability || "Unknown"}`;

    // Save images in MongoDB
    const images = req.files.map((file) => ({
      data: file.buffer,
      base64: file.buffer.toString("base64"),
      contentType: file.mimetype,
    }));

    const newReport = new Report({
      userId,
      reportName,
      reportType,
      result: { textResult, colabResult, summary },
      images,
    });

    await newReport.save();

    res.status(201).json({
      message: "Report uploaded successfully",
      reportId: newReport._id,
      previewCount: images.length,
      finalResult: newReport.result,
    });
  } catch (err) {
    console.error("Upload error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to upload report", error: err.message });
  }
};
