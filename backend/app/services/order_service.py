from typing import List, Optional
import uuid
from sqlmodel import Session, select
from fastapi import HTTPException

from app.models.order import Order, OrderItem, OrderStatus
from app.models.billing import Invoice
from app.models.product import Product
from app.services.cart_service import cart_service
from app.services.pdf_service import pdf_service
from app.services.product_service import product_service # Use product service or direct DB access
from app.services.user_service import user_service # For email

class OrderService:
    def create_order_from_cart(self, db: Session, user_id: str) -> Order:
        # 1. Get Cart
        cart = cart_service.get_cart(db, user_id)
        if not cart.items:
            raise HTTPException(status_code=400, detail="Cart is empty")

        # 2. Check Stock and Prepare Items
        order_items = []
        total_amount = 0.0
        
        for cart_item in cart.items:
            product = db.get(Product, cart_item.product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {cart_item.product_id} not found")
            
            if product.stock < cart_item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}. Available: {product.stock}")
            
            # Decrement Stock
            product.stock -= cart_item.quantity
            db.add(product)
            
            # Create OrderItem
            order_item = OrderItem(
                product_id=product.id,
                quantity=cart_item.quantity,
                price_at_purchase=cart_item.price or product.price,
                product_name=product.name,
                seller_id=product.seller_id,
                status="pending"
            )
            order_items.append(order_item)
            total_amount += (order_item.price_at_purchase * order_item.quantity)

        # 3. Create Order
        order = Order(
            user_id=user_id,
            total_amount=total_amount,
            status=OrderStatus.PAID
        )
        db.add(order)
        db.commit()
        db.refresh(order) # Get ID
        
        # Link items
        for item in order_items:
            item.order_id = order.id
            db.add(item)
        db.commit()
        db.refresh(order)
        
        # 4. Create Invoice
        invoice = Invoice(
            order_id=order.id,
            user_id=user_id,
            amount=total_amount
        )
        db.add(invoice)
        db.commit()
        db.refresh(invoice)
        
        # 5. Generate PDF
        user = user_service.get_user_by_id(db, user_id)
        user_email = user.email if user else user_id
        
        # Update PDFService to use correct path or string IO later
        # Assuming PDFService works or we fix it to not use git paths
        try:
             pdf_rel_path = pdf_service.generate_invoice_pdf(invoice, order, user_email=user_email)
             invoice.pdf_url = pdf_rel_path
             order.pdf_url = pdf_rel_path
             db.add(invoice)
             db.add(order)
             db.commit()
        except Exception as e:
            print(f"PDF Gen failed: {e}")
            pass

        # 6. Clear Cart
        cart_service.clear_cart(db, user_id)
        
        return order

    def get_order(self, db: Session, order_id: str) -> Optional[Order]:
        return db.get(Order, order_id)

    def list_user_orders(self, db: Session, user_id: str, page: int = 1, limit: int = 20) -> List[Order]:
        statement = select(Order).where(Order.user_id == user_id).order_by(Order.created_at.desc()).offset((page-1)*limit).limit(limit)
        return db.exec(statement).all()

    def get_merchant_orders(self, db: Session, seller_id: str) -> List[Order]:
        # Complex query: Find orders where any item has seller_id
        # Easier in SQL: JOIN OrderItem
        statement = select(Order).join(OrderItem).where(OrderItem.seller_id == seller_id).distinct().order_by(Order.created_at.desc())
        return db.exec(statement).all()

    def update_order_item_status(self, db: Session, order_id: str, product_id: str, new_status: str, seller_id: str) -> Order:
        order = self.get_order(db, order_id)
        if not order:
             raise HTTPException(status_code=404, detail="Order not found")
        
        item_found = False
        all_items_completed = True
        
        # Since items are in DB, we need to fetch them or iterate relation
        # We need to update specifically the item for this product/seller
        # Be careful if multiple rows for same product exist (rare in one order but possible if added twice? Cart service merges duplicates)
        
        for item in order.items:
            if item.product_id == product_id and item.seller_id == seller_id:
                item.status = new_status
                db.add(item)
                item_found = True
            
            if item.status not in ["delivered", "cancelled", "completed"]:
                all_items_completed = False
        
        if not item_found:
             raise HTTPException(status_code=404, detail="Item not found or not authorized")

        if all_items_completed:
            order.status = OrderStatus.COMPLETED
            db.add(order)
            
        db.commit()
        db.refresh(order)
        return order

order_service = OrderService()
