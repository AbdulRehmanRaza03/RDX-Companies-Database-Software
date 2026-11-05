"""Integration tests for the health and auth endpoints."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_me_requires_auth():
    r = client.get("/api/v1/auth/me")
    assert r.status_code == 401


def test_register_and_login():
    import uuid

    email = f"tester-{uuid.uuid4().hex[:8]}@example.com"
    r = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "password123"},
    )
    assert r.status_code == 201

    bad = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "wrong"},
    )
    assert bad.status_code == 401

    good = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"},
    )
    assert good.status_code == 200
    token = good.json()["access_token"]

    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == email
