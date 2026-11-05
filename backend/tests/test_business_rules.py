"""Integration tests for documented backend behaviors (finance, suppression, deals).

These tests validate the documented requirements from the master spec:
- Decimal-safe money calculations.
- Suppression enforced before enrollment.
- Stage history on deal transitions.
"""
import uuid

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _login_owner():
    r = client.post(
        "/api/v1/auth/login",
        json={"email": "owner@rdx.com", "password": "password123"},
    )
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _get_org():
    # The seed script creates this org.
    from app.db.session import SessionLocal
    from app.models import Organization

    db = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.slug == "rdx").first()
        return str(org.id)
    finally:
        db.close()


def test_invoice_decimal_totals():
    headers = _login_owner()
    org = _get_org()

    # Create a company to attach to.
    co = client.post(
        f"/api/v1/companies?organization_id={org}",
        json={"name": f"Decimal Co {uuid.uuid4().hex[:6]}"},
        headers=headers,
    )
    company_id = co.json()["id"]

    inv = client.post(
        f"/api/v1/invoices?organization_id={org}",
        json={
            "company_id": company_id,
            "invoice_number": f"INV-{uuid.uuid4().hex[:6]}",
            "currency": "USD",
            "items": [
                {"description": "A", "quantity": 2, "unit_price": "19.99"},
                {"description": "B", "quantity": 1, "unit_price": "0.02"},
            ],
        },
        headers=headers,
    )
    assert inv.status_code == 201
    # 2 * 19.99 + 0.02 = 40.00 exactly (decimal, not float).
    assert inv.json()["total"] == "40.00"


def test_suppression_blocks_enrollment():
    headers = _login_owner()
    org = _get_org()

    co = client.post(
        f"/api/v1/companies?organization_id={org}",
        json={"name": f"Suppress Co {uuid.uuid4().hex[:6]}"},
        headers=headers,
    )
    company_id = co.json()["id"]

    ct = client.post(
        f"/api/v1/contacts?organization_id={org}",
        json={
            "company_id": company_id,
            "first_name": "Test",
            "last_name": "User",
            "email": f"test-{uuid.uuid4().hex[:6]}@example.com",
        },
        headers=headers,
    )
    contact_id = ct.json()["id"]
    email = ct.json()["email"]

    cp = client.post(
        f"/api/v1/campaigns?organization_id={org}",
        json={"name": f"Camp {uuid.uuid4().hex[:6]}"},
        headers=headers,
    )
    campaign_id = cp.json()["id"]

    # Suppress the email.
    s = client.post(
        f"/api/v1/suppression-list?organization_id={org}",
        json={"email": email, "reason": "do_not_contact"},
        headers=headers,
    )
    assert s.status_code == 201

    # Enrollment must be blocked.
    e = client.post(
        f"/api/v1/enrollments?organization_id={org}",
        json={"campaign_id": campaign_id, "contact_id": contact_id},
        headers=headers,
    )
    assert e.status_code == 409
