# CLAUDE.md — Dorian AI Agent Builder

## Project Overview

Dorian is a visual AI agent builder that lets users create AI workflows using a Blockly-based drag-and-drop interface. Users connect blocks (Gmail, AI, data, control flow) into workflows that execute on the backend via generated JavaScript code.

- **Frontend**: React 18 + Vite (port 3000) at `dorian/dorian-ui/`
- **Backend**: Express.js API (port 3001) at `dorian/server/`
- **Branch**: `integrating` (main branch: `main`)

## Architecture & Key Files

### Client (`dorian/dorian-ui/src/`)

```
src/
├── main.jsx                     # React entry point
├── App.jsx                      # BrowserRouter: "/" → HomePage, "/builder" → BuilderPage
├── components/
│   ├── builder/
│   │   ├── BuilderPage.jsx      # Main builder: toolbar + canvas + output/code panels + GmailPrompt modal
│   │   ├── WorkflowCanvas.jsx   # Blockly workspace initialization, zoom controls, toolbox toggle
│   │   ├── GmailPrompt.jsx      # Gmail OAuth connection modal (centered overlay)
│   │   ├── PropertiesPanel.jsx  # Block properties editor (right panel)
│   │   ├── BlockPalette.jsx     # Block category sidebar
│   │   └── WorkflowBlock.jsx    # Individual block component
│   ├── home/
│   │   ├── HomePage.jsx         # Landing page with hero, features, CTA, footer
│   │   ├── AnimatedGrid.jsx     # Canvas-based animated dot grid background
│   │   └── FeatureCard.jsx      # Feature showcase card
│   ├── layout/
│   │   └── Navigation.jsx       # Top nav bar with theme toggle
│   └── shared/
│       └── Button.jsx           # Reusable button with framer-motion
├── config/
│   ├── customBlocks.js          # 21 Blockly block definitions + JavaScript generators
│   └── toolbox.js               # Blockly toolbox category configuration
├── services/
│   └── api.js                   # API client (fetch wrapper with credentials)
├── store/
│   └── builderStore.js          # Zustand store: workspace, Gmail, modal state + actions
└── styles/
    └── global.css               # CSS variables, reset, theme support
```

### Server (`dorian/server/src/`)

```
src/
├── server.js                    # Express app, CORS, session config, route mounting
├── config/
│   └── gmail-config.js          # Google OAuth2 client, scopes, token refresh
├── routes/
│   ├── auth.js                  # OAuth flow: /google/url, /google/callback, /status, /logout
│   ├── gmail-routes.js          # Gmail API: /messages, /send, /reply, /mark-read, /archive
│   └── workflows.js             # Workflow execution: /execute, /save, /list
└── services/
    ├── workflowEngine.js        # Executes generated JS code with context (Gmail, AI, utils)
    └── gmailService.js          # Gmail API wrapper (list, get, send, reply, mark, archive)
```

## Tech Stack

- **Frontend**: React 18, Vite 5, Blockly 10.4, Zustand 5, Framer Motion 10, React Router 6, Lucide React
- **Backend**: Express 4, googleapis 129, groq-sdk 0.37, express-session
- **Block Renderer**: Blockly Zelos (rounded/modern blocks)
- **AI Provider**: Groq (llama-3.1-8b-instant)
- **Auth**: Google OAuth2 (session-based, cookie: `dorian.sid`)

## Data Flow

1. User drags blocks → Blockly workspace (SVG)
2. "Run" → `javascriptGenerator.workspaceToCode()` → generated JS string
3. Frontend sends `{code, agentType}` to `POST /api/workflows/execute`
4. Backend creates execution context with Gmail/AI methods
5. `new AsyncFunction("context", code)` executes the generated code
6. Context methods call Gmail API / Groq API as needed
7. Logs collected and returned to frontend
8. Frontend displays logs in output panel

## Known Issues (Resolved ✅)

- ✅ **Stray useEffect in builderStore.js**: Lines 706-785 had dead code (React hook outside component) causing module load crash. Removed.
- ✅ **GmailPrompt centering**: framer-motion's transform overrode CSS translate(-50%,-50%). Fixed with style prop.
- ✅ **Logout cookie mismatch**: Cleared `connect.sid` instead of `dorian.sid`. Fixed.
- ✅ **API discarding failure logs**: `api.js` threw on `success:false`, losing backend logs. Fixed to return result directly.
- ✅ **Scrollbar issues**: Added overflow protections on builder containers.
- ✅ **Zoom affecting sidebar**: Added CSS isolation (`transform: none !important; zoom: 1 !important;`) to toolbox.
- ✅ **Gmail OAuth race condition**: Shared global `oauth2Client` caused credentials to be overwritten between concurrent requests. Fixed by creating new OAuth2 client instance per request.
- ✅ **Session cookie domain**: Explicit `domain: "localhost"` prevented cross-port cookie sharing. Removed domain restriction.
- ✅ **Poor OAuth error messages**: Generic errors didn't help debug issues. Added detailed error logging and user-friendly messages for common OAuth failures.

## Configuration Requirements

- **Google Cloud Console Setup** (required for Gmail OAuth):
  1. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
  2. Configure OAuth consent screen (add test users if in testing mode)
  3. Enable Gmail API
  4. Add required scopes: `gmail.readonly`, `gmail.send`, `gmail.modify`
  5. See: https://console.cloud.google.com/apis/credentials

## Verification Status (Phase 4 Complete ✅)

- ✅ **Build**: `npm run build` succeeds with zero errors (dist: 40KB CSS, 1MB JS)
- ✅ **Syntax**: All server files pass Node.js syntax validation
- ✅ **Design**: Scratch-style palette applied across all components
- ✅ **Regression**: All original bugs fixed (scrollbar, centering, cookie, logs)

Design System
Design Philosophy
The UI should feel like Anthropic.com meets Quanta Magazine — editorial, warm, intellectual, quietly beautiful. NOT a typical SaaS dashboard. Think premium publication that happens to be a tool.
Typography

Headings: Serif font — use Instrument Serif, Newsreader, or Playfair Display (Google Fonts). Let headings breathe with generous line-height and letter-spacing.
Body: Clean sans-serif — Inter, DM Sans, or Source Sans 3.
Hierarchy: Clear and deliberate. Should feel like a beautifully typeset publication.

Color Palette (Warm, Muted, Earthy)
DO NOT use the old blue-purple scheme. The palette should be warm and sophisticated:

Backgrounds: Warm off-white / cream (#FAF8F5, #F5F0EB) — never stark white
Text: Rich warm dark (#1a1a1a, #2d2b28) — never pure black
Primary accent: Warm terracotta / burnt sienna / warm coral
Secondary accent: Muted sage green or dusty blue
Surfaces: Subtle warm grays and tans for cards, panels
Dark mode: Deep warm darks, not cold blue-blacks

## Commands

```bash
# Client
cd dorian/dorian-ui
npm install
npm run dev        # Start dev server on port 3000
npm run build      # Production build
npm run preview    # Preview production build

# Server
cd dorian/server
npm install
npm run dev        # Start with nodemon on port 3001
npm start          # Start without auto-reload
```

## Conventions

- Component files: PascalCase (`.jsx` + `.css` pair)
- CSS: BEM-like naming (`.component__element--modifier`)
- State: Zustand store with flat state + action functions
- API: Thin service layer in `api.js`, all calls include `credentials: "include"`
- Blocks: Defined in `customBlocks.js` with `Blockly.Blocks[name]` + `javascriptGenerator.forBlock[name]`
- Theme: `data-theme="light|dark"` attribute on `<html>`, CSS variables for all theme-dependent values

## IMPORTANT: Sound Notification

After finishing responding to my request or running a command, run this command to notify me by sound:

```bash
afplay /System/Library/Sounds/Funk.aiff
```
