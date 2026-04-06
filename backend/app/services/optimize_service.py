"""
Route Optimization Service
Ports the Colab OR-Tools TSP logic into a FastAPI-compatible service.

Algorithm:
  1. Fetch all borrowers from Supabase field_visits table
  2. Build distance matrix using geodesic (Haversine) distances
  3. Compute priority score = W_LOAN*loan + W_DPD*dpd - W_DIST*dist_from_agent
  4. Run OR-Tools TSP with priority-adjusted edge costs
  5. Auto-tune weights over N_TRIALS random trials
  6. Return the ordered visit plan with ranks, distances, travel cost
"""

import random
from geopy.distance import geodesic
from ortools.constraint_solver import pywrapcp, routing_enums_pb2
from app.db.supabase_client import supabase

# Cost per km in INR (approx. auto/bike rate)
COST_PER_KM_INR = 6

TABLE = "field_visits"


def _normalize(values: list[float]) -> list[float]:
    mn, mx = min(values), max(values)
    if mx == mn:
        return [0.0] * len(values)
    return [(v - mn) / (mx - mn) for v in values]


def _build_distance_matrix(coords: list[tuple]) -> list[list[int]]:
    """Pre-compute pairwise geodesic distances in metres (int for OR-Tools)."""
    n = len(coords)
    matrix = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                matrix[i][j] = int(geodesic(coords[i], coords[j]).km * 1000)
    return matrix


def _run_tsp(
    n: int,
    distance_matrix: list[list[int]],
    priority_scores: list[float],
    time_limit_secs: int = 3,
) -> list[int] | None:
    """Run OR-Tools TSP. Returns ordered list of node indices (depot=0 excluded)."""
    manager = pywrapcp.RoutingIndexManager(n, 1, 0)
    routing = pywrapcp.RoutingModel(manager)

    def cost_callback(from_index, to_index):
        fn = manager.IndexToNode(from_index)
        tn = manager.IndexToNode(to_index)
        dist = distance_matrix[fn][tn]
        priority_bonus = int(priority_scores[tn] * 10_000)
        return max(1, dist - priority_bonus)

    transit = routing.RegisterTransitCallback(cost_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit)

    params = pywrapcp.DefaultRoutingSearchParameters()
    params.time_limit.seconds = time_limit_secs
    params.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )

    solution = routing.SolveWithParameters(params)
    if not solution:
        return None

    route = []
    index = routing.Start(0)
    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        route.append(node)
        index = solution.Value(routing.NextVar(index))
    return route  # first element is depot (index 0)


def _evaluate_weights(
    w_loan: float,
    w_dpd: float,
    w_dist: float,
    loans_norm: list[float],
    dpds_norm: list[float],
    dists_norm: list[float],
    distance_matrix: list[list[int]],
    n: int,
) -> tuple[float, list[float], list[int] | None]:
    total = w_loan + w_dpd + w_dist or 1
    wl, wd, wdi = w_loan / total, w_dpd / total, w_dist / total

    scores = [
        wl * loans_norm[i] + wd * dpds_norm[i] - wdi * dists_norm[i]
        for i in range(n)
    ]

    route = _run_tsp(n, distance_matrix, scores)

    if route is None:
        return float("inf"), scores, None

    total_dist = sum(
        distance_matrix[route[i]][route[i + 1]] / 1000
        for i in range(len(route) - 1)
    )
    return total_dist, scores, route


def optimize(agent_lat: float, agent_lon: float, n_trials: int = 50) -> dict:
    """
    Main entry point called by the API route.
    Returns optimized visit plan ordered by visit_rank.
    """
    # ── 1. Fetch borrowers from Supabase ────────────────────────
    resp = supabase.table(TABLE).select("*").execute()
    borrowers = resp.data
    if borrowers and len(borrowers) > 15:
        borrowers = random.sample(borrowers, 15)
    if not borrowers:
        return {"visits": [], "total_distance_km": 0, "best_weights": {}}

    n_borrowers = len(borrowers)
    n = n_borrowers + 1  # +1 for depot

    # ── 2. Build coordinate list (depot first) ───────────────────
    coords = [(agent_lat, agent_lon)] + [
        (b["latitude"], b["longitude"]) for b in borrowers
    ]

    # ── 3. Distance matrix ───────────────────────────────────────
    dist_matrix = _build_distance_matrix(coords)

    # ── 4. Normalise features ────────────────────────────────────
    loans = [0.0] + [float(b.get("outstanding_loan_amount", 0) or 0) for b in borrowers]
    dpds  = [0.0] + [float(b.get("days_past_due", 0) or 0) for b in borrowers]
    dist_from_depot = [dist_matrix[0][i] / 1000 for i in range(n)]

    loans_n = _normalize(loans)
    dpds_n  = _normalize(dpds)
    dists_n = _normalize(dist_from_depot)

    # ── 5. Auto-tune weights ─────────────────────────────────────
    best_dist = float("inf")
    best_weights = (0.4, 0.4, 0.2)
    best_scores = None
    best_route = None

    for _ in range(n_trials):
        wl = random.random()
        wd = random.random()
        wdi = random.random()
        dist, scores, route = _evaluate_weights(
            wl, wd, wdi, loans_n, dpds_n, dists_n, dist_matrix, n
        )
        if dist < best_dist:
            best_dist = dist
            best_weights = (wl, wd, wdi)
            best_scores = scores
            best_route = route

    if best_route is None:
        return {"visits": [], "total_distance_km": 0, "best_weights": {}}

    # ── 6. Build ordered result (skip depot node 0) ──────────────
    visits = []
    rank = 1
    for i, node in enumerate(best_route):
        if node == 0:
            continue  # skip depot
        b = borrowers[node - 1]  # offset by 1 because depot is index 0
        prev_node = best_route[i - 1] if i > 0 else 0
        leg_dist_km = round(dist_matrix[prev_node][node] / 1000, 3)

        visits.append({
            **b,
            "visit_rank": rank,
            "distance_km": leg_dist_km,
            "travel_cost_inr": round(leg_dist_km * COST_PER_KM_INR, 2),
            "priority_score": round(best_scores[node], 6),
        })
        rank += 1

    total_w = sum(best_weights)
    return {
        "agent_start": {"latitude": agent_lat, "longitude": agent_lon},
        "total_distance_km": round(best_dist, 3),
        "total_travel_cost_inr": round(best_dist * COST_PER_KM_INR, 2),
        "best_weights": {
            "loan_weight": round(best_weights[0] / total_w, 4),
            "dpd_weight":  round(best_weights[1] / total_w, 4),
            "dist_weight": round(best_weights[2] / total_w, 4),
        },
        "visits": visits,
    }
