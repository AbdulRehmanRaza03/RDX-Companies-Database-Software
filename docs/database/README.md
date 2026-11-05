# Database Design

## 1. Final Table Inventory

The master documentation's blueprint proposed 48 tables. The final inventory below is the
authoritative schema. It intentionally coalesces a few tables to keep the model normalized
and coherent (see "Design decisions" at the end).

### Module A — Organization, users and permissions (7 tables)

| # | Table | Purpose |
|---|---|---|
| 1 | `organizations` | Agency organization details |
| 2 | `profiles` | User profile linked to auth identity |
| 3 | `organization_members` | User membership + organization-level status |
| 4 | `roles` | Named roles |
| 5 | `permissions` | Granular permission definitions |
| 6 | `role_permissions` | M2M role ↔ permission |
| 7 | `invitations` | Pending team invitations |

### Module B — Companies, contacts and lead classification (8 tables)

| # | Table | Purpose |
|---|---|---|
| 8 | `companies` | Prospect/account AND client companies, lead qualification fields |
| 9 | `contacts` | Decision-makers / people at companies |
| 10 | `lead_sources` | LinkedIn, website, referral, directory, event, manual |
| 11 | `lead_statuses` | Configurable lead statuses |
| 12 | `lead_status_history` | Status transition history |
| 13 | `lead_tags` | Reusable labels |
| 14 | `lead_tag_assignments` | Tag association with companies/contacts |
| 15 | `contact_methods` | Additional contact channels |

### Module C — Pipeline, sales and work management (10 tables)

| # | Table | Purpose |
|---|---|---|
| 16 | `pipelines` | Sales pipeline definitions |
| 17 | `pipeline_stages` | Ordered stages within a pipeline |
| 18 | `deals` | Opportunities linked to company + pipeline |
| 19 | `deal_stage_history` | Stage changes + timestamps |
| 20 | `activities` | Calls, emails, research, interactions |
| 21 | `tasks` | Assigned work + due dates |
| 22 | `notes` | Internal notes (generic noteable) |
| 23 | `meetings` | Meeting schedule, agenda, outcome |
| 24 | `meeting_attendees` | Meeting ↔ contact/user association |
| 25 | `proposals` | Proposal header, status, version |

### Module D — Outreach and campaign tracking (9 tables)

| # | Table | Purpose |
|---|---|---|
| 26 | `campaigns` | Outreach campaign definitions |
| 27 | `campaign_channels` | Channel config per campaign |
| 28 | `email_templates` | Reusable email content |
| 29 | `campaign_steps` | Ordered message/follow-up steps |
| 30 | `campaign_enrollments` | Contact enrolment + current state |
| 31 | `email_messages` | Message metadata + send state |
| 32 | `email_events` | delivered/bounced/opened/clicked/replied/unsubscribed |
| 33 | `suppression_list` | Contacts excluded from outreach |
| 34 | `email_accounts` | Sender account metadata + connection state |

### Module E — Client services and delivery (6 tables)

| # | Table | Purpose |
|---|---|---|
| 35 | `services` | Service catalogue |
| 36 | `client_services` | Service purchased/assigned to a client |
| 37 | `proposal_items` | Proposal line items (snapshot) |
| 38 | `contracts` | Client contracts + lifecycle |
| 39 | `contract_items` | Contract deliverables/commercial terms (snapshot) |
| 40 | `client_requirements` | Client ICP, geography, industry, exclusions, goals |

### Module F — Finance (5 tables)

| # | Table | Purpose |
|---|---|---|
| 41 | `invoices` | Invoice headers |
| 42 | `invoice_items` | Invoice line items |
| 43 | `payments` | Payment records (single-invoice allocation) |
| 44 | `expenses` | Operational expenses |
| 45 | `revenue_records` | Revenue/commission entries |

### Module G — System operations (3 tables)

| # | Table | Purpose |
|---|---|---|
| 46 | `integrations` | Provider integration metadata (no secrets) |
| 47 | `notifications` | In-app notifications |
| 48 | `audit_logs` | Security + business audit trail |

**Final count: 48 tables.**

## 2. Data Dictionary

Naming/types conventions:

- Primary keys: `id` of type `UUID` (via `uuid4`).
- Timestamps: `DateTime(timezone=True)`; `created_at` / `updated_at` on every business table.
- `created_by` / `updated_by`: nullable `UUID` FK to `profiles.id`.
- Money: `Numeric(12,2)` with an explicit `currency` (ISO 4217 3-letter code) field.
- Finite states: PostgreSQL `ENUM` (via SQLAlchemy enum) or `CHECK` constraints.
- Soft-delete: nullable `deleted_at`.

### Module A

**`organizations`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | varchar(255) | not null |
| slug | varchar(255) | unique, not null |
| website | varchar(255) | |
| logo_url | varchar(512) | |
| created_at / updated_at | timestamptz | |
| deleted_at | timestamptz | null |

**`profiles`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| email | varchar(320) | unique, not null, normalized lowercase |
| password_hash | varchar(255) | not null |
| first_name / last_name | varchar(120) | |
| phone | varchar(40) | |
| is_active | boolean | default true |
| is_superuser | boolean | default false |
| last_login_at | timestamptz | null |
| created_at / updated_at | timestamptz | |

**`organization_members`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations, not null |
| profile_id | UUID | FK profiles, not null |
| role_id | UUID | FK roles, not null |
| status | enum | active/invited/suspended |
| joined_at | timestamptz | |
| created_at / updated_at | timestamptz | |
| unique(organization_id, profile_id) | | |

**`roles`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations, nullable (system roles) |
| name | varchar(120) | not null |
| description | text | |
| created_at / updated_at | timestamptz | |

**`permissions`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| code | varchar(120) | unique, not null |
| description | text | |

**`role_permissions`** (M2M)
| Column | Type | Constraints |
|---|---|---|
| role_id | UUID | FK roles, not null |
| permission_id | UUID | FK permissions, not null |
| PK(role_id, permission_id) | | |

**`invitations`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| email | varchar(320) | not null |
| role_id | UUID | FK roles |
| token | varchar(255) | unique |
| expires_at | timestamptz | |
| status | enum | pending/accepted/expired/revoked |
| created_by | UUID | FK profiles |
| created_at / updated_at | timestamptz | |

### Module B

**`companies`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| name | varchar(255) | not null |
| website | varchar(255) | |
| domain | varchar(255) | normalized, indexed |
| industry | varchar(120) | |
| employee_range | varchar(40) | |
| country / region / city | varchar(120) | |
| linkedin_url | varchar(512) | |
| description | text | |
| lead_source_id | UUID | FK lead_sources |
| lead_status_id | UUID | FK lead_statuses |
| owner_id | UUID | FK profiles |
| research_notes | text | |
| next_follow_up_date | date | null |
| created_by / updated_by | UUID | FK profiles |
| created_at / updated_at | timestamptz | |
| deleted_at | timestamptz | null |
| unique(organization_id, domain) | | (where domain not null) |

**`contacts`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| company_id | UUID | FK companies |
| first_name / last_name | varchar(120) | not null |
| job_title | varchar(160) | |
| email | varchar(320) | normalized, indexed |
| phone | varchar(40) | |
| linkedin_url | varchar(512) | |
| owner_id | UUID | FK profiles |
| verification_status | enum | unverified/verified/invalid |
| consent_status | enum | unknown/granted/denied |
| do_not_contact | boolean | default false |
| created_by / updated_by | UUID | FK profiles |
| created_at / updated_at | timestamptz | |
| deleted_at | timestamptz | null |
| unique(organization_id, email) | | (where email not null) |

**`lead_sources`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| name | varchar(120) | not null |
| is_active | boolean | default true |

**`lead_statuses`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| name | varchar(120) | not null |
| category | enum | new/qualified/contacted/meeting/won/lost |
| sort_order | int | default 0 |

**`lead_status_history`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| company_id | UUID | FK companies |
| from_status_id | UUID | FK lead_statuses null |
| to_status_id | UUID | FK lead_statuses |
| changed_by | UUID | FK profiles |
| changed_at | timestamptz | default now() |

**`lead_tags`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| name | varchar(120) | not null |
| color | varchar(20) | |

**`lead_tag_assignments`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| tag_id | UUID | FK lead_tags |
| company_id | UUID | FK companies null |
| contact_id | UUID | FK contacts null |
| CHECK exactly one of company_id/contact_id | | |

**`contact_methods`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| contact_id | UUID | FK contacts |
| method_type | enum | email/phone/whatsapp/other |
| value | varchar(255) | not null |
| is_primary | boolean | default false |

### Module C

**`pipelines`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| name | varchar(160) | not null |
| is_default | boolean | default false |

**`pipeline_stages`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| pipeline_id | UUID | FK pipelines |
| name | varchar(160) | not null |
| sort_order | int | not null |
| probability | int | 0–100 |

**`deals`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| company_id | UUID | FK companies |
| pipeline_id | UUID | FK pipelines |
| stage_id | UUID | FK pipeline_stages |
| primary_contact_id | UUID | FK contacts null |
| name | varchar(255) | not null |
| amount | Numeric(12,2) | |
| currency | char(3) | default 'USD' |
| expected_close_date | date | null |
| owner_id | UUID | FK profiles |
| probability | int | 0–100 |
| outcome | enum | open/won/lost |
| loss_reason | text | |
| created_by / updated_by | UUID | |
| created_at / updated_at | timestamptz | |
| deleted_at | timestamptz | null |

**`deal_stage_history`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| deal_id | UUID | FK deals |
| from_stage_id | UUID | FK pipeline_stages null |
| to_stage_id | UUID | FK pipeline_stages |
| changed_by | UUID | FK profiles |
| changed_at | timestamptz | default now() |

**`activities`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| type | enum | call/email/research/follow_up/other |
| subject | varchar(255) | |
| description | text | |
| company_id | UUID | FK companies null |
| contact_id | UUID | FK contacts null |
| deal_id | UUID | FK deals null |
| owner_id | UUID | FK profiles |
| occurred_at | timestamptz | |
| created_at / updated_at | timestamptz | |

**`tasks`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| title | varchar(255) | not null |
| description | text | |
| assignee_id | UUID | FK profiles |
| priority | enum | low/medium/high/urgent |
| status | enum | open/in_progress/completed/cancelled |
| due_date | date | null |
| related_type / related_id | | generic reference (company/contact/deal) |
| created_by | UUID | |
| created_at / updated_at | timestamptz | |

**`notes`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| noteable_type | varchar(40) | company/contact/deal |
| noteable_id | UUID | |
| content | text | not null |
| author_id | UUID | FK profiles |
| created_at / updated_at | timestamptz | |
| INDEX(noteable_type, noteable_id) | | |

**`meetings`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| title | varchar(255) | not null |
| agenda | text | |
| outcome | text | |
| scheduled_at | timestamptz | |
| duration_minutes | int | |
| location | varchar(255) | |
| organizer_id | UUID | FK profiles |
| company_id | UUID | FK companies null |
| deal_id | UUID | FK deals null |
| status | enum | scheduled/completed/cancelled |
| created_at / updated_at | timestamptz | |

**`meeting_attendees`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| meeting_id | UUID | FK meetings |
| contact_id | UUID | FK contacts null |
| profile_id | UUID | FK profiles null |
| CHECK exactly one of contact_id/profile_id | | |

**`proposals`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| company_id | UUID | FK companies |
| deal_id | UUID | FK deals null |
| title | varchar(255) | |
| status | enum | draft/sent/accepted/declined/expired |
| version | int | default 1 |
| currency | char(3) | default 'USD' |
| total_amount | Numeric(12,2) | |
| valid_until | date | null |
| created_by / updated_by | UUID | |
| created_at / updated_at | timestamptz | |

### Module D

**`campaigns`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| name | varchar(160) | not null |
| status | enum | draft/active/paused/completed |
| owner_id | UUID | FK profiles |
| created_at / updated_at | timestamptz | |

**`campaign_channels`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| campaign_id | UUID | FK campaigns |
| channel_type | enum | email/linkedin/manual |
| config | JSONB | provider metadata |
| email_account_id | UUID | FK email_accounts null |

**`email_templates`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| name | varchar(160) | not null |
| subject | varchar(255) | |
| body | text | not null |
| created_by | UUID | |
| created_at / updated_at | timestamptz | |

**`campaign_steps`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| campaign_id | UUID | FK campaigns |
| template_id | UUID | FK email_templates null |
| sort_order | int | not null |
| delay_days | int | default 0 |
| step_type | enum | email/task/manual |

**`campaign_enrollments`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| campaign_id | UUID | FK campaigns |
| contact_id | UUID | FK contacts |
| status | enum | active/paused/unsubscribed/bounced/completed |
| current_step_id | UUID | FK campaign_steps null |
| enrolled_at | timestamptz | |
| unique(campaign_id, contact_id) | | |

**`email_messages`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| enrollment_id | UUID | FK campaign_enrollments null |
| step_id | UUID | FK campaign_steps null |
| contact_id | UUID | FK contacts |
| email_account_id | UUID | FK email_accounts null |
| subject | varchar(255) | |
| body | text | |
| send_state | enum | draft/queued/sent/failed |
| sent_at | timestamptz | null |
| created_at / updated_at | timestamptz | |

**`email_events`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| message_id | UUID | FK email_messages |
| event_type | enum | delivered/bounced/opened/clicked/replied/unsubscribed/complained |
| occurred_at | timestamptz | |
| metadata | JSONB | |

**`suppression_list`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| contact_id | UUID | FK contacts null |
| email | varchar(320) | |
| reason | enum | unsubscribe/bounce/complaint/invalid/do_not_contact |
| created_at | timestamptz | |
| unique(organization_id, email) | | |

**`email_accounts`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| email | varchar(320) | not null |
| provider | varchar(120) | |
| display_name | varchar(160) | |
| connection_state | enum | not_connected/connected/error |
| metadata | JSONB | (no secrets) |
| created_at / updated_at | timestamptz | |

### Module E

**`services`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| name | varchar(160) | not null |
| description | text | |
| pricing_model | enum | one_time/recurring/hourly |
| default_price | Numeric(12,2) | |
| currency | char(3) | default 'USD' |

**`client_services`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| company_id | UUID | FK companies |
| service_id | UUID | FK services |
| price | Numeric(12,2) | (snapshot) |
| currency | char(3) | |
| status | enum | active/paused/ended |
| start_date / end_date | date | null |

**`proposal_items`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| proposal_id | UUID | FK proposals |
| service_id | UUID | FK services null |
| description | text | (snapshot) |
| quantity | int | default 1 |
| unit_price | Numeric(12,2) | (snapshot) |
| amount | Numeric(12,2) | |

**`contracts`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| company_id | UUID | FK companies |
| proposal_id | UUID | FK proposals null |
| title | varchar(255) | |
| status | enum | draft/active/expired/terminated |
| start_date / end_date | date | |
| currency | char(3) | default 'USD' |
| total_amount | Numeric(12,2) | |
| created_at / updated_at | timestamptz | |
| deleted_at | timestamptz | null |

**`contract_items`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| contract_id | UUID | FK contracts |
| description | text | (snapshot) |
| quantity | int | default 1 |
| unit_price | Numeric(12,2) | (snapshot) |
| amount | Numeric(12,2) | |

**`client_requirements`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| company_id | UUID | FK companies |
| icp | text | |
| target_geography | text | |
| target_industry | text | |
| exclusions | text | |
| volume | int | null |
| success_criteria | text | |
| created_at / updated_at | timestamptz | |

### Module F

**`invoices`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| company_id | UUID | FK companies |
| contract_id | UUID | FK contracts null |
| invoice_number | varchar(60) | unique, not null |
| status | enum | draft/sent/paid/overdue/void |
| currency | char(3) | default 'USD' |
| subtotal / tax / total | Numeric(12,2) | |
| issue_date / due_date | date | |
| created_by | UUID | |
| created_at / updated_at | timestamptz | |
| deleted_at | timestamptz | null |

**`invoice_items`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| invoice_id | UUID | FK invoices |
| description | text | (snapshot) |
| quantity | int | default 1 |
| unit_price | Numeric(12,2) | |
| amount | Numeric(12,2) | |

**`payments`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| invoice_id | UUID | FK invoices |
| company_id | UUID | FK companies |
| amount | Numeric(12,2) | not null, > 0 |
| currency | char(3) | default 'USD' |
| method | enum | bank_transfer/card/cheque/cash/other |
| reference | varchar(160) | |
| status | enum | pending/completed/failed/refunded |
| payment_date | date | |
| created_at / updated_at | timestamptz | |

**`expenses`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| category | varchar(120) | |
| amount | Numeric(12,2) | not null, > 0 |
| currency | char(3) | default 'USD' |
| expense_date | date | |
| receipt_reference | varchar(160) | |
| description | text | |
| created_by | UUID | |
| created_at / updated_at | timestamptz | |

**`revenue_records`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| company_id | UUID | FK companies null |
| type | enum | commission/retainer/project/other |
| amount | Numeric(12,2) | not null, > 0 |
| currency | char(3) | default 'USD' |
| record_date | date | |
| description | text | |
| created_at / updated_at | timestamptz | |

### Module G

**`integrations`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| provider | varchar(120) | not null |
| name | varchar(160) | |
| config | JSONB | (no secrets) |
| is_active | boolean | default true |
| created_at / updated_at | timestamptz | |

**`notifications`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations |
| profile_id | UUID | FK profiles |
| type | varchar(80) | |
| message | text | |
| is_read | boolean | default false |
| created_at | timestamptz | |

**`audit_logs`**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK organizations null |
| actor_id | UUID | FK profiles |
| action | varchar(120) | create/update/delete/login/permission_change |
| entity_type | varchar(80) | |
| entity_id | UUID | |
| payload | JSONB | |
| ip_address | varchar(64) | |
| created_at | timestamptz | default now() |

## 3. Cardinality / Key Relationships

- Organization 1—many: members, companies, contacts, lead_sources, lead_statuses, tags,
  pipelines, campaigns, tasks, services, invoices, expenses, revenue, notifications, integrations, audit.
- Role many—many permission (via role_permissions).
- Profile 1—many organization_members; Organization 1—many organization_members.
- Company 1—many contacts, deals, client_services, contracts, invoices.
- Lead source 1—many companies; lead status 1—many companies.
- Company 1—many lead_status_history.
- Pipeline 1—many pipeline_stages; stage 1—many deals.
- Deal 1—many deal_stage_history, activities.
- Campaign 1—many campaign_channels, campaign_steps, campaign_enrollments.
- Campaign step 1—many email_messages; email message 1—many email_events.
- Contact 1—many campaign_enrollments, email_messages, contact_methods.
- Proposal 1—many proposal_items; Contract 1—many contract_items.
- Invoice 1—many invoice_items, payments (single-invoice allocation in v1).
- Audit/notifications reference profiles.

## 4. Index Plan

- Unique/index on: `profiles.email`; `organizations.slug`.
- Index on all FK columns and `organization_id`.
- Index on frequently filtered/searchable columns: `companies.name`, `companies.domain`,
  `contacts.email`, `companies.lead_status_id`, `deals.stage_id`, `tasks.status`,
  `tasks.assignee_id`, `tasks.due_date`.
- Composite index on `notes(noteable_type, noteable_id)`.
- Unique partial indexes for `companies(organization_id, domain)` and
  `contacts(organization_id, email)` where the value is not null.

## 5. Delete / Cascade Policy

- **No `ON DELETE CASCADE`** on organization-level parents by default. Historical data is
  retained; soft delete via `deleted_at` where history matters.
- Junction tables (`role_permissions`, `meeting_attendees`, `lead_tag_assignments`) use
  `ON DELETE CASCADE` to their owning parent only when the parent is the sole owner of the
  relationship.
- `lead_status_history` and `deal_stage_history` use `ON DELETE CASCADE` to their parent
  (company/deal) only if the parent is hard-deleted (rare); otherwise retained.

## 6. Organization-scoping Plan

- Every business table carries `organization_id` directly.
- Child tables (`pipeline_stages`, `campaign_steps`, `invoice_items`, etc.) inherit scope
  through a verified parent; the backend always verifies the chain before acting.
- All queries filter by the requester's `organization_id` derived from membership.

## 7. Design Decisions (vs. the 48-table blueprint)

- `leads` is intentionally NOT a separate table. `companies` carries lead classification
  fields; see `phase-0-discovery.md`.
- Tags/notes use explicit association / documented generic references with integrity checks,
  rather than unsafe generic `entity_type/entity_id`.
- Primary email/phone remain on `contacts`; `contact_methods` stores only additional channels.
- `email_accounts` stores metadata only; secrets are never persisted in this table.
- Payment allocation is single-invoice in v1; payments link to exactly one invoice.
