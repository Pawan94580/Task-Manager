# Ethara — Team Task Manager 🚀

A **production-ready SaaS** team task manager built with modern technologies. Stands out with a Kanban board, insightful charts, real-time activity logs, and full dark mode support.

---

## 🌐 Live Demo
| Service | URL |
|---------|-----|
| Frontend | `https://your-app.vercel.app` |
| Backend  | `https://your-app.railway.app` |

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS v4 |
| **Drag & Drop** | @dnd-kit/core + @dnd-kit/sortable |
| **Charts** | Recharts (Pie + Bar) |
| **Backend** | Node.js, Express.js |
| **ORM** | Prisma v5 |
| **Database** | PostgreSQL |
| **Auth** | JWT + bcryptjs |
| **Validation** | Zod |
| **Notifications** | react-hot-toast |

---

## 🎯 Features

### Core
- ✅ JWT Authentication (register / login / protected routes)
- ✅ Role-Based Access Control (Admin / Member)
- ✅ Project Management (create, manage team, add/remove members)
- ✅ Task Management (create, edit, delete, assign)

### Advanced
- 🗂 **Kanban Board** — Drag & drop tasks between To Do / In Progress / Done
- 🚨 **Overdue Detection** — Auto-highlights tasks past due date in red
- 📊 **Dashboard Charts** — Pie chart (status) + Bar chart (tasks per user)
- 📋 **Activity Timeline** — Full audit log of all actions
- 🔍 **Search & Filters** — By title, status, priority, assigned user
- ☰ **List View** — Toggle between Kanban and table view
- 🌙 **Dark Mode** — System preference + manual toggle, persisted to localStorage

---

## 📁 Project Structure

```
Ethara/
├── backend/
│   ├── prisma/schema.prisma     ← Database schema
│   ├── prisma.js                ← Prisma client singleton
│   ├── server.js                ← Express app entry
│   ├── middlewares/             ← auth, validate, errorHandler
│   ├── validations/             ← Zod schemas
│   ├── services/activityService.js
│   ├── controllers/             ← auth, project, task, user, activity
│   └── routes/                  ← auth, projects, tasks, users, activity
└── frontend/
    └── src/
        ├── api/axios.js
        ├── context/             ← AuthContext, ThemeContext
        ├── components/          ← Layout, Sidebar, Navbar, Modal, KanbanBoard, ActivityFeed
        └── pages/               ← Login, Register, Dashboard, Projects, ProjectDetail, Tasks, Users
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js >= 18
- PostgreSQL (running locally)

### 1. Database Setup
```sql
-- In psql or pgAdmin:
CREATE DATABASE teamtaskmanager;
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

npm install
npx prisma generate
npx prisma db push    # Creates all tables
npm run dev           # Starts on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev           # Starts on http://localhost:5173
```

---

## 🗄️ Database Schema (Prisma)

```
User → Project (owner)
User ↔ Project (many-to-many via ProjectMember)
User → Task (assignedTo / createdBy)
Project → Task
Task → ActivityLog
User → ActivityLog
```

**Enums:** `Role` (ADMIN/MEMBER), `TaskStatus` (TODO/IN_PROGRESS/DONE), `Priority` (LOW/MEDIUM/HIGH)

---

## 🌐 API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Auth |
| GET | /api/users | Auth |
| PUT | /api/users/:id/role | Admin |
| GET | /api/projects | Auth |
| POST | /api/projects | Admin |
| GET | /api/projects/:id | Auth |
| PUT | /api/projects/:id | Admin |
| DELETE | /api/projects/:id | Admin |
| POST | /api/projects/:id/members | Admin |
| DELETE | /api/projects/:id/members/:userId | Admin |
| GET | /api/tasks | Auth |
| GET | /api/tasks/dashboard | Auth |
| POST | /api/tasks | Admin |
| PUT | /api/tasks/:id | Auth |
| DELETE | /api/tasks/:id | Admin |
| GET | /api/activity | Auth |

---

## 🚀 Deployment

### Backend → Railway
1. Push `backend/` to GitHub
2. Create Railway project → Deploy from GitHub
3. Add PostgreSQL service in Railway
4. Set env vars: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`
5. Add start command: `npx prisma db push && node server.js`

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import in Vercel
3. Set env var: `VITE_API_URL=https://your-railway-backend.railway.app/api`
4. Update `frontend/src/api/axios.js` baseURL to use `import.meta.env.VITE_API_URL`

---

## 📸 Screenshots

> Dashboard, Kanban Board, Projects, Activity Feed

---

## 🏆 What Makes This Stand Out

1. **Prisma ORM** — Type-safe DB queries, easy migrations
2. **dnd-kit** — Accessible, smooth drag & drop
3. **Recharts** — Professional data visualization
4. **Activity Logs** — Full audit trail for every action
5. **Dark Mode** — Proper CSS custom properties, persisted preference
6. **Zod Validation** — Field-level error messages
7. **Global Error Handler** — Prisma error codes mapped to HTTP status
