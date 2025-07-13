// src/api/aiReskin.ts

const sharp = require("sharp");
const fs = require("fs");
const { GoogleGenAI, Modality } = require("@google/genai");

/**
 * Uses Gemini 2.0 Flash Preview to generate a reskinned game asset.
 * @param prompt - Natural language prompt like "make it robotic"
 * @param inputPath - Path to original image (e.g., 'public/assets/bird.png')
 * @param outputPath - Where to save the reskinned image
 */
// export 
async function generateReskin(prompt, inputPath, outputPath)
  /*
  prompt: string,
  inputPath: string,
  outputPath: string
): Promise<void>*/ {
  const ai = new GoogleGenAI({
    // Set your API key using env var if desired
    apiKey: /*"AIzaSyD0PmZ539wqcpOwFt1vxfdS3c5nuhr_v2g",//*/"AIzaSyCY2qnMKvrVGbA-oat_aV7kvevVEXU6uZI",//process.env.GEMINI_API_KEY,
  });

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input image not found: ${inputPath}`);
  }

  const imageBuffer = fs.readFileSync(inputPath);
  const base64Image = imageBuffer.toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-preview-image-generation",
    contents: [
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/png",
          data: base64Image,
        },
      },
    ],
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  const candidates = response.candidates;
  if (!candidates?.[0]?.content?.parts) {
    throw new Error("No valid candidates returned from Gemini");
  }

  const part = candidates[0].content.parts.find(
    (p) => "inlineData" in p && p.inlineData?.data
  );

  if (!part || !("inlineData" in part)) {
    throw new Error("Gemini did not return image data");
  }

  if (!part.inlineData || !part.inlineData.data) {
    throw new Error("Gemini did not return valid image data");
  }

  const resultBase64 = part.inlineData.data;
  const outputBuffer = Buffer.from(resultBase64, "base64");

  // fs.writeFileSync(outputPath, outputBuffer);
  // console.log(`✅ Reskin saved to: ${outputPath}`);

  // ✅ Load original dimensions
  const originalBuffer = fs.readFileSync(inputPath);
  const originalMeta = await sharp(originalBuffer).metadata();

  // ✅ Resize Gemini output to match original sprite size
  const resizedBuffer = await sharp(outputBuffer)
    .resize(originalMeta.width, originalMeta.height)
    .png()
    .toBuffer();

  // ✅ Save resized image
  fs.writeFileSync(outputPath, resizedBuffer);
  console.log(`✅ Reskin saved and resized to: ${outputPath}`);
  }

module.exports = { generateReskin };