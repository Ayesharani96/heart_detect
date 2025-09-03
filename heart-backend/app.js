// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const os = require("os");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// === Middleware ===
app.use(
  cors({
    origin: "*", // ⚠️ Replace with your frontend domain in production
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "20mb" })); // ✅ Handle JSON + base64 images

// === Import Routes ===
const authRoutes = require("./routes/auth");
const vitalsRoutes = require("./routes/vitals");
const reportsRoutes = require("./routes/reports"); // ✅ reports main
const reportImageRoutes = require("./routes/reportImage");
const resultsRoutes = require("./routes/results");
const predictRoutes = require("./routes/predict");
const resetPasswordRoutes = require("./routes/resetPasswordRoutes");
const userDataRoutes = require("./routes/userData");

// === Register Routes ===
app.use("/api/auth", authRoutes);
app.use("/api/vitals", vitalsRoutes);
app.use("/api/reports", reportsRoutes); // ✅ unified reports
app.use("/api/report-images", reportImageRoutes);
app.use("/api/results", resultsRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/reset-password", resetPasswordRoutes);
app.use("/api/userData", userDataRoutes);

// === Root Endpoint (for testing) ===
app.get("/", (req, res) => {
  res.json({ message: "💖 Heart Disease Detection API is running" });
});

// === MongoDB Connection ===
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // Start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on: http://0.0.0.0:${PORT}`);

      // Print LAN IPs
      const networkInterfaces = os.networkInterfaces();
      Object.values(networkInterfaces).forEach((ifaces) => {
        ifaces.forEach((details) => {
          if (details.family === "IPv4" && !details.internal) {
            console.log(`🌐 Access on LAN: http://${details.address}:${PORT}`);
          }
        });
      });
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// === Global Error Handler ===
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.stack);
  res.status(500).json({
    message: "Something went wrong",
    error: err.message,
  });
});
