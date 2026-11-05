"""Health check router."""
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict[str, str]:
    """Basic liveness check."""
    return {"status": "ok"}
