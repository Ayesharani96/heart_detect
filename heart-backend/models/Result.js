// models/Result.js
const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportName: { type: String, required: true },
    age: Number,
    reportType: String,
    bpm: Number,
    status: String,
    images: [
      {
        data: String, // base64
        contentType: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", ResultSchema);
