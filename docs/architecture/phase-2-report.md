# Phase 2 — Authentication & Authorization Report

## What was built

- **Models** (`app/models/`): `Profile`, `Organization`, `OrganizationMember`,
  `Role`, `Permission`, `role_permissions` (M2M), `Invitation`, `AuditLog`.
- **Security** (`app/core/security.py`): Argon2id password hashing, JWT access +
  refresh tokens.
- **Permissions** (`app/core/permissions.py`): 47 permission codes + 8 default roles
  (owner, admin, manager, lead_researcher, sdr, account_manager, finance, viewer).
- **Auth dependencies** (`app/api/v1/deps.py`): `get_current_profile`,
  `get_current_membership`, `require_permission`.
- **Service** (`app/services/auth_service.py`): register, login, refresh, change password.
- **Routes** (`app/api/v1/routers/auth.py`): `/auth/login`, `/register`, `/refresh`,
  `/logout`, `/me`, `/change-password`.
- **Schemas** (`app/schemas/auth.py`): Pydantic v2 request/response models.

## Database

- Created `rdx_leadflow` database.
- Initial Alembic migration generated, reviewed and applied (`baae1addc819_initial_schema`).
- 9 tables created: `organizations`, `profiles`, `organization_members`, `roles`,
  `permissions`, `role_permissions`, `invitations`, `audit_logs`, `alembic_version`.

## Tests

`pytest` — 4 passed (health, me-requires-auth, register/login/me flow).

## Verified end-to-end

- register → 201
- login (wrong password) → 401
- login (correct) → 200 + JWT
- me (with token) → 200
- me (no token) → 401
