# Phase Checklist

## Phase 0 — Discovery and design ✅
- [x] Confirm scope, roles, stack.
- [x] Finalize table inventory (48 tables) and design decisions.
- [x] Data dictionary, PK/FK, cardinality, ERD, index/uniqueness plan, org-scoping, cascade policy.

## Phase 1 — Project foundation ✅
- [x] Git repo + README.
- [x] `.gitignore`.
- [x] Backend skeleton (FastAPI app, config, session, base).
- [x] `.env.example`.
- [x] Frontend skeleton (Vite + React + Tailwind).
- [x] Alembic init + env wiring (migration deferred until DB credentials provided).
- [x] `/health` endpoint.
- [x] React → FastAPI health check works (verified: backend starts + health returns `{"status": "ok"}`; frontend builds).

## Phase 2 — Authentication & authorization ✅
- [x] profiles model + migration.
- [x] Password hashing (Argon2id) + login/refresh/logout.
- [x] JWT access + refresh tokens.
- [x] Roles/permissions + RBAC dependencies.
- [x] Protected routes (backend `deps.py`; frontend route guards deferred to CRM UI phase).
- [x] Tests: register/login/me/401 — 4 passing.

## Phase 3 — CRM foundation ✅
- [x] organizations / members.
- [x] companies / contacts.
- [x] lead_sources / lead_statuses / tags (models + seed).
- [x] CRUD, search, filter, pagination, duplicate validation.

## Phase 4 — Sales & work management ✅
- [x] pipelines / stages / deals.
- [x] stage history.
- [x] activities / tasks / notes / meetings (backend).
- [ ] Frontend UI for CRM + sales modules (deferred to frontend build phase).

## Phase 5 — Campaign management
- [ ] campaigns / channels / templates / steps / enrollments.
- [ ] email messages/events, suppression list, sender accounts.

## Phase 6 — Client delivery & finance
- [ ] services / client services / requirements.
- [ ] proposals / items, contracts / items.
- [ ] invoices / items, payments, expenses, revenue.

## Phase 7 — Dashboard, reports, admin
- [ ] KPI cards, charts, filters, drill-downs.
- [ ] workload, activity feed, notifications, integrations, audit logs.

## Phase 8 — QA & final submission
- [ ] backend/frontend tests.
- [ ] seed/demo data, ERD, data dictionary, API docs.
- [ ] installation guide, user manual, screenshots, backup/restore docs.
