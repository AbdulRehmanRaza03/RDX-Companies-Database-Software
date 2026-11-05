# RDX LeadFlow

B2B Lead Generation, Sales CRM & Agency Operations Platform for RDX Revenue Agency.

A full-stack web application — React + Vite + Tailwind (frontend) and FastAPI + SQLAlchemy 2.0 + Alembic + PostgreSQL (backend).

## Project Structure

```
rdx-leadflow/
├── backend/            FastAPI application
├── frontend/           React + Vite application
├── docs/               Architecture, database, API and testing documentation
├── scripts/            Helper scripts
├── .env.example        Backend environment template
└── README.md
```

## Documentation

- [Architecture](docs/architecture/README.md)
- [Database design](docs/database/README.md)
- [ER diagram](docs/database/er-diagram.md)
- [Data dictionary](docs/database/data-dictionary-summary.md)
- [API reference](docs/api/README.md)
- [Installation guide](docs/architecture/installation-guide.md)
- [Backup & restore](docs/database/backup-restore.md)
- [Phase checklist](docs/architecture/phase-checklist.md)

## Status

Backend complete (48 tables, 43 API routes, 8 tests). Frontend complete
(login, dashboard, and all module UIs). See `docs/` for details.

## Prerequisites

- Python 3.11+ (recommended 3.11/3.12)
- Node.js LTS
- PostgreSQL 16

## Quick start

See `docs/` and the per-module `README` files for detailed setup.

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Configure .env (see .env.example)
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## License

Internal project for RDX Revenue Agency (academic context).
