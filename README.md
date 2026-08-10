# VisionWeaver Command v6.0

VisionWeaver is the governed creative-media production system for approved concept intake, AI scene planning, continuity-safe prompt generation, provider routing, resumable rendering, human QC, packaging, and audit-ready handoff.

## Production architecture

- React command console with Supabase passwordless authentication and realtime updates.
- Supabase Postgres is the production system of record.
- `visionweaver-orchestrator` advances one durable stage per minute and resumes after failures.
- Anthropic handles structured planning; Runway handles server-side video generation.
- Google Drive is the source/archive layer; GitHub is the code and governance authority.
- Every production is owner-isolated. Review gates, prompt versions, provenance and provider receipts are first-class records.

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
```

Only the Supabase URL and anon key belong in the browser environment. Provider and cron secrets remain in Supabase Vault.

## Quality gates

```bash
npm run lint
npm run build
```

See [the production run record](docs/run-records/2026-08-10-visionweaver-production-release.md) for reconciliation, connections, security controls and source lineage.
