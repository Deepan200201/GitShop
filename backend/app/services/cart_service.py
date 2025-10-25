from typing import Dict, Any, Optional
from sqlmodel import Session, select
from app.models.cart import Cart, CartItem

class CartService:
    def get_cart(self, db: Session, user_id: str) -> Cart:
        statement = select(Cart).where(Cart.user_id == user_id)
        cart = db.exec(statement).first()
        if not cart:
            # Create empty cart if not exists
            cart = Cart(user_id=user_id)
            db.add(cart)
            db.commit()
            db.refresh(cart)
        return cart

    def add_item(self, db: Session, user_id: str, item_dict: Dict[str, Any]) -> Cart:
        cart = self.get_cart(db, user_id)
        
        # Check if item exists in cart
        existing_item = next((i for i in cart.items if i.product_id == item_dict["product_id"]), None)
        
        if existing_item:
            existing_item.quantity += item_dict["quantity"]
            db.add(existing_item)
        else:
            new_item = CartItem(
                cart_id=cart.id,
                product_id=item_dict["product_id"],
                quantity=item_dict["quantity"],
                product_name=item_dict.get("product_name"),
                price=item_dict.get("price"),
                image=item_dict.get("image")
            )
            db.add(new_item)
        
        db.commit()
        db.refresh(cart)
        self._recalculate_total(db, cart)
        return cart

    def update_item_quantity(self, db: Session, user_id: str, product_id: str, quantity: int) -> Cart:
        cart = self.get_cart(db, user_id)
        item = next((i for i in cart.items if i.product_id == product_id), None)
        
        if item:
            if quantity <= 0:
                 db.delete(item)
            else:
                item.quantity = quantity
                db.add(item)
            db.commit()
            db.refresh(cart)
            self._recalculate_total(db, cart)
            
        return cart

    def remove_item(self, db: Session, user_id: str, product_id: str) -> Cart:
        cart = self.get_cart(db, user_id)
        item = next((i for i in cart.items if i.product_id == product_id), None)
        
        if item:
            db.delete(item)
            db.commit()
            db.refresh(cart)
            self._recalculate_total(db, cart)
            
        return cart

    def clear_cart(self, db: Session, user_id: str):
        cart = self.get_cart(db, user_id)
        for item in cart.items:
            db.delete(item)
        cart.total = 0.0
        db.add(cart)
        db.commit()
        db.refresh(cart)

    def _recalculate_total(self, db: Session, cart: Cart):
        # Calculate total
        total = sum(i.quantity * (i.price or 0.0) for i in cart.items)
        cart.total = total
        db.add(cart)
        db.commit()
        db.refresh(cart)

cart_service = CartService()
