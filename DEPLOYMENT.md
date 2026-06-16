# Deployment Guide

## Architecture

Everything runs from **one server** (Render):
- `/` → Portfolio website (built with Vite)
- `/admin` → Admin CMS dashboard
- `/api/portfolio` → REST API
- `/upload` → File uploads

## Deploy to Render (Single Server)

### Step 1: Push to GitHub
```bash
cd Portfolio
git add .
git commit -m "Deploy portfolio with admin CMS"
git push origin main
```

### Step 2: Create Render Web Service
1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `portfolio`
   - **Runtime**: Python
   - **Root Directory**: `Portfolio` (if Portfolio is a subdirectory of your repo)
   - **Build Command**:
     ```
     pip install -r backend/requirements.txt && npm install && npm run build
     ```
   - **Start Command**:
     ```
     python backend/app.py
     ```
4. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `ADMIN_USERNAME` | `admin` |
   | `ADMIN_PASSWORD` | `YourStrongPassword123!` |
   | `FLASK_SECRET_KEY` | (click Generate) |
   | `FLASK_DEBUG` | `false` |
   | `PYTHON_VERSION` | `3.11.0` |
5. Click **Create Web Service**

### Step 3: Access Your Portfolio
- **Portfolio**: `https://your-app-name.onrender.com`
- **Admin Dashboard**: `https://your-app-name.onrender.com/admin`
- **API**: `https://your-app-name.onrender.com/api/portfolio`

### Step 4: Login to Admin
- **URL**: `https://your-app-name.onrender.com/admin`
- **Username**: `admin`
- **Password**: (the ADMIN_PASSWORD you set in Render)

## Local Development

```bash
# Start Flask backend (serves everything on port 5000)
python backend/app.py

# Or for development with hot reload:
# Terminal 1: Flask backend
python backend/app.py

# Terminal 2: Vite dev server (port 3000)
npm run dev
```

- **Portfolio**: http://localhost:5000 (Flask) or http://localhost:3000 (Vite)
- **Admin**: http://localhost:5000/admin
- **API**: http://localhost:5000/api/portfolio

## How It Works

1. On deploy, Render runs `npm run build` → creates `dist/` folder with built frontend
2. Flask serves `dist/index.html` at `/`
3. Flask serves admin CMS at `/admin`
4. Flask serves API at `/api/portfolio`
5. Portfolio frontend loads content dynamically from the API
6. If API is unavailable, falls back to static HTML

## Notes

- **Render free tier** spins down after 15 min of inactivity — first request takes 30-60 seconds
- **Render free tier** has ephemeral storage — `portfolio.json` resets on redeploy
  - For persistent data, upgrade to paid plan or use cloud storage
- **Render free tier** requires a `render.yaml` or manual config
- The `Procfile` tells Render how to start the app