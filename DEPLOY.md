# Deployment Guide: Hotel Lobby Display

Deploy your hotel lobby display app using **GitHub + MongoDB Atlas + Render + Vercel**.

---

## Step 1: Save to GitHub

Click the **"Save to GitHub"** button in the Emergent chat input. This pushes your full codebase to a GitHub repo.

---

## Step 2: MongoDB Atlas (Free Database)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign up (free)
2. Click **"Build a Database"** → Select **M0 Free** tier
3. Choose a region close to you (e.g., `us-east-1`)
4. Set a **username** and **password** (save these!)
5. Under **Network Access** → Click **"Add IP Address"** → Select **"Allow Access from Anywhere"** (`0.0.0.0/0`)
6. Under **Database** → Click **"Connect"** → **"Drivers"** → Copy the connection string

Your connection string will look like:
```
mongodb+srv://youruser:yourpassword@cluster0.abc123.mongodb.net/hotel_lobby?retryWrites=true&w=majority
```

---

## Step 3: Render (Backend - FastAPI)

1. Go to [https://render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `hotel-lobby-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.deploy.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `MONGO_URL` | `mongodb+srv://youruser:yourpass@cluster0.xxx.mongodb.net/hotel_lobby?retryWrites=true&w=majority` |
   | `DB_NAME` | `hotel_lobby` |
   | `CORS_ORIGINS` | `https://your-app.vercel.app` (update after Vercel deploy) |
   | `WEATHERAPI_KEY` | Your WeatherAPI.com key |
   | `NEWS_API_KEY` | Your NewsAPI.org key |

6. Click **"Create Web Service"**
7. Wait for deploy — copy the URL (e.g., `https://hotel-lobby-api.onrender.com`)

---

## Step 4: Vercel (Frontend - React)

1. Go to [https://vercel.com](https://vercel.com) and sign up with GitHub
2. Click **"New Project"** → Import your GitHub repo
3. Configure:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn build` (should auto-detect)
   - **Output Directory**: `build`
4. Add **Environment Variable**:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_BACKEND_URL` | `https://hotel-lobby-api.onrender.com` (your Render URL from Step 3) |

5. Click **"Deploy"**
6. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

---

## Step 5: Update CORS on Render

Go back to Render → your web service → **Environment** → Update:
- `CORS_ORIGINS` = `https://your-app.vercel.app`

This allows the Vercel frontend to talk to the Render backend.

---

## Done!

- **Lobby Display**: `https://your-app.vercel.app`
- **Admin Panel**: `https://your-app.vercel.app/admin`
- **No "Made with Emergent" watermark**

---

## Custom Domain (Optional)

Both Vercel and Render support custom domains:
- **Vercel**: Settings → Domains → Add your domain
- **Render**: Settings → Custom Domains → Add your domain

---

## File Reference

| File | Purpose |
|------|---------|
| `backend/requirements.deploy.txt` | Trimmed dependencies for Render |
| `backend/.env.example` | Backend env var template |
| `frontend/.env.example` | Frontend env var template |
| `render.yaml` | Render service config |
| `vercel.json` | Vercel build config |
