from fastapi import APIRouter, HTTPException, Depends, Body
from app.services.inventory_service import inventory_service
from app.api import deps
from app.models.user import User, UserRole
from pydantic import BaseModel
from sqlmodel import Session
from app.core.database import get_session
router = APIRouter()

class StockAdjustment(BaseModel):
    product_id: str
    adjustment: int
    reason: str = "Manual adjustment"

@router.get("/{product_id}", response_model=int)
async def get_stock(product_id: str, db: Session = Depends(get_session)):
    return inventory_service.get_stock(db, product_id)

@router.post("/adjust")
async def adjust_stock(
    adjustment: StockAdjustment,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_session)
):
    if current_user.role != UserRole.SELLER and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    try:
        new_qty = inventory_service.adjust_stock(
            db,
            adjustment.product_id, 
            adjustment.adjustment, 
            adjustment.reason,
            author_name=current_user.full_name
        )
        return {"product_id": adjustment.product_id, "new_quantity": new_qty}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
