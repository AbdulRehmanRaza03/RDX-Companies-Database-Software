# Competitor Analysis — RDX LeadFlow

Research conducted against the two dominant B2B/CRM platforms to position
RDX LeadFlow competitively. Primary sources: hubspot.com, apollo.io (2026).

## 1. Apollo.io (AI GTM System)
Positioning: "Data → Intelligence → Execution" loop.

**Data layer**
- 240M+ contacts, 30M+ companies (proprietary B2B database)
- Waterfall enrichment (cascade across providers for completeness)
- Website visitor identification
- Email finder + verified phone numbers
- Data refresh over time

**Intelligence layer**
- Lead Scoring
- GTM Harness (train AI on your ICP/product/playbooks)
- AI Context Center (first-party data, buying signals, intent, job changes)
- Apollo Profile (unified contact/account view)

**Execution layer**
- Workspace (prospecting, outreach, dialing)
- Apollo Anywhere (CRM, ChatGPT, Claude, Gmail, browser)
- Parallel Dialer, AI Call Assistant
- Email deliverability + domain warming + inbox rotation
- Meetings scheduler
- AI Assistant (research, write outreach, follow up, book meetings)

## 2. HubSpot (CRM Platform)
- Free CRM: contact management, deals, pipelines, tasks/activities
- Reporting dashboard, pipeline management
- Email tracking, email templates, scheduling
- Lead generation (forms, landing pages, ad management)
- Meeting scheduler, live chat
- Breeze AI assistant, AI content writer, chatbot builder
- 2000+ integrations, data sync, user permissions
- Payment links, mobile app

## 3. Gaps RDX LeadFlow can exploit (unfair advantages)

| # | Opportunity | Competitor weakness | RDX LeadFlow response |
|---|---|---|---|
| 1 | **Real-time internal ops** | HubSpot/Apollo heavy on external data, light on agency-internal delivery ops | RDX covers delivery: services, contracts, requirements, revenue in one place |
| 2 | **Agency-specific workflow** | Generic CRM, not agency/outreach-firm specific | Prospect→client→delivery→invoice→revenue closed loop |
| 3 | **Suppression/compliance built-in** | Compliance is an afterthought add-on | Suppression list + consent + DNC enforced before every outreach |
| 4 | **Snapshot financial integrity** | Manual finance churn | Proposal/contract/invoice line-item snapshots (decimal-safe) |
| 5 | **Cost/simplicity** | Apollo & HubSpot pricing scales per seat, growing cost | Self-hosted local, no per-seat fee |
| 6 | **Full audit trail** | Audit across tiers/permissions varies | Audit log for auth/finance/permission changes by default |
| 7 | **Single source of truth for delivery** | CRMs stop at "closed-won" | RDX continues to requirements→delivery→renewal→revenue |

## 4. Roadmap (beyond MVP) — 100-feature ambition
Grouped into the Apollo-style 3-layer model + RDX's delivery/finance advantage:

**A. Data & Intelligence**
- [ ] Lead scoring (manual rules, then ML-ready)
- [ ] Duplicate detection (domain/email) — DONE
- [ ] Enrichment staging (ICP, geography, industry, exclusions)
- [ ] Advanced search/filter/sort/pagination — DONE (partial)
- [ ] Export (CSV)

**B. Execution / CRM**
- [ ] Kanban pipeline — DONE
- [ ] Stage history — DONE
- [ ] Tasks/activities/notes/meetings — DONE
- [ ] Campaigns + suppression — DONE
- [ ] Email templates — DONE (backend)
- [ ] Notifications (in-app)

**C. Delivery & Finance (RDX differentiator)**
- [ ] Services catalogue — DONE
- [ ] Client requirements — DONE
- [ ] Proposals/contracts — DONE
- [ ] Invoices/payments/expenses/revenue — DONE
- [ ] Client renewal tracking

**D. Analytics & Admin**
- [ ] Dashboard KPI + charts — DONE
- [ ] Reports — DONE
- [ ] Team workload — DONE
- [ ] Audit logs — DONE
- [ ] Roles/permissions — DONE
- [ ] Integrations registry — DONE

## 5. Immediate focus
The UI is already world-class (dark/light, responsive, charts, kanban, toasts).
Next highest-impact work: deepen the frontend feature-completeness (enrollment UI,
notifications, lead scoring, CSV export) while keeping the premium design bar.
