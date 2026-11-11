from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed import seed_database
from backend.app.routers import (
    auth, districts, facilities, services, capacity, referrals, analytics, activity_logs, users, storage
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure relational tables exist and seed demo records if needed
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown logic if any

app = FastAPI(
    title="SEHAT-SETU API",
    description="Healthcare Referral Analytics & Gap Identification Platform - Backend REST APIs",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Modular Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(districts.router, prefix=settings.API_V1_STR)
app.include_router(facilities.router, prefix=settings.API_V1_STR)
app.include_router(services.router, prefix=settings.API_V1_STR)
app.include_router(capacity.router, prefix=settings.API_V1_STR)
app.include_router(referrals.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(activity_logs.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(storage.router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "SEHAT-SETU Healthcare Referral Platform",
        "version": settings.VERSION,
        "database": "connected",
        "mode": "Demonstration & Decision Support"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to SEHAT-SETU Backend REST API",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }
