// server/reskin.ts or /api/reskin.ts
import express from "express";
import { generateReskin } from "./aiReskin.cjs"; // your Gemini fs code
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/", async (req, res) => {
  const { prompt, asset } = req.body;
  const inputPath = path.resolve(__dirname, "../../public/Game Assets", asset);
  const outputFileName = asset.replace(".png", "-reskinned.png");
  const outputPath = path.resolve(__dirname, "../../public/Game Assets", outputFileName);
  console.log("reskinnnn: ", inputPath);

  try {
    await generateReskin(prompt, inputPath, outputPath);
    res.json({ spriteUrl: `/Game Assets/${outputFileName}`});
  } catch (err) {
    res.status(500).json({ error: "Reskin failed" });
  }
});

export default router;
