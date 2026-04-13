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

### Full stack with Docker
A single `docker compose up --build` starts PostgreSQL, the API server, and the React frontend.

1. Copy `.env.example` to `.env` if you want to override defaults:
```bash
copy .env.example .env
```

2. Start the stack:
```bash
docker compose up --build
```

3. Open the frontend:
```text
http://localhost:3000
```

The backend API will be available at:
```text
http://localhost:5000/api/v1
```

> The compose stack automatically creates the database, runs migrations, and seeds demo data on first startup.

### Optional manual startup
If you prefer to run locally without Docker, keep the existing backend and frontend workflow.

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
