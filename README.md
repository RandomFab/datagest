<div align="center">

# 🥗 datagest

**Personal food & gut-transit tracker — log what you eat and how your digestion reacts, fast.**

![Angular](https://img.shields.io/badge/Angular-21-DD0031.svg?logo=angular&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.138-009688.svg?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.13-3776AB.svg?logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)

</div>

## 📖 About

datagest is a single-user health-tracking app to log meals, drinks, bowel movements and symptoms throughout the day, building a clean timestamped dataset to later understand how food influences intestinal transit.

Phase 1 focuses **exclusively on low-friction data collection** — analysis and correlations are a deliberate future phase, but the data model is designed now so that evolution needs no rework. It is meant to run on a personal **Raspberry Pi**, fully containerized.

## ✨ Features

- ✅ Daily **timeline** mixing food, drink, stool and symptom events in chronological order
- ✅ Fast logging of **food & drinks** with autocomplete from a reusable catalog
- ✅ **Bowel movement** logging on the **Bristol Stool Scale** (types 1–7)
- ✅ **Symptom** logging with intensity scale (1–10) and optional notes
- ✅ **Food catalog** management with search and tab toggle (foods / drinks)
- ✅ Food enrichment: **allergens** (14 EU regulated) + **nature taxonomy** (category → subtype)
- ✅ Mobile-first UI designed for quick on-the-go entry

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 21 (standalone components, signals, OnPush), TypeScript strict |
| Backend | FastAPI (Python 3.13), async, Pydantic v2 |
| Database | PostgreSQL 16 via SQLAlchemy 2.0 (asyncpg) + Alembic migrations |
| Infra | Docker Compose — Nginx (front), Uvicorn (back), Postgres |

## 📂 Project Structure

```
datagest/
├── frontend/        # Angular app (features: today, foods)
├── backend/         # FastAPI app (api / services / repositories / models)
│   ├── app/         # API v1 routes, schemas, SQLAlchemy models
│   └── alembic/     # Database migrations
├── docker/          # Dockerfiles (backend, frontend)
├── docs/            # Detailed documentation
├── docker-compose.yml
└── .env.example     # Environment template (single root .env)
```

## 🚀 Quick Start

### With Docker (recommended)

Requires Docker and Docker Compose.

```bash
# Clone
git clone https://github.com/RandomFab/datagest.git
cd datagest

# Configure
cp .env.example .env   # edit DB_PASSWORD, set DB_HOST=db for Docker

# Run (migrations + seed run automatically on first boot)
docker compose up --build
```

Open **http://localhost** — the frontend (Nginx) proxies to the backend API.

### Local development

Run the backend and frontend separately against a local Postgres. Keep `DB_HOST=localhost` in `.env`.

```bash
# Backend — http://localhost:8000  (docs at /docs)
cd backend
pip install -e ".[dev]"
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --reload

# Frontend — http://localhost:4200
cd frontend
npm install
npm start
```

## ⚙️ Configuration

All configuration comes from a **single `.env` at the repo root** (copy from `.env.example`). Never commit `.env`.

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | `localhost` for local dev, `db` for Docker | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `datagest` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `changeme` |
| `DEBUG` | Enable debug mode | `false` |
| `CORS_ORIGINS` | Allowed origins (JSON list, optional) | `["http://localhost:4200"]` |

## 🐳 Deployment

The target is a personal **Raspberry Pi**, fully containerized with `docker-compose`:

- **frontend** — Nginx serving the optimized Angular production build
- **backend** — Uvicorn running FastAPI; Alembic migrations and seed run on startup
- **db** — PostgreSQL with a persistent named volume and health check

Images are kept slim (`python:3.13-slim`) and ARM-compatible. Reverse proxy and HTTPS are expected at the edge.

> 💡 For detailed deployment, architecture and design context, see the [`docs/`](docs/) directory.

## 📚 Documentation

| Topic | Link |
|-------|------|
| Application description & scope | [docs/app_description.md](docs/app_description.md) |
| Backend architecture | [docs/backend-architecture.md](docs/backend-architecture.md) |
| Frontend architecture | [docs/frontend-architecture.md](docs/frontend-architecture.md) |
| UI / UX pitch | [docs/ui_ux_pitch.md](docs/ui_ux_pitch.md) |
| Agent & project conventions | [CLAUDE.md](CLAUDE.md) |

## 👤 Author

**RandomFab** — Fabien BARDOUIL

## 📄 License

Copyright (C) 2026 Fabien Bardouil.

This project is licensed under the **GNU Affero General Public License v3.0** (AGPL-3.0).
You are free to use, study, modify and redistribute it, **provided that any derivative work — including software made available over a network — remains open source under the same license and retains attribution**.

See the [LICENSE](LICENSE) file for the full text.
