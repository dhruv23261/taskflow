# TaskFlow

A minimal but real task management system. Users can register, log in, create projects, and manage tasks with a polished, high-density interface.

## 1. Overview
TaskFlow is a full-stack application built with a Node.js/Express backend and a React/Vite frontend. It uses PostgreSQL for persistence and follows a clean REST API structure.

**Tech Stack:**
- **Backend:** Node.js, Express, PostgreSQL (`pg` driver).
- **Frontend:** React, TailwindCSS, Framer Motion, Lucide Icons.
- **Authentication:** JWT (JsonWebToken) with 24-hour expiry.
- **Database:** PostgreSQL with schema management via `node-pg-migrate`.

## Architecture
- **Relational Integrity:** Switched from a NoSQL-like approach to strict PostgreSQL relations. Tasks are strictly linked to projects, and projects to owners.
- **Schema Management:** Instead of auto-generating tables, we use explicit migrations to ensure the production schema is predictable and version-controlled.
- **Optimistic UI:** Used for task status changes to provide an "instant" feel. The UI updates immediately and reverts only on a network error.
- **Minimal Polish:** Avoided heavy UI frameworks like MUI to keep the bundle small, instead crafting a custom CSS design system on top of Tailwind's utility layer.

/* ═══════════════════════════════════════════════════
   TaskFlow — Design System
   ═══════════════════════════════════════════════════ */

## Running Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally)

### Step 1: Project Setup
```bash
# Clone the repository
git clone https://github.com/your-name/taskflow
cd taskflow

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/taskflow_db
JWT_SECRET=your-super-secret-key-change-this
```

### Step 3: Database Migrations
Create the database `taskflow_db` in your PostgreSQL instance, then run:
```bash
cd backend
npm run migrate:up
npm run seed
```

### Step 4: Start the Engines
**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```
The app will be available at http://localhost:5173.

## 4. Test Credentials
Use the following account to explore the pre-seeded data:
- **Email:** `test@example.com`
- **Password:** `password123`

## 5. API Reference
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT |
| `GET` | `/projects` | List user's projects |
| `POST` | `/projects` | Create a new project |
| `GET` | `/projects/:id` | Project details + tasks |
| `PATCH` | `/tasks/:id` | Update task status/meta |
| `DELETE` | `/tasks/:id` | Remove a task |

## 6. What I'd Do With More Time
1. **Drag and Drop:** Implement `@hello-pangea/dnd` for fluid task reordering between columns.
2. **WebSockets:** Add real-time collaboration so status changes sync across users' screens instantly.
3. **Unit Tests:** Add a test suite with `Supertest` and `Jest` to verify API security boundaries.
4. **Dark Mode:** Implement a persistent dark theme for late-night productivity sessions.
