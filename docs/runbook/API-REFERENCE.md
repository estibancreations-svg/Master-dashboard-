# VisionWeaver v6 — Production API Reference

**Base URL (production):** `https://your-app.vercel.app`  
**Base URL (local dev):** `http://localhost:3000`

All endpoints under `/api/` are subject to rate limiting: **60 requests / minute / IP**.

---

## Authentication

The production intake form (`POST` to Supabase `production_jobs`) requires a valid Supabase session (magic-link OTP). Direct API calls to `/api/*` server routes use IP-based rate limiting only; no additional bearer token is required for the server routes at this time.

---

## Endpoints

### `GET /api/health`

Returns overall system health including per-pipeline-stage status and circuit breaker states.

**Response 200:**
```json
{
  "status": "ok",
  "serverTime": "2026-08-19T19:00:00.000Z",
  "version": "6.0.0",
  "pipelineStages": {
    "intake":         { "lastCheck": "...", "status": "ok" },
    "parse":          { "lastCheck": "...", "status": "ok" },
    "breakdown":      { "lastCheck": "...", "status": "ok" },
    "cinematography": { "lastCheck": "...", "status": "ok" },
    "render":         { "lastCheck": "...", "status": "ok" },
    "qc":             { "lastCheck": "...", "status": "ok" },
    "package":        { "lastCheck": "...", "status": "ok" }
  },
  "circuitBreakers": {
    "n8n": { "state": "closed", "failures": 0 }
  }
}
```

---

### `GET /api/health/:stage`

Returns health status for a specific pipeline stage. Updates `lastCheck` timestamp.

**Path parameters:**
- `stage` — one of: `intake`, `parse`, `breakdown`, `cinematography`, `render`, `qc`, `package`

**Response 200:**
```json
{ "stage": "render", "lastCheck": "2026-08-19T19:00:00.000Z", "status": "ok" }
```

**Response 404:** Unknown stage name.

---

### `GET /api/audit`

Returns the last 200 entries from the in-memory audit trail.

**Response 200:**
```json
{
  "count": 42,
  "entries": [
    {
      "ts": "2026-08-19T18:59:00.000Z",
      "actor": "orchestrator",
      "action": "state_transition",
      "entity": "job",
      "entityId": "uuid-here",
      "fromState": "queued",
      "toState": "parsing"
    }
  ]
}
```

---

### `POST /api/audit/transition`

Records a scene or job state transition to the audit trail.

**Request body:**
```json
{
  "actor": "orchestrator",
  "action": "state_transition",
  "entity": "job",
  "entityId": "uuid-here",
  "fromState": "parsing",
  "toState": "scene_breakdown",
  "meta": { "orchestratorVersion": "7" }
}
```

Required fields: `actor`, `action`, `entity`, `entityId`.

**Response 201:** `{ "recorded": true }`  
**Response 400:** Missing required fields.

---

### `GET /api/backup/export`

Downloads a JSON snapshot containing the audit trail and system state. Suitable for off-site backup storage.

**Response 200:** JSON file download (`Content-Disposition: attachment`).

```json
{
  "exportedAt": "2026-08-19T19:00:00.000Z",
  "version": "6.0.0",
  "auditTrail": [...],
  "stageHealth": {...},
  "circuitBreakerStatus": {...}
}
```

---

### `POST /api/validate/scene`

Pre-validates a scene intake payload before submission to Supabase.

**Request body:**
```json
{
  "project_title": "My Production",
  "concept": "A story about...",
  "scene_count": 5,
  "target_platform": "YouTube"
}
```

**Response 200 (valid):** `{ "valid": true, "sanitized": { ... } }`  
**Response 422 (invalid):** `{ "valid": false, "errors": ["..."] }`

---

### `POST /api/enrich-payload`

Enriches an n8n workflow payload using Gemini 2.5 Flash.  
Falls back to a deterministic mock response when `GEMINI_API_KEY` is not configured.

**Request body:**
```json
{
  "template": { "projectName": "...", "pipelineParameters": {} },
  "prompt": "Structure for production",
  "description": "Optional fallback description"
}
```

**Response 200:**
```json
{
  "enrichedPayload": { ... },
  "aiRecommendations": "..."
}
```

---

### `POST /api/analyze-story`

Breaks a story script into 3 scene panels with continuity validation.  
Falls back to hardcoded example scenes when `GEMINI_API_KEY` is not set.

**Request body:** `{ "storyText": "..." }`

**Response 200:**
```json
{
  "success": true,
  "scenes": [ { "sceneNum": 1, "title": "...", ... } ],
  "aiSummary": "..."
}
```

---

### `POST /api/dispatch-n8n`

Proxies a webhook call to an n8n endpoint (bypasses browser CORS). Protected by a circuit breaker — returns 503 when the breaker is open.

**Request body:**
```json
{ "webhookUrl": "https://n8n.example.com/webhook/...", "payload": { ... } }
```

**Response 200:** `{ "status": "success", "statusCode": 200, "data": { ... } }`  
**Response 400:** Missing `webhookUrl`.  
**Response 503:** Circuit breaker open — n8n unreachable.

---

## Error Responses

| Status | Meaning                     |
|--------|-----------------------------|
| 400    | Missing required field      |
| 404    | Unknown route or stage      |
| 422    | Payload validation failed   |
| 429    | Rate limit exceeded         |
| 500    | Internal server error       |
| 503    | Circuit breaker open        |

---

## Rate Limits

| Window   | Max requests | Scope |
|----------|--------------|-------|
| 1 minute | 60           | Per IP |
