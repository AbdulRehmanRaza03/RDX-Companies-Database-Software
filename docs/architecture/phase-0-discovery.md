# Phase 0 — Discovery and Design

## 1. Scope Confirmed

Building **RDX LeadFlow**: a single-agency (organization-aware, multi-tenant-ready) B2B
lead generation, sales CRM and agency operations platform.

Initial roles: Owner/Super Admin, Admin, Manager, Lead Researcher, SDR, Account Manager,
Finance, Viewer. Authorization is enforced on the backend via role-permission mappings and
organization membership checks.

## 2. Technology Decisions (final)

| Layer | Choice |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Routing | React Router |
| Server state | TanStack Query |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Backend | Python + FastAPI |
| ORM | SQLAlchemy 2.0 (typed declarative) |
| Migrations | Alembic |
| Validation | Pydantic v2 |
| Database | Local PostgreSQL 16 |
| Auth | JWT access tokens + Argon2id password hashing |
| Tests | Pytest + HTTPX (backend), Vitest (frontend) |

## 3. Resolved Design Decisions

The master documentation left several schema decisions open. These are resolved as follows
(for detailed rationale see `docs/database/README.md`):

1. **Lead entity** — We do NOT introduce a separate `leads` table in v1. `companies` are the
   prospect/account, `contacts` are the people. Lead qualification fields (`lead_status_id`,
   `lead_source_id`, `owner_id`, `next_follow_up_date`, qualification metadata) live on the
   `companies` table, with `lead_status_history` tracking transitions. This keeps the primary
   prospect-to-client workflow on one entity and avoids a redundant mirror table.

2. **Tag polymorphism** — Tags are scoped via explicit association tables (`lead_tag_assignments`)
   for companies and contacts. No generic `entity_type/entity_id` without referential integrity.

3. **Notes polymorphism** — Notes use a documented generic `noteable` reference
   (`noteable_type` + `noteable_id`) with a database CHECK constraint on the type, and the
   backend resolves/validates the target. Chosen over separate per-entity note tables to avoid
   a large number of near-identical tables; integrity is enforced in the service layer with an
   index on `(noteable_type, noteable_id)`.

4. **Organization scoping** — Every organization-owned business table includes `organization_id`
   directly (except child tables where it is inherited through a verified parent, e.g.
   `pipeline_stages` → `pipelines`). Lookups always filter by organization membership.

5. **Contact methods** — Primary `email`/`phone` stay on `contacts`. `contact_methods` stores
   only additional channels (secondary email, WhatsApp, etc.).

6. **Email secrets** — `email_accounts` stores provider metadata only, never tokens/credentials.
   If integration is added later, credentials are encrypted at rest and never returned in API
   responses.

7. **Suppression** — A `suppression_list` table is enforced before every outreach enrolment /
   send attempt.

8. **Snapshot semantics** — `proposal_items` and `contract_items` store price/description
   snapshots so later catalogue edits do not rewrite historical agreements.

9. **Payment allocation** — Invoice payment allocation is explicit: `payments` link to one
   `invoice` (each payment applies to a single invoice in v1). Multi-invoice allocation is
   deferred. See finance module notes.

10. **Soft delete** — Sensitive/historical entities (companies, contacts, deals, contracts,
    invoices) have a nullable `deleted_at`. Hard delete is reserved for low-value child records
    and junction rows.

## 4. Table Inventory (target)

The blueprint proposes 48 tables. Our final inventory trades a few tables for a cleaner,
intentional schema (see `docs/database/README.md` for the full count and rationale). The final
inventory is the source of truth and is documented in the data dictionary and ERD.
