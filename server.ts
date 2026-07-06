import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Ensure Gemini agent is lazy loaded safely
let ai: GoogleGenAI | null = null;
function getAIClient() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("Caution: GEMINI_API_KEY environment variable is not set. Gemini features will run in mock mode.");
      return null;
    }
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit expanded for large n8n attachment matrices
  app.use(express.json({ limit: '10mb' }));

  // --- API Routes ---
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Server-side Gemini payload enricher
  app.post('/api/enrich-payload', async (req, res) => {
    try {
      const { template, description, prompt } = req.body;
      const client = getAIClient();

      if (!client) {
        // Fallback mockup model output when API key is missing during initial local trials
        const mockResponse = {
          enrichedPayload: {
            ...template,
            annotatedName: `${template.projectName || "VisionWeaver"}_OPTIMIZED`,
            pipelineParameters: {
              ...(template.pipelineParameters || {}),
              noiseThreshold: 0.15,
              intelligentUpscale: true,
              weavingStyles: ["Classic", "HighContrast", "Atmospheric"]
            },
            statusCheckPoint: "STANDARDISED_N8N_COMPLIANT_V1"
          },
          aiRecommendations: "Mock Analysis: GEMINI_API_KEY not configured. Automatically generated standardized n8n webhook payload based on Estibancreations design specs."
        };
        return res.json(mockResponse);
      }

      const modelName = 'gemini-2.5-flash'; // Let's use the fast & smart 2.5-flash
      const response = await client.models.generateContent({
        model: modelName,
        contents: `You are an expert n8n workflow architect and VisionWeaver system director. 
Given the following VisionWeaver payload JSON:
${JSON.stringify(template, null, 2)}

User Request: "${prompt || description || "Structure for production"}"

Optimize this JSON configuration. In your response:
1. Provide the optimized JSON payload enclosed strictly inside a JSON markdown code block.
2. Underneath the code block, list 3 bullet points outlining what was improved or structured, specifically for n8n webhook attachment consumption. Keep it extremely brief and professional.`,
      });

      const text = response.text || '';
      console.log('Gemini optimization result loaded successfully.');

      // Extract JSON block
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
      const match = text.match(jsonRegex);
      
      let enrichedPayload = template;
      let aiRecommendations = text;

      if (match && match[1]) {
        try {
          enrichedPayload = JSON.parse(match[1].trim());
          aiRecommendations = text.replace(jsonRegex, '').trim();
        } catch (e) {
          console.error('Error parsing JSON returned by Gemini:', e);
        }
      }

      res.json({ enrichedPayload, aiRecommendations });

    } catch (error: any) {
      console.error('Gemini call error:', error);
      res.status(500).json({ error: error.message || 'Error processing request with Gemini API.' });
    }
  });

  // Server-side Gemini movie story and script continuity analyzer
  app.post('/api/analyze-story', async (req, res) => {
    try {
      const { storyText } = req.body;
      const client = getAIClient();

      if (!client) {
        // High-fidelity fallback schema featuring Jayden Reed, Darius Marshall & Rahul Sharma
        return res.json({
          success: true,
          scenes: [
            {
              sceneNum: 1,
              title: "The Moving Rig on Mason Hill",
              location: "Mason Street, San Francisco (20% steep incline with Bay background)",
              characters: ["Darius Marshall", "Jayden Reed"],
              cameraAngle: "Low-angle wide tracking tracking shot following the vehicle",
              action: "The GMC 'System Movers' truck climbs the severe incline of Mason Street. Jayden Reed (6'4\", 380 lbs, steel chain accessory, grizzled beard) braces the heavy cargo boxes, while Darius Marshall guides the steering wheel over the cable tracks.",
              continuityStatus: "PASSED",
              continuityLog: "Scenery validated: 20% street incline gradient and Alcatraz island backdrop coordinates are correctly locked. No visual drift.",
              audioCue: "ElevenLabs_DariusVoice_Scene1.wav"
            },
            {
              sceneNum: 2,
              title: "Meeting in the Wood-Paneled Parlor",
              location: "Rustic wood-paneled living room with a vintage lamp and floral chair",
              characters: ["Jayden Reed", "Rahul Sharma"],
              cameraAngle: "Medium shot, warm cozy ambient key lighting",
              action: "Jayden Reed and Rahul Sharma carefully set down a heavy retro television receiver. Rahul (coiled hair, orange puffer jacket, green tee, jade pendant) smiles warmly, admiring the vintage craftsmanship.",
              continuityStatus: "PASSED",
              continuityLog: "Scenery validated: Wood textures match project bible index. Floral upholstery matches standard set-piece.",
              audioCue: "ElevenLabs_RahulVoice_Scene2.wav"
            },
            {
              sceneNum: 3,
              title: "The portal in the bath water",
              location: "Candlelit bathroom with cast-iron white clawfoot tub",
              characters: ["Rahul Sharma"],
              cameraAngle: "Overhead medium aesthetic close-up",
              action: "Rahul Sharma sits wrapped in a beige blanket, looking thoughtful by the water. Suddenly, the bath water ripples and a glowing cyan portal erupts, casting shimmering light across the white walls.",
              continuityStatus: "WARNING_CORRECTED",
              continuityLog: "Drift detected: Bath design was copper style in early draft. Corrected back to cast-iron white porcelain clawfoot to align with character specs.",
              audioCue: "ElevenLabs_PortalSynth_Scene3.wav"
            }
          ],
          aiSummary: "The story script matches your media library completely. Character spec files (Jayden Reed, Rahul Sharma, Darius Marshall) and scenery changes are perfectly reconciled."
        });
      }

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert movie script breakdown director and scenic continuity supervisor.
Analyze the following script/story, break it down into exactly 3 chronological scene panels, and perform a strict scenery-change continuity validation to ensure visual consistency of characters, locations, and backgrounds.

Story Text:
"${storyText || "Draft story"}"

Reference character specification details:
- Jayden Reed: 6'4", 380 lbs, grizzled beard, scarred right temple, steel chain accessory.
- Darius Marshall: 360 wave hair, high skin fade, tan utility workwear.
- Rahul Sharma: Coiled hair, orange puffer jacket, green t-shirt, jade pendant necklace.

Format your response strictly as a JSON object with this exact schema (no markdown wrappers outside of JSON):
{
  "scenes": [
    {
      "sceneNum": number,
      "title": "string",
      "location": "string",
      "characters": ["string"],
      "cameraAngle": "string",
      "action": "string",
      "continuityStatus": "PASSED" | "WARNING_CORRECTED",
      "continuityLog": "string (explain how character details and scenic transitions were verified for continuity)",
      "audioCue": "string"
    }
  ],
  "aiSummary": "string (brief summary of character specs and scenery checks completed)"
}

Do not return any markdown wraps like \`\`\`json. Return only raw JSON.`,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '{}';
      try {
        const result = JSON.parse(text);
        res.json({ success: true, ...result });
      } catch (parseErr) {
        console.warn("Raw text could not be parsed, sending raw wrapped content:", text);
        res.json({ success: true, rawText: text });
      }

    } catch (err: any) {
      console.error("Error analyzing story:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Proxy route for live n8n webhooks to bypass browser CORS blockages
  app.post('/api/dispatch-n8n', async (req, res) => {
    try {
      const { webhookUrl, payload } = req.body;
      if (!webhookUrl) {
        return res.status(400).json({ error: 'Webhook URL is required' });
      }

      console.log(`Dispatching live webhook through proxy to n8n: ${webhookUrl}`);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`n8n responded with status ${response.status}: ${responseText}`);
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { message: responseText };
      }

      res.json({
        status: 'success',
        statusCode: response.status,
        data: responseData
      });

    } catch (error: any) {
      console.error('n8n proxy dispatch error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error occurred during n8n webhook dispatch.'
      });
    }
  });

  // --- Vite Middleware in Dev vs Dist Static in Production ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite dev server middleware successfully.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production assets from /dist.");
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express custom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
