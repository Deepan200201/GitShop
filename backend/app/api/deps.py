from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from app.core import security
from app.core.config import settings
from app.models.user import User, UserInDB
from app.services.user_service import user_service

from sqlmodel import Session
from app.core.database import get_session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login/access-token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_session)) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[security.ALGORITHM])
        token_data = payload.get("sub")
        if token_data is None:
            raise HTTPException(status_code=403, detail="Could not validate credentials")
    except (JWTError, ValidationError):
        raise HTTPException(status_code=403, detail="Could not validate credentials")
        
    user = user_service.get_user_by_email(db, email=token_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user
