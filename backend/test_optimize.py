import httpx, json

r = httpx.post(
    "http://127.0.0.1:8000/api/v1/optimize/",
    params={"agent_lat": 12.9716, "agent_lon": 77.5946, "n_trials": 30},
    timeout=120
)

result = r.json()

print(f"Total distance   : {result['total_distance_km']} km")
print(f"Total travel cost: Rs {result['total_travel_cost_inr']}")
print(f"Best weights     : {result['best_weights']}")
print()
print("Optimized visit order:")
for v in result["visits"]:
    name  = v["borrower_name"].ljust(15)
    dpd   = str(v["days_past_due"]).ljust(4)
    loan  = str(v["outstanding_loan"]).ljust(10)
    print(f"  Rank {v['visit_rank']}: {name} DPD={dpd} Loan=Rs{loan} {v['distance_km']}km  Rs{v['travel_cost_inr']}  Score={v['priority_score']}")
