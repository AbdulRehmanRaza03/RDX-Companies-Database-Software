# Architecture

## High-level architecture

```
Browser (React SPA)
        |
        | REST JSON (HTTPS/localhost)
        v
FastAPI (routers -> services -> repositories/session)
        |
        | SQLAlchemy 2.0 ORM
        v
PostgreSQL 16
```

The React frontend never connects directly to PostgreSQL. All access flows through the
FastAPI REST API under `/api/v1`.

## Layering

| Layer | Responsibility |
|---|---|
| API routers (`app/api/v1/routers`) | HTTP concerns, request/response, status codes, auth dependencies |
| Services (`app/services`) | Business rules, transactions, authorization checks, dedup/validation |
| Repositories (`app/repositories`) | SQLAlchemy query construction, pagination, filtering |
| Models (`app/models`) | Declarative persistence structure |
| Schemas (`app/schemas`) | Pydantic v2 request/response validation and serialization |

- ORM models are never returned directly from the API; Pydantic schemas are used.
- Business rules live in services, not in routers or React components.
- Database credentials and JWT secrets live in `backend/.env` only.

## Security architecture

- Passwords hashed with Argon2id.
- JWT access tokens with configurable expiry; refresh token strategy documented.
- RBAC enforced on every protected route via permission dependencies.
- Organization ownership verified on every record lookup/update/delete.
- CORS restricted to the configured frontend origin (`FRONTEND_ORIGIN`).
- SQLAlchemy parameterized queries only (no string concatenation into SQL).

## Repository structure

```
backend/
  app/
    api/
      v1/
        routers/
        deps.py
    core/
      config.py
      security.py
      permissions.py
    db/
      base.py
      session.py
    models/
    schemas/
    services/
    repositories/
    utils/
    main.py
  alembic/
  tests/
  requirements.txt
  .env.example

frontend/
  src/
    app/
    components/
    features/
    hooks/
    lib/
    routes/
    styles/
  public/
  package.json
```

See the database and API docs for detailed schemas and endpoints.
