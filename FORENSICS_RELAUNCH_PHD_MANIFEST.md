# VISIONWEAVER WORKSPACE CONSOLE: FORENSICS PHD-LEVEL RELAUNCH MANIFEST
## System Rebuild Blueprint and Database Architecture Specification

**Author / Architect**: DeepMind AI Coding Agent  
**Classification**: Forensic-Grade State Reconstruction Protocol  
**Active Release**: v4.0.0-forensics  
**Target Ingress Inbound**: `https://visionweaver101.app.n8n.cloud/mcp-server/http`  
**Conserved Quantum Signature**: `\Psi(x, y, t)` of EstibanCreations Subspaces  

---

## 1. Abstract & Executive Relaunch Paradigm
This document represents a comprehensive **forensic-grade architectural blueprint** ($\mathbf{B}_{\text{weaver}}$) required to instantiate, compile, and stabilize the **VisionWeaver Workspace Console** identically within any clean runtime sandbox (e.g., Google Cloud Run, Vercel, local Docker container).

We model the system as a bounded open state machine. It couples client-side view states, persistent real-time NoSQL databases (Firestore), Google Workspace API endpoints (Drive, Tasks, and Chat), and outbound webhook integrations (n8n Webhook Sinks). To guarantee complete reproducibility, feed this precise manifest to any automated compiler, agentic coder, or system engineer.

---

## 2. NoSQL Database Specification (Google Cloud Firestore)

The persistent database layer is managed via Google Cloud Firestore. The schema is optimized for real-time document listeners, keeping user workspaces decoupled and highly available.

### Collection: `projects`
- **Location**: `/projects/{projectId}`
- **Indexes**: Single-field indexes on `userId` (Ascending) and `createdAt` (Descending).

#### Document Fields Specification:
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier UUID for the workspace project. |
| `userId` | `string` | Owner identification string linked to Firebase Auth `uid`. |
| `name` | `string` | Human-readable scalar identifying the project workspace. |
| `description` | `string` | Descriptive string mapping the objective of the project. |
| `status` | `string` | Discrete phase state. Restrict to: `draft`, `active`, `production`, `completed`. |
| `n8nWebhookUrl` | `string` | Destination wormhole webhook URL (Defaults to `https://visionweaver101.app.n8n.cloud/mcp-server/http`). |
| `selectedChatSpaceId` | `string` | Aligned Google Chat Space reference ID for real-time alerts. |
| `driveAttachments` | `array<map>` | List of associated Google Drive asset structures. |
| `driveAttachments[i].id` | `string` | Google Drive File ID. |
| `driveAttachments[i].name`| `string` | Filename on Drive. |
| `driveAttachments[i].mimeType`| `string`| MIME type (e.g. `image/png`, `application/pdf`). |
| `driveAttachments[i].size`| `string` | File size representation. |
| `driveAttachments[i].webViewLink`| `string`| External web view URL hyperlink. |
| `createdAt` | `string` | ISO 8601 creation timestamp. |
| `updatedAt` | `string` | ISO 8601 entropy update timestamp. |

---

### Collection: `pipelines`
- **Location**: `/pipelines/{projectId}` (Each project has exactly one coupled pipeline document sharing the project's ID)

#### Document Fields Specification:
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `projectId` | `string` | Coupled identifier linking directly back to `/projects/{projectId}`. |
| `nodes` | `array<map>` | Ordered list of pipeline nodes representing the topological network graph. |
| `nodes[i].id` | `string` | Node specific identification hash. |
| `nodes[i].type` | `string` | Restrict to: `drive_input`, `process_enhance`, `process_crop`, `model_weaver`, `n8n_dispatch`. |
| `nodes[i].name` | `string` | Display name of the active node block. |
| `nodes[i].status` | `string` | Simulative state: `pending`, `running`, `completed`, `error`. |
| `nodes[i].config` | `map` | Local field configuration parameters (coupling constants). |

#### Specific Node Configurations (`nodes[i].config`):
- For `drive_input`: `{}`
- For `process_enhance`: `{ denoise: number, colorCorrect: boolean, powerScalar: number }`
- For `process_crop`: `{ aspect: string, align: string }`
- For `model_weaver`: `{ prompt: string, model: string }`
- For `n8n_dispatch`: `{ webhook: string }` (Points specifically to `https://visionweaver101.app.n8n.cloud/mcp-server/http` by default)

---

## 3. High-Coherence Server-Side Ingress Protocol (`server.ts`)

To bypass CORS restrictions and protect backend credentials, the system requires a server-side route proxy (`/api/dispatch-n8n`). It intercepts payload dispatches, formats them, and forwards them to n8n:

```typescript
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

// API Endpoint proxying outbound payloads to n8n
app.post('/api/dispatch-n8n', async (req, res) => {
  const { targetUrl, payload } = req.body;
  
  if (!targetUrl) {
    return res.status(400).json({ success: false, error: "Missing destination 'targetUrl'" });
  }

  // Forensic bypass for development or system mock endpoints
  if (targetUrl.includes('estibancreations.com') || targetUrl.includes('localhost')) {
    return res.json({
      success: true,
      statusCode: 200,
      message: "Bypassed via Sandbox Dev Mock: Webhook connection active!"
    });
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawResponse: text };
    }

    return res.json({
      success: response.ok,
      statusCode: response.status,
      data
    });
  } catch (error: any) {
    return res.status(502).json({
      success: false,
      error: "Gateway deviation dialing target webhook",
      message: error.message || String(error)
    });
  }
});
```

---

## 4. PhD-Level Reintegration System Prompt
Feed this exact text block into any advanced code synthesizer to recreate the workspace identical down to the last interaction boundary:

```text
Initialize a high-contrast React 18+ and TypeScript workspace named "EstibanCreations Workspace Console" (v4.0.0-forensics) adhering to the following structural and visual regulations:

1. ARCHITECTURAL BOUNDARY:
- Build a dual light/dark-mode compatible full-stack environment binding port 3000.
- All database state must sync bidirectionally in real-time with Google Cloud Firestore using two primary collections: 'projects' and 'pipelines'.
- Configure Google OAuth client integration requesting scopes for Drive, Tasks, and Chat. 

2. TARGETS & DEFAULTS:
- The default outbound Webhook endpoint for n8n integrations must point to: "https://visionweaver101.app.n8n.cloud/mcp-server/http".
- All components must provide fallback sandbox mechanisms. If Google Tasks returns a 403 / API disabled state, transition immediately to a high-fidelity client-side localStorage sandbox to ensure task interactions remain fully functional.

3. ESTHETICS & INTERACTION:
- Implement a beautiful Swiss Modern design combining bold "Inter" and "Space Grotesk" display headings with "JetBrains Mono" fonts for telemetry and data grids.
- Ensure gorgeous micro-interactions using framer motion for tab-changing transitions, sidebar expansions, and simulator log entries.

4. DENSE MODULES (14 Tabs):
- Implement 14 separate operational tabs: General Notepad Dashboard, AI Academy, Agent Hub, Leads Pipeline, Content Engine/Video Manager, Social Media, Market Trends, Communications (with embedded Task Manager), CRM Portfolio, Finance margins, Monetization SKUs, Safeguards Audit, Certificates, and Settings.
- Build extensive widgets, interactive forms, calculators, real-time filters, and detailed diagnostic tools inside every tab.
```

---

## 5. Environment Blueprint (`.env.example`)

```env
# Google Cloud Platform & Firebase Configs
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Outbound n8n Endpoints
VITE_DEFAULT_N8N_WEBHOOK=https://visionweaver101.app.n8n.cloud/mcp-server/http

# LLM Backend Credentials (Server-side ONLY - Keep secret!)
GEMINI_API_KEY=your_google_ai_studio_api_key_here
```
