from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth
from .db.database import engine, Base
from . import routes
from . import advanced_routes
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title='SHADOW MAP v3.0', version='3.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(routes.router)
app.include_router(advanced_routes.router)
app.include_router(auth.router, prefix='/api')

@app.get('/health')
async def health(): return {'status': 'healthy'}
