# Render migration mapping

Decision recorded November 22, 2026 (America/Chicago).

| Item | Mapping |
| --- | --- |
| Repository | `Master-dashboard-` |
| Reviewed source | [`c553801cc219`](https://github.com/estibancreations-svg/Master-dashboard-/commit/c553801cc219ed5869b6d1c810783c99f97353f1) |
| Placement | Discovery · reconcile lineage |
| Repository action | README identifies a VisionWeaver Command lineage. Resolve its canonical owner and runtime before proposing a duplicate Render service. |
| Hosting decision | Render is the application host for approved runtimes. |
| Data and identity | Retain each existing Supabase binding for Postgres, Auth and Storage where applicable. Preserve each system's access and data boundary. |

## Release evidence

The verified sample contains 27 failed Vercel preview checks across nine GrantOS commit SHAs (three linked projects per SHA), one intervening commit with three successful previews, and a separately observed production availability block. These checks show two documented failure episodes around a temporary recovery. The sample establishes a lower bound on checks, with no claim about total historical incidents.

The [enterprise decision and forensic evidence](https://github.com/estibancreations-svg/Master-System-Buildout/blob/docs/render-migration-2026-11-22/docs/forensics/2026-11-22-render-migration.md) records the exact SHAs, preview results, production effect, migration waves and rollback gate. [GrantOS PR #66](https://github.com/estibancreations-svg/MASTER_CEO_DASHBOARD/pull/66) separately records invariant test failures and uncertified production status.

## Cutover criteria

For a confirmed hosted application, record the Render service, source SHA, build and health checks, data binding, access tests, verified target domain and rollback procedure. Promote after applicable GitHub Quality Gates and runtime checks pass on the exact candidate. Documentation-only repositories carry the mapping in GitHub.

## Migration verification · 2026-11-22T21:35:36-06:00

**Runtime ownership pending.** The README identifies an alternate VisionWeaver lineage. Confirm its ownership and supported Node production entry point before provisioning another service.

[Enterprise verification record](https://github.com/estibancreations-svg/Master-System-Buildout/blob/docs/render-migration-2026-11-22/docs/forensics/2026-11-22-render-migration.md)
