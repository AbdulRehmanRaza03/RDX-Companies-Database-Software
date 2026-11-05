# Data Dictionary (Summary)

Full column-level dictionary is in `docs/database/README.md`. This is the table-level
summary for the final 48-table schema.

## Module A — Organization, users and permissions (7)
| Table | Purpose |
|---|---|
| organizations | Agency details |
| profiles | User auth identity |
| organization_members | User membership + status |
| roles | Named roles |
| permissions | Permission codes |
| role_permissions | M2M role ↔ permission |
| invitations | Pending team invites |

## Module B — Companies, contacts, leads (8)
| Table | Purpose |
|---|---|
| companies | Prospect/client accounts + lead classification |
| contacts | Decision-makers |
| lead_sources | Source catalogue |
| lead_statuses | Status catalogue |
| lead_status_history | Status transitions |
| lead_tags | Labels |
| lead_tag_assignments | Tag → company/contact |
| contact_methods | Additional channels |

## Module C — Pipeline, sales, work (10)
| Table | Purpose |
|---|---|
| pipelines | Sales pipeline |
| pipeline_stages | Ordered stages |
| deals | Opportunities |
| deal_stage_history | Stage transitions |
| activities | Calls/emails/research |
| tasks | Assigned work |
| notes | Internal notes (generic) |
| meetings | Schedule + outcome |
| meeting_attendees | Attendee association |
| proposals | Proposal header |

## Module D — Outreach & campaigns (9)
| Table | Purpose |
|---|---|
| campaigns | Campaign definitions |
| campaign_channels | Channel config |
| email_templates | Reusable content |
| campaign_steps | Ordered steps |
| campaign_enrollments | Contact enrolment |
| email_messages | Message metadata |
| email_events | Delivery events |
| suppression_list | Excluded contacts |
| email_accounts | Sender metadata |

## Module E — Client services (6)
| Table | Purpose |
|---|---|
| services | Service catalogue |
| client_services | Client-service assignment |
| proposal_items | Proposal line items |
| contracts | Contract lifecycle |
| contract_items | Contract deliverables |
| client_requirements | ICP/geography/exclusions |

## Module F — Finance (5)
| Table | Purpose |
|---|---|
| invoices | Invoice headers |
| invoice_items | Invoice line items |
| payments | Payments (single-invoice) |
| expenses | Operational expenses |
| revenue_records | Revenue/commission |

## Module G — System operations (3)
| Table | Purpose |
|---|---|
| integrations | Provider metadata |
| notifications | In-app notifications |
| audit_logs | Audit trail |

**Total: 48 tables.**
