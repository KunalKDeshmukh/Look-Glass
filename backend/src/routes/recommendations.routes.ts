import { Router } from "express";
import { optionalAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

interface RecPreferences {
  vibes?: string[];
  colors?: string[];
  occasions?: string[];
}

interface RecMeasurements {
  unit?: "cm" | "in";
  heightCm?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  shoulderCm?: number | null;
}

// POST /api/recommendations
// body: { imageBase64: string (no data: prefix), mediaType: string, preferences: RecPreferences, measurements?: RecMeasurements }
// Proxies to the Anthropic Messages API using a server-side key, so the
// key is never exposed to the browser. Returns a normalized JSON array
// of outfit recommendations.
router.post("/", optionalAuth, async (req: AuthedRequest, res) => {
  const { imageBase64, mediaType, preferences, measurements } = req.body as {
    imageBase64?: string;
    mediaType?: string;
    preferences?: RecPreferences;
    measurements?: RecMeasurements;
  };

  if (!imageBase64) {
    res.status(400).json({ error: "Attach a photo before requesting recommendations." });
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: "The Glass isn't configured yet — set ANTHROPIC_API_KEY on the server." });
    return;
  }

  const prefs = preferences || {};
  const m = measurements || {};
  const hasMeasurements = m.heightCm || m.chestCm || m.waistCm || m.hipCm || m.shoulderCm;
  const measurementLine = hasMeasurements
    ? `The person has also provided body measurements in cm — height: ${m.heightCm ?? "unspecified"}, chest/bust: ${
        m.chestCm ?? "unspecified"
      }, waist: ${m.waistCm ?? "unspecified"}, hip: ${m.hipCm ?? "unspecified"}, shoulder width: ${
        m.shoulderCm ?? "unspecified"
      }. Use these only for fit and silhouette guidance in "styleNote" (e.g. rise, cut, drape) — never comment on body size or weight.`
    : "";

  const prompt = `You are a precise, tasteful fashion stylist. Look at the attached photo and consider these stated preferences — style vibe: ${
    (prefs.vibes || []).join(", ") || "unspecified"
  }; favored colorways: ${(prefs.colors || []).join(", ") || "unspecified"}; occasions: ${
    (prefs.occasions || []).join(", ") || "unspecified"
  }.
${measurementLine}
Generate exactly 4 outfit recommendations that would genuinely suit the person's coloring, build, and stated preferences.
Respond with ONLY a raw JSON array (no markdown fences, no preamble, no commentary). Each element must be an object with exactly these keys:
"title" (3-5 words, evocative but concrete),
"category" (one of: dress, top, jacket, bottoms, shoes, accessory, saree, kurta, lehenga, sherwani — use the Indian-wear categories when the preferences lean festive/Indian, otherwise use the Western categories),
"description" (max 20 words, specific styling rationale tied to what you observed),
"colorPalette" (array of 2-3 hex color strings),
"styleNote" (max 12 words, a single practical tip).`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY as string,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: imageBase64 } },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      res.status(502).json({ error: "The Glass couldn't reach the styling model — try again shortly." });
      return;
    }

    const data = await response.json();
    const text = (data.content || []).map((b: any) => b.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed) || !parsed.length) throw new Error("empty recommendation set");
    res.json({ items: parsed });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "The Glass couldn't focus on that one — try a clearer, front-facing photo." });
  }
});

export default router;
