# Deployment Guide: Ramadan Tracker

This guide explains how to deploy your Ramadan Tracker app to the internet so your family can use it from anywhere.

## 🏗️ Architecture Summary
- **Backend**: FastAPI (Python) - Hosted on **Render** (Free Tier)
- **Database**: PostgreSQL - Hosted on **Supabase** (Free Tier)
- **Frontend**: Next.js (React) - Hosted on **Vercel** (Free Tier)
- **File Storage**: Local directory (`static/photos`)

---

## �️ Step 1: Database Setup (Supabase)

Supabase provides a permanent PostgreSQL database for free.

1.  Go to [Supabase.com](https://supabase.com/) and create a free account.
2.  Create a **New Project**.
3.  Go to **Project Settings** -> **Database**.
4.  Find the **Connection string** section. 
5.  Copy the **URI** (it looks like `postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`).
    - *Replace `[YOUR-PASSWORD]` with the password you set when creating the project.*

---

## 🚀 Step 2: Backend Deployment (Render.com)

1.  **Create a GitHub Repository**: Push your code to GitHub.
2.  **Create a Web Service on Render**:
    - Connect your GitHub repo.
    - **Language**: `Python`
    - **Build Command**: `pip install -r backend/requirements.txt`
    - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
3.  **Configure Environment Variables**:
    - `DATABASE_URL`: Paste your **Supabase URI** here.
    - `CORS_ALLOWED_ORIGINS`: Your Vercel frontend URL (e.g., `https://my-ramadan-tracker.vercel.app`)

---

## 💻 Step 3: Frontend Deployment (Vercel)

Vercel is the best home for Next.js apps.

1.  **Create a Project on Vercel**:
    - Import your GitHub repo.
    - Set the **Root Directory** to `frontend`.
2.  **Configure Environment Variables**:
    - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://ramadan-api.onrender.com`)
3.  **Deploy**: Click "Deploy" and Vercel will handle the rest.

---

## 📸 Handling Photos in Production

> [!NOTE]
> On Render's Free tier, photos uploaded to `static/photos` will be deleted whenever the server restarts. 

**For a 100% Free permanent solution:**
- You can keep using it this way if you don't mind profile photos occasionally disappearing.
- To make photos permanent, you would need to connect a service like **Cloudinary** (Free tier available).

---

## 🛠️ Pre-Deployment Checklist
- [ ] Run `npm run build` in the `frontend` directory to ensure no TypeScript errors.
- [ ] Ensure `requirements.txt` includes `psycopg2-binary`.
- [ ] Verify that `DATABASE_URL` is set in your Render environment variables.
