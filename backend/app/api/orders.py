from fastapi import APIRouter, HTTPException, Body, Depends
from typing import List, Dict, Any
from app.services.cart_service import cart_service
from app.services.order_service import order_service
from app.models.cart import Cart, CartRead
from app.models.order import Order, OrderRead
from app.api import deps
from app.models.user import User
from sqlmodel import Session
from app.core.database import get_session
import os
from app.core.config import settings
from fastapi.responses import FileResponse

router = APIRouter()

@router.get("/cart", response_model=CartRead)
def get_cart(current_user: User = Depends(deps.get_current_user), db: Session = Depends(get_session)):
    return cart_service.get_cart(db, current_user.id)

@router.post("/cart/add", response_model=CartRead)
def add_to_cart(item: Dict[str, Any] = Body(...), current_user: User = Depends(deps.get_current_user), db: Session = Depends(get_session)):
    # Item expects: product_id, quantity, price, product_name
    return cart_service.add_item(db, current_user.id, item)

@router.put("/cart/items/{product_id}", response_model=CartRead)
def update_cart_item(product_id: str, quantity: int = Body(..., embed=True), current_user: User = Depends(deps.get_current_user), db: Session = Depends(get_session)):
    return cart_service.update_item_quantity(db, current_user.id, product_id, quantity)

@router.delete("/cart/items/{product_id}", response_model=CartRead)
def delete_cart_item(product_id: str, current_user: User = Depends(deps.get_current_user), db: Session = Depends(get_session)):
    return cart_service.remove_item(db, current_user.id, product_id)

@router.post("/orders/checkout", response_model=OrderRead)
def checkout(current_user: User = Depends(deps.get_current_user), db: Session = Depends(get_session)):
    return order_service.create_order_from_cart(db, current_user.id)

@router.get("/orders", response_model=List[OrderRead])
def list_my_orders(page: int = 1, limit: int = 20, current_user: User = Depends(deps.get_current_user), db: Session = Depends(get_session)):
    return order_service.list_user_orders(db, current_user.id, page, limit)

@router.get("/orders/{order_id}", response_model=OrderRead)
def get_order_details(order_id: str, current_user: User = Depends(deps.get_current_user), db: Session = Depends(get_session)):
    order = order_service.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Authorization check
    if order.user_id != current_user.id and current_user.role != "admin": # simplified role check
         raise HTTPException(status_code=403, detail="Not authorized")
         
    return order

@router.get("/orders/{order_id}/invoice")
def download_invoice(order_id: str, current_user: User = Depends(deps.get_current_user), db: Session = Depends(get_session)):
    # Verify order existence and ownership
    order = order_service.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if hasattr(order, "pdf_url") and order.pdf_url:
        full_path = os.path.join(settings.UPLOAD_DIR, "invoices", "pdfs", os.path.basename(order.pdf_url))
        # The stored url might be "invoices/pdfs/xyz.pdf". 
        # So join settings.UPLOAD_DIR ("uploads") with "invoices/pdfs/..." 
        # Wait, pdf_service implementation (Step 542): `output_dir = os.path.join(settings.UPLOAD_DIR, "invoices", "pdfs")`, and returns `f"invoices/pdfs/{filename}"`.
        # So full_path = os.path.join(settings.UPLOAD_DIR, "invoices/pdfs/filename.pdf")? 
        # No, `os.path.join(settings.UPLOAD_DIR, order.pdf_url)` should work if pdf_url is strict relative.
        
        full_path = os.path.join(settings.UPLOAD_DIR, "invoices", "pdfs", os.path.basename(order.pdf_url))
        # Actually simplest is:
        # If pdf_url is "invoices/pdfs/xxx.pdf", and UPLOAD_DIR is "/.../uploads"
        # Then join(UPLOAD_DIR, pdf_url) -> "/.../uploads/invoices/pdfs/xxx.pdf" which matches where we saved it.
        # But let's check what I wrote in Step 542: `output_dir = os.path.join(settings.UPLOAD_DIR, "invoices", "pdfs")`.
        # So it is nested.
        
        full_path = os.path.join(settings.UPLOAD_DIR, "invoices", "pdfs", os.path.basename(order.pdf_url))
        
        if os.path.exists(full_path):
             return FileResponse(full_path, media_type="application/pdf", filename=f"invoice_{order_id}.pdf")
    
    raise HTTPException(status_code=404, detail="Invoice PDF not found")

@router.get("/merchant/orders", response_model=List[OrderRead])
def list_merchant_orders(current_user: User = Depends(deps.get_current_user), db: Session = Depends(get_session)):
    if current_user.role != "seller":
         raise HTTPException(status_code=403, detail="Not authorized")
    return order_service.get_merchant_orders(db, current_user.id)

@router.put("/merchant/orders/{order_id}/items/{product_id}/status", response_model=OrderRead)
def update_item_status(
    order_id: str, 
    product_id: str, 
    status: str = Body(..., embed=True), 
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_session)
):
    if current_user.role != "seller":
         raise HTTPException(status_code=403, detail="Not authorized")
    
    allowed_statuses = ["pending", "accepted", "packing", "out_for_delivery", "delivered", "cancelled"]
    if status not in allowed_statuses:
         raise HTTPException(status_code=400, detail="Invalid status")

    return order_service.update_order_item_status(db, order_id, product_id, status, current_user.id)
