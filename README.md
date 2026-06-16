# AeroDash: Multi-Role Admin Dashboard

A secure, responsive, and high-fidelity full-stack Admin Dashboard featuring fine-grained **Role-Based Access Control (RBAC)**. Built using React.js (Vite), Tailwind CSS, Node.js (Express), MongoDB (Mongoose), and JSON Web Token (JWT) Authentication.

---

## 🚀 Key Features

*   **Role-Based Access Control (RBAC):** Configured for three permission levels:
    *   **Super Admin:** Full system operations, user management CRUD, order management CRUD, settings overrides.
    *   **Manager:** Analytics access, order registry visibility, order status updates only. Restricted from deleting orders, managing users, or system settings.
    *   **Staff:** View-only order access. Blocked from editing order status, deleting records, accessing reports, or managing users.
*   **Automatic Database Resiliency (Fallback Engine):** The backend attempts connection to MongoDB. If MongoDB is offline or unavailable locally, it **automatically falls back to an in-memory database adapter**. This allows you to run, test, and demo the application with full CRUD and authorization checks immediately without any database setup!
*   **Aesthetic UI System:** Slate & Indigo theme featuring glassmorphism elements, micro-animations, animated charts (Recharts), dynamic layouts, and a built-in **Dark Mode** switcher.
*   **Quick Demo Sign-In Assistance:** A role selector on the login panel lets you populate credentials and sign in as any of the three roles with a single click.

---

## 📂 Project Structure

```
/bharkavi
  ├── /backend
  │    ├── /config       # Database connectivity configurations
  │    ├── /middleware   # JWT verification & role authorization rules
  │    ├── /models       # Mongoose schemas (User, Order, Setting)
  │    ├── /routes       # API endpoints (Auth, Users, Orders, Reports, Settings)
  │    ├── /utils        # Seed script and database mock fallbacks
  │    ├── .env          # Server environment settings
  │    ├── server.js     # Entry bootstrap server
  │    └── verify.js     # Automated schema and routing test script
  │
  ├── /frontend
  │    ├── /src
  │    │    ├── /components   # Layouts, Sidebar, Header, ProtectedRoute
  │    │    ├── /context      # AuthContext, dark-mode sync, Axios hooks
  │    │    ├── /pages        # Login, Dashboard, Users, Orders, Reports, Settings, NotFound
  │    │    ├── index.css     # Tailwind imports and custom styles
  │    │    └── App.jsx       # React Router and route definitions
  │    ├── tailwind.config.js # Tailwind CSS theme configurations
  │    ├── vite.config.js     # Vite compilation rules & server API proxies
  │    └── index.html         # HTML entry point with Outfit font
  │
  └── README.md         # Operational documentation
```

---

## 🔐 Demo Accounts (Quick Sign-In)

The login screen features quick buttons to auto-fill these accounts:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@dashboard.com` | `password123` | Full CRUD, Users, Orders, Reports, Settings |
| **Manager** | `manager@dashboard.com` | `password123` | View Orders, Edit Order Status, View Reports |
| **Staff** | `staff@dashboard.com` | `password123` | View Orders Only |

---

## 🛠️ Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Backend Setup
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure `.env` (Optional): A default environment configuration is pre-configured. If you have a local MongoDB running, the app will automatically connect to it. Otherwise, it will fallback to the in-memory DB.
4.  *(Optional)* Seed MongoDB data if you are using a live database:
    ```bash
    npm run seed
    ```
5.  Start the API server:
    ```bash
    npm start
    ```
    The server will start on [http://localhost:5000](http://localhost:5000).

### 2. Frontend Setup
1.  Open a new terminal and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The React application will open on [http://localhost:3000](http://localhost:3000).

---

## 🧪 Verification & Automated Testing

To verify backend CRUD logic, password hashing, and token checks, run the automated test suite in the backend folder:
```bash
cd backend
node verify.js
```
This runs 14 rigorous check assertions verifying system readiness and database schema compliance, outputting a clear report to the console.
