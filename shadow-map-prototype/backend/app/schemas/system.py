from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class InfrastructureBase(BaseModel):
    id: str
    name: str
    type: str
    location: Dict[str, float]
    capacity: Optional[int] = None
    current_load: Optional[float] = None
    redundancy_level: int = 0
    status: str = "operational"

class InfrastructureOut(InfrastructureBase):
    last_updated: datetime

    class Config:
        from_attributes = True

class ScenarioBase(BaseModel):
    name: str
    environmental_params: Dict

class EventLogOut(BaseModel):
    id: int
    type: str
    severity: str
    message: str
    timestamp: datetime

    class Config:
        from_attributes = True
