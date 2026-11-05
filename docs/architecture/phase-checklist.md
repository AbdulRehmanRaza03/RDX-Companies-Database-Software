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

## Phase 5 — Campaign management ✅
- [x] campaigns / channels / templates / steps / enrollments.
- [x] email messages/events, suppression list, sender accounts.
- [x] Suppression enforced before enrollment (tested).

## Phase 6 — Client delivery & finance ✅
- [x] services / client services / requirements.
- [x] proposals / items, contracts / items.
- [x] invoices / items, payments, expenses, revenue.
- [x] Decimal-safe totals (tested); duplicate invoice number validation.

## Phase 7 — Dashboard, reports, admin ✅
- [x] KPI summary + pipeline + activity feed + workload + campaign performance (live aggregate queries).
- [x] Reports: leads-by-status/source, deals-by-stage, revenue-over-time, financials.
- [x] Notifications/integrations/audit models (backend).
- [ ] Frontend dashboard UI (deferred to frontend build).

## Phase 8 — QA & final submission ✅
- [x] Backend tests (8 passing: auth, decimal totals, suppression, dashboard).
- [x] Seed/demo data.
- [x] Data dictionary + ERD + API docs + installation guide + backup/restore docs.
- [x] Frontend UI (login, dashboard, companies, contacts, deals, tasks, campaigns, finance, reports).
- [ ] Screenshots + demo script (can be generated from the running app).
