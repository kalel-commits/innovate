from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth
from .db.database import engine, Base
import os

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SHADOW MAP v2.0",
    description="Enterprise Urban Disaster Intelligence platform",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "operational", "version": "2.0.0"}
