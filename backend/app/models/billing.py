from datetime import datetime
from sqlmodel import SQLModel, Field
import uuid

class Invoice(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    order_id: str = Field(index=True)
    user_id: str = Field(index=True)
    amount: float
    currency: str = "USD"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "PAID"
    pdf_url: str = ""
