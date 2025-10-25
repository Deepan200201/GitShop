from typing import List, Optional
from sqlmodel import SQLModel, Field
from datetime import datetime
import uuid
from sqlalchemy import JSON, Column

class ProductBase(SQLModel):
    name: str
    description: str
    price: float
    currency: str = "USD"
    # Store lists as JSON
    images: List[str] = Field(default=[], sa_column=Column(JSON))
    videos: List[str] = Field(default=[], sa_column=Column(JSON))
    seller_id: str = Field(index=True) # Could utilize Foreign Key to User
    stock: int = 0
    category: str

class Product(ProductBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(ProductBase):
    pass
