from sqlalchemy import Column, Integer, String, Float, JSON, DateTime
from ..db.database import Base
from datetime import datetime

class Infrastructure(Base):
    __tablename__ = "infrastructure"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    location = Column(JSON, nullable=False)  # {"lat": float, "lng": float}
    capacity = Column(Integer)
    current_load = Column(Float)
    redundancy_level = Column(Integer, default=0)
    status = Column(String, default="operational")
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
