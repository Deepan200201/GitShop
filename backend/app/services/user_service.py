from typing import Optional, List
from sqlmodel import Session, select
from app.models.user import User, UserCreate, UserUpdate
from app.core.security import get_password_hash

class UserService:
    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        statement = select(User).where(User.email == email)
        return db.exec(statement).first()

    def get_user_by_id(self, db: Session, user_id: str) -> Optional[User]:
        return db.get(User, user_id)

    def create_user(self, db: Session, user_in: UserCreate) -> User:
        db_obj = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            role=user_in.role,
            phone_number=user_in.phone_number,
            address=user_in.address,
            address_details=user_in.address_details.dict() if user_in.address_details else None,
            business_name=user_in.business_name,
            gstin=user_in.gstin,
            bank_account_number=user_in.bank_account_number,
            ifsc_code=user_in.ifsc_code
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_user(self, db: Session, user_id: str, user_in: UserUpdate) -> Optional[User]:
        user = self.get_user_by_id(db, user_id)
        if not user:
            return None
        
        user_data = user_in.dict(exclude_unset=True)
        # Handle address_details conversion if needed, but SQLModel might handle Dict
        if "address_details" in user_data and user_data["address_details"]:
             user_data["address_details"] = user_data["address_details"].dict()

        for key, value in user_data.items():
            setattr(user, key, value)
            
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

user_service = UserService()
