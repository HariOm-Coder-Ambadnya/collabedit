# CollabEdit — Real-Time Collaborative Text Editor

A production-ready collaborative editor built with **React + TipTap**, **Node.js + Socket.IO**, **Yjs CRDT**, and **MongoDB**.

---

## Folder Structure

```
collabedit/
├── backend/
│   ├── models/
│   │   └── Document.js          # Mongoose schema
│   ├── routes/
│   │   └── document.js          # REST API routes
│   ├── socket/
│   │   └── index.js             # Socket.IO + Yjs sync
│   ├── server.js                # Express entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CollabEditor.jsx  # TipTap + Yjs editor
    │   │   ├── Toolbar.jsx       # Formatting toolbar
    │   │   ├── UserPresence.jsx  # Avatar stack
    │   │   ├── RevisionHistory.jsx
    │   │   └── ConnectionStatus.jsx
    │   ├── hooks/
    │   │   ├── useSocket.js      # Socket.IO hook
    │   │   └── useCollaboration.js # Yjs + presence hook
    │   ├── pages/
    │   │   ├── HomePage.jsx      # Create / join document
    │   │   └── EditorPage.jsx    # Full editor view
    │   ├── styles/
    │   │   └── globals.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── .env.example
```

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, PORT, CLIENT_URL
npm install
npm run dev
# Runs on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env: set VITE_BACKEND_URL=http://localhost:4000
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3. Open the app

Visit `http://localhost:5173`, click **New Document**, then share the URL with others to collaborate.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/document` | Create new document |
| GET | `/api/document/:id` | Get document by ID |
| PATCH | `/api/document/:id` | Update document title |
| GET | `/api/document/:id/revisions` | List all revisions |
| GET | `/api/document/:id/revisions/:index` | Get revision content |

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-document` | Client → Server | Join a document room |
| `yjs-state` | Server → Client | Full Yjs state on join |
| `yjs-update` | Bidirectional | Incremental CRDT update |
| `cursor-update` | Bidirectional | User cursor position |
| `presence-update` | Server → Client | Active users list |
| `typing` | Client → Server | Typing indicator |
| `update-title` | Client → Server | Rename document |
| `save-revision` | Client → Server | Manually save revision |
| `user-join` / `user-leave` | Server → Client | Presence events |

---

## Deployment

### Backend → Render

1. Push `backend/` to a GitHub repo (or monorepo root)
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set:
   - **Build command:** `npm install`
   - **Start command:** `node server.js`
4. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   CLIENT_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   PORT=4000
   ```

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set environment variable:
   ```
   VITE_BACKEND_URL=https://your-backend.onrender.com
   ```
4. Deploy — Vercel auto-detects Vite.

---

## Architecture

```
Browser A ──────────────────────────────────── Browser B
   │                                               │
TipTap + Yjs                               TipTap + Yjs
   │  (local Y.Doc)                   (local Y.Doc)│
   │                                               │
   └──── Socket.IO ──── Node.js ──── Socket.IO ────┘
                           │
                      Yjs in-memory
                      (server Y.Doc)
                           │
                        MongoDB
                    (persist & history)
```

- **Yjs CRDT** ensures conflict-free merging — no manual merge logic needed
- Updates are **binary-encoded** (base64 over Socket.IO)
- Server holds an in-memory Y.Doc per room; syncs to MongoDB every 3 seconds
- On room empty, final state + revision is persisted and room is cleaned up

---

## Features

- ✅ Real-time CRDT collaboration (Yjs)
- ✅ Live cursors with user names & colors
- ✅ User presence avatars + typing indicators
- ✅ Rich text formatting (Bold, Italic, Underline, Headings, Lists, Code)
- ✅ Document rooms via URL `/doc/:id`
- ✅ Auto-save to MongoDB every 3s
- ✅ Revision history with preview
- ✅ Copy shareable link
- ✅ Dark mode toggle (persisted)
- ✅ Connection status indicator
- ✅ Editable document title (synced across users)
