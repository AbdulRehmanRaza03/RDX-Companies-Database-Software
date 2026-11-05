"""Role-based access control: permission codes and role defaults.

Permission codes follow the pattern ``<domain>:<action>``. The initial role set maps
each named role to a set of permission codes. These are applied as seed data in a
later phase; this module is the source of truth for the codes.
"""
from dataclasses import dataclass, field

# Permission domains mirror the modules in the master documentation.
PERMISSION_CODES: list[str] = [
    # Auth & profile
    "auth:change_password",
    "profile:read",
    "profile:update",
    # Organization & team
    "organization:read",
    "organization:update",
    "member:manage",
    "role:manage",
    "permission:manage",
    "invitation:manage",
    # Companies & contacts & leads
    "company:read",
    "company:create",
    "company:update",
    "company:delete",
    "lead:manage",
    # Pipeline & deals
    "deal:read",
    "deal:create",
    "deal:update",
    "deal:delete",
    # Work management
    "activity:manage",
    "task:manage",
    "note:manage",
    "meeting:manage",
    # Campaigns & outreach
    "campaign:manage",
    "template:manage",
    "enrollment:manage",
    "suppression:manage",
    # Client & delivery
    "service:manage",
    "proposal:manage",
    "contract:manage",
    "requirement:manage",
    # Finance
    "invoice:manage",
    "payment:manage",
    "expense:manage",
    "revenue:manage",
    # Reporting & admin
    "report:read",
    "dashboard:read",
    "notification:manage",
    "integration:manage",
    "audit_log:read",
]


@dataclass
class RoleDefault:
    name: str
    description: str
    permissions: set[str] = field(default_factory=set)


# Coarse role → permission mapping. A * wildcard means all permissions.
ROLE_DEFAULTS: dict[str, RoleDefault] = {
    "owner": RoleDefault(
        "Owner",
        "Full access to the organization.",
        set(PERMISSION_CODES),
    ),
    "admin": RoleDefault(
        "Admin",
        "Manage most records, users, configuration and reports.",
        set(PERMISSION_CODES) - {"permission:manage", "audit_log:read"},
    ),
    "manager": RoleDefault(
        "Manager",
        "Manage assigned teams, leads, campaigns, deals, tasks and reports.",
        {
            "dashboard:read",
            "report:read",
            "company:read",
            "company:create",
            "company:update",
            "lead:manage",
            "deal:read",
            "deal:create",
            "deal:update",
            "activity:manage",
            "task:manage",
            "note:manage",
            "meeting:manage",
            "campaign:manage",
            "template:manage",
            "enrollment:manage",
            "suppression:manage",
            "service:manage",
            "proposal:manage",
            "contract:manage",
            "requirement:manage",
        },
    ),
    "lead_researcher": RoleDefault(
        "Lead Researcher",
        "Create/update assigned company and contact research records.",
        {
            "company:read",
            "company:create",
            "company:update",
            "lead:manage",
            "profile:read",
            "activity:manage",
            "note:manage",
        },
    ),
    "sdr": RoleDefault(
        "SDR",
        "Manage assigned leads, activities, outreach and meetings.",
        {
            "dashboard:read",
            "company:read",
            "company:update",
            "lead:manage",
            "deal:read",
            "activity:manage",
            "task:manage",
            "note:manage",
            "meeting:manage",
            "campaign:manage",
            "template:manage",
            "enrollment:manage",
            "profile:read",
        },
    ),
    "account_manager": RoleDefault(
        "Account Manager",
        "Manage clients, requirements, services, delivery and renewals.",
        {
            "dashboard:read",
            "company:read",
            "company:update",
            "service:manage",
            "proposal:manage",
            "contract:manage",
            "requirement:manage",
            "note:manage",
            "task:manage",
            "profile:read",
        },
    ),
    "finance": RoleDefault(
        "Finance",
        "Manage invoices, payments, expenses and revenue reports.",
        {
            "dashboard:read",
            "report:read",
            "invoice:manage",
            "payment:manage",
            "expense:manage",
            "revenue:manage",
            "company:read",
            "profile:read",
        },
    ),
    "viewer": RoleDefault(
        "Viewer",
        "Read-only access to permitted modules.",
        {
            "dashboard:read",
            "report:read",
            "company:read",
            "deal:read",
            "profile:read",
        },
    ),
}
