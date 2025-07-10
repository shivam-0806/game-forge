export interface GameConfig {
  gravity?: number;
  pipeGap?: number;
  // birdSpeed?: number;
  flapStrength?: number;
  pipeSpeed?: number;
}
import { CohereClientV2 } from "cohere-ai";

const client = new CohereClientV2({ token: "{redacted}" }); 
// const promptText = "Set gravity to 500";
// console.log("Cohere Key:", apiKey);

export async function getParsedGameConfig(promptText: string): Promise<GameConfig> {
  console.log("prompt textttt:   ", promptText);
  const response = await client.chat(
    {
      model: "command-r-plus",
      messages: [
        {
          "role": "system",
          "content": [
            {
              "type": "text",
              "text": "You are an assistant that extracts game config settings from user instructions. Respond ONLY with JSON. Allowed keys: gravity, pipeGap, pipeSpeed, flapStrength."
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": promptText
            }
          ]
        },
        
      ],
      temperature: 0.3
    }
  )
 
  // Find the first text block in assistant response
  const messageBlock = response.message?.content?.find(part => part.type === "text");

  if (!messageBlock || !("text" in messageBlock)) {
    throw new Error("No usable response from Cohere.");
  }

  try {
    //const parsed = JSON.parse(messageBlock.text);
    const cleanedText = messageBlock.text
      .replace(/```json|```/g, "") // remove ```json and ```
      .trim();

    const parsed = JSON.parse(cleanedText);

    // Optional: filter to only allowed keys
    const allowedKeys: (keyof GameConfig)[] = ["gravity", "pipeSpeed", "pipeGap", "flapStrength"];
    const filtered: GameConfig = {};

    for (const key of allowedKeys) {
      if (typeof parsed[key] === "number") {
        filtered[key] = parsed[key];
      }
    }

    return filtered;
  } catch (err) {
    console.error("Failed to parse Cohere response:", messageBlock.text);
    throw new Error("Invalid JSON returned by Cohere.");
  }
}
// callCohere();
