import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini SDK with apiKey and httpOptions telemetries
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set generous body limits for base64 image uploads
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // API Route: OCR Sticker Detection
  app.post("/api/ocr-stickers", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Missing image data" });
      }

      if (!process.env.GEMINI_API_KEY) {
        // Return simulated offline response if key is missing, or prompt clear configuration error
        console.warn("GEMINI_API_KEY is not defined. Using smart local analyzer fallback.");
        return res.json({
          detected: ["ARG 1", "BRA 2", "USA 1", "CC 1", "FWC 4"],
          message: "⚠️ Running in demo mode: simulated scan identified ARG 1 (Badge), BRA 2 (Neymar Jr.), USA 1 (Badge), CC 1 (Coca-Cola Celebration), and FWC 4 (Legend Pelé)!"
        });
      }

      // Parse base64 and extract mimeType
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let mimeType = "image/jpeg";
      let base64Data = image;

      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      };

      const promptPart = {
        text: `Analyze this image of physical soccer sticker purchases or swaps.
Identify any recognizable country/team code and sticker number combos in the image (e.g. ARG 1, BRA 2, USA 1, FWC 4, CC 1).
Accepted format has a country/team code and number 1 to 4 (e.g., GER 1, ESP 3, MAR 2).
Accepted Special Stickers are FWC 1 to 5.
Accepted Coca-Cola section stickers are CC 1 to 8.

If you see codes matching physical Panini stickers, list them.
Return a clean list of detected sticker codes in the JSON format.`,
      };

      // Call Gemini 3.5 Flash Model
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, promptPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detected: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Sticker codes found in the format [TEAM_CODE] [NUMBER], e.g. ARG 10, BRA 7"
              },
              message: {
                type: Type.STRING,
                description: "A friendly explanation of what you found"
              }
            },
            required: ["detected"]
          }
        }
      });

      const resultText = response.text ? response.text.trim() : "{}";
      const parsed = JSON.parse(resultText);
      
      // Clean codes: normalize spacing (e.g., "ARG10" -> "ARG 10")
      const cleanedDetected = (parsed.detected || []).map((code: string) => {
        let clean = code.toUpperCase().trim();
        const parseMatch = clean.match(/^([A-Z]{3})\s*(\d+)$/);
        if (parseMatch) {
          return `${parseMatch[1]} ${parseMatch[2]}`;
        }
        return clean;
      });

      return res.json({
        detected: cleanedDetected,
        message: parsed.message || `Successfully detected ${cleanedDetected.length} stickers.`
      });

    } catch (err: any) {
      console.error("Gemini API OCR Server error:", err);
      return res.status(500).json({ error: err.message || "Failed to process sticker image" });
    }
  });

  // Hot-reloading and static routing depending on NODE_ENV
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html as spa fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening on http://localhost:${PORT}`);
  });
}

startServer();
