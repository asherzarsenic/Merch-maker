import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Set up payload limits for high-res base64 image data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Google GenAI client helper with required User-Agent header
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Endpoint: Analyze Merchandise Image
app.post("/api/analyze-merch", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/png" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image data" });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured in Settings > Secrets." });
    }

    // Clean base64 data if it contains data URI scheme
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");

    const prompt = `Analyze this merchandise photograph (clothing, shirt, hoodie, mug, bag, poster, accessory, or packaging).
Identify and extract detailed information about the artwork, print, logo, or graphic printed on it.

Respond strictly with a JSON object following this format:
{
  "graphicTitle": "Short descriptive name for the graphic (e.g. 'Cosmic Floral Moon' or 'Vintage Typography Emblem')",
  "graphicType": "e.g. Illustration, Logo / Badge, Typography / Lettering, Mascot, Photo Print, Geometric Pattern",
  "detectedText": "Any exact text/slogans visible on the graphic (or null if none)",
  "colorPalette": [
    {"name": "Color Name", "hex": "#HEXCODE"}
  ],
  "compositionDescription": "2-3 sentences describing the graphic element, its art style, linework, and visual motifs.",
  "merchandiseType": "e.g. T-Shirt, Hoodie, Ceramic Mug, Tote Bag, Cap, Sticker, Poster",
  "extractionAdvice": "Tips on isolating this graphic (e.g. 'High contrast graphic with clear borders; perfect for transparent PNG export')",
  "recommendedPrompt": "Exact optimized prompt to extract and isolate this graphic cleanly on a pure flat background without any merchandise fabric or distortion."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return res.json({ success: true, analysis: data });
  } catch (error: any) {
    console.error("Error analyzing merchandise:", error);
    return res.status(500).json({
      error: error?.message || "Failed to analyze merchandise image",
    });
  }
});

// Endpoint: Extract Graphic Off Merchandise
app.post("/api/extract-graphic", async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = "image/png",
      mode = "full_extraction",
      customPrompt = "",
      backgroundStyle = "white", // 'white' | 'dark' | 'isolated'
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image data" });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured in Settings > Secrets." });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");

    // Direct, fast Free-Tier Vision AI extraction using gemini-3.8-flash
    let modeGuidance = "Isolate the entire printed artwork/graphic and typography.";
    if (mode === "typography_isolated") {
      modeGuidance = "Locate and isolate the typography, text slogans, and lettering elements.";
    } else if (mode === "vector_style") {
      modeGuidance = "Isolate the flat 2D graphic boundaries with clean vector-ready borders.";
    } else if (mode === "clean_minimal") {
      modeGuidance = "Isolate the central emblem or core illustration.";
    }

    const visionPrompt = `You are a precision merchandise graphic isolation engine.
Task: Inspect this merchandise photo (clothing, shirt, hoodie, mug, cap, bag, poster).
${modeGuidance}
${customPrompt ? `User refinement: "${customPrompt}"` : ""}

Find the EXACT normalized bounding box coordinates of the printed graphic (ymin, xmin, ymax, xmax on a 0 to 1000 integer scale).
Also detect the garment background tone (whether the underlying merchandise fabric is dark or white) and a suggested title.

Respond strictly in JSON format:
{
  "boundingBox": [ymin, xmin, ymax, xmax],
  "garmentColor": "dark" | "white",
  "graphicTitle": "Short descriptive title of graphic",
  "detectedElements": "Summary of visual motifs, text, or shapes found",
  "contrastEnhance": true
}`;

    const visionResp = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          { text: visionPrompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const visionData = JSON.parse(visionResp.text || "{}");
    const box = Array.isArray(visionData.boundingBox) && visionData.boundingBox.length === 4
      ? visionData.boundingBox
      : [150, 150, 850, 850];

    return res.json({
      success: true,
      isFallback: true,
      boundingBox: box,
      garmentColor: visionData.garmentColor || backgroundStyle,
      graphicTitle: visionData.graphicTitle || "Extracted Merchandise Graphic",
      mode,
      message: "Artwork isolated via Gemini 3.8 Flash Vision Engine (100% Free Tier).",
    });
  } catch (error: any) {
    console.error("Error extracting graphic:", error);
    return res.status(500).json({
      error: error?.message || "Failed to extract graphic from merchandise",
    });
  }
});

// Endpoint: AI Chat Assistant for Graphic Refinement & Guidance
app.post("/api/chat-refine", async (req, res) => {
  try {
    const { messages = [], currentGraphicContext = null } = req.body;

    const ai = getAIClient();
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured in Settings > Secrets." });
    }

    const systemInstruction = `You are MerchGraphic AI Assistant — a specialized expert in merchandise graphic design, screen printing, vectorization, digital art isolation, and print-on-demand production.

Your role is to help users extract, isolate, edit, remaster, and export high-quality graphics from real-world merchandise photos (t-shirts, sweatshirts, caps, mugs, stickers, tote bags, posters).

Capabilities & Knowledge:
1. Graphic Isolation Advice: Tell users how to get the cleanest extract (lighting, contrast, angle).
2. Artwork Refinement: Suggest prompt adjustments (e.g. "Convert to 2-color halftone print", "Isolate only the upper gothic typography", "Make line art thicker for embroidery").
3. Print Specs: Explain DPI, vector SVG conversion, transparent PNGs, CMYK vs RGB, direct-to-garment (DTG) vs silk screening.
4. Aesthetic: Provide concise, creative, expert, encouraging advice with a chic, refined tone.

Keep responses scannable, practical, helpful, and concise (under 120 words unless requested in detail). Always offer 2-3 quick one-click suggested actions at the end in square brackets like [Suggested Action: ...] when appropriate.`;

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    if (currentGraphicContext) {
      formattedContents.unshift({
        role: "user",
        parts: [
          {
            text: `[Current Active Graphic Context: Title: "${currentGraphicContext.title || "Merch Item"}", Type: "${currentGraphicContext.type || "Graphic"}", Detected Text: "${currentGraphicContext.text || "None"}"]`,
          },
        ],
      });
      formattedContents.splice(1, 0, {
        role: "model",
        parts: [{ text: "Understood! I'm tracking this graphic's details and ready to assist." }],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I'm ready to help you extract and refine your merchandise graphics!";
    return res.json({ success: true, reply });
  } catch (error: any) {
    console.error("Chat error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to process chat request",
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
