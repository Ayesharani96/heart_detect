// ml/predict_combined.js
const { spawn } = require("child_process");
const path = require("path");

function normalizeResult(r) {
  if (!r || typeof r !== "object") return {};
  // map names
  if (!r.risk && r.final_risk) r.risk = r.final_risk;
  // choose final_prob
  if (typeof r.final_prob !== "number") {
    if (typeof r.text_prob === "number" && typeof r.image_prob === "number") {
      r.final_prob = (r.text_prob + r.image_prob) / 2;
    } else if (typeof r.text_prob === "number") {
      r.final_prob = r.text_prob;
    } else {
      r.final_prob = 0;
    }
  }
  // risk from final_prob if missing
  if (!r.risk && typeof r.final_prob === "number") {
    r.risk = r.final_prob >= 0.7 ? "High" : r.final_prob >= 0.4 ? "Medium" : "Low";
  }
  // numeric rounding
  ["final_prob", "text_prob", "image_prob"].forEach(k => {
    if (r[k] != null) r[k] = Number(Number(r[k]).toFixed(2));
  });
  return r;
}

function predictHeartDisease(inputData) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "predict.py");
    const py = spawn("python", [scriptPath], { stdio: ["pipe", "pipe", "pipe"], shell: true });

    let output = "";
    let errorOutput = "";

    const timeout = setTimeout(() => {
      py.kill();
      reject(new Error("Python process timed out"));
    }, 60000);

    py.stdout.on("data", d => (output += d.toString()));
    py.stderr.on("data", d => (errorOutput += d.toString()));

    py.on("close", code => {
      clearTimeout(timeout);
      try {
        const raw = JSON.parse(output.trim());
        if (raw && raw.error) {
          return reject(new Error(raw.error));
        }
        const result = normalizeResult(raw);
        resolve(result);
      } catch (err) {
        console.error("🔥 Python Script Error:", errorOutput);
        reject(new Error(`Python exited with code ${code}\nError: ${errorOutput}\nOutput: ${output}`));
      }
    });

    py.stdin.write(JSON.stringify(inputData));
    py.stdin.end();
  });
}

module.exports = { predictHeartDisease };
