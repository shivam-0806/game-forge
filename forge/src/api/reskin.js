// server/reskin.ts or /api/reskin.ts
import express from "express";
import { generateReskin } from "./aiReskin.cjs"; // your Gemini fs code

const router = express.Router();

router.post("/", async (req, res) => {
  const { prompt, asset } = req.body;
  const inputPath = `../public/Game Assets/Flappy Bird/${asset}`;
  const outputPath = `../public/Game Assets/Flappy Bird/${asset.replace(".png", "-reskinned.png")}`;
  console.log("reskinnnn: ", inputPath);

  try {
    await generateReskin(prompt, inputPath, outputPath);
    res.json({ spriteUrl: `../public/Game Assets/Flappy Bird/${asset.replace(".png", "-reskinned.png")}` });
  } catch (err) {
    res.status(500).json({ error: "Reskin failed" });
  }
});

export default router;
