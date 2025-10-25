from typing import List, Optional
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import uuid

class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    # Item level statuses
    ACCEPTED = "accepted"
    PACKING = "packing"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"

class OrderItemBase(SQLModel):
    product_id: str
    quantity: int
    price_at_purchase: float
    product_name: str
    seller_id: Optional[str] = None
    status: str = "pending"

class OrderItem(OrderItemBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: str = Field(foreign_key="order.id")
    
    order: "Order" = Relationship(back_populates="items")

class OrderBase(SQLModel):
    user_id: str = Field(index=True)
    total_amount: float
    currency: str = "USD"
    status: OrderStatus = Field(default=OrderStatus.PENDING)
    pdf_url: Optional[str] = None

class Order(OrderBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    payment_id: Optional[str] = None
    
    items: List[OrderItem] = Relationship(back_populates="order")

class OrderRead(OrderBase):
    id: str
    created_at: datetime
    updated_at: datetime
    payment_id: Optional[str] = None
    items: List[OrderItemBase] = []

class OrderCreate(OrderBase):
    items: List[OrderItemBase]
