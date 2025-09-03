const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reportName: { type: String, required: true },
  risk: { type: String, enum: ["Low", "Medium", "High"], required: true }, // enforce enum
  finalProbability: { type: Number },
  textProbability: { type: Number },
  imageProbability: { type: Number },
  recommendation: { type: String },
  images: [{ type: String }], // stored file paths
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Prediction", predictionSchema);
