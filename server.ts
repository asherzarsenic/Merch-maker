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

// Initialize Google GenAI client with required User-Agent header
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Endpoint: Analyze Merchandise Image
app.post("/api/analyze-merch", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/png" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image data" });
    }

    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured" });
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

    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured" });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");

    // Construct tailored graphic extraction prompt
    let modeInstruction = "Extract the complete graphic and artwork printed on this merchandise.";
    if (mode === "typography_isolated") {
      modeInstruction = "Focus on extracting and isolating the typography, text, and lettering elements cleanly and sharply.";
    } else if (mode === "vector_style") {
      modeInstruction = "Extract the graphic as a clean, high-precision vector-style 2D flat artwork with razor-sharp contours.";
    } else if (mode === "clean_minimal") {
      modeInstruction = "Extract the core central illustration with all background clutter and garment textures eliminated.";
    }

    const bgInstruction =
      backgroundStyle === "dark"
        ? "Place the extracted graphic on a solid, clean, uniform black background (#000000)."
        : "Place the extracted graphic on a solid, clean, uniform pure white background (#ffffff) with high contrast for easy background removal.";

    const fullPrompt = `You are a high-precision graphic artwork extractor and merchandise remastering engine.
Task: Inspect the input merchandise image and extract ONLY the printed artwork / graphic / illustration / emblem / typography.

Instructions:
1. ${modeInstruction}
2. Flatten the 2D graphic completely: remove all garment wrinkles, cloth folds, fabric texture, lighting sheen, 3D curves, perspective skew, shadows, and seams.
3. Keep the original graphic's colors, textures, details, and aesthetic fidelity intact.
4. ${bgInstruction}
5. Do NOT include any t-shirt collars, necklines, sleeves, mug handles, or surrounding merchandise materials. Only output the isolated graphic artwork centered in the frame.
${customPrompt ? `Additional User Direction: "${customPrompt}"` : ""}
Output the pristine, isolated extracted artwork graphic.`;

    // Attempt high quality image generation with gemini-3.1-flash-image / gemini-3.1-flash-lite-image
    let extractedImageUrl: string | null = null;
    let fallbackText: string | null = null;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: fullPrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            extractedImageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
            break;
          } else if (part.text) {
            fallbackText = part.text;
          }
        }
      }
    } catch (genError: any) {
      console.warn("Primary image generation attempt error:", genError?.message);
      
      // Secondary attempt with gemini-3.1-flash-image
      try {
        const response2 = await ai.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: fullPrompt,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1",
              imageSize: "1K",
            },
          },
        });

        if (response2.candidates && response2.candidates[0]?.content?.parts) {
          for (const part of response2.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              extractedImageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
              break;
            } else if (part.text) {
              fallbackText = part.text;
            }
          }
        }
      } catch (secError: any) {
        console.error("Secondary image generation error:", secError);
        throw secError;
      }
    }

    if (!extractedImageUrl) {
      return res.status(500).json({
        error: fallbackText || "Could not generate extracted graphic image. Please check prompt or try again.",
      });
    }

    return res.json({
      success: true,
      extractedImageUrl,
      mode,
      promptUsed: fullPrompt,
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

    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured" });
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
