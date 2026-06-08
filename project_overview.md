# GWC DATA.AI Sales Dashboard Workspace - Project Documentation

Welcome to the **GWC DATA.AI Sales Dashboard** workspace documentation. This document provides a complete overview of the system architecture, authentication workflows, page directories, and tab-by-tab functionalities.

---

## 1. Project Overview & Tech Stack

This project is a premium enterprise-grade management portal and sales analysis dashboard customized for **GWC DATA.AI**. It provides real-time statistics, transaction ledgers, product catalogs, user role management, and email OTP-based authentication.

### Technology Stack
* **Frontend**: React 18, TypeScript, Tailwind CSS, Vite (Build tool), Recharts (Analytical charts), Framer Motion (Transitions), Lucide React (Icons).
* **Backend**: Node.js, Express, MongoDB (via Mongoose), JWT authentication, Nodemailer (with Gmail SMTP service).
* **Data Layer**: TanStack React Query (State caching & API request management).

---

## 2. Authentication Flow (OTP Security)

The application enforces security verification for user actions.

### 2.1 User Registration & Verification
1. The user navigates to `/register`, enters their name, work email, and sets a strong password (validated by a dynamic strength indicator).
2. On submit, the system creates a user record in the database (`isVerified: false`), generates a 6-digit OTP, and dispatches it to the user's email.
3. The user is redirected to `/verify-otp`.
4. Entering the valid 6-digit code marks the account as verified and signs the user in.

### 2.2 User Login
* Users sign in at `/login`.
* A **"Sales Dashboard Details Analysis"** quick bypass link allows instant dashboard previewing (ideal for demonstrations).

### 2.3 Forgot Password (Two-Step Flow)
1. **Step 1 (Request Code)**: The user enters their email address. The backend sends a 6-digit OTP code to the email address.
2. **Step 2 (Reset)**: The user enters the OTP code, sets a new password, and confirms it. The page provides visual show/hide toggle controls on both password fields.
3. **Step 3 (Success)**: Upon correct code validation, the password is reset, and the user is redirected to the sign-in page.

---

## 3. Sidebar Navigation Groupings

The sidebar divides the workspace tools into logical sections:

### 📂 MENU
* **Dashboard**: Key performance metrics, customer habits, and product distribution.
* **Report**: High-level sales summaries and analytical exports.
* **Products**: Full catalog and stock tracking.
* **Consumer**: CRM listing with customer transaction summaries.

### 💵 FINANCIAL
* **Transactions**: Transaction ledgers, payment modes, and order records.
* **Invoices**: Billing invoices, print views, status tracking, and filters.

### 🛠️ TOOLS
* **Deals Pipeline**: Interactive Kanban board tracking deal negotiations.
* **Performance**: Performance metrics and leaderboard tracking for sales representatives.
* **Settings**: Profile configuration, avatar updates, and security credentials.
* **Alerts**: Centralized notification center displaying system events and alerts.
* **Admin Panel**: Role management panel, only visible to accounts with the `admin` role.

---

## 4. Tab-by-Tab Details & Functionalities

Here is what each tab/page in the workspace does:

### 📊 1. Dashboard Tab (Sales Report)
The primary overview screen. It houses:
* **KPI Metric Cards**: 4 grid elements detailing performance.
  * **Total Sales**: Highlighted in GWC brand purple gradient. Tracks total revenue and percentage growth.
  * **Total Orders**: Total number of orders completed.
  * **Visitor**: Total number of registered customers.
  * **Total Sold Products**: Total inventory items sold.
* **Customer Habits Chart**: A dual bar chart representing customer interactions.
  * **Seen product** (Light Gray Bar) vs. **Sales** (GWC Purple Bar).
  * Filterable by time period tabs (*Daily*, *Weekly*, *Monthly*, *Yearly*).
  * Hovering displays a custom dark tooltip detailing specific metrics.
* **Product Statistic Chart**: A concentric 3-ring `RadialBarChart` visualizing category sales (Furniture, Games, Electronics).
* **Consumer CRM / Geography distribution**: Linear progress bars showing customer concentration across key regions (US, Germany, Australia, France).

### 📈 2. Report Tab
* Focuses on generating analytical insights.
* Displays trend charts comparing current revenues against operational targets.
* Provides download utilities to export sales tables as CSV/Excel reports.

### 📦 3. Products Tab
* Lists all seeded inventory items.
* Provides filter controls for category, price range, and stock availability.
* Allows adding new product items, updating prices, and checking remaining stock.

### 👥 4. Consumer Tab (CRM)
* Lists your workspace clients.
* Displays individual customer details (name, email, region, total spend, and status).
* Allows CRM managers to log notes, review customer history, and update customer status.

### 💳 5. Transactions Tab (Sales Ledger)
* A grid mapping transaction details: Transaction ID, date, customer name, total amount, payment method (Credit Card, PayPal, Bank Transfer), and status (Success, Pending, Failed).
* Search bars and dropdown filters to find specific orders quickly.

### 📄 6. Invoices Tab
* Allows managers to view billing details.
* Generates downloadable PDF invoices.
* Allows filtering invoices by status (Paid, Unpaid, Overdue).

### 🤝 7. Deals Pipeline Tab
* Visualizes active negotiations via a Kanban board structure (Lead, Contacted, Proposal, Negotiation, Won, Lost).
* Supports drag-and-drop or status updates to advance opportunities.
* Calculates deal win probabilities and total pipeline valuation.

### 🏆 8. Performance Tab
* Displays sales agent analytics.
* Features a performance leaderboard ranking employees by total closed deal values.
* Includes individual metric charts tracking monthly targets and close rates.

### ⚙️ 9. Settings Tab (My Profile)
* Profile modification controls (name, department, avatar).
* **Security Sub-tab**: Allows users to change passwords securely.

### 🔔 10. Alerts Tab (System Alerts)
* Real-time notification inbox tracking workspace alerts.
* Notifies users of inventory shortages, high-value deals won, or role changes.
* Integrates directly with the sidebar notification badge indicator.

### 🛡️ 11. Admin Panel Tab
* Restricted route accessible only to administrators.
* Displays all workspace users.
* Allows admins to change user roles (e.g., promote an employee to manager) and verify account statuses.
