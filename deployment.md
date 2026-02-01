# Deployment Guide: Ramadan Tracker

This guide explains how to deploy your Ramadan Tracker app to the internet so your family can use it from anywhere.

## 🏗️ Architecture Summary
- **Backend**: FastAPI (Python) + SQLite
- **Frontend**: Next.js (React)
- **Database**: SQLite (local file)
- **File Storage**: Local directory (`static/photos`)

---

## 🚀 Step 1: Backend Deployment (Render.com)

[Render](https://render.com/) is a great choice for FastAPI apps with SQLite as it supports **Persistent Disks**.

1.  **Create a GitHub Repository**: Push your code to GitHub.
2.  **Create a Web Service on Render**:
    - Connect your GitHub repo.
    - **Language**: `Python`
    - **Build Command**: `pip install -r backend/requirements.txt`
    - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
3.  **Configure Environment Variables**:
    - `CORS_ALLOWED_ORIGINS`: Your Vercel frontend URL (e.g., `https://my-ramadan-tracker.vercel.app`)
4.  **Add a Persistent Disk**:
    - Go to **Settings** -> **Disks**.
    - Add a disk with:
        - **Name**: `data`
        - **Mount Path**: `/opt/render/project/src/data`
        - **Size**: 1GB (Free tier)
    - **Crucial**: Update your `backend/database.py` to point the SQLite URL to this persistent path: `sqlite:////opt/render/project/src/data/ramadan_tracker.db`.

---

## 💻 Step 2: Frontend Deployment (Vercel)

Vercel is the best home for Next.js apps.

1.  **Create a Project on Vercel**:
    - Import your GitHub repo.
    - Set the **Root Directory** to `frontend`.
2.  **Configure Environment Variables**:
    - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://ramadan-api.onrender.com`)
3.  **Deploy**: Click "Deploy" and Vercel will handle the rest.

---

## 📸 Handling Photos in Production

### Option A: Persistent Disks (Easiest)
If you use Render's Disks as mentioned above, your photos and database will survive redeploys. You need to make sure the `static/photos` directory is also on the disk.

### Option B: Cloudinary (Recommended for scaling)
For a more robust solution, you can swap the local `file_upload.py` logic to use **Cloudinary** or **AWS S3**. This ensures photos are never lost even if you change hosting providers.

---

## 📝 Important Notes

> [!WARNING]
> **SQLite Security**: SQLite is great for small family apps, but remember that Render's free tier spins down after inactivity. The first request might take 30 seconds to wake up the server.

> [!TIP]
> **Environment Variables**: Always use `.env.local` for local development and the hosting provider's Dashboard for production secrets. Never commit sensitive keys to GitHub.

---

## 🛠️ Pre-Deployment Checklist
- [ ] Run `npm run build` in the `frontend` directory to ensure no TypeScript errors.
- [ ] Ensure `requirements.txt` includes all necessary backend packages (`fastapi`, `uvicorn`, `sqlalchemy`, etc.).
- [ ] Verify that `allow_origins` in `backend/main.py` is correctly reading from environment variables.
