from sqlalchemy import Column, Integer, String, Boolean, Enum
from ..db.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    OPERATOR = "operator"
    EXECUTIVE = "executive"
    PUBLIC_DEMO = "public_demo"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.PUBLIC_DEMO)
    is_active = Column(Boolean, default=True)
