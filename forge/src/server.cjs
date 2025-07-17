const express = require("express");
const cors = require("cors");
const path = require("path");
// const { fileURLToPath } = require("url");
const { generateReskin } = require("./api/aiReskin.cjs");
const archiver = require("archiver");
const fs = require("fs");

const app = express();
const PORT = 3001;

// Enable CORS (optional if proxying via Vite)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// ZIP game export route
app.get("/export/:game", async (req, res) => {
  const gameKey = req.params.game;
  const gameDir = path.join(__dirname, "export", gameKey);
  console.log("🧭 Looking for game folder at:", gameDir);


  if (!fs.existsSync(gameDir)) {
    return res.status(404).send("Game not found");
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${gameKey}.zip"`);

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res);

  archive.directory(gameDir, false);

  try {
    await archive.finalize();
  } catch (err) {
    console.error("Failed to zip:", err);
    res.status(500).send("Failed to generate ZIP");
  }
});

app.use(express.static("public"));
// POST /api/reskin route
app.post("/api/reskin", async (req, res) => {
  const { prompt, asset, game } = req.body;

  if (!prompt || !asset) {
    return res.status(400).json({ error: "Missing prompt or asset" });
  }

  const inputPath = `../public/Game Assets/${asset}`;
  const outputPath = `../public/Game Assets/${asset.replace(".png", "-reskinned.png")}`;
  const exportPath = `export/${game}/assets/${asset.replace(".png", "-reskinned.png")}`; //"C:\Users\Hp\Documents\game-forge\forge\src\export\flappy\assets\background-reskinned.png"

  try {
    await generateReskin(prompt, inputPath, outputPath, exportPath);
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

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});
