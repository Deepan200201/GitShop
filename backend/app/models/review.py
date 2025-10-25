from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import List, Optional
import uuid
from sqlalchemy import JSON, Column

class ReviewBase(SQLModel):
    product_id: str = Field(index=True)
    rating: int
    comment: str
    images: List[str] = Field(default=[], sa_column=Column(JSON))

class Review(ReviewBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str
    user_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReviewCreate(ReviewBase):
    pass
