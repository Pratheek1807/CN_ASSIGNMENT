from fastapi import APIRouter
from app.schemas.visit_schema import FieldVisitUpdate, FieldVisitResponse
from app.services import field_visit_service
from typing import List

router = APIRouter(prefix="/api/v1/visits", tags=["Field Visits"])


@router.get("/", response_model=List[FieldVisitResponse])
def list_visits():
    """List all field visits, ordered by visit_rank."""
    return field_visit_service.get_all()


@router.get("/{visit_id}", response_model=FieldVisitResponse)
def get_visit(visit_id: str):
    """Get a single visit by ID."""
    return field_visit_service.get_by_id(visit_id)


@router.patch("/{visit_id}", response_model=FieldVisitResponse)
def update_visit(visit_id: str, visit: FieldVisitUpdate):
    """Partially update a visit record."""
    return field_visit_service.update(visit_id, visit)


