# Smart Campus Help Desk System (UNIASSIST)

## 1️⃣ Project Purpose

The Smart Campus Help Desk System is designed to:

- Provide a centralized platform for students, staff, and administrators to report, track, and resolve IT-related issues.
- Reduce delays and confusion in managing technical problems on campus.
- Improve transparency and accountability in handling support requests.

The system ensures that users interact with the platform according to their roles:

| Role    | Function |
|--------|----------|
| Student | Create tickets, track status, view history |
| Staff   | View tickets, assign themselves to tickets, resolve issues |
| Admin   | Manage staff, oversee tickets, monitor system activity |

---

## 2️⃣ Project Flow

### Step 1: Authentication & Role Management

- Users register and log in to the system.
- JWT-based authentication ensures secure access.
- Roles (Student, Staff, Admin) determine which dashboard and features are available.

**Flow:**

User signs up → JWT token issued → Role checked → Redirected to dashboard

---

### Step 2: Student Interaction

- Students can create new support tickets.
- Tickets include: Title, Description, Category, Status.
- Tickets are saved in MongoDB.

**Flow:**

Student Dashboard → Fill Ticket Form → Submit → Ticket stored in DB

---

### Step 3: Staff Interaction

- Staff view all tickets assigned to them or unassigned tickets.
- Staff can assign themselves to a ticket, update the status (In Progress / Resolved).

**Flow:**

Staff Dashboard → View Tickets → Assign / Update Status → Ticket updated in DB

---

### Step 4: Admin Interaction

- Admins oversee the whole system.
- Manage staff accounts, monitor ticket activity, and generate simple analytics.

**Flow:**

Admin Dashboard → Manage Staff / View Tickets → Approve actions → Track performance

---

## 3️⃣ System Structure

### Backend (Node.js + Express)

- `server.js` – Main server file, sets up routes and middleware
- `routes/` – Handles endpoints for authentication (`authRoutes.js`), tickets (`ticketRoutes.js`), and admin tasks (`adminRoutes.js`)
- `models/` – MongoDB schemas: `User.js` for user accounts, `Ticket.js` for tickets
- `middleware/` – `authMiddleware.js` ensures JWT-based protected routes
- `config/db.js` – MongoDB connection configuration

**Backend Flow:**

Frontend request → Express route → Middleware (auth) → Controller → MongoDB → Response

---

### Frontend (React.js)

- Components for dashboards: `StudentDashboard.js`, `StaffDashboard.js`, `AdminDashboard.js`
- Pages for login, signup, ticket creation, ticket lists
- Axios for HTTP requests to backend
- React Router to navigate between dashboards and pages

**Frontend Flow:**

Login → Dashboard based on role → Submit / View / Manage tickets → Display updates

---

## 4️⃣ Database (MongoDB)

Hosted on MongoDB Atlas

**Collections:**

- `users` – Stores all users and roles
- `tickets` – Stores all tickets and their status, linked to students and assigned staff

**Example Ticket Document:**

```json
{
  "title": "WiFi not working",
  "description": "Cannot connect in hostel",
  "status": "open",
  "category": "Network",
  "student": "userId123",
  "assignedTo": null,
  "createdAt": "2026-03-13T00:00:00Z"
}
```

---

## 5️⃣ Technologies Used

| Layer        | Technology            | Purpose |
|--------------|-----------------------|---------|
| Frontend     | React.js              | Interactive UI and dashboards |
| Backend      | Node.js + Express     | API creation and routing |
| Database     | MongoDB + Mongoose    | Data storage and modeling |
| Authentication | JWT + bcryptjs     | Secure login and password hashing |
| HTTP Requests | Axios                | Connect frontend to backend |
| Hosting / DB | MongoDB Atlas         | Cloud database storage |
| Middleware   | CORS + authMiddleware | Secure API communication |

---

## 6️⃣ Summary of Project Flow

- **Student:** Signup/Login → Student Dashboard → Create Ticket → Ticket saved in DB
- **Staff:** Login → Staff Dashboard → View / Assign / Resolve Tickets
- **Admin:** Login → Admin Dashboard → Manage Staff / Monitor Tickets

Each user only sees what they are allowed to based on role.
Tickets are persisted in MongoDB and updated in real-time.
Frontend communicates with backend via Axios, backend handles data validation and persistence.

---

## 🚀 Running the Project Locally

### Backend (server/)

1. Copy `.env.example` to `.env` and fill in your MongoDB URI and JWT secret.
2. (Optional) Add an admin account in `.env` for initial access:
   ```text
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=yourStrongP@ssword
   ADMIN_NAME="Campus Admin"
   ```
3. Install dependencies:
   ```bash
   cd server
   npm install
   ```
4. Seed the admin account (optional, but recommended for first run):
   ```bash
   npm run seed
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

The backend API will run on `http://localhost:5000` by default.

### Frontend (client/)

1. Install dependencies:
   ```bash
   cd client
   npm install
   ```
2. Start the frontend:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173` and proxy API requests to the backend.

### New Features Added
- **Shared Dashboard Home**: Visit `/` to auto-redirect to your role's dashboard.
- **Real-time Updates**: Polling every 10 seconds for ticket updates across all dashboards.
- **Enhanced State Management**: Context now handles tickets, loading, and errors globally.
- **Email Simulation**: Alerts simulate email notifications on ticket status changes.
- **Improved UI**: Better styling, loading states, disabled buttons, and error feedback.
- **Admin Ticket Assignment**: Admins can assign tickets to specific staff members via dropdown.
- **Student Profile**: Students can add year of study and school during signup, displayed on dashboard.
- **Enhanced Ticket Info**: Tickets now show student year and school in admin view.
