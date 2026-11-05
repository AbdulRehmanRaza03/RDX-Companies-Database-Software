# Phase 3 + Phase 4 — Report

## Phase 3 — CRM Foundation (companies & contacts)

### Models
- `Company`, `Contact`, `ContactMethod`, `LeadSource`, `LeadStatus`,
  `LeadStatusHistory`, `LeadTag`, `LeadTagAssignment`.

### Key behavior (documented in master spec)
- **No separate `leads` table** — `companies` carries lead classification fields.
- **Duplicate detection** — normalized website domain (unique per org) and normalized
  email (unique per org).
- Domain normalization: `https://www.acme.com/` → `acme.com`.
- Search, filter (status/source/industry), sort, pagination on list endpoints.
- Organization scoping enforced on every lookup.

### Endpoints
`/companies`, `/contacts` (list/detail/create/update/delete).

## Phase 4 — Sales & Work Management

### Models
- `Pipeline`, `PipelineStage`, `Deal`, `DealStageHistory`, `Activity`, `Task`, `Note`,
  `Meeting`, `MeetingAttendee`, `Proposal` (header only).

### Key behavior
- **Stage history** — every stage transition writes a `DealStageHistory` row.
- Moving a deal stage auto-updates probability from the target stage (if not explicit).
- Stage/pipeline integrity validated on create and update.
- Tasks, notes (generic `noteable_type/noteable_id`), activities, meetings.

### Endpoints
`/deals`, `/deals/{id}/history`, `/tasks`, `/notes`, `/activities`, `/meetings`,
`/pipelines`.

## Seed data
- `python -m scripts.seed` creates demo org, owner user (`owner@rdx.com`/`password123`),
  roles, permissions, lead sources, lead statuses and a default 6-stage pipeline.

## Database
- Second Alembic migration applied: `9856a32b6edf_crm_foundation_and_sales_work_management`.
- Total tables now 26 (of the 48 target — remaining are campaigns, client delivery,
  finance and system-ops, built in Phases 5–7).

## Tests & verification
- `pytest` — 4 passed.
- Manual end-to-end verified: login, company CRUD + duplicate detection, contact CRUD,
  deal create + stage move (history + probability), task/note/activity/meeting creation.

## Next
- Frontend UI for these modules (shared layout, sidebar, data tables, forms, detail pages).
- Phase 5 (campaign management) backend.
