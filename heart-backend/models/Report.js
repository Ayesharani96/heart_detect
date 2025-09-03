const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportName: { type: String, required: true },
    reportType: { type: String, default: "General" },
    risk: { type: String },
    recommendation: { type: String },
    finalProbability: { type: Number }, // 0-1
    userData: { type: Object }, // vitals or patient input
    rawResult: { type: Object }, // full AI prediction response
    images: [String], // base64 strings or URIs
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
