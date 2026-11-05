# Phase 1 — Foundation Report

## Files created / changed

```
.gitignore
README.md
backend/
  requirements.txt
  .env.example
  .env                      (git-ignored, local only)
  pytest.ini
  alembic.ini
  alembic/
    env.py                  (wired to app settings + models)
    script.py.mako
    versions/               (empty — first migration deferred)
  app/
    __init__.py
    main.py                 (FastAPI app, CORS, /api/v1 router)
    core/config.py          (pydantic-settings)
    db/base.py              (Base, UUIDPrimaryKeyMixin, TimestampMixin)
    db/session.py           (engine, SessionLocal, get_db)
    api/v1/router.py
    api/v1/routers/health.py
    models/ schemas/ services/ repositories/ utils/  (package stubs)
    tests/test_health.py
frontend/
  package.json              (Vite + React + Tailwind + app deps)
  vite.config.js            (Tailwind plugin + /api proxy to :8000)
  src/main.jsx              (React Query provider)
  src/App.jsx               (health-check UI)
  src/index.css             (Tailwind import)
docs/
  architecture/README.md
  architecture/phase-0-discovery.md
  architecture/phase-checklist.md
  database/README.md        (48-table inventory + data dictionary)
  database/er-diagram.md
```

## What works

- Backend imports and starts: `uvicorn app.main:app` → running on http://127.0.0.1:8000.
- `/api/v1/health` returns `{"status": "ok"}`.
- Frontend builds cleanly with Vite + React + Tailwind (Tailwind v4 via `@tailwindcss/vite`).
- Frontend dev server proxies `/api` to the backend on :8000.

## Environment notes

- Python 3.14.6 used (docs recommended 3.11/3.12). All dependencies installed and the app
  imports/run cleanly on 3.14; flag if a 3.11 venv is preferred for grading.
- PostgreSQL 16.15 installed and running on :5432, but not on PATH
  (bin at `C:\Program Files\PostgreSQL\16\bin`).
- **Pending:** the actual `postgres` superuser password. Until provided, `.env` uses a
  placeholder and the first Alembic migration / `rdx_leadflow` database creation cannot run.

## Commands to run

Backend:
```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```

Frontend:
```bash
cd frontend
npm run dev
```

## Next steps

1. Provide the PostgreSQL password → create `rdx_leadflow` DB, finalize `.env`, generate +
   apply the initial Alembic migration.
2. Begin Phase 2 (authentication & authorization).
