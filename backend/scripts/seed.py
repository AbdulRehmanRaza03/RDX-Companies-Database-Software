"""Seed script: create demo organization, owner user, roles, permissions, lead
sources/statuses and a default pipeline.

Run:  python -m scripts.seed   (from backend/ directory)
"""
import uuid

from sqlalchemy import select

from app.core.permissions import PERMISSION_CODES, ROLE_DEFAULTS
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import (
    LeadSource,
    LeadStatus,
    Organization,
    OrganizationMember,
    Permission,
    Pipeline,
    PipelineStage,
    Profile,
    Role,
)


def seed() -> None:
    # Ensure tables exist (dev convenience; production uses Alembic migrations).
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Permissions
        perms: dict[str, Permission] = {}
        for code in PERMISSION_CODES:
            p = db.scalar(select(Permission).where(Permission.code == code))
            if p is None:
                p = Permission(code=code, description=code)
                db.add(p)
                db.flush()
            perms[code] = p

        # Roles
        roles: dict[str, Role] = {}
        for key, rd in ROLE_DEFAULTS.items():
            role = db.scalar(select(Role).where(Role.name == rd.name))
            if role is None:
                role = Role(name=rd.name, description=rd.description)
                db.add(role)
                db.flush()
            role.permissions = [perms[c] for c in rd.permissions if c in perms]
            roles[key] = role

        # Organization
        org = db.scalar(select(Organization).where(Organization.slug == "rdx"))
        if org is None:
            org = Organization(name="RDX Revenue Agency", slug="rdx")
            db.add(org)
            db.flush()

        # Owner user
        email = "owner@rdx.com"
        owner = db.scalar(select(Profile).where(Profile.email == email))
        if owner is None:
            owner = Profile(
                email=email,
                password_hash=hash_password("password123"),
                first_name="Owner",
                last_name="RDX",
                is_superuser=True,
            )
            db.add(owner)
            db.flush()

        # Membership
        existing_member = db.scalar(
            select(OrganizationMember).where(
                OrganizationMember.organization_id == org.id,
                OrganizationMember.profile_id == owner.id,
            )
        )
        if existing_member is None:
            db.add(
                OrganizationMember(
                    organization_id=org.id,
                    profile_id=owner.id,
                    role_id=roles["owner"].id,
                )
            )

        # Lead sources
        for name in ["LinkedIn", "Website", "Referral", "Directory", "Event", "Manual"]:
            src = db.scalar(
                select(LeadSource).where(
                    LeadSource.organization_id == org.id, LeadSource.name == name
                )
            )
            if src is None:
                db.add(LeadSource(organization_id=org.id, name=name))

        # Lead statuses
        status_defs = [
            ("New", "new", 0),
            ("Qualified", "qualified", 1),
            ("Contacted", "contacted", 2),
            ("Meeting", "meeting", 3),
            ("Won", "won", 4),
            ("Lost", "lost", 5),
        ]
        for name, category, order in status_defs:
            st = db.scalar(
                select(LeadStatus).where(
                    LeadStatus.organization_id == org.id, LeadStatus.name == name
                )
            )
            if st is None:
                db.add(
                    LeadStatus(
                        organization_id=org.id,
                        name=name,
                        category=category,
                        sort_order=order,
                    )
                )

        # Default pipeline
        pipeline = db.scalar(
            select(Pipeline).where(
                Pipeline.organization_id == org.id, Pipeline.is_default.is_(True)
            )
        )
        if pipeline is None:
            pipeline = Pipeline(organization_id=org.id, name="Default Pipeline", is_default=True)
            db.add(pipeline)
            db.flush()
            stages = [
                ("Prospecting", 0, 10),
                ("Qualification", 1, 25),
                ("Proposal", 2, 50),
                ("Negotiation", 3, 75),
                ("Closed Won", 4, 100),
                ("Closed Lost", 5, 0),
            ]
            for name, order, prob in stages:
                db.add(
                    PipelineStage(
                        pipeline_id=pipeline.id, name=name, sort_order=order, probability=prob
                    )
                )

        db.commit()
        print("Seed complete.")
        print(f"  Organization: {org.name} (id={org.id})")
        print(f"  Owner login:  owner@rdx.com / password123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
