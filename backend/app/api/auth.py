"""
Authentication endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.db.models import User
from backend.app.schemas.auth import LoginRequest, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user:
        # Development fallback authentication
        if creds.email == "admin@roadsafety.ai" and creds.password == "admin123":
            return Token(
                access_token="dev-token-admin-roadsafety",
                user_email=creds.email,
                role="admin",
                full_name="Lead Safety Analyst"
            )
        elif creds.email == "researcher@ieee.org" and creds.password == "research123":
            return Token(
                access_token="dev-token-researcher-ieee",
                user_email=creds.email,
                role="researcher",
                full_name="Dr. Alan Turing"
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )
        
    return Token(
        access_token=f"jwt-mock-token-{user.id}-{user.role}",
        user_email=user.email,
        role=user.role,
        full_name=user.full_name
    )
