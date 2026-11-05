# Installation & Setup Guide

## Prerequisites
- Python 3.11+ (this project was developed on 3.14)
- Node.js LTS (v26 used)
- PostgreSQL 16 running locally

## 1. Database

Create the database (once):

```bash
export PGPASSWORD=YOUR_PASSWORD
"/c/Program Files/PostgreSQL/16/bin/psql" -U postgres -h localhost -c "CREATE DATABASE rdx_leadflow;"
```

## 2. Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Create .env from the example and set your real DATABASE_URL + JWT secret.
cp .env.example .env

# Apply migrations
alembic upgrade head

# Seed demo data (roles, permissions, lead sources/statuses, default pipeline, owner user)
python -m scripts.seed

# Run
uvicorn app.main:app --reload
```

Backend runs on http://localhost:8000 — Swagger at http://localhost:8000/docs.

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173 and proxies `/api` to :8000.

## Demo login

```
email:    owner@rdx.com
password: password123
```

## Seed data note

All seed/demo data is clearly synthetic (demo org "RDX Revenue Agency", sample
companies/contacts). No real customer data is bundled.
