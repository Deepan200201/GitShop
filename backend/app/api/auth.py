from datetime import timedelta
from typing import Optional
import logging
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core import security
from app.core.config import settings
from app.models.user import UserCreate, User, Token, UserRole, UserInDB, UserUpdate, UserRead
from sqlmodel import Session, select, delete
from app.core.database import get_session

from app.services.user_service import user_service


router = APIRouter()


from app.api import deps

from app.services.product_service import product_service

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_me(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_session)
):
    # If seller, delete all products
    if current_user.role == UserRole.SELLER:
         from app.models.product import Product
         statement = delete(Product).where(Product.seller_id == current_user.id)
         db.exec(statement)
    
    # Delete user
    db.delete(current_user)
    db.commit()
    return


@router.post("/signup", response_model=UserRead)
def signup(
    user_in: UserCreate, 
    role: UserRole = UserRole.CONSUMER,
    db: Session = Depends(get_session)
):
    existing_user = user_service.get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_in.role = role # Override role from query param
    user = user_service.create_user(db, user_in)
    return user

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_session)
):
    user = user_service.get_user_by_email(db, form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(deps.get_current_user)):
    return current_user

@router.put("/me", response_model=UserRead)
def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_session)
):
    user = user_service.update_user(db, current_user.id, user_in)
    if not user:
         raise HTTPException(status_code=404, detail="User not found")
    return user
