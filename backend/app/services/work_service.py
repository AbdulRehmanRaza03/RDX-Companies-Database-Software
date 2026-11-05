"""Generic CRUD services for tasks, notes, activities, meetings and pipelines."""
import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Activity, Meeting, Note, Pipeline, PipelineStage, Task


# --- Tasks ---
def list_tasks(
    db: Session,
    organization_id: uuid.UUID,
    *,
    assignee_id: uuid.UUID | None = None,
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 50,
):
    query = select(Task).where(Task.organization_id == organization_id)
    if assignee_id:
        query = query.where(Task.assignee_id == assignee_id)
    if status_filter:
        query = query.where(Task.status == status_filter)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.order_by(Task.due_date.asc().nullslast()).offset(skip).limit(limit)).all()
    return list(rows), total


def create_task(db: Session, organization_id: uuid.UUID, data, created_by) -> Task:
    task = Task(organization_id=organization_id, created_by=created_by, **data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, organization_id: uuid.UUID, task_id: uuid.UUID, data) -> Task:
    task = db.get(Task, task_id)
    if task is None or task.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Task not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(task, k, v)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, organization_id: uuid.UUID, task_id: uuid.UUID) -> None:
    task = db.get(Task, task_id)
    if task is None or task.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()


# --- Notes ---
def list_notes(db: Session, organization_id: uuid.UUID, noteable_type: str, noteable_id: uuid.UUID):
    rows = db.scalars(
        select(Note)
        .where(
            Note.organization_id == organization_id,
            Note.noteable_type == noteable_type,
            Note.noteable_id == noteable_id,
        )
        .order_by(Note.created_at.desc())
    ).all()
    return list(rows)


def create_note(db: Session, organization_id: uuid.UUID, data, author_id) -> Note:
    valid = {"company", "contact", "deal"}
    if data.noteable_type.lower() not in valid:
        raise HTTPException(status_code=422, detail="Invalid noteable_type")
    note = Note(
        organization_id=organization_id,
        noteable_type=data.noteable_type.lower(),
        noteable_id=data.noteable_id,
        content=data.content,
        author_id=author_id,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


# --- Activities ---
def list_activities(
    db: Session,
    organization_id: uuid.UUID,
    *,
    company_id: uuid.UUID | None = None,
    deal_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = 50,
):
    query = select(Activity).where(Activity.organization_id == organization_id)
    if company_id:
        query = query.where(Activity.company_id == company_id)
    if deal_id:
        query = query.where(Activity.deal_id == deal_id)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.order_by(Activity.created_at.desc()).offset(skip).limit(limit)).all()
    return list(rows), total


def create_activity(db: Session, organization_id: uuid.UUID, data, owner_id) -> Activity:
    act = Activity(organization_id=organization_id, owner_id=owner_id, **data.model_dump())
    db.add(act)
    db.commit()
    db.refresh(act)
    return act


# --- Meetings ---
def list_meetings(db: Session, organization_id: uuid.UUID, *, skip: int = 0, limit: int = 50):
    query = select(Meeting).where(Meeting.organization_id == organization_id)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.order_by(Meeting.scheduled_at.desc().nullslast()).offset(skip).limit(limit)).all()
    return list(rows), total


def create_meeting(db: Session, organization_id: uuid.UUID, data, organizer_id) -> Meeting:
    m = Meeting(organization_id=organization_id, organizer_id=organizer_id, **data.model_dump())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


# --- Pipelines ---
def list_pipelines(db: Session, organization_id: uuid.UUID):
    return list(
        db.scalars(select(Pipeline).where(Pipeline.organization_id == organization_id)).all()
    )


def create_pipeline(db: Session, organization_id: uuid.UUID, data) -> Pipeline:
    pipeline = Pipeline(organization_id=organization_id, name=data.name, is_default=data.is_default)
    db.add(pipeline)
    db.flush()
    for i, s in enumerate(data.stages):
        db.add(
            PipelineStage(
                pipeline_id=pipeline.id,
                name=s.get("name", f"Stage {i+1}"),
                sort_order=s.get("sort_order", i),
                probability=s.get("probability", 0),
            )
        )
    db.commit()
    db.refresh(pipeline)
    return pipeline
