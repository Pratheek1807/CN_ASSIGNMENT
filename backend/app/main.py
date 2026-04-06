from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import field_visits, optimize

app = FastAPI(
    title="FieldAgent API",
    description="Backend API for field agent visit management.",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Router ───────────────────────────────────────────────────
app.include_router(field_visits.router)  # /api/v1/visits
app.include_router(optimize.router)      # /api/v1/optimize


# ─── Health Check ─────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "FieldAgent API is running"}
