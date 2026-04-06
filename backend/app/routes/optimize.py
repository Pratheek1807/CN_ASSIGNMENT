from fastapi import APIRouter, Query
from app.services import optimize_service

router = APIRouter(prefix="/api/v1/optimize", tags=["Route Optimization"])


@router.post("/")
def optimize_route(
    agent_lat: float = Query(..., description="Agent's current latitude"),
    agent_lon: float = Query(..., description="Agent's current longitude"),
    n_trials: int = Query(50, ge=10, le=200, description="Weight search trials (more = better but slower)"),
):
    """
    Compute the optimal visit order for all borrowers in the database.

    - Fetches all records from `field_visits`
    - Runs OR-Tools TSP with priority-weighted costs
    - Auto-tunes weights over `n_trials` random trials
    - Returns ranked visit list with distance and travel cost per leg
    """
    return optimize_service.optimize(agent_lat, agent_lon, n_trials)
