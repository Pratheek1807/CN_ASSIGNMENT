from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class FieldVisitBase(BaseModel):
    borrower_name: str
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    outstanding_loan_amount: Optional[float] = 0.0
    days_past_due: Optional[int] = 0
    distance_km: Optional[float] = None
    travel_cost_inr: Optional[float] = None
    priority_score: Optional[float] = None
    visit_rank: Optional[int] = None


class FieldVisitCreate(FieldVisitBase):
    pass


class FieldVisitUpdate(BaseModel):
    borrower_name: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    outstanding_loan_amount: Optional[float] = None
    days_past_due: Optional[int] = None
    distance_km: Optional[float] = None
    travel_cost_inr: Optional[float] = None
    priority_score: Optional[float] = None
    remark: Optional[str] = None
    visit_rank: Optional[int] = None

class FieldVisitResponse(FieldVisitBase):
    borrower_id: str
    remark: Optional[str] = None

    class Config:
        from_attributes = True





























#Schema is like a Blueprint or a Contract. It defines exactly what a piece of data should look like when it travels between the frontend and the backend.