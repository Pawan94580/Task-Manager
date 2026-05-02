====================================================
TEAM TASK MANAGER (SaaS) - FULL-STACK ASSIGNMENT
====================================================

SUBMISSION DETAILS
----------------------------------------------------
Live Application URL: https://pretty-wisdom-production-775f.up.railway.app/
Backend API URL:      https://task-manager-production-0066.up.railway.app/api
GitHub Repository:    https://github.com/Pawan94580/Task-Manager
Demo Video:           [INSERT YOUR YOUTUBE/DRIVE VIDEO LINK HERE]

*Please note: The frontend may take 1-2 seconds to wake up if the free Railway instance goes to sleep.*


PROJECT OVERVIEW
----------------------------------------------------
This is a production-ready Team Task Manager SaaS application built to fulfill and exceed the assignment requirements. 
It features a complete role-based access system, a drag-and-drop Kanban board, real-time activity tracking, and a comprehensive analytics dashboard.

CORE FEATURES IMPLEMENTED
----------------------------------------------------
1. Authentication & Security:
   - Secure Signup/Login using JWT and bcryptjs password hashing.
   - Protected API routes and frontend pages.

2. Role-Based Access Control (RBAC):
   - ADMIN: Can create projects, add team members, create tasks, and assign tasks.
   - MEMBER: Can view assigned tasks and update task status.

3. Project & Team Management:
   - Admins can create isolated projects and assign specific users to them.

4. Task Management & Kanban Board:
   - Full drag-and-drop Kanban board using dnd-kit.
   - Auto-highlighting of overdue tasks in red.

5. Analytics Dashboard:
   - Visualizations using Recharts (Pie chart for status, Bar chart for workload).
   - Real-time activity timeline tracking user actions.


TECHNOLOGY STACK
----------------------------------------------------
Frontend:
- React.js 18 + Vite
- Tailwind CSS v4 (with Dark Mode support)
- React Router DOM
- Axios

Backend:
- Node.js + Express.js
- Prisma ORM
- Zod (for strict input validation)

Database:
- PostgreSQL (Hosted on Railway)

Deployment:
- Railway (Both Frontend and Backend)


LOCAL SETUP INSTRUCTIONS
----------------------------------------------------
If you wish to run this project locally, please follow these steps:

1. Clone the repository:
   git clone https://github.com/Pawan94580/Task-Manager.git

2. Database Setup:
   Ensure PostgreSQL is installed locally and create a database named 'teamtaskmanager'.

3. Backend Setup:
   cd backend
   npm install
   - Create a .env file with DATABASE_URL and JWT_SECRET
   npx prisma db push
   npm run dev

4. Frontend Setup:
   cd frontend
   npm install
   npm run dev


For more comprehensive details including API endpoint documentation, please see the README.md file in the root of the repository.
