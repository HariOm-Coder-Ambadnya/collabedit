# Deployment Guide (Simplified)

This guide summarizes how to redeploy CollabEdit to Render and Vercel.

## 1. Backend (Render)

1.  Log in to [Render](https://dashboard.render.com).
2.  Select your **collabedit-backend** service.
3.  Go to **Settings** -> **Environment Variables**.
4.  Ensure only these are set (delete any `JWT_SECRET` as it's no longer used):
    - `MONGODB_URI`: Your MongoDB connection string.
    - `CLIENT_URL`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`).
    - `NODE_ENV`: `production`
5.  Click **Manual Deploy** -> **Clear Build Cache & Deploy** to start a fresh build.

## 2. Frontend (Vercel)

1.  Log in to [Vercel](https://vercel.com).
2.  Select your **collabedit** project.
3.  Vercel should have already detected your push to GitHub and started a deployment.
4.  Go to **Settings** -> **Environment Variables**:
    - `VITE_BACKEND_URL`: Your Render backend URL (e.g., `https://your-backend.onrender.com`).
5.  If you changed the variable, go to **Deployments** -> **Redeploy** on the latest item.

---

### Verifying the Deployment
1.  Open your Vercel URL.
2.  Type your name in the **Identify yourself** box on the home page.
3.  Click **+ New Document**. 
4.  Copy the URL and open it in a different browser/incognito window to test real-time collaboration. allowlist includes `0.0.0.0` or Render's IP ranges.
