# API Reference

Base path: `/api/v1`. All endpoints (except auth) require a Bearer token and an
`organization_id` query parameter for organization scoping.

Interactive docs: http://localhost:8000/docs (Swagger UI).

## Auth
- `POST /auth/register` — create profile (201)
- `POST /auth/login` — return access + refresh tokens
- `POST /auth/refresh` — exchange refresh token
- `POST /auth/logout`
- `GET /auth/me` — current profile
- `POST /auth/change-password`

## Companies
- `GET /companies` — list (search, filter by status/source/industry, pagination)
- `GET /companies/{id}`
- `POST /companies` — create (duplicate-domain detection)
- `PATCH /companies/{id}`
- `DELETE /companies/{id}`

## Contacts
- `GET /contacts` — list (filter by company, search, pagination)
- `GET /contacts/{id}`
- `POST /contacts` — create (duplicate-email detection)
- `PATCH /contacts/{id}`
- `DELETE /contacts/{id}`

## Deals
- `GET /deals` — list (filter by pipeline/stage, search)
- `GET /deals/{id}`
- `POST /deals` — create (validates stage belongs to pipeline)
- `PATCH /deals/{id}` — update (stage move writes history)
- `GET /deals/{id}/history` — stage history

## Work management
- `GET/POST /tasks`, `PATCH /tasks/{id}`
- `GET/POST /notes` (noteable_type/noteable_id)
- `GET/POST /activities`
- `GET/POST /meetings`
- `GET/POST /pipelines`

## Campaigns
- `GET/POST /templates`
- `GET/POST /campaigns`
- `GET/POST /enrollments` (suppression enforced)
- `GET/POST /suppression-list`
- `GET/POST /email-accounts`

## Finance
- `GET/POST /services`
- `GET/POST /invoices` (decimal-safe totals)
- `GET/POST /payments`
- `GET/POST /expenses`
- `GET/POST /revenue`

## Dashboard & reports
- `GET /dashboard/summary`
- `GET /dashboard/pipeline`
- `GET /dashboard/activity-feed`
- `GET /dashboard/upcoming-meetings`
- `GET /dashboard/campaign-performance`
- `GET /dashboard/team-workload`
- `GET /reports/leads-by-status`
- `GET /reports/leads-by-source`
- `GET /reports/deals-by-stage`
- `GET /reports/revenue-over-time`
- `GET /reports/financials`

## Status codes
- 200 OK, 201 Created, 204 No Content
- 401 Unauthorized, 403 Forbidden, 404 Not Found
- 409 Conflict (duplicates / suppression), 422 Validation error

All list endpoints return `{"items": [...], "total": N}` and support `skip`/`limit`.
