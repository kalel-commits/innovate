from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, ForeignKey
from ..db.database import Base
from datetime import datetime

class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    environmental_params = Column(JSON)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    overall_risk_score = Column(Float)
    affected_population = Column(Integer)
    details = Column(JSON)

class EventLog(Base):
    __tablename__ = "event_logs"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)  # "ALARM", "RECOVERY", "BLOCKAGE"
    severity = Column(String)
    message = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AuditTrail(Base):
    __tablename__ = "audit_trail"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    resource = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(JSON)
