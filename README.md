# Team Finder (Dockerized, multi-container)

The same **Team & Talent Finder** app, packaged as three Docker containers with
server-side persistence (data is shared across everyone who opens the app, not
just stored in one browser).

## Architecture

```
Browser ──▶ frontend (nginx, port 8080)
                 │  serves the React build
                 │  proxies /api/* ──▶ backend (Node/Express, port 4000)
                                              │
                                              ▼
                                        db (Postgres 16)
```

- **frontend** — React + Vite build served by nginx. nginx also reverse-proxies
  `/api/*` to the backend, so the browser only ever talks to one origin.
- **backend** — Express REST API that reads/writes employees in Postgres and
  parses free-text expertise into normalized skill tags.
- **db** — Postgres 16 with a named volume (`pgdata`) so data survives restarts.

## Run it

Requires Docker Desktop (Docker + Compose).

```bash
cd ~/team-finder-docker
docker compose up --build
```

Then open **http://localhost:8080**.

On first start the backend creates the schema and seeds the sample dataset.
Stop with `Ctrl+C`; run in the background with `docker compose up -d --build`.

### Common commands

```bash
docker compose up -d --build      # start (rebuild images) in background
docker compose logs -f backend    # follow backend logs
docker compose down               # stop and remove containers (keeps data)
docker compose down -v            # stop and also delete the database volume
```

## API

Base URL: `http://localhost:8080/api` (or `http://localhost:4000/api` directly).

| Method | Path                     | Description                                  |
|--------|--------------------------|----------------------------------------------|
| GET    | `/api/health`            | Liveness check                               |
| GET    | `/api/employees`         | List all employees (newest first)            |
| POST   | `/api/employees`         | Create an employee                           |
| PUT    | `/api/employees/:id`     | Update an employee                           |
| DELETE | `/api/employees/:id`     | Delete an employee                           |
| POST   | `/api/employees/import`  | Bulk import `{ mode: "merge"\|"replace", employees: [...] }` |
| POST   | `/api/employees/reset`   | Reset to the built-in sample dataset         |

Skills are always (re)computed on the server from the `expertiseRaw` text, so
tags stay consistent regardless of the client.

## Project layout

```
team-finder-docker/
├── docker-compose.yml
├── frontend/          # React app + Dockerfile + nginx.conf
│   └── src/
└── backend/           # Express API + Dockerfile
    └── src/
        ├── index.js       # routes
        ├── db.js          # Postgres pool, schema, seed
        ├── skills.js      # expertise -> skill tags
        └── sampleData.js  # seed rows
```

## Local development (without Docker)

```bash
# terminal 1 — backend (needs a local Postgres or point DATABASE_URL at one)
cd backend && npm install && DATABASE_URL=postgres://... npm run dev

# terminal 2 — frontend (Vite proxies /api to http://localhost:4000)
cd frontend && npm install && npm run dev
```
