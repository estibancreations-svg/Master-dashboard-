# VisionWeaver v6 — Production Runbook

**System:** SYS-VISION-001  
**Version:** 6.0.0  
**Last Updated:** 2026-08-19

---

## 1. Architecture Overview

```
Browser / Vercel Edge
    │
    ▼
Express Server (server.ts)
    ├─ /api/health           — overall + per-stage status
    ├─ /api/health/:stage    — individual pipeline stage probe
    ├─ /api/validate/scene   — pre-submit payload validation
    ├─ /api/enrich-payload   — Gemini enrichment (circuit-breaker wrapped)
    ├─ /api/analyze-story    — Gemini continuity analysis
    ├─ /api/dispatch-n8n     — n8n webhook proxy (circuit-breaker: n8n)
    ├─ /api/backup/export    — on-demand audit + state snapshot export
    ├─ /api/audit            — read last 200 audit entries
    └─ /api/audit/transition — record scene/job state transitions
    │
    ▼
Supabase (production_jobs, production_scenes)
Supabase Vault  →  VISIONWEAVER_CRON_SECRET
n8n Orchestrator v7 (cron every minute)
```

---

## 2. Pipeline Stages

| Stage # | Stage Name      | Description                              |
|---------|-----------------|------------------------------------------|
| 1       | Intake          | Job submitted, owner_id & approval set   |
| 2       | Parse           | Creative concept text parsed             |
| 3       | Breakdown       | Scene list generated                     |
| 4       | Cinematography  | Camera angles & prompts assigned         |
| 5       | Render          | Individual scenes dispatched to renderer |
| 6       | QC              | Quality-check pass/fail per scene        |
| 7       | Package         | Final assembly & delivery URL generated  |

---

## 3. Common Failure Scenarios

### 3.1 Job Stuck in `queued` for > 5 Minutes

**Symptoms:** Job remains `queued` after orchestrator cron has run.

**Diagnosis:**
```bash
# Check orchestrator cron logs in n8n
# Verify Vault secret rotation hasn't expired VISIONWEAVER_CRON_SECRET
curl https://your-supabase-project.supabase.co/functions/v1/orchestrator-v7 \
  -H "Authorization: ******"
```

**Resolution:**
1. Rotate `VISIONWEAVER_CRON_SECRET` in Supabase Vault if expired.
2. Manually trigger the n8n cron webhook.
3. If job row is corrupted, set `status = 'failed'`, `error_message = 'manual reset'` and create a new job.

---

### 3.2 Circuit Breaker OPEN on `n8n`

**Symptoms:** `POST /api/dispatch-n8n` returns HTTP 503 — `Circuit breaker OPEN for service: n8n`.

**Diagnosis:**
```
GET /api/health
→ circuitBreakers.n8n.state === "open"
```

**Resolution:**
1. Verify n8n is reachable: `curl <n8n-webhook-url>`.
2. Wait 30 seconds for automatic recovery (`RECOVERY_TIMEOUT_MS`).
3. If n8n is down, scale or restart n8n service.
4. Circuit breaker auto-resets after 2 consecutive successes in half-open state.

---

### 3.3 Supabase Connection Failure

**Symptoms:** `/api/health` reports stage status `degraded`; UI shows no jobs.

**Diagnosis:**
1. Check Supabase dashboard → `Settings → Database → Connection pooling`.
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct in Vercel environment.

**Resolution:**
1. Rotate anon key if suspected compromise → redeploy Vercel.
2. If pool exhausted: increase pool size in Supabase dashboard or add connection pooler (PgBouncer).

---

### 3.4 Rate Limit Errors (429)

**Symptoms:** Clients receive `429 Too many requests`.

**Current limit:** 60 requests / minute / IP.

**Resolution:**
- Confirm the client is not in a retry loop.
- If a legitimate operator needs a higher limit, adjust `RATE_MAX_REQUESTS` in `server.ts` and redeploy.

---

### 3.5 Scene in `failed` State

**Symptoms:** Job pipeline shows `failed`, `active.error_message` populated in UI.

**Resolution:**
1. Read `error_message` from UI or Supabase `production_jobs` table.
2. If render provider error: check provider status, retry by duplicating the job.
3. If QC failure: review `qc_state` in `production_scenes` and adjust concept then resubmit.

---

## 4. Manual Intervention Procedures

### 4.1 Force-Reset a Stuck Job

```sql
-- In Supabase SQL Editor
UPDATE production_jobs
SET status = 'failed',
    error_message = 'Operator reset: ' || NOW()
WHERE id = '<job-id>'
  AND status NOT IN ('complete', 'failed');
```

### 4.2 Export Backup Snapshot

```bash
curl -o backup-$(date +%s).json https://your-app.vercel.app/api/backup/export
```

### 4.3 View Recent Audit Trail

```bash
curl https://your-app.vercel.app/api/audit | jq '.entries[-20:]'
```

### 4.4 Record a Manual State Transition

```bash
curl -X POST https://your-app.vercel.app/api/audit/transition \
  -H 'Content-Type: application/json' \
  -d '{"actor":"operator","action":"manual_reset","entity":"job","entityId":"<id>","fromState":"queued","toState":"failed"}'
```

---

## 5. Backup Retention Policy

| Backup Type           | Frequency         | Retention | Storage         |
|-----------------------|-------------------|-----------|-----------------|
| Supabase PITR         | Continuous        | 7 days    | Supabase-managed|
| On-demand JSON export | On operator call  | Manual    | Operator bucket |
| Audit trail snapshot  | Part of export    | N/A       | Per export file |

**Disaster Recovery SLA:** RPO ≤ 1 hour (Supabase PITR), RTO ≤ 30 minutes (redeploy from main branch).

---

## 6. Escalation Path

| Severity | Condition                              | Action                                      |
|----------|----------------------------------------|---------------------------------------------|
| P1       | All jobs stuck, CB open, DB unreachable| Page on-call → escalate to Supabase Support |
| P2       | Orchestrator cron missing > 3 runs     | Restart n8n, rotate cron secret             |
| P3       | Elevated failure rate (> 10%)          | Review logs, export backup, file ticket     |
| P4       | Single job failure                     | Self-service via runbook §3.5               |
