from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import JSON, Column
import uuid

class CartItemBase(SQLModel):
    product_id: str
    quantity: int
    product_name: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None

# Using a JSON column for items for simplicity in Cart, 
# or a separate table. Separate table is cleaner for "quantity updates" logic.
# But Cart is often transient. Let's use separate table to be relational.

class CartItem(CartItemBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cart_id: str = Field(foreign_key="cart.id")
    cart: "Cart" = Relationship(back_populates="items")

class Cart(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True) # Usually user_id is the cart_id or we link user_id
    user_id: str = Field(unique=True, index=True)
    items: List[CartItem] = Relationship(back_populates="cart")
    total: float = 0.0

class CartRead(SQLModel):
    id: str
    user_id: str
    total: float
    items: List[CartItem] = []
