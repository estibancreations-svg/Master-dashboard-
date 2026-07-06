# VISIONWEAVER SYSTEM RECONSTRUCTION MANIFESTO
## Formal Physics PhD-Level Prompt for Phase-Space Relaunch & Wavefunction Collapse
**Author / System Architect**: DeepMind AI Coding Agent
**Cosmological Timestamp**: June 18, 2026

---

## 1. ABSTRACT & EXECUTIVE PRINCIPLE
This document represents the absolute state-reconstruction tensor ($\mathbf{T}_{sys}$) designed to instantiate, compile, and stabilize the **VisionWeaver Workspace Console** within any clean target runtime sandbox. We model the system as a bounded open quantum system where the developer, the database (Firestore), and external Google Workspace API manifolds (Drive, Tasks, Chat, and the n8n Webhook Sink) represent coupled Hilbert subspaces. 

To relaunch this application identically, feed this comprehensive prompt to an agentic compiler or LLM builder. It outlines the exact architectural boundaries, mathematical transformations, data structures, and styling paradigms needed to transition the target codebase from a vacuum state ($|0\rangle$) to the highly-coherent operational state ($|\Psi_{\text{VisionWeaver}}\rangle$).

---

## 2. THE FUNDAMENTAL COUPLING OPERATORS (Core System Prompt)

```text
You are an elite, full-stack software system physicist. Your objective is to engineer a pristine, high-contrast, production-ready React 18+ and TypeScript workspace named "VisionWeaver Workspace Console" governed by the following mathematical and architectural constraints.

### I. STATE SPACE & BOUNDARY CONDITIONS (Data Architecture)
Define the system phase space by building `/src/types.ts` containing the following conserved structures:

1. Project State ($\mathbf{P}$):
   - id: string (Unique spatial coordinate)
   - name: string (Identifer scalar)
   - description: string (Long-range field description)
   - status: 'draft' | 'active' | 'production' | 'completed' (Discrete phase state)
   - n8nWebhookUrl: string (The destination wormhole coordinate)
   - driveAttachments: DriveFileAttachment[] (Entangled mass coordinates)
   - selectedChatSpaceId: string (Aligned communication spin)
   - userId: string (Subspace owner key)
   - createdAt: string (Temporal inception point)
   - updatedAt: string (Entropy update timestamp)

2. Pipeline Node Topology ($\mathbf{N}$):
   - id: string
   - type: 'drive_input' | 'prompt_weaver' | 'payload_transformer' | 'n8n_output'
   - name: string
   - status: 'pending' | 'running' | 'completed' | 'error'
   - config: Record<string, any> (Local field coupling constants)

3. File Attachment Scalar ($\mathbf{A}$):
   - id: string, name: string, mimeType: string, size?: string, webViewLink?: string

### II. GLOBAL FIELD COHERENCE (Google OAuth & Firebase Engine)
Establish a unified authentication field using Firebase and Google client-side OAuth.
1. The global OAuth access token (the coherence factor, $\chi_t$) must be securely propagated to all child subsystems.
2. Initialize Firebase authentication and Firestore listeners to sync Projects and Pipelines in real-time. When a user authenticates, retrieve their metadata and collapse the auth state into a clean workspace profile.

### III. THE FIVE COMPONENT MANIFOLDS (User Interface Tabs)
The application must present an elegant, single-view console utilizing a sleek "Slate Dark & Warm White" minimalist aesthetic with high-contrast typography (Inter display paired with JetBrains Mono for status metrics). The workspace contains five critical tabs:

#### Tab A: General Dashboard (Entropy Tracker & Conserved Quantities)
Design a comprehensive Project Dashboard displaying:
1. Aggregate Metrics Cards (Conserved Fields):
   - Total Projects (System dimension)
   - Projects In Progress (Active kinetic energy)
   - Active Workflows (Total workflows with 'active' or 'production' status)
   - Total Files Attached (Coupled baryonic coordinates)
2. Recently Completed Tasks:
   - Synchronize with Google Tasks to display the top 3-4 recently resolved actions. If offline or unauthorized, populate with system-simulated default bootstrapping check-points.
3. Interactive Pipeline Registry:
   - Provide a left-side registry quick search with status filters ('all', 'draft', 'active', 'production', 'completed').
   - Selecting a project registry element dynamically populates the detailed inspector panel.
4. Detailed Inspector & Status Action Gate:
   - Expose a button to toggle the selected project's status between 'completed' and 'active' immediately in Firestore.
   - List associated Google Drive assets with individual "Get" (direct streaming media download) and "Drive" (external web hyperlink) actions.
   - Display the target n8n Webhook URL with a one-click copyable clipboard utility.

#### Tab B: Google Drive Explorer (Intake & Entanglement Operator)
An interactive file explorer interfacing directly with the Google Drive API:
1. Target: Filter files belonging to 'Estibancreations' and associated VisionWeaver or n8n files.
2. Actions: Provide live search and filter presets ('All Files', 'VisionWeaver Files', 'n8n Attachments').
3. Interactive Previewer: 
   - Render a viewport inside the app. For previewable files (images, text, JSON), execute a client-side fetch using the OAuth Authorization header `Bearer ${accessToken}` and `alt=media` format. Render images or styled JSON configurations.
4. Download ("Get"): Trigger client-side programmatic Blob downloads of the actual file media.
5. Association Switch: Provide an "Attach to n8n" toggle that adds or removes the file from the current project's `driveAttachments` field in Firestore.
6. Batch Operator: Expose "Attach All" and "Clear All" batch buttons to process large clusters of items instantaneously.

#### Tab C: Pipeline Weaver (Visual Topological Engine)
A drag-and-drop or interactive network compiler to map flow:
1. Allow the user to construct, edit, and reorder an array of Pipeline Nodes ($\mathbf{N}$).
2. Include a simulation runner that walks step-by-step through the pipeline, printing detailed, high-contrast monochrome terminal logs with millisecond timestamps.
3. BACKUP BACKBONE: Implement a "Download JSON" button. When triggered, write a structured JSON payload detailing the current nodes array and configurations, exporting it as `visionweaver-pipeline-[project-name].json` directly to the user's disk.

#### Tab D: n8n Payload Builder (Entropy Sink Webhook Router)
A structured compiler to transmit states to external automated workflow nodes:
1. Render a clean JSON editor showing the exact payload payload model.
2. AI-Assisted prompt input to generate/optimize the payload structure utilizing a server-side Gemini system query (protecting the server-side API keys).
3. CONNECTION HANDSHAKE: Provide a "Test Link" button. It must perform a POST request to `/api/dispatch-n8n`. If the webhook URL matches a system mock or standard workspace domain (e.g., estibancreations.com, localhost), bypass with an elegant simulated HTTP 200 OK message. Otherwise, attempt an active handshake and catch CORS or network blocks with clear diagnostic reports.
4. Live Dispatch: Expose a button to serialize the payload and fire it instantly into the target pipeline endpoint.

#### Tab E: Task Manager & Chat Notifications (Auxiliary Operators)
1. Task Manager: Connect to Google Tasks API. List active task lists, load tasks, and allow users to append new tasks and toggle completion.
2. Chat Notifications: Retrieve Google Chat space IDs and execute Webhook messages to alert relevant personnel of payload deliveries.

### IV. STYLING & ACCESSIBILITY MATRICES (Visual Physics)
1. Tailor all components with Tailwind CSS.
2. Apply high-contrast interactive feedback: hover states, smooth transitions using `motion`, and rounded-xl card boundaries.
3. Avoid "AI Slop" decorative indicators. Keep visual elements strictly functional, readable, and highly polished. No fake system logs, mock terminal metrics, or excessive glowing panels. Pure typography and balanced layout density are the keys.
```

---

## 3. GRAPH REPRESENTATION & SYSTEM FLOW
The operational path of the data manifold flows through the following network vertices:

```
[Google OAuth Login] ──> Collapse wave function: Sets authenticated Token (χ_t)
         │
         ├───> [Dashboard Tab] ──> Read Projects & Tasks metrics (Conserved Fields)
         │
         ├───> [Drive Explorer] ──> Fetch metadata ──> Programmatic Blob Downloader / Previewer
         │         │
         │         └───> Toggle Association ──> [Firestore Project Attachments]
         │
         ├───> [Pipeline Weaver] ──> Visual simulation & log streams ──> Export Backup JSON
         │
         └───> [n8n Payload Builder] ──> AI Optimization (Gemini) ──> Test Handshake ──> Live Webhook Dispatch
```

---

## 4. CRITICAL FILES IMPLEMENTATION SPECIFICATIONS

### A. Back-End Server (`/server.ts`)
Must expose a secure proxy endpoint `/api/dispatch-n8n` to handle the webhook dispatch and test handshakes. This protects client secrets and avoids strict CORS policy collisions:

```typescript
import express from 'express';
import path from 'path';

// Express initialization with standard Port 3000 ingress routing
const app = express();
app.use(express.json());

app.post('/api/dispatch-n8n', async (req, res) => {
  const { webhookUrl, payload } = req.body;
  if (!webhookUrl) {
    return res.status(400).json({ status: 'error', message: 'Missing target webhook URL coordinate.' });
  }

  try {
    // Perform outbound transport
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    res.json({
      status: 'success',
      statusCode: response.status,
      message: `Handshake compiled successfully.`
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: err?.message || 'Outbound connection failed.'
    });
  }
});
```

### B. Front-End Project Dashboard (`/src/components/ProjectDashboard.tsx`)
Must track the statistical aggregates of the system. Let this component act as the central supervisor node.
- Consumes list of `projects: Project[]` from Firestore.
- Determines `activeWorkflowCount` via `projects.filter(p => p.status === 'active' || p.status === 'production').length`.
- Renders the "Recently Completed Tasks" card deck by querying Google Tasks or utilizing local thermodynamic checkpoint variables.

### C. Pipeline JSON Exporter (`/src/components/PipelineWeaver.tsx`)
Include the explicit download algorithm:
```typescript
const downloadPipelineJson = () => {
  const payload = {
    projectId: activeProject?.id,
    projectName: activeProject?.name,
    exportedAt: new Date().toISOString(),
    nodes: nodes.map(n => ({ id: n.id, type: n.type, name: n.name, config: n.config }))
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  a.href = url;
  a.download = `visionweaver-pipeline-${activeProject?.name?.replace(/\s+/g, '-')}.json`;
  a.click();
};
```

---

## 5. STEPS TO RELAUNCH IDENTICALLY
1. **Initialize Project Space**: Create a React-Vite project with Tailwind CSS, TypeScript, and Firebase.
2. **Inject the Reconstruction Manifesto**: Provide this entire file as system instructions to the relaunch compiler.
3. **Establish Firebase & Credentials**: Set up Firestore databases and deploy `firestore.rules`. Configure `.env.example` with the active `GEMINI_API_KEY` and `APP_URL`.
4. **Compile & Boot**: Run `npm install`, compile using `npm run build`, and deploy the resulting node image to your environment of choice (e.g., Google Cloud Run container).

---
*End of Reconstruction Manifesto. The state is now conserved. Execute compilation sequence on target compiler.*
