# AeroDash: Split Deployment Guide

This guide details the step-by-step process of deploying the AeroDash application using a **split deployment** model:
*   **Backend (API Server):** Deployed to **Render** or **Railway**
*   **Frontend (React UI):** Deployed to **Vercel** or **Netlify**

---

## Part 1: Deploying the Backend (API Server)

The backend runs on Node.js/Express. It connects to MongoDB or falls back to an in-memory database configuration automatically.

### Option A: Deploying to Render (render.com)

1.  **Sign Up/Log In:** Go to [Render](https://render.com/) and connect your GitHub/GitLab account.
2.  **Create a New Web Service:**
    *   Click **New +** and select **Web Service**.
    *   Select your repository containing `bharkavi`.
3.  **Configure Service settings:**
    *   **Name:** `aerodash-backend` (or similar)
    *   **Root Directory:** `backend`
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
4.  **Configure Environment Variables (Important):**
    Click on the **Advanced** tab or go to **Environment** settings and add:
    *   `PORT` = `10000` (Render handles this automatically, but good to declare)
    *   `NODE_ENV` = `production`
    *   `JWT_SECRET` = *[Generate a strong secret key string, e.g. `your_long_random_super_secret_string`]*
    *   `JWT_EXPIRY` = `24h`
    *   `FRONTEND_URL` = `https://your-frontend-subdomain.vercel.app` *(Leave as `*` during initial deploy, then update it to your actual Vercel/Netlify URL once the frontend is deployed to lock down CORS security)*
    *   `MONGODB_URI` = *[Your MongoDB connection URL, e.g., MongoDB Atlas URI. If omitted or offline, the app automatically falls back to an in-memory DB so the dashboard works out of the box!]*
5.  **Deploy:** Click **Create Web Service**. Render will build the container and deploy the service. Note the backend URL provided by Render (e.g. `https://aerodash-backend.onrender.com`).

---

### Option B: Deploying to Railway (railway.app)

1.  **Create a Project:** Log in to [Railway](https://railway.app/) and click **New Project** -> **Deploy from GitHub repo**.
2.  **Configure Deploy:**
    *   Select your repository.
    *   Set the **Root Directory** to `backend`.
3.  **Add Variables:** Under **Variables**, add:
    *   `PORT` = `5000`
    *   `NODE_ENV` = `production`
    *   `JWT_SECRET` = *[Your strong secret key]*
    *   `FRONTEND_URL` = `*` *(Update to Vercel/Netlify URL later)*
    *   `MONGODB_URI` = *[Your MongoDB connection URL]*
4.  **Expose Endpoint:** Go to service settings and click **Generate Domain** to get a public API URL.

---

## Part 2: Deploying the Frontend (React UI)

The frontend is a Vite SPA. It requires a rewrite rule configuration to prevent 404s when reload keys are pressed on routes like `/dashboard`.

### Option A: Deploying to Vercel (vercel.com)

We have pre-configured a [vercel.json](file:///c:/Users/sarveshwaran/bharkavi/frontend/vercel.json) rewrite rule inside the `frontend` folder for you.

1.  **Sign Up/Log In:** Go to [Vercel](https://vercel.com/) and click **Add New Project**.
2.  **Import Repository:** Select your GitHub repository.
3.  **Configure Project Framework:**
    *   **Framework Preset:** `Vite`
    *   **Root Directory:** Click Edit and select the `frontend` folder.
4.  **Configure Build & Output Settings:**
    *   Vercel automatically detects Vite's build settings (`npm run build` and output folder `dist`). Keep defaults.
5.  **Configure Environment Variables (Critical):**
    Add the following environment variable:
    *   `VITE_API_BASE_URL` = *[Your deployed Backend URL from Part 1, e.g. `https://aerodash-backend.onrender.com`]* (Do **NOT** add a trailing slash `/` at the end).
6.  **Deploy:** Click **Deploy**. Vercel will bundle the code and host it.

---

### Option B: Deploying to Netlify (netlify.com)

We have pre-configured a `_redirects` file in the [frontend/public](file:///c:/Users/sarveshwaran/bharkavi/frontend/public/_redirects) folder for Netlify routing support.

1.  **Import Project:** Log in to Netlify, click **Add new site**, and select **Import an existing project**.
2.  **Configure Build:**
    *   Set **Base Directory** to `frontend`.
    *   **Build Command:** `npm run build`
    *   **Publish Directory:** `frontend/dist`
3.  **Add Environment Variables:** Under Site Settings -> Environment Variables:
    *   Add key `VITE_API_BASE_URL` with value pointing to your backend URL.
4.  **Deploy:** Click **Deploy Site**.

---

## Part 3: Post-Deployment Verification

1.  Once the frontend deployment is complete, copy your frontend production URL (e.g., `https://aerodash.vercel.app`).
2.  Go back to your backend hosting settings (Render/Railway), and update the `FRONTEND_URL` environment variable from `*` to `https://aerodash.vercel.app` to secure the backend API.
3.  Open the frontend URL, register/login, and verify that the real-time event listener establishes a connection to the backend and updates stats dynamically.
