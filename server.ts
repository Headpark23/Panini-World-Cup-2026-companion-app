import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

// Lazy initializer for Gemini SDK with apiKey and httpOptions telemetries
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

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
      const response = await getAi().models.generateContent({
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
  let isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    try {
      const currentRef = typeof __filename !== "undefined" ? __filename : "";
      if (currentRef && !currentRef.endsWith("server.ts")) {
        isProd = true;
      }
    } catch (e) {
      // Safe fallback
    }
  }

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Highly resilient static path resolver for production (works with standard cwd or dist/server.cjs)
    let distPath = path.join(process.cwd(), "dist");
    try {
      if (typeof __dirname !== "undefined") {
        if (__dirname.endsWith("dist") || __dirname.includes("/dist")) {
          distPath = __dirname;
        } else {
          distPath = path.join(__dirname, "dist");
        }
      }
    } catch (err) {
      console.warn("Could not compute __dirname fallback, using default process.cwd() distPath");
    }

    console.log(`Production static file path resolved to: ${distPath}`);
    app.use(express.static(distPath));
    // Serve index.html as spa fallback
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`Error sending index.html from ${indexPath}:`, err);
          // Try a quick fallback to process.cwd() / dist / index.html
          const fallbackPath = path.join(process.cwd(), "dist", "index.html");
          res.sendFile(fallbackPath, (fallbackErr) => {
            if (fallbackErr) {
              res.status(404).send("Error: Page not found. The app could not find index.html.");
            }
          });
        }
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening on http://localhost:${PORT}`);
  });
}

startServer();
