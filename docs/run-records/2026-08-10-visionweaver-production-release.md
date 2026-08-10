# VisionWeaver production release — 2026-08-10

## Outcome

The canonical VisionWeaver product is a connected production console backed by a resumable Supabase orchestrator. It replaces the generic 14-tab workspace as the primary VisionWeaver surface while preserving historical repositories and the n8n v2.1 workflow as evidence and fallback lineage.

## Reconciled capabilities

- Approved creative intake with owner isolation
- Structured parsing, scene breakdown and cinematic prompt preparation
- 1–20 scene jobs with provider-side rendering
- Durable minute-based execution; no long-running browser task
- Live queue, phase tracking, scene state and completed render access
- Human approval, QC state, prompt version, provenance and integration receipts
- CEO Dashboard status reporting through `ceo_system_status`

## Connected systems

| Connection | Role | State |
|---|---|---|
| Supabase | Auth, Postgres, Realtime, Vault, Edge Functions, Cron | Connected |
| Anthropic | Structured content and production planning | Server-side adapter |
| Runway | Text-to-video rendering | Server-side adapter |
| Google Drive | Recovered sources, reference assets and archives | Source inventory connected |
| GitHub | Code, review and governance system of record | Connected |
| CEO Dashboard | Executive health and exception reporting | Connected |
| n8n v2.1 | Historical/fallback orchestration | Preserved, not primary |

## Security and QC closure

- Replaced public orchestrator execution with a constant-time custom cron-secret boundary stored in Vault.
- Removed provider-secret status detail from the health response.
- Added user ownership and CEO/Architect override policies to production jobs.
- Added review decisions, integration receipts, scene QC, prompt versions and provenance.
- Historical plaintext provider credentials were excluded from code and records; rotation remains an account-owner operational action if not already completed.
- Browser-side arbitrary n8n webhook dispatch is no longer part of the canonical surface.

## Source manifest (deduplicated)

The release reconciles the canonical recovery package, System Bible v2.1, production/setup documentation, memory gems, complete session/conversation logs, organized findings, dashboard and workflow assessments, the August 6 wired bundle, and GitHub lineage including Vision-Weaver 4.0/4.1/5.0/6.0, Dream-Weaver 5.5, Revision Hub, Henry-AI, website assets and AI-video workflow experiments.

Duplicate Drive exports and binary render assets remain referenced in Drive rather than copied into Git.

## Next run period

The database cron invokes the orchestrator every minute. A newly approved job advances one durable stage per invocation; rendering scenes are polled on later runs until complete or the watchdog closes them as failed. No operator action is required between stages unless a review gate or provider/account exception is raised.
