# Productivity Plog — Frontend

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind + Redux Toolkit + React Query.
Features: posts & comments, guilds/channels with real-time chat, DMs, friends, EPUB reader, Coffee Focus, file upload, admin/moderation.

The API lives in the sibling `backend` repo (NestJS 11, Prisma/PostgreSQL, Redis, Socket.io).

## Run locally

```bash
cp .env.example .env.development   # fill in values
npm install
npm run dev                        # http://localhost:3000
```

Backend: see `../backend/README.md` (default API `http://localhost:8000/api`).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

## Architecture

See [CLAUDE.md](CLAUDE.md): route registry (`src/core/config/navigation.ts`), service layers (`services/api` → `services/client`), state and real-time notes. More in `docs/`.
