from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.models.product import Product, ProductCreate
from app.services.product_service import product_service
from app.api import deps
from app.models.user import User, UserRole
from sqlmodel import Session
from app.core.database import get_session

router = APIRouter()

@router.post("/", response_model=Product)
async def create_product(
    product_in: ProductCreate, 
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_session)
):
    if current_user.role != UserRole.SELLER and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only sellers can create products")
    
    # Force seller_id to be the current user
    product_in.seller_id = current_user.id
    
    return product_service.create_product(db, product_in)

@router.get("/", response_model=List[Product])
async def list_products(page: int = 1, limit: int = 20, db: Session = Depends(get_session)):
    return product_service.list_products(db, page, limit)

@router.get("/details/{product_id}", response_model=Product)
async def get_product_details(product_id: str, db: Session = Depends(get_session)):
    # Search for product across all sellers
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/{seller_id}/{product_id}", response_model=Product)
async def get_product(seller_id: str, product_id: str, db: Session = Depends(get_session)):
    product = product_service.get_product(db, product_id)
    # Check seller_id match if needed, for now just get product by id and verify seller in service maybe? 
    # Current service get_product only takes db and id.
    if product and product.seller_id != seller_id:
        raise HTTPException(status_code=404, detail="Product not found for this seller")
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=Product)
def update_product(
    product_id: str,
    product_in: ProductCreate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_session)
):
    if current_user.role != UserRole.SELLER and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    product = product_service.update_product(db, product_id, product_in, current_user.id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/{product_id}")
def delete_product(
    product_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_session)
):
    if current_user.role != UserRole.SELLER and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    success = product_service.delete_product(db, product_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "success", "message": "Product deleted"}
