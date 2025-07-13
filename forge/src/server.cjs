const express = require("express");
const cors = require("cors");
const path = require("path");
// const { fileURLToPath } = require("url");
const { generateReskin } = require("./api/aiReskin.cjs");

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

const app = express();
const PORT = 3001;

// Enable CORS (optional if proxying via Vite)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

app.use(express.static("public"));
// POST /api/reskin route
app.post("/api/reskin", async (req, res) => {
  const { prompt, asset } = req.body;

  if (!prompt || !asset) {
    return res.status(400).json({ error: "Missing prompt or asset" });
  }

  const inputPath = `../public/Game Assets/${asset}`;
  const outputPath = `../public/Game Assets/${asset.replace(".png", "-reskinned.png")}`;

  try {
    await generateReskin(prompt, inputPath, outputPath);
    return res.json({
      spriteUrl: `/Game Assets/${asset.replace(".png", "-reskinned.png")}`,
    });
  } catch (err) {
    console.error("❌ Reskin error:", err);
    return res.status(500).json({ error: "Reskin failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ AI Reskin server running at http://localhost:${PORT}`);
});
