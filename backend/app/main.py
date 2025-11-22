from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.endpoints import agents, mtd, threats, defense
from .database import engine, Base

app = FastAPI(
    title="Amunet AI Control Plane",
    description="Central control plane for Amunet AI Autonomous Defense Platform",
    version="0.1.0",
)

# CORS Configuration
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",
    "http://localhost:1234",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])
app.include_router(mtd.router, prefix="/api/v1/mtd", tags=["mtd"])
app.include_router(threats.router, prefix="/api/v1/threats", tags=["threats"])
app.include_router(defense.router, prefix="/api/v1/defense", tags=["defense"])

@app.get("/")
async def root():
    return {"message": "Amunet AI Control Plane is Online", "status": "operational"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Startup event to create tables (for MVP only, use Alembic in prod)
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
