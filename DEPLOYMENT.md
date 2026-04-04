# Deployment Guide

Follow these steps to deploy **CollabEdit**.

## 1. Backend (Render)

1. **GitHub**: Push your `backend/` folder to a GitHub repository.
2. **Create Web Service**:
   - Build Command: `npm install`
   - Start Command: `npm start`
3. **Environment Variables**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A long random string for auth.
   - `CLIENT_URL`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`).
   - `NODE_ENV`: `production`

## 2. Frontend (Vercel)

1. **GitHub**: Push your `frontend/` folder.
2. **Project Settings**:
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Environment Variables**:
   - `VITE_BACKEND_URL`: Your Render backend URL (e.g., `https://collabedit-api.onrender.com`).
   *Note: Do NOT include a trailing slash.*

## 3. Important Notes

- **CORS**: Ensure `CLIENT_URL` in Render matches your Vercel URL exactly.
- **Websockets**: Render supports WebSockets, but if you have issues, the app automatically falls back to polling.
- **Database**: Ensure your MongoDB Atlas allowlist includes `0.0.0.0` or Render's IP ranges.
