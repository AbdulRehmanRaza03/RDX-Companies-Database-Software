"""Integration test for dashboard aggregate endpoints."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _login_owner():
    r = client.post(
        "/api/v1/auth/login",
        json={"email": "owner@rdx.com", "password": "password123"},
    )
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _get_org():
    from app.db.session import SessionLocal
    from app.models import Organization

    db = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.slug == "rdx").first()
        return str(org.id)
    finally:
        db.close()


def test_dashboard_summary_returns_numbers():
    headers = _login_owner()
    org = _get_org()
    r = client.get(f"/api/v1/dashboard/summary?organization_id={org}", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data["companies"], int)
    assert isinstance(data["contacts"], int)
    assert "pipeline_value" in data


def test_reports_endpoints_return_lists():
    headers = _login_owner()
    org = _get_org()
    for endpoint in [
        "leads-by-status",
        "leads-by-source",
        "deals-by-stage",
        "revenue-over-time",
    ]:
        r = client.get(f"/api/v1/reports/{endpoint}?organization_id={org}", headers=headers)
        assert r.status_code == 200
        assert "items" in r.json()
