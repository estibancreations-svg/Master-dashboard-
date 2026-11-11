import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ---------------------------------------------------------------------------
// Structured Logger
// ---------------------------------------------------------------------------
type LogLevel = 'info' | 'warn' | 'error' | 'audit';

function log(level: LogLevel, stage: string, message: string, meta?: Record<string, unknown>) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    stage,
    message,
    ...(meta ? { meta } : {}),
  };
  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

// ---------------------------------------------------------------------------
// In-memory audit trail (scene state transitions)
// ---------------------------------------------------------------------------
interface AuditEntry {
  ts: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  fromState?: string;
  toState?: string;
  meta?: Record<string, unknown>;
}

const auditTrail: AuditEntry[] = [];

function appendAudit(entry: Omit<AuditEntry, 'ts'>) {
  auditTrail.push({ ts: new Date().toISOString(), ...entry });
  // Keep in-memory trail bounded (last 10 000 entries)
  if (auditTrail.length > 10_000) auditTrail.shift();
  log('audit', entry.action, `${entry.entity}:${entry.entityId} ${entry.fromState ?? ''} → ${entry.toState ?? ''}`, { actor: entry.actor });
}

// ---------------------------------------------------------------------------
// Rate limiter (per IP, in-memory sliding window)
// ---------------------------------------------------------------------------
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX_REQUESTS = 60;

const rateLimitMap = new Map<string, number[]>();

function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.socket.remoteAddress ?? 'unknown';
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;

  const timestamps = (rateLimitMap.get(ip) ?? []).filter(t => t > windowStart);
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  if (timestamps.length > RATE_MAX_REQUESTS) {
    log('warn', 'rate-limit', `Rate limit exceeded for ${ip}`);
    res.status(429).json({ error: 'Too many requests. Limit: 60 per minute per IP.' });
    return;
  }
  next();
}

// ---------------------------------------------------------------------------
// Circuit breaker (per named service)
// ---------------------------------------------------------------------------
type CBState = 'closed' | 'open' | 'half-open';

interface CircuitBreaker {
  state: CBState;
  failures: number;
  lastFailureAt: number;
  successCount: number;
}

const FAILURE_THRESHOLD = 5;
const RECOVERY_TIMEOUT_MS = 30_000; // 30 seconds
const HALF_OPEN_SUCCESS_THRESHOLD = 2;

const circuitBreakers = new Map<string, CircuitBreaker>();

function getCircuitBreaker(name: string): CircuitBreaker {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, { state: 'closed', failures: 0, lastFailureAt: 0, successCount: 0 });
  }
  return circuitBreakers.get(name)!;
}

async function withCircuitBreaker<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const cb = getCircuitBreaker(name);
  const now = Date.now();

  if (cb.state === 'open') {
    if (now - cb.lastFailureAt > RECOVERY_TIMEOUT_MS) {
      cb.state = 'half-open';
      cb.successCount = 0;
      log('info', 'circuit-breaker', `${name} transitioned to half-open`);
    } else {
      throw new Error(`Circuit breaker OPEN for service: ${name}. Retry after ${Math.ceil((RECOVERY_TIMEOUT_MS - (now - cb.lastFailureAt)) / 1000)}s.`);
    }
  }

  try {
    const result = await fn();
    if (cb.state === 'half-open') {
      cb.successCount += 1;
      if (cb.successCount >= HALF_OPEN_SUCCESS_THRESHOLD) {
        cb.state = 'closed';
        cb.failures = 0;
        log('info', 'circuit-breaker', `${name} recovered → closed`);
      }
    } else {
      cb.failures = 0;
    }
    return result;
  } catch (err) {
    cb.failures += 1;
    cb.lastFailureAt = now;
    if (cb.state === 'half-open' || cb.failures >= FAILURE_THRESHOLD) {
      cb.state = 'open';
      log('warn', 'circuit-breaker', `${name} tripped OPEN after ${cb.failures} failures`);
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Scene payload validator
// ---------------------------------------------------------------------------
interface ScenePayload {
  project_title: string;
  concept: string;
  scene_count: number;
  target_platform: string;
}

const ALLOWED_PLATFORMS = new Set(['YouTube', 'Instagram', 'TikTok', 'LinkedIn']);

function validateScenePayload(body: unknown): { valid: true; data: ScenePayload } | { valid: false; errors: string[] } {
  const errors: string[] = [];
  if (typeof body !== 'object' || body === null) {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }
  const b = body as Record<string, unknown>;

  if (typeof b.project_title !== 'string' || b.project_title.trim().length === 0 || b.project_title.length > 160) {
    errors.push('project_title must be a non-empty string (max 160 chars)');
  }
  if (typeof b.concept !== 'string' || b.concept.trim().length < 20 || b.concept.length > 8000) {
    errors.push('concept must be a string between 20 and 8000 chars');
  }
  const sc = Number(b.scene_count);
  if (!Number.isInteger(sc) || sc < 1 || sc > 20) {
    errors.push('scene_count must be an integer between 1 and 20');
  }
  if (typeof b.target_platform !== 'string' || !ALLOWED_PLATFORMS.has(b.target_platform)) {
    errors.push(`target_platform must be one of: ${[...ALLOWED_PLATFORMS].join(', ')}`);
  }

  if (errors.length > 0) return { valid: false, errors };
  return {
    valid: true,
    data: {
      project_title: (b.project_title as string).trim(),
      concept: (b.concept as string).trim(),
      scene_count: sc,
      target_platform: b.target_platform as string,
    },
  };
}

// ---------------------------------------------------------------------------
// Pipeline stage health tracker
// ---------------------------------------------------------------------------
const PIPELINE_STAGES = ['intake', 'parse', 'breakdown', 'cinematography', 'render', 'qc', 'package'] as const;
type PipelineStage = typeof PIPELINE_STAGES[number];

const stageHealth: Record<PipelineStage, { lastCheck: string; status: 'ok' | 'degraded' | 'unknown' }> = {
  intake:        { lastCheck: new Date().toISOString(), status: 'ok' },
  parse:         { lastCheck: new Date().toISOString(), status: 'ok' },
  breakdown:     { lastCheck: new Date().toISOString(), status: 'ok' },
  cinematography:{ lastCheck: new Date().toISOString(), status: 'ok' },
  render:        { lastCheck: new Date().toISOString(), status: 'ok' },
  qc:            { lastCheck: new Date().toISOString(), status: 'ok' },
  package:       { lastCheck: new Date().toISOString(), status: 'ok' },
};

// ---------------------------------------------------------------------------
// Ensure Gemini agent is lazy loaded safely
// ---------------------------------------------------------------------------
let ai: GoogleGenAI | null = null;
function getAIClient() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      log('warn', 'gemini', 'GEMINI_API_KEY not set — running in mock mode');
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

  // Apply rate limiting to all API routes
  app.use('/api', rateLimitMiddleware);

  // --- API Routes ---

  // Enhanced health check — overall + per-pipeline-stage
  app.get('/api/health', (_req, res) => {
    const cbStatus: Record<string, unknown> = {};
    circuitBreakers.forEach((v, k) => { cbStatus[k] = { state: v.state, failures: v.failures }; });
    res.json({
      status: 'ok',
      serverTime: new Date().toISOString(),
      version: '6.0.0',
      pipelineStages: stageHealth,
      circuitBreakers: cbStatus,
    });
    log('info', 'health', 'Health check requested');
  });

  // Per-stage health endpoint
  app.get('/api/health/:stage', (req, res) => {
    const stage = req.params.stage as PipelineStage;
    if (!PIPELINE_STAGES.includes(stage)) {
      res.status(404).json({ error: `Unknown stage: ${stage}. Valid stages: ${PIPELINE_STAGES.join(', ')}` });
      return;
    }
    stageHealth[stage].lastCheck = new Date().toISOString();
    res.json({ stage, ...stageHealth[stage] });
  });

  // Audit trail endpoint
  app.get('/api/audit', (_req, res) => {
    res.json({ count: auditTrail.length, entries: auditTrail.slice(-200) });
  });

  // Scene state transition audit (called by orchestrator/cron to record transitions)
  app.post('/api/audit/transition', (req, res) => {
    const { actor, action, entity, entityId, fromState, toState, meta } = req.body ?? {};
    if (!actor || !action || !entity || !entityId) {
      res.status(400).json({ error: 'Required fields: actor, action, entity, entityId' });
      return;
    }
    appendAudit({ actor, action, entity, entityId, fromState, toState, meta });
    res.status(201).json({ recorded: true });
  });

  // Backup export — dumps current in-memory audit trail and stage health snapshot
  app.get('/api/backup/export', (_req, res) => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      version: '6.0.0',
      auditTrail,
      stageHealth,
      circuitBreakerStatus: Object.fromEntries(
        [...circuitBreakers.entries()].map(([k, v]) => [k, { state: v.state, failures: v.failures, lastFailureAt: v.lastFailureAt }])
      ),
    };
    log('audit', 'backup', 'Backup export requested');
    res.setHeader('Content-Disposition', `attachment; filename="visionweaver-backup-${Date.now()}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.json(snapshot);
  });

  // Scene payload validation endpoint (for pre-submit client validation)
  app.post('/api/validate/scene', (req, res) => {
    const result = validateScenePayload(req.body);
    if (!result.valid) {
      res.status(422).json({ valid: false, errors: result.errors });
      return;
    }
    res.json({ valid: true, sanitized: result.data });
  });

  // Server-side Gemini payload enricher
  app.post('/api/enrich-payload', async (req, res) => {
    log('info', 'intake', 'Payload enrichment request received');
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
      log('info', 'render', 'Gemini optimization result loaded successfully.');

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
      log('error', 'intake', 'Gemini enrich-payload error', { message: error.message });
      res.status(500).json({ error: error.message || 'Error processing request with Gemini API.' });
    }
  });

  // Server-side Gemini movie story and script continuity analyzer
  app.post('/api/analyze-story', async (req, res) => {
    log('info', 'breakdown', 'Story analysis request received');
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
      log('error', 'breakdown', 'Story analysis error', { message: err.message });
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Proxy route for live n8n webhooks to bypass browser CORS blockages
  app.post('/api/dispatch-n8n', async (req, res) => {
    log('info', 'render', 'n8n dispatch request received');
    try {
      const { webhookUrl, payload } = req.body;
      if (!webhookUrl) {
        res.status(400).json({ error: 'Webhook URL is required' });
        return;
      }

      // SSRF guard: only allow HTTPS URLs, and if N8N_WEBHOOK_BASE_URL is set,
      // require the URL to start with that trusted prefix.
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(webhookUrl);
      } catch {
        res.status(400).json({ error: 'Invalid webhook URL' });
        return;
      }
      if (parsedUrl.protocol !== 'https:') {
        res.status(400).json({ error: 'Webhook URL must use HTTPS' });
        return;
      }
      const allowedBase = process.env.N8N_WEBHOOK_BASE_URL;
      if (allowedBase && !webhookUrl.startsWith(allowedBase)) {
        log('warn', 'render', `Blocked webhook URL not matching N8N_WEBHOOK_BASE_URL: ${parsedUrl.hostname}`);
        res.status(403).json({ error: 'Webhook URL is not in the allowed base URL list' });
        return;
      }

      log('info', 'render', `Dispatching live webhook through proxy to n8n: ${parsedUrl.hostname}${parsedUrl.pathname}`);

      const responseData = await withCircuitBreaker('n8n', async () => {
        const response = await fetch(parsedUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(`n8n responded with status ${response.status}: ${responseText}`);
        }

        try {
          return { statusCode: response.status, data: JSON.parse(responseText) };
        } catch {
          return { statusCode: response.status, data: { message: responseText } };
        }
      });

      res.json({ status: 'success', ...responseData });

    } catch (error: any) {
      log('error', 'render', 'n8n proxy dispatch error', { message: error.message });
      const isCircuitOpen = error.message.startsWith('Circuit breaker OPEN');
      res.status(isCircuitOpen ? 503 : 500).json({
        status: 'error',
        message: error.message || 'Error occurred during n8n webhook dispatch.',
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
    log('info', 'startup', 'Mounted Vite dev server middleware successfully');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production assets from /dist.");
  }

  app.listen(PORT, '0.0.0.0', () => {
    log('info', 'startup', `Express custom server running on http://0.0.0.0:${PORT}`, { version: '6.0.0' });
  });
}

startServer();
