# SalesFlow — Premium Sales & Revenue Executive Dashboard

A production-ready, high-performance, full-stack Sales & Revenue Executive Dashboard built with a modern glassmorphic theme. It allows businesses to track revenues, manage deals pipelines, monitor sales representatives' performance, view customer account health, export executive reports, and configure automated high-value deal alerts.

---

## 🚀 Key Features

- **Revenue Overview**: Total Revenue, monthly revenue trends, ARR calculations, and stage breakdowns with interactive charts.
- **Sales Pipeline (Kanban & Tabular)**: Full CRUD operations for deals, drag-and-drop progression, probability matching, and ownership assignments.
- **Team Performance**: Leaderboard rankings based on revenue generated, deals count, closed won/lost rates, and log activity history.
- **Customer Accounts Analytics**: Customer list filtering, industry/region breakdown charts, health scores, and churn risk flags.
- **Notifications & Alerts**: In-app alert notification center with read/unread statuses.
- **High-Value Deal Triggers**: Automatic alert logs and system-wide admin/manager emails (via Nodemailer) for deals worth $50,000 or more.
- **Report Exports**: One-click download of Excel sheets (via ExcelJS) and Executive PDF summaries (via Puppeteer).

---

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express** (REST API Server)
- **MongoDB** & **Mongoose** (Database)
- **Passport.js** (JWT strategy for secure, token-based endpoints)
- **bcryptjs** (Secure password hashing)
- **ExcelJS** & **Puppeteer** (Excel / PDF generation engines)
- **Nodemailer** (Automated alerts with Ethereal fallback for local development)

### Frontend
- **React 19** & **TypeScript**
- **Vite** (Module bundler and development server)
- **Tailwind CSS v4** (Utility-first styling with custom glassmorphism)
- **TanStack React Query** (Server state management and caching)
- **Recharts** (Visual data reporting and trend analytics)
- **React Router DOM** (Navigation)
- **Lucide React** (Modern iconography)

---

## 📁 Directory Structure

```text
sales-dashborad/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection & Passport configuration
│   │   ├── controllers/     # MVC controller logic
│   │   ├── middleware/      # JWT verification & role authorization
│   │   ├── models/          # Mongoose Schemas (User, Deal, Account, etc.)
│   │   ├── routes/          # Express routing endpoints
│   │   ├── services/        # Email & report export engines
│   │   └── utils/           # Seeding scripts
│   ├── .env                 # Backend environment variables
│   ├── server.js            # App Entrypoint
│   └── package.json
└── frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/ui/   # Reusable UI component library (Modals, Badges, etc.)
    │   ├── context/         # Auth & Toast context providers
    │   ├── hooks/           # Custom React hooks (useAlerts polling)
    │   ├── layouts/         # Dashboard wrapper (Sidebar & Topbar)
    │   ├── pages/           # View layouts (Dashboard, Deals, Reports, etc.)
    │   ├── services/        # Axios API handlers
    │   ├── types/           # TypeScript interfaces
    │   ├── utils/           # Helper scripts (Axios instance)
    │   ├── App.tsx          # Router configuration
    │   └── main.tsx         # React DOM anchor
    ├── index.html           # Document template
    ├── tailwind.config.js   # Tailwind configurations
    └── package.json
```

---

## ⚙️ Setup and Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally on `mongodb://localhost:27017` or a MongoDB Atlas URI)

### 1. Database & Seeding Setup
Navigate to the `backend/` directory, install packages, and seed the MongoDB database:

```bash
cd backend
npm install

# Run database seeder (seeds 5 users, 8 customer accounts, 15 deals, alerts, and activities)
npm run seed
```

### 2. Backend Environment Variables
Create a `.env` file in the `backend/` directory (a template `.env.example` is provided):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/sales_dashboard
JWT_SECRET=secret_key_sales_dashboard_2026
JWT_EXPIRES_IN=30d
NODE_ENV=development

# Optional SMTP Settings (uses Ethereal mail config fallback if left blank)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
FROM_EMAIL="SalesFlow System" <noreply@salesflow.com>

FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup
Navigate to the `frontend/` directory and install packages:

```bash
cd ../frontend
npm install
```

---

## 🏃‍♂️ Running the Application

### Start the Backend API
In the `backend/` directory, run:
```bash
npm run dev
```
The server will start on [http://localhost:5000](http://localhost:5000).

### Start the Frontend Dev Server
In the `frontend/` directory, run:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Demo Access Credentials

The database seeder configures the following user credentials for demonstration:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@salesdashboard.com` | `Password123` |
| **Manager** | `manager@salesdashboard.com` | `Password123` |
| **Sales Rep** | `alex.rep@salesdashboard.com` | `Password123` |
| **Sales Rep** | `elena.rep@salesdashboard.com` | `Password123` |
| **Sales Rep** | `david.rep@salesdashboard.com` | `Password123` |

*Note: The frontend pre-fills the login form with the Admin credentials for convenience.*
