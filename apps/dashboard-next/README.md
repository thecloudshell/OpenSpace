# DRN OpenSpace Dashboard (Next.js)

The DRN-branded OpenSpace dashboard — a [Modernize Tailwind Next.js](https://adminmart.com/product/modernize-tailwind-nextjs-dashboard-template/) (free edition) app customized for the OpenSpace skill-management runtime. UI foundation, component library and theme are provided by the template; see `ATTRIBUTION.md` and `LICENSE`.

## Stack

- Next.js (app router, standalone output) + Tailwind CSS v4 + shadcn-style Radix components
- Data comes from the real OpenSpace backend: `openspace-dashboard` (Flask, port `7788`)

## Routes

| Route         | Contents                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `/`           | Stat cards (count-up), runtime health card with re-check, quick actions, top skills + recent sessions |
| `/skills`     | Skill library — search, category chips, sort, card grid, origins rail, "How to add skills" panel  |
| `/evolution`  | Per-skill version lineage graph (generations, scores, links)                                      |
| `/workflows`  | Workflow sessions table with search                                                               |

## API wiring

All calls go through the Next rewrite proxy at `/api/v1/*`, which forwards to
`API_INTERNAL_URL` (default `http://127.0.0.1:7788`). Endpoints used:

- `GET /api/v1/overview` — dashboard stats, top/recent skills, recent workflows
- `GET /api/v1/health` — header status chip + runtime snapshot
- `GET /api/v1/skills` — skill library (`active_only`, `sort`, `limit`, `query`)
- `GET /api/v1/skills/stats` — category/origin counts for chips and the rail
- `GET /api/v1/skills/<id>/lineage` — evolution lineage nodes/edges
- `GET /api/v1/workflows` — sessions table

No endpoint fakes data: empty responses render empty states.

## Develop

```bash
cd apps/dashboard-next
npm install
npm run dev          # http://localhost:3000
```

With the API on another host/port, set `API_INTERNAL_URL` before starting:

```bash
API_INTERNAL_URL=http://127.0.0.1:7788 npm run dev
```

## Environment variables

| Variable           | Default                     | Used by                                   |
| ------------------ | --------------------------- | ----------------------------------------- |
| `API_INTERNAL_URL` | `http://127.0.0.1:7788`     | Next rewrites — where `/api/*` is proxied (server-side, read at server start) |
| `PORT`             | `4799` (Docker) / `3000`    | Standalone server port                    |
| `HOSTNAME`         | `0.0.0.0` (Docker)          | Standalone bind address                   |

## Build

```bash
cd apps/dashboard-next
npm ci
npm run build        # emits .next/standalone
```

## Docker deploy (from repo root)

```bash
docker compose -f deploy/docker-compose.dashboard.yml up -d --build
# open http://127.0.0.1:4799
```

- `Dockerfile.dashboard-web` builds this app (`npm ci` + `next build`) and runs the standalone server on port `4799`.
- `Dockerfile.dashboard-api` installs the `openspace` Python package and runs `openspace-dashboard --host 0.0.0.0 --port 7788 --evolution-storage-root /workspace`, storing its sqlite databases in `/workspace/.openspace` (named volume `openspace-workspace`).
- The web container proxies `/api/*` to `http://dashboard-api:7788` via `API_INTERNAL_URL`.
