const express = require("express");
const router = express.Router();
const { saveResult, getUserResults, uploadResult } = require("../controllers/resultController");
const { verifyToken } = require("../middleware/authMiddleware");
const multer = require("multer");

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// =============================
// Save text-only heart result
// =============================
router.post("/save", verifyToken, saveResult);

// =============================
// Get all results for logged-in user
// =============================
router.get("/my-results", verifyToken, getUserResults);

// =============================
// Upload report with multiple images + text result
// =============================
router.post("/upload", verifyToken, upload.array("images", 5), uploadResult);

module.exports = router;
