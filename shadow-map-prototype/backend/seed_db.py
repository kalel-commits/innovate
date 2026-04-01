from app.db.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.core import security

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    email = "operator@resilience.lab"
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        print(f"Creating user: {email}")
        user = User(
            email=email,
            hashed_password=security.get_password_hash("admin123"),
            role=UserRole.OPERATOR
        )
        db.add(user)
        db.commit()
        print("User created successfully.")
    else:
        print(f"User {email} already exists.")
    
    db.close()

if __name__ == "__main__":
    seed_db()
