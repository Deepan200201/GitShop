from typing import List, Optional
from sqlmodel import Session, select
from app.models.product import Product, ProductCreate

class ProductService:
    def create_product(self, db: Session, product_in: ProductCreate) -> Product:
        product = Product(**product_in.dict())
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    def get_product(self, db: Session, product_id: str) -> Optional[Product]:
        return db.get(Product, product_id)

    def list_products(self, db: Session, page: int = 1, limit: int = 20) -> List[Product]:
        statement = select(Product).order_by(Product.created_at.desc()).offset((page - 1) * limit).limit(limit)
        return db.exec(statement).all()

    def update_product(self, db: Session, product_id: str, product_in: ProductCreate, seller_id: str) -> Optional[Product]:
        product = self.get_product(db, product_id)
        if not product:
            return None
        # Verify ownership? The service signature asks for seller_id, but logically we should check if product.seller_id == seller_id
        if product.seller_id != seller_id:
             return None # Or raise Auth error
        
        product_data = product_in.dict(exclude_unset=True)
        # Prevent changing core fields if necessary, usually safe
        for key, value in product_data.items():
            setattr(product, key, value)
            
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    def delete_product(self, db: Session, product_id: str, seller_id: str) -> bool:
        product = self.get_product(db, product_id)
        if not product or product.seller_id != seller_id:
            return False
            
        db.delete(product)
        db.commit()
        return True

product_service = ProductService()
