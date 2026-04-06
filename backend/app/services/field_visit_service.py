from app.db.supabase_client import supabase
from app.schemas.visit_schema import FieldVisitCreate, FieldVisitUpdate
from fastapi import HTTPException

TABLE = "field_visits"


def get_all():
    response = supabase.table(TABLE).select("*").order("visit_rank").execute()
    return response.data


def get_by_id(visit_id: str):
    response = supabase.table(TABLE).select("*").eq("borrower_id", visit_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Visit not found")
    return response.data



def update(visit_id: str, visit: FieldVisitUpdate):
    # Use exclude_unset=True so only fields the client explicitly sent are included.
    # This prevents PATCH from overwriting fields the client didn't mention.
    payload = visit.model_dump(exclude_unset=True)

    print(f"[UPDATE] visit_id={visit_id}  payload={payload}")  # debug log

    if not payload:
        response = supabase.table(TABLE).select("*").eq("borrower_id", visit_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Visit not found")
        return response.data

    response = supabase.table(TABLE).update(payload).eq("borrower_id", visit_id).execute()
    print(f"[UPDATE] Supabase response: {response.data}")  # debug log
    if not response.data:
        raise HTTPException(status_code=404, detail="Visit not found or update failed")
    return response.data[0]



