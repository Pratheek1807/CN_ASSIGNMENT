const BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * POST /api/v1/optimize/?agent_lat=&agent_lon=&n_trials=
 * Returns the optimized visit plan from the OR-Tools TSP service.
 */
export async function fetchOptimizedRoute(lat, lon, nTrials = 10) {
  const url = `${BASE}/api/v1/optimize/?agent_lat=${lat}&agent_lon=${lon}&n_trials=${nTrials}`;
  const resp = await fetch(url, { method: 'POST' });
  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`Optimize API error (${resp.status}): ${errorText}`);
  }
  return resp.json();
}

/**
 * PATCH /api/v1/visits/{visitId}
 * Partially updates a visit record (e.g. remarks, status).
 */
export async function updateVisit(visitId, payload) {
  const url = `${BASE}/api/v1/visits/${visitId}`;
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`Update API error (${resp.status}): ${errorText}`);
  }
  return resp.json();
}

/**
 * Maps a snake_case visit object from the backend to
 * the camelCase shape the React components expect.
 */
export function mapVisit(v) {
  return {
    borrowerId: v.borrower_id,
    borrowerName: v.borrower_name,
    city: v.city,
    latitude: v.latitude,
    longitude: v.longitude,
    outstandingLoanAmount: v.outstanding_loan_amount,
    daysPastDue: v.days_past_due,
    distanceKm: v.distance_km,
    travelCostInr: v.travel_cost_inr,
    priorityScore: v.priority_score,
    visitRank: v.visit_rank,
    remarked: !!v.remark,       // true if a remark already exists in DB
    remark: v.remark || '',     // show existing remark from DB
  };
}
