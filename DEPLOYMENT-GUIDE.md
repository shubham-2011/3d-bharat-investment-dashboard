# 🚀 3D Bharat Deployment & Hosting Guide

Complete step-by-step instructions for hosting the **Frontend Dashboard** (on Vercel) and the **Backend REST API** (on Render / Railway / MongoDB Atlas).

---

## 🌐 1. Deploy Frontend (Next.js Dashboard on Vercel)

The frontend is already configured with Next.js 16, Turbopack, and automatic static optimization.

### Step-by-Step Vercel Deployment:
1. **Sign in to Vercel**: Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account.
2. **Import Git Repository**:
   - Click **"Add New Project"** → **"Import Git Repository"**.
   - Select repository: [`https://github.com/shubham-2011/3d-bharat-investment-dashboard`](https://github.com/shubham-2011/3d-bharat-investment-dashboard).
3. **Configure Build Settings**:
   - **Framework Preset**: `Next.js` (automatically detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
4. **Deploy**:
   - Click **"Deploy"**.
   - Vercel will build and assign an active production URL (e.g., `https://3d-bharat-investment-dashboard.vercel.app`) with automatic SSL.

---

## ⚙️ 2. Deploy Backend (Express 5 Server on Render.com)

The backend in `3d-bharat-server` includes `render.yaml` and `Procfile` for instant deployment.

### Step-by-Step Render Deployment:
1. **Push backend to GitHub**:
   - Create a GitHub repository for `3d-bharat-server` (or import directory).
2. **Create New Web Service**:
   - Go to [https://render.com](https://render.com) and click **"New +"** → **"Web Service"**.
   - Connect your `3d-bharat-server` repository.
3. **Configure Service**:
   - **Name**: `3d-bharat-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Health Check Path**: `/api/health`
4. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `3dbharat_super_secure_jwt_secret_key_2026`
   - `CORS_ORIGIN`: `*`
   - `MONGO_URI` (optional): `mongodb+srv://<user>:<password>@cluster.mongodb.net/3dbharat`
5. **Deploy**:
   - Click **"Create Web Service"**.
   - Render will build and deploy the backend with live health monitoring at `https://3d-bharat-server.onrender.com/api/health`.

---

## 🗄️ 3. Database Setup (MongoDB Atlas — Optional)

If you wish to use cloud MongoDB instead of the built-in resilient in-memory dataset:
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a **Free Shared Cluster (M0)**.
2. In **Database Access**, create a database user and password.
3. In **Network Access**, add `0.0.0.0/0` (allow access from anywhere).
4. Click **"Connect"** → **"Connect your application"** and copy the connection string.
5. Seed initial data:
   ```bash
   MONGO_URI="mongodb+srv://..." npm run seed
   ```
6. Set the `MONGO_URI` environment variable in Render.

---

## 🛡️ 4. Verification & Health Check Endpoints

| Service | Endpoint | Expected Result |
|---|---|---|
| **Frontend Health** | `https://<vercel-domain>/` | Complete interactive dashboard loads in <500ms |
| **Backend Health** | `https://<render-domain>/api/health` | `{"status":"online","service":"3D Bharat Express API"}` |
| **Deals API** | `https://<render-domain>/api/deals?page=1&pageSize=12` | 12 deals with `total: 80` |
| **Corporate API** | `https://<render-domain>/api/corporate/analytics` | `{"totalFundingRaised": 144600, "conversionRate": 72}` |
