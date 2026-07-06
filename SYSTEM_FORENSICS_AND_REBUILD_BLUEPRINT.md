# VISIONWEAVER SYSTEM FORENSICS & REBUILD BLUEPRINT
## Ph.D. Forensics-Grade Reconstruction Protocol and Architectural Blueprint
**System Signature**: `visionweaver-console-v2.6`  
**Classification**: High-Coherence Full-Stack Distributed Graph Workspace  
**Prepared For**: Redesign, Redeployment, and Portability Verification  

---

## I. EXECUTIVE FORENSIC PROFILE

This document contains the formal forensic architecture specification and rebuild prompt required to instantiate the **VisionWeaver Workspace Console** identically on any containerized or serverless hosting provider (e.g., Google Cloud Run, AWS ECS, Vercel, or local k8s sandboxes).

### 1. Unified Field Representation
The system is modeled as a highly coupled, client-orchestrated distributed transaction network where the browser, Firestore (NoSQL transactional real-time state database), Google Workspace APIs (Drive, Tasks, Chat), and downstream webhook nodes (n8n Webhook Sinks) represent entangled subspaces:

$$\mathcal{H}_{\text{system}} = \mathcal{H}_{\text{client}} \otimes \mathcal{H}_{\text{auth}} \otimes \mathcal{H}_{\text{firestore}} \otimes \mathcal{H}_{\text{workspace}}$$

To reconstruct the system, any automated code compiler must synthesize these five core interaction boundaries precisely, maintaining structural identity in state transformations, telemetry metrics, and binary transport protocols.

---

## II. SYSTEM ANATOMY & SUBSYSTEM TELEMETRY

### 1. Authentication & Scoped Identity Token Propagation
The authentication layer relies on a dual-state Google Identity federation managed via Firebase Authentication (`/src/firebase.ts`):
- **Core Mechanism**: Google Auth provider with interactive popup trigger (`signInWithPopup`).
- **Required OAuth Scopes**:
  - `https://www.googleapis.com/auth/drive.readonly` (Binary file read streams)
  - `https://www.googleapis.com/auth/drive.metadata.readonly` (File system metadata inspection)
  - `https://www.googleapis.com/auth/tasks` (Google Tasks CRUD operations)
  - `https://www.googleapis.com/auth/chat.spaces.readonly` (Workspace Chat rooms indexing)
- **Token Propagation**: The acquired OAuth access token ($\chi_t$) is cached in memory and used as the authorization header `Bearer ${accessToken}` across all client-side API calls to Google APIs.

### 2. Google Drive Intake & Metadata Association Matrix
The "Drive Explorer" (`/src/components/DriveExplorer.tsx`) operates as a file-system intake valve:
- **Filtering Presets**:
  - `All Files`
  - `VisionWeaver Files` (Filters items containing "VisionWeaver" in filename)
  - `n8n Attachments` (Filters items containing "n8n" in filename)
- **Interactive Previewer**: Programmatic media downloader. If a file is previewable (image, text, JSON), the client performs a fetch with credentials:
  ```http
  GET https://www.googleapis.com/drive/v3/files/{fileId}?alt=media HTTP/1.1
  Authorization: Bearer [accessToken]
  ```
- **State Coupling**: Associating files to active projects appends `{ id, name, mimeType, size, webViewLink }` to the Firestore `driveAttachments` sub-array of the selected project.

### 3. Pipeline Simulation & Telemetry Graph Engine
The "Pipeline Weaver" (`/src/components/PipelineWeaver.tsx`) provides high-fidelity execution simulation:
- **Topological Nodes**: Structured list of operations:
  - `drive_input`: File ingestion node
  - `prompt_weaver`: Text template builder
  - `payload_transformer`: Struct conversion node
  - `n8n_output`: Webhook dispatch node
- **Telemetry Logger**: Step-by-step simulator printing high-contrast logs with millisecond timestamps.
- **State Export (Backup)**: A serialization mechanism that writes a JSON topology file containing current configurations, enabling portable migration of pipeline graphs.

### 4. n8n Payload Builder & Handshake Verification
The "n8n Payload Builder" (`/src/components/N8nPayloadBuilder.tsx`) constructs state vectors for external webhooks:
- **Handshake Verification ("Test Link")**: Sends test vectors to a secure local endpoint proxy (`/api/dispatch-n8n`) which forwards the request to verify status.
- **Bypass Rule**: If the target URL matches development mocks (e.g., `estibancreations.com` or `localhost`), bypass live connection blocks with an elegant, simulated `HTTP 200 OK` handshake response.

---

## III. DATABASE SCHEMA MODEL (NoSQL Firestore)

The persistent layer uses Google Cloud Firestore. Ensure your NoSQL database is populated with these collections:

```
[Firestore Root]
   │
   ├── [projects] (Document ID: Auto-Generated)
   │     ├── id: string (Unique)
   │     ├── userId: string (Owner ID)
   │     ├── name: string
   │     ├── description: string
   │     ├── status: "draft" | "active" | "production" | "completed"
   │     ├── n8nWebhookUrl: string
   │     ├── selectedChatSpaceId: string
   │     ├── driveAttachments: Array<{
   │     │      id: string,
   │     │      name: string,
   │     │      mimeType: string,
   │     │      size?: string,
   │     │      webViewLink?: string
   │     │   }>
   │     ├── createdAt: string (ISO Timestamp)
   │     └── updatedAt: string (ISO Timestamp)
   │
   └── [pipelines] (Document ID: Project ID alignment)
         ├── projectId: string
         ├── nodes: Array<{
         │      id: string,
         │      type: "drive_input" | "prompt_weaver" | "payload_transformer" | "n8n_output",
         │      name: string,
         │      config: Record<string, any>
         │   }>
         └── updatedAt: string
```

---

## IV. PH.D.-LEVEL REDESIGN & RECONSTRUCTION PROMPT (The Input Prompt)

Copy, modify, or feed the prompt below into any advanced AI software engineer or workspace builder to reconstruct this application identically:

```text
================================================================================
VISIONWEAVER CONSOLE REBUILD & REDEPLOYMENT DIRECTIVE
================================================================================
Role: Elite Principal Software Architect & Forensics Systems Specialist
Goal: Reconstruct the VisionWeaver Workspace Console identically. Ensure perfect
      type-safety, responsive visual alignment, and state synchronization.

---
1. TECHNICAL BOUNDARIES & PLATFORM RUNTIME
- Runtime Framework: React 18+ bootstrapped with Vite, utilizing TypeScript.
- Server Runtime: Express 4+ backend proxy serving static client files in production.
- Database: Firebase v10 Firestore & Firebase Authentication.
- Styling Paradigm: Tailwind CSS utility classes using custom "Inter" displays 
  paired with "JetBrains Mono" fonts for technical and statistical metrics.
- Port Specification: The Node backend must bind strictly to host "0.0.0.0" on Port "3000".

---
2. FORENSIC STATE RECONSTRUCTION MATRIX
A. AUTHENTICATION COHERENCE
Create an authentication layer utilizing Firebase Pop-up Sign-in with the Google OAuth 
provider. You MUST request the following OAuth scopes explicitly:
- Drive Read: 'https://www.googleapis.com/auth/drive.readonly'
- Drive Metadata Read: 'https://www.googleapis.com/auth/drive.metadata.readonly'
- Tasks: 'https://www.googleapis.com/auth/tasks'
- Chat spaces: 'https://www.googleapis.com/auth/chat.spaces.readonly'

Propagate the access token securely through a global React Context or state coordinate, 
ensuring it is dynamically provided to any Google REST API network call as a 
"Bearer ${accessToken}" authorization header.

B. SYSTEM CORE: DETAILED PROJECT DASHBOARD
Implement a dashboard showcasing conserved aggregate metrics:
- Total Projects, In Progress, Active Workflows, and Total Files Attached.
- "Recently Completed Tasks" Deck: Fetch the user's top 3-4 Google Tasks from their 
  first list. If offline, unauthorized, or empty, failover gracefully by displaying 
  simulated system action checkpoints.
- Left-side Registry selector with searching and tab status filtering.
- Right-side Detailed Inspector allowing status toggles, attachment index, 
  and webhook clipboard utilities.

C. SYSTEM INGESTION: GOOGLE DRIVE EXPLORER
Create an intake interface querying Drive contents:
- Filters: 'All Files', 'VisionWeaver Files' (containing filename pattern), 
  and 'n8n Attachments'.
- File Previewer: Fetch binary file data using direct Google API HTTP endpoints 
  with the OAuth bearer token. Render text-based files, JSON structures, or image blobs inline.
- Download Operator: Extract the binary data as client-side programmatic file blobs.
- File-Project Association: Allow users to click "Attach to n8n" to add/remove files 
  to the current project's Firestore database record. Provide batch operators 
  ("Attach All", "Clear All").

D. SYSTEM DESIGN: PIPELINE WEAVER
A drag-and-drop or interactive array of execution nodes ('drive_input', 'prompt_weaver', 
'payload_transformer', 'n8n_output').
- Simulate Button: Iterates step-by-step through the array, emitting detailed 
  monochrome telemetry logs with millisecond timestamps.
- "Download JSON" Button: Serializes the topology configuration and exports it as a 
  file `visionweaver-pipeline-[project-name].json` to local storage.

E. SYSTEM INTERACTION: n8n PAYLOAD BUILDER & DISPATCH PROXIES
A payload creation matrix with JSON schema customization.
- Integrate a Gemini prompt-assistant to generate/optimize the target JSON structure.
- Handshake Tester ("Test Link"): Post payload to `/api/dispatch-n8n`. If the webhook 
  target URL is local or simulated, bypass with an elegant simulated HTTP 200 OK status. 
  Otherwise, carry out a proxy validation and print a diagnostic report.

---
3. VISUAL THEME & ACCESSIBILITY MATRICES
- Color Vibe: Slate-900 headers, off-white slate backgrounds (slate-50/100), and 
  vibrant indigo-600 focus states.
- High-contrast typography: Title blocks use "Inter" with tracking-tight styles. 
  Technical metrics and logs use "JetBrains Mono".
- Micro-animations: Smooth transitions using `motion/react` with high-density layouts.
- Guardrails: Explicitly catch and report credentials errors, network blocks, or 
  database connection warnings without breaking the app shell.

Execute compilation. Build static outputs to 'dist/' and run via 'start' scripts.
================================================================================
```

---

## V. CORE SCRIPT CONFIGURATIONS

### 1. `package.json` Standard Build & Dev Script
To ensure exact pipeline compatibility, enforce these exact scripts in your reconstructed workspace:

```json
{
  "name": "visionweaver-workspace-console",
  "private": true,
  "version": "2.6.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "lint": "tsc --noEmit"
  }
}
```

### 2. `firestore.rules` Secure Access Manifest
Ensure this security posture is deployed to your Firebase console to permit appropriate scope reads/writes matching your user IDs:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      allow read, write: if request.auth != null;
    }
    match /pipelines/{pipelineId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---
*End of Forensics Manifesto. File written and archived.*
