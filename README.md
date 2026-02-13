# DevDash

DevDash is a Tokyo Night Studio full-stack developer productivity suite combining:

- GitHub stats
- Commit analyzer
- Snippet manager
- API mocker

## Stack

- Client: React + TypeScript + Vite + Zustand + TanStack Query + Framer Motion + Monaco
- Server: Node.js + Express + TypeScript + Prisma + PostgreSQL + Redis + BullMQ + Socket.IO
- Infra: Docker Compose (PostgreSQL + Redis)

## Project structure

```text
devdash/
├── client/
├── server/
└── docker-compose.yml
```

## Quick start

1. Start infrastructure:

```bash
docker compose up -d
```

2. Client setup:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

3. Server setup (new terminal):

```bash
cd server
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

4. Open app at `http://localhost:5173`.

## Web host deployment (single service)

DevDash is now host-compatible as one web service:

- Root install command: `npm install`
- Root build command: `npm run build`
- Root start command: `npm start`

This works because server production mode serves the built SPA from `client/dist`.

### Required host env vars

- `NODE_ENV=production`
- `PORT` (provided by most hosts)
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL` (use your hosted domain + `/api/auth/github/callback`)
- `CLIENT_URLS` (comma-separated allowed frontend origins; include your hosted URL)
- `SERVE_CLIENT=true`

## Supabase backend setup (free-tier friendly)

If you want a free backend, use Supabase Postgres + Upstash Redis.

1. Create a Supabase project.
2. Copy connection strings from Supabase project settings.
3. In [server/.env.example](server/.env.example) copied to `.env` set:
	- `DATABASE_URL` = Supabase pooler URL (`...pooler.supabase.com:6543...`)
	- `DIRECT_URL` = Supabase direct URL (`db.<project-ref>.supabase.co:5432`)
4. Set `REDIS_URL` to free Upstash Redis URL (or local Redis for development).
5. Run migrations:

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

Notes:

- `DATABASE_URL` is used by runtime Prisma client.
- `DIRECT_URL` is used for Prisma migrations and avoids pooler migration issues.

## Current implementation status

- Tokyo Night app shell with command palette (`Ctrl/Cmd + K`) and floating tab navigation
- Bento-style Dashboard with drag-and-drop widgets and realtime activity feed
- GitHub OAuth login/callback flow with JWT cookie session and `/api/auth/me`
- GitHub Stats now fetches live account data when OAuth token is available (with fallback)
- Commit Analyzer, Snippet Manager (Monaco), and API Mocker module shells
- Prisma-backed Snippet and Mock API CRUD routes with authenticated user scoping
- Commit analyzer queue supports polling via `/api/commits/analyze/:jobId`
- Snippets support share URL generation via `/api/snippets/:id/share` and public fetch via `/api/snippets/share/:shareId`
- API Mocker supports export downloads: `/api/mocks/export/openapi` and `/api/mocks/export/postman`
- Socket.IO realtime heartbeat events and BullMQ worker scaffold

## GitHub OAuth setup

1. Create a GitHub OAuth App:
	- Homepage URL: `http://localhost:5173`
	- Authorization callback URL: `http://localhost:4000/api/auth/github/callback`
2. Put credentials in [server/.env.example](server/.env.example) (copied to `.env`):
	- `GITHUB_CLIENT_ID`
	- `GITHUB_CLIENT_SECRET`
3. Start server and client, then use **Connect GitHub** in the top bar.

## Next implementation milestones

- Complete GitHub OAuth handshake and persistent user session flow
- Wire Prisma models to snippet/mock CRUD routes
- Add robust commit analysis pipeline and job result polling
- Implement OpenAPI/Postman export for API Mocker
- Add CI workflow, ESLint/Prettier alignment, and integration tests
