from typing import Optional, List, Dict, Any
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from pydantic import EmailStr
import uuid
from sqlalchemy import JSON, Column

class UserRole(str, Enum):
    CONSUMER = "consumer"
    SELLER = "seller"
    ADMIN = "admin"

class Address(SQLModel):
    flat_no: Optional[str] = None
    street_name: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = None

class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True)
    full_name: str
    role: UserRole = Field(default=UserRole.CONSUMER)
    phone_number: Optional[str] = None
    address: Optional[str] = None
    # Use SA JSON column for address_details to store the strict schema
    address_details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Merchant fields
    business_name: Optional[str] = None
    gstin: Optional[str] = None
    bank_account_number: Optional[str] = None
    ifsc_code: Optional[str] = None

class User(UserBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships can be added here if needed, e.g. products, orders
    # products: List["Product"] = Relationship(back_populates="seller")

class UserCreate(UserBase):
    password: str

class UserUpdate(SQLModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    address_details: Optional[Address] = None
    business_name: Optional[str] = None
    gstin: Optional[str] = None
    bank_account_number: Optional[str] = None
    ifsc_code: Optional[str] = None

class UserInDB(UserBase):
    id: str
    hashed_password: str
    created_at: datetime

class UserRead(UserBase):
    id: str
    created_at: datetime
    # Inherits address_details from UserBase which is Dict[str, Any]

class Token(SQLModel):
    access_token: str
    token_type: str
