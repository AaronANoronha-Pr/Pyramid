# Pyramid

Pyramid is a Jira-style task and project management app. It's a **shared workspace**: every signed-in account (guest or Google) sees and edits the same board — there's no per-account data isolation. Tasks track full detail (subtasks, comments, resources, custom fields, activity history, live presence), and can optionally belong to a Project, which rolls up its tasks into a status chart, a task table, and an aggregated activity feed.

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | Next.js (App Router) · TypeScript · Tailwind CSS · Base UI (`@base-ui/react`) primitives |
| Backend | NestJS · Prisma ORM · SQLite |
| Auth | Google OAuth + guest login · JWT session cookie |

Two independent apps, no shared build tooling:

```
pyramid/
├── backend/    NestJS API — port 3001
└── frontend/   Next.js app — port 3000
```

## Getting started

**Backend**

```bash
cd backend
npm install
# create a .env file with the variables listed below
npx prisma migrate deploy
npx prisma generate
npm run start:dev
```

**Frontend**

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
npm run dev
```

Open `http://localhost:3000` and click **Continue as Guest** — no setup required for guest login. Google login needs the OAuth env vars below.

### Environment variables

**`backend/.env`**

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite connection string (e.g. `file:./dev.db`) |
| `PORT` | API port |
| `FRONTEND_URL` | Frontend origin, for CORS and OAuth redirects |
| `JWT_SECRET` | Signs the session cookie |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | Google OAuth credentials (from Google Cloud Console) |

**`frontend/.env.local`**

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API |

## Features

### Tasks

- **Board view** — 4-column Kanban (To Do / Doing / Completed / On Hold), drag-and-drop between columns
- **List view** — grouped by column, collapsible groups
- **Field visibility toggle** — show/hide Priority, Members, Due Date, Labels, Status, Reporter, Project per view
- **Filtering** — multi-select filters across Status, Priority, Members, Due Date (Overdue / Due Today / Due This Week / No Date), Teams, Labels, Reporter, and Project, with an active-filter count badge and one-click clear
- **Per-column sort** — sort a column's cards by Priority or Due Date
- **Search** — filter the board/list by task title
- Inline task creation and deletion

### Task detail

- Inline title/description editing
- Properties (assignee, due date), Labels, Resources
- **Resources** — attach either an external link or an uploaded file; edit or remove either kind
- **Subtasks** — inline table plus a detail popup (breadcrumb back to the parent task, description, priority, assignee, due date, delete)
- **Comments** — threaded replies, file attachments, edit/delete your own comment
- **Details sidebar** — Status, Priority, Members, Dates (start/end, each bounded by the other so start can't land after end), Labels, Teams, Reporter, Project, and arbitrary Custom Fields
- **Activity feed** — automatic change log (who changed what, from what, to what) plus manually-posted update notes
- **Live presence** — the eye icon shows a real-time count of other users currently viewing the task
- **Lock** — freezes every editable surface except Comments, so discussion can continue on a locked task
- **Share** — copies a link to the task

### Projects

- Project list (name, priority, lead, due date) with the same search / field-visibility / filter pattern as Tasks
- Create and delete projects
- **Project detail page**:
  - Editable header (name, description, priority, lead, due date)
  - Status-breakdown chart across the project's tasks
  - Task table scoped to the project
  - Aggregated activity feed spanning every task in the project — entries survive even after the task itself is deleted, via a title snapshot

### Settings

- Profile editing (name, title, username, email, avatar upload)
- Theme (light/dark) and accent color
- Functional settings search

### Auth

- Instant guest login, no signup
- Google OAuth login
- Session guard redirects unauthenticated visitors to the login screen rather than showing a misleading "not found" error

## Data model

`User`, `Task`, `Subtask`, `Comment`, `CommentAttachment`, `TaskMember`, `Resource`, `CustomField`, `TaskPresence`, `ActivityLog`, `Project` — see `backend/prisma/schema.prisma` for the full schema.

Access control is intentionally shallow: `ownerId` on every row records who created it (used for activity-log authorship), but reads are never filtered by it — the whole point is a shared board. The one exception is comments, where only the original author can edit or delete their own comment.
