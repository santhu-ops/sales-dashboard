# Production Deployment Guide

This document outlines the steps required to deploy the **SalesFlow Sales & Revenue Dashboard** to cloud providers for public production usage.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have configured production-grade settings in your environment variables. Do **not** use local development settings in production.

### Environment Variables Matrix

| Variable Name | Description | Production Recommendation |
|---|---|---|
| `PORT` | API listen port | Set by hosting provider (e.g. Render, Railway) |
| `NODE_ENV` | Run environment | `production` |
| `MONGODB_URI` | Database Connection | Connection string to a cloud database (e.g., MongoDB Atlas) |
| `JWT_SECRET` | Token Secret Key | A long, cryptographically strong random string |
| `JWT_EXPIRES_IN` | Token Validity Period | E.g. `7d` (7 days) or `24h` (24 hours) |
| `SMTP_HOST` | Real Outbound Mail server | Host from SMTP provider (SendGrid, Mailgun, AWS SES) |
| `SMTP_PORT` | Outbound Mail port | `465` (SSL) or `587` (TLS) |
| `SMTP_USER` | Mail Server Username | Username of SMTP service |
| `SMTP_PASS` | Mail Server Password | API key or Password of SMTP service |
| `FROM_EMAIL` | Sender Address Header | `"SalesFlow System" <noreply@yourdomain.com>` |
| `FRONTEND_URL` | Frontend client origin | URL of the deployed frontend (e.g., `https://dashboard.yourdomain.com`) |

---

## 🗄️ Step 1: Database Setup (MongoDB Atlas)

1. Sign up/Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free or paid Shared Cluster.
3. In **Database Access**, create a database user with read/write privileges.
4. In **Network Access**, whitelist the IP addresses of your backend hosting server (or `0.0.0.0/0` to allow all endpoints).
5. Retrieve your connection string from the **Connect** tab (choose "Drivers" node version 4.x or later).
6. Replace the username, password, and database name inside the connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/sales_dashboard?retryWrites=true&w=majority
   ```

---

## 💻 Step 2: Backend Deployment

The backend server is standard Node.js Express. You can deploy it to platforms like **Render**, **Railway**, **Heroku**, or a **VPS** (DigitalOcean, AWS EC2).

### Option A: Render.com (Recommended)
1. Log in to [Render](https://render.com/).
2. Click **New** -> **Web Service**.
3. Connect your Git repository.
4. Configure the following service settings:
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Advanced**, click **Add Environment Variable** and copy your production `.env` values (ensure `NODE_ENV=production`).
6. Click **Create Web Service**. Render will build and deploy your backend, giving you a public URL (e.g., `https://salesflow-api.onrender.com`).

### Option B: PM2 on VPS (DigitalOcean/AWS)
1. SSH into your server.
2. Clone the repository and navigate to the backend folder:
   ```bash
   git clone <repo-url>
   cd sales-dashborad/backend
   npm install --production
   ```
3. Create your production `.env` file.
4. Install and start PM2 to run the process in the background:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "salesflow-backend"
   pm2 startup
   pm2 save
   ```
5. Set up a reverse proxy using Nginx to map incoming port 80/443 traffic to `http://localhost:5000`.

---

## 🎨 Step 3: Frontend Deployment

The React frontend compiles into a static folder (`frontend/dist/`). It can be hosted on free CDN-backed static hosting providers like **Vercel**, **Netlify**, or **Render Static Sites**.

### Configure API URL prior to build
Make sure the frontend knows where to contact the backend. Ensure that the Axios client instance has the correct base URL.
Inside `frontend/src/utils/axios.ts`, the base URL is loaded as:
`baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'`

You must define this environment variable for your frontend build environment:
`VITE_API_URL=https://salesflow-api.onrender.com/api`

### Option A: Vercel (Recommended)
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Connect your repository.
4. In the settings:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. In **Environment Variables**, add:
   - `VITE_API_URL` = `<your-deployed-backend-url>/api`
6. Click **Deploy**. Vercel will build and serve your app globally.

### Option B: Netlify
1. Log in to [Netlify](https://www.netlify.com/).
2. Select **Add new site** -> **Import an existing project**.
3. Connect your Git provider.
4. Configuration parameters:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add `VITE_API_URL` under Environment Variables.
6. Trigger deployment.

---

## 🔒 Step 4: Security Hardening (Production)

1. **CORS Restrictions**: Modify `backend/src/app.js`'s CORS origin list to only allow requests from your production frontend URL (instead of the wildcard `*` dev setting):
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```
2. **HTTPS Enablement**: Ensure HTTPS is active on both frontend and backend domains. Platforms like Render, Vercel, and Netlify provide free SSL certificates automatically.
3. **Database Credentials Security**: Never commit raw production database connection strings to your git repository. Always inject them using server-level environment variables.
