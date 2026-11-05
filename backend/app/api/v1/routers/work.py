"""Tasks, notes, activities, meetings and pipelines routers."""
import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_profile
from app.db.session import get_db
from app.models import Profile
from app.schemas.sales import (
    ActivityCreate,
    ActivityOut,
    MeetingCreate,
    MeetingOut,
    NoteCreate,
    NoteOut,
    PipelineCreate,
    PipelineOut,
    PipelineUpdate,
    TaskCreate,
    TaskOut,
    TaskUpdate,
)
from app.services import work_service

router = APIRouter(tags=["work"])


# --- Tasks ---
@router.get("/tasks", response_model=dict)
def list_tasks(
    organization_id: uuid.UUID = Query(...),
    assignee_id: uuid.UUID | None = None,
    status_filter: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    rows, total = work_service.list_tasks(db, organization_id, assignee_id=assignee_id, status_filter=status_filter, skip=skip, limit=limit)
    return {"items": [TaskOut.model_validate(r).model_dump() for r in rows], "total": total}


@router.post("/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    data: TaskCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return work_service.create_task(db, organization_id, data, profile.id)


@router.patch("/tasks/{task_id}", response_model=TaskOut)
def update_task(
    task_id: uuid.UUID,
    data: TaskUpdate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return work_service.update_task(db, organization_id, task_id, data)


# --- Notes ---
@router.get("/notes", response_model=list[NoteOut])
def list_notes(
    organization_id: uuid.UUID = Query(...),
    noteable_type: str = Query(...),
    noteable_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return work_service.list_notes(db, organization_id, noteable_type, noteable_id)


@router.post("/notes", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(
    data: NoteCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return work_service.create_note(db, organization_id, data, profile.id)


# --- Activities ---
@router.get("/activities", response_model=dict)
def list_activities(
    organization_id: uuid.UUID = Query(...),
    company_id: uuid.UUID | None = None,
    deal_id: uuid.UUID | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    rows, total = work_service.list_activities(db, organization_id, company_id=company_id, deal_id=deal_id, skip=skip, limit=limit)
    return {"items": [ActivityOut.model_validate(r).model_dump() for r in rows], "total": total}


@router.post("/activities", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
def create_activity(
    data: ActivityCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return work_service.create_activity(db, organization_id, data, profile.id)


# --- Meetings ---
@router.get("/meetings", response_model=dict)
def list_meetings(
    organization_id: uuid.UUID = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    rows, total = work_service.list_meetings(db, organization_id, skip=skip, limit=limit)
    return {"items": [MeetingOut.model_validate(r).model_dump() for r in rows], "total": total}


@router.post("/meetings", response_model=MeetingOut, status_code=status.HTTP_201_CREATED)
def create_meeting(
    data: MeetingCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return work_service.create_meeting(db, organization_id, data, profile.id)


# --- Pipelines ---
@router.get("/pipelines", response_model=list[PipelineOut])
def list_pipelines(
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return work_service.list_pipelines(db, organization_id)


@router.post("/pipelines", response_model=PipelineOut, status_code=status.HTTP_201_CREATED)
def create_pipeline(
    data: PipelineCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return work_service.create_pipeline(db, organization_id, data)
