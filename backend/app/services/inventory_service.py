from sqlmodel import Session
from app.models.product import Product

class InventoryService:
    def get_stock(self, db: Session, product_id: str) -> int:
        product = db.get(Product, product_id)
        return product.stock if product else 0

    def adjust_stock(self, db: Session, product_id: str, adjustment: int, reason: str = "Manual adjustment", author_name: str = "System") -> int:
        product = db.get(Product, product_id)
        if not product:
             raise ValueError("Product not found")
        
        new_qty = product.stock + adjustment
        if new_qty < 0:
            raise ValueError("Insufficient stock")
            
        product.stock = new_qty
        db.add(product)
        db.commit()
        db.refresh(product)
        return product.stock

inventory_service = InventoryService()
